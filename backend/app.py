import asyncio
import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "").strip()

# Demo catalog only. Replace with verified listings from authorized data sources.
CATALOG = [
    {"id": "sample-1", "name": "Golden Torch", "collection": "Demo collection", "price_stars": 490, "image": ""},
    {"id": "sample-2", "name": "Winter Cup", "collection": "Demo collection", "price_stars": 500, "image": ""},
    {"id": "sample-3", "name": "Lucky Charm", "collection": "Demo collection", "price_stars": 683, "image": ""},
    {"id": "sample-4", "name": "Candy Pop", "collection": "Demo collection", "price_stars": 475, "image": ""},
    {"id": "sample-5", "name": "Rocket Ride", "collection": "Demo collection", "price_stars": 1511, "image": ""},
    {"id": "sample-6", "name": "Golden Watch", "collection": "Demo collection", "price_stars": 6331, "image": ""},
]

class PriceUpdate(BaseModel):
    id: str
    price_stars: int = Field(ge=0, le=100_000_000)

class PriceUpdateRequest(BaseModel):
    items: list[PriceUpdate]

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = None
    if BOT_TOKEN:
        try:
            from aiogram import Bot, Dispatcher
            from aiogram.filters import CommandStart
            from aiogram.types import Message, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

            bot = Bot(BOT_TOKEN)
            dp = Dispatcher()

            @dp.message(CommandStart())
            async def start(message: Message):
                app_url = os.getenv("MINI_APP_URL", "").strip()
                if app_url.startswith("https://"):
                    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
                        InlineKeyboardButton(text="Open StarX", web_app=WebAppInfo(url=app_url))
                    ]])
                    await message.answer("Welcome to StarX. Open the Mini App below.", reply_markup=keyboard)
                else:
                    await message.answer("StarX bot is online. Set MINI_APP_URL to your deployed HTTPS frontend URL.")

            async def run_bot():
                await dp.start_polling(bot)

            task = asyncio.create_task(run_bot())
        except Exception as exc:
            print(f"Telegram bot could not start: {exc}")
    yield
    if task:
        task.cancel()

app = FastAPI(title="StarX API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your deployed Mini App origin before production.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"name": "StarX API", "status": "ok", "catalog_mode": "demo"}

@app.get("/health")
async def health():
    return {"ok": True}

@app.get("/api/market")
async def market(sort: str = "popular", q: Optional[str] = None):
    items = CATALOG.copy()
    if q:
        query = q.casefold().strip()
        items = [x for x in items if query in x["name"].casefold() or query in x["collection"].casefold()]
    if sort == "price_asc":
        items.sort(key=lambda x: x["price_stars"])
    elif sort == "price_desc":
        items.sort(key=lambda x: x["price_stars"], reverse=True)
    return {"items": items, "currency": "XTR", "demo": True}

@app.post("/api/admin/prices")
async def update_prices(payload: PriceUpdateRequest, x_admin_token: Optional[str] = Header(default=None)):
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="ADMIN_TOKEN is not configured")
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    by_id = {item["id"]: item for item in CATALOG}
    updated = 0
    for change in payload.items:
        if change.id in by_id:
            by_id[change.id]["price_stars"] = change.price_stars
            updated += 1
    return {"updated": updated, "note": "Demo prices are in memory and reset on restart."}
