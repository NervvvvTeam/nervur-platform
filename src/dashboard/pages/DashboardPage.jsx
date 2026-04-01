import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import ScoreGauge from "../components/ScoreGauge";
import ReviewCard from "../components/ReviewCard";
import SubNav from "../components/SubNav";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const dashStyles = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes gaugeGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  50% { box-shadow: 0 0 20px 4px rgba(239,68,68,0.15); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

const fadeInUp = (delay = 0) => ({
  animation: `fadeInUp 0.5s ease-out ${delay}s forwards`,
  opacity: 0,
});

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

export default function DashboardPage() {
  const { get, post } = useApi();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [nps, setNps] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const bizRes = await get("/api/sentinel-app/businesses");
      const biz = bizRes.businesses[0];
      if (!biz) { setLoading(false); return; }
      setBusiness(biz);

      const [statsRes, reviewsRes, trendsRes, npsRes] = await Promise.all([
        get(`/api/sentinel-app/businesses/${biz._id}/stats`),
        get(`/api/sentinel-app/reviews/${biz._id}?limit=20`),
        get(`/api/sentinel-app/analytics/${biz._id}/trends`).catch(() => null),
        get(`/api/sentinel-app/analytics/${biz._id}/nps`).catch(() => null),
      ]);

      setStats(statsRes);
      setRecentReviews(reviewsRes.reviews);
      setTrends(trendsRes);
      setNps(npsRes);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function scanReviews() {
    if (!business || scanning) return;
    setScanning(true);
    setScanResult(null);
    try {
      const result = await post("/api/sentinel/scan-reviews", { businessId: business._id });
      setScanResult(result);
      // Reload data after scan
      await loadData();
    } catch (err) {
      setScanResult({ error: err.message });
    } finally {
      setScanning(false);
    }
  }

  if (loading) {
    return (
      <div>
        <style>{dashStyles}</style>
        <SubNav color="#ef4444" items={SENTINEL_NAV} />
        <div style={{ marginBottom: "28px", ...fadeInUp(0) }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", marginBottom: "10px" }} />
          <div style={{ width: "200px", height: "22px", background: "#2a2d3a", borderRadius: "6px", marginBottom: "8px" }} />
          <div style={{ width: "120px", height: "14px", background: "#1e2029", borderRadius: "4px" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ ...cardStyle, borderLeft: "3px solid #2a2d3a" }}>
              <div style={{ width: "80px", height: "12px", background: "#2a2d3a", borderRadius: "4px", marginBottom: "12px" }} />
              <div style={{ width: "60px", height: "24px", background: "#2a2d3a", borderRadius: "6px" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ ...cardStyle, borderLeft: "3px solid #2a2d3a", minHeight: "120px" }}>
              <div style={{ width: "100px", height: "12px", background: "#2a2d3a", borderRadius: "4px", marginBottom: "16px" }} />
              <div style={{ width: "50px", height: "28px", background: "#2a2d3a", borderRadius: "6px" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div>
        <style>{dashStyles}</style>
        <SubNav color="#ef4444" items={SENTINEL_NAV} />
        <div style={{
          padding: "80px 40px", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
          animation: "fadeIn 0.5s ease-out"
        }}>
          {/* Icon */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "rgba(239,68,68,0.08)", border: "2px solid rgba(239,68,68,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px"
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#f0f0f3", margin: 0 }}>
            Bienvenue sur Sentinel
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "15px", maxWidth: "400px", lineHeight: 1.6, margin: 0 }}>
            Configurez votre entreprise pour commencer à surveiller votre e-réputation et gérer vos avis Google.
          </p>
          <a href="/app/onboarding" style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "16px 40px", marginTop: "12px",
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "#fff", borderRadius: "12px", textDecoration: "none",
            fontWeight: 700, fontSize: "16px", fontFamily: "inherit",
            boxShadow: "0 4px 24px rgba(239,68,68,0.4), 0 0 0 1px rgba(239,68,68,0.2)",
            transition: "all 0.3s ease", letterSpacing: "0.3px"
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 32px rgba(239,68,68,0.5), 0 0 0 1px rgba(239,68,68,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(239,68,68,0.4), 0 0 0 1px rgba(239,68,68,0.2)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            Configurer Sentinel
          </a>
          <div style={{ display: "flex", gap: "24px", marginTop: "24px" }}>
            {["Avis Google en temps réel", "Réponses IA automatiques", "Alertes intelligentes"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{dashStyles}</style>
      <SubNav color="#ef4444" items={SENTINEL_NAV} />

      {/* Header */}
      <div style={{ marginBottom: "28px", ...fadeInUp(0) }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 500 }}>Sentinel</span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>{business.businessName}</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "12px", fontWeight: 500, padding: "2px 8px", borderRadius: "4px",
            background: stats?.mode === "auto" ? "rgba(99,102,241,0.12)" : "rgba(113,113,122,0.12)",
            color: stats?.mode === "auto" ? "#818CF8" : "#6b7280"
          }}>
            {stats?.mode === "auto" ? "Auto" : "Manuel"}
          </span>
          <span style={{ fontSize: "13px", color: "#9ca3af" }}>{business.sector}</span>
          <button
            onClick={scanReviews}
            disabled={scanning}
            style={{
              marginLeft: "auto",
              padding: "8px 18px",
              background: scanning ? "#2a2d3a" : "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: scanning ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.3s ease",
              boxShadow: scanning ? "none" : "0 2px 12px rgba(239,68,68,0.3)"
            }}
          >
            {scanning ? (
              <><span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Scan en cours...</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-6.219-8.56"/><polyline points="21 3 21 9 15 9"/></svg> Scanner les avis Google</>
            )}
          </button>
        </div>
        {scanResult && (
          <div style={{
            marginTop: "10px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
            background: scanResult.error ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
            border: `1px solid ${scanResult.error ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
            color: scanResult.error ? "#ef4444" : "#22c55e"
          }}>
            {scanResult.error || scanResult.message}
            {scanResult.place && (
              <span style={{ marginLeft: "8px", color: "#9ca3af" }}>
                ({scanResult.place.name} — {scanResult.place.rating}/5, {scanResult.place.totalReviews} avis)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Score global", value: stats?.averageRating?.toFixed(1) || "\u2014", suffix: "/5", trend: trends?.scoreTrend },
          { label: "Total avis", value: stats?.totalReviews || 0, trend: trends?.countTrend },
          { label: "Ce mois", value: stats?.thisMonthCount || 0 },
          { label: "Taux de réponse", value: `${stats?.responseRate || 0}%` },
          { label: "En attente", value: stats?.pendingResponses || 0, alert: stats?.pendingResponses > 0 },
        ].map((s, i) => (
          <div key={s.label} style={fadeInUp(0.1 + i * 0.08)}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* NPS + Objective + Response Time — only show if we have data */}
      {(nps || trends || stats?.totalReviews > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
          {/* NPS */}
          {nps && (
            <div style={{ ...cardStyle, borderLeft: "3px solid #6366f1", ...fadeInUp(0.3) }}>
              <div style={labelStyle}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />Score NPS</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "28px", fontWeight: 600, color: "#f0f0f3" }}>
                  {nps?.nps ?? "\u2014"}
                </span>
                <Trend value={nps?.trend} />
              </div>
              <div style={{ display: "flex", gap: "14px", marginTop: "10px" }}>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                  <span style={{ color: "#22c55e" }}>{nps?.promoters || 0}</span> prom.
                </span>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                  {nps?.passives || 0} pass.
                </span>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                  <span style={{ color: "#ef4444" }}>{nps?.detractors || 0}</span> detr.
                </span>
              </div>
            </div>
          )}

          {/* Objective */}
          {trends?.objective && (
            <div style={{ ...cardStyle, borderLeft: "3px solid #f59e0b", ...fadeInUp(0.4) }}>
              <div style={labelStyle}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />Objectif</div>
              <div style={{ fontSize: "15px", fontWeight: 500, color: "#d1d5db", marginBottom: "12px" }}>
                Atteindre {trends?.objective?.target || 4.5}/5
              </div>
              <div style={{ height: "6px", background: "#2a2d3a", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
                {(() => {
                  const p = trends?.objective?.progress || 0;
                  const barColor = p >= 90 ? "#22c55e" : p >= 70 ? "#f59e0b" : "#ef4444";
                  return <div style={{
                    height: "100%", borderRadius: "3px", transition: "width 1s ease, background 1s ease",
                    width: `${p}%`,
                    background: barColor
                  }} />;
                })()}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  {trends?.objective?.current || 0}/5
                </span>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                  {trends?.objective?.progress || 0}%
                </span>
              </div>
            </div>
          )}

          {/* Response time */}
          {trends?.avgResponseTime != null && (
            <div style={{ ...cardStyle, borderLeft: "3px solid #10b981", ...fadeInUp(0.5) }}>
              <div style={labelStyle}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />Temps de réponse moyen</div>
              <div style={{ fontSize: "28px", fontWeight: 600, color: "#f0f0f3" }}>
                {trends.avgResponseTime < 24
                  ? <>{trends.avgResponseTime}<span style={{ fontSize: "14px", fontWeight: 400, color: "#9ca3af" }}>h</span></>
                  : <>{Math.round(trends.avgResponseTime / 24)}<span style={{ fontSize: "14px", fontWeight: 400, color: "#9ca3af" }}> jours</span></>
                }
              </div>
              <div style={{
                marginTop: "8px", fontSize: "12px", fontWeight: 500, color: "#9ca3af"
              }}>
                {trends.avgResponseTime <= 2 ? "Excellent" : trends.avgResponseTime <= 24 ? "Bon" : "Peut être amélioré"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart + Score — only show if we have reviews */}
      {stats?.totalReviews > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: "12px", marginBottom: "20px", ...fadeInUp(0.55) }}>
          <div style={{ ...cardStyle, border: "1px solid #2a2d3a", background: "#1e2029" }}>
            <div style={labelStyle}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />Evolution mensuelle</div>
            {stats?.monthlyTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={stats.monthlyTrend}>
                  <XAxis dataKey="_id" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "6px", fontSize: "12px", fontFamily: "Inter", color: "#d1d5db" }} />
                  <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 2.5 }} name="Avis" />
                  <Line type="monotone" dataKey="avgRating" stroke="#6b7280" strokeWidth={1.5} dot={{ fill: "#6b7280", r: 2 }} name="Note moy." />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: "13px" }}>
                Pas encore de données
              </div>
            )}
          </div>

          <div style={{
            ...cardStyle, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(239,68,68,0.04)", borderLeft: "3px solid #ef4444",
            animation: "gaugeGlow 3s ease-in-out infinite 1s"
          }}>
            <ScoreGauge score={stats?.averageRating || 0} />
          </div>
        </div>
      ) : (
        /* Empty state — prompt to scan */
        <div style={{
          ...cardStyle, textAlign: "center", padding: "48px 24px", marginBottom: "20px",
          border: "1px dashed #2a2d3a", background: "transparent", ...fadeInUp(0.55)
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px" }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "8px" }}>
            Aucun avis scanné pour le moment
          </p>
          <p style={{ color: "#6b7280", fontSize: "12px", marginBottom: "20px" }}>
            Cliquez sur "Scanner les avis Google" pour récupérer vos avis
          </p>
          <button
            onClick={scanReviews}
            disabled={scanning}
            style={{
              padding: "12px 28px",
              background: scanning ? "#2a2d3a" : "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "#fff", border: "none", borderRadius: "10px",
              fontSize: "14px", fontWeight: 600, cursor: scanning ? "wait" : "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 16px rgba(239,68,68,0.3)",
              display: "inline-flex", alignItems: "center", gap: "8px"
            }}
          >
            {scanning ? (
              <><span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Scan en cours...</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-6.219-8.56"/><polyline points="21 3 21 9 15 9"/></svg> Scanner les avis Google</>
            )}
          </button>
        </div>
      )}

      {/* Sentiment breakdown — only if we have reviews */}
      {stats?.sentiments && stats?.totalReviews > 0 && (
        <div style={{ ...cardStyle, display: "flex", gap: "16px", marginBottom: "20px", ...fadeInUp(0.6) }}>
          <SentimentBar label="Positifs" count={stats.sentiments.positive} total={stats.totalReviews} color="#22c55e" />
          <SentimentBar label="Mixtes" count={stats.sentiments.mixed} total={stats.totalReviews} color="#f59e0b" />
          <SentimentBar label="Négatifs" count={stats.sentiments.negative} total={stats.totalReviews} color="#ef4444" />
        </div>
      )}

      {/* Recent reviews */}
      {recentReviews.length > 0 && (
        <div style={fadeInUp(0.65)}>
          <div style={{ ...labelStyle, marginBottom: "12px" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />Derniers avis</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentReviews.map((r, i) => (
              <div key={r._id} style={fadeInUp(0.7 + i * 0.06)}>
                <ReviewCard review={r} businessId={business._id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  border: "1px solid #2a2d3a", borderRadius: "10px", padding: "18px", background: "#1e2029",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  transition: "box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease"
};

const labelStyle = {
  fontSize: "12px", fontWeight: 500, color: "#9ca3af", marginBottom: "8px",
  display: "flex", alignItems: "center", gap: "6px"
};

function Trend({ value }) {
  if (!value || value === 0) return null;
  const up = value > 0;
  return (
    <span style={{ fontSize: "12px", fontWeight: 500, color: up ? "#22c55e" : "#ef4444" }}>
      {up ? "+" : ""}{value}
    </span>
  );
}

function StatCard({ label, value, suffix = "", trend, alert }) {
  const [hovered, setHovered] = useState(false);
  const borderColor = alert ? "#ef4444" : "#6366f1";
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...cardStyle, borderLeft: `3px solid ${borderColor}`,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? `0 4px 16px rgba(0,0,0,0.3), 0 4px 16px ${borderColor}15` : "0 2px 8px rgba(0,0,0,0.2)",
      }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ fontSize: "24px", fontWeight: 600, color: alert ? "#ef4444" : "#f0f0f3" }}>
          {value}<span style={{ fontSize: "13px", fontWeight: 400, color: "#9ca3af" }}>{suffix}</span>
        </span>
        <Trend value={trend} />
      </div>
    </div>
  );
}

function SentimentBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", color: "#6b7280" }}>{label}</span>
        <span style={{ fontSize: "12px", fontWeight: 500, color }}>{count}</span>
      </div>
      <div style={{ height: "4px", background: "#2a2d3a", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px", transition: "width 1s ease" }} />
      </div>
    </div>
  );
}
