import { useState } from "react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { MonthPicker } from "./Dashboard";

const CATEGORIES = ["Buffalo Feed","Medicine","Labour","Equipment","Transport","Other"];

export default function Expenses({ expenses, db, viewMonth, viewYear, setViewMonth, setViewYear }) {
  const today = new Date();
  const [form, setForm] = useState({ category:"Buffalo Feed", desc:"", amount:"", date: today.toISOString().split("T")[0] });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const filtered = expenses
    .filter(e => { const d = new Date(e.date); return d.getMonth()===viewMonth && d.getFullYear()===viewYear; })
    .sort((a,b) => new Date(b.date) - new Date(a.date));
  const total = filtered.reduce((s,e) => s + Number(e.amount), 0);

  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Convert to Base64 and compress using Canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // Resize to max 800px width
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress as JPEG (0.7 quality) to keep size well under 1MB Firestore limit
        const base64String = canvas.toDataURL("image/jpeg", 0.7);
        setPhotoFile(base64String);
        setPhotoPreview(base64String);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  async function save() {
    if (!form.desc.trim() || !form.amount) { alert("Description and amount required"); return; }
    setSaving(true);
    const id = Date.now().toString();

    await setDoc(doc(db,"expenses",id), {
      category: form.category,
      desc: form.desc.trim(),
      amount: parseFloat(form.amount),
      date: form.date,
      photoURL: photoFile || null, // Base64 string directly in document
    });

    setSaving(false);
    setForm({ category:"Buffalo Feed", desc:"", amount:"", date: today.toISOString().split("T")[0] });
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowForm(false);
  }

  async function remove(id) {
    if (!window.confirm("Delete expense?")) return;
    await deleteDoc(doc(db,"expenses",id));
  }

  return (
    <div>
      <MonthPicker viewMonth={viewMonth} viewYear={viewYear} setViewMonth={setViewMonth} setViewYear={setViewYear} />

      {!showForm && (
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ खर्च जोडा / Add Expense</button>
      )}

      {showForm && (
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:14, color:"#fff" }}>New Expense</div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
              {CATEGORIES.map(c => <option key={c} style={{background:"#1a1a3e",color:"#fff"}}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Description</label><input value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} placeholder="e.g. Wheat bran for buffalos" /></div>
          <div className="form-group"><label>Amount (₹)</label><input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder="0" /></div>
          <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>

          <div className="form-group">
            <label>Photo (Optional)</label>
            {!photoPreview ? (
              <label className="photo-upload-area">
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} style={{ display:"none" }} />
                <div className="photo-upload-icon">📷</div>
                <div className="photo-upload-text">Tap to take photo or choose from gallery</div>
              </label>
            ) : (
              <div className="photo-preview-container">
                <img src={photoPreview} alt="Preview" className="photo-preview" />
                <button className="photo-remove" onClick={removePhoto}>✕</button>
              </div>
            )}
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-secondary" style={{ flex:1 }} onClick={() => { setShowForm(false); removePhoto(); }}>Cancel</button>
            <button className="btn-primary" style={{ flex:2, marginBottom:0 }} onClick={save} disabled={saving}>{saving?"Saving...":"जतन / Save"}</button>
          </div>
        </div>
      )}

      {filtered.length === 0 && !showForm && (
        <div className="empty"><div className="icon">💰</div>No expenses this month.</div>
      )}

      {filtered.map(e => (
        <div className="expense-item" key={e.id}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {e.photoURL && <img src={e.photoURL} alt="" className="expense-photo-thumb" onClick={() => window.open(e.photoURL, "_blank")} style={{cursor:"pointer"}} />}
            <div>
              <div style={{ fontWeight:600, fontSize:13, color:"#fff" }}>{e.desc}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{e.category} • {new Date(e.date).toLocaleDateString("en-IN")}</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ fontWeight:700, color:"#f87171", fontSize:14 }}>₹{Math.round(Number(e.amount)).toLocaleString("en-IN")}</div>
            <button onClick={() => remove(e.id)} style={{ background:"none", border:"none", color:"#f87171", fontSize:14, padding:4, cursor:"pointer" }}>✕</button>
          </div>
        </div>
      ))}

      {filtered.length > 0 && (
        <div className="total-bar amber">
          <span className="lbl">Total Expenses</span>
          <span className="val">₹{Math.round(total).toLocaleString("en-IN")}</span>
        </div>
      )}
    </div>
  );
}
