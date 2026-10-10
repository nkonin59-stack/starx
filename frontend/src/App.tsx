import { useEffect, useMemo, useState } from "react";
import { House, ListChecks, Gamepad2, Ticket, UserRound, Search, ArrowDownUp, Star, Gift, Trophy, Zap, Wallet } from "lucide-react";

type Item = { id: string; name: string; collection: string; price_stars: number; image: string };
const API = (import.meta as any).env.VITE_API_URL || "";

const demoItems: Item[] = [
  { id: "sample-1", name: "Golden Torch", collection: "Demo collection", price_stars: 490, image: "🔦" },
  { id: "sample-2", name: "Winter Cup", collection: "Demo collection", price_stars: 500, image: "🥤" },
  { id: "sample-3", name: "Lucky Charm", collection: "Demo collection", price_stars: 683, image: "🍀" },
  { id: "sample-4", name: "Candy Pop", collection: "Demo collection", price_stars: 475, image: "🍭" },
  { id: "sample-5", name: "Rocket Ride", collection: "Demo collection", price_stars: 1511, image: "🚀" },
  { id: "sample-6", name: "Golden Watch", collection: "Demo collection", price_stars: 6331, image: "⌚" },
];

type Tab = "home" | "tasks" | "games" | "draws" | "profile";

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [items, setItems] = useState<Item[]>(demoItems);
  const [sort, setSort] = useState("popular");
  const [query, setQuery] = useState("");
  const [apiMode, setApiMode] = useState("demo");

  useEffect(() => {
    fetch(`${API}/api/market`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { if (Array.isArray(data.items)) { setItems(data.items.map((x: Item) => ({...x, image: x.image || "🎁"}))); setApiMode(data.demo ? "demo" : "live"); } })
      .catch(() => setApiMode("demo"));
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter(x => x.name.toLowerCase().includes(q));
    if (sort === "price_asc") list = [...list].sort((a,b) => a.price_stars-b.price_stars);
    if (sort === "price_desc") list = [...list].sort((a,b) => b.price_stars-a.price_stars);
    return list;
  }, [items, query, sort]);

  const title: Record<Tab, string> = { home: "StarX", tasks: "Задания", games: "Игры", draws: "Розыгрыши", profile: "Профиль" };

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="logo">X</div><div><b>StarX</b><small>PLAY · EARN · COLLECT</small></div></div>
      <div className="balance"><Star size={16} fill="currentColor"/> <span>0</span></div>
    </header>
    <div className="welcome">
      <div><p className="eyebrow">TELEGRAM MINI APP</p><h1>{title[tab]}</h1><p className="muted">Задания, коллекции и награды</p></div>
      <div className="hero-mark">✦</div>
    </div>

    {tab === "home" && <>
      <section className="stats">
        <div><span>Баланс</span><strong>0 <small>★</small></strong></div>
        <div><span>Билетики</span><strong>0 <small>🎟</small></strong></div>
        <div><span>Уровень</span><strong>1</strong></div>
      </section>
      <section className="section-head"><div><h2>Маркет NFT</h2><p className="muted">Цены в Telegram Stars</p></div><span className="pill">DEMO</span></section>
      <div className="market-tools">
        <label className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Найти подарок"/></label>
        <label className="sort"><ArrowDownUp size={16}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">Популярные</option><option value="price_asc">Сначала дешевле</option><option value="price_desc">Сначала дороже</option></select></label>
      </div>
      <div className="catalog">{shown.map(item=><article className="item" key={item.id}>
        <div className="item-art">{item.image.startsWith("http") ? <img src={item.image} alt={item.name}/> : <span>{item.image}</span>}</div>
        <div className="item-info"><b>{item.name}</b><small>{item.collection}</small><div className="price"><Star size={14} fill="currentColor"/>{item.price_stars.toLocaleString("ru-RU")} <span>★</span></div></div>
      </article>)}</div>
      <p className="footnote">Демо-каталог: цены и изображения пока не синхронизированы с торговыми площадками.</p>
    </>}

    {tab === "tasks" && <section className="placeholder"><ListChecks/><h2>Задания</h2><p>Здесь будут подписки, ежедневные задания и награды в билетах.</p><div className="empty-row"> <Gift/> Задания скоро появятся</div></section>}
    {tab === "games" && <section className="game-list">
      <article className="game-card"><div className="game-icon"><Zap/></div><div><h2>Rocket</h2><p>Демо-режим без ставок</p></div><span className="pill">SOON</span></article>
      <article className="game-card"><div className="game-icon"><Star/></div><div><h2>Coinflip</h2><p>Тренировочный режим</p></div><span className="pill">SOON</span></article>
      <article className="game-card"><div className="game-icon"><Trophy/></div><div><h2>Арена</h2><p>Соревнования игроков</p></div><span className="pill">SOON</span></article>
    </section>}
    {tab === "draws" && <section className="placeholder"><Ticket/><h2>Розыгрыши</h2><p>Билетики, призы и история розыгрышей появятся в следующем этапе.</p><div className="empty-row"><Trophy/> Пока нет активных розыгрышей</div></section>}
    {tab === "profile" && <section className="placeholder profile"><div className="avatar">X</div><h2>Профиль StarX</h2><p>После подключения проверенной Telegram-авторизации здесь появятся имя, фото, username, баланс и инвентарь.</p><div className="empty-row"><Wallet/> Баланс и инвентарь</div></section>}

    <nav className="bottom-nav">
      {([{id:"home",label:"Главная",Icon:House},{id:"tasks",label:"Задания",Icon:ListChecks},{id:"games",label:"Игры",Icon:Gamepad2},{id:"draws",label:"Билеты",Icon:Ticket},{id:"profile",label:"Профиль",Icon:UserRound}] as const).map(({id,label,Icon})=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon size={19}/><span>{label}</span></button>)}
    </nav>
  </main>;
}
