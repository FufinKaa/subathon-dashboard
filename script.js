/* FUFATHON Dashboard — script.js (v6)
   - Theme toggle (light/dark)
   - Timer "jak dlouho streamuji" (od 09. 02. 2026 14:00 CET)
   - Načítání stavu z Cloudflare Worker API (money, subs, top donors, poslední akce)
   - Render donate goals + subgoals do TABULEK + automatické odškrtávání ✅
*/

(function () {
  // ========= CONFIG =========
  const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
  const START_AT = new Date("2026-02-09T14:00:00+01:00"); // CET
  const THEME_KEY = "fufathon-theme";
  const POLL_MS = 5000;

  // pravidlo pro tabulku top donors: 100 Kč = 15 min
  const MINUTES_PER_CZK = 15 / 100;

  // ========= DATA =========
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
    { amount: 65000, icon: "😂", title: "Try Not To Laugh" },
    { amount: 70000, icon: "👣", title: "Běžecký pás" },
    { amount: 75000, icon: "🍹", title: "Drunk Stream" },
    { amount: 80000, icon: "🧍‍♀️", title: "12h stream ve stoje" },
    { amount: 85000, icon: "🕹️", title: "Split Fiction w/ Juraj" },
    { amount: 90000, icon: "🎁", title: "Mystery box opening" },
    { amount: 95000, icon: "🏆", title: "Turnaj v LoLku" },
    { amount: 100000, icon: "🎉", title: "Stodolní ve stylu" },
    { amount: 110000, icon: "🏎️", title: "Motokáry" },
    { amount: 120000, icon: "🎧", title: "ASMR stream" },
    { amount: 130000, icon: "🥶", title: "Otužování" },
    { amount: 150000, icon: "🫧", title: "Vířivka" },
    { amount: 200000, icon: "🏙️", title: "Víkend v Praze" }
  ];

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
    { amount: 1000, icon: "🏎️", title: "Jízda ve sporťáku" }
  ];

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

  function minutesToPretty(mins) {
    const totalSec = Math.round((mins || 0) * 60);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    if (h > 0) return `${h}h ${pad(m)}m`;
    if (m > 0) return `${m}m`;
    return `${totalSec}s`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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

  // ========= TIMER (running) =========
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

  // ========= GOALS TABLES =========
  function renderGoals(currentMoney) {
    const body = $("goalTableBody");
    if (!body) return;
    body.innerHTML = "";

    for (const g of GOALS) {
      const done = (currentMoney || 0) >= g.amount;
      const tr = document.createElement("tr");
      tr.className = "goal-tr" + (done ? " done" : "");
      tr.innerHTML = `
        <td class="goal-check">${done ? "✅" : "⬜"}</td>
        <td class="goal-name">${g.icon} ${escapeHtml(g.title)}</td>
        <td class="goal-threshold">${formatKc(g.amount)} Kč</td>
      `;
      body.appendChild(tr);
    }
  }

  function renderSubGoals(currentSubs) {
    const body = $("subGoalTableBody");
    if (!body) return;
    body.innerHTML = "";

    for (const g of SUB_GOALS) {
      const done = (currentSubs || 0) >= g.amount;
      const tr = document.createElement("tr");
      tr.className = "goal-tr" + (done ? " done" : "");
      tr.innerHTML = `
        <td class="goal-check">${done ? "✅" : "⬜"}</td>
        <td class="goal-name">${g.icon} ${escapeHtml(g.title)}</td>
        <td class="goal-threshold">${g.amount} subs</td>
      `;
      body.appendChild(tr);
    }
  }

  // ========= TOP DONATORS =========
  function renderTopDonators(list) {
    const body = $("topTableBody");
    if (!body) return;

    body.innerHTML = "";
    const rows = (Array.isArray(list) ? list : []).slice(0, 5);

    rows.forEach((d, idx) => {
      const name = d.name || d.username || d.user || "Anonymous";
      const amount = Math.round(Number(d.amount || d.total || 0));
      const addedMinutes = amount * MINUTES_PER_CZK;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(name)}</td>
        <td>${formatKc(amount)} Kč</td>
        <td>${minutesToPretty(addedMinutes)}</td>
      `;
      body.appendChild(tr);
    });

    if (rows.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" class="muted">Zatím žádné donaty ✨</td>`;
      body.appendChild(tr);
    }
  }

  // ========= FEED =========
  function renderFeed(items) {
    const box = $("feed");
    if (!box) return;

    box.innerHTML = "";
    const list = (Array.isArray(items) ? items : []).slice(0, 10);

    list.forEach((it) => {
      const div = document.createElement("div");
      div.className = "activity-item";
      div.textContent = it.text || it.title || it.message || String(it);
      box.appendChild(div);
    });

    if (list.length === 0) {
      const div = document.createElement("div");
      div.className = "activity-item muted";
      div.textContent = "Zatím nic nového…";
      box.appendChild(div);
    }
  }

  // ========= STATE FETCH =========
  async function fetchStateAndRender() {
    try {
      const res = await fetch(API_STATE, { cache: "no-store" });
      if (!res.ok) throw new Error("API " + res.status);
      const data = await res.json();

      const money = Number(data.money ?? data.totalMoney ?? 0);
      const subs = Number(data.subs ?? data.subTotal ?? 0);

      // Basic counters
      if ($("money")) $("money").textContent = `${formatKc(money)} Kč`;
      if ($("moneySmall")) $("moneySmall").textContent = `${formatKc(money)} Kč`;
      if ($("subsTotal")) $("subsTotal").textContent = String(subs);

      // Render goals (THIS WAS THE MISSING PART)
      renderGoals(money);
      renderSubGoals(subs);

      // Other boxes
      renderTopDonators(data.topDonators || data.topDonations || data.top || []);
      renderFeed(data.feed || data.lastEvents || data.events || []);
    } catch (e) {
      // tichý fallback
      console.warn("State fetch failed:", e);
    }
  }

  // ========= INIT =========
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initRunningTimer();

    // Render something immediately (even without API)
    renderGoals(0);
    renderSubGoals(0);
    renderTopDonators([]);
    renderFeed([]);

    fetchStateAndRender();
    setInterval(fetchStateAndRender, POLL_MS);
  });
})();
