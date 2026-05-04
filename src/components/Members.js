import { useState } from "react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

const SLOTS = ["Morning", "Evening", "Both"];
const MILK_TYPES = [["premium","₹70/L Premium"], ["regular","₹60/L Regular"]];

const DEMO_MEMBERS = [
  { name:"Vakil Kaka",    phone:"", slot:"Morning", milkType:"premium", quantity:1   },
  { name:"D.R.",          phone:"", slot:"Morning", milkType:"regular",  quantity:3   },
  { name:"Kulkarni Maushi",phone:"",slot:"Morning", milkType:"premium", quantity:1   },
  { name:"Sadashan Kaka", phone:"", slot:"Morning", milkType:"premium", quantity:1   },
  { name:"Dipala",        phone:"", slot:"Morning", milkType:"premium", quantity:1   },
  { name:"Yogesh Crane",  phone:"", slot:"Morning", milkType:"premium", quantity:1   },
  { name:"Bakari Kaka",   phone:"", slot:"Morning", milkType:"regular",  quantity:1.5 },
  { name:"Prashant Kaka", phone:"", slot:"Morning", milkType:"regular",  quantity:1   },
  { name:"Nana Bapu",     phone:"", slot:"Evening", milkType:"regular",  quantity:1.5 },
  { name:"Dipu Dada",     phone:"", slot:"Evening", milkType:"regular",  quantity:1.5 },
  { name:"Gaurav",        phone:"", slot:"Evening", milkType:"regular",  quantity:1.25},
  { name:"Babi 2",        phone:"", slot:"Evening", milkType:"regular",  quantity:1   },
  { name:"Dev",           phone:"", slot:"Evening", milkType:"regular",  quantity:1.5 },
  { name:"Raju",          phone:"", slot:"Evening", milkType:"regular",  quantity:1.5 },
  { name:"Surender",      phone:"", slot:"Evening", milkType:"regular",  quantity:1   },
  { name:"Bus Maushi",    phone:"", slot:"Evening", milkType:"regular",  quantity:0.5 },
  { name:"Pooja Didi",    phone:"", slot:"Evening", milkType:"regular",  quantity:1   },
  { name:"Nagesh",        phone:"", slot:"Evening", milkType:"premium",  quantity:1   },
  { name:"Nani",          phone:"", slot:"Evening", milkType:"regular",  quantity:2   },
  { name:"Munna Kaka",    phone:"", slot:"Evening", milkType:"regular",  quantity:1   },
  { name:"Bala Sir 1",    phone:"", slot:"Evening", milkType:"premium",  quantity:1   },
  { name:"Bala Sir 2",    phone:"", slot:"Evening", milkType:"regular",  quantity:2.5 },
  { name:"Mayur",         phone:"", slot:"Evening", milkType:"regular",  quantity:0.5 },
];

export default function Members({ members, db }) {
  const empty = { name:"", phone:"", slot:"Morning", milkType:"premium", quantity:1 };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.name.trim()) { alert("Name is required"); return; }
    setSaving(true);
    const id = editingId || Date.now().toString();
    await setDoc(doc(db, "members", id), {
      name: form.name.trim(),
      phone: form.phone.trim(),
      slot: form.slot,
      milkType: form.milkType,
      quantity: parseFloat(form.quantity) || 1,
    });
    setSaving(false);
    cancel();
  }

  async function remove(id) {
    if (!window.confirm("Delete this member?")) return;
    await deleteDoc(doc(db, "members", id));
  }

  function edit(m) {
    setForm({ name:m.name, phone:m.phone||"", slot:m.slot, milkType:m.milkType, quantity:m.quantity });
    setEditingId(m.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior:"smooth" });
  }

  function cancel() { setForm(empty); setEditingId(null); setShowForm(false); }

  async function loadDemo() {
    if (!window.confirm(`Load ${DEMO_MEMBERS.length} members from notebook? This will add them to Firebase.`)) return;
    for (const m of DEMO_MEMBERS) {
      await setDoc(doc(db, "members", Date.now().toString() + Math.random()), m);
      await new Promise(r => setTimeout(r, 50));
    }
  }

  return (
    <div>
      {!showForm && (
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(empty); }}>
          + नवीन सदस्य / Add Member
        </button>
      )}

      {showForm && (
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:14, color:"#fff" }}>{editingId ? "Edit Member" : "New Member"}</div>

          <div className="form-group"><label>नाव / Name</label><input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Member name" /></div>
          <div className="form-group"><label>फोन / Phone</label><input value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} type="tel" placeholder="Phone number" /></div>

          <div className="form-group">
            <label>वेळ / Slot</label>
            <div className="pill-group">
              {SLOTS.map(s => <button key={s} className={`pill${form.slot===s?" active":""}`} onClick={()=>setForm(p=>({...p,slot:s}))}>{s}</button>)}
            </div>
          </div>

          <div className="form-group">
            <label>दूध / Milk Type</label>
            <div className="pill-group">
              {MILK_TYPES.map(([v,lbl]) => <button key={v} className={`pill amber${form.milkType===v?" active":""}`} onClick={()=>setForm(p=>({...p,milkType:v}))}>{lbl}</button>)}
            </div>
          </div>

          <div className="form-group"><label>प्रति वेळ (L) / Qty per session</label><input type="number" min="0.5" max="20" step="0.5" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} /></div>

          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-secondary" style={{ flex:1 }} onClick={cancel}>Cancel</button>
            <button className="btn-primary" style={{ flex:2, marginBottom:0 }} onClick={save} disabled={saving}>{saving?"Saving...":"जतन / Save"}</button>
          </div>
        </div>
      )}

      {members.length === 0 && !showForm && (
        <div className="empty">
          <div className="icon">🥛</div>
          <div>No members yet.</div>
          <button style={{ marginTop:12, padding:"8px 16px", background:"linear-gradient(135deg, #1D9E75, #0f7a5a)", color:"#fff", border:"none", borderRadius:10, fontSize:12 }} onClick={loadDemo}>
            Load from Notebook
          </button>
        </div>
      )}

      {members.map(m => (
        <div className="member-item" key={m.id}>
          <div>
            <div className="member-name">{m.name}</div>
            <div className="member-meta">
              <span className={`badge badge-${m.slot.toLowerCase()}`}>{m.slot}</span>
              {" "}
              <span className={`badge badge-${m.milkType}`}>{m.milkType==="premium"?"₹70/L":"₹60/L"}</span>
              {" "}{m.quantity}L/session
            </div>
            {m.phone && <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{m.phone}</div>}
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button className="btn-secondary" style={{ padding:"6px 10px", fontSize:12 }} onClick={() => edit(m)}>✏️</button>
            <button className="btn-danger"    style={{ padding:"6px 10px", fontSize:12 }} onClick={() => remove(m.id)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}
