import { useState } from "react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

export default function Settings({ rates, db }) {
  const [newRate, setNewRate] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);

  async function addRate() {
    if (!newRate || !newLabel) return;
    setSaving(true);
    const id = Date.now().toString();
    await setDoc(doc(db, "rates", id), {
      amount: Number(newRate),
      label: newLabel
    });
    setNewRate("");
    setNewLabel("");
    setSaving(false);
  }

  async function removeRate(id) {
    if (!window.confirm("Remove this rate package?")) return;
    await deleteDoc(doc(db, "rates", id));
  }

  return (
    <div>
      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 14, color: "#fff" }}>Milk Rates / Packages</div>
        
        {rates.length === 0 && (
          <div className="empty" style={{ padding: "20px" }}>No custom rates defined.</div>
        )}

        {rates.map(r => (
          <div className="member-item" key={r.id}>
            <div>
              <div className="member-name">₹{r.amount}/L</div>
              <div className="member-meta">{r.label}</div>
            </div>
            <button className="btn-danger" style={{ padding: "6px 10px", fontSize: 12, height: "30px" }} onClick={() => removeRate(r.id)}>🗑</button>
          </div>
        ))}

        <div style={{ marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
          <div style={{ fontSize: 13, marginBottom: 10, color: "#fff", fontWeight: 600 }}>Add New Rate Package</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <input type="number" placeholder="₹ Rate" value={newRate} onChange={e => setNewRate(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
              <input placeholder="Label (e.g. Standard)" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
            </div>
          </div>
          <button className="btn-primary" style={{ marginBottom: 0 }} onClick={addRate} disabled={saving || !newRate || !newLabel}>
            {saving ? "Saving..." : "+ Add Package"}
          </button>
        </div>
      </div>
    </div>
  );
}
