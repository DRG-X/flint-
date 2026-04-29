"""
RemitlyProvider — Direct integration with Remitly's internal calculator API.

Endpoint: GET https://api.remitly.io/v3/calculator/estimate
This is the same API powering remitly.com's pricing UI.

Key design decisions:
  - Uses `base_rate` (non-promotional) for fair, realistic comparison.
  - Parses ALL delivery options from `pay_out_price_estimates`.
  - Picks the cheapest option (lowest fee with bank deposit preference).
  - Computes FX markup when mid-market rate comparison is possible.
  - Returns structured errors for unsupported corridors (never silently skips).
  - Retries with exponential backoff on 429 rate-limit responses.
"""

import asyncio
import logging

import httpx

from providers.base import BaseProvider
from schemas import ProviderQuote

logger = logging.getLogger(__name__)


class RemitlyProvider(BaseProvider):
    name = "Remitly"

    ESTIMATE_URL = "https://api.remitly.io/v3/calculator/estimate"

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/136.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
        "Origin": "https://www.remitly.com",
        "Referer": "https://www.remitly.com/",
    }

    # ------------------------------------------------------------------ #
    #  Currency → ISO-3166 alpha-3 country code mapping.                  #
    #  Remitly conduit format: "{COUNTRY_ISO3}:{CURRENCY}"                #
    #  e.g. "USA:USD-IND:INR"                                            #
    #                                                                     #
    #  Remitly is a SEND-TO platform: only ~20 source countries are       #
    #  supported. If a source currency maps to an unsupported country,    #
    #  the API returns 400.                                               #
    # ------------------------------------------------------------------ #
    CURRENCY_TO_COUNTRY_ISO3 = {
        # Source countries (can send FROM these)
        "USD": "USA",
        "GBP": "GBR",
        "EUR": "DEU",  # Germany as default EUR source
        "CAD": "CAN",
        "AUD": "AUS",
        "NZD": "NZL",
        "SGD": "SGP",
        "NOK": "NOR",
        "SEK": "SWE",
        "DKK": "DNK",
        "CHF": "CHE",
        "HKD": "HKG",
        "JPY": "JPN",
        # Destination countries (can send TO these)
        "INR": "IND",
        "PHP": "PHL",
        "MXN": "MEX",
        "NGN": "NGA",
        "KES": "KEN",
        "PKR": "PAK",
        "BDT": "BGD",
        "LKR": "LKA",
        "NPR": "NPL",
        "VND": "VNM",
        "BRL": "BRA",
        "COP": "COL",
        "PEN": "PER",
        "GHS": "GHA",
        "ZAR": "ZAF",
        "THB": "THA",
        "IDR": "IDN",
        "MYR": "MYS",
        "CNY": "CHN",
        "KRW": "KOR",
        "EGP": "EGY",
        "MAD": "MAR",
        "TZS": "TZA",
        "UGX": "UGA",
        "RWF": "RWA",
        "ETB": "ETH",
        "XOF": "SEN",  # Senegal as default CFA franc destination
        "GTQ": "GTM",
        "HNL": "HND",
        "DOP": "DOM",
        "JMD": "JAM",
        "HTG": "HTI",
        "CRC": "CRI",
        "NIO": "NIC",
        "SVC": "SLV",
        "BZD": "BLZ",
        "GYD": "GUY",
        "TTD": "TTO",
        "PLN": "POL",
        "RON": "ROU",
        "UAH": "UKR",
        "GEL": "GEO",
        "TRY": "TUR",
    }

    # Maps pay_in_method → human-readable transfer speed.
    # These come directly from Remitly's UI labels.
    PAY_IN_SPEED = {
        "DEBIT": "Express (Minutes)",
        "CREDIT": "Express (Minutes)",
        "PAYTO": "Express (Minutes)",          # Australia-specific instant pay
        "BANK": "Economy (3-5 business days)",
        "ACH": "Economy (3-5 business days)",
        "APPLE_PAY": "Express (Minutes)",
    }

    # Preference order for selecting the "best" delivery method.
    # Lower index = higher preference. BANK_DEPOSIT is cheapest/most common.
    PAYOUT_PREFERENCE = [
        "BANK_DEPOSIT",
        "UPI",
        "DIRECT_TO_PHONE",
        "PUSH_TO_CARD",
        "HOME_DELIVERY",
        "CASH_PICKUP",
    ]

    # ------------------------------------------------------------------ #
    #  Public interface                                                    #
    # ------------------------------------------------------------------ #

    async def fetch_quote(
        self, amount: float, currency_from: str, currency_to: str
    ) -> ProviderQuote:
        """
        Fetch a real-time quote from Remitly's calculator API.

        Returns the best available delivery option (lowest fee, bank deposit
        preferred). Uses base_rate for fair comparison, not promotional rate.
        """
        src_country = self.CURRENCY_TO_COUNTRY_ISO3.get(currency_from.upper())
        dst_country = self.CURRENCY_TO_COUNTRY_ISO3.get(currency_to.upper())

        if not src_country or not dst_country:
            missing = []
            if not src_country:
                missing.append(f"source={currency_from}")
            if not dst_country:
                missing.append(f"destination={currency_to}")
            return self._error_quote(
                amount, currency_from, currency_to,
                f"Unsupported corridor: unknown currency mapping for {', '.join(missing)}"
            )

        conduit = f"{src_country}:{currency_from}-{dst_country}:{currency_to}"

        params = {
            "conduit": conduit,
            "anchor": "SEND",
            "amount": amount,
            "customer_segment": "STANDARD",
            "customer_recognition": "UNRECOGNIZED",
            "strict_promo": "false",
        }

        try:
            data = await self._request_with_retry(params)
        except RemitlyUnsupportedCorridor as e:
            return self._error_quote(
                amount, currency_from, currency_to,
                f"Corridor not supported by Remitly: {conduit}"
            )
        except Exception as e:
            return self._error_quote(
                amount, currency_from, currency_to,
                f"Remitly API error: {e}"
            )

        return self._parse_best_quote(data, amount, currency_from, currency_to)

    # ------------------------------------------------------------------ #
    #  HTTP layer with retry/backoff for 429s                             #
    # ------------------------------------------------------------------ #

    async def _request_with_retry(
        self, params: dict, max_retries: int = 3
    ) -> dict:
        """
        Make GET request to Remitly estimate API with exponential backoff
        on 429 rate-limit responses.

        Raises:
            RemitlyUnsupportedCorridor: if API returns 400 (bad corridor)
            httpx.HTTPStatusError: for other non-2xx responses
            httpx.TimeoutException: if all retries time out
        """
        async with httpx.AsyncClient(timeout=15, headers=self.HEADERS) as client:
            last_exc = None
            for attempt in range(max_retries):
                try:
                    resp = await client.get(self.ESTIMATE_URL, params=params)

                    if resp.status_code == 400:
                        # 400 = unsupported corridor (e.g. IND→AUS)
                        raise RemitlyUnsupportedCorridor(
                            f"Corridor not supported: {params.get('conduit')}"
                        )

                    if resp.status_code == 429:
                        # Rate limited — back off and retry
                        wait = 2 ** attempt  # 1s, 2s, 4s
                        logger.warning(
                            f"Remitly rate limited (429), retrying in {wait}s "
                            f"(attempt {attempt + 1}/{max_retries})"
                        )
                        await asyncio.sleep(wait)
                        continue

                    resp.raise_for_status()
                    return resp.json()

                except (RemitlyUnsupportedCorridor, httpx.HTTPStatusError):
                    raise
                except Exception as e:
                    last_exc = e
                    if attempt < max_retries - 1:
                        wait = 2 ** attempt
                        logger.warning(
                            f"Remitly request failed ({e}), retrying in {wait}s "
                            f"(attempt {attempt + 1}/{max_retries})"
                        )
                        await asyncio.sleep(wait)

            raise last_exc or RuntimeError("Remitly API: all retries exhausted")

    # ------------------------------------------------------------------ #
    #  Response parsing                                                   #
    # ------------------------------------------------------------------ #

    def _parse_best_quote(
        self,
        data: dict,
        amount: float,
        currency_from: str,
        currency_to: str,
    ) -> ProviderQuote:
        """
        Parse the API response and return the best delivery option.

        Strategy:
          1. Collect all options: the top-level `estimate` + each entry in
             `pay_out_price_estimates.estimates` (if present).
          2. Prefer BANK_DEPOSIT (cheapest fee typically).
          3. Among equal payout methods, prefer lowest fee.
          4. Always use `base_rate` (non-promotional) for fair comparison.
        """
        # Gather all available estimates into a flat list
        all_estimates = []

        top_estimate = data.get("estimate")
        if top_estimate:
            all_estimates.append(top_estimate)

        payout_block = data.get("pay_out_price_estimates")
        if payout_block and isinstance(payout_block, dict):
            extras = payout_block.get("estimates", [])
            if extras:
                all_estimates.extend(extras)

        if not all_estimates:
            return self._error_quote(
                amount, currency_from, currency_to,
                "Remitly returned empty estimate data"
            )

        # Pick the best option: sort by payout preference, then by fee
        def sort_key(est):
            method = est.get("pay_out_method", "")
            try:
                pref = self.PAYOUT_PREFERENCE.index(method)
            except ValueError:
                pref = len(self.PAYOUT_PREFERENCE)  # Unknown methods go last
            fee = float(est.get("fee", {}).get("total_fee_amount", "0") or "0")
            return (pref, fee)

        all_estimates.sort(key=sort_key)
        best = all_estimates[0]

        # ---- Extract fields from the best estimate ----

        # Use base_rate (non-promotional) for realistic comparison
        rate_block = best.get("exchange_rate", {})
        base_rate = float(rate_block.get("base_rate", "0") or "0")
        promo_rate = float(rate_block.get("promotional_exchange_rate", "0") or "0")

        fee = float(best.get("fee", {}).get("total_fee_amount", "0") or "0")
        pay_in = best.get("pay_in_method", "BANK")
        pay_out = best.get("pay_out_method", "")

        # Recalculate receive_amount using base_rate instead of promo rate
        # Formula: receive = (send_amount - fee) * base_rate
        # But Remitly doesn't subtract fee from send; total_charge = send + fee
        # Actually from the data: send_amount + fee = total_charge (sometimes)
        # But looking at the real data, receive_amount = send_amount * rate
        # So: receive = amount * base_rate
        receive_amount_base = round(amount * base_rate, 2)

        # The API-reported receive_amount uses the promotional rate
        api_receive = float(best.get("receive_amount", "0") or "0")

        # Transfer speed based on payment method
        transfer_time = self.PAY_IN_SPEED.get(pay_in, "3-5 business days")

        # Build descriptive transfer time including delivery method
        if pay_out:
            payout_label = pay_out.replace("_", " ").title()
            transfer_time = f"{transfer_time} ({payout_label})"

        # Log promo vs base for transparency
        if promo_rate and promo_rate != base_rate:
            logger.info(
                f"[Remitly] Using base_rate={base_rate} "
                f"(promo_rate={promo_rate}, promo receive={api_receive})"
            )

        # Log all available delivery options for debugging
        if len(all_estimates) > 1:
            options_summary = ", ".join(
                f"{e.get('pay_out_method', '?')}(fee={e.get('fee', {}).get('total_fee_amount', '?')})"
                for e in all_estimates
            )
            logger.info(f"[Remitly] Delivery options: {options_summary}")

        return self._make_quote(
            provider=self.name,
            send_amount=amount,
            fee=fee,
            exchange_rate=base_rate,
            receive_amount=receive_amount_base,
            currency_from=currency_from,
            currency_to=currency_to,
            transfer_time=transfer_time,
        )

    # ------------------------------------------------------------------ #
    #  Helpers                                                            #
    # ------------------------------------------------------------------ #

    def _error_quote(
        self, amount: float, currency_from: str, currency_to: str, error: str
    ) -> ProviderQuote:
        """Return a structured error quote — never silently skip."""
        logger.error(f"[Remitly] {error}")
        return self._make_quote(
            provider=self.name,
            send_amount=amount,
            fee=0.0,
            exchange_rate=0.0,
            receive_amount=0.0,
            currency_from=currency_from,
            currency_to=currency_to,
            transfer_time="N/A",
            error=error,
        )


class RemitlyUnsupportedCorridor(Exception):
    """Raised when Remitly returns 400 for an unsupported currency corridor."""
    pass