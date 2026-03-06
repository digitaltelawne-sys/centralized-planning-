import { useState } from "react";

const T = {
  card: "#ffffff",
  border: "#e2e8f0",
  inputBg: "#f8fafc",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  cardAlt: "#f1f5f9",
  brand: "#1e40af"
};

export default function NewOrderModal({ onClose, onSave, CATEGORIES }) {
  const [form, setForm] = useState({
    mode: "PO",
    customer: "",
    poDate: new Date().toISOString().split("T")[0],
    type: "Domestic",
    region: "West",
    project: "",
    site: "",
    productType: "",
    category: "IDT-RPT-STD-3W",
    rating: "",
    voltage: "",
    paymentTerms: "",
    ldAppl: false,
    custDOD: "",
    desiredDOD: "",
    soNo: "",
    unitRate: "",
    plant: "",
    status: "New",
  });

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  const inputStyle = {
    width: "100%",
    background: T.inputBg,
    border: `1px solid ${T.border}`,
    color: T.textPrimary,
    padding: "9px 11px",
    borderRadius: 8,
    fontSize: 13,
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.4)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        width: 720,
        maxHeight: "88vh",
        overflow: "auto",
        padding: 30
      }}>
        <h2>Create New Order</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          <input
            placeholder="Customer Name"
            value={form.customer}
            onChange={(e) => set("customer", e.target.value)}
            style={inputStyle}
          />

          <input
            type="date"
            value={form.poDate}
            onChange={(e) => set("poDate", e.target.value)}
            style={inputStyle}
          />

          <select
            value={form.mode}
            onChange={(e) => set("mode", e.target.value)}
            style={inputStyle}
          >
            <option>PO</option>
            <option>LOI</option>
            <option>FOA</option>
          </select>

          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            style={inputStyle}
          >
            <option>New</option>
            <option>WIP</option>
            <option>Delayed</option>
          </select>

          <input
            placeholder="Rating"
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Voltage"
            value={form.voltage}
            onChange={(e) => set("voltage", e.target.value)}
            style={inputStyle}
          />

          <input
            type="date"
            value={form.custDOD}
            onChange={(e) => set("custDOD", e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Plant"
            value={form.plant}
            onChange={(e) => set("plant", e.target.value)}
            style={inputStyle}
          />

          <div style={{ gridColumn: "1/-1" }}>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              style={inputStyle}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={() => {
              if (form.customer && form.poDate && form.custDOD) {
                onSave(form);
              }
            }}
          >
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
}