// ===============================
// FUFATHON – StreamElements LIVE
// ===============================

// 🔐 STREAM ELEMENTS CONFIG
const SE_CHANNEL_ID = "5ba7c85667166d9150b406fe";
const SE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNzgzOTMyMDQ5LCJqdGkiOiI2MzViNDkzNC01N2ZjLTQ2MjUtOTNlNy01MTM1YTBjZDFhNGUiLCJjaGFubmVsIjoiNWJhN2M4NTY2NzE2NmQ5MTUwYjQwNmZlIiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiblJlWnhrSk1OeHJKZUNyUkRCcVRIZ0NhODI0aDFnWEZDRm05T09Fc1NWZW4zaWE0IiwidXNlciI6IjViYTdjODU2NjcxNjZkM2U5OGI0MDZmZCIsInVzZXJfaWQiOiIyOGE3MTNkZS00ZDAzLTQxYzQtOTliMi1hMWQ0NDY0NmY0NDkiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6IjI1MzExNjI5MSIsImNoYW5uZWxfaWQiOiI1NGQwNzRjYi1hODQ0LTRmMDctOWZhNC02NWVlNDRmNjJiZGUiLCJjcmVhdG9yX2lkIjoiZDU5MGJmYzMtNDgwYS00MTc0LWEyOWUtZWRlOTI1MjI3N2YyIn0.GFACSS_BpxitNGQFkVZQMMH9_Yc9CzvIk1AkxaJ_dug";

const HEADERS = {
  "Authorization": `Bearer ${SE_JWT}`
};

// 🎯 CÍLE
const MONEY_GOAL_KC = 20000;
const TIME_GOAL_MINUTES = 12 * 60;

// 🧠 STAV
let totalMinutes = 0;
let totalMoneyKc = 0;
let subs = { t1: 0, t2: 0, t3: 0 };

let lastTipId = null;
let lastSubId = null;

// ===============================
// UI HELPERS
// ===============================
function formatMoney(n) {
  return new Intl.NumberFormat("cs-CZ").format(n) + " Kč";
}

function addEvent(text) {
  const ul = document.getElementById("events");
  const li = document.createElement("li");
  li.textContent = text;
  ul.prepend(li);
  while (ul.children.length > 15) ul.removeChild(ul.lastChild);
}

function confettiBoom() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ff9ad5", "#ffd6f6", "#a970ff"]
  });
}

function updateUI() {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  document.getElementById("timer").innerText = `${String(h).padStart(2,"0")} h ${String(m).padStart(2,"0")} min`;
  document.getElementById("money").innerText = formatMoney(totalMoneyKc);

  document.getElementById("t1").innerText = subs.t1;
  document.getElementById("t2").innerText = subs.t2;
  document.getElementById("t3").innerText = subs.t3;

  const end = new Date(Date.now() + totalMinutes * 60000);
  document.getElementById("endTime").innerText = "Konec: " + end.toLocaleString("cs-CZ");

  document.getElementById("moneyProgress").style.width =
    Math.min((totalMoneyKc / MONEY_GOAL_KC) * 100, 100) + "%";

  document.getElementById("timeProgress").style.width =
    Math.min((totalMinutes / TIME_GOAL_MINUTES) * 100, 100) + "%";
}

// ===============================
// STREAM ELEMENTS – DONATES
// ===============================
async function fetchTips() {
  const res = await fetch(
    `https://api.streamelements.com/kappa/v2/tips/${SE_CHANNEL_ID}?limit=5`,
    { headers: HEADERS }
  );
  const tips = await res.json();

  for (const tip of tips.reverse()) {
    if (tip._id === lastTipId) return;

    const amount = Math.floor(tip.amount);
    const addMin = Math.floor(amount / 100) * 15;

    totalMoneyKc += amount;
    totalMinutes += addMin;

    addEvent(`💗 ${tip.username} – donate ${amount} Kč (+${addMin} min)`);
    updateUI();

    lastTipId = tip._id;
  }
}

// ===============================
// STREAM ELEMENTS – SUBS
// ===============================
async function fetchSubs() {
  const res = await fetch(
    `https://api.streamelements.com/kappa/v2/subscriptions/${SE_CHANNEL_ID}?limit=5`,
    { headers: HEADERS }
  );
  const subsData = await res.json();

  for (const sub of subsData.reverse()) {
    if (sub._id === lastSubId) return;

    let addMin = 0;

    if (sub.tier === "1000") { addMin = 10; subs.t1++; }
    if (sub.tier === "2000") { addMin = 15; subs.t2++; }
    if (sub.tier === "3000") { addMin = 20; subs.t3++; }

    totalMinutes += addMin;

    addEvent(`💗 ${sub.username} – T${sub.tier[0]} sub (+${addMin} min)`);
    confettiBoom();
    updateUI();

    lastSubId = sub._id;
  }
}

// ===============================
// INIT
// ===============================
addEvent("✨ FUFATHON je LIVE – čekám na první sub/donate 💜");
updateUI();

// Polling každých 15 sekund
setInterval(fetchTips, 15000);
setInterval(fetchSubs, 15000);
