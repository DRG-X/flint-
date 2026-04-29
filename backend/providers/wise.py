import re
import httpx
from providers.base import BaseProvider
from schemas import ProviderQuote


class WiseProvider(BaseProvider):
    name = "Wise"

    # Public Wise comparison endpoint — no auth required
    COMPARISONS_URL = "https://wise.com/gateway/v3/comparisons"
    # Fallback: live mid-market rate
    LIVE_RATE_URL = "https://wise.com/rates/live"

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/136.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
    }

    async def fetch_quote(
        self, amount: float, currency_from: str, currency_to: str
    ) -> ProviderQuote:
        async with httpx.AsyncClient(timeout=15, headers=self.HEADERS) as client:
            try:
                return await self._fetch_from_comparisons(
                    client, amount, currency_from, currency_to
                )
            except Exception as e:
                # If the comparisons endpoint fails, fall back to live rate
                try:
                    return await self._fetch_from_live_rate(
                        client, amount, currency_from, currency_to
                    )
                except Exception as fallback_err:
                    return self._make_quote(
                        provider=self.name,
                        send_amount=amount,
                        fee=0.0,
                        exchange_rate=0.0,
                        receive_amount=0.0,
                        currency_from=currency_from,
                        currency_to=currency_to,
                        transfer_time="Unknown",
                        error=f"Primary: {e} | Fallback: {fallback_err}",
                    )

    # ------------------------------------------------------------------ #
    #  Primary: /gateway/v3/comparisons  (real fee + rate + ETA)
    # ------------------------------------------------------------------ #
    async def _fetch_from_comparisons(
        self,
        client: httpx.AsyncClient,
        amount: float,
        currency_from: str,
        currency_to: str,
    ) -> ProviderQuote:
        resp = await client.get(
            self.COMPARISONS_URL,
            params={
                "sourceCurrency": currency_from,
                "targetCurrency": currency_to,
                "sendAmount": amount,
            },
        )
        resp.raise_for_status()
        data = resp.json()

        # Find the Wise entry among providers
        wise_provider = None
        for provider in data.get("providers", []):
            if provider.get("alias") == "wise":
                wise_provider = provider
                break

        if not wise_provider or not wise_provider.get("quotes"):
            raise ValueError("Wise provider data not found in comparisons response")

        quote = wise_provider["quotes"][0]

        rate = quote.get("rate", 0.0)
        fee = quote.get("fee", 0.0)
        receive_amount = quote.get("receivedAmount", 0.0)
        transfer_time = self._parse_delivery(quote.get("deliveryEstimation", {}))

        return self._make_quote(
            provider=self.name,
            send_amount=amount,
            fee=fee,
            exchange_rate=rate,
            receive_amount=receive_amount,
            currency_from=currency_from,
            currency_to=currency_to,
            transfer_time=transfer_time,
        )

    # ------------------------------------------------------------------ #
    #  Fallback: /rates/live  (mid-market rate only, estimate fee)
    # ------------------------------------------------------------------ #
    async def _fetch_from_live_rate(
        self,
        client: httpx.AsyncClient,
        amount: float,
        currency_from: str,
        currency_to: str,
    ) -> ProviderQuote:
        resp = await client.get(
            self.LIVE_RATE_URL,
            params={"source": currency_from, "target": currency_to},
        )
        resp.raise_for_status()
        data = resp.json()

        rate = data["value"]
        # Wise typically charges ~0.5-1.5% variable fee; use a conservative estimate
        estimated_fee_pct = 0.0065  # 0.65% of send amount
        fee = round(amount * estimated_fee_pct, 2)
        receive_amount = round((amount - fee) * rate, 2)

        return self._make_quote(
            provider=self.name,
            send_amount=amount,
            fee=fee,
            exchange_rate=rate,
            receive_amount=receive_amount,
            currency_from=currency_from,
            currency_to=currency_to,
            transfer_time="Within 24 hours (estimated)",
        )

    # ------------------------------------------------------------------ #
    #  Helpers
    # ------------------------------------------------------------------ #
    @staticmethod
    def _parse_delivery(estimation: dict) -> str:
        """Convert Wise's ISO-8601 duration or delivery date into a readable string."""
        if not estimation:
            return "Unknown"

        # Try duration first  (e.g. "PT1H22M28S")
        duration = estimation.get("duration")
        if duration and duration.get("min"):
            raw = duration["min"]  # e.g. "PT1H22M28.893687513S"
            return WiseProvider._iso_duration_to_human(raw)

        # Fall back to delivery date
        delivery_date = estimation.get("deliveryDate")
        if delivery_date and delivery_date.get("min"):
            # Just return the date portion
            dt_str = delivery_date["min"]  # ISO datetime string
            date_part = dt_str.split("T")[0] if "T" in dt_str else dt_str
            return f"By {date_part}"

        return "Unknown"

    @staticmethod
    def _iso_duration_to_human(iso: str) -> str:
        """Convert 'PT1H22M28.89S' → 'Within ~1 hour'."""
        match = re.match(
            r"PT(?:(\d+)H)?(?:(\d+)M)?(?:[\d.]+S)?", iso
        )
        if not match:
            return "Unknown"

        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)

        if hours == 0 and minutes == 0:
            return "Within minutes"
        if hours == 0:
            return f"Within ~{minutes} min"
        if minutes == 0:
            return f"Within ~{hours} hour{'s' if hours > 1 else ''}"
        return f"Within ~{hours}h {minutes}m"