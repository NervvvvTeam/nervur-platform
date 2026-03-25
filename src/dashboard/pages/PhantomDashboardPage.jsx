import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import SubNav from "../components/SubNav";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const PHANTOM_NAV = [
  { path: "/app/phantom", label: "Audit", end: true },
  { path: "/app/phantom/history", label: "Historique" },
  { path: "/app/phantom/recommendations", label: "Recommandations" },
  { path: "/app/phantom/competitors", label: "Concurrents" },
  { path: "/app/phantom/schedule", label: "Planification" },
];

const CATEGORY_LABELS = {
  performance: "Performance",
  accessibility: "Accessibilité",
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
    <div className="text-center">
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#2a2d3a" strokeWidth="5" />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color || scoreColor}
            strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-out" />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="font-semibold text-[#f0f0f3]" style={{ fontSize: size > 70 ? "22px" : "18px" }}>{score}</span>
        </div>
      </div>
      <div className="text-xs text-[#9ca3af] mt-2">{label}</div>
    </div>
  );
}

function CWVItem({ label, data }) {
  if (!data) return null;
  const colors = { good: "#10b981", "needs-improvement": "#f59e0b", poor: "#ef4444" };
  return (
    <div className="px-[18px] py-[14px] bg-[#1e2029] border border-[#2a2d3a] rounded-lg flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <div>
        <div className="text-[11px] text-[#9ca3af] mb-1">{label}</div>
        <div className="text-[17px] font-semibold text-[#f0f0f3]">
          {data.display || `${data.value}${data.unit}`}
        </div>
      </div>
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors[data.status] || "#9ca3af" }} />
    </div>
  );
}

function ComparisonArrow({ diff }) {
  if (diff === 0) return <span className="text-[#9ca3af] text-[13px]">=</span>;
  const isUp = diff > 0;
  return (
    <span className="text-[13px] font-semibold" style={{ color: isUp ? "#10b981" : "#ef4444" }}>
      {isUp ? "↑" : "↓"} {isUp ? "+" : ""}{diff}
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
    "Vérification de l'accessibilité...",
    "Audit SEO...",
    "Analyse IA des résultats...",
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

  const isValidUrl = (input) => {
    try {
      const urlStr = input.trim().startsWith("http") ? input.trim() : "https://" + input.trim();
      const parsed = new URL(urlStr);
      return parsed.hostname && parsed.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const runAudit = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    if (!isValidUrl(trimmed)) {
      setError("URL invalide. Exemple : https://exemple.com");
      return;
    }

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
      const data = await api.post("/api/phantom/audit", { url: trimmed });
      if (!data || !data.scores) {
        throw new Error("Réponse invalide du serveur. Réessayez.");
      }
      setProgress(100);
      setPhase("Terminé");
      setTimeout(() => setResult(data), 300);
    } catch (err) {
      setError(err.message || "Erreur lors de l'audit. Vérifiez l'URL et réessayez.");
      setProgress(0);
      setPhase("");
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

  const filteredIssues = (result?.issues || []).filter(i => filter === "all" || i.severity === filter);

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-[900px]">
      <SubNav color="#8b5cf6" items={PHANTOM_NAV} />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
          <span className="text-xs text-[#8b5cf6] font-medium">Phantom</span>
        </div>
        <h1 className="text-[22px] font-semibold text-[#f0f0f3] mb-1.5">
          Audit de performance
        </h1>
        <p className="text-sm text-[#9ca3af]">
          Analysez les performances, le SEO et l'accessibilité de n'importe quel site web.
        </p>
      </div>

      {/* URL Input */}
      <div className="flex gap-2.5 mb-8 p-5 bg-[#1e2029] border border-[#2a2d3a] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <input
          type="text" value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://exemple.com"
          onKeyDown={e => e.key === "Enter" && !loading && runAudit()}
          className="flex-1 px-4 py-3 bg-[#1e2029] border border-[#2a2d3a] rounded-lg text-[#f0f0f3] text-sm font-[inherit] outline-none box-border transition-[border-color,box-shadow] duration-200 focus:border-[#8b5cf6] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
        />
        <button onClick={runAudit} disabled={loading || !url.trim()}
          className="px-7 py-3 bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] text-white border-none rounded-lg text-sm font-medium font-[inherit] whitespace-nowrap shadow-[0_4px_16px_rgba(139,92,246,0.25)] disabled:opacity-50"
          style={{ cursor: loading ? "wait" : "pointer" }}>
          {loading ? "Analyse..." : "Lancer l'audit"}
        </button>
      </div>

      {/* Progress */}
      {loading && (
        <div className="p-6 bg-[#1e2029] border border-[#8b5cf630] border-l-[3px] border-l-[#8b5cf6] rounded-[10px] mb-6">
          <div className="flex justify-between mb-3">
            <span className="text-sm text-[#6b7280]">{phase}</span>
            <span className="text-sm text-[#8b5cf6] font-medium">{progress}%</span>
          </div>
          <div className="h-1 bg-[#2a2d3a] rounded-sm overflow-hidden">
            <div className="h-full bg-[#8b5cf6] rounded-sm transition-[width] duration-500 ease-out" style={{ width: progress + "%" }} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-5 py-4 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] rounded-[10px] text-[#f87171] text-sm mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Action bar: PDF + Compare */}
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            {result.auditId && (
              <button onClick={handleDownloadPdf} disabled={pdfLoading}
                className="px-5 py-2.5 bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] text-white border-none rounded-lg text-[13px] font-medium font-[inherit] flex items-center gap-2 shadow-[0_4px_16px_rgba(139,92,246,0.25)] disabled:opacity-60"
                style={{ cursor: pdfLoading ? "wait" : "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {pdfLoading ? "Génération..." : "Télécharger le rapport PDF"}
              </button>
            )}

            {result.auditId && previousAudits.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#9ca3af]">Comparer avec :</span>
                <select
                  value={selectedCompareId}
                  onChange={e => handleCompare(e.target.value)}
                  className="px-3 py-2 bg-[#1e2029] border border-[#2a2d3a] rounded-lg text-[#f0f0f3] text-[13px] font-[inherit] cursor-pointer outline-none min-w-[220px]"
                >
                  <option value="">Comparer avec un audit précédent</option>
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
            <div className="p-5 bg-[#1e2029] border border-[#2a2d3a] rounded-[10px] mb-4 text-center text-[#9ca3af] text-sm">
              Comparaison en cours...
            </div>
          )}

          {comparison && !comparingLoading && (
            <div className="p-6 bg-[#1e2029] border border-[#2a2d3a] border-l-[3px] border-l-[#a78bfa] rounded-[10px] mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              <div className="text-[13px] text-[#9ca3af] mb-[18px] flex items-center gap-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-[#a78bfa] inline-block" />
                Comparaison avec l'audit du {formatDate(comparison.previous?.date)}
              </div>

              {/* Side-by-side scores */}
              <div className="grid grid-cols-5 gap-3 mb-5">
                {["global", "performance", "accessibility", "seo", "bestPractices"].map(key => {
                  const comp = comparison.comparison?.[key];
                  if (!comp) return null;
                  const labels = { global: "Global", performance: "Perf.", accessibility: "A11y", seo: "SEO", bestPractices: "BP" };
                  return (
                    <div key={key} className="px-2.5 py-[14px] bg-[#161820] border border-[#2a2d3a] rounded-lg text-center">
                      <div className="text-[11px] text-[#9ca3af] mb-2">{labels[key]}</div>
                      <div className="flex justify-center items-center gap-2">
                        <span className="text-xs text-[#6b7280]">{comp.previous}</span>
                        <span className="text-sm text-[#9ca3af]">{"→"}</span>
                        <span className="text-[15px] font-semibold text-[#f0f0f3]">{comp.current}</span>
                      </div>
                      <div className="mt-1.5">
                        <ComparisonArrow diff={comp.diff} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resolved / New issues */}
              <div className="flex gap-4">
                <div className="flex-1 px-4 py-3 bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.15)] rounded-lg">
                  <div className="text-lg font-semibold text-[#10b981]">{comparison.resolvedIssues || 0}</div>
                  <div className="text-xs text-[#9ca3af]">Problèmes résolus</div>
                </div>
                <div className="flex-1 px-4 py-3 bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] rounded-lg">
                  <div className="text-lg font-semibold text-[#ef4444]">{comparison.newIssues || 0}</div>
                  <div className="text-xs text-[#9ca3af]">Nouveaux problèmes</div>
                </div>
              </div>
            </div>
          )}

          {/* Scores */}
          <div className="p-7 bg-[#1e2029] border border-[#2a2d3a] border-l-[3px] border-l-[#8b5cf6] rounded-[10px] mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            <div className="text-[13px] text-[#9ca3af] mb-6 flex items-center gap-1.5"><span className="w-[5px] h-[5px] rounded-full bg-[#8b5cf6] inline-block" />Scores Lighthouse</div>
            <div className="grid grid-cols-5 gap-4 justify-items-center">
              <ScoreCircle score={result.scores.global || Math.round((result.scores.performance + result.scores.accessibility + result.scores.seo + (result.scores.bestPractices || 0)) / 4)} label="Global" size={90} color="#8b5cf6" />
              <ScoreCircle score={result.scores.performance} label="Performance" size={72} />
              <ScoreCircle score={result.scores.accessibility} label="Accessibilité" size={72} />
              <ScoreCircle score={result.scores.seo} label="SEO" size={72} />
              <ScoreCircle score={result.scores.bestPractices || result.scores.conversion || 0} label="Bonnes pratiques" size={72} />
            </div>
          </div>

          {/* Core Web Vitals */}
          {result.coreWebVitals && (
            <div className="p-6 bg-[#1e2029] border border-[#2a2d3a] border-l-[3px] border-l-[#3b82f6] rounded-[10px] mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              <div className="text-[13px] text-[#9ca3af] mb-4 flex items-center gap-1.5"><span className="w-[5px] h-[5px] rounded-full bg-[#3b82f6] inline-block" />Core Web Vitals</div>
              <div className="grid grid-cols-3 gap-2.5">
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
            <div className="px-6 py-5 bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.15)] rounded-[10px] mb-4">
              <div className="text-xs text-[#8b5cf6] mb-2 font-medium">Analyse IA</div>
              <p className="text-sm text-[#d1d5db] leading-[1.7] m-0">{result.summary}</p>
            </div>
          )}

          {/* Issues */}
          <div className="p-6 bg-[#1e2029] border border-[#2a2d3a] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center mb-[18px]">
              <div className="text-[13px] text-[#9ca3af] flex items-center gap-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-[#ef4444] inline-block" />Problèmes détectés ({result.issues?.length || 0})
              </div>
              <div className="flex gap-1.5">
                {["all", "critical", "warning", "info"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className="px-3 py-1 rounded border-none text-xs cursor-pointer font-[inherit]"
                    style={{
                      background: filter === f ? (f === "all" ? "#2a2d3a" : SEVERITY_COLORS[f] + "20") : "transparent",
                      color: filter === f ? (f === "all" ? "#f0f0f3" : SEVERITY_COLORS[f]) : "#9ca3af",
                    }}>
                    {f === "all" ? "Tous" : f === "critical" ? "Critique" : f === "warning" ? "Attention" : "Info"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {filteredIssues.map((issue, i) => (
                <div key={i} className="px-5 py-4 bg-[#1e2029] border border-[#2a2d3a] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                  style={{ borderLeft: `3px solid ${SEVERITY_COLORS[issue.severity] || "#9ca3af"}` }}>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded"
                      style={{
                        background: (SEVERITY_COLORS[issue.severity] || "#9ca3af") + "18",
                        color: SEVERITY_COLORS[issue.severity] || "#9ca3af",
                      }}>
                      {issue.severity === "critical" ? "Critique" : issue.severity === "warning" ? "Attention" : "Info"}
                    </span>
                    <span className="text-[11px]" style={{ color: CATEGORY_COLORS[issue.category] || "#9ca3af" }}>
                      {CATEGORY_LABELS[issue.category] || issue.category}
                    </span>
                    {issue.impact && (
                      <span className="text-[11px] text-[#10b981] ml-auto">
                        {issue.impact}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#d1d5db] mb-1 font-medium">
                    {issue.title}
                  </div>
                  {issue.description && (
                    <div className={`text-[13px] text-[#9ca3af] leading-normal ${issue.fix ? "mb-1.5" : ""}`}>
                      {issue.description}
                    </div>
                  )}
                  {issue.fix && (
                    <div className="text-[13px] text-[#6b7280] leading-normal">
                      <span className="text-[#8b5cf6]">Solution : </span>{issue.fix}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* New audit */}
          <div className="mt-6 text-center">
            <button onClick={() => { setResult(null); setUrl(""); setError(""); setProgress(0); setComparison(null); setSelectedCompareId(""); setPreviousAudits([]); }}
              className="px-6 py-2.5 bg-transparent border border-[#2a2d3a] rounded-lg text-[#6b7280] text-[13px] cursor-pointer font-[inherit]">
              Nouvel audit
            </button>
          </div>
        </>
      )}
    </div>
  );
}
