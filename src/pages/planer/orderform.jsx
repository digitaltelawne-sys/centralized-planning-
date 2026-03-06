import { useState } from "react";

const CATEGORIES = [
  { id: "IDT-RPT-STD-3W", name: "IDT Repeat Standard 3 winding" },
  { id: "IDT-RPT-STD-5W", name: "IDT Repeat Standard 5 winding" },
  { id: "IDT-Non-Std-5W-NTPC Proto", name: "IDT Non standard 5W NTPC Proto Model" },
  { id: "EXP-DT Non RPT", name: "Export DT Non Repeat (Changes from available reference)" },
  { id: "DOM-DT Non RPT", name: "Domestic DT Non Repeat (Changes from available reference)" },
  { id: "EXP-DT RPT", name: "Export DT Repeat" },
  { id: "DOM-DT RPT", name: "Domestic DT Repeat" },
  { id: "EXP-DT Non-Std", name: "Export DT Non Standard Completely New Fresh Design" },
  { id: "DOM-DT Non-Std", name: "Domestic DT Non Standard Completely New Fresh Design" },
  { id: "IDT-Non-Std-3W-Pvt Proto", name: "IDT Non standard 3W Proto Model" },
  { id: "IDT-Non-Std-5W-Pvt Proto", name: "IDT Non standard 5W Proto Model" },
  { id: "PMT-RPT", name: "PMT Repeat" },
  { id: "PMT-Non. RPT", name: "PMT Non Repeat (Changes from available reference)" },
  { id: "PMT-Non. STD", name: "PMT Non Standard Completely New Fresh Design" },
  { id: "SST-RPT", name: "SST Repeat (Substation Transformer)" },
  { id: "SST-Non. RPT", name: "SST Non Repeat (Changes from available reference)" },
  { id: "SST-Non. STD", name: "SST Non Standard Completely New Fresh Design" },
  { id: "EXP-PT (20 MVA-33kV)", name: "Export PT Upto 20 MVA-33kV" },
  { id: "DOM-PT (20 MVA-33kV)", name: "Domestic PT Upto 20 MVA-33kV" },
  { id: "EXP-EHV (20 MVA-66kV)", name: "Export EHV Upto 20 MVA-66kV" },
  { id: "DOM-EHV (20 MVA-66kV)", name: "Domestic EHV Upto 20 MVA-66kV" },
  { id: "EXP-EHV (50 MVA-132kV)", name: "Export EHV Upto 50 MVA-132kV" },
  { id: "DOM-EHV (50 MVA-132kV)", name: "Domestic EHV Upto 50 MVA-132kV" },
  { id: "EXP-Dry-VPI-Std", name: "Export Drytype VPI Standard Reference available with changes" },
  { id: "DOM-Dry-VPI-Std", name: "Domestic Drytype VPI Standard Reference available with changes" },
  { id: "EXP-Dry-VPI-Non Std", name: "Export Drytype VPI Non Standard Completely New Fresh Design" },
  { id: "DOM-Dry-VPI-Non Std", name: "Domestic Drytype VPI Non Standard Completely New Fresh Design" },
  { id: "EXP-Dry-CRT-Std", name: "Export Drytype CRT Standard Reference available with changes" },
  { id: "DOM-Dry-CRT-Std", name: "Domestic Drytype CRT Standard Reference available with changes" },
  { id: "EXP-Dry-CRT-Non Std", name: "Export Drytype CRT Non Standard Completely New Fresh Design" },
  { id: "DOM-Dry-CRT-Non Std", name: "Domestic Drytype CRT Non Standard Completely New Fresh Design" },
  { id: "DOM-CSS-Dry-VPI-Std", name: "Domestic Drytype CSS VPI Standard Reference available with changes" },
  { id: "DOM-CSS-Dry-VPI-Non Std", name: "Domestic Drytype CSS VPI Non Standard Completely New Fresh Design" },
  { id: "DOM-CSS-Dry-CRT-Std", name: "Domestic Drytype CSS CRT Standard Reference available with changes" },
  { id: "DOM-CSS-Dry-CRT-Non Std", name: "Domestic Drytype CSS CRT Non Standard Completely New Fresh Design" },
];

const STEP_LABELS = ["Order Info", "Product", "Commercial", "Review"];
const STEP_DESCS  = ["Basic details", "Transformer specs", "Dates & finance", "Confirm & save"];

export default function NewOrderModal({ onClose, onSave }) {
  const [step, setStep]           = useState(1);
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm]           = useState({
    mode: "PO", customer: "", poDate: new Date().toISOString().split("T")[0],
    type: "Domestic", region: "West", project: "", site: "",
    productType: "", category: "IDT-RPT-STD-3W", rating: "",
    voltage: "", paymentTerms: "", ldAppl: false, custDOD: "",
    desiredDOD: "", soNo: "", unitRate: "", plant: "", status: "New",
  });

  const setField = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(e => ({ ...e, [k]: null }));
  };

  const handleNext = () => {
    const e = {};
    if (step === 1) {
      if (!form.customer.trim()) e.customer = "Required";
      // if (!form.soNo.trim())     e.soNo     = "Required";
      if (!form.poDate)          e.poDate   = "Required";
    }
    if (step === 3 && !form.custDOD) e.custDOD = "Required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setStep(s => Math.min(s + 1, 4));
  };

  const handleSave = () => {
    const e = {};
    if (!form.customer.trim()) e.customer = "Required";
    if (!form.poDate)          e.poDate   = "Required";
    if (!form.custDOD)         e.custDOD  = "Required";
    // if (!form.soNo.trim())     e.soNo     = "Required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitted(true);
    setTimeout(() => { onSave({ ...form }); onClose(); }, 1400);
  };

  const selectedCat = CATEGORIES.find(c => c.id === form.category);

  // ----- Light theme style objects -----
  const modalStyle = {
    width: 820, maxHeight: "92vh",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    position: "relative",
  };

  const overlayStyle = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    animation: "fadeIn .2s ease",
  };

  const stepItemStyle = (i) => ({
    flex: 1, display: "flex", alignItems: "center", gap: 8,
    padding: "10px 12px", borderRadius: 10,
    cursor: i < step ? "pointer" : "default",
    border: `1px solid ${step === i ? "#2563eb" : step > i ? "#16a34a" : "#e5e7eb"}`,
    background: step === i ? "#eff6ff" : step > i ? "#f0fdf4" : "#fff",
    transition: "all .2s",
  });

  const stepNumStyle = (i) => ({
    width: 26, height: 26, borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 600,
    background: step === i ? "#2563eb" : step > i ? "#16a34a" : "#f3f4f6",
    color: step >= i ? "#fff" : "#6b7280",
    border: "none",
  });

  const inputStyle = (err) => ({
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: `1px solid ${err ? "#ef4444" : "#d1d5db"}`,
    fontSize: 14, outline: "none",
    boxSizing: "border-box", transition: "border .2s",
  });

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: "#374151",
    marginBottom: 4, display: "block",
  };

  const sectionLabelStyle = {
    fontSize: 13, fontWeight: 700, color: "#111827",
    marginBottom: 12, marginTop: 20,
    borderBottom: "1px solid #e5e7eb", paddingBottom: 4,
  };

  const errMsgStyle = { fontSize: 11, color: "#ef4444", marginTop: 2 };

  // ----- Render -----
  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .slide { animation: slide .25s ease; }
        input:focus, select:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important; }
      `}</style>

      <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={modalStyle}>
          {/* Header */}
          <div style={{ padding: "24px 28px 8px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111" }}>Create New Order</h2>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>✕</button>
          </div>

          {/* Step indicators */}
          {!submitted && (
            <div style={{ display: "flex", gap: 6, padding: "16px 28px 0", background: "#f9fafb" }}>
              {STEP_LABELS.map((lbl, idx) => {
                const i = idx + 1;
                return (
                  <div key={i} style={stepItemStyle(i)} onClick={() => i < step && setStep(i)}>
                    <div style={stepNumStyle(i)}>{step > i ? "✓" : i}</div>
                    <div style={{ fontSize: 13, fontWeight: step === i ? 700 : 500, color: step === i ? "#2563eb" : step > i ? "#16a34a" : "#6b7280" }}>
                      {lbl}<br /><span style={{ fontSize: 11, color: "#9ca3af" }}>{STEP_DESCS[idx]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: "#fff" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 48, color: "#16a34a" }}>✓</div>
                <h3 style={{ margin: "16px 0 8px", fontSize: 20 }}>Order Created!</h3>
                <p style={{ color: "#6b7280" }}>Plan dates are being auto‑generated…</p>
              </div>
            ) : (
              <div className="slide" key={step}>
                {/* Step 1 */}
                {step === 1 && (
                  <>
                    <div style={sectionLabelStyle}>Order Identification</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Mode</label>
                        <select style={inputStyle()} value={form.mode} onChange={e => setField("mode", e.target.value)}>
                          {["PO", "LOI", "FOA"].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                       <div>
                        <label style={labelStyle}>PO Date *</label>
                        <input type="date" style={inputStyle(errors.poDate)} value={form.poDate} onChange={e => setField("poDate", e.target.value)} />
                        {errors.poDate && <div style={errMsgStyle}>{errors.poDate}</div>}
                      </div>
                       <div>
                        <label style={labelStyle}>Region</label>
                        <select style={inputStyle()} value={form.region} onChange={e => setField("region", e.target.value)}>
                          {["West", "North", "South", "East"].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label style={labelStyle}>Status</label>
                        <select style={inputStyle()} value={form.status} onChange={e => setField("status", e.target.value)}>
                          {["New", "WIP", "Delayed"].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={sectionLabelStyle}>Customer Details</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Customer Name *</label>
                        <input style={inputStyle(errors.customer)} value={form.customer} onChange={e => setField("customer", e.target.value)} />
                        {errors.customer && <div style={errMsgStyle}>{errors.customer}</div>}
                      </div>
                      <div>
                        <label style={labelStyle}>Order Type</label>
                        <select style={inputStyle()} value={form.type} onChange={e => setField("type", e.target.value)}>
                          {["Domestic", "Export"].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      {/* <div>
                        <label style={labelStyle}>SO Number *</label>
                        <input style={inputStyle(errors.soNo)} value={form.soNo} onChange={e => setField("soNo", e.target.value)} />
                        {errors.soNo && <div style={errMsgStyle}>{errors.soNo}</div>}
                      </div> */}
                      {/* <div>
                        <label style={labelStyle}>PO Date *</label>
                        <input type="date" style={inputStyle(errors.poDate)} value={form.poDate} onChange={e => setField("poDate", e.target.value)} />
                        {errors.poDate && <div style={errMsgStyle}>{errors.poDate}</div>}
                      </div> */}
                      {/* <div>
                        <label style={labelStyle}>Region</label>
                        <select style={inputStyle()} value={form.region} onChange={e => setField("region", e.target.value)}>
                          {["West", "North", "South", "East"].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div> */}
                      <div>
                        <label style={labelStyle}>Project Name</label>
                        <input style={inputStyle()} value={form.project} onChange={e => setField("project", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Project Site</label>
                        <input style={inputStyle()} value={form.site} onChange={e => setField("site", e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <>
                    <div style={sectionLabelStyle}>Transformer Specifications</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Rating (KVA)</label>
                        <input style={inputStyle()} value={form.rating} onChange={e => setField("rating", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Voltage Ratio</label>
                        <input style={inputStyle()} value={form.voltage} onChange={e => setField("voltage", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Product Type</label>
                        <input style={inputStyle()} value={form.productType} onChange={e => setField("productType", e.target.value)} />
                      </div>
                    </div>

                    <div style={sectionLabelStyle}>Product Category</div>
                    <div>
                      <select style={inputStyle()} value={form.category} onChange={e => setField("category", e.target.value)}>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id} – {c.name}</option>)}
                      </select>
                      {selectedCat && (
                        <div style={{ marginTop: 8, fontSize: 13, color: "#2563eb", background: "#eff6ff", padding: "8px", borderRadius: 6 }}>
                          Selected: {selectedCat.name}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <>
                    <div style={sectionLabelStyle}>Delivery Dates</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Customer DOD *</label>
                        <input type="date" style={inputStyle(errors.custDOD)} value={form.custDOD} onChange={e => setField("custDOD", e.target.value)} />
                        {errors.custDOD && <div style={errMsgStyle}>{errors.custDOD}</div>}
                      </div>
                      <div>
                        <label style={labelStyle}>Desired DOD</label>
                        <input type="date" style={inputStyle()} value={form.desiredDOD} onChange={e => setField("desiredDOD", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Plant</label>
                        <input style={inputStyle()} value={form.plant} onChange={e => setField("plant", e.target.value)} />
                      </div>
                    </div>

                    <div style={sectionLabelStyle}>Financial Details</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Unit Rate (₹)</label>
                        <input type="number" style={inputStyle()} value={form.unitRate} onChange={e => setField("unitRate", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Payment Terms</label>
                        <input style={inputStyle()} value={form.paymentTerms} onChange={e => setField("paymentTerms", e.target.value)} />
                      </div>
                    </div>

                    <div style={sectionLabelStyle}>Conditions</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="checkbox" id="ld" checked={form.ldAppl} onChange={e => setField("ldAppl", e.target.checked)} />
                      <label htmlFor="ld" style={{ fontSize: 14 }}>LD Applicable</label>
                    </div>
                  </>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <>
                    <div style={sectionLabelStyle}>Order Summary</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        ["Customer", form.customer, true],
                        ["SO Number", form.soNo],
                        ["Mode", form.mode],
                        ["Status", form.status],
                        ["PO Date", form.poDate],
                        ["Customer DOD", form.custDOD, true],
                        ["Type", form.type],
                        ["Region", form.region],
                        ["Project", form.project || "—"],
                        ["Site", form.site || "—"],
                        ["Category", form.category],
                        ["Rating", form.rating ? `${form.rating} KVA` : "—"],
                        ["Voltage", form.voltage || "—"],
                        ["Plant", form.plant || "—"],
                        ["Unit Rate", form.unitRate ? `₹${Number(form.unitRate).toLocaleString()}` : "—"],
                        ["LD Applicable", form.ldAppl ? "Yes" : "No"],
                      ].map(([k, v, hl]) => (
                        <div key={k} style={{ padding: "10px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{k}</div>
                          <div style={{ fontSize: 14, fontWeight: hl ? 700 : 500, color: hl ? "#2563eb" : "#111" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 16, padding: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, color: "#166534" }}>
                      ✅ Ready to create – plan dates will be auto‑generated from {form.poDate}.
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!submitted && (
            <div style={{ padding: "16px 28px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb" }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ height: 6, borderRadius: 3, width: i === step ? 24 : 6, background: i <= step ? "#2563eb" : "#d1d5db", transition: "all .2s" }} />
                ))}
                <span style={{ fontSize: 13, color: "#6b7280", marginLeft: 8 }}>Step {step} of 4</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {step > 1 && (
                  <button onClick={() => setStep(s => s - 1)} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 14 }}>
                    ← Back
                  </button>
                )}
                <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 14 }}>
                  Cancel
                </button>
                {step < 4 ? (
                  <button onClick={handleNext} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                    Continue →
                  </button>
                ) : (
                  <button onClick={handleSave} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                    Create Order
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}