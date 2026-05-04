import { useState } from "react";
import { MonthPicker } from "./Dashboard";

const MSHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Attendance({ members, isPresent, toggleAttendance, viewMonth, viewYear, setViewMonth, setViewYear, today, isDateInFuture, getMaxDayForMonth }) {
  const totalDays = new Date(viewYear, viewMonth+1, 0).getDate();
  const maxDay = getMaxDayForMonth(viewYear, viewMonth);
  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const [selDay, setSelDay] = useState(today.getDate());

  const clampedDay = Math.min(selDay, maxDay || totalDays);
  const dayName = new Date(viewYear, viewMonth, clampedDay).toLocaleDateString("en-IN", { weekday:"long" });

  return (
    <div>
      <MonthPicker viewMonth={viewMonth} viewYear={viewYear} setViewMonth={setViewMonth} setViewYear={setViewYear} />

      <div className="day-scroll">
        <div className="day-inner">
          {Array.from({ length: totalDays }, (_, i) => i+1).map(d => {
            const isFuture = isDateInFuture(viewYear, viewMonth, d);
            const isT = isCurrentMonth && d === today.getDate();
            const isSel = d === clampedDay;
            return (
              <button
                key={d}
                className={`day-btn${isT?" is-today":""}${isSel&&!isT?" is-selected":""}${isFuture?" is-future":""}`}
                onClick={() => setSelDay(d)}
                disabled={isFuture}
              >{d}</button>
            );
          })}
        </div>
      </div>

      {maxDay === 0 ? (
        <div className="empty">
          <div className="icon">📅</div>
          <div>This month hasn't arrived yet.</div>
        </div>
      ) : (
        <>
          <div style={{ fontWeight:600, fontSize:13, marginBottom:10, color:"rgba(255,255,255,0.7)" }}>
            {dayName}, {clampedDay} {MSHORT[viewMonth]} — {members.length} members
          </div>

          {members.length === 0 && <div className="empty"><div className="icon">👥</div>No members. Add from Members tab.</div>}

          {members.map(m => {
            const present = isPresent(m.id, viewYear, viewMonth, clampedDay);
            return (
              <div key={m.id} className={`att-row ${present ? "present" : "absent"}`} onClick={() => toggleAttendance(m.id, viewYear, viewMonth, clampedDay)}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color:"#fff" }}>{m.name}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{m.slot} • {m.quantity}L</div>
                </div>
                <div className={`check-circle ${present ? "check-yes" : "check-no"}`}>{present ? "✓" : "✗"}</div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
