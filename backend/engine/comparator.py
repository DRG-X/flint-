"""
Comparison engine.

Runs all providers concurrently, skips failures gracefully,
ranks by receive_amount descending, calculates savings metrics.
"""

import asyncio
import logging
from typing import Optional

from schemas import CompareRequest, CompareResponse, ProviderQuote
from providers import ALL_PROVIDERS

logger = logging.getLogger(__name__)


async def _safe_fetch(provider, amount: float, currency_from: str, currency_to: str):
    """Fetch from a provider, catching and logging all errors."""
    try:
        quote = await provider.fetch_quote(amount, currency_from, currency_to)
        logger.info(
            f"[{provider.name}] OK — receive={quote.receive_amount} {currency_to}, "
            f"rate={quote.exchange_rate}, fee={quote.fee}"
        )
        return quote, None

    except Exception as e:
        logger.error(f"[{provider.name}] FAILED: {e}")
        return None, provider.name


async def compare(request: CompareRequest) -> CompareResponse:
    """
    Run all providers concurrently and return ranked comparison.
    Raises ValueError if no provider succeeds.
    """
    tasks = [
        _safe_fetch(p, request.amount, request.currency_from, request.currency_to)
        for p in ALL_PROVIDERS
    ]
    results = await asyncio.gather(*tasks)

    quotes: list[ProviderQuote] = []
    failed: list[str] = []

    for quote, error_provider in results:
        if quote is not None:
            quotes.append(quote)
        else:
            failed.append(error_provider)

    if not quotes:
        raise ValueError(
            "All providers failed to return a quote. "
            f"Failed: {', '.join(failed)}. "
            "Check your currency pair or internet connection."
        )

    # Rank best → worst by receive_amount
    quotes.sort(key=lambda q: q.receive_amount, reverse=True)

    best = quotes[0]
    worst_receive = quotes[-1].receive_amount
    savings_vs_worst = round(best.receive_amount - worst_receive, 2)

    avg_receive = sum(q.receive_amount for q in quotes) / len(quotes)
    savings_vs_average = round(best.receive_amount - avg_receive, 2)

    return CompareResponse(
        best_provider=best,
        quotes=quotes,
        savings_vs_worst=savings_vs_worst,
        savings_vs_average=savings_vs_average,
        request=request,
        failed_providers=failed,
    )
