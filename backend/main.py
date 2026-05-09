import json
import logging
import sys
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load .env before any other module reads environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Make sure backend root is on the path so relative imports work cleanly
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRouter
from sqlalchemy.orm import Session

from schemas import (
    CompareRequest, CompareResponse,
    ProfileCreate, ProfileResponse, UserStatusResponse,
    UserSync, UserRead, UserUpdate,
    OnboardingComplete,
    ComparisonCreate, ComparisonRead,
    RateAlertCreate, RateAlertRead, RateAlertUpdate,
)
from engine.comparator import compare

import models
from database import engine, get_db
from auth import verify_clerk_token
from cache import get_cached_rates, set_cached_rates, init_cache, close_cache


# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("flint")


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise shared resources on startup; clean up on shutdown."""
    await init_cache()   # connect Redis + PING test
    yield
    await close_cache()  # graceful shutdown


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Flint API",
    description="Real-time international money transfer comparison engine",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rate limiting (slowapi) ───────────────────────────────────────────────────
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ═══════════════════════════════════════════════════════════════════════════════
# LEGACY ROUTES  (keep for backwards compatibility with existing frontend)
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
async def health():
    return {"status": "ok", "service": "flint-api"}

# @app.get("/user/onboarding" , response_model = UserStatusResponse)
# def onboarding_status(
    

@app.get("/user/status", response_model=UserStatusResponse)
def get_user_status(
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.clerk_user_id == user_auth["clerk_user_id"]
    ).first()
    return {"exists": user is not None}


@app.get("/user/profile", response_model=ProfileResponse)
def get_user_profile(
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.clerk_user_id == user_auth["clerk_user_id"]
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")
    return user


@app.post("/user/profile", response_model=ProfileResponse, status_code=201)
def create_user_profile(
    profile_data: ProfileCreate,
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    clerk_id = user_auth["clerk_user_id"]
    user = db.query(models.User).filter(models.User.clerk_user_id == clerk_id).first()

    if user:
        user.is_new_user = False
        return user

    new_user = models.User(
        clerk_user_id=clerk_id,
        email=user_auth.get("email"),
        country=profile_data.country,
        university=profile_data.university,
        whatsapp_number=profile_data.whatsapp_number,
        is_onboarded=True,
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except Exception:
        db.rollback()
        logger.exception("Failed to insert user profile for clerk_id=%s", clerk_id)
        raise HTTPException(status_code=500, detail="Database insertion failed")

    new_user.is_new_user = True
    return new_user


@app.post("/compare", response_model=CompareResponse)
async def compare_providers(request: CompareRequest):
    logger.info(f"compare request: {request.amount} {request.currency_from} → {request.currency_to}")
    try:
        result = await compare(request)
        logger.info(
            f"compare done: best={result.best_provider.provider} "
            f"({result.best_provider.receive_amount} {request.currency_to}), "
            f"failed={result.failed_providers}"
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        logger.exception("Unexpected error in /compare")
        raise HTTPException(status_code=500, detail="Internal error")


# ═══════════════════════════════════════════════════════════════════════════════
# /api/users  — user management
# ═══════════════════════════════════════════════════════════════════════════════

users_router = APIRouter(prefix="/api/users", tags=["users"])

@users_router.post("/sync", response_model=UserRead)
def sync_user(body: UserSync, db: Session = Depends(get_db)):
    """
    Called after Clerk sign-up/sign-in from post-auth.js.
    Creates the user row if it doesn't exist, returns the user either way.
    Does NOT require auth header — the Clerk webhook / post-auth page
    passes the clerk_id directly.
    """
    user = db.query(models.User).filter(models.User.clerk_user_id == body.clerk_id).first()
    if user:
        # Update name/email if provided
        if body.full_name and not user.full_name:
            user.full_name = body.full_name
        if body.email and not user.email:
            user.email = body.email
        db.commit()
        db.refresh(user)
        return user

    new_user = models.User(
        clerk_user_id=body.clerk_id,
        email=body.email,
        full_name=body.full_name,
        is_onboarded=False,
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except Exception:
        db.rollback()
        logger.exception("sync_user: failed for clerk_id=%s", body.clerk_id)
        raise HTTPException(status_code=500, detail="Failed to sync user")
    return new_user


@users_router.get("/me", response_model=UserRead)
def get_me(
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.clerk_user_id == user_auth["clerk_user_id"]
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@users_router.patch("/me", response_model=UserRead)
def update_me(
    body: UserUpdate,
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.clerk_user_id == user_auth["clerk_user_id"]
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    try:
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update user")
    return user


app.include_router(users_router)


# ═══════════════════════════════════════════════════════════════════════════════
# /api/onboarding
# ═══════════════════════════════════════════════════════════════════════════════

onboarding_router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])


@onboarding_router.post("/complete", response_model=UserRead)
def complete_onboarding(
    body: OnboardingComplete,
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """
    Saves all onboarding fields and marks onboarding_done = True.
    Called on final step submit of the onboarding wizard.
    """
    clerk_id = user_auth["clerk_user_id"]
    user = db.query(models.User).filter(models.User.clerk_user_id == clerk_id).first()

    if not user:
        # Auto-create if sync call was missed
        user = models.User(clerk_user_id=clerk_id, email=user_auth.get("email"))
        db.add(user)

    user.country         = body.country
    user.university      = body.university
    user.whatsapp_number = body.whatsapp_number
    user.home_currency   = body.home_currency
    user.corridor_from   = body.corridor_from
    user.corridor_to     = body.corridor_to
    user.is_onboarded    = True

    try:
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        logger.exception("complete_onboarding: failed for clerk_id=%s", clerk_id)
        raise HTTPException(status_code=500, detail="Failed to save onboarding data")
    return user


app.include_router(onboarding_router)


# ═══════════════════════════════════════════════════════════════════════════════
# /api/rates  — public rate comparison endpoint (GET wrapper around comparator)
# ═══════════════════════════════════════════════════════════════════════════════

rates_router = APIRouter(prefix="/api/rates", tags=["rates"])


@rates_router.get("")
@limiter.limit("30/minute")  # 30 requests per minute per IP
async def get_rates(
    request: Request,
    from_currency: str = Query(..., alias="from"),
    to_currency: str   = Query(..., alias="to"),
    amount: float      = Query(..., gt=0),
):
    """
    Public GET endpoint for the results page.
    Checks Redis cache first (bucketed by nearest-50 amount).
    Falls back to the live comparator engine on a miss.
    Returns { results, stale, no_data, cached }.
    """
    from_upper = from_currency.upper()
    to_upper   = to_currency.upper()

    # ── Cache hit ─────────────────────────────────────────────────────────────
    cached = await get_cached_rates(from_upper, to_upper, amount)
    if cached:
        logger.info("get_rates: returning cached response for %s→%s %.2f", from_upper, to_upper, amount)
        return {**cached, "stale": False, "cached": True}

    # ── Live fetch ────────────────────────────────────────────────────────────
    req = CompareRequest(
        amount=amount,
        currency_from=from_upper,
        currency_to=to_upper,
    )
    try:
        result = await compare(req)
        quotes_data = [q.model_dump() for q in result.quotes]
        response = {
            "results": quotes_data,
            "best_provider": result.best_provider.provider,
            "savings_vs_worst": result.savings_vs_worst,
            "savings_vs_average": result.savings_vs_average,
            "failed_providers": result.failed_providers,
            "stale": False,
            "no_data": False,
            "cached": False,
        }
        await set_cached_rates(from_upper, to_upper, amount, response)
        logger.info("get_rates: live response cached for %s→%s %.2f", from_upper, to_upper, amount)
        return response
    except ValueError:
        return {"results": [], "stale": False, "no_data": True, "failed_providers": [], "cached": False}
    except Exception:
        logger.exception("get_rates: unexpected error")
        return {"results": [], "stale": False, "no_data": True, "failed_providers": [], "cached": False}


app.include_router(rates_router)


# ═══════════════════════════════════════════════════════════════════════════════
# /api/comparisons
# ═══════════════════════════════════════════════════════════════════════════════

comparisons_router = APIRouter(prefix="/api/comparisons", tags=["comparisons"])


@comparisons_router.post("", response_model=ComparisonRead, status_code=201)
def save_comparison(
    body: ComparisonCreate,
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    record = models.Comparison(
        clerk_user_id=user_auth["clerk_user_id"],
        amount=body.amount,
        from_currency=body.from_currency.upper(),
        to_currency=body.to_currency.upper(),
        results_json=body.results_json,
    )
    db.add(record)
    try:
        db.commit()
        db.refresh(record)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save comparison")
    return record


@comparisons_router.get("", response_model=list[ComparisonRead])
def list_comparisons(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit
    rows = (
        db.query(models.Comparison)
        .filter(models.Comparison.clerk_user_id == user_auth["clerk_user_id"])
        .order_by(models.Comparison.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return rows


app.include_router(comparisons_router)


# ═══════════════════════════════════════════════════════════════════════════════
# /api/alerts
# ═══════════════════════════════════════════════════════════════════════════════

alerts_router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@alerts_router.post("", response_model=RateAlertRead, status_code=201)
def create_alert(
    body: RateAlertCreate,
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    alert = models.RateAlert(
        clerk_user_id   = user_auth["clerk_user_id"],
        from_currency   = body.from_currency.upper(),
        to_currency     = body.to_currency.upper(),
        amount          = body.amount,
        target_rate     = body.target_rate,
        provider        = body.provider,
        notify_email    = body.notify_email,
        notify_whatsapp = body.notify_whatsapp,
    )
    db.add(alert)
    try:
        db.commit()
        db.refresh(alert)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create alert")
    return alert


@alerts_router.get("", response_model=list[RateAlertRead])
def list_alerts(
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    return (
        db.query(models.RateAlert)
        .filter(models.RateAlert.clerk_user_id == user_auth["clerk_user_id"])
        .order_by(models.RateAlert.created_at.desc())
        .all()
    )


@alerts_router.patch("/{alert_id}", response_model=RateAlertRead)
def update_alert(
    alert_id: int,
    body: RateAlertUpdate,
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    alert = db.query(models.RateAlert).filter(
        models.RateAlert.id == alert_id,
        models.RateAlert.clerk_user_id == user_auth["clerk_user_id"]
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(alert, field, value)

    try:
        db.commit()
        db.refresh(alert)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update alert")
    return alert


@alerts_router.delete("/{alert_id}", status_code=204)
def delete_alert(
    alert_id: int,
    user_auth: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    alert = db.query(models.RateAlert).filter(
        models.RateAlert.id == alert_id,
        models.RateAlert.clerk_user_id == user_auth["clerk_user_id"]
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    db.delete(alert)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete alert")
