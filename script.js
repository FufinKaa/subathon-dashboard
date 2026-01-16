/* =========================================================
   FUFATHON Dashboard – script.js (REMOTE MODE via Worker API)
   - Time left / Time live (z API)
   - Money + Goals auto-check (z API)
   - Top supporters (z API)
   - Last actions (z API)
   - Cute theme toggle (lokálně uložené)
   ========================================================= */

// =====================
// REMOTE MODE (Cloudflare Worker API)
// =====================
const API_BASE = "https://fufathon-api.pajujka191.workers.dev";
const REMOTE_MODE = true; // true = čte stav z API, false = demo/localStorage

const STORAGE_KEY = "fufathon_state_v3"; // používá se jen když REMOTE_MODE=false
const THEME_KEY = "fufathon_theme_v1";

const MONEY_GOAL = 200000;

// ✅ 100 Kč = 15 minut  => 1 Kč = 0.15 min => 9 sekund
// (v REMOTE MODE tohle řeší backend, tady je to jen pro demo režim)
const DONATION_SECONDS_PER_KC = 9;

// Subs time rules (fixní) (v REMOTE MODE řeší backend, tady jen pro demo)
const SUB_MINUTES = { t1: 10, t2: 15, t3: 20 };

// Goals (tvůj seznam)
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

function now(){ return Date.now(); }
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

// ---------- State ----------
function defaultState(){
  const start = now();
  const initialMinutes = 6 * 60; // default start: 6 hodin
  return {
    startedAt: start,
    endsAt: start + initialMinutes * 60 * 1000,

    money: 0,
    t1: 0,
    t2: 0,
    t3: 0,

    events: [
      { ts: start, text: "💗✨ FUFATHON je LIVE – čekám na první sub/donate 💜" }
    ],

    supporters: [],

    theme: "dark"
  };
}

let state = loadState();

function loadState(){
  // REMOTE MODE: nebereme subathon data z localStorage
  if (REMOTE_MODE) {
    const s = defaultState();
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") s.theme = savedTheme;
    return s;
  }

  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const d = defaultState();
    return {
      ...d,
      ...parsed,
      events: Array.isArray(parsed.events) ? parsed.events : d.events,
      supporters: Array.isArray(parsed.supporters) ? parsed.supporters : d.supporters
    };
  }catch{
    return defaultState();
  }
}

function saveState(){
  // V REMOTE MODE neukládáme subathon data do localStorage
  if (REMOTE_MODE) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- Theme ----------
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  const btn = $("themeToggle");
  if(btn) btn.textContent = theme === "light" ? "☀️" : "🌙";
  state.theme = theme;

  // theme ukládáme lokálně vždy
  try { localStorage.setItem(THEME_KEY, theme); } catch {}

  // v DEMO režimu ukládáme celý state
  saveState();
}

function toggleTheme(){
  applyTheme(state.theme === "light" ? "dark" : "light");
}

// ---------- Confetti ----------
function party(){
  if(typeof confetti !== "function") return;
  confetti({ particleCount: 70, spread: 55, origin: { y: 0.65 } });
}

// ---------- Events ----------
function pushEvent(text){
  state.events.unshift({ ts: now(), text });
  state.events = state.events.slice(0, 30);
  saveState();
  renderEvents();
}

function renderEvents(){
  const el = $("events");
  if(!el) return;
  el.innerHTML = state.events.map(ev => {
    const t = new Date(ev.ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
    return `<li><span class="muted">[${t}]</span> ${escapeHtml(ev.text)}</li>`;
  }).join("");
}

// ---------- Top supporters ----------
function upsertSupporter(user, amountKc, addedSec){
  const name = (user || "Anonym").trim();
  const amt = Number(amountKc) || 0;
  const addSec = Number(addedSec) || 0;

  if(amt <= 0) return;

  const found = state.supporters.find(s => s.user.toLowerCase() === name.toLowerCase());
  if(found){
    found.totalKc += amt;
    found.addedSec += addSec;
  }else{
    state.supporters.push({ user: name, totalKc: amt, addedSec: addSec });
  }

  state.supporters.sort((a,b) => b.totalKc - a.totalKc);
  state.supporters = state.supporters.slice(0, 10);

  saveState();
  renderSupporters();
}

function renderSupporters(){
  const body = $("supportersBody");
  if(!body) return;

  if(!state.supporters.length){
    body.innerHTML = `
      <tr>
        <td colspan="4" class="muted">Zatím nikdo… první top podporovatel budeš ty? 💗</td>
      </tr>`;
    return;
  }

  body.innerHTML = state.supporters.map((s, i) => {
    const addedMin = Math.round((Number(s.addedSec) || 0) / 60);
    return `
      <tr>
        <td>${i+1}</td>
        <td>${escapeHtml(s.user)}</td>
        <td>${Number(s.totalKc).toLocaleString("cs-CZ")} Kč</td>
        <td>+${addedMin.toLocaleString("cs-CZ")} min</td>
      </tr>
    `;
  }).join("");
}

// ---------- Money + Goals ----------
function setMoney(kc){
  state.money = Math.max(0, Number(kc) || 0);
  saveState();
  renderMoney();
  renderGoals();
}

function addMoney(kc){
  const amt = Number(kc) || 0;
  if(amt <= 0) return;
  setMoney(state.money + amt);
}

function renderMoney(){
  const moneyEl = $("money");
  if(moneyEl) moneyEl.textContent = formatMoney(state.money);

  const pct = Math.min(100, Math.round((state.money / MONEY_GOAL) * 100));
  const barEl = $("moneyProgress");
  const textEl = $("moneyProgressText");
  if(barEl) barEl.style.width = `${pct}%`;
  if(textEl) textEl.textContent = `${state.money.toLocaleString("cs-CZ")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;
}

function renderGoals(){
  const summaryEl = $("goalsSummary");
  const progEl = $("goalsProgress");
  const listEl = $("goalsList");

  if(summaryEl) summaryEl.textContent = `${state.money.toLocaleString("cs-CZ")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;
  const pct = Math.min(100, Math.round((state.money / MONEY_GOAL) * 100));
  if(progEl) progEl.style.width = `${pct}%`;

  if(!listEl) return;

  const next = GOALS.find(g => state.money < g.amount);

  listEl.innerHTML = GOALS.map(g => {
    const reached = state.money >= g.amount;
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

// ---------- Subs ----------
function renderSubs(){
  if($("t1")) $("t1").textContent = String(state.t1);
  if($("t2")) $("t2").textContent = String(state.t2);
  if($("t3")) $("t3").textContent = String(state.t3);
}

function addSecondsToTimer(seconds){
  // jen demo režim
  if (REMOTE_MODE) return;

  const addSec = Number(seconds) || 0;
  if(addSec <= 0) return;

  if(state.endsAt < now()) state.endsAt = now();
  state.endsAt += addSec * 1000;
  saveState();
}

function addMinutesToTimer(minutes){
  if (REMOTE_MODE) return;
  const addMin = Number(minutes) || 0;
  if(addMin <= 0) return;
  addSecondsToTimer(addMin * 60);
}

function handleSub(tier){
  if (REMOTE_MODE) return;

  if(tier === 1){
    state.t1 += 1;
    addMinutesToTimer(SUB_MINUTES.t1);
    pushEvent(`🎁 T1 sub (+${SUB_MINUTES.t1} min) 💗`);
  }
  if(tier === 2){
    state.t2 += 1;
    addMinutesToTimer(SUB_MINUTES.t2);
    pushEvent(`🎁 T2 sub (+${SUB_MINUTES.t2} min) 💗`);
  }
  if(tier === 3){
    state.t3 += 1;
    addMinutesToTimer(SUB_MINUTES.t3);
    pushEvent(`🎁 T3 sub (+${SUB_MINUTES.t3} min) 💗`);
  }

  saveState();
  renderSubs();
  party();
}

function handleDonation(user, amountKc){
  if (REMOTE_MODE) return;

  const amt = Number(amountKc) || 0;
  if(amt <= 0) return;

  addMoney(amt);

  const addedSec = Math.round(amt * DONATION_SECONDS_PER_KC);
  addSecondsToTimer(addedSec);

  upsertSupporter(user || "Anonym", amt, addedSec);

  const addedMinDisplay = Math.round(addedSec / 60);
  pushEvent(`💰 Donate ${amt.toLocaleString("cs-CZ")} Kč (+${addedMinDisplay} min) – děkuju! 💜`);

  party();
}

// ---------- Time render ----------
function renderTime(){
  const leftMs = state.endsAt - now();
  const liveMs = now() - state.startedAt;

  const leftEl = $("timeLeftHMS");
  const liveEl = $("timeLiveHMS");
  if(leftEl) leftEl.textContent = formatHMS(leftMs);
  if(liveEl) liveEl.textContent = formatHMS(liveMs);

  const endEl = $("endTime");
  const startEl = $("startTime");
  if(endEl) endEl.textContent = `Konec: ${new Date(state.endsAt).toLocaleString("cs-CZ")}`;
  if(startEl) startEl.textContent = `Start: ${new Date(state.startedAt).toLocaleString("cs-CZ")}`;

  const elapsed = Math.max(0, now() - state.startedAt);
  const remaining = Math.max(0, state.endsAt - now());
  const total = Math.max(1, elapsed + remaining);
  const pct = Math.round((elapsed / total) * 100);

  const barEl = $("timeProgress");
  const textEl = $("timeProgressText");
  if(barEl) barEl.style.width = `${pct}%`;
  if(textEl) textEl.textContent = `${pct}%`;
}

// ---------- Demo controls ----------
function bindDemo(){
  if (REMOTE_MODE) return;

  const wrap = document.querySelector(".demo-buttons");
  if(!wrap) return;

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if(!btn) return;

    const action = btn.getAttribute("data-action");
    if(!action) return;

    if(action === "t1") return handleSub(1);
    if(action === "t2") return handleSub(2);
    if(action === "t3") return handleSub(3);

    if(action === "donate"){
      const input = prompt("Kolik Kč? (100 Kč = 15 min)");
      if(input === null) return;
      const amt = Number(String(input).replace(",", "."));
      if(!amt || amt <= 0) return alert("Zadej číslo > 0 🙂");
      const name = prompt("Jméno podporovatele? (nebo nech prázdné)") || "Anonym";
      return handleDonation(name, amt);
    }

    if(action === "reset"){
      const ok = confirm("Resetnout demo data? (timer, money, akce, supporters)");
      if(!ok) return;
      state = defaultState();
      saveState();
      applyTheme(state.theme);
      renderAll();
      pushEvent("🧪 Reset (demo) – vše vynulováno.");
    }
  });
}

// ---------- Remote fetch ----------
async function fetchRemoteState(){
  try{
    const res = await fetch(`${API_BASE}/api/state`, { cache: "no-store" });
    if(!res.ok) return;

    const remote = await res.json();

    state.startedAt = remote.startedAt;
    state.endsAt = remote.endsAt;

    state.money = remote.money || 0;
    state.t1 = remote.t1 || 0;
    state.t2 = remote.t2 || 0;
    state.t3 = remote.t3 || 0;

    if(Array.isArray(remote.lastEvents)){
      state.events = remote.lastEvents.map(e => ({ ts: e.ts, text: e.text }));
    }

    if(Array.isArray(remote.topDonors)){
      state.supporters = remote.topDonors.map(d => ({
        user: d.user,
        totalKc: d.totalKc,
        addedSec: d.addedSec
      }));
    }

    renderAll();
  }catch{
    // ignore
  }
}

// ---------- Init ----------
function renderAll(){
  renderTime();
  renderMoney();
  renderGoals();
  renderSubs();
  renderEvents();
  renderSupporters();
}

(function init(){
  applyTheme(state.theme || "dark");
  $("themeToggle")?.addEventListener("click", toggleTheme);

  if(!REMOTE_MODE) bindDemo();

  renderAll();

  // smooth timers
  setInterval(renderTime, 250);

  if(REMOTE_MODE){
    fetchRemoteState();
    setInterval(fetchRemoteState, 2000);
  }
})();
