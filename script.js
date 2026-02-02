/* FUFATHON Dashboard — script.js (v7) - StreamElements API */

(function () {
  // ========= STREAMELEMENTS API CONFIG =========
  // TVÉ ÚDAJE Z STREAMELEMENTS
  const SE_CHANNEL_ID = "5ba7c85667166d9150b406fe";
  const SE_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNzg1NTg4Mjg5LCJqdGkiOiJhZDIwODg2NC1kZGUxLTRhZWQtODg4ZS0yMDE5Y2U1ZjdkNjgiLCJjaGFubmVsIjoiNWJhN2M4NTY2NzE2NmQ5MTUwYjQwNmZlIiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiYU9PQ0E1UmR3V2M2OTZ0WVJzUU1pQjRjNzZ2ZUdBUFdxN0hsYXJLczhxSHZIb2xJIiwidXNlciI6IjViYTdjODU2NjcxNjZkM2U5OGI0MDZmZCIsInVzZXJfaWQiOiIyOGE3MTNkZS00ZDAzLTQxYzQtOTliMi1hMWQ0NDY0NmY0NDkiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6IjI1MzExNjI5MSIsImNoYW5uZWxfaWQiOiI1NGQwNzRjYi1hODQ0LTRmMDctOWZhNC02NWVlNDRmNjJiZGUiLCJjcmVhdG9yX2lkIjoiZDU5MGJmYzMtNDgwYS00MTc0LWEyOWUtZWRlOTI1MjI3N2YyIn0.bMUjojoEDi2-TQR7ql_ANxFwOnW-qPsIu7scuvjnPrk";
  
  const SE_API_BASE = "https://api.streamelements.com/kappa/v2";
  const START_AT = new Date("2026-02-09T14:00:00+01:00");
  const THEME_KEY = "fufathon-theme";
  const POLL_MS = 10000; // Každých 10 sekund

  // ========= HELPERS =========
  const $ = (id) => document.getElementById(id);

  function pad(n) { return String(n).padStart(2, "0"); }
  function formatKc(n) { return Number(n || 0).toLocaleString("cs-CZ"); }

  function msToClock(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return days > 0 ? `${days}d ${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(h)}:${pad(m)}:${pad(sec)}`;
  }

  // ========= THEME =========
  function initTheme() {
    const btn = $("themeBtn");
    const icon = $("themeIcon");
    const text = $("themeText");
    if (!btn) return;

    const root = document.documentElement;

    function apply(theme) {
      root.setAttribute("data-theme", theme);
      if (icon) icon.textContent = theme === "light" ? "☀️" : "🌙";
      if (text) text.textContent = theme === "light" ? "Den" : "Noc";
    }

    const saved = localStorage.getItem(THEME_KEY);
    apply(saved === "light" ? "light" : "dark");

    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      apply(next);
    });
  }

  // ========= TIMER =========
  function initRunningTimer() {
    const el = $("timeRunning");
    const info = $("startedAtText");
    if (!el) return;

    const tick = () => {
      el.textContent = msToClock(Date.now() - START_AT.getTime());
      if (info) info.textContent = "Start: 09. 02. 2026 14:00";
    };

    tick();
    setInterval(tick, 1000);
  }

  // ========= STREAMELEMENTS API =========
  async function fetchStreamElementsData() {
    try {
      console.log("Načítám data z StreamElements API...");
      
      // 1. Načíst tips (donations)
      const tipsRes = await fetch(`${SE_API_BASE}/channels/${SE_CHANNEL_ID}/tips?limit=100`, {
        headers: { 
          'Authorization': `Bearer ${SE_JWT_TOKEN}`,
          'Accept': 'application/json'
        }
      });

      // 2. Načíst subscribers
      const subsRes = await fetch(`${SE_API_BASE}/channels/${SE_CHANNEL_ID}/subscribers?limit=100`, {
        headers: { 
          'Authorization': `Bearer ${SE_JWT_TOKEN}`,
          'Accept': 'application/json'
        }
      });

      let money = 0;
      let subs = 0;
      let topDonators = [];
      let recentActivity = [];

      // Zpracovat donations
      if (tipsRes.ok) {
        const tipsData = await tipsRes.json();
        console.log("Donations data:", tipsData);
        
        if (tipsData && Array.isArray(tipsData)) {
          // Celková suma donací
          money = tipsData.reduce((sum, tip) => sum + (tip.amount || 0), 0);
          
          // Top 5 donátorů (seskupit podle uživatele)
          const donorMap = new Map();
          tipsData.forEach(tip => {
            const name = tip.user?.username || tip.user?.displayName || tip.username || "Anonymous";
            const amount = tip.amount || 0;
            
            if (donorMap.has(name)) {
              donorMap.set(name, donorMap.get(name) + amount);
            } else {
              donorMap.set(name, amount);
            }
            
            // Přidat do recent activity
            const time = new Date(tip.createdAt || Date.now()).toLocaleTimeString('cs-CZ', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            recentActivity.push({
              text: `${name} donatnul ${amount.toFixed(2)} Kč`,
              time: time,
              timestamp: new Date(tip.createdAt || Date.now()).getTime()
            });
          });
          
          // Seřadit top donátory
          topDonators = Array.from(donorMap.entries())
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
        }
      } else {
        console.error("Chyba při načítání donations:", tipsRes.status);
      }

      // Zpracovat suby
      if (subsRes.ok) {
        const subsData = await subsRes.json();
        console.log("Subscribers data:", subsData);
        
        if (subsData && Array.isArray(subsData)) {
          subs = subsData.length;
          
          // Přidat suby do recent activity
          subsData.slice(0, 10).forEach(sub => {
            const name = sub.user?.username || sub.user?.displayName || sub.username || "Anonymous";
            const tier = sub.tier || 1;
            const time = new Date(sub.createdAt || Date.now()).toLocaleTimeString('cs-CZ', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            recentActivity.push({
              text: `Nová T${tier} sub od ${name}`,
              time: time,
              timestamp: new Date(sub.createdAt || Date.now()).getTime()
            });
          });
        }
      } else {
        console.error("Chyba při načítání subscribers:", subsRes.status);
      }

      // Seřadit recent activity podle času (nejnovější nahoře)
      recentActivity.sort((a, b) => b.timestamp - a.timestamp);
      
      console.log("Načtená data:", { money, subs, topDonators, recentActivity });
      
      return {
        money: Math.round(money),
        subs: subs,
        topDonators: topDonators,
        recentActivity: recentActivity.slice(0, 10) // Pouze 10 nejnovějších
      };

    } catch (error) {
      console.error("Chyba při načítání z StreamElements:", error);
      return null;
    }
  }

  // ========= RENDER FUNCTIONS =========
  function renderGoals(currentMoney) {
    const body = $("goalTableBody");
    if (!body) return;
    
    const DONATE_GOALS = [
      { amount: 20000, icon: "🎬", title: "Movie night" },
      { amount: 40000, icon: "😏", title: "Q&A bez cenzury" },
      { amount: 60000, icon: "👻", title: "Horror Night" },
      { amount: 80000, icon: "🍔", title: "Jídlo podle chatu" },
      { amount: 100000, icon: "🤡", title: "Kostým stream" },
      { amount: 120000, icon: "💃", title: "Just Dance" },
      { amount: 140000, icon: "🧱", title: "Lego" },
      { amount: 160000, icon: "🍣", title: "Asijská ochutnávka" },
      { amount: 180000, icon: "🏙️", title: "Víkend v Praze" },
      { amount: 200000, icon: "🏎️", title: "Jízda ve sporťáku" }
    ];
    
    body.innerHTML = "";
    
    DONATE_GOALS.forEach(goal => {
      const done = currentMoney >= goal.amount;
      const tr = document.createElement("tr");
      tr.className = "goal-tr" + (done ? " done" : "");
      tr.innerHTML = `
        <td class="goal-check">${done ? "✅" : "⬜"}</td>
        <td class="goal-name">${goal.icon} ${goal.title}</td>
        <td class="goal-threshold">${formatKc(goal.amount)} Kč</td>
      `;
      body.appendChild(tr);
    });
  }

  function renderSubGoals(currentSubs) {
    const body = $("subGoalTableBody");
    if (!body) return;
    
    const SUB_GOALS = [
      { amount: 100, icon: "🍳", title: "Snídaně podle chatu" },
      { amount: 200, icon: "💄", title: "Make-up challenge" },
      { amount: 300, icon: "👗", title: "Outfit vybíráte vy" },
      { amount: 400, icon: "⚖️", title: "Kontrola váhy od teď" },
      { amount: 500, icon: "⚔️", title: "1v1 s chatem" },
      { amount: 600, icon: "🎮", title: "Vybíráte hru na hlavní blok dne" },
      { amount: 700, icon: "👑", title: "Rozhoduje chat o dni" },
      { amount: 800, icon: "✨", title: "Něco extra (800 subs)" },
      { amount: 900, icon: "🏆", title: "Turnaj (chat vybere)" },
      { amount: 1000, icon: "🎉", title: "Mega party stream" }
    ];
    
    body.innerHTML = "";
    
    SUB_GOALS.forEach(goal => {
      const done = currentSubs >= goal.amount;
      const tr = document.createElement("tr");
      tr.className = "goal-tr" + (done ? " done" : "");
      tr.innerHTML = `
        <td class="goal-check">${done ? "✅" : "⬜"}</td>
        <td class="goal-name">${goal.icon} ${goal.title}</td>
        <td class="goal-threshold">${goal.amount} subs</td>
      `;
      body.appendChild(tr);
    });
  }

  function renderTopDonators(list) {
    const body = $("topTableBody");
    if (!body) return;

    body.innerHTML = "";
    
    if (!list || list.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" class="muted">Zatím žádné donaty ✨</td>`;
      body.appendChild(tr);
      return;
    }

    list.forEach((donor, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${donor.name}</td>
        <td>${formatKc(donor.amount)} Kč</td>
        <td>${Math.round(donor.amount * 0.15)} min</td>
      `;
      body.appendChild(tr);
    });
  }

  function renderRecentActivity(activities) {
    const feed = $("feed");
    if (!feed) return;

    feed.innerHTML = "";
    
    if (!activities || activities.length === 0) {
      const div = document.createElement("div");
      div.className = "activity-item muted";
      div.textContent = "Zatím nic nového…";
      feed.appendChild(div);
      return;
    }

    activities.forEach(activity => {
      const div = document.createElement("div");
      div.className = "activity-item";
      div.innerHTML = `
        <span class="activity-time">${activity.time}</span>
        <span class="activity-text">${activity.text}</span>
      `;
      feed.appendChild(div);
    });
  }

  // ========= MAIN UPDATE FUNCTION =========
  async function updateDashboard() {
    console.log("Aktualizuji dashboard...");
    
    const data = await fetchStreamElementsData();
    
    if (data) {
      console.log("Data načtena:", data);
      
      // Aktualizovat statistiky
      if ($("money")) $("money").textContent = `${formatKc(data.money)} Kč`;
      if ($("moneySmall")) $("moneySmall").textContent = `${formatKc(data.money)} / 200 000 Kč`;
      if ($("subsTotal")) $("subsTotal").textContent = data.subs;
      if ($("subGoalHeader")) $("subGoalHeader").textContent = `${data.subs} / 1000 subs`;
      if ($("goalHeader")) $("goalHeader").textContent = `${formatKc(data.money)} / 200 000 Kč`;

      // Renderovat goals
      renderGoals(data.money);
      renderSubGoals(data.subs);
      
      // Renderovat top donátory a aktivitu
      renderTopDonators(data.topDonators);
      renderRecentActivity(data.recentActivity);
    } else {
      console.log("Nepodařilo se načíst data z API");
      // Fallback
      if ($("money")) $("money").textContent = "0 Kč";
      if ($("subsTotal")) $("subsTotal").textContent = "0";
      renderGoals(0);
      renderSubGoals(0);
      renderTopDonators([]);
      renderRecentActivity([]);
    }
  }

  // ========= INITIALIZATION =========
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard inicializace...");
    
    // Init theme
    initTheme();
    
    // Init timer
    initRunningTimer();
    
    // Načíst data hned
    updateDashboard();
    
    // Pak každých 10 sekund
    setInterval(updateDashboard, POLL_MS);
    
    // Pro debugging - zobrazit data v konzoli
    window.debugSE = fetchStreamElementsData;
  });

})();
