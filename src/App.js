import { useState, useEffect, useMemo } from "react";
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, getDoc, getDocs
} from "firebase/firestore";
import { db } from "./firebase";
import Dashboard from "./components/Dashboard";
import Members from "./components/Members";
import Attendance from "./components/Attendance";
import Bills from "./components/Bills";
import Expenses from "./components/Expenses";
import Settings from "./components/Settings";
import "./App.css";

const NAV = [
  { id: "dashboard",  label: "Dashboard",  icon: "📊" },
  { id: "members",    label: "Members",    icon: "👥" },
  { id: "attendance", label: "Attendance", icon: "✅" },
  { id: "bills",      label: "Bills",      icon: "🧾" },
  { id: "expenses",   label: "Expenses",   icon: "💸" },
  { id: "settings",   label: "Settings",   icon: "⚙️" },
];

export default function App() {
  const today = new Date();
  const [tab, setTab] = useState("dashboard");
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear,  setViewYear]  = useState(today.getFullYear());

  const [members,    setMembers]    = useState([]);
  const [attendance, setAttendance] = useState({});
  const [expenses,   setExpenses]   = useState([]);
  const [rates,      setRates]      = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, "members"), snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubAtt = onSnapshot(collection(db, "attendance"), snap => {
      const map = {};
      snap.docs.forEach(d => { map[d.id] = d.data().present; });
      setAttendance(map);
    });
    const unsubExp = onSnapshot(collection(db, "expenses"), snap => {
      setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const unsubRates = onSnapshot(collection(db, "rates"), snap => {
      setRates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubMembers(); unsubAtt(); unsubExp(); unsubRates(); };
  }, []);

  function attKey(memberId, y, m, d) {
    return `${memberId}_${y}_${m}_${d}`;
  }

  function isDateInFuture(y, m, d) {
    const checkDate = new Date(y, m, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate > todayStart;
  }

  function isPresent(memberId, y, m, d) {
    if (isDateInFuture(y, m, d)) return false;
    const k = attKey(memberId, y, m, d);
    return attendance[k] !== false;
  }

  async function toggleAttendance(memberId, y, m, d) {
    if (isDateInFuture(y, m, d)) return;
    const k = attKey(memberId, y, m, d);
    const cur = attendance[k] !== false;
    await setDoc(doc(db, "attendance", k), { present: !cur });
  }

  function getMaxDayForMonth(y, m) {
    const now = new Date();
    if (m === now.getMonth() && y === now.getFullYear()) {
      return now.getDate();
    }
    if (new Date(y, m, 1) > new Date(now.getFullYear(), now.getMonth(), 1)) {
      return 0;
    }
    return new Date(y, m + 1, 0).getDate();
  }

  function getMemberMonthStats(member, y, mo) {
    const maxDay = getMaxDayForMonth(y, mo);
    if (maxDay === 0) return { p: 0, a: 0, amount: 0, days: 0, rate: 0, sess: 0, startDay: 1, maxDay: 0 };
    
    let startDay = 1;
    if (member.startDate) {
      const sDate = new Date(member.startDate);
      if (sDate.getFullYear() === y && sDate.getMonth() === mo) {
        startDay = sDate.getDate();
      } else if (sDate.getFullYear() > y || (sDate.getFullYear() === y && sDate.getMonth() > mo)) {
        return { p: 0, a: 0, amount: 0, days: 0, rate: 0, sess: 0, startDay: 1, maxDay: 0 };
      }
    }

    let p = 0, a = 0;
    for (let d = startDay; d <= maxDay; d++) {
      isPresent(member.id, y, mo, d) ? p++ : a++;
    }
    const sess = member.slot === "Both" ? 2 : 1;
    let rate = member.rate;
    if (!rate) rate = member.milkType === "premium" ? 70 : 60;
    
    return { p, a, amount: p * sess * member.quantity * rate, days: maxDay - startDay + 1, rate, sess, startDay, maxDay };
  }

  const monthExpenses = useMemo(() =>
    expenses
      .filter(e => { const d = new Date(e.date); return d.getMonth() === viewMonth && d.getFullYear() === viewYear; })
      .reduce((s, e) => s + Number(e.amount), 0),
    [expenses, viewMonth, viewYear]
  );

  const monthRevenue = useMemo(() =>
    members.reduce((s, m) => s + getMemberMonthStats(m, viewYear, viewMonth).amount, 0),
    [members, attendance, viewMonth, viewYear]
  );

  const todayRevenue = useMemo(() => {
    const d = today.getDate(), m = today.getMonth(), y = today.getFullYear();
    return members.reduce((s, mem) => {
      if (!isPresent(mem.id, y, m, d)) return s;
      if (mem.startDate) {
        const sDate = new Date(mem.startDate);
        if (new Date(y, m, d) < new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate())) return s;
      }
      const sess = mem.slot === "Both" ? 2 : 1;
      let rate = mem.rate;
      if (!rate) rate = mem.milkType === "premium" ? 70 : 60;
      return s + sess * mem.quantity * rate;
    }, 0);
  }, [members, attendance]);

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-logo">🥛</div>
      <div className="loading-text">Swami Dairy</div>
      <div className="loading-sub">Connecting to database...</div>
    </div>
  );

  const sharedProps = { viewMonth, viewYear, setViewMonth, setViewYear };

  return (
    <div className="app">
      <div className="bubbles-container">
        {Array.from({ length: 12 }, (_, i) => <div key={i} className="bubble" />)}
      </div>

      <header className="app-header">
        <div className="app-brand">🥛 SWAMI DAIRY</div>
        <div className="app-title">दूध व्यवसाय Manager</div>
        <div className="app-date">
          {today.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
        </div>
      </header>

      <main className="app-main">
        {tab === "dashboard"  && <Dashboard  {...sharedProps} members={members} monthRevenue={monthRevenue} todayRevenue={todayRevenue} monthExpenses={monthExpenses} getMemberMonthStats={getMemberMonthStats} today={today} />}
        {tab === "members"    && <Members    members={members} db={db} rates={rates} />}
        {tab === "attendance" && <Attendance {...sharedProps} members={members} isPresent={isPresent} toggleAttendance={toggleAttendance} today={today} isDateInFuture={isDateInFuture} getMaxDayForMonth={getMaxDayForMonth} />}
        {tab === "bills"      && <Bills      {...sharedProps} members={members} getMemberMonthStats={getMemberMonthStats} isPresent={isPresent} isDateInFuture={isDateInFuture} getMaxDayForMonth={getMaxDayForMonth} />}
        {tab === "expenses"   && <Expenses   {...sharedProps} expenses={expenses} db={db} />}
        {tab === "settings"   && <Settings   rates={rates} db={db} />}
      </main>

      <nav className="app-nav">
        {NAV.map(n => (
          <button key={n.id} className={`nav-btn${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
