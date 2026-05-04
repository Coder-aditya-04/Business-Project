import { useState } from "react";

const MSHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function MonthPicker({ viewMonth, viewYear, setViewMonth, setViewYear }) {
  const now = new Date();
  const isFuture = new Date(viewYear, viewMonth, 1) > new Date(now.getFullYear(), now.getMonth(), 1);

  function prev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); }
    else setViewMonth(m => m-1);
  }
  function next() {
    if (isFuture) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); }
    else setViewMonth(m => m+1);
  }
  return (
    <div className="month-nav">
      <button onClick={prev}>‹</button>
      <span>{MSHORT[viewMonth]} {viewYear}</span>
      <button onClick={next} style={{ opacity: isFuture ? 0.3 : 1 }}>›</button>
    </div>
  );
}

export { MonthPicker };

export default function Dashboard({ members, monthRevenue, todayRevenue, monthExpenses, viewMonth, viewYear, setViewMonth, setViewYear, getMemberMonthStats, today }) {
  const morningCount = members.filter(m => m.slot === "Morning" || m.slot === "Both").length;
  const eveningCount = members.filter(m => m.slot === "Evening" || m.slot === "Both").length;
  const netProfit = monthRevenue - monthExpenses;
  const fmt = n => "₹" + Math.round(n).toLocaleString("en-IN");

  const sorted = [...members].sort((a,b) => getMemberMonthStats(b, viewYear, viewMonth).amount - getMemberMonthStats(a, viewYear, viewMonth).amount);

  return (
    <div>
      <MonthPicker viewMonth={viewMonth} viewYear={viewYear} setViewMonth={setViewMonth} setViewYear={setViewYear} />

      <div className="stat-grid">
        <div className="stat green"><div className="lbl">Month Revenue</div><div className="val">{fmt(monthRevenue)}</div></div>
        <div className="stat"><div className="lbl">Today's Earning</div><div className="val">{fmt(todayRevenue)}</div></div>
        <div className="stat amber"><div className="lbl">Month Expenses</div><div className="val">{fmt(monthExpenses)}</div></div>
        <div className={`stat ${netProfit >= 0 ? "green" : "red"}`}><div className="lbl">Net Profit</div><div className="val">{fmt(netProfit)}</div></div>
      </div>

      <div className="card">
        <div style={{ fontWeight:600, fontSize:13, marginBottom:10, color:"#fff" }}>Members Overview</div>
        <div style={{ display:"flex", gap:16, fontSize:12, color:"rgba(255,255,255,0.5)" }}>
          <span>🌅 Morning: <b style={{color:"#60a5fa"}}>{morningCount}</b></span>
          <span>🌆 Evening: <b style={{color:"#fbbf24"}}>{eveningCount}</b></span>
          <span>Total: <b style={{color:"#4ade80"}}>{members.length}</b></span>
        </div>
      </div>

      {members.length > 0 && (
        <div className="card">
          <div style={{ fontWeight:600, fontSize:13, marginBottom:10, color:"#fff" }}>Top Members This Month</div>
          {sorted.slice(0, 6).map(m => {
            const s = getMemberMonthStats(m, viewYear, viewMonth);
            return (
              <div key={m.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderTop:"0.5px solid rgba(255,255,255,0.08)", fontSize:12 }}>
                <div>
                  <div style={{ fontWeight:600, color:"#fff" }}>{m.name}</div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10 }}>{m.slot} • {m.quantity}L</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:600, color:"#4ade80" }}>{fmt(s.amount)}</div>
                  <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>{s.p}P / {s.a}A</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
