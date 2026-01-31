// ============================
// FUFATHON Dashboard - CENTRALIZOVANÁ VERZE
// ============================

// KONFIGURACE
const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const GOAL_TOTAL = 200000;
const SUB_GOAL_TOTAL = 1000;

// ===== TIMER =====
let subathonEndTime = new Date("2026-02-09T14:00:00");
let isStreamActive = true;

// ===== GOALS =====
const GOALS = [
  { amount: 5000, icon: "🎬", title: "Movie night" },
  // ... vlož zbytek z původního kódu (celý tvůj seznam) ...
];

const SUB_GOALS = [
  { amount: 100, icon: "🍳", title: "Snídaně podle chatu" },
  // ... vlož zbytek z původního kódu ...
];

// ===== POMOCNÉ FUNKCE =====
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
  return `${pad2(d.getDate())}. ${pad2(d.getMonth() + 1)}. ${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// ===== TIMER FUNKCE =====
function updateTimers() {
  const now = new Date();
  
  // Aktualizuj jen čas DO KONCE z lokální proměnné
  const remainingMs = Math.max(0, subathonEndTime - now);
  const remainingSec = Math.floor(remainingMs / 1000);
  $("#timeLeft").textContent = formatHMS(remainingSec);
  $("#endsAtText").textContent = `Konec: ${formatDateTime(subathonEndTime)}`;
  
  // Progress bar času
  const totalDurationMs = subathonEndTime.getTime() - new Date("2026-02-09T14:00:00").getTime();
  const elapsedMs = now.getTime() - new Date("2026-02-09T14:00:00").getTime();
  const percent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));
  $("#timeProgress").style.width = `${percent}%`;
  $("#timePct").textContent = `${Math.round(percent)}%`;
}

// ===== HLÁŠKY O PŘIDÁNÍ ČASU =====
function showTimeAddedNotification(minutes) {
  const notification = document.createElement('div');
  notification.className = 'time-added-notification';
  notification.innerHTML = `
    <div class="notification-content">
      🎉 <strong>+${minutes} minut</strong> přidáno do subathonu!
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// ===== NAČTENÍ DAT Z WORKERU =====
async function loadDataFromWorker() {
  console.log('📊 Načítám data z Worker API...');
  
  try {
    const response = await fetch(API_STATE);
    
    if (!response.ok) {
      throw new Error(`API chyba: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Data z Workeru:', data);
    
    // 1. AKTUALIZUJ ČAS SUBATHONU
    if (data.endsAt) {
      subathonEndTime = new Date(data.endsAt);
      localStorage.setItem('subathonEndTime', data.endsAt);
    }
    
    // 2. PENÍZE
    $("#money").textContent = `${formatKc(data.money)} Kč`;
    $("#moneySmall").textContent = `${formatKc(data.money)} / ${formatKc(GOAL_TOTAL)} Kč`;
    
    // 3. SUBY
    $("#subsTotal").textContent = data.subsTotal;
    $("#subsBreak").textContent = `${data.t1} / ${data.t2} / ${data.t3}`;
    
    // 4. GOALS
    renderGoals(data.money);
    renderSubGoals(data.subsTotal);
    
    // 5. TOP DONORS
    renderTopDonors(data.topDonors || []);
    
    // 6. AKTIVITY
    renderActivityFeed(data.lastEvents || []);
    
    // 7. PROGRESS HEADERS
    $("#goalHeader").textContent = `${formatKc(data.money)} / ${formatKc(GOAL_TOTAL)} Kč`;
    $("#subGoalHeader").textContent = `${data.subsTotal} / ${SUB_GOAL_TOTAL} subs`;
    
    // 8. ULOŽ DATA JAKO ZÁLOHU
    const backup = {
      money: data.money,
      t1: data.t1,
      t2: data.t2,
      t3: data.t3,
      subsTotal: data.subsTotal,
      topDonors: data.topDonors || [],
      lastEvents: data.lastEvents || []
    };
    localStorage.setItem('fufathon_api_backup', JSON.stringify(backup));
    
  } catch (error) {
    console.error('❌ Chyba při načítání z API:', error);
    // Zkus načíst záložní data
    try {
      const backup = JSON.parse(localStorage.getItem('fufathon_api_backup') || '{}');
      if (backup.money !== undefined) {
        console.log('⚡ Používám záložní data');
        $("#money").textContent = `${formatKc(backup.money)} Kč`;
        $("#moneySmall").textContent = `${formatKc(backup.money)} / ${formatKc(GOAL_TOTAL)} Kč`;
        $("#subsTotal").textContent = backup.subsTotal || 0;
        $("#subsBreak").textContent = `${backup.t1 || 0} / ${backup.t2 || 0} / ${backup.t3 || 0}`;
        renderGoals(backup.money);
        renderSubGoals(backup.subsTotal);
        renderTopDonors(backup.topDonors || []);
        renderActivityFeed(backup.lastEvents || []);
      }
    } catch (backupError) {
      console.error('❌ Ani záložní data nefungují:', backupError);
      // Zobraz aspoň něco
      $("#money").textContent = "0 Kč";
      $("#moneySmall").textContent = "0 / 200 000 Kč";
      $("#subsTotal").textContent = "0";
      $("#subsBreak").textContent = "0 / 0 / 0";
    }
  }
}

// ===== RENDER FUNKCE (ponech z původního kódu) =====
function renderGoals(money) {
  const m = Number(money) || 0;
  const list = $("#goalList");
  if (!list) return;
  
  const goalsHTML = GOALS.map(g => {
    const done = m >= g.amount;
    return `
      <div class="goal-row ${done ? 'done' : ''}">
        <div class="goal-name">
          <span class="goal-check">${done ? '✅' : '⬜'}</span>
          <span class="goal-name-text">${g.icon} ${g.title}</span>
        </div>
        <div class="goal-amount">${formatKc(g.amount)} Kč</div>
      </div>
    `;
  }).join('');
  
  list.innerHTML = goalsHTML;
}

function renderSubGoals(subsTotal) {
  const subs = Number(subsTotal) || 0;
  const list = $("#subGoalList");
  if (!list) return;
  
  const subGoalsHTML = SUB_GOALS.map(g => {
    const done = subs >= g.amount;
    return `
      <div class="goal-row ${done ? 'done' : ''}">
        <div class="goal-name">
          <span class="goal-check">${done ? '✅' : '⬜'}</span>
          <span class="goal-name-text">${g.icon} ${g.title}</span>
        </div>
        <div class="goal-amount">${g.amount} subs</div>
      </div>
    `;
  }).join('');
  
  list.innerHTML = subGoalsHTML;
}

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
      <td colspan="4" class="mutedCell">
        Zatím žádní dárci... buď první! 💜
      </td>
    </tr>
  `;
}

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
      text = `Donate ${formatKc(event.amountKc)} Kč`;
    } else if (event.kind === "sub") {
      icon = "⭐";
      text = `Nový sub (T${event.tier})`;
    } else if (event.kind === "resub") {
      icon = "🔁";
      text = `Resub ${event.months} měs.`;
    } else if (event.kind === "gift") {
      icon = "🎁";
      text = `Darováno ${event.count}× sub`;
    }
    
    return `
      <div class="activity-item">
        <span class="activity-time">[${time}]</span>
        <span class="activity-text">${icon} ${text}</span>
      </div>
    `;
  }).join('');
  
  feed.innerHTML = feedHTML || `
    <div class="activity-item">
      <span class="activity-text">Zatím žádné akce...</span>
    </div>
  `;
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

// ===== INICIALIZACE =====
function initDashboard() {
  console.log('🚀 Dashboard inicializován (centralizovaná verze)');
  
  // 1. Téma
  initTheme();
  
  // 2. Načti data z Workeru OKAMŽITĚ
  loadDataFromWorker();
  
  // 3. Nastav interval pro obnovování dat (každých 3 sekundy)
  setInterval(loadDataFromWorker, 3000);
  
  // 4. Nastav interval pro timer (každou sekundu)
  setInterval(updateTimers, 1000);
  
  // 5. OKAMŽITÉ zobrazení timeru
  updateTimers();
}

// ===== START =====
document.addEventListener("DOMContentLoaded", initDashboard);
