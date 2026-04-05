import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const PHANTOM_NAV = [
  { path: "/app/phantom", label: "Audit", end: true },
  { path: "/app/phantom/history", label: "Historique" },
  { path: "/app/phantom/recommendations", label: "Recommandations" },
  { path: "/app/phantom/competitors", label: "Concurrents" },
  { path: "/app/phantom/schedule", label: "Planification" },
];

const SCORE_KEYS = [
  { key: "global", label: "Global" },
  { key: "performance", label: "Performance" },
  { key: "accessibility", label: "Accessibilité" },
  { key: "seo", label: "SEO" },
  { key: "bestPractices", label: "Bonnes pratiques" },
];

function ScoreCell({ score }) {
  const color = score >= 90 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <td style={{ padding: "12px 16px", textAlign: "center" }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: "36px", padding: "4px 10px", borderRadius: "6px",
        background: `${color}15`, color, fontSize: "14px", fontWeight: 600,
      }}>
        {score}
      </span>
    </td>
  );
}

export default function PhantomCompetitorsPage() {
  const api = useApi();
  const [yourDomain, setYourDomain] = useState("");
  const [domains, setDomains] = useState([]);
  const [competitors, setCompetitors] = useState(["", "", ""]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const data = await api.get("/api/phantom/history");
      setDomains(data.domains || []);
      if (data.domains?.length > 0) setYourDomain(data.domains[0]);
    } catch (err) {
      console.error("Load domains error:", err);
    } finally {
      setLoadingDomains(false);
    }
  };

  const handleCompare = async () => {
    const validCompetitors = competitors.filter(c => c.trim());
    if (!yourDomain || validCompetitors.length === 0) {
      setError("Sélectionnez votre domaine et ajoutez au moins un concurrent.");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    try {
      // Get your latest audit
      const historyData = await api.get(`/api/phantom/history?domain=${encodeURIComponent(yourDomain)}`);
      const yourAudit = historyData.audits?.[0];

      // Audit each competitor
      const competitorResults = [];
      for (const comp of validCompetitors) {
        try {
          const url = comp.startsWith("http") ? comp : `https://${comp}`;
          const result = await api.post("/api/phantom/audit", { url });
          competitorResults.push({
            domain: comp.replace(/^https?:\/\//, "").replace(/\/$/, ""),
            scores: result.scores || {},
            success: true,
          });
        } catch (err) {
          competitorResults.push({
            domain: comp.replace(/^https?:\/\//, "").replace(/\/$/, ""),
            scores: {},
            success: false,
            error: "Audit échoué",
          });
        }
      }

      setResults({
        yours: {
          domain: yourDomain,
          scores: yourAudit?.scores || {},
        },
        competitors: competitorResults,
      });
    } catch (err) {
      setError("Une erreur est survenue lors de la comparaison.");
      console.error("Compare error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateCompetitor = (index, value) => {
    setCompetitors(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div style={{ maxWidth: "1100px" }}>
      <SubNav color="#8b5cf6" items={PHANTOM_NAV} />

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#0A2540", marginBottom: "6px" }}>
          Analyse concurrentielle
        </h1>
        <p style={{ fontSize: "14px", color: "#6B7C93" }}>
          Comparez les performances de votre site avec celles de vos concurrents.
        </p>
      </div>

      {/* Comparison form */}
      <div style={{
        padding: "24px", background: "#FFFFFF", border: "1px solid #2a2d3a",
        borderRadius: "10px", marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#0A2540", marginBottom: "16px" }}>
          Configurer la comparaison
        </h2>

        {/* Your domain */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#6B7C93", marginBottom: "6px" }}>
            Votre site
          </label>
          {loadingDomains ? (
            <div style={{ color: "#6B7C93", fontSize: "13px" }}>Chargement...</div>
          ) : domains.length > 0 ? (
            <select
              value={yourDomain}
              onChange={e => setYourDomain(e.target.value)}
              style={{
                width: "100%", maxWidth: "400px", padding: "10px 14px", background: "#161820",
                border: "1px solid #2a2d3a", borderRadius: "8px", color: "#0A2540",
                fontSize: "13px", fontFamily: "inherit", outline: "none",
              }}
            >
              {domains.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          ) : (
            <div style={{ color: "#6B7C93", fontSize: "13px" }}>
              Aucun audit trouvé. Lancez d'abord un audit depuis l'onglet Audit.
            </div>
          )}
        </div>

        {/* Competitor URLs */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#6B7C93", marginBottom: "6px" }}>
            Sites concurrents (jusqu'à 3)
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {competitors.map((comp, i) => (
              <input
                key={i}
                type="text"
                value={comp}
                onChange={e => updateCompetitor(i, e.target.value)}
                placeholder={`concurrent${i + 1}.com`}
                style={{
                  maxWidth: "400px", padding: "10px 14px", background: "#161820",
                  border: "1px solid #2a2d3a", borderRadius: "8px", color: "#0A2540",
                  fontSize: "13px", fontFamily: "inherit", outline: "none",
                }}
              />
            ))}
          </div>
        </div>

        {error && (
          <div style={{ fontSize: "13px", color: "#ef4444", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleCompare}
          disabled={loading || !yourDomain}
          style={{
            padding: "10px 28px",
            background: loading ? "#E3E8EE" : "linear-gradient(135deg, #8b5cf6, #a78bfa)",
            color: "#fff", border: "none", borderRadius: "8px",
            fontSize: "14px", fontWeight: 500,
            cursor: loading ? "wait" : "pointer",
            fontFamily: "inherit", opacity: loading ? 0.6 : 1,
            boxShadow: loading ? "none" : "0 4px 16px rgba(139,92,246,0.4)",
            display: "flex", alignItems: "center", gap: "8px",
          }}
        >
          {loading && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          )}
          {loading ? "Analyse en cours..." : "Comparer"}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div style={{
          background: "#FFFFFF", border: "1px solid #2a2d3a",
          borderRadius: "10px", overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            padding: "18px 22px", borderBottom: "1px solid #2a2d3a",
          }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#0A2540", margin: 0 }}>
              Résultats de la comparaison
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{
                    textAlign: "left", padding: "12px 16px", color: "#6B7C93",
                    fontWeight: 500, fontSize: "12px", borderBottom: "1px solid #2a2d3a",
                  }}>Catégorie</th>
                  <th style={{
                    textAlign: "center", padding: "12px 16px",
                    fontWeight: 600, fontSize: "12px", borderBottom: "1px solid #2a2d3a",
                    color: "#8b5cf6", background: "rgba(139,92,246,0.06)",
                  }}>
                    {results.yours.domain}
                  </th>
                  {results.competitors.map((comp, i) => (
                    <th key={i} style={{
                      textAlign: "center", padding: "12px 16px", color: "#6B7C93",
                      fontWeight: 500, fontSize: "12px", borderBottom: "1px solid #2a2d3a",
                    }}>
                      {comp.domain}
                      {!comp.success && (
                        <span style={{ display: "block", fontSize: "10px", color: "#ef4444" }}>
                          {comp.error}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCORE_KEYS.map(({ key, label }) => (
                  <tr key={key} style={{ borderBottom: "1px solid #2a2d3a20" }}>
                    <td style={{
                      padding: "12px 16px", fontSize: "13px", fontWeight: 500, color: "#425466",
                    }}>
                      {label}
                    </td>
                    <ScoreCell score={results.yours.scores?.[key] || 0} />
                    {results.competitors.map((comp, i) => (
                      <ScoreCell key={i} score={comp.success ? (comp.scores?.[key] || 0) : 0} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Winner summary */}
          <div style={{
            padding: "16px 22px", borderTop: "1px solid #2a2d3a",
            background: "rgba(139,92,246,0.04)",
          }}>
            <div style={{ fontSize: "12px", color: "#6B7C93", marginBottom: "8px" }}>Résumé</div>
            {(() => {
              const allSites = [results.yours, ...results.competitors.filter(c => c.success)];
              const best = allSites.reduce((a, b) =>
                (a.scores?.global || 0) > (b.scores?.global || 0) ? a : b
              );
              const isBest = best.domain === results.yours.domain;
              return (
                <div style={{ fontSize: "13px", color: "#425466" }}>
                  {isBest ? (
                    <span>
                      <span style={{ color: "#10b981", fontWeight: 600 }}>Votre site est en tête</span> avec un score global de {results.yours.scores?.global || 0}/100.
                    </span>
                  ) : (
                    <span>
                      <span style={{ color: "#f59e0b", fontWeight: 600 }}>{best.domain}</span> est en tête avec un score de {best.scores?.global || 0}/100.
                      Votre score : {results.yours.scores?.global || 0}/100.
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
