import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../authContext";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import NewOrderModal from "./planer/orderform";
import { STAGES, DEPT_COLORS, T } from "../constant";
import { daysDiff } from "../utils";
import WorkflowView from "./planer/WorkflowView";
// ─── DATA FROM EXCEL ──────────────────────────────────────────────────────────
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
  { id: "DOM-CSS-Dry-CRT-Non Std", name: "Domestic Drytype CSS CRT Non Standard Completely New Fresh Design" }
];

// const STAGES = [
//   { id: "P1", dept: "Planner", label: "Communication by Planner", ref: "PO" },
//   { id: "P2", dept: "Sales", label: "Order Acknowledgement", ref: "PO" },
//   { id: "P3", dept: "Sales", label: "Client Approval (OA)", ref: "OA" },
//   { id: "P4", dept: "Sales", label: "SOC Entry", ref: "PO" },
//   { id: "P5", dept: "Sales", label: "SOT Entry", ref: "PO" },
//   { id: "P6", dept: "Planner", label: "*Internal KO-1 (In. Commu+Days)", ref: "P1" },
//   { id: "P7", dept: "Design", label: "Adv. Material to Purchase", ref: "P6" },
//   { id: "P8", dept: "Sales", label: "*External KO-2 (Int KO+Days)", ref: "P6" },
//   { id: "P9", dept: "Sales", label: "Proforma Invoice", ref: "OA" },
//   { id: "P10", dept: "Finance & Sales", label: "ABG Draft Approval", ref: "P1" },
//   { id: "P11", dept: "Finance", label: "BG Submission", ref: "P10" },
//   { id: "P12", dept: "Design", label: "Drawing Commitment Date", ref: "P6" },
//   { id: "P13", dept: "QC & Testing", label: "QAP Preparation", ref: "P8" },
//   { id: "P14", dept: "Sales", label: "Advance Payment", ref: "P11" },
//   { id: "P15", dept: "Sales", label: "Drawing Approval", ref: "P12" },
//   { id: "P16", dept: "Sales", label: "MFC", ref: "P15" },
//   { id: "P17", dept: "Planner", label: "Launch Meeting", ref: "MFC" },
//   { id: "P18", dept: "Design", label: "BOM Release", ref: "MFC" },
//   { id: "P19", dept: "Purchase", label: "LV Winding Kit Commit", ref: "P18" },
//   { id: "P20", dept: "Purchase", label: "HV Winding Kit Commit", ref: "P18" },
//   { id: "P21", dept: "Purchase", label: "CA Kit Commitment", ref: "P18" },
//   { id: "P22", dept: "Purchase", label: "CCA Kit Commitment", ref: "P18" },
//   { id: "P23", dept: "Purchase", label: "Tank Commitment", ref: "P18" },
//   { id: "P24", dept: "Purchase", label: "Finishing Kit Commit", ref: "P18" },
//   { id: "P25", dept: "Testing", label: "Final Testing Internal", ref: "P21" },
//   { id: "P26", dept: "Testing", label: "Customer FAT", ref: "P25" },
//   { id: "P27", dept: "Quality", label: "Compliance", ref: "P26" },
//   { id: "P28", dept: "Sales", label: "MDCC", ref: "P27" },
//   { id: "P29", dept: "QA", label: "Internal / Final DI", ref: "P27" },
//   { id: "P30", dept: "Sales", label: "Payment Received", ref: "P28" },
//   { id: "P31", dept: "Dispatch", label: "Ready for Dispatch", ref: "P28" },
//   { id: "P32", dept: "Finance", label: "Actual Dispatch / Billing", ref: "P31" },
//   { id: "P33", dept: "Planning", label: "Ex-Works", ref: "P32" }
// ];

const GALAXY_DATA = {
  "IDT-RPT-STD-3W": [1,2,5,2,2,1,2,1,0,1,3,4,3,5,5,1,2,7,25,25,36,36,35,35,18,2,2,5,6,2,3,0,0],
  "IDT-RPT-STD-5W": [1,2,5,2,2,1,2,1,0,1,3,4,3,5,5,1,2,7,25,25,36,36,35,35,23,2,2,5,6,2,3,0,0],
  "IDT-Non-Std-5W-NTPC Proto": [1,2,15,2,2,2,2,1,0,10,3,14,3,5,5,1,2,14,45,35,30,30,45,52,23,18,2,5,6,2,3,0,0],
  "EXP-DT Non RPT": [1,2,5,2,2,1,2,1,0,15,5,5,3,10,10,1,2,7,30,30,30,30,60,80,18,3,3,7,6,7,3,0,0],
  "DOM-DT Non RPT": [1,2,5,2,2,1,2,1,0,10,3,5,3,10,10,1,2,7,30,30,30,30,40,47,15,3,2,5,3,7,3,0,0],
  "EXP-DT RPT": [1,2,5,2,2,1,2,1,0,15,5,2,3,10,10,1,2,2,30,30,30,30,60,80,18,3,3,7,6,7,3,0,0],
  "DOM-DT RPT": [1,2,5,2,2,1,2,1,0,10,3,2,3,10,10,1,2,2,30,30,30,30,35,42,15,3,2,5,3,7,3,0,0],
  "EXP-DT Non-Std": [1,2,5,2,2,1,2,1,0,15,5,8,3,10,10,1,2,9,30,30,30,30,50,90,18,3,3,7,6,7,3,0,0],
  "DOM-DT Non-Std": [1,2,5,2,2,1,2,1,0,10,3,8,3,10,10,1,2,9,30,30,30,30,45,60,15,3,2,5,3,7,3,0,0],
  "IDT-Non-Std-3W-Pvt Proto": [1,2,15,2,2,2,2,1,0,10,3,14,3,5,5,1,2,14,45,35,30,30,45,60,18,3,2,5,6,2,3,0,0],
  "IDT-Non-Std-5W-Pvt Proto": [1,2,15,2,2,2,2,1,0,10,3,14,3,5,5,1,2,14,45,35,30,30,45,60,23,3,2,5,6,2,3,0,0],
  "PMT-RPT": [1,2,5,2,2,1,2,1,1,15,5,2,3,10,10,1,2,2,45,30,30,30,60,67,18,3,3,7,10,60,3,0,0],
  "PMT-Non. RPT": [1,2,5,2,2,1,2,1,0,15,5,7,3,10,10,1,2,7,45,30,30,30,60,67,18,3,3,7,10,60,3,0,0],
  "PMT-Non. STD": [1,2,5,2,2,1,2,1,0,15,5,9,3,10,10,1,2,10,45,30,30,30,70,77,18,3,3,7,10,60,3,0,0],
  "SST-RPT": [1,2,5,2,2,1,2,1,0,15,5,2,3,10,10,1,2,2,45,30,30,30,60,67,18,3,3,7,10,60,3,0,0],
  "SST-Non. RPT": [1,2,5,2,2,1,2,1,0,15,5,7,3,10,10,1,2,7,45,30,30,30,60,67,18,3,3,7,10,60,3,0,0],
  "SST-Non. STD": [1,2,5,2,2,1,2,1,0,15,5,12,3,10,10,1,2,14,45,30,30,30,70,77,18,3,3,7,10,60,3,0,0],
  "EXP-PT (20 MVA-33kV)": [1,2,5,2,2,2,3,3,0,15,5,16,3,10,15,1,2,20,60,40,40,40,60,70,40,4,5,7,6,7,5,0,0],
  "DOM-PT (20 MVA-33kV)": [1,2,5,2,2,2,3,3,0,15,5,14,3,10,15,1,2,18,60,40,40,40,50,57,40,3,5,7,6,7,5,0,0],
  "EXP-EHV (20 MVA-66kV)": [1,2,5,2,2,2,4,3,0,15,5,24,3,10,21,1,2,28,60,40,40,40,65,150,40,4,5,7,6,7,5,0,0],
  "DOM-EHV (20 MVA-66kV)": [1,2,5,2,2,2,4,3,0,15,5,21,3,10,21,1,2,24,60,40,40,40,50,90,40,3,5,7,6,7,5,0,0],
  "EXP-EHV (50 MVA-132kV)": [1,2,5,2,2,2,4,3,0,15,5,24,3,10,21,1,2,28,90,90,45,45,65,300,45,4,5,7,6,7,5,0,0],
  "DOM-EHV (50 MVA-132kV)": [1,2,5,2,2,2,4,3,0,15,5,21,3,10,21,1,2,24,75,75,45,45,65,120,45,3,5,7,6,7,5,0,0],
  "EXP-Dry-VPI-Std": [1,2,5,2,2,1,3,1,0,15,5,8,3,10,10,1,2,9,40,30,30,30,50,57,18,2,2,5,6,2,3,0,0],
  "DOM-Dry-VPI-Std": [1,2,5,2,2,1,2,1,0,10,3,5,3,5,10,1,2,7,40,30,30,30,40,50,18,2,2,5,6,2,3,0,0],
  "EXP-Dry-VPI-Non Std": [1,2,5,2,2,1,4,1,0,15,5,21,3,10,10,1,2,21,40,30,30,30,60,80,18,2,2,5,6,2,3,0,0],
  "DOM-Dry-VPI-Non Std": [1,2,5,2,2,1,2,1,0,10,3,14,3,5,10,1,2,14,40,30,30,30,40,50,18,2,2,5,6,2,3,0,0],
  "EXP-Dry-CRT-Std": [1,2,5,2,2,1,3,1,0,15,5,8,3,10,10,1,2,9,40,30,30,30,60,80,18,2,2,5,6,2,3,0,0],
  "DOM-Dry-CRT-Std": [1,2,5,2,2,1,2,1,0,10,3,5,3,5,10,1,2,7,40,30,30,30,50,60,18,2,2,5,6,2,3,0,0],
  "EXP-Dry-CRT-Non Std": [1,2,5,2,2,1,4,1,0,15,5,21,3,10,10,1,2,21,40,30,30,30,60,80,18,2,2,5,6,2,3,0,0],
  "DOM-Dry-CRT-Non Std": [1,2,5,2,2,1,2,1,0,10,3,14,3,5,10,1,2,14,40,30,30,30,60,67,18,2,2,5,6,2,3,0,0],
  "DOM-CSS-Dry-VPI-Std": [1,2,5,2,2,1,2,1,0,10,3,5,3,5,10,1,2,7,40,30,30,30,50,60,18,2,2,5,6,2,3,0,0],
  "DOM-CSS-Dry-VPI-Non Std": [1,2,5,2,2,1,2,1,0,10,3,14,3,5,10,1,2,14,40,30,30,30,50,60,18,2,2,5,6,2,3,0,0],
  "DOM-CSS-Dry-CRT-Std": [1,2,5,2,2,1,2,1,0,10,3,5,3,5,10,1,2,7,40,30,30,30,50,60,18,2,2,5,6,2,3,0,0],
  "DOM-CSS-Dry-CRT-Non Std": [1,2,5,2,2,1,2,1,0,10,3,14,3,5,10,1,2,14,40,30,30,30,50,60,18,2,2,5,6,2,3,0,0]
};

const DEFAULT_DAYS = [1,2,5,2,2,1,2,1,0,1,3,4,3,5,5,1,2,7,25,25,36,36,35,35,23,2,2,5,6,2,3,0,0];

function getDays(category, stageIndex) {
  return (GALAXY_DATA[category] || DEFAULT_DAYS)[stageIndex] || 0;
}

function addDays(dateStr, days) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// function daysDiff(d1, d2) {
//   if (!d1 || !d2) return null;
//   return Math.round((new Date(d2) - new Date(d1)) / 86400000);
// }

function computePlanDates(poDate, category) {
  if (!poDate) return {};
  const days = STAGES.map((_, i) => getDays(category, i));
  const dates = {};
  dates["PO"] = poDate;
  dates["P1"] = addDays(poDate, days[0]);
  dates["OA"] = addDays(poDate, days[1]);
  dates["P2"] = dates["OA"];
  dates["P3"] = addDays(dates["OA"], days[2]);
  dates["P4"] = addDays(poDate, days[3]);
  dates["P5"] = addDays(poDate, days[4]);
  dates["P6"] = addDays(dates["P1"], days[5]);
  dates["P7"] = addDays(dates["P6"], days[6]);
  dates["P8"] = addDays(dates["P6"], days[7]);
  dates["P9"] = addDays(dates["OA"], days[8]);
  dates["P10"] = addDays(dates["P1"], days[9]);
  dates["P11"] = addDays(dates["P10"], days[10]);
  dates["P12"] = addDays(dates["P6"], days[11]);
  dates["P13"] = addDays(dates["P8"], days[12]);
  dates["P14"] = addDays(dates["P11"], days[13]);
  dates["P15"] = addDays(dates["P12"], days[14]);
  dates["P16"] = addDays(dates["P15"], days[15]);
  dates["MFC"] = dates["P16"];
  dates["P17"] = addDays(dates["P16"], days[16]);
  dates["P18"] = addDays(dates["P16"], days[17]);
  dates["BOM"] = dates["P18"];
  dates["P19"] = addDays(dates["P18"], days[18]);
  dates["P20"] = addDays(dates["P18"], days[19]);
  dates["P21"] = addDays(dates["P18"], days[20]);
  dates["P22"] = addDays(dates["P18"], days[21]);
  dates["P23"] = addDays(dates["P18"], days[22]);
  dates["P24"] = addDays(dates["P18"], days[23]);
  dates["P25"] = addDays(dates["P21"], days[24]);
  dates["P26"] = addDays(dates["P25"], days[25]);
  dates["P27"] = addDays(dates["P26"], days[26]);
  dates["P28"] = addDays(dates["P27"], days[27]);
  dates["MDCC"] = dates["P28"];
  dates["P29"] = addDays(dates["P27"], days[28]);
  dates["P30"] = addDays(dates["P28"], days[29]);
  dates["P31"] = addDays(dates["P28"], days[30]);
  dates["RFD"] = dates["P31"];
  dates["P32"] = addDays(dates["P31"], days[31]);
  dates["P33"] = addDays(dates["P32"], days[32]);
  return dates;
}

// UPDATED: merge computed plan with any excelPlanDates overrides
function getPlanDates(order) {
  const computed = computePlanDates(order.poDate, order.category);
  if (order.excelPlanDates && Object.keys(order.excelPlanDates).length > 0) {
    return { ...computed, ...order.excelPlanDates };
  }
  return computed;
}

// const DEPT_COLORS = {
//   "Planner": "#2563eb",
//   "Sales": "#059669",
//   "Design": "#7c3aed",
//   "Finance": "#d97706",
//   "Finance & Sales": "#d97706",
//   "Purchase": "#dc2626",
//   "Testing": "#0891b2",
//   "QC & Testing": "#0891b2",
//   "Quality": "#65a30d",
//   "QA": "#65a30d",
//   "Dispatch": "#ea580c",
//   "Planning": "#2563eb",
//   "Operations": "#4b5563",
// };

const ROLES = {
  admin: { label: "Planner(Admin)", depts: Object.keys(DEPT_COLORS) },
  // planner: { label: "Planner", depts: ["Planner", "Planning"] },
  sales: { label: "Sales", depts: ["Sales", "Finance & Sales"] },
  design: { label: "Design", depts: ["Design"] },
  purchase: { label: "Purchase", depts: ["Purchase"] },
  testing: { label: "Testing", depts: ["Testing", "QC & Testing", "Quality", "QA"] },
  finance: { label: "Finance", depts: ["Finance", "Finance & Sales"] },
  dispatch: { label: "Dispatch", depts: ["Dispatch"] },
};

const SAMPLE_ORDERS = [
  {
    id: "ORD-001", srNo: 1, mode: "PO", customer: "LCC Projects",
    poDate: "2025-09-30", type: "Domestic", region: "West",
    project: "NTPC", site: "Khavda", productType: "Oil IDT",
    category: "IDT-RPT-STD-5W", rating: "13200", voltage: "33/0.660x4",
    paymentTerms: "", ldAppl: true, custDOD: "2026-04-15",
    desiredDOD: "2026-04-10", soNo: "9505", unitRate: 9100000,
    plant: "R457", status: "WIP",
    leadTimePlan: 78,
    excelPlanDates: {P1: "2025-10-01", P2: "2025-10-02", P3: "2025-10-07", P4: "2025-10-02", P5: "2025-10-02", P6: "2025-10-02", P7: "2025-10-04", P8: "2025-10-03", P9: "2025-10-02", P10: "2025-10-02", P11: "2025-10-05", P12: "2025-10-06", P13: "2025-10-06", P14: "2025-10-10", P15: "2025-10-11", P16: "2025-10-12", P17: "2026-01-23", P18: "2026-01-28", P19: "2026-02-22", P20: "2026-02-22", P21: "2026-03-05", P22: "2026-03-05", P23: "2026-03-04", P24: "2026-03-04", P25: "2026-03-28", P26: "2026-03-30", P27: "2026-04-01", P28: "2026-04-06", P29: "2026-04-07", P30: "2026-04-08", P31: "2026-04-09", P32: "2026-04-09", P33: "2026-04-09"},
    actuals: {P1: "2025-10-25", P2: "2025-10-16", P3: "2025-10-21", P4: "2025-10-16", P5: "2025-10-16", P6: "2025-10-16", P7: "2025-10-18", P8: "2025-10-17", P9: "2025-10-16", P10: "2025-10-16", P11: "2025-10-19", P12: "2025-10-20", P13: "2025-10-20", P14: "2025-10-24", P15: "2025-10-25", P16: "2026-11-28", P32: "2026-01-08"}
  },
];

// ── THEME ─────────────────────────────────────────────────────────────────────
// const T = {
//   // Backgrounds
//   pageBg:    "#f4f6f9",
//   sidebar:   "#ffffff",
//   card:      "#ffffff",
//   cardAlt:   "#f8fafc",
//   tableHead: "#f1f5f9",
//   tableRow:  "#ffffff",
//   tableRowAlt: "#f8fafc",
//   tableRowDone: "#f0fdf4",
//   tableRowOverdue: "#fff5f5",
//   inputBg:   "#f8fafc",
//   // Borders
//   border:    "#e2e8f0",
//   borderMid: "#cbd5e1",
//   // Text
//   textPrimary: "#0f172a",
//   textSecondary: "#475569",
//   textMuted: "#94a3b8",
//   // Brand
//   brand:     "#1e40af",
//   brandLight:"#dbeafe",
//   // Status
//   success:   "#16a34a",
//   successBg: "#dcfce7",
//   danger:    "#dc2626",
//   dangerBg:  "#fee2e2",
//   warning:   "#d97706",
//   warningBg: "#fef3c7",
//   info:      "#0284c7",
//   infoBg:    "#e0f2fe",
// };

export default function App() {
  const { user, role } = useAuth();
  console.log("Current user role:", role);

  const navigate = useNavigate();

  const [view, setView] = useState("dashboard");
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [today] = useState(new Date().toISOString().split("T")[0]);

  const ordersWithDates = useMemo(() =>
    orders.map(o => ({ ...o, plan: getPlanDates(o) })), [orders]);

  useEffect(() => {
    const newAlerts = [];
    ordersWithDates.forEach(o => {
      STAGES.forEach((s) => {
        const planDate = o.plan[s.id];
        const actual = o.actuals[s.id];
        if (!actual && planDate && planDate < today && o.status !== "Dispatched") {
          const overdue = daysDiff(planDate, today);
          if (overdue > 0) {
            newAlerts.push({
              id: `${o.id}-${s.id}`, orderId: o.id, customer: o.customer, stage: s.label,
              dept: s.dept, overdue, severity: overdue > 7 ? "high" : overdue > 3 ? "medium" : "low"
            });
          }
        }
      });
      if (o.plan.RFD && o.custDOD && o.plan.RFD > o.custDOD && o.status !== "Dispatched") {
        newAlerts.push({
          id: `${o.id}-rfd`, orderId: o.id, customer: o.customer,
          stage: "RFD vs Customer DOD", dept: "Planning",
          overdue: daysDiff(o.custDOD, o.plan.RFD), severity: "high"
        });
      }
    });
    setAlerts(newAlerts.sort((a, b) => b.overdue - a.overdue));
  }, [ordersWithDates, today]);

  const myDepts = ROLES[role]?.depts || [];

  const filteredOrders = useMemo(() => ordersWithDates.filter(o => {
    if (filterStatus !== "All" && o.status !== filterStatus) return false;
    if (searchQ && !o.customer.toLowerCase().includes(searchQ.toLowerCase()) &&
        !o.id.toLowerCase().includes(searchQ.toLowerCase()) &&
        !o.project.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  }), [ordersWithDates, filterStatus, searchQ]);

const myAlerts = alerts;
  const stats = useMemo(() => ({
    total: orders.length,
    wip: orders.filter(o => o.status === "WIP").length,
    delayed: orders.filter(o => o.status === "Delayed").length,
    new: orders.filter(o => o.status === "New").length,
    alertCount: myAlerts.length,
    highAlerts: myAlerts.filter(a => a.severity === "high").length,
  }), [orders, myAlerts]);

  function updateActual(orderId, stageId, date) {
    setOrders(prev => prev.map(o => o.id === orderId
      ? { ...o, actuals: { ...o.actuals, [stageId]: date } } : o));
  }

  // NEW: update plan date for P17 and shift subsequent stages
  function updatePlan(orderId, stageId, newDate) {
    if (stageId !== "P17") return; // we only handle P17 for now
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id !== orderId) return order;

      const originalPlan = computePlanDates(order.poDate, order.category);
      const originalP17 = originalPlan.P17;
      if (!originalP17) return order;

      const delta = daysDiff(originalP17, newDate); // positive if new is later
      if (delta === 0) return order; // no change

      const updatedExcel = { ...(order.excelPlanDates || {}) };
      updatedExcel[stageId] = newDate;

      // Find index of P18
      const startIdx = STAGES.findIndex(s => s.id === "P18");
      if (startIdx !== -1) {
        STAGES.slice(startIdx).forEach(s => {
          const originalDate = originalPlan[s.id];
          if (originalDate) {
            updatedExcel[s.id] = addDays(originalDate, delta);
          }
        });
      }

      return { ...order, excelPlanDates: updatedExcel };
    }));
  }

  const statusStyle = {
    "WIP":       { bg: "#dbeafe", color: "#1d4ed8" },
    "New":       { bg: "#dcfce7", color: "#15803d" },
    "Delayed":   { bg: "#fee2e2", color: "#b91c1c" },
    "Dispatched":{ bg: "#f1f5f9", color: "#475569" },
  };

  const navItems = [
    { id: "dashboard",  icon: "▦",  label: "Dashboard" },
    { id: "orders",     icon: "≡",  label: "All Orders" },
    // { id: "workflow",   icon: "⇄",  label: "Workflow Tracker" },
    ...(role !== "admin" ? [{ id: "workflow",   icon: "⇄",  label: "Workflow Tracker" }] : []),
    { id: "alerts",     icon: "◉",  label: `Alerts (${myAlerts.length})` },
    { id: "rfd",        icon: "⬆",  label: "RFD Tracker" },
    { id: "department", icon: "⬡",  label: "Dept. View" },
  ];

  const viewTitles = {
    dashboard: "Executive Dashboard", orders: "Order Management",
    workflow: "Workflow Tracker", alerts: "Alerts & Escalations",
    rfd: "RFD-Based Tracking", department: "Department View"
  };

  const inputStyle = {
    background: T.inputBg, border: `1px solid ${T.border}`,
    color: T.textPrimary, padding: "9px 12px", borderRadius: 8,
    fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box"
  };
  const selectStyle = { ...inputStyle, cursor: "pointer" };

  async function handleLogout() {
    try {
      await auth.signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.pageBg, color: T.textPrimary, fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", display: "flex" }}>
      {/* ── SIDEBAR ── */}
      <div style={{ width: 230, background: T.sidebar, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", padding: "0 0 20px 0", flexShrink: 0, boxShadow: "1px 0 0 #e2e8f0" }}>
        {/* Brand */}
        <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, background: T.brand, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>P</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.3px" }}>PlanTrack Pro</div>
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>Transformer Mfg ERP</div>
            </div>
          </div>
        </div>

        {/* User Info */}
       

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setView(item.id); setSelectedOrder(null); }}
              style={{ width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10, marginBottom: 2, fontSize: 13,
                fontWeight: view === item.id ? 700 : 500,
                background: view === item.id ? T.brandLight : "transparent",
                color: view === item.id ? T.brand : T.textSecondary,
                transition: "all 0.15s" }}>
              <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

       
        {/* New Order button - hide for admin */}
{role !== "admin" && (
  <div style={{ padding: "0 12px", marginBottom: "10px" }}>
    <button onClick={() => setShowNewOrder(true)}
      style={{ width: "100%", padding: "10px", background: T.brand, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em" }}>
      + New Order
    </button>
  </div>
)}

        {/* Logout button */}
        <div style={{ padding: "0 12px" }}>
          <button onClick={handleLogout}
            style={{ width: "100%", padding: "10px", background: "transparent", border: `1px solid ${T.border}`, color: "#da1616", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span>🚪</span> Logout
          </button>
        </div>
         <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 5, letterSpacing: "0.08em", fontWeight: 600 }}>LOGGED IN AS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: T.brandLight, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: T.brand, fontWeight: 700 }}>
              {user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{user?.email}</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{ROLES[role]?.label || role}</div>
            </div>
          </div>
        </div>
      </div>
      

      {/* ── MAIN ── */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.textPrimary }}>{viewTitles[view]}</h1>
          </div>
          {myAlerts.filter(a => a.severity === "high").length > 0 && (
            <div onClick={() => setView("alerts")}
              style={{ background: T.dangerBg, border: `1px solid #fca5a5`, borderRadius: 20, padding: "5px 14px", fontSize: 12, color: T.danger, cursor: "pointer", fontWeight: 600 }}>
              🔴 {myAlerts.filter(a => a.severity === "high").length} Critical Alerts
            </div>
          )}
          <div style={{ fontSize: 12, color: T.textMuted, background: T.cardAlt, padding: "5px 12px", borderRadius: 20, border: `1px solid ${T.border}` }}>
            📅 {today}
          </div>
        </div>

        <div style={{ flex: 1, padding: 15, overflow: "auto" }}>

          {/* ── DASHBOARD ── */}
          {view === "dashboard" && (
            <div>
              {/* KPI Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Total Orders", value: stats.total, icon: "📦", accent: "#2563eb", bg: "#dbeafe" },
                  { label: "WIP", value: stats.wip, icon: "⚙️", accent: "#7c3aed", bg: "#ede9fe" },
                  { label: "Delayed", value: stats.delayed, icon: "⚠️", accent: "#dc2626", bg: "#fee2e2" },
                  { label: "Active Alerts", value: stats.alertCount, icon: "🔔", accent: "#d97706", bg: "#fef3c7" },
                ].map(k => (
                  <div key={k.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 22px", borderTop: `3px solid ${k.accent}` }}>
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{k.icon}</div>
                    <div style={{ fontSize: 34, fontWeight: 800, color: k.accent, lineHeight: 1 }}>{k.value}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6, fontWeight: 500 }}>{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 24, overflow: "hidden" }}>
                <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Orders</div>
                  <button onClick={() => setView("orders")} style={{ background: "none", border: "none", color: T.brand, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>View All →</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: T.tableHead }}>
                        {["Sr#", "Customer", "Category", "PO Date", "Cust DOD", "RFD Plan", "Status", ""].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: T.textMuted, fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ordersWithDates.slice(0, 5).map((o, idx) => {
                        const rfdPlan = o.plan.RFD;
                        const isLate = rfdPlan && o.custDOD && rfdPlan > o.custDOD;
                        const ss = statusStyle[o.status] || {};
                        return (
                          <tr key={o.id} style={{ borderBottom: `1px solid ${T.border}`, background: idx % 2 === 0 ? T.tableRow : T.tableRowAlt }}>
                            <td style={{ padding: "11px 16px", color: T.textMuted }}>{o.srNo}</td>
                            <td style={{ padding: "11px 16px", fontWeight: 600 }}>{o.customer}</td>
                            <td style={{ padding: "11px 16px", color: T.textSecondary, fontSize: 12 }}>{o.category}</td>
                            <td style={{ padding: "11px 16px" }}>{o.poDate}</td>
                            <td style={{ padding: "11px 16px", color: isLate ? T.danger : T.textPrimary, fontWeight: isLate ? 700 : 400 }}>{o.custDOD}</td>
                            <td style={{ padding: "11px 16px", color: isLate ? T.danger : T.success, fontWeight: 600 }}>{rfdPlan || "—"}</td>
                            <td style={{ padding: "11px 16px" }}>
                              <span style={{ background: ss.bg, color: ss.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{o.status}</span>
                            </td>
                            <td style={{ padding: "11px 16px" }}>
                              <button onClick={() => { setSelectedOrder(o); setView("workflow"); }}
                                style={{ background: T.brandLight, border: "none", color: T.brand, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Alerts */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "auto", maxHeight: "220px" }}>
                <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>🔔 Top Alerts</div>
                </div>
                <div style={{ padding: "8px 16px" }}>
                  {myAlerts.slice(0, 5).map(a => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 6px", borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
                        background: a.severity === "high" ? T.danger : a.severity === "medium" ? T.warning : T.success }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{a.customer} — {a.stage}</div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{a.dept} · {a.overdue} days overdue</div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: "0.05em",
                        color: a.severity === "high" ? T.danger : a.severity === "medium" ? T.warning : T.success,
                        background: a.severity === "high" ? T.dangerBg : a.severity === "medium" ? T.warningBg : T.successBg,
                        padding: "2px 8px", borderRadius: 20
                      }}>{a.severity.toUpperCase()}</span>
                    </div>
                  ))}
                  {myAlerts.length === 0 && (
                    <div style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>✅ No active alerts</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {view === "orders" && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <input placeholder="Search orders..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...selectStyle, width: "auto", minWidth: 130 }}>
                  {["All", "New", "WIP", "Delayed", "Dispatched"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.tableHead }}>
                      {["Sr#", "Mode", "PO Date", "Customer", "Type", "Region", "Product Category", "Rating", "Cust DOD", "RFD Plan", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: T.textMuted, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o, idx) => {
                      const rfdPlan = o.plan.RFD;
                      const isLate = rfdPlan && o.custDOD && rfdPlan > o.custDOD;
                      const ss = statusStyle[o.status] || {};
                      return (
                        <tr key={o.id} style={{ borderBottom: `1px solid ${T.border}`, background: idx % 2 === 0 ? T.tableRow : T.tableRowAlt }}>
                          <td style={{ padding: "9px 14px", color: T.textMuted }}>{o.srNo}</td>
                          <td style={{ padding: "9px 14px", color: T.textMuted }}>{o.mode}</td>
                          <td style={{ padding: "9px 14px", whiteSpace: "nowrap" }}>{o.poDate}</td>
                          <td style={{ padding: "9px 14px", fontWeight: 700 }}>{o.customer}</td>
                          <td style={{ padding: "9px 14px" }}>
                            <span style={{ color: o.type === "Export" ? T.warning : T.success, fontSize: 11, fontWeight: 700 }}>{o.type}</span>
                          </td>
                          <td style={{ padding: "9px 14px", color: T.textSecondary }}>{o.region}</td>
                          <td style={{ padding: "9px 14px", color: T.textSecondary, fontSize: 12, maxWidth: 180 }}>{o.category}</td>
                          <td style={{ padding: "9px 14px", color: T.textSecondary }}>{o.rating} KVA</td>
                          <td style={{ padding: "9px 14px", color: isLate ? T.danger : T.textPrimary, fontWeight: isLate ? 700 : 400 }}>{o.custDOD}</td>
                          <td style={{ padding: "9px 14px", color: isLate ? T.danger : T.success, fontWeight: 600 }}>{rfdPlan || "—"} {isLate ? "⚠️" : ""}</td>
                          <td style={{ padding: "9px 14px" }}>
                            <span style={{ background: ss.bg, color: ss.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{o.status}</span>
                          </td>
                          <td style={{ padding: "9px 14px" }}>
                            <button onClick={() => { setSelectedOrder(o); setView("workflow"); }}
                              style={{ background: T.brand, border: "none", color: "#fff", padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                              Workflow
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── WORKFLOW ── */}
          {view === "workflow" && (
            <div>
              {!selectedOrder ? (
                <div>
                  <div style={{ marginBottom: 16, color: T.textSecondary, fontSize: 14 }}>Select an order to view its workflow timeline:</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14 }}>
                    {ordersWithDates.map(o => {
                      const ss = statusStyle[o.status] || {};
                      return (
                        <div key={o.id} onClick={() => setSelectedOrder(o)}
                          style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, cursor: "pointer", transition: "box-shadow 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>{o.customer}</div>
                          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 10 }}>{o.category}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, alignItems: "center" }}>
                            <span style={{ color: T.textSecondary }}>PO: {o.poDate}</span>
                            <span style={{ background: ss.bg, color: ss.color, padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>{o.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <WorkflowView
                  order={selectedOrder}
                  onBack={() => setSelectedOrder(null)}
                  myDepts={myDepts}
                  role={role}
                  today={today}
                  onUpdateActual={updateActual}
                  onUpdatePlan={updatePlan}   // NEW prop
                />
              )}
            </div>
          )}

          {/* ── ALERTS ── */}
          {view === "alerts" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Critical", count: myAlerts.filter(a => a.severity === "high").length, color: T.danger, bg: T.dangerBg, icon: "🔴" },
                  { label: "Warning",  count: myAlerts.filter(a => a.severity === "medium").length, color: T.warning, bg: T.warningBg, icon: "🟡" },
                  { label: "Info",     count: myAlerts.filter(a => a.severity === "low").length, color: T.success, bg: T.successBg, icon: "🟢" },
                ].map(k => (
                  <div key={k.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 22, textAlign: "center", borderTop: `3px solid ${k.color}` }}>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{k.icon}</div>
                    <div style={{ fontSize: 38, fontWeight: 800, color: k.color }}>{k.count}</div>
                    <div style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>{k.label} Alerts</div>
                  </div>
                ))}
              </div>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                {myAlerts.length === 0 ? (
                  <div style={{ padding: 48, textAlign: "center", color: T.textMuted }}>✅ No alerts for your department</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: T.tableHead }}>
                        {["Severity", "Customer", "Stage", "Department", "Days Overdue", "Action"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myAlerts.map((a, idx) => (
                        <tr key={a.id} style={{ borderBottom: `1px solid ${T.border}`, background: idx % 2 === 0 ? T.tableRow : T.tableRowAlt }}>
                          <td style={{ padding: "11px 16px" }}>
                            <span style={{
                              background: a.severity === "high" ? T.dangerBg : a.severity === "medium" ? T.warningBg : T.successBg,
                              color: a.severity === "high" ? T.danger : a.severity === "medium" ? T.warning : T.success,
                              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700
                            }}>{a.severity.toUpperCase()}</span>
                          </td>
                          <td style={{ padding: "11px 16px", fontWeight: 600 }}>{a.customer}</td>
                          <td style={{ padding: "11px 16px", color: T.textSecondary }}>{a.stage}</td>
                          <td style={{ padding: "11px 16px" }}>
                            <span style={{ background: `${DEPT_COLORS[a.dept] || "#6b7280"}18`, color: DEPT_COLORS[a.dept] || "#6b7280", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{a.dept}</span>
                          </td>
                          <td style={{ padding: "11px 16px", color: T.danger, fontWeight: 700 }}>{a.overdue} days</td>
                          <td style={{ padding: "11px 16px" }}>
                            <button onClick={() => { const o = ordersWithDates.find(x => x.id === a.orderId); setSelectedOrder(o); setView("workflow"); }}
                              style={{ background: T.brandLight, border: "none", color: T.brand, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── RFD TRACKER ── */}
          {view === "rfd" && (
            <div>
              <div style={{ marginBottom: 16, fontSize: 13, color: T.textSecondary, background: T.infoBg, border: `1px solid #bae6fd`, borderRadius: 8, padding: "10px 14px" }}>
                ℹ️ RFD = Ready For Dispatch. Compares planned RFD vs Customer Delivery of Date.
              </div>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.tableHead }}>
                      {["Sr#", "Customer", "Category", "PO Date", "MFC Plan", "BOM Plan", "RFD Plan", "Cust DOD", "Buffer (days)", "Lead Time", "Status"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: T.textMuted, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ordersWithDates.map((o, idx) => {
                      const rfdPlan = o.plan.RFD;
                      const mfcPlan = o.plan.MFC;
                      const bomPlan = o.plan.BOM;
                      const buffer = daysDiff(rfdPlan, o.custDOD);
                      const leadTime = daysDiff(mfcPlan, rfdPlan);
                      const rfdActual = o.actuals?.P31;
                      const isLate = buffer !== null && buffer < 0;
                      return (
                        <tr key={o.id} style={{ borderBottom: `1px solid ${T.border}`, background: idx % 2 === 0 ? T.tableRow : T.tableRowAlt }}>
                          <td style={{ padding: "9px 14px", color: T.textMuted }}>{o.srNo}</td>
                          <td style={{ padding: "9px 14px", fontWeight: 700 }}>{o.customer}</td>
                          <td style={{ padding: "9px 14px", color: T.textSecondary, fontSize: 12 }}>{o.category}</td>
                          <td style={{ padding: "9px 14px" }}>{o.poDate}</td>
                          <td style={{ padding: "9px 14px", color: "#7c3aed", fontWeight: 500 }}>{mfcPlan || "—"}</td>
                          <td style={{ padding: "9px 14px", color: T.warning, fontWeight: 500 }}>{bomPlan || "—"}</td>
                          <td style={{ padding: "9px 14px", color: rfdActual ? T.success : isLate ? T.danger : T.textPrimary, fontWeight: 600 }}>
                            {rfdActual ? `✅ ${rfdActual}` : (rfdPlan || "—")}
                          </td>
                          <td style={{ padding: "9px 14px", fontWeight: 600 }}>{o.custDOD}</td>
                          <td style={{ padding: "9px 14px", fontWeight: 700,
                            color: buffer === null ? T.textMuted : buffer < 0 ? T.danger : buffer < 7 ? T.warning : T.success }}>
                            {buffer !== null ? `${buffer > 0 ? "+" : ""}${buffer}` : "—"}
                          </td>
                          <td style={{ padding: "9px 14px", color: T.textSecondary }}>{leadTime !== null ? `${leadTime} days` : "—"}</td>
                          <td style={{ padding: "9px 14px" }}>
                            <span style={{
                              background: rfdActual ? "#f1f5f9" : isLate ? T.dangerBg : T.successBg,
                              color: rfdActual ? T.textMuted : isLate ? T.danger : T.success,
                              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700
                            }}>
                              {rfdActual ? "DISPATCHED" : isLate ? "AT RISK" : "ON TRACK"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── DEPARTMENT ── */}
          {view === "department" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {["All", ...Object.keys(DEPT_COLORS)].map(d => (
                  <button key={d} onClick={() => setFilterDept(d)}
                    style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filterDept === d ? (DEPT_COLORS[d] || T.brand) : T.border}`,
                      cursor: "pointer", fontSize: 12, fontWeight: 600,
                      background: filterDept === d ? `${DEPT_COLORS[d] || T.brand}18` : T.card,
                      color: filterDept === d ? (DEPT_COLORS[d] || T.brand) : T.textSecondary }}>
                    {d}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: 16 }}>
                {(filterDept === "All" ? Object.keys(DEPT_COLORS) : [filterDept]).map(dept => {
                  const deptStages = STAGES.filter(s => s.dept === dept || s.dept.includes(dept));
                  const deptAlerts = myAlerts.filter(a => a.dept === dept);
                  const pendingItems = [];
                  ordersWithDates.forEach(o => {
                    deptStages.forEach(s => {
                      if (!o.actuals[s.id] && o.plan[s.id]) {
                        pendingItems.push({ order: o, stage: s, planDate: o.plan[s.id], isOverdue: o.plan[s.id] < today });
                      }
                    });
                  });
                  const dc = DEPT_COLORS[dept] || T.brand;
                  return (
                    <div key={dept} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", borderTop: `3px solid ${dc}` }}>
                      <div style={{ background: `${dc}0d`, padding: "13px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontWeight: 700, color: dc, fontSize: 13 }}>{dept}</div>
                        {deptAlerts.length > 0 && (
                          <span style={{ background: T.dangerBg, color: T.danger, fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>⚠ {deptAlerts.length}</span>
                        )}
                      </div>
                      <div style={{ padding: 12 }}>
                        {pendingItems.length === 0 ? (
                          <div style={{ color: T.textMuted, fontSize: 12, textAlign: "center", padding: 14 }}>✅ All clear</div>
                        ) : pendingItems.slice(0, 4).map((item, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none", fontSize: 12 }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{item.order.customer}</div>
                              <div style={{ color: T.textMuted, marginTop: 2 }}>{item.stage.label}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ color: item.isOverdue ? T.danger : T.success, fontWeight: 700 }}>{item.planDate}</div>
                              {item.isOverdue && <div style={{ color: T.danger, fontSize: 10, fontWeight: 700, marginTop: 2 }}>OVERDUE</div>}
                            </div>
                          </div>
                        ))}
                        {pendingItems.length > 4 && (
                          <div style={{ color: T.textMuted, fontSize: 11, textAlign: "center", paddingTop: 8 }}>+{pendingItems.length - 4} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {showNewOrder && (
        <NewOrderModal onClose={() => setShowNewOrder(false)}
          onSave={order => {
            setOrders(p => [...p, { ...order, id: `ORD-${String(p.length + 1).padStart(3, "0")}`, srNo: p.length + 1, actuals: {} }]);
            setShowNewOrder(false);
          }} />
      )}
    </div>
  );
}

// ─── WORKFLOW VIEW (updated) ──────────────────────────────────────────────────
// function WorkflowView({ order, onBack, myDepts, role, today, onUpdateActual, onUpdatePlan }) {
//   const [editingActual, setEditingActual] = useState(null);
//   const [actualDateVal, setActualDateVal] = useState("");
//   const [editingPlan, setEditingPlan] = useState(null);       // for plan editing
//   const [planDateVal, setPlanDateVal] = useState("");

//   const canEdit = (dept) => role === "admin" || myDepts.includes(dept);

//   const completedCount = STAGES.filter(s => order.actuals[s.id]).length;
//   const progress = Math.round((completedCount / STAGES.length) * 100);
//   const rfdPlan = order.plan.RFD;
//   const isLate = rfdPlan && order.custDOD && rfdPlan > order.custDOD;

//   return (
//     <div>
//       <button onClick={onBack}
//         style={{ background: T.card, border: `1px solid ${T.border}`, color: T.textSecondary, padding: "5px 15px", borderRadius: 8, cursor: "pointer", marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
//         ← Back
//       </button>

//       {/* Order Header */}
//       <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, marginBottom: 20 }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
//           <div>
//             <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{order.customer}</div>
//             <div style={{ fontSize: 13, color: T.textMuted }}>{order.id} · {order.category} · {order.type} · {order.region}</div>
//             <div style={{ fontSize: 13, color: T.textMuted, marginTop: 3 }}>SO: {order.soNo} · Rating: {order.rating} KVA · Voltage: {order.voltage}</div>
//           </div>
//           <div style={{ textAlign: "right" }}>
//             <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 2 }}>Customer DOD</div>
//             <div style={{ fontSize: 20, fontWeight: 800, color: isLate ? T.danger : T.success }}>{order.custDOD}</div>
//             <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
//               RFD Plan: <span style={{ color: isLate ? T.danger : T.success, fontWeight: 700 }}>{rfdPlan || "—"}</span>
//             </div>
//           </div>
//         </div>
//         {/* Progress */}
//         <div style={{ marginTop: 18 }}>
//           <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>
//             <span style={{ fontWeight: 600 }}>Workflow Progress</span>
//             <span>{completedCount}/{STAGES.length} stages · {progress}%</span>
//           </div>
//           <div style={{ background: T.border, borderRadius: 8, height: 8 }}>
//             <div style={{ background: `linear-gradient(90deg,#2563eb,#16a34a)`, borderRadius: 8, height: "100%", width: `${progress}%`, transition: "width 0.5s" }} />
//           </div>
//         </div>
//         {/* Key dates */}
//         <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
//           {[
//             { label: "PO Date",   val: order.poDate },
//             { label: "MFC Plan",  val: order.plan.MFC },
//             { label: "BOM Plan",  val: order.plan.BOM },
//             { label: "MDCC Plan", val: order.plan.MDCC },
//             { label: "RFD Plan",  val: order.plan.RFD },
//             { label: "RFD Actual",val: order.actuals?.P31 },
//           ].map(k => (
//             <div key={k.label} style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 14px", minWidth: 115 }}>
//               <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 3, fontWeight: 600, letterSpacing: "0.05em" }}>{k.label.toUpperCase()}</div>
//               <div style={{ fontSize: 13, fontWeight: 700, color: k.val ? T.textPrimary : T.textMuted }}>{k.val || "—"}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Stage Table */}
//       <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "auto", maxHeight: "280px" }}>
//         <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 14 }}>Stage-wise Workflow</div>
//         <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
//          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
//             <tr style={{ background: T.tableHead }}>
//               {["Stage", "Department", "Milestone", "Plan Date", "Actual Date", "Days Diff", "Status", "Action"].map(h => (
//                 <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: T.textMuted, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", letterSpacing: "0.05em" }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {STAGES.map((s, i) => {
//               const planDate = order.plan[s.id];
//               const actual = order.actuals[s.id];
//               const diff = actual && planDate ? daysDiff(planDate, actual) : null;
//               const isOverdue = !actual && planDate && planDate < today;
//               const done = !!actual;
//               const editable = canEdit(s.dept);
//               const dc = DEPT_COLORS[s.dept] || "#6b7280";

//               return (
//                 <tr key={s.id} style={{ borderBottom: `1px solid ${T.border}`,
//                   background: done ? "#f0fdf4" : isOverdue ? "#fff5f5" : i % 2 === 0 ? T.tableRow : T.tableRowAlt }}>
                  
//                   <td style={{ padding: "9px 14px", fontWeight: 700, color: T.textMuted, fontSize: 12 }}>{s.id}</td>
//                   <td style={{ padding: "9px 14px" }}>
//                     <span style={{ background: `${dc}15`, color: dc, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{s.dept}</span>
//                   </td>
//                   <td style={{ padding: "9px 14px", fontWeight: 500 }}>{s.label}</td>

//                   {/* Plan Date column – now editable for P17 */}
//                   <td style={{ padding: "9px 14px", color: planDate ? T.textSecondary : T.textMuted }}>
//                     {planDate || "—"}
//                     {editable && s.id === "P17" && editingPlan !== s.id && (
//                       <button
//                         onClick={() => { setEditingPlan(s.id); setPlanDateVal(planDate || ""); }}
//                         style={{ marginLeft: 8, background: T.brandLight, border: "none", color: T.brand, padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}
//                         title="Edit plan date"
//                       >
//                         ✎
//                       </button>
//                     )}
//                     {editingPlan === s.id && (
//                       <div style={{ display: "inline-flex", gap: 4, marginLeft: 8 }}>
//                         <input
//                           type="date"
//                           value={planDateVal}
//                           onChange={e => setPlanDateVal(e.target.value)}
//                           style={{ width: 130, background: T.inputBg, border: `1px solid ${T.brand}`, color: T.textPrimary, padding: "2px 4px", borderRadius: 4, fontSize: 11 }}
//                         />
//                         <button
//                           onClick={() => { onUpdatePlan(order.id, s.id, planDateVal); setEditingPlan(null); }}
//                           style={{ background: T.success, border: "none", color: "#fff", padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}
//                         >
//                           ✓
//                         </button>
//                         <button
//                           onClick={() => setEditingPlan(null)}
//                           style={{ background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textSecondary, padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}
//                         >
//                           ✗
//                         </button>
//                       </div>
//                     )}
//                   </td>

//                   {/* Actual Date column */}
//                   <td style={{ padding: "9px 14px" }}>
//                     {editingActual === s.id ? (
//                       <div style={{ display: "flex", gap: 6 }}>
//                         <input type="date" value={actualDateVal} onChange={e => setActualDateVal(e.target.value)}
//                           style={{ background: T.inputBg, border: `1px solid ${T.brand}`, color: T.textPrimary, padding: "4px 8px", borderRadius: 6, fontSize: 12 }} />
//                         <button onClick={() => { onUpdateActual(order.id, s.id, actualDateVal); setEditingActual(null); }}
//                           style={{ background: T.success, border: "none", color: "#fff", padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✓</button>
//                         <button onClick={() => setEditingActual(null)}
//                           style={{ background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textSecondary, padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontSize: 12 }}>✗</button>
//                       </div>
//                     ) : (
//                       <span style={{ color: done ? T.success : T.textMuted, fontWeight: done ? 600 : 400 }}>{actual || "Pending"}</span>
//                     )}
//                   </td>

//                   <td style={{ padding: "9px 14px" }}>
//                     {diff !== null && (
//                       <span style={{ color: diff > 0 ? T.danger : diff < 0 ? T.success : T.textMuted, fontWeight: 700, fontSize: 12 }}>
//                         {diff > 0 ? `+${diff}d` : diff < 0 ? `${diff}d` : "On time"}
//                       </span>
//                     )}
//                   </td>

//                   <td style={{ padding: "9px 14px" }}>
//                     {done
//                       ? <span style={{ color: T.success, fontSize: 11, fontWeight: 700, background: T.successBg, padding: "2px 8px", borderRadius: 20 }}>✅ DONE</span>
//                       : isOverdue
//                         ? <span style={{ color: T.danger, fontSize: 11, fontWeight: 700, background: T.dangerBg, padding: "2px 8px", borderRadius: 20 }}>⚠ OVERDUE</span>
//                         : planDate
//                           ? <span style={{ color: T.warning, fontSize: 11, fontWeight: 700, background: T.warningBg, padding: "2px 8px", borderRadius: 20 }}>🕐 PENDING</span>
//                           : <span style={{ color: T.textMuted, fontSize: 11 }}>—</span>}
//                   </td>

//                   <td style={{ padding: "9px 14px" }}>
//                     {editable && !done && (
//                       <button onClick={() => { setEditingActual(s.id); setActualDateVal(today); }}
//                         style={{ background: T.brandLight, border: "none", color: T.brand, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
//                         Enter Actual
//                       </button>
//                     )}
//                     {done && editable && (
//                       <button onClick={() => { setEditingActual(s.id); setActualDateVal(actual); }}
//                         style={{ background: T.cardAlt, border: `1px solid ${T.borderMid}`, color: T.textSecondary, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
//                         Edit
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// ─── NEW ORDER MODAL ──────────────────────────────────────────────────────────
// function NewOrderModal({ onClose, onSave }) {
//   const [form, setForm] = useState({
//     mode: "PO", customer: "", poDate: new Date().toISOString().split("T")[0],
//     type: "Domestic", region: "West", project: "", site: "",
//     productType: "", category: "IDT-RPT-STD-3W", rating: "",
//     voltage: "", paymentTerms: "", ldAppl: false, custDOD: "",
//     desiredDOD: "", soNo: "", unitRate: "", plant: "", status: "New",
//   });
//   function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

//   const inputStyle = {
//     width: "100%", background: T.inputBg, border: `1px solid ${T.border}`,
//     color: T.textPrimary, padding: "9px 11px", borderRadius: 8,
//     fontSize: 13, boxSizing: "border-box", outline: "none"
//   };

//   return (
//     <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
//       <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, width: 720, maxHeight: "88vh", overflow: "auto", padding: 30, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
//           <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary }}>Create New Order</div>
//           <button onClick={onClose} style={{ background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textSecondary, cursor: "pointer", width: 32, height: 32, borderRadius: 8, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
//         </div>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
//           {[
//             ["Customer Name", "customer", "text"],
//             ["Mode", "mode", "select", ["PO", "LOI", "FOA"]],
//             ["PO Date", "poDate", "date"],
//             ["Status", "status", "select", ["New", "WIP", "Delayed"]],
//             ["Type", "type", "select", ["Domestic", "Export"]],
//             ["Region", "region", "select", ["West", "North", "South", "East"]],
//             ["Project", "project", "text"],
//             ["Project Site", "site", "text"],
//             ["Product Type", "productType", "text"],
//             ["Rating (KVA)", "rating", "text"],
//             ["Voltage Ratio", "voltage", "text"],
//             ["Payment Terms", "paymentTerms", "text"],
//             ["Customer DOD", "custDOD", "date"],
//             ["Desired DOD", "desiredDOD", "date"],
//             ["SO Number", "soNo", "text"],
//             ["Unit Rate (₹)", "unitRate", "number"],
//             ["Plant", "plant", "text"],
//           ].map(([label, key, type, options]) => (
//             <div key={key}>
//               <label style={{ fontSize: 11, color: T.textMuted, display: "block", marginBottom: 5, fontWeight: 600, letterSpacing: "0.05em" }}>{label.toUpperCase()}</label>
//               {type === "select" ? (
//                 <select value={form[key]} onChange={e => set(key, e.target.value)} style={inputStyle}>
//                   {options.map(o => <option key={o}>{o}</option>)}
//                 </select>
//               ) : (
//                 <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} style={inputStyle} />
//               )}
//             </div>
//           ))}
//           <div style={{ gridColumn: "1/-1" }}>
//             <label style={{ fontSize: 11, color: T.textMuted, display: "block", marginBottom: 5, fontWeight: 600, letterSpacing: "0.05em" }}>PRODUCT CATEGORY</label>
//             <select value={form.category} onChange={e => set("category", e.target.value)} style={inputStyle}>
//               {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id} — {c.name}</option>)}
//             </select>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <input type="checkbox" id="ld" checked={form.ldAppl} onChange={e => set("ldAppl", e.target.checked)}
//               style={{ width: 16, height: 16, cursor: "pointer" }} />
//             <label htmlFor="ld" style={{ fontSize: 13, cursor: "pointer", fontWeight: 500 }}>LD Applicable</label>
//           </div>
//         </div>
//         <div style={{ display: "flex", gap: 12, marginTop: 26, justifyContent: "flex-end" }}>
//           <button onClick={onClose}
//             style={{ padding: "10px 24px", background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
//             Cancel
//           </button>
//           <button onClick={() => { if (form.customer && form.poDate && form.custDOD) onSave(form); }}
//             style={{ padding: "10px 28px", background: T.brand, border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
//             Create Order & Generate Plan
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }