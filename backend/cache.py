"""
cache.py — Async Redis cache layer for Flint rate data.

Uses redis.asyncio (bundled with the `redis` package ≥ 4.2).
Upstash requires TLS, which is handled automatically when the URL
scheme is `rediss://`.

Key design decisions
--------------------
* The Redis client is initialised once at startup via `init_cache()`,
  called from a FastAPI lifespan handler in main.py.
* All public functions (`get_cached_rates`, `set_cached_rates`) are
  safe to call even when Redis is unavailable — they return None /
  silently skip rather than raising, keeping the API always-available.
* Rich logging is emitted for every meaningful event so you can tail
  server logs to debug caching without needing redis-cli.
"""

import json
import logging
import os

import redis.asyncio as aioredis
from redis.exceptions import RedisError

logger = logging.getLogger("flint.cache")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

# Strip accidental surrounding quotes that some .env parsers leave in.
_raw_url: str = os.getenv("REDIS_URL", "").strip().strip('"').strip("'")
REDIS_URL: str = _raw_url

CACHE_TTL: int = int(os.getenv("RATE_CACHE_TTL_SECONDS", "300"))  # seconds

# ---------------------------------------------------------------------------
# Shared client — populated by init_cache() at startup
# ---------------------------------------------------------------------------

_client: aioredis.Redis | None = None


async def init_cache() -> None:
    """
    Create the Redis client and verify connectivity with a PING.
    Call this once from the FastAPI lifespan startup handler.

    Logs:
        INFO  — Redis connected successfully
        WARNING — Redis unavailable (app continues without caching)
    """
    global _client

    logger.info("CACHE STEP: init_cache() called")
    logger.info("CACHE STEP: REDIS_URL present=%s  length=%d", bool(REDIS_URL), len(REDIS_URL))

    if not REDIS_URL:
        logger.warning(
            "CACHE STEP: REDIS_URL not set — caching disabled. "
            "Set REDIS_URL in .env to enable Redis caching."
        )
        return

    try:
        client = aioredis.from_url(
            REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=False,
        )
        logger.info("CACHE STEP: Redis client object created: %s", client)

        # 1. Verify basic connectivity
        pong = await client.ping()
        logger.info("CACHE STEP: PING result=%s", pong)

        if not pong:
            logger.warning("CACHE STEP: PING returned falsy — caching disabled")
            return

        # 2. Verify WRITE permission (catches read-only tokens immediately)
        try:
            await client.setex("flint:startup_probe", 10, "ok")
            probe_val = await client.get("flint:startup_probe")
            logger.info("CACHE STEP: startup write-probe value=%s", probe_val)
        except RedisError as write_exc:
            logger.error(
                "CACHE STEP: ❌ Redis write probe FAILED: %s\n"
                "This usually means you are using a READ-ONLY token (username contains '_ro').\n"
                "Fix: update REDIS_URL in .env to use the read-write token.",
                write_exc,
            )
            # Still set _client so reads work, but warn that writes will fail
            _client = client
            logger.warning("CACHE STEP: _client set but writes will fail — cache hits impossible")
            return

        _client = client
        logger.info("✅ CACHE STEP: Redis connected + write-verified — caching enabled (TTL=%ds)", CACHE_TTL)

    except RedisError as exc:
        logger.warning("CACHE STEP: ⚠️ Redis unavailable at startup: %s — caching disabled", exc)
    except Exception as exc:
        logger.warning("CACHE STEP: ⚠️ Redis init failed: %s — caching disabled", exc)


async def close_cache() -> None:
    """Close the Redis connection pool gracefully on shutdown."""
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None
        logger.info("Redis connection closed")


# ---------------------------------------------------------------------------
# Cache key
# ---------------------------------------------------------------------------

def _cache_key(from_currency: str, to_currency: str, amount: float) -> str:
    """
    Build a stable cache key.

    Amount is bucketed to the nearest 50 so that 480 and 510 share the same
    cached result — rates don't change meaningfully over small amount ranges.
    """
    bucket = round(amount / 50) * 50
    return f"rates:v1:{from_currency.upper()}:{to_currency.upper()}:{bucket}"


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

async def get_cached_rates(
    from_currency: str,
    to_currency: str,
    amount: float,
) -> dict | None:
    """
    Return the cached rate dict for this corridor/amount, or None on miss.

    Logs:
        INFO  — Cache HIT  (key, TTL remaining)
        INFO  — Cache MISS (key)
        WARNING — Cache read error
    """
    logger.info("CACHE STEP: get_cached_rates called  from=%s to=%s amount=%s  _client_is_none=%s",
                from_currency, to_currency, amount, _client is None)

    if _client is None:
        logger.info("CACHE STEP: _client is None — skipping cache lookup")
        return None

    key = _cache_key(from_currency, to_currency, amount)
    logger.info("CACHE STEP: cache key=%s", key)

    try:
        data = await _client.get(key)
        logger.info("CACHE STEP: Redis GET raw result type=%s value_present=%s", type(data).__name__, bool(data))
        if data:
            ttl = await _client.ttl(key)
            logger.info("🟢 CACHE STEP: Cache HIT  key=%s  ttl=%ds", key, ttl)
            return json.loads(data)

        logger.info("🔵 CACHE STEP: Cache MISS key=%s", key)
        return None

    except RedisError as exc:
        logger.warning("CACHE STEP: ⚠️ Cache read failed (key=%s): %s", key, exc)
        return None
    except Exception as exc:
        logger.warning("CACHE STEP: ⚠️ Cache read unexpected error (key=%s): %s", key, exc)
        return None


async def set_cached_rates(
    from_currency: str,
    to_currency: str,
    amount: float,
    data: dict,
) -> None:
    """
    Write the rate dict to Redis with CACHE_TTL expiry.

    Logs:
        INFO  — Cache write success (key, TTL)
        WARNING — Cache write failed
    """
    logger.info("CACHE STEP: set_cached_rates called  from=%s to=%s amount=%s  _client_is_none=%s",
                from_currency, to_currency, amount, _client is None)

    if _client is None:
        logger.info("CACHE STEP: _client is None — skipping cache write")
        return

    key = _cache_key(from_currency, to_currency, amount)
    logger.info("CACHE STEP: attempting SETEX key=%s  ttl=%d", key, CACHE_TTL)
    try:
        payload = json.dumps(data)
        await _client.setex(key, CACHE_TTL, payload)
        logger.info("💾 CACHE STEP: Cache WRITE SUCCESS key=%s  ttl=%ds  bytes=%d", key, CACHE_TTL, len(payload))
    except RedisError as exc:
        # Upgrade to ERROR — this should never be silent (e.g. read-only token)
        logger.error("CACHE STEP: ❌ Cache WRITE FAILED (key=%s): %s", key, exc)
    except Exception as exc:
        logger.error("CACHE STEP: ❌ Cache WRITE unexpected error (key=%s): %s", key, exc)
