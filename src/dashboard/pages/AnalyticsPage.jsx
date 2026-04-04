import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import SubNav from "../components/SubNav";

const SENTINEL_NAV = [
  { path: "/app/sentinel", label: "Dashboard", end: true },
  { path: "/app/reviews", label: "Avis clients" },
  { path: "/app/analytics", label: "Analyse IA" },
  { path: "/app/competitors", label: "Concurrents" },
  { path: "/app/reports", label: "Rapports" },
  { path: "/app/qrcode", label: "QR Code" },
  { path: "/app/widget", label: "Widget" },
  { path: "/app/alerts", label: "Alertes" },
  { path: "/app/settings", label: "Paramètres" },
];

export default function AnalyticsPage() {
  const { get } = useApi();
  const [business, setBusiness] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => { loadBusiness(); }, []);

  async function loadBusiness() {
    try {
      const res = await get("/api/sentinel-app/businesses");
      if (res.businesses[0]) {
        setBusiness(res.businesses[0]);
        await loadAnalysis(res.businesses[0]._id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function loadAnalysis(bizId) {
    setAnalyzing(true);
    try {
      const res = await get(`/api/sentinel-app/analytics/${bizId}/semantic`);
      setAnalysis(res.analysis);
    } catch (err) { console.error(err); }
    finally { setAnalyzing(false); }
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#d1d5db" }}>Chargement...</div>;
  if (!business) return <div style={{ padding: "60px", textAlign: "center", color: "#d1d5db" }}>Aucune entreprise configurée</div>;

  const radarData = analysis?.themes?.map(t => ({
    theme: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    score: t.score,
    fullMark: 10,
  })) || [];

  return (
    <div style={{ maxWidth: "1100px" }}>
      <SubNav color="#ef4444" items={SENTINEL_NAV} />
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #ef4444, #f97316)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>Analyse sémantique</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>
          {"L'IA analyse les thèmes récurrents dans vos avis clients."}
        </p>
      </div>

      {analyzing ? (
        <div style={{
          padding: "80px", textAlign: "center", border: "1px solid #2a2d3a",
          borderRadius: "10px", background: "#1e2029",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          <div style={{
            width: "36px", height: "36px", border: "3px solid rgba(239,68,68,0.2)",
            borderTop: "3px solid #ef4444", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 20px"
          }} />
          <p style={{ color: "#ef4444", fontSize: "14px" }}>Analyse en cours par IA...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : analysis ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {/* Radar Chart */}
          <div style={{
            padding: "18px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.15)",
            background: "#1e2029", gridColumn: radarData.length > 0 ? "1" : "1 / -1",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#9ca3af", marginBottom: "20px" }}>
              Radar des thèmes
            </h3>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2a2d3a" />
                  <PolarAngleAxis dataKey="theme" tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#d1d5db", fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: "#d1d5db", textAlign: "center", padding: "60px 0" }}>Pas assez de données</p>
            )}
          </div>

          {/* Scores list */}
          <div style={{
            padding: "18px", borderRadius: "10px", border: "1px solid #2a2d3a",
            background: "#1e2029",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#9ca3af", marginBottom: "20px" }}>
              Détail par thème
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {(analysis.themes || []).map((t, i) => {
                const barColor = t.score >= 7 ? "#ef4444" : t.score >= 5 ? "#f97316" : "#ef4444";
                const barOpacity = t.score >= 7 ? 1 : t.score >= 5 ? 0.6 : 1;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: "#d1d5db", textTransform: "capitalize" }}>{t.theme}</span>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#d1d5db" }}>{t.mentions} mentions</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: barColor, opacity: barOpacity }}>{t.score}/10</span>
                      </div>
                    </div>
                    <div style={{ height: "6px", borderRadius: "3px", background: "#2a2d3a" }}>
                      <div style={{
                        height: "100%", borderRadius: "3px", background: barColor, opacity: barOpacity,
                        width: `${(t.score / 10) * 100}%`, transition: "width 0.5s"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {analysis.summary && (
            <div style={{
              padding: "18px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.15)",
              background: "rgba(239,68,68,0.06)", gridColumn: "1 / -1"
            }}>
              <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#ef4444", marginBottom: "12px" }}>
                Résumé IA
              </h3>
              <p style={{ fontSize: "15px", color: "#d1d5db", lineHeight: 1.8 }}>{analysis.summary}</p>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          {analysis.strengths && (
            <div style={{
              padding: "18px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.15)",
              background: "rgba(239,68,68,0.06)"
            }}>
              <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#ef4444", marginBottom: "16px" }}>
                Points forts
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {analysis.strengths.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: "#ef4444", fontSize: "14px", flexShrink: 0 }}>+</span>
                    <span style={{ fontSize: "14px", color: "#d1d5db", lineHeight: 1.6 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.weaknesses && (
            <div style={{
              padding: "18px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.15)",
              background: "rgba(239,68,68,0.04)"
            }}>
              <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#ef4444", marginBottom: "16px" }}>
                Axes d'amélioration
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {analysis.weaknesses.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: "#ef4444", fontSize: "14px", flexShrink: 0 }}>!</span>
                    <span style={{ fontSize: "14px", color: "#d1d5db", lineHeight: 1.6 }}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {analysis.keywords && analysis.keywords.length > 0 && (
            <div style={{
              padding: "18px", borderRadius: "10px", border: "1px solid #2a2d3a",
              background: "#1e2029", gridColumn: "1 / -1",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }}>
              <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#9ca3af", marginBottom: "16px" }}>
                Mots-clés récurrents
              </h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {analysis.keywords.map((kw, i) => (
                  <span key={i} style={{
                    padding: "6px 16px", borderRadius: "20px", fontSize: "13px",
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                    color: "#ef4444", fontWeight: 500
                  }}>{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {!analyzing && (
        <button onClick={() => loadAnalysis(business._id)}
          style={{
            marginTop: "24px", padding: "12px 28px",
            background: "linear-gradient(135deg, #ef4444, #f97316)",
            color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px",
            fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(239,68,68,0.4)"
          }}>
          Relancer l'analyse
        </button>
      )}
    </div>
  );
}
