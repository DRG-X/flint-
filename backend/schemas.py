from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


# ── Provider / Compare schemas ────────────────────────────────────────────────

class ProviderQuote(BaseModel):
    provider: str
    send_amount: float
    fee: float
    exchange_rate: float
    receive_amount: float
    currency_from: str
    currency_to: str
    transfer_time: str
    error: Optional[str] = None


class CompareRequest(BaseModel):
    amount: float
    currency_from: str
    currency_to: str

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v

    @field_validator("currency_from", "currency_to")
    @classmethod
    def currency_must_be_uppercase(cls, v):
        return v.strip().upper()


class CompareResponse(BaseModel):
    best_provider: ProviderQuote
    quotes: List[ProviderQuote]
    savings_vs_worst: float
    savings_vs_average: float
    request: CompareRequest
    failed_providers: List[str]


# ── User schemas ──────────────────────────────────────────────────────────────

class UserSync(BaseModel):
    """Called after Clerk sign-up to upsert the user row."""
    clerk_id: str
    email: str
    full_name: Optional[str] = None


class UserRead(BaseModel):
    id: int
    clerk_user_id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    country: Optional[str] = None
    university: Optional[str] = None
    whatsapp_number: Optional[str] = None
    home_currency: Optional[str] = None
    corridor_from: Optional[str] = None
    corridor_to: Optional[str] = None
    is_onboarded: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    whatsapp_number: Optional[str] = None
    country: Optional[str] = None
    university: Optional[str] = None
    home_currency: Optional[str] = None
    corridor_from: Optional[str] = None
    corridor_to: Optional[str] = None
    is_onboarded: Optional[bool] = None


# ── Onboarding schema ─────────────────────────────────────────────────────────

class OnboardingComplete(BaseModel):
    country: str
    university: Optional[str] = None
    whatsapp_number: Optional[str] = None
    home_currency: Optional[str] = None
    corridor_from: Optional[str] = None
    corridor_to: Optional[str] = None


# ── Legacy profile schemas (kept for backwards compatibility) ─────────────────

class ProfileCreate(BaseModel):
    country: str
    university: str
    whatsapp_number: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    clerk_user_id: str
    email: Optional[str] = None
    country: Optional[str] = None
    university: Optional[str] = None
    whatsapp_number: Optional[str] = None
    is_onboarded: bool
    is_new_user: bool = False

    class Config:
        from_attributes = True


class UserStatusResponse(BaseModel):
    """Lightweight check — does this Clerk user already have a saved profile?"""
    exists: bool
    is_onboarded: bool = False


# ──────────────── Comparison schemas ────────────────────────────────────────────────────────

class ComparisonCreate(BaseModel):
    amount: float
    from_currency: str
    to_currency: str
    results_json: str   # JSON string of the provider results array


class ComparisonRead(BaseModel):
    id: int
    clerk_user_id: Optional[str] = None
    amount: float
    from_currency: str
    to_currency: str
    results_json: str
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────── Rate Alert schemas ────────────────────────────────────────────────────────

class RateAlertCreate(BaseModel):
    from_currency: str
    to_currency: str
    amount: float
    target_rate: float
    provider: Optional[str] = None
    notify_email: bool = True
    notify_whatsapp: bool = False


class RateAlertRead(BaseModel):
    id: int
    clerk_user_id: str
    from_currency: str
    to_currency: str
    amount: float
    target_rate: float
    provider: Optional[str] = None
    notify_email: bool
    notify_whatsapp: bool
    is_active: bool
    last_triggered: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RateAlertUpdate(BaseModel):
    target_rate: Optional[float] = None
    is_active: Optional[bool] = None
    notify_email: Optional[bool] = None
    notify_whatsapp: Optional[bool] = None
    provider: Optional[str] = None


class ContactMessage(BaseModel):
    name: str
    email: str
    subject: str
    message: str


# ── Click tracking ────────────────────────────────────────────────────────────

class ClickCreate(BaseModel):
    provider: str
    from_currency: str
    to_currency: str
    amount: float
