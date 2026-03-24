import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import SubNav from "../components/SubNav";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const PHANTOM_NAV = [
  { path: "/app/phantom", label: "Audit", end: true },
  { path: "/app/phantom/history", label: "Historique" },
  { path: "/app/phantom/recommendations", label: "Recommandations" },
];

const CATEGORY_LABELS = {
  performance: "Performance",
  accessibility: "Accessibilit\u00e9",
  seo: "SEO",
  bestPractices: "Bonnes pratiques",
};

const CATEGORY_COLORS = {
  performance: "#8b5cf6",
  accessibility: "#3b82f6",
  seo: "#10b981",
  bestPractices: "#f59e0b",
};

const SEVERITY_COLORS = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#6366f1",
};

function ScoreCircle({ score, label, color, size = 80 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 90 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#2a2d3a" strokeWidth="5" />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color || scoreColor}
            strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ fontSize: size > 70 ? "22px" : "18px", fontWeight: 600, color: "#f0f0f3" }}>{score}</span>
        </div>
      </div>
      <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>{label}</div>
    </div>
  );
}

function CWVItem({ label, data }) {
  if (!data) return null;
  const colors = { good: "#10b981", "needs-improvement": "#f59e0b", poor: "#ef4444" };
  return (
    <div style={{
      padding: "14px 18px", background: "#1e2029", border: "1px solid #2a2d3a",
      borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
    }}>
      <div>
        <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>{label}</div>
        <div style={{ fontSize: "17px", fontWeight: 600, color: "#f0f0f3" }}>
          {data.display || `${data.value}${data.unit}`}
        </div>
      </div>
      <div style={{
        width: "10px", height: "10px", borderRadius: "50%",
        background: colors[data.status] || "#9ca3af"
      }} />
    </div>
  );
}

function ComparisonArrow({ diff }) {
  if (diff === 0) return <span style={{ color: "#9ca3af", fontSize: "13px" }}>=</span>;
  const isUp = diff > 0;
  return (
    <span style={{ color: isUp ? "#10b981" : "#ef4444", fontSize: "13px", fontWeight: 600 }}>
      {isUp ? "\u2191" : "\u2193"} {isUp ? "+" : ""}{diff}
    </span>
  );
}

export default function PhantomDashboardPage() {
  const api = useApi();
  const { token } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  // Comparison state
  const [previousAudits, setPreviousAudits] = useState([]);
  const [selectedCompareId, setSelectedCompareId] = useState("");
  const [comparison, setComparison] = useState(null);
  const [comparingLoading, setComparingLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const phases = [
    "Connexion au site...",
    "Lancement de Lighthouse...",
    "Analyse des performances...",
    "V\u00e9rification de l'accessibilit\u00e9...",
    "Audit SEO...",
    "Analyse IA des r\u00e9sultats...",
  ];

  // Load previous audits for comparison when result comes in
  useEffect(() => {
    if (result?.auditId) {
      loadPreviousAudits();
    }
  }, [result?.auditId]);

  const loadPreviousAudits = async () => {
    try {
      const domain = new URL(url.trim().startsWith("http") ? url.trim() : "https://" + url.trim()).hostname.replace("www.", "");
      const data = await api.get(`/api/phantom/history?domain=${encodeURIComponent(domain)}&limit=10`);
      const others = (data.audits || []).filter(a => a._id !== result?.auditId);
      setPreviousAudits(others);
    } catch {
      setPreviousAudits([]);
    }
  };

  const runAudit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);
    setComparison(null);
    setSelectedCompareId("");
    setPreviousAudits([]);

    for (let i = 0; i < phases.length; i++) {
      setPhase(phases[i]);
      setProgress(Math.round(((i + 1) / phases.length) * 85));
      await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    }

    try {
      const data = await api.post("/api/phantom/audit", { url: url.trim() });
      setProgress(100);
      setPhase("Termin\u00e9");
      setTimeout(() => setResult(data), 300);
    } catch (err) {
      setError(err.message || "Erreur lors de l'audit");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async (compareWithId) => {
    if (!compareWithId || !result?.auditId) return;
    setComparingLoading(true);
    setSelectedCompareId(compareWithId);
    try {
      const data = await api.post(`/api/phantom/compare/${result.auditId}`, { compareWithId });
      setComparison(data);
    } catch (err) {
      console.error("Compare error:", err);
      setComparison(null);
    } finally {
      setComparingLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result?.auditId) return;
    setPdfLoading(true);
    try {
      const res = await fetch(`${API}/api/phantom/audit/${result.auditId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur PDF");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `phantom-audit-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const filteredIssues = result?.issues?.filter(i => filter === "all" || i.severity === filter) || [];

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <SubNav color="#8b5cf6" items={PHANTOM_NAV} />
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#8b5cf6" }} />
          <span style={{ fontSize: "12px", color: "#8b5cf6", fontWeight: 500 }}>Phantom</span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>
          Audit de performance
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>
          Analysez les performances, le SEO et l'accessibilit\u00e9 de n'importe quel site web.
        </p>
      </div>

      {/* URL Input */}
      <div style={{
        display: "flex", gap: "10px", marginBottom: "32px",
        padding: "20px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
      }}>
        <input
          type="text" value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://exemple.com"
          onKeyDown={e => e.key === "Enter" && !loading && runAudit()}
          style={{
            flex: 1, padding: "12px 16px", background: "#1e2029",
            border: "1px solid #2a2d3a", borderRadius: "8px",
            color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit",
            outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={e => { e.target.style.borderColor = "#8b5cf6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15)"; }}
          onBlur={e => { e.target.style.borderColor = "#2a2d3a"; e.target.style.boxShadow = "none"; }}
        />
        <button onClick={runAudit} disabled={loading || !url.trim()}
          style={{
            padding: "12px 28px", background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", color: "#fff",
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500,
            cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
            opacity: loading || !url.trim() ? 0.5 : 1, whiteSpace: "nowrap",
            boxShadow: "0 4px 16px rgba(139,92,246,0.25)",
          }}>
          {loading ? "Analyse..." : "Lancer l'audit"}
        </button>
      </div>

      {/* Progress */}
      {loading && (
        <div style={{
          padding: "24px", background: "#1e2029", border: "1px solid #8b5cf630",
          borderLeft: "3px solid #8b5cf6",
          borderRadius: "10px", marginBottom: "24px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>{phase}</span>
            <span style={{ fontSize: "14px", color: "#8b5cf6", fontWeight: 500 }}>{progress}%</span>
          </div>
          <div style={{ height: "4px", background: "#2a2d3a", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "#8b5cf6", borderRadius: "2px",
              width: progress + "%", transition: "width 0.5s ease"
            }} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: "16px 20px", background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px",
          color: "#f87171", fontSize: "14px", marginBottom: "24px"
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Action bar: PDF + Compare */}
          <div style={{
            display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center",
          }}>
            {result.auditId && (
              <button onClick={handleDownloadPdf} disabled={pdfLoading}
                style={{
                  padding: "10px 20px", background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", color: "#fff",
                  border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                  cursor: pdfLoading ? "wait" : "pointer", fontFamily: "inherit",
                  opacity: pdfLoading ? 0.6 : 1, display: "flex", alignItems: "center", gap: "8px",
                  boxShadow: "0 4px 16px rgba(139,92,246,0.25)",
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {pdfLoading ? "G\u00e9n\u00e9ration..." : "T\u00e9l\u00e9charger le rapport PDF"}
              </button>
            )}

            {result.auditId && previousAudits.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#9ca3af" }}>Comparer avec :</span>
                <select
                  value={selectedCompareId}
                  onChange={e => handleCompare(e.target.value)}
                  style={{
                    padding: "8px 12px", background: "#1e2029", border: "1px solid #2a2d3a",
                    borderRadius: "8px", color: "#f0f0f3", fontSize: "13px", fontFamily: "inherit",
                    cursor: "pointer", outline: "none", minWidth: "220px",
                  }}
                >
                  <option value="">Comparer avec un audit pr\u00e9c\u00e9dent</option>
                  {previousAudits.map(a => (
                    <option key={a._id} value={a._id}>
                      {formatDate(a.createdAt)} — Score {a.scores?.global || 0}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Comparison results */}
          {comparingLoading && (
            <div style={{
              padding: "20px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "10px", marginBottom: "16px", textAlign: "center", color: "#9ca3af", fontSize: "14px"
            }}>
              Comparaison en cours...
            </div>
          )}

          {comparison && !comparingLoading && (
            <div style={{
              padding: "24px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderLeft: "3px solid #a78bfa", borderRadius: "10px", marginBottom: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }}>
              <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "18px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
                Comparaison avec l'audit du {formatDate(comparison.previous?.date)}
              </div>

              {/* Side-by-side scores */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "20px" }}>
                {["global", "performance", "accessibility", "seo", "bestPractices"].map(key => {
                  const comp = comparison.comparison?.[key];
                  if (!comp) return null;
                  const labels = { global: "Global", performance: "Perf.", accessibility: "A11y", seo: "SEO", bestPractices: "BP" };
                  return (
                    <div key={key} style={{
                      padding: "14px 10px", background: "#161820", border: "1px solid #2a2d3a",
                      borderRadius: "8px", textAlign: "center"
                    }}>
                      <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px" }}>{labels[key]}</div>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>{comp.previous}</span>
                        <span style={{ fontSize: "14px", color: "#9ca3af" }}>{"\u2192"}</span>
                        <span style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3" }}>{comp.current}</span>
                      </div>
                      <div style={{ marginTop: "6px" }}>
                        <ComparisonArrow diff={comp.diff} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resolved / New issues */}
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{
                  flex: 1, padding: "12px 16px", background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.15)", borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "18px", fontWeight: 600, color: "#10b981" }}>{comparison.resolvedIssues || 0}</div>
                  <div style={{ fontSize: "12px", color: "#9ca3af" }}>Probl\u00e8mes r\u00e9solus</div>
                </div>
                <div style={{
                  flex: 1, padding: "12px 16px", background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "18px", fontWeight: 600, color: "#ef4444" }}>{comparison.newIssues || 0}</div>
                  <div style={{ fontSize: "12px", color: "#9ca3af" }}>Nouveaux probl\u00e8mes</div>
                </div>
              </div>
            </div>
          )}

          {/* Scores */}
          <div style={{
            padding: "28px", background: "#1e2029", border: "1px solid #2a2d3a",
            borderLeft: "3px solid #8b5cf6",
            borderRadius: "10px", marginBottom: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "24px", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} />Scores Lighthouse</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", justifyItems: "center" }}>
              <ScoreCircle score={result.scores.global || Math.round((result.scores.performance + result.scores.accessibility + result.scores.seo + (result.scores.bestPractices || 0)) / 4)} label="Global" size={90} color="#8b5cf6" />
              <ScoreCircle score={result.scores.performance} label="Performance" size={72} />
              <ScoreCircle score={result.scores.accessibility} label="Accessibilit\u00e9" size={72} />
              <ScoreCircle score={result.scores.seo} label="SEO" size={72} />
              <ScoreCircle score={result.scores.bestPractices || result.scores.conversion || 0} label="Bonnes pratiques" size={72} />
            </div>
          </div>

          {/* Core Web Vitals */}
          {result.coreWebVitals && (
            <div style={{
              padding: "24px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderLeft: "3px solid #3b82f6",
              borderRadius: "10px", marginBottom: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }}>
              <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />Core Web Vitals</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                <CWVItem label="LCP" data={result.coreWebVitals.lcp} />
                <CWVItem label="FCP" data={result.coreWebVitals.fcp} />
                <CWVItem label="CLS" data={result.coreWebVitals.cls} />
                <CWVItem label="TBT" data={result.coreWebVitals.tbt} />
                <CWVItem label="Speed Index" data={result.coreWebVitals.speedIndex} />
                <CWVItem label="TTI" data={result.coreWebVitals.tti} />
              </div>
            </div>
          )}

          {/* AI Summary */}
          {result.summary && (
            <div style={{
              padding: "20px 24px", background: "rgba(139,92,246,0.06)",
              border: "1px solid rgba(139,92,246,0.15)", borderRadius: "10px",
              marginBottom: "16px"
            }}>
              <div style={{ fontSize: "12px", color: "#8b5cf6", marginBottom: "8px", fontWeight: 500 }}>Analyse IA</div>
              <p style={{ fontSize: "14px", color: "#d1d5db", lineHeight: 1.7, margin: 0 }}>{result.summary}</p>
            </div>
          )}

          {/* Issues */}
          <div style={{
            padding: "24px", background: "#1e2029", border: "1px solid #2a2d3a",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ fontSize: "13px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />Probl\u00e8mes d\u00e9tect\u00e9s ({result.issues?.length || 0})
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["all", "critical", "warning", "info"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{
                      padding: "4px 12px", borderRadius: "4px", border: "none",
                      fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                      background: filter === f ? (f === "all" ? "#2a2d3a" : SEVERITY_COLORS[f] + "20") : "transparent",
                      color: filter === f ? (f === "all" ? "#f0f0f3" : SEVERITY_COLORS[f]) : "#9ca3af",
                    }}>
                    {f === "all" ? "Tous" : f === "critical" ? "Critique" : f === "warning" ? "Attention" : "Info"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredIssues.map((issue, i) => (
                <div key={i} style={{
                  padding: "16px 20px", background: "#1e2029",
                  border: "1px solid #2a2d3a", borderRadius: "8px",
                  borderLeft: `3px solid ${SEVERITY_COLORS[issue.severity] || "#9ca3af"}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "4px",
                      background: (SEVERITY_COLORS[issue.severity] || "#9ca3af") + "18",
                      color: SEVERITY_COLORS[issue.severity] || "#9ca3af",
                    }}>
                      {issue.severity === "critical" ? "Critique" : issue.severity === "warning" ? "Attention" : "Info"}
                    </span>
                    <span style={{
                      fontSize: "11px", color: CATEGORY_COLORS[issue.category] || "#9ca3af"
                    }}>
                      {CATEGORY_LABELS[issue.category] || issue.category}
                    </span>
                    {issue.impact && (
                      <span style={{ fontSize: "11px", color: "#10b981", marginLeft: "auto" }}>
                        {issue.impact}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "14px", color: "#d1d5db", marginBottom: "4px", fontWeight: 500 }}>
                    {issue.title}
                  </div>
                  {issue.description && (
                    <div style={{ fontSize: "13px", color: "#9ca3af", lineHeight: 1.5, marginBottom: issue.fix ? "6px" : 0 }}>
                      {issue.description}
                    </div>
                  )}
                  {issue.fix && (
                    <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.5 }}>
                      <span style={{ color: "#8b5cf6" }}>Solution : </span>{issue.fix}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* New audit */}
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <button onClick={() => { setResult(null); setUrl(""); setError(""); setProgress(0); setComparison(null); setSelectedCompareId(""); setPreviousAudits([]); }}
              style={{
                padding: "10px 24px", background: "transparent",
                border: "1px solid #2a2d3a", borderRadius: "8px",
                color: "#6b7280", fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
              }}>
              Nouvel audit
            </button>
          </div>
        </>
      )}
    </div>
  );
}
