import { useState } from "react";
import { MonthPicker } from "./Dashboard";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Bills({ members, getMemberMonthStats, viewMonth, viewYear, setViewMonth, setViewYear, isPresent, isDateInFuture, getMaxDayForMonth }) {
  const [openId, setOpenId] = useState(null);
  const fmt = n => "₹" + Math.round(n).toLocaleString("en-IN");
  const maxDay = getMaxDayForMonth(viewYear, viewMonth);

  function printBill(m) {
    const s = getMemberMonthStats(m, viewYear, viewMonth);
    if (s.days === 0) return;
    let rows = "";
    for (let d = 1; d <= s.days; d++) {
      const p = isPresent(m.id, viewYear, viewMonth, d);
      const dn = new Date(viewYear, viewMonth, d).toLocaleDateString("en-IN", { weekday:"short" });
      const amt = p ? s.sess * m.quantity * s.rate : 0;
      rows += `<tr style="${p?"":"color:#bbb"}"><td>${d} ${dn}</td><td style="text-align:center">${p?"✓":"—"}</td><td style="text-align:right">${p ? m.quantity*s.sess+"L" : "-"}</td><td style="text-align:right">${p?"₹"+amt:"-"}</td></tr>`;
    }
    const win = window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Bill - ${m.name} - ${MONTHS[viewMonth]} ${viewYear}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body{font-family:-apple-system,sans-serif;padding:20px;max-width:440px;margin:auto;color:#1a1a1a}
        h2{color:#1D9E75;margin:0 0 2px;font-size:22px}
        .sub{color:#888;font-size:12px;margin-bottom:18px}
        .info{background:#f5f7f5;border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:13px;line-height:1.8}
        .info b{color:#888;display:inline-block;min-width:85px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{text-align:left;padding:7px 8px;background:#E1F5EE;color:#085041;font-weight:600}
        td{padding:6px 8px;border-top:1px solid #eee}
        .footer{margin-top:16px;text-align:right}
        .total{font-size:20px;font-weight:700;color:#1D9E75}
        .meta{font-size:11px;color:#888;margin-top:4px}
        .print-btn{display:block;width:100%;margin-top:20px;padding:14px;background:#1D9E75;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer}
        @media print{.print-btn{display:none}}
      </style></head><body>
      <h2>🥛 Swami Dairy</h2>
      <div class="sub">Official Milk Delivery Bill</div>
      <div class="info">
        <div><b>Member</b>${m.name}</div>
        <div><b>Month</b>${MONTHS[viewMonth]} ${viewYear}</div>
        <div><b>Period</b>1st - ${s.days}${getOrdinal(s.days)} ${MONTHS[viewMonth]}</div>
        <div><b>Slot</b>${m.slot}</div>
        <div><b>Rate</b>₹${s.rate}/L × ${m.quantity}L/session</div>
        ${m.phone ? `<div><b>Phone</b>${m.phone}</div>` : ""}
      </div>
      <table>
        <thead><tr><th>Date</th><th style="text-align:center">Status</th><th style="text-align:right">Qty</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">
        <div class="total">Total: ₹${Math.round(s.amount).toLocaleString("en-IN")}</div>
        <div class="meta">Present: ${s.p} days &nbsp;|&nbsp; Absent: ${s.a} days</div>
      </div>
      <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </body></html>`);
    win.document.close();
  }

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
                    {Array.from({ length: s.days }, (_,i) => i+1).map(d => {
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

                <button onClick={() => printBill(m)} style={{ width:"100%", padding:12, background:"linear-gradient(135deg, #1D9E75, #0f7a5a)", color:"#fff", border:"none", borderRadius:12, fontWeight:600, fontSize:14, cursor:"pointer", boxShadow:"0 4px 16px rgba(29,158,117,0.3)" }}>
                  🖨️ Print Bill / Download PDF
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
    </div>
  );
}
