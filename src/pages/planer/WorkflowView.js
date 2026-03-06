// WorkflowView.js
import React, { useState } from "react";
import { STAGES, DEPT_COLORS, T } from "../../constant";
import { daysDiff } from "../../utils";

export default function WorkflowView({ order, onBack, myDepts, role, today, onUpdateActual, onUpdatePlan }) {
  const [editingActual, setEditingActual] = useState(null);
  const [actualDateVal, setActualDateVal] = useState("");
  const [editingPlan, setEditingPlan] = useState(null);
  const [planDateVal, setPlanDateVal] = useState("");

  const canEdit = (dept) => role === "admin" || myDepts.includes(dept);

  const completedCount = STAGES.filter(s => order.actuals[s.id]).length;
  const progress = Math.round((completedCount / STAGES.length) * 100);
  const rfdPlan = order.plan.RFD;
  const isLate = rfdPlan && order.custDOD && rfdPlan > order.custDOD;

  return (
    <div>
      <button onClick={onBack}
        style={{ background: T.card, border: `1px solid ${T.border}`, color: T.textSecondary, padding: "5px 15px", borderRadius: 8, cursor: "pointer", marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
        ← Back
      </button>

      {/* Order Header */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{order.customer}</div>
            <div style={{ fontSize: 13, color: T.textMuted }}>{order.id} · {order.category} · {order.type} · {order.region}</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginTop: 3 }}>SO: {order.soNo} · Rating: {order.rating} KVA · Voltage: {order.voltage}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 2 }}>Customer DOD</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: isLate ? T.danger : T.success }}>{order.custDOD}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
              RFD Plan: <span style={{ color: isLate ? T.danger : T.success, fontWeight: 700 }}>{rfdPlan || "—"}</span>
            </div>
          </div>
        </div>
        {/* Progress */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>Workflow Progress</span>
            <span>{completedCount}/{STAGES.length} stages · {progress}%</span>
          </div>
          <div style={{ background: T.border, borderRadius: 8, height: 8 }}>
            <div style={{ background: `linear-gradient(90deg,#2563eb,#16a34a)`, borderRadius: 8, height: "100%", width: `${progress}%`, transition: "width 0.5s" }} />
          </div>
        </div>
        {/* Key dates */}
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { label: "PO Date",   val: order.poDate },
            { label: "MFC Plan",  val: order.plan.MFC },
            { label: "BOM Plan",  val: order.plan.BOM },
            { label: "MDCC Plan", val: order.plan.MDCC },
            { label: "RFD Plan",  val: order.plan.RFD },
            { label: "RFD Actual",val: order.actuals?.P31 },
          ].map(k => (
            <div key={k.label} style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 14px", minWidth: 115 }}>
              <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 3, fontWeight: 600, letterSpacing: "0.05em" }}>{k.label.toUpperCase()}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: k.val ? T.textPrimary : T.textMuted }}>{k.val || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Table */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "auto", maxHeight: "280px" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 14 }}>Stage-wise Workflow</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
         <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr style={{ background: T.tableHead }}>
              {["Stage", "Department", "Milestone", "Plan Date", "Actual Date", "Days Diff", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: T.textMuted, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STAGES.map((s, i) => {
              const planDate = order.plan[s.id];
              const actual = order.actuals[s.id];
              const diff = actual && planDate ? daysDiff(planDate, actual) : null;
              const isOverdue = !actual && planDate && planDate < today;
              const done = !!actual;
              const editable = canEdit(s.dept);
              const dc = DEPT_COLORS[s.dept] || "#6b7280";

              return (
                <tr key={s.id} style={{ borderBottom: `1px solid ${T.border}`,
                  background: done ? "#f0fdf4" : isOverdue ? "#fff5f5" : i % 2 === 0 ? T.tableRow : T.tableRowAlt }}>
                  
                  <td style={{ padding: "9px 14px", fontWeight: 700, color: T.textMuted, fontSize: 12 }}>{s.id}</td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{ background: `${dc}15`, color: dc, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{s.dept}</span>
                  </td>
                  <td style={{ padding: "9px 14px", fontWeight: 500 }}>{s.label}</td>

                  {/* Plan Date column – now editable for P17 */}
                  <td style={{ padding: "9px 14px", color: planDate ? T.textSecondary : T.textMuted }}>
                    {planDate || "—"}
                    {editable && s.id === "P17" && editingPlan !== s.id && (
                      <button
                        onClick={() => { setEditingPlan(s.id); setPlanDateVal(planDate || ""); }}
                        style={{ marginLeft: 8, background: T.brandLight, border: "none", color: T.brand, padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}
                        title="Edit plan date"
                      >
                        ✎
                      </button>
                    )}
                    {editingPlan === s.id && (
                      <div style={{ display: "inline-flex", gap: 4, marginLeft: 8 }}>
                        <input
                          type="date"
                          value={planDateVal}
                          onChange={e => setPlanDateVal(e.target.value)}
                          style={{ width: 130, background: T.inputBg, border: `1px solid ${T.brand}`, color: T.textPrimary, padding: "2px 4px", borderRadius: 4, fontSize: 11 }}
                        />
                        <button
                          onClick={() => { onUpdatePlan(order.id, s.id, planDateVal); setEditingPlan(null); }}
                          style={{ background: T.success, border: "none", color: "#fff", padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingPlan(null)}
                          style={{ background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textSecondary, padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}
                        >
                          ✗
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Actual Date column */}
                  <td style={{ padding: "9px 14px" }}>
                    {editingActual === s.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input type="date" value={actualDateVal} onChange={e => setActualDateVal(e.target.value)}
                          style={{ background: T.inputBg, border: `1px solid ${T.brand}`, color: T.textPrimary, padding: "4px 8px", borderRadius: 6, fontSize: 12 }} />
                        <button onClick={() => { onUpdateActual(order.id, s.id, actualDateVal); setEditingActual(null); }}
                          style={{ background: T.success, border: "none", color: "#fff", padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✓</button>
                        <button onClick={() => setEditingActual(null)}
                          style={{ background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textSecondary, padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontSize: 12 }}>✗</button>
                      </div>
                    ) : (
                      <span style={{ color: done ? T.success : T.textMuted, fontWeight: done ? 600 : 400 }}>{actual || "Pending"}</span>
                    )}
                  </td>

                  <td style={{ padding: "9px 14px" }}>
                    {diff !== null && (
                      <span style={{ color: diff > 0 ? T.danger : diff < 0 ? T.success : T.textMuted, fontWeight: 700, fontSize: 12 }}>
                        {diff > 0 ? `+${diff}d` : diff < 0 ? `${diff}d` : "On time"}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: "9px 14px" }}>
                    {done
                      ? <span style={{ color: T.success, fontSize: 11, fontWeight: 700, background: T.successBg, padding: "2px 8px", borderRadius: 20 }}>✅ DONE</span>
                      : isOverdue
                        ? <span style={{ color: T.danger, fontSize: 11, fontWeight: 700, background: T.dangerBg, padding: "2px 8px", borderRadius: 20 }}>⚠ OVERDUE</span>
                        : planDate
                          ? <span style={{ color: T.warning, fontSize: 11, fontWeight: 700, background: T.warningBg, padding: "2px 8px", borderRadius: 20 }}>🕐 PENDING</span>
                          : <span style={{ color: T.textMuted, fontSize: 11 }}>—</span>}
                  </td>

                  <td style={{ padding: "9px 14px" }}>
                    {editable && !done && (
                      <button onClick={() => { setEditingActual(s.id); setActualDateVal(today); }}
                        style={{ background: T.brandLight, border: "none", color: T.brand, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        Enter Actual
                      </button>
                    )}
                    {done && editable && (
                      <button onClick={() => { setEditingActual(s.id); setActualDateVal(actual); }}
                        style={{ background: T.cardAlt, border: `1px solid ${T.borderMid}`, color: T.textSecondary, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}