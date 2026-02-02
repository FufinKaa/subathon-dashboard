/* FUFATHON Dashboard — FINÁLNÍ STABILNÍ VERZE */
/* ČTE JEN /api/state — ŽÁDNÉ SOCKETY, ŽÁDNÉ SE LOGIKY */

(function () {
  const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
  const START_AT = new Date("2026-02-09T14:00:00+01:00");
  const POLL_MS = 10000;
  const THEME_KEY = "fufathon-theme";

  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, "0");
  const formatKc = (n) => Number(n || 0).toLocaleString("cs-CZ");

  /* ===== TÉMA ===== */
  function initTheme() {
    const btn = $("themeBtn");
    if (!btn) return;

    const root = document.documentElement;
    const icon = $("themeIcon");
    const text = $("themeText");

    function apply(t) {
      root.setAttribute("data-theme", t);
      if (icon) icon.textContent = t === "light" ? "☀️" : "🌙";
      if (text) text.textContent = t === "light" ? "Den" : "Noc";
    }

    const saved = localStorage.getItem(THEME_KEY) || "dark";
    apply(saved);

    btn.onclick = () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      apply(next);
    };
  }

  /* ===== TIMER ===== */
  function initTimer() {
    const el = $("timeRunning");
    if (!el) return;

    setInterval(() => {
      const diff = Date.now() - START_AT;
      if (diff < 0) return;
      const s = Math.floor(diff / 1000);
      el.textContent =
        `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`;
    }, 1000);
  }

  /* ===== API ===== */
  async function fetchState() {
    const r = await fetch(API_STATE, { cache: "no-store" });
    if (!r.ok) throw new Error("API fail");
    return r.json();
  }

  /* ===== RENDER ===== */
  function renderTopDonators(list = []) {
    const body = $("topTableBody");
    if (!body) return;
    body.innerHTML = "";

    if (!list.length) {
      body.innerHTML = `<tr><td colspan="4">Zatím žádné donaty ✨</td></tr>`;
      return;
    }

    list.slice(0, 5).forEach((d, i) => {
      body.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>${d.name}</td>
          <td>${formatKc(d.amount)} Kč</td>
          <td>${Math.round(d.amount * 0.15)} min</td>
        </tr>`;
    });
  }

  function renderFeed(events = []) {
    const feed = $("feed");
    if (!feed) return;
    feed.innerHTML = "";

    if (!events.length) {
      feed.innerHTML = `<div class="activity-item muted">Zatím nic nového…</div>`;
      return;
    }

    events.slice(0, 10).forEach(ev => {
      const t = new Date(ev.ts).toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit"
      });
      feed.innerHTML += `
        <div class="activity-item">
          <span class="activity-time">${t}</span>
          <span class="activity-text">${ev.text}</span>
        </div>`;
    });
  }

  /* ===== UPDATE ===== */
  async function updateDashboard() {
    try {
      const state = await fetchState();

      $("money").textContent = `${formatKc(state.money)} Kč`;
      $("moneySmall").textContent = `${formatKc(state.money)} / 200 000 Kč`;
      $("subsTotal").textContent = state.subs;
      $("goalHeader").textContent = `${formatKc(state.money)} / 200 000 Kč`;
      $("subGoalHeader").textContent = `${state.subs} / 1000 subs`;

      renderTopDonators(state.topDonors);
      renderFeed(state.recentEvents);

      console.log("✅ DASHBOARD OK", state);
    } catch (e) {
      console.error("❌ DASHBOARD ERROR", e);
    }
  }

  /* ===== START ===== */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initTimer();
    updateDashboard();
    setInterval(updateDashboard, POLL_MS);
  });
})();
