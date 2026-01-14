:root{
  --bg1:#0b0616;
  --bg2:#1a0f2e;
  --card1: rgba(255,255,255,0.06);
  --card2: rgba(255,255,255,0.08);
  --text:#f6eefe;
  --muted: rgba(246, 238, 254, 0.75);

  --pink:#ff9ad5;
  --pink2:#ffd6f6;
  --violet:#a970ff;

  --shadow: 0 18px 50px rgba(0,0,0,0.35);
  --radius: 22px;
  --radius2: 18px;
}

html[data-theme="light"]{
  --bg1:#f7f0ff;
  --bg2:#f2e7ff;
  --card1: rgba(255,255,255,0.72);
  --card2: rgba(255,255,255,0.82);
  --text:#2b1c3c;
  --muted: rgba(43, 28, 60, 0.72);
  --shadow: 0 18px 50px rgba(34,12,60,0.18);
}

*{ box-sizing:border-box; }

body{
  margin:0;
  font-family: "Nunito", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: var(--text);
  background:
    radial-gradient(900px 600px at 20% 10%, rgba(255,154,213,0.22), transparent 60%),
    radial-gradient(900px 600px at 80% 20%, rgba(169,112,255,0.22), transparent 60%),
    linear-gradient(135deg, var(--bg1), var(--bg2));
  min-height: 100vh;
}

.container{
  width: min(1160px, 92vw);
  margin: 22px auto 60px;
}

.top h1{
  margin:0;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.3px;
}
.subtitle{
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.muted{ color: var(--muted); }
.small{ font-size: 13px; }

.theme-toggle{
  position: fixed;
  top: 16px;
  right: 16px;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow);
  cursor: pointer;
  display:flex;
  align-items:center;
  justify-content:center;
}
.theme-toggle:hover{ transform: translateY(-1px); }
.theme-toggle:active{ transform: translateY(0px); }

.card{
  background: linear-gradient(180deg, var(--card2), var(--card1));
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: var(--shadow);
  border-radius: var(--radius);
  padding: 18px 18px;
  backdrop-filter: blur(14px);
}

.grid{
  display:grid;
  gap: 18px;
  margin-top: 18px;
}

.grid-3{
  grid-template-columns: 1fr 1.15fr 1fr;
  align-items:start;
}

@media (min-width: 1100px){
  .grid-3{
    grid-template-columns: 1fr 1.6fr 1fr; /* Goaly širší */
  }
}

@media (max-width: 980px){
  .grid-3{ grid-template-columns: 1fr; }
}

.card-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.card-title{
  display:flex;
  align-items:center;
  gap: 10px;
  font-size: 18px;
  font-weight: 800;
}

.pill{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  font-weight: 800;
  white-space: nowrap;
}

.hero{
  padding: 22px 22px;
}
.hero-head{
  display:flex;
  align-items:center;
  justify-content:center;
  flex-direction:column;
  gap: 10px;
}
.hero-title{
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 12px;
}
.hero-title h2{
  margin:0;
  font-size: 26px;
  font-weight: 900;
}
.hero-title .icon{
  font-size: 22px;
  opacity: .9;
}

.badge{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 900;
  letter-spacing: .2px;
  background: linear-gradient(90deg, rgba(255,154,213,0.95), rgba(169,112,255,0.75));
  color: #2a103d;
  box-shadow: 0 14px 34px rgba(255,154,213,0.18);
}

.timer{
  text-align:center;
  margin-top: 6px;
}
.timer-big{
  font-size: 64px;
  font-weight: 900;
  letter-spacing: 1px;
  color: var(--pink2);
  text-shadow: 0 14px 50px rgba(255,154,213,0.22);
}
@media (max-width: 600px){
  .timer-big{ font-size: 44px; }
}
.timer-sub{
  margin-top: 8px;
  color: var(--muted);
}

.progress-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-top: 16px;
  margin-bottom: 8px;
}
.progress-label{
  font-weight: 800;
  color: rgba(255,255,255,0.85);
}
html[data-theme="light"] .progress-label{
  color: rgba(43, 28, 60, 0.85);
}
.progress-right{
  color: var(--muted);
  font-weight: 800;
}

.bar{
  width:100%;
  height: 14px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 999px;
  overflow:hidden;
}
.bar-fill{
  height:100%;
  width: 0%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--pink), var(--violet));
  box-shadow: 0 14px 30px rgba(255,154,213,0.18);
  transition: width .35s ease;
}

.money{
  font-size: 40px;
  font-weight: 900;
  color: var(--violet);
  margin-top: 6px;
}

.subs{
  display:flex;
  flex-direction:column;
  gap: 12px;
}
.subs-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
  font-weight: 900;
}

.rules{
  margin-top: 16px;
  padding: 14px 14px;
  border-radius: var(--radius2);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.10);
}
.rules-title{
  font-weight: 900;
  margin-bottom: 10px;
}
.rules-list{
  list-style:none;
  padding:0;
  margin:0;
  display:grid;
  gap: 8px;
}
.rules-list li{
  display:flex;
  gap: 10px;
  align-items:center;
}

.events{
  list-style:none;
  padding:0;
  margin:0;
  display:grid;
  gap: 10px;
}
.events li{
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.10);
}

/* =======================
   GOALY – správné roztáhnutí
   ======================= */

.goals-card{
  display:flex;
  flex-direction:column;
  min-height:0;
}

.goal-progress{
  margin-top: 4px;
  margin-bottom: 8px;
}

/* Jen vertikální scroll */
.goals-list{
  list-style:none;
  padding:0;
  margin:0;
  display:grid;
  gap: 10px;

  max-height: 560px;
  overflow-y: auto;
  overflow-x: hidden; /* ❌ žádný scroll doprava */
  padding-right: 6px;
}

/* scroll bar */
.goals-list::-webkit-scrollbar { width: 10px; }
.goals-list::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 999px; }
.goals-list::-webkit-scrollbar-thumb { background: rgba(255,154,213,0.28); border-radius: 999px; }

@media (max-width: 980px){
  .goals-list{ max-height: 420px; }
}

.goal-item{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.10);
  min-width: 0; /* 🔑 pro zalamování */
}

.goal-left{
  display:flex;
  flex-direction:column;
  gap: 4px;
  min-width: 0; /* 🔑 */
}

.goal-name{
  font-weight: 900;
  letter-spacing: 0.2px;

  /* ✅ dovol zalomení */
  white-space: normal;
  word-break: break-word;
  line-height: 1.25;
}

.goal-meta{
  display:flex;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
}

.goal-amount{
  flex: 0 0 auto;
  font-weight: 900;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 154, 213, 0.14);
  border: 1px solid rgba(255, 154, 213, 0.25);
}

.goal-item.reached{
  background: rgba(255,154,213,0.12);
  border: 1px solid rgba(255,154,213,0.30);
  box-shadow: 0 10px 28px rgba(255,154,213,0.12);
}

.goal-item.next{
  border: 1px solid rgba(255, 154, 213, 0.55);
  box-shadow: 0 10px 28px rgba(255,154,213,0.18);
}

.goal-item .heart{
  filter: drop-shadow(0 6px 16px rgba(255,154,213,0.35));
}

/* =======================
   DEMO
   ======================= */

.demo-grid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 980px){
  .demo-grid{ grid-template-columns: 1fr; }
}

.btn{
  padding: 12px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.12);
  background: linear-gradient(90deg, rgba(255,154,213,0.75), rgba(169,112,255,0.45));
  color: #2a103d;
  font-weight: 900;
  cursor:pointer;
  box-shadow: 0 14px 34px rgba(255,154,213,0.14);
}
.btn:hover{ transform: translateY(-1px); }
.btn:active{ transform: translateY(0px); }

.btn-ghost{
  background: rgba(255,255,255,0.10);
  color: var(--text);
}
