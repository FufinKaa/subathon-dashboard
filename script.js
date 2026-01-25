/* =========================================================
   FUFATHON Dashboard – script.js (API-driven)
   - live time (Jak dlouho už streamuji)
   - money + goals
   - top 5 donors
   - last 10 events
   ========================================================= */

const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const MONEY_GOAL = 200000;

const GOALS = [
  { amount: 5000, label: "Movie night 🎬" },
  { amount: 10000, label: "Q&A bez cenzury 😈" },
  { amount: 15000, label: "Horror Night 😱" },
  { amount: 20000, label: "Jídlo podle chatu 🍽️" },
  { amount: 25000, label: "Kostým stream 👗" },
  { amount: 30000, label: "Just Dance 💃" },
  { amount: 35000, label: "Lego 🧱" },
  { amount: 40000, label: "Asijská ochutnávka 🍜" },
  { amount: 45000, label: "Minecraft SpeedRun DUO ⛏️" },
  { amount: 50000, label: "Karaoke stream 🎤" },
  { amount: 55000, label: "Battle Royale Challenge 🏹" },
  { amount: 60000, label: "Bowling 🎳" },
  { amount: 65000, label: "Try Not To Laugh 😂" },
  { amount: 70000, label: "Běžecký pás 🏃‍♀️" },
  { amount: 75000, label: "Drunk Stream 🍹" },
  { amount: 80000, label: "12h Stream ve stoje 🧍‍♀️" },
  { amount: 85000, label: "Split Fiction w/ Juraj 🤝" },
  { amount: 90000, label: "Mystery box opening 🎁" },
  { amount: 95000, label: "Turnaj v LoLku 🏆" },
  { amount: 100000, label: "Stodolní ve stylu ✨" },
  { amount: 110000, label: "Motokáry 🏎️" },
  { amount: 120000, label: "ASMR stream 🎧" },
  { amount: 125000, label: "Bolt Tower 🗼" },
  { amount: 130000, label: "Otužování 🧊" },
  { amount: 140000, label: "MiniGolf ⛳" },
  { amount: 150000, label: "Vířivka 🫧" },
  { amount: 160000, label: "Zažitkové ART studio 🎨" },
  { amount: 170000, label: "Jízda na koni 🐴" },
  { amount: 180000, label: "Výšlap na Lysou horu 🏔️" },
  { amount: 190000, label: "Tetování 🖋️" },
  { amount: 200000, label: "Víkend v Praze 🏙️" }
];

const $ = (id) => document.getElementById(id);

function pad2(n){ return String(n).padStart(2, "0"); }
function formatHMS(ms){
  const total = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}
function formatMoney(kc){
  return `${Number(kc).toLocaleString("cs-CZ")} Kč`;
}
function escapeHtml(str){
  return String(str ?? "").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}

// theme toggle (light/dark)
let theme = "dark";
function applyTheme(t){
  theme = t;
  document.documentElement.setAttribute("data-theme", t);
  const btn = $("themeToggle");
  if(btn) btn.textContent = t === "light" ? "☀️" : "🌙";
  localStorage.setItem("fufathon_theme", t);
}
function toggleTheme(){
  applyTheme(theme === "light" ? "dark" : "light");
}

// render: money + progress
function renderMoney(money){
  const moneyEl = $("money");
  if(moneyEl) moneyEl.textContent = formatMoney(money);

  const pct = Math.min(100, Math.round((money / MONEY_GOAL) * 100));
  if($("moneyProgress")) $("moneyProgress").style.width = `${pct}%`;
  if($("moneyProgressText")) $("moneyProgressText").textContent =
    `${Number(money).toLocaleString("cs-CZ")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;
}

// render: goals list
function renderGoals(money){
  if($("goalsSummary")) $("goalsSummary").textContent =
    `${Number(money).toLocaleString("cs-CZ")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;

  const pct = Math.min(100, Math.round((money / MONEY_GOAL) * 100));
  if($("goalsProgress")) $("goalsProgress").style.width = `${pct}%`;

  const listEl = $("goalsList");
  if(!listEl) return;

  const next = GOALS.find(g => money < g.amount);

  listEl.innerHTML = GOALS.map(g => {
    const reached = money >= g.amount;
    const isNext = next && next.amount === g.amount;

    return `
      <li class="goal-item ${reached ? "reached" : ""} ${isNext ? "next" : ""}">
        <div class="goal-left">
          <div class="goal-name">${reached ? "✅" : "🎯"} ${escapeHtml(g.label)}</div>
          <div class="goal-meta">${reached ? "splněno 💗" : (isNext ? "další na řadě ✨" : "čeká…")}</div>
        </div>
        <div class="goal-amount">${g.amount.toLocaleString("cs-CZ")} Kč</div>
      </li>
    `;
  }).join("");
}

// render: supporters top5
function renderSupporters(topDonors){
  const body = $("supportersBody");
  if(!body) return;

  if(!Array.isArray(topDonors) || !topDonors.length){
    body.innerHTML = `
      <tr>
        <td colspan="4" class="muted">Zatím nikdo… první top podporovatel budeš ty? 💗</td>
      </tr>`;
    return;
  }

  body.innerHTML = topDonors.map((s, i) => {
    const addedMin = Math.round((Number(s.addedSec) || 0) / 60);
    const total = Number(s.totalKc) || 0;
    return `
      <tr>
        <td>${i+1}</td>
        <td>${escapeHtml(s.user || "Anonym")}</td>
        <td>${total.toLocaleString("cs-CZ")} Kč</td>
        <td>+${addedMin.toLocaleString("cs-CZ")} min</td>
      </tr>
    `;
  }).join("");
}

// render: last events (10)
function renderEvents(events){
  const el = $("events");
  if(!el) return;

  if(!Array.isArray(events) || !events.length){
    el.innerHTML = `<li class="muted">Zatím nic…</li>`;
    return;
  }

  el.innerHTML = events.slice(0,10).map(ev => {
    const t = new Date(ev.ts).toLocaleTimeString("cs-CZ", { hour:"2-digit", minute:"2-digit" });
    return `<li><span class="muted">[${t}]</span> ${escapeHtml(ev.text)}</li>`;
  }).join("");
}

// render: live time
function renderLiveTime(startedAt, paused, pausedAt){
  const startEl = $("startTime");
  if(startEl) startEl.textContent = `Start: ${new Date(startedAt).toLocaleString("cs-CZ")}`;

  const pauseState = $("pauseState");
  const pauseInfo = $("pauseInfo");

  if(paused){
    if(pauseState) pauseState.textContent = "PAUZA";
    if(pauseInfo) pauseInfo.textContent = pausedAt ? `Pozastaveno: ${new Date(pausedAt).toLocaleString("cs-CZ")}` : "Pozastaveno";
  }else{
    if(pauseState) pauseState.textContent = "BĚŽÍ";
    if(pauseInfo) pauseInfo.textContent = "—";
  }

  const effectiveNow = (paused && pausedAt) ? pausedAt : Date.now();
  const liveMs = Math.max(0, effectiveNow - startedAt);

  const liveEl = $("timeLiveHMS");
  if(liveEl) liveEl.textContent = formatHMS(liveMs);
}

// fetch loop
let lastState = null;

async function fetchState(){
  const res = await fetch(API_STATE, { cache: "no-store" });
  if(!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

function renderAll(s){
  const money = Number(s.money) || 0;
  renderMoney(money);
  renderGoals(money);
  renderSupporters(s.topDonors || []);
  renderEvents(s.lastEvents || []);
  renderLiveTime(Number(s.startedAt) || Date.now(), !!s.paused, s.pausedAt ?? null);
}

async function tick(){
  try{
    const s = await fetchState();
    lastState = s;
    renderAll(s);
  }catch(err){
    console.log("[FUFATHON] state fetch error:", err);
  }finally{
    // live timer plynule i když API zrovna padne
    if(lastState){
      renderLiveTime(Number(lastState.startedAt) || Date.now(), !!lastState.paused, lastState.pausedAt ?? null);
    }
  }
}

(function init(){
  applyTheme(localStorage.getItem("fufathon_theme") || "dark");
  $("themeToggle")?.addEventListener("click", toggleTheme);

  tick();
  setInterval(tick, 2000);         // data refresh
  setInterval(() => {              // smooth live time
    if(lastState) renderLiveTime(Number(lastState.startedAt) || Date.now(), !!lastState.paused, lastState.pausedAt ?? null);
  }, 250);
})();
