"""
WesternUnionProvider — Direct integration with Western Union's PRICECATALOG API.

Endpoint: POST https://www.westernunion.com/wuconnect/prices/catalog
This endpoint returns a matrix of payment methods vs delivery methods.

Key design decisions:
  - Uses `funds_in: "*"` to request all available pay-in methods.
  - Parses `services_groups` and their `pay_groups`.
  - Sorts to pick the option that yields the highest `receive_amount`, using lowest `gross_fee` as a tie-breaker.
  - Formats transfer speed based on `speed_indicator`.
  - Returns structured errors directly from `response_status` (e.g. unsupported corridors).
"""

import asyncio
import logging
import uuid
import httpx

from providers.base import BaseProvider
from schemas import ProviderQuote

logger = logging.getLogger(__name__)


class WesternUnionProvider(BaseProvider):
    name = "Western Union"

    CATALOG_URL = "https://www.westernunion.com/wuconnect/prices/catalog"

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/136.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": "https://www.westernunion.com",
        "Referer": "https://www.westernunion.com/",
    }

    # ------------------------------------------------------------------ #
    #  Currency -> ISO-3166 alpha-2 country code mapping.                #
    #  Western Union assumes the specific country sending/receiving.     #
    # ------------------------------------------------------------------ #
    CURRENCY_TO_COUNTRY_ISO2 = {
        "USD": "US",
        "GBP": "GB",
        "EUR": "DE",  # Using Germany as default EUR
        "CAD": "CA",
        "AUD": "AU",
        "NZD": "NZ",
        "SGD": "SG",
        "NOK": "NO",
        "SEK": "SE",
        "DKK": "DK",
        "CHF": "CH",
        "HKD": "HK",
        "JPY": "JP",
        "INR": "IN",
        "PHP": "PH",
        "MXN": "MX",
        "NGN": "NG",
        "KES": "KE",
        "PKR": "PK",
        "BDT": "BD",
        "LKR": "LK",
        "NPR": "NP",
        "VND": "VN",
        "BRL": "BR",
        "COP": "CO",
        "PEN": "PE",
        "GHS": "GH",
        "ZAR": "ZA",
        "THB": "TH",
        "IDR": "ID",
        "MYR": "MY",
        "CNY": "CN",
        "KRW": "KR",
        "EGP": "EG",
        "MAD": "MA",
        "TZS": "TZ",
        "UGX": "UG",
        "RWF": "RW",
        "ETB": "ET",
        "PLN": "PL",
        "RON": "RO",
        "UAH": "UA",
        "GEL": "GE",
        "TRY": "TR",
    }

    # ------------------------------------------------------------------ #
    #  Public interface                                                    #
    # ------------------------------------------------------------------ #

    async def fetch_quote(
        self, amount: float, currency_from: str, currency_to: str
    ) -> ProviderQuote:
        src_country = self.CURRENCY_TO_COUNTRY_ISO2.get(currency_from.upper())
        dst_country = self.CURRENCY_TO_COUNTRY_ISO2.get(currency_to.upper())

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

        corr_id = str(uuid.uuid4())
        payload = {
            "header_request": {
                "version": "0.5",
                "request_type": "PRICECATALOG",
                "correlation_id": corr_id,
                "transaction_id": corr_id,
            },
            "sender": {
                "client": "WUCOM",
                "channel": "WWEB",
                "cty_iso2_ext": src_country,
                "curr_iso3": currency_from.upper(),
                "send_amount": amount,
                "funds_in": "*",
            },
            "receiver": {
                "cty_iso2_ext": dst_country,
                "curr_iso3": currency_to.upper(),
                "cty_iso2": dst_country,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=15, headers=self.HEADERS) as client:
                resp = await client.post(self.CATALOG_URL, json=payload)
                resp.raise_for_status()
                data = resp.json()

        except Exception as e:
            return self._error_quote(
                amount, currency_from, currency_to,
                f"Western Union API error: {e}"
            )

        # Check for WU internal API errors (like P1008 unsupported corridor)
        status = data.get("response_status", {})
        code = status.get("code")
        if code and code not in ("P0000", "P0039", "0"):
            msg = status.get("message", "Unknown API Error")
            return self._error_quote(
                amount, currency_from, currency_to,
                f"Western Union Error [{code}]: {msg}"
            )

        return self._parse_best_quote(data, amount, currency_from, currency_to)

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
        Parses `services_groups` to find the quote that yields the maximum 
        `receive_amount`, using lowest `gross_fee` as a tie-breaker.
        """
        all_options = []

        services_groups = data.get("services_groups", [])
        if not services_groups:
            return self._error_quote(
                amount, currency_from, currency_to,
                "No processing services available for this corridor."
            )

        for sg in services_groups:
            service_name = sg.get("service_name", "Transfer")
            for pg in sg.get("pay_groups", []):
                # Standardize speed format (e.g. "0" -> "Within Minutes", "2-3" -> "2-3 days")
                speed = str(pg.get("speed_indicator", "Unknown"))
                if speed == "0":
                    speed_label = "Within Minutes"
                elif "-" in speed or speed.isdigit():
                    speed_label = f"{speed} days"
                else:
                    speed_label = speed

                all_options.append({
                    "service": service_name,
                    "fund_in": pg.get("fund_in", "Unknown"),
                    "fx_rate": float(pg.get("fx_rate", 0)),
                    "gross_fee": float(pg.get("gross_fee", 0)),
                    "receive_amount": float(pg.get("receive_amount", 0)),
                    "speed_label": speed_label
                })

        if not all_options:
            return self._error_quote(
                amount, currency_from, currency_to,
                "No specific pay options found in catalog."
            )

        # Sort options: highest receive amount first; if equal, lowest gross fee
        all_options.sort(key=lambda x: (x["receive_amount"], -x["gross_fee"]), reverse=True)
        best = all_options[0]

        transfer_time_desc = f"{best['speed_label']} ({best['service']})"

        logger.info(
            f"[WesternUnion] Selected best: {best['service']} ({best['fund_in']}) "
            f"Rate: {best['fx_rate']} Fee: {best['gross_fee']}"
        )

        return self._make_quote(
            provider=self.name,
            send_amount=amount,
            fee=best["gross_fee"],
            exchange_rate=best["fx_rate"],
            receive_amount=best["receive_amount"],
            currency_from=currency_from,
            currency_to=currency_to,
            transfer_time=transfer_time_desc,
        )

    def _error_quote(
        self, amount: float, currency_from: str, currency_to: str, error: str
    ) -> ProviderQuote:
        logger.error(f"[WesternUnion] {error}")
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