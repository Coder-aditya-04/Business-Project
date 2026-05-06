import { useState } from "react";
import { MonthPicker } from "./Dashboard";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Bills({ members, getMemberMonthStats, viewMonth, viewYear, setViewMonth, setViewYear, isPresent, isDateInFuture, getMaxDayForMonth }) {
  const [receiptMember, setReceiptMember] = useState(null);

  function getOrdinal(n) {
    const s = ["th","st","nd","rd"];
    const v = n % 100;
    return s[(v-20)%10] || s[v] || s[0];
  }

  const totalAll = members.reduce((s, m) => s + getMemberMonthStats(m, viewYear, viewMonth).amount, 0);

  return (
    <div>
      <MonthPicker viewMonth={viewMonth} viewYear={viewYear} setViewMonth={setViewMonth} setViewYear={setViewYear} />

      {maxDay === 0 && (
        <div className="empty">
          <div className="icon">📅</div>
          <div>This month hasn't arrived yet. No bills to show.</div>
        </div>
      )}

      {members.length === 0 && maxDay > 0 && <div className="empty"><div className="icon">🧾</div>No members yet.</div>}

      {members.map(m => {
        const s = getMemberMonthStats(m, viewYear, viewMonth);
        if (s.days === 0) return null;
        const isOpen = openId === m.id;
        return (
          <div className="bill-item" key={m.id}>
            <div className="bill-header" onClick={() => setOpenId(isOpen ? null : m.id)}>
              <div>
                <div style={{ fontWeight:600, fontSize:14, color:"#fff" }}>{m.name}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{m.slot} • {s.p}P / {s.a}A • {s.days} days</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontWeight:700, color:"#4ade80", fontSize:16 }}>{fmt(s.amount)}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{isOpen?"▲ hide":"▼ details"}</div>
              </div>
            </div>

            {isOpen && (
              <div className="bill-detail">
                <div className="stat-grid" style={{ marginBottom:12 }}>
                  <div className="stat"><div className="lbl">Present</div><div className="val" style={{ fontSize:17 }}>{s.p} days</div></div>
                  <div className="stat"><div className="lbl">Absent</div><div className="val" style={{ fontSize:17 }}>{s.a} days</div></div>
                  <div className="stat"><div className="lbl">Rate</div><div className="val" style={{ fontSize:17 }}>₹{s.rate}/L</div></div>
                  <div className="stat"><div className="lbl">Qty/session</div><div className="val" style={{ fontSize:17 }}>{m.quantity}L</div></div>
                </div>

                <table className="day-table" style={{ marginBottom:12 }}>
                  <thead><tr><th>Date</th><th>Status</th><th style={{ textAlign:"right" }}>Qty</th><th style={{ textAlign:"right" }}>₹</th></tr></thead>
                  <tbody>
                    {Array.from({ length: s.days }, (_,i) => i + s.startDay).map(d => {
                      const p = isPresent(m.id, viewYear, viewMonth, d);
                      const amt = p ? s.sess * m.quantity * s.rate : 0;
                      return (
                        <tr key={d} className={p?"":"absent"}>
                          <td>{d}</td>
                          <td>{p?"✓":"—"}</td>
                          <td style={{ textAlign:"right" }}>{p ? m.quantity*s.sess+"L" : "-"}</td>
                          <td style={{ textAlign:"right" }}>{p ? "₹"+amt : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <button onClick={() => setReceiptMember(m)} style={{ width:"100%", padding:12, background:"linear-gradient(135deg, #1D9E75, #0f7a5a)", color:"#fff", border:"none", borderRadius:12, fontWeight:600, fontSize:14, cursor:"pointer", boxShadow:"0 4px 16px rgba(29,158,117,0.3)" }}>
                  🖨️ View Receipt
                </button>
              </div>
            )}
          </div>
        );
      })}

      {members.length > 0 && maxDay > 0 && (
        <div className="total-bar">
          <span className="lbl">Month Total (till {maxDay}{getOrdinal(maxDay)})</span>
          <span className="val">{fmt(totalAll)}</span>
        </div>
      )}

      {receiptMember && (() => {
        const m = receiptMember;
        const s = getMemberMonthStats(m, viewYear, viewMonth);
        return (
          <div className="receipt-overlay">
            <div className="receipt-modal">
              <button className="receipt-close no-print" onClick={() => setReceiptMember(null)}>✕</button>
              <div className="receipt-content">
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <h2 style={{ color: "#1D9E75", margin: "0 0 4px", fontSize: 24 }}>🥛 Swami Dairy</h2>
                  <div style={{ color: "#888", fontSize: 13 }}>Official Milk Delivery Bill</div>
                </div>
                
                <div className="receipt-info">
                  <div><b>Member</b> {m.name}</div>
                  <div><b>Month</b> {MONTHS[viewMonth]} {viewYear}</div>
                  <div><b>Period</b> {s.startDay}{getOrdinal(s.startDay)} - {s.maxDay}{getOrdinal(s.maxDay)} {MONTHS[viewMonth]}</div>
                  <div><b>Slot</b> {m.slot}</div>
                  <div><b>Rate</b> ₹{s.rate}/L × {m.quantity}L/session</div>
                  {m.phone && <div><b>Phone</b> {m.phone}</div>}
                </div>

                <table className="receipt-table">
                  <thead>
                    <tr><th>Date</th><th style={{textAlign:"center"}}>Status</th><th style={{textAlign:"right"}}>Qty</th><th style={{textAlign:"right"}}>Amount</th></tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: s.days }, (_, i) => i + s.startDay).map(d => {
                      const p = isPresent(m.id, viewYear, viewMonth, d);
                      const dn = new Date(viewYear, viewMonth, d).toLocaleDateString("en-IN", { weekday:"short" });
                      const amt = p ? s.sess * m.quantity * s.rate : 0;
                      return (
                        <tr key={d} style={{ color: p ? "#1a1a1a" : "#bbb" }}>
                          <td>{d} {dn}</td>
                          <td style={{textAlign:"center"}}>{p ? "✓" : "—"}</td>
                          <td style={{textAlign:"right"}}>{p ? m.quantity*s.sess+"L" : "-"}</td>
                          <td style={{textAlign:"right"}}>{p ? "₹"+amt : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="receipt-footer">
                  <div className="receipt-total">Total: {fmt(s.amount)}</div>
                  <div className="receipt-meta">Present: {s.p} days &nbsp;|&nbsp; Absent: {s.a} days</div>
                </div>
              </div>
              <button className="btn-primary no-print" style={{ marginTop: 20 }} onClick={() => window.print()}>
                🖨️ Print / Save as PDF
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
