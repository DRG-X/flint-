"""
Test AUD → INR for all providers.
Run from backend/: python test_aud_inr.py
"""
import asyncio
import sys
import os

# Make sure backend root is importable
sys.path.insert(0, os.path.dirname(__file__))

from providers.wise import WiseProvider
from providers.remitly import RemitlyProvider
from providers.western_union import WesternUnionProvider


async def test():
    providers = [WiseProvider(), RemitlyProvider(), WesternUnionProvider()]
    for p in providers:
        print(f"\n{'=' * 50}")
        print(f"  Testing {p.name} -- AUD 1000 -> INR")
        print(f"{'=' * 50}")
        try:
            result = await p.fetch_quote(1000, "AUD", "INR")
            if result.error:
                print(f"  [FAIL] ERROR: {result.error}")
            else:
                print(f"  [PASS] Rate:           {result.exchange_rate}")
                print(f"         Fee:            AUD {result.fee}")
                print(f"         Recipient gets: INR {result.receive_amount:,.2f}")
                print(f"         Speed:          {result.transfer_time}")
        except Exception as e:
            print(f"  [EXCEPTION] {type(e).__name__}: {e}")


asyncio.run(test())
