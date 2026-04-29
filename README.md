# ⚡ Flint — International Money Transfer Comparison Engine

Flint is a real-time comparison tool that fetches live quotes from **Wise**, **Remitly**, and **Western Union**, then tells you exactly which provider gives your recipient the most money.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Next.js)                    │
│  ┌────────────┐  POST /compare  ┌────────────────────┐  │
│  │  Home Page │ ──────────────► │  FastAPI Backend   │  │
│  │  (form)    │ ◄────────────── │  main.py           │  │
│  └────────────┘  CompareResult  └────────┬───────────┘  │
└──────────────────────────────────────────┼──────────────┘
                                           │
                          ┌────────────────▼──────────────┐
                          │    engine/comparator.py        │
                          │  asyncio.gather() all providers│
                          │  rank by receive_amount        │
                          │  calculate savings             │
                          └──┬────────────┬────────────┬──┘
                             │            │            │
                    ┌────────▼──┐  ┌──────▼────┐  ┌───▼────────────┐
                    │  wise.py  │  │remitly.py │  │western_union.py│
                    │           │  │           │  │                │
                    │ Primary:  │  │ Primary:  │  │ Primary:       │
                    │ /v1/rates │  │ /landing_ │  │ /wuconnect/    │
                    │ /v3/quotes│  │  api/calc │  │  rest/fx/v2/   │
                    │           │  │           │  │  fxrate        │
                    │ Fallback: │  │ Fallback: │  │ Fallback:      │
                    │ Playwright│  │ Playwright│  │ Playwright     │
                    └───────────┘  └───────────┘  └────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **Concurrent provider fetches** | `asyncio.gather()` runs all 3 providers in parallel — total latency = slowest provider, not sum |
| **Hybrid fetch strategy** | Try reverse-engineered APIs first (fast, light), fall back to Playwright if blocked |
| **Graceful degradation** | If 1–2 providers fail, the system still returns results from working providers |
| **Strict shared schema** | `ProviderQuote` Pydantic model enforced on every provider — adding a 4th provider is trivial |
| **No mock data** | All data is fetched live; the app is honest about failures |

---

## Project Structure

```
flint/
├── backend/
│   ├── main.py                 # FastAPI app + CORS + routes
│   ├── schemas.py              # Pydantic models (shared data contract)
│   ├── requirements.txt
│   ├── .env.example
│   ├── providers/
│   │   ├── __init__.py         # Exports ALL_PROVIDERS list
│   │   ├── base.py             # Abstract BaseProvider
│   │   ├── wise.py             # Wise: /v1/rates + /v3/quotes + Playwright fallback
│   │   ├── remitly.py          # Remitly: calculator API + Playwright fallback
│   │   └── western_union.py    # WU: fxrate API + Playwright fallback
│   └── engine/
│       ├── __init__.py
│       └── comparator.py       # Concurrent fetch, rank, savings calc
│
└── frontend/
    ├── next.config.js
    ├── package.json
    ├── .env.local.example
    ├── lib/
    │   └── api.js              # fetch wrapper for /compare
    ├── styles/
    │   └── globals.css         # Full design system (dark terminal aesthetic)
    ├── components/
    │   ├── BestProviderCard.js # Hero card for the winning provider
    │   └── ComparisonTable.js  # Full ranked table
    └── pages/
        ├── _app.js
        └── index.js            # Home + results (single page)
```

---

## Setup & Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- (Optional) Chromium — only needed if provider APIs are blocked and Playwright fallbacks trigger

---

### 1. Backend (FastAPI)

```bash
cd flint/backend

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers (only needed for scraping fallback)
playwright install chromium

# Copy env file
cp .env.example .env

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be live at: **http://localhost:8000**

Verify it works:
```bash
curl http://localhost:8000/health
# → {"status":"ok","service":"flint-api"}
```

Test a comparison:
```bash
curl -X POST http://localhost:8000/compare \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency_from": "USD", "currency_to": "INR"}'
```

---

### 2. Frontend (Next.js)

```bash
cd flint/frontend

# Install dependencies
npm install

# Copy env file
cp .env.local.example .env.local

# Start the dev server
npm run dev
```

The app will be live at: **http://localhost:3000**

---

### 3. Running Both Together (quick script)

From the repo root:

```bash
# Terminal 1 — Backend
cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## API Reference

### `POST /compare`

**Request body:**
```json
{
  "amount": 1000,
  "currency_from": "USD",
  "currency_to": "INR"
}
```

**Response:**
```json
{
  "best_provider": {
    "provider": "Wise",
    "send_amount": 1000,
    "fee": 5.46,
    "exchange_rate": 83.421000,
    "receive_amount": 83002.55,
    "currency_from": "USD",
    "currency_to": "INR",
    "transfer_time": "1-2 business days"
  },
  "quotes": [...],           // all providers ranked best → worst
  "savings_vs_worst": 1240.30,
  "savings_vs_average": 480.12,
  "request": { "amount": 1000, "currency_from": "USD", "currency_to": "INR" },
  "failed_providers": []     // empty if all succeeded
}
```

---

## Adding a New Provider

1. Create `backend/providers/yourprovider.py`
2. Subclass `BaseProvider`, implement `fetch_quote()`, return a `ProviderQuote`
3. Add it to `ALL_PROVIDERS` in `backend/providers/__init__.py`

That's it. The comparator picks it up automatically.

```python
# providers/yourprovider.py
from providers.base import BaseProvider
from schemas import ProviderQuote

class YourProvider(BaseProvider):
    name = "YourProvider"

    async def fetch_quote(self, amount, currency_from, currency_to) -> ProviderQuote:
        # ... fetch logic ...
        return self._make_quote(
            provider=self.name,
            send_amount=amount,
            fee=2.99,
            exchange_rate=83.10,
            receive_amount=82766.01,
            currency_from=currency_from,
            currency_to=currency_to,
            transfer_time="Same day",
        )
```

---

## Deployment

### Backend (Railway / Render / Fly.io)

```bash
# Procfile
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set env var: `ALLOWED_ORIGINS=https://your-frontend.vercel.app`

### Frontend (Vercel)

```bash
vercel deploy
```

Set env var: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`

---

## Supported Currency Pairs

Any pair where all three providers operate. Best coverage for:

| Send | Receive |
|------|---------|
| USD | INR, PHP, MXN, BDT, PKR, NGN, KES, VND, THB, EUR, GBP |
| GBP | EUR, INR, USD, AUD |
| EUR | GBP, USD, INR |
| CAD | INR, PHP, USD |
| AUD | INR, PHP, USD |

---

## Limitations & Next Steps (post-MVP)

- **Provider auth:** Wise's `/v3/quotes` returns richer data when authenticated via OAuth. For MVP we use the public unauthenticated endpoint.
- **Rate limiting:** Providers may throttle heavy usage. A caching layer (Redis, 60s TTL) would help.
- **More providers:** Xoom, OFX, Xe, CurrencyFair all have public APIs.
- **Historical tracking:** Store quotes over time to show rate trends.
- **Send-from country:** MVP defaults to US. Parameterize `origin_country` for global coverage.

---

*Flint is not affiliated with Wise, Remitly, or Western Union. Rates shown are indicative and fetched in real time.*
