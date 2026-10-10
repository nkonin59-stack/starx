# StarX — Telegram Mini App starter

Starter project for deploying the StarX frontend and Python API/bot on Render.

## Included
- React + TypeScript + Vite frontend with dark/gold StarX styling
- Market grid with price sorting (low-to-high / high-to-low) and search
- FastAPI backend with demo catalog and admin price update endpoint
- Optional Telegram bot polling with aiogram
- Render Blueprint (`render.yaml`)

## Important
This is a starter foundation, not a production marketplace. Catalog entries are demo data; the uploaded screenshots are not imported as image assets yet. Real marketplace listings and live prices require an authorized data source/API. Do not represent stale or demo prices as live market prices.
Real Stars payments, withdrawals, randomized prize draws, and wagering games are not enabled in this starter.

## Deploy
1. Upload this folder's contents to your GitHub repository `nkonin59-stack/starx`.
2. In Render, choose **New + → Blueprint**, connect the repository, and deploy.
3. Set `BOT_TOKEN` for the bot if you want bot polling enabled.
4. Set `ADMIN_TOKEN` to a long random secret before using the admin endpoint.
5. After deploy, set the frontend `VITE_API_URL` to the API service URL and redeploy the static site if Render doesn't inject it automatically.

## Admin API
`POST /api/admin/prices` with header `X-Admin-Token: <ADMIN_TOKEN>`:
```json
{"items":[{"id":"sample-1","price_stars":490}]}
```

This starter uses in-memory demo catalog data. It resets on redeploy/restart. Use PostgreSQL before storing real user balances, tickets, inventory, or transactions.
