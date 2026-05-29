import logging
import datetime
import base64

import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from database import SessionLocal
from models import RateAlert, User
from engine.comparator import compare
from schemas import CompareRequest
import os

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def check_alerts():
    """Run every 15 minutes. Check all active alerts against live rates."""
    logger.info("Alert checker: starting run")
    db: Session = SessionLocal()
    try:
        active_alerts = db.query(RateAlert).filter(RateAlert.is_active == True).all()  # noqa: E712

        if not active_alerts:
            logger.info("Alert checker: no active alerts — skipping")
            return

        # Group by corridor to avoid redundant API calls
        corridors: dict[tuple[str, str], list[RateAlert]] = {}
        for alert in active_alerts:
            key = (alert.from_currency, alert.to_currency)
            corridors.setdefault(key, []).append(alert)

        for (from_cur, to_cur), alerts in corridors.items():
            try:
                req = CompareRequest(
                    amount=alerts[0].amount,
                    currency_from=from_cur,
                    currency_to=to_cur,
                )
                result = await compare(req)
                best_rate = result.best_provider.exchange_rate
                best_provider = result.best_provider.provider

                for alert in alerts:
                    if best_rate >= alert.target_rate:
                        logger.info(
                            "Alert %s triggered: %.4f >= %.4f",
                            alert.id, best_rate, alert.target_rate,
                        )
                        await send_alert_notification(alert, best_rate, best_provider, db)
                        alert.last_triggered = datetime.datetime.utcnow()
                        db.commit()

            except Exception as exc:
                logger.error("Alert check failed for %s→%s: %s", from_cur, to_cur, exc)

    finally:
        db.close()

    logger.info("Alert checker: run complete")


async def send_alert_notification(
    alert: RateAlert, current_rate: float, provider: str, db: Session
) -> None:
    """Send email notification when a target rate is reached."""
    user = db.query(User).filter(User.clerk_user_id == alert.clerk_user_id).first()
    if not user:
        logger.warning("Alert %s: no user found for clerk_user_id=%s", alert.id, alert.clerk_user_id)
        return

    message = (
        f"🎯 Rate Alert Hit!\n\n"
        f"Your target: 1 {alert.from_currency} = {alert.target_rate} {alert.to_currency}\n"
        f"Current best rate: 1 {alert.from_currency} = {current_rate:.4f} {alert.to_currency}\n"
        f"Best provider right now: {provider}\n\n"
        f"Send money now at vaulto.in"
    )

    if alert.notify_email and user.email:
        await send_email_notification(user.email, message, alert)


async def send_email_notification(email: str, message: str, alert: RateAlert) -> None:
    """Send via Resend (free tier: 100 emails/day, 3 000/month)."""
    import resend  # lazy import — only needed when emails fire

    resend.api_key = os.getenv("RESEND_API_KEY", "")
    if not resend.api_key:
        logger.warning("RESEND_API_KEY not set — email not sent")
        return

    try:
        resend.Emails.send({
            "from": "alerts@vaulto.in",
            "to": email,
            "subject": f"🎯 Your rate alert hit! {alert.from_currency}→{alert.to_currency}",
            "text": message,
        })
        logger.info("Email notification sent to %s for alert %s", email, alert.id)
    except Exception as exc:
        logger.error("Email send failed for alert %s: %s", alert.id, exc)


def start_scheduler() -> None:
    """Register the alert-checker job and start the scheduler."""
    scheduler.add_job(
        check_alerts,
        trigger="interval",
        minutes=15,
        id="alert_checker",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Alert scheduler started — checking every 15 minutes")


def stop_scheduler() -> None:
    """Gracefully shut down the scheduler (called on app shutdown)."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Alert scheduler stopped")
