@echo off
echo Setting up Flint...

:: Create folders
mkdir backend\providers
mkdir backend\engine
mkdir frontend\pages
mkdir frontend\styles
mkdir frontend\lib
mkdir frontend\components

:: Move backend files
move main.py backend\
move schemas.py backend\
move comparator.py backend\engine\
move wise.py backend\providers\
move remitly.py backend\providers\
move western_union.py backend\providers\

:: Move frontend files
move index.js frontend\pages\
move globals.css frontend\styles\

:: Move component files if they exist
if exist BestProviderCard.js move BestProviderCard.js frontend\components\
if exist ComparisonTable.js move ComparisonTable.js frontend\components\

:: Create backend\providers\__init__.py
(
echo from providers.wise import WiseProvider
echo from providers.remitly import RemitlyProvider
echo from providers.western_union import WesternUnionProvider
echo.
echo ALL_PROVIDERS = [WiseProvider^(^), RemitlyProvider^(^), WesternUnionProvider^(^)]
) > backend\providers\__init__.py

:: Create backend\engine\__init__.py
(
echo from engine.comparator import compare
) > backend\engine\__init__.py

:: Create frontend\pages\_app.js
(
echo import "../styles/globals.css";
echo.
echo export default function App^({ Component, pageProps }^) {
echo   return ^<Component {...pageProps} /^>;
echo }
) > frontend\pages\_app.js

:: Create frontend\lib\api.js
(
echo const API_URL = process.env.NEXT_PUBLIC_API_URL ^|^| "http://localhost:8000";
echo.
echo export async function compareProviders^({ amount, currency_from, currency_to }^) {
echo   const res = await fetch^(`${API_URL}/compare`, {
echo     method: "POST",
echo     headers: { "Content-Type": "application/json" },
echo     body: JSON.stringify^({ amount: parseFloat^(amount^), currency_from, currency_to }^),
echo   }^);
echo   if ^(!res.ok^) {
echo     const err = await res.json^(^).catch^(^(^) =^> ^({ detail: res.statusText }^)^);
echo     throw new Error^(err.detail ^|^| "API request failed"^);
echo   }
echo   return res.json^(^);
echo }
) > frontend\lib\api.js

:: Create backend\requirements.txt
(
echo fastapi==0.111.0
echo uvicorn[standard]==0.29.0
echo httpx==0.27.0
echo pydantic==2.7.1
echo playwright==1.44.0
) > backend\requirements.txt

:: Create frontend\package.json
(
echo {
echo   "name": "flint-frontend",
echo   "version": "1.0.0",
echo   "private": true,
echo   "scripts": {
echo     "dev": "next dev",
echo     "build": "next build",
echo     "start": "next start"
echo   },
echo   "dependencies": {
echo     "next": "14.2.3",
echo     "react": "18.3.1",
echo     "react-dom": "18.3.1"
echo   }
echo }
) > frontend\package.json

:: Create frontend\next.config.js
(
echo /** @type {import^('next'^).NextConfig} */
echo const nextConfig = {
echo   reactStrictMode: true,
echo   env: {
echo     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ^|^| "http://localhost:8000",
echo   },
echo };
echo module.exports = nextConfig;
) > frontend\next.config.js

echo.
echo Done! Your folders are ready.
echo.
echo Next steps:
echo   1. Open a terminal, cd into the flint folder
echo   2. Run:  cd backend
echo   3. Run:  pip install -r requirements.txt
echo   4. Run:  uvicorn main:app --reload --port 8000
echo.
echo   5. Open a second terminal, cd into the flint folder
echo   6. Run:  cd frontend
echo   7. Run:  npm install
echo   8. Run:  npm run dev
echo.
echo   Then open http://localhost:3000 in your browser
pause
