// ============================
// FUFATHON Dashboard script.js
// (napojeno na tvůj index.html)
// ============================

const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const GOAL_TOTAL = 200000;
const FETCH_EVERY_MS = 3000;   // jak často tahat data z API
const TICK_EVERY_MS = 250;     // jak často přepočítávat timer na stránce

// --- GOALS (všechny tvoje) ---
const GOALS = [
  { amount: 5000,  title: "Movie night", note: "Rozhodnete o filmu vy! 🎬 Pohodlí zajištěno 🍿" },
  { amount: 10000, title: "Q&A bez cenzury", note: "Zeptáte se na cokoliv, já odpovím! 😏" },
  { amount: 15000, title: "Horror Night", note: "Tepovka na max 👻 Bude strašidelně… a vtipně 😱" },
  { amount: 20000, title: "Jídlo podle chatu", note: "Domácí burgery nebo Pizza! 🍔🍕" },
  { amount: 25000, title: "Kostým stream", note: "Půjdeme společně koupit nějaký kostým… 🤡 Připrav se na srandu!" },
  { amount: 30000, title: "Just Dance", note: "💃 Kolik hodin vydržíme? Tančíme podle vás!" },
  { amount: 35000, title: "Lego", note: "Potřebujeme doplnit Lego Eevee 🧱 Kreativita na max!" },
  { amount: 40000, title: "Asijská ochutnávka", note: "Asijské dobroty 🍣 Vy vybíráte, já ochutnávám!" },
  { amount: 45000, title: "Minecraft SpeedRun DUO", note: "S kým to bude? Naučí mě to už někdo..⛏️" },
  { amount: 50000, title: "Karaoke stream", note: "🎤 Zpíváme hity podle vás, hlasivky připravené!" },
  { amount: 55000, title: "Battle Royale Challenge", note: "💥 Vyhrát ve Fortnite, Apex Legends, Call Of Duty 🔫" },
  { amount: 60000, title: "Bowling", note: "🎳 Budu to umět s koulema? 🤪" },
  { amount: 65000, title: "Try Not To Laugh", note: "S vodou v puse 💦 Pokusím se nezasmát!" },
  { amount: 70000, title: "Běžecký pás", note: "Do konce Fufathonu každý den 10000 kroků, když ne trest! 👣" },
  { amount: 75000, title: "Drunk Stream", note: "🍹 Humorné výzvy a povídání pod vlivem (legálně 😅)" },
  { amount: 80000, title: "12h Stream ve stoje", note: "🧍‍♀️ Zvládneme to? Držte motivaci!" },
  { amount: 85000, title: "Split Fiction w/ Juraj", note: "Společně budeme hrát a tvořit příběh 🕹️" },
  { amount: 90000, title: "Mystery box opening", note: "🎁 Co najdu tentokrát? Vy tipujete!" },
  { amount: 95000, title: "Turnaj v LoLku", note: "🏆 Kdo bude vítěz? Vyherní team získá cenu!" },
  { amount: 100000, title: "Stodolní ve stylu", note: "🎉 Dýmka, hudba, tance a pravá stodolní zábava!" },
  { amount: 110000, title: "Motokáry", note: "🏎️ Adrenalin, drift a smích!" },
  { amount: 120000, title: "ASMR stream", note: "🎤 Tiché šepoty, zvuky a relax s chatem 😌" },
  { amount: 125000, title: "Bolt Tower", note: "⚡ Adrenalin na maximum, dáme nahoře kávičku?" },
  { amount: 130000, title: "Otužování", note: "🥶 Půjde mi to líp než minule?" },
  { amount: 140000, title: "MiniGolf", note: "⛳ Zábava a šílené hole podle chatu!" },
  { amount: 150000, title: "Vířivka", note: "🫧Potřebujeme si trochu odpočinout, ne? 💦" },
  { amount: 160000, title: "Zažitkové ART studio", note: "Malujeme, tvoříme a zapojíte se?🎨" },
  { amount: 170000, title: "Jízda na koni", note: "🐎 Elegantně nebo bláznivě?" },
  { amount: 180000, title: "Výšlap na Lysou horu", note: "Krásné výhledy a dobrodružství 🏔️" },
  { amount: 190000, title: "Tetování", note: "Co si necháme udělat? 🖊️😱" },
  { amount: 200000, title: "Víkend v Praze", note: "Srazy, pobyt a procházky po hlavním městě.. 🏙️" },
];

// ---------- helpers ----------
const $ = (sel) => document.querySelector(sel);

function setText(sel, value) {
  const el = $(sel);
  if (el) el.textContent = value;
}

function setHTML(sel, html) {
  const el = $(sel);
  if (el) el.innerHTML = html;
}

function formatKc(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("cs-CZ");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatHMS(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
}

function formatDateTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

// ---------- state + ticking ----------
let currentState = null;

function effectiveNowMs(state) {
  const now = Date.now();
  if (state?.paused && state?.pausedAt) return Number(state.pausedAt) || now;
  return now;
}

function tickTimers() {
  if (!currentState) return;

  const startedAt = Number(currentState.startedAt) || 0;
  const endsAt = Number(currentState.endsAt) || 0;
  const now = effectiveNowMs(currentState);

  // time left
  if (endsAt > 0) {
    const remainingSec = Math.max(0, Math.floor((endsAt - now) / 1000));
    setText("#timeLeft", formatHMS(remainingSec));
    setText("#endsAtText", `Konec: ${formatDateTime(endsAt)}`);
  } else {
    setText("#timeLeft", "--:--:--");
    setText("#endsAtText", "Konec: —");
  }

  // time running
  if (startedAt > 0) {
    const runningSec = Math.max(0, Math.floor((now - startedAt) / 1000));
    setText("#timeRunning", formatHMS(runningSec));
    setText("#startedAtText", `Start: ${formatDateTime(startedAt)}`);
  } else {
    setText("#timeRunning", "--:--:--");
    setText("#startedAtText", "Start: —");
  }

  // progress času (elapsed / total)
  if (startedAt > 0 && endsAt > startedAt) {
    const total = endsAt - startedAt;
    const elapsed = clamp01((now - startedAt) / total);
    const percent = Math.round(elapsed * 100);
    setText("#timePct", `${percent}%`);
    const bar = $("#timeProgress");
    if (bar) bar.style.width = `${percent}%`;
  } else {
    setText("#timePct", "0%");
    const bar = $("#timeProgress");
    if (bar) bar.style.width = `0%`;
  }
}

// ---------- render blocks ----------
function renderMoneySubs(state) {
  const money = Number(state?.money) || 0;
  const t1 = Number(state?.t1) || 0;
  const t2 = Number(state?.t2) || 0;
  const t3 = Number(state?.t3) || 0;
  const subsTotal = Number(state?.subsTotal) || (t1 + t2 + t3);

  setText("#money", `${formatKc(money)} Kč`);
  setText("#moneySmall", `${formatKc(money)} / ${formatKc(GOAL_TOTAL)} Kč`);

  const pct = Math.round(clamp01(money / GOAL_TOTAL) * 100);
  const mbar = $("#moneyProgress");
  if (mbar) mbar.style.width = `${pct}%`;

  setText("#subsTotal", String(subsTotal));
  setText("#subsBreak", `${t1} / ${t2} / ${t3}`);

  // header u goalů
  setText("#goalHeader", `${formatKc(money)} / ${formatKc(GOAL_TOTAL)} Kč`);

  // goal progress bar (stejný jako money)
  const gbar = $("#goalBar");
  if (gbar) gbar.style.width = `${pct}%`;
}

function renderGoals(money) {
  const m = Number(money) || 0;
  const html = GOALS.map((g) => {
    const done = m >= g.amount;
    return `
      <div class="goalItem ${done ? "done" : ""}">
        <div class="goalLeft">
          <div class="goalTitle">
            <span class="goalCheck">${done ? "✅" : "⬜"}</span>
            <span>${escapeHtml(g.title)}</span>
          </div>
          ${g.note ? `<div class="goalNote">${escapeHtml(g.note)}</div>` : ""}
        </div>
        <div class="goalAmt">${formatKc(g.amount)} Kč</div>
      </div>
    `;
  }).join("");

  setHTML("#goalList", html);
}

function renderTopDonors(donors) {
  const rows = (donors || []).slice(0, 5).map((d, i) => {
    const user = escapeHtml(String(d?.user || "Anonym"));
    const totalKc = Number(d?.totalKc || 0);
    const addedSec = Number(d?.addedSec || 0);
    const addedMin = Math.round(addedSec / 60);

    return `
      <div class="tRow">
        <div class="tCell rank">${i + 1}</div>
        <div class="tCell name">${user}</div>
        <div class="tCell money">${formatKc(totalKc)} Kč</div>
        <div class="tCell time">+${addedMin} min</div>
      </div>
    `;
  }).join("");

  const html = `
    <div class="tHead">
      <div class="tCell rank">#</div>
      <div class="tCell name">JMÉNO</div>
      <div class="tCell money">KČ CELKEM</div>
      <div class="tCell time">PŘIDANÝ ČAS</div>
    </div>
    ${rows || `<div class="muted">Zatím nikdo… 💜</div>`}
  `;

  setHTML("#topTable", html);
}

function renderEvents(events) {
  const list = (events || []).slice(0, 10).map((e) => {
    const time = e?.ts
      ? new Date(e.ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
      : "--:--";
    const text = escapeHtml(String(e?.text || "").trim());
    return `
      <div class="feedRow">
        <span class="feedTime">[${time}]</span>
        <span class="feedText">${text}</span>
      </div>
    `;
  }).join("");

  setHTML("#feed", list || `<div class="muted">Zatím nic… 💜</div>`);
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------- theme toggle ----------
function applyTheme(theme) {
  const isLight = theme === "light";
  document.documentElement.classList.toggle("light", isLight);

  const icon = $("#themeIcon");
  const text = $("#themeText");
  if (icon) icon.textContent = isLight ? "☀️" : "🌙";
  if (text) text.textContent = isLight ? "Den" : "Noc";

  localStorage.setItem("fufathon_theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("fufathon_theme") || "dark";
  applyTheme(saved);

  const btn = $("#themeBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = localStorage.getItem("fufathon_theme") || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }
}

// ---------- main render ----------
function renderAll(state) {
  currentState = state;

  // pill LIVE (zatím jen vizuál, později Twitch API)
  const livePill = $("#livePill");
  if (livePill) {
    livePill.textContent = state?.paused ? "⏸️ PAUZA" : "🔴 LIVE";
  }

  renderMoneySubs(state);
  renderGoals(state?.money || 0);
  renderTopDonors(state?.topDonors || []);
  renderEvents(state?.lastEvents || []);

  // timer tickne hned
  tickTimers();
}

// ---------- fetch loop ----------
async function loadState() {
  try {
    const r = await fetch(API_STATE, { cache: "no-store" });
    if (!r.ok) throw new Error(`API error ${r.status}`);
    const data = await r.json();
    renderAll(data);
  } catch (err) {
    console.error("[FUFATHON] loadState error:", err);
  }
}

function start() {
  initTheme();
  loadState();
  setInterval(loadState, FETCH_EVERY_MS);
  setInterval(tickTimers, TICK_EVERY_MS);
}

document.addEventListener("DOMContentLoaded", start);
