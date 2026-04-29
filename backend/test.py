import asyncio
from providers.wise import WiseProvider

async def test():
    provider = WiseProvider()
    result = await provider.fetch_quote(1000, "INR", "USD")
    print(result)
    
asyncio.run(test())