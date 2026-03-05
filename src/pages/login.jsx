import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const ROLE_CONFIG = {
  admin:    { label: "Admin",    icon: "🛡️", color: "#1e40af" },
  planner:  { label: "Planner",  icon: "📋", color: "#7c3aed" },
  sales:    { label: "Sales",    icon: "💼", color: "#059669" },
  design:   { label: "Design",   icon: "✏️", color: "#0891b2" },
  purchase: { label: "Purchase", icon: "🛒", color: "#d97706" },
  testing:  { label: "Testing",  icon: "🔬", color: "#65a30d" },
  finance:  { label: "Finance",  icon: "💰", color: "#dc2626" },
  dispatch: { label: "Dispatch", icon: "🚚", color: "#ea580c" },
};

const ERROR_MESSAGES = {
  "auth/user-not-found":      "No account found with this email.",
  "auth/wrong-password":      "Incorrect password. Please try again.",
  "auth/invalid-email":       "Please enter a valid email address.",
  "auth/too-many-requests":   "Too many attempts. Please wait and try again.",
  "auth/invalid-credential":  "Invalid email or password.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

export default function LoginPage() {
  const navigate              = useNavigate();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
// const location = useLocation();     
//   const [error, setError] = useState(location.state?.error || ""); // new

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await auth.signInWithEmailAndPassword(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || err.message);
    }
    setLoading(false);
  }

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* Left panel — branding */}
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.logo}>
            <span style={s.logoIcon}>P</span>
            <div>
              <div style={s.logoTitle}>PlanTrack Pro</div>
              <div style={s.logoSub}>Transformer Manufacturing ERP</div>
            </div>
          </div>

          <div style={s.tagline}>
            Centralized Planning.<br />
            <span style={{ color: "#93c5fd" }}>Role-Based Access.</span>
          </div>
          <p style={s.desc}>
            Track every stage of your transformer manufacturing pipeline — from
            PO to dispatch — with real-time alerts and department-level visibility.
          </p>

          {/* Role chips */}
          <div style={s.roleGrid}>
            {Object.entries(ROLE_CONFIG).map(([k, v]) => (
              <div key={k} style={{ ...s.roleChip, borderColor: v.color + "55" }}>
                <span>{v.icon}</span>
                <span style={{ color: v.color, fontWeight: 700, fontSize: 12 }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={s.right}>
        <div style={s.card} className="login-card">
          <div style={s.cardHeader}>
            <div style={s.cardTitle}>Welcome back</div>
            <div style={s.cardSub}>Sign in to your account</div>
          </div>

          <form onSubmit={handleLogin} style={{ marginTop: 24 }}>
            {/* Email */}
            <div style={s.field}>
              <label style={s.label}>EMAIL ADDRESS</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>✉</span>
                <input
                  className="auth-input"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={s.input}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ ...s.field, marginBottom: 0 }}>
              <label style={s.label}>PASSWORD</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔒</span>
                <input
                  className="auth-input"
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...s.input, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={s.eyeBtn}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={s.errorBox} className="shake">
                <span>❌</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-btn"
              style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                  <span style={s.btnSpinner} /> Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          {/* Info box */}
          <div style={s.infoBox}>
            <div style={s.infoTitle}>🔧 How to set up users</div>
            <ol style={s.infoList}>
              <li>Firebase Console → Authentication → Add user</li>
              <li>Firestore → <code>users</code> collection → doc with <code>uid</code></li>
              <li>Add fields: <code>name</code>, <code>role</code>, <code>plant</code></li>
            </ol>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
              Role values: admin · planner · sales · design · purchase · testing · finance · dispatch
            </div>
          </div>

          <div style={s.projectBadge}>
            🔗 Project: <strong>centralized-planning</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif",
  },
  left: {
    flex: "0 0 45%",
    background: "linear-gradient(160deg,#1e3a8a 0%,#1d4ed8 50%,#2563eb 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
  },
  leftInner: { maxWidth: 380 },
  logo: { display: "flex", alignItems: "center", gap: 14, marginBottom: 40 },
  logoIcon: {
    width: 48, height: 48, background: "rgba(255,255,255,0.15)",
    borderRadius: 12, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 22, fontWeight: 900,
    color: "#fff", border: "1px solid rgba(255,255,255,0.25)",
  },
  logoTitle: { fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" },
  logoSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  tagline: { fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: 16, letterSpacing: "-0.5px" },
  desc: { fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 32 },
  roleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  roleChip: {
    background: "rgba(255,255,255,0.08)", border: "1px solid",
    borderRadius: 8, padding: "8px 12px",
    display: "flex", alignItems: "center", gap: 7,
  },
  right: {
    flex: 1, background: "#f4f6f9",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 24px",
  },
  card: {
    background: "#fff", borderRadius: 20, padding: "36px 36px 28px",
    boxShadow: "0 8px 40px rgba(30,64,175,0.10), 0 2px 8px rgba(0,0,0,0.06)",
    width: "100%", maxWidth: 420,
  },
  cardHeader: { borderBottom: "1px solid #f1f5f9", paddingBottom: 20 },
  cardTitle: { fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" },
  cardSub: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  field: { marginBottom: 18 },
  label: { fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", display: "block", marginBottom: 7 },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: 12, fontSize: 15, pointerEvents: "none", zIndex: 1 },
  input: {
    width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
    border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14,
    background: "#f8fafc", color: "#0f172a", boxSizing: "border-box",
    outline: "none", transition: "all 0.2s",
  },
  eyeBtn: {
    position: "absolute", right: 10, background: "none", border: "none",
    cursor: "pointer", fontSize: 15, padding: 4,
  },
  errorBox: {
    background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 9,
    padding: "10px 14px", marginTop: 14, fontSize: 13, color: "#b91c1c",
    fontWeight: 500, display: "flex", alignItems: "center", gap: 8,
  },
  submitBtn: {
    width: "100%", marginTop: 22, padding: "13px",
    background: "linear-gradient(135deg,#1e40af,#3b82f6)",
    color: "#fff", border: "none", borderRadius: 11,
    fontSize: 15, fontWeight: 700, letterSpacing: "0.02em",
    transition: "all 0.2s",
  },
  btnSpinner: {
    width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff", borderRadius: "50%",
    animation: "spin 0.8s linear infinite", display: "inline-block",
  },
  infoBox: {
    marginTop: 24, background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 10, padding: "14px 16px",
  },
  infoTitle: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 },
  infoList: { fontSize: 12, color: "#64748b", lineHeight: 1.8, margin: "0 0 0 16px", padding: 0 },
  projectBadge: {
    marginTop: 14, textAlign: "center", fontSize: 12,
    color: "#94a3b8", padding: "8px 0",
  },
};

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
  .login-card { animation: fadeUp 0.45s ease forwards; }
  .shake { animation: shake 0.35s ease; }
  .auth-input:focus { border-color: #1e40af !important; box-shadow: 0 0 0 3px #dbeafe; background: #fff !important; }
  .login-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(30,64,175,0.35); }
`;