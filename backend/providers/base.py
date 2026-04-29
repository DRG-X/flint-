from abc import ABC, abstractmethod
from schemas import ProviderQuote


class BaseProvider(ABC):
    name: str = "unknown"

    @abstractmethod
    async def fetch_quote(
        self, amount: float, currency_from: str, currency_to: str
    ) -> ProviderQuote:
        ...

    def _make_quote(self, **kwargs) -> ProviderQuote:
        return ProviderQuote(**kwargs)