// ============================
// FUFATHON Dashboard
// ============================

const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const GOAL_TOTAL = 200000;
const SE_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNzg1MTg5ODgyLCJqdGkiOiI2MzMzNDRlMS03ODkxLTQ4NjAtOTIzNC0zNmY3Y2I0YWRhMTciLCJjaGFubmVsIjoiNWJhN2M4NTY2NzE2NmQ5MTUwYjQwNmZlIiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiYU9PQ0E1UmR3V2M2OTZ0WVJzUU1pQjRjNzZ2ZUdBUFdxN0hsYXJLczhxSHZIb2xJIiwidXNlciI6IjViYTdjODU2NjcxNjZkM2U5OGI0MDZmZCIsInVzZXJfaWQiOiIyOGE3MTNkZS00ZDAzLTQxYzQtOTliMi1hMWQ0NDY0NmY0NDkiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6IjI1MzExNjI5MSIsImNoYW5uZWxfaWQiOiI1NGQwNzRjYi1hODQ0LTRmMDctOWZhNC02NWVlNDRmNjJiZGUiLCJjcmVhdG9yX2lkIjoiZDU5MGJmYzMtNDgwYS00MTc0LWEyOWUtZWRlOTI1MjI3N2YyIn0.fXn27iJsOAB7u02mFzBLEEvAY1bYBM47LhMWbhJv_yg'; // ← ZDE VLOŽ TOKEN!

const SUB_MINUTES = { 1: 10, 2: 20, 3: 30 };

const GOALS = [
  { amount: 5000, icon: "🎬", title: "Movie night" },
  { amount: 10000, icon: "😏", title: "Q&A bez cenzury" },
  { amount: 15000, icon: "👻", title: "Horror Night" },
  { amount: 20000, icon: "🍔", title: "Jídlo podle chatu" },
  { amount: 25000, icon: "🤡", title: "Kostým stream" },
  { amount: 30000, icon: "💃", title: "Just Dance" },
  { amount: 35000, icon: "🧱", title: "Lego" },
  { amount: 40000, icon: "🍣", title: "Asijská ochutnávka" },
  { amount: 45000, icon: "⛏️", title: "Minecraft SpeedRun DUO" },
  { amount: 50000, icon: "🎤", title: "Karaoke stream" },
  { amount: 55000, icon: "🔫", title: "Battle Royale Challenge" },
  { amount: 60000, icon: "🎳", title: "Bowling" },
  { amount: 65000, icon: "💦", title: "Try Not To Laugh" },
  { amount: 70000, icon: "👣", title: "Běžecký pás" },
  { amount: 75000, icon: "🍹", title: "Drunk Stream" },
  { amount: 80000, icon: "🧍‍♀️", title: "12h Stream ve stoje" },
  { amount: 85000, icon: "🕹️", title: "Split Fiction w/ Juraj" },
  { amount: 90000, icon: "🎁", title: "Mystery box opening" },
  { amount: 95000, icon: "🏆", title: "Turnaj v LoLku" },
  { amount: 100000, icon: "🎉", title: "Stodolní ve stylu" },
  { amount: 110000, icon: "🏎️", title: "Motokáry" },
  { amount: 120000, icon: "🎧", title: "ASMR stream" },
  { amount: 125000, icon: "⚡", title: "Bolt Tower" },
  { amount: 130000, icon: "🥶", title: "Otužování" },
  { amount: 140000, icon: "⛳", title: "MiniGolf" },
  { amount: 150000, icon: "🫧", title: "Vířivka" },
  { amount: 160000, icon: "🎨", title: "Zážitkové ART studio" },
  { amount: 170000, icon: "🐎", title: "Jízda na koni" },
  { amount: 180000, icon: "🏔️", title: "Výšlap na Lysou horu" },
  { amount: 190000, icon: "🖊️", title: "Tetování" },
  { amount: 200000, icon: "🏙️", title: "Víkend v Praze" },
];

// ===== UTILITIES =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function formatKc(n) {
  return Number(n || 0).toLocaleString("cs-CZ");
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
    minute: "2-digit"
  });
}

// ===== THEME TOGGLE =====
function initTheme() {
  const saved = localStorage.getItem("fuf_theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  
  const icon = saved === "light" ? "☀️" : "🌙";
  const text = saved === "light" ? "Den" : "Noc";
  
  $("#themeIcon").textContent = icon;
  $("#themeText").textContent = text;
  
  $("#themeBtn").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("fuf_theme", next);
    
    $("#themeIcon").textContent = next === "light" ? "☀️" : "🌙";
    $("#themeText").textContent = next === "light" ? "Den" : "Noc";
  });
}

// ===== GOALS RENDER =====
function renderGoals(money) {
  const m = Number(money) || 0;
  const list = $("#goalList");
  if (!list) return;
  
  const goalsHTML = GOALS.map(g => {
    const done = m >= g.amount;
    const percent = Math.min(100, (m / g.amount) * 100);
    
    return `
      <div class="goalItem ${done ? 'done' : ''}">
        <div class="goalHeader">
          <span class="goalIcon">${g.icon}</span>
          <span class="goalTitle">${g.title}</span>
          <span class="goalAmount">${formatKc(g.amount)} Kč</span>
        </div>
        <div class="goalProgress">
          <div class="goalProgressBar" style="width: ${percent}%"></div>
        </div>
        <div class="goalStatus">
          ${done ? '✅ Dokončeno' : `${formatKc(m)} / ${formatKc(g.amount)} Kč`}
        </div>
      </div>
    `;
  }).join('');
  
  list.innerHTML = goalsHTML;
  $("#goalHeader").textContent = `${formatKc(m)} / ${formatKc(GOAL_TOTAL)} Kč`;
  
  const goalPercent = Math.min(100, (m / GOAL_TOTAL) * 100);
  $("#goalBar").style.width = `${goalPercent}%`;
}

// ===== TOP DONORS =====
function renderTopDonors(donors) {
  const tbody = $("#topTableBody");
  if (!tbody) return;
  
  const donorsArray = donors || [];
  const rows = donorsArray.slice(0, 5).map((donor, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${donor.user || "Anonym"}</strong></td>
      <td>${formatKc(donor.totalKc || 0)} Kč</td>
      <td>+${Math.round((donor.addedSec || 0) / 60)} min</td>
    </tr>
  `).join('');
  
  tbody.innerHTML = rows || `
    <tr>
      <td colspan="4" class="noData">
        Zatím žádní dárci... buď první! 💜
      </td>
    </tr>
  `;
}

// ===== ACTIVITY FEED =====
function renderActivityFeed(events) {
  const feed = $("#feed");
  if (!feed) return;
  
  const eventsArray = events || [];
  const feedHTML = eventsArray.slice(0, 10).map(event => {
    const time = event.ts ? 
      new Date(event.ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" }) : 
      "--:--";
    
    let icon = "⚡";
    let text = event.text || "";
    
    if (event.kind === "donation") {
      icon = "💰";
      text = `Donate ${formatKc(event.amountKc)} Kč od ${event.sender}`;
    } else if (event.kind === "sub") {
      icon = "⭐";
      text = `${event.sender} si pořídil sub (T${event.tier})`;
    } else if (event.kind === "resub") {
      icon = "🔁";
      text = `${event.sender} resub (${event.months} měs.)`;
    } else if (event.kind === "gift") {
      icon = "🎁";
      text = `${event.sender} daroval ${event.count}× sub`;
    }
    
    return `
      <div class="activityItem">
        <span class="activityTime">[${time}]</span>
        <span class="activityIcon">${icon}</span>
        <span class="activityText">${text}</span>
        ${event.amountKc ? `<span class="activityAmount">+${Math.round((SUB_MINUTES[event.tier] || 10) * (event.count || 1))} min</span>` : ''}
      </div>
    `;
  }).join('');
  
  feed.innerHTML = feedHTML || `
    <div class="noData">
      Zatím žádné akce... čekáme na první sub nebo donate! 🎮
    </div>
  `;
}

// ===== STREAMELEMENTS SOCKET =====
function connectStreamElements() {
  if (!SE_JWT_TOKEN || SE_JWT_TOKEN === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNzg1MTg5ODgyLCJqdGkiOiI2MzMzNDRlMS03ODkxLTQ4NjAtOTIzNC0zNmY3Y2I0YWRhMTciLCJjaGFubmVsIjoiNWJhN2M4NTY2NzE2NmQ5MTUwYjQwNmZlIiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiYU9PQ0E1UmR3V2M2OTZ0WVJzUU1pQjRjNzZ2ZUdBUFdxN0hsYXJLczhxSHZIb2xJIiwidXNlciI6IjViYTdjODU2NjcxNjZkM2U5OGI0MDZmZCIsInVzZXJfaWQiOiIyOGE3MTNkZS00ZDAzLTQxYzQtOTliMi1hMWQ0NDY0NmY0NDkiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6IjI1MzExNjI5MSIsImNoYW5uZWxfaWQiOiI1NGQwNzRjYi1hODQ0LTRmMDctOWZhNC02NWVlNDRmNjJiZGUiLCJjcmVhdG9yX2lkIjoiZDU5MGJmYzMtNDgwYS00MTc0LWEyOWUtZWRlOTI1MjI3N2YyIn0.fXn27iJsOAB7u02mFzBLEEvAY1bYBM47LhMWbhJv_yg') {
    console.log('⚠️ StreamElements: JWT token není nastaven');
    return;
  }
  
  if (!window.io) {
    console.error('❌ Socket.io není načteno');
    return;
  }
  
  const socket = io('https://realtime.streamelements.com', {
    transports: ['websocket']
  });
  
  socket.on('connect', () => {
    console.log('✅ StreamElements: Připojeno');
    socket.emit('authenticate', {
      method: 'jwt',
      token: SE_JWT_TOKEN
    });
  });
  
  socket.on('event', (data) => {
    console.log('🎬 StreamElements event:', data.listener);
    // Zde můžeš přidat okamžitou aktualizaci feedu
  });
  
  socket.on('error', (err) => {
    console.error('❌ StreamElements error:', err);
  });
}

// ===== MAIN RENDER =====
function renderDashboard(data) {
  if (!data) return;
  
  // Čas
  const remaining = Number(data.timeRemainingSec) || 0;
  $("#timeLeft").textContent = formatHMS(remaining);
  
  if (data.endsAt) {
    $("#endsAtText").textContent = `Konec: ${formatDateTime(data.endsAt)}`;
  }
  
  if (data.startedAt) {
    const streamedSec = Math.floor((Date.now() - data.startedAt) / 1000);
    $("#timeRunning").textContent = formatHMS(streamedSec);
    $("#startedAtText").textContent = `Start: ${formatDateTime(data.startedAt)}`;
    
    if (data.endsAt && data.endsAt > data.startedAt) {
      const percent = Math.min(100, ((Date.now() - data.startedAt) / (data.endsAt - data.startedAt)) * 100);
      $("#timeProgress").style.width = `${percent}%`;
      $("#timePct").textContent = `${Math.round(percent)}%`;
    }
  }
  
  // Peníze
  const money = Number(data.money) || 0;
  $("#money").textContent = `${formatKc(money)} Kč`;
  $("#moneySmall").textContent = `${formatKc(money)} / ${formatKc(GOAL_TOTAL)} Kč`;
  
  const moneyPercent = Math.min(100, (money / GOAL_TOTAL) * 100);
  $("#moneyProgress").style.width = `${moneyPercent}%`;
  
  // Suby
  const t1 = Number(data.t1) || 0;
  const t2 = Number(data.t2) || 0;
  const t3 = Number(data.t3) || 0;
  const subsTotal = Number(data.subsTotal) || (t1 + t2 + t3);
  
  $("#subsTotal").textContent = subsTotal;
  $("#subsBreak").textContent = `${t1} / ${t2} / ${t3}`;
  
  // Zbytek
  renderGoals(money);
  renderTopDonors(data.topDonors);
  renderActivityFeed(data.lastEvents || data.events);
}

// ===== API FETCH =====
async function fetchDashboardData() {
  try {
    const response = await fetch(API_STATE, { cache: "no-store" });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    renderDashboard(data);
  } catch (error) {
    console.error('Chyba při načítání dat:', error);
  }
}

// ===== INITIALIZATION =====
function initDashboard() {
  initTheme();
  fetchDashboardData();
  connectStreamElements();
  
  // Auto-refresh každé 3 sekundy
  setInterval(fetchDashboardData, 3000);
  
  // Přidání CSS pro goal items a activity items
  const style = document.createElement('style');
  style.textContent = `
    .goalItem {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 16px;
      margin-bottom: 12px;
      transition: var(--transition);
    }
    
    .goalItem:hover {
      transform: translateX(4px);
      border-color: var(--violet);
    }
    
    .goalItem.done {
      background: rgba(110, 231, 255, 0.1);
      border-color: rgba(110, 231, 255, 0.3);
    }
    
    .goalHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    
    .goalIcon {
      font-size: 20px;
    }
    
    .goalTitle {
      flex: 1;
      margin: 0 12px;
      font-weight: 700;
      font-size: 15px;
    }
    
    .goalAmount {
      font-weight: 800;
      color: var(--violet);
    }
    
    .goalProgress {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    
    .goalProgressBar {
      height: 100%;
      background: linear-gradient(90deg, var(--pink), var(--violet));
      border-radius: 3px;
      transition: width 0.8s ease;
    }
    
    .goalStatus {
      font-size: 13px;
      color: var(--muted);
      font-weight: 600;
    }
    
    .activityItem {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      transition: var(--transition);
    }
    
    .activityItem:hover {
      transform: translateX(4px);
      background: rgba(255, 255, 255, 0.08);
    }
    
    .activityTime {
      color: var(--muted);
      font-weight: 700;
      font-size: 13px;
      min-width: 60px;
    }
    
    .activityIcon {
      font-size: 18px;
    }
    
    .activityText {
      flex: 1;
      font-weight: 600;
      font-size: 14px;
    }
    
    .activityAmount {
      font-weight: 800;
      color: var(--violet);
      font-size: 13px;
    }
    
    .noData {
      text-align: center;
      padding: 40px;
      color: var(--muted);
      font-size: 15px;
      font-weight: 600;
    }
    
    .donorsTable td:first-child {
      font-weight: 900;
      color: var(--violet);
    }
    
    .donorsTable td:nth-child(3) {
      font-weight: 800;
      color: var(--violet);
    }
    
    .donorsTable td:last-child {
      color: var(--cyan);
      font-weight: 700;
    }
  `;
  document.head.appendChild(style);
}

// ===== START =====
document.addEventListener("DOMContentLoaded", initDashboard);
