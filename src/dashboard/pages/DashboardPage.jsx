import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import ScoreGauge from "../components/ScoreGauge";
import ReviewCard from "../components/ReviewCard";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { get } = useApi();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [nps, setNps] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const bizRes = await get("/api/sentinel-app/businesses");
      const biz = bizRes.businesses[0];
      if (!biz) { setLoading(false); return; }
      setBusiness(biz);

      const [statsRes, reviewsRes, trendsRes, npsRes] = await Promise.all([
        get(`/api/sentinel-app/businesses/${biz._id}/stats`),
        get(`/api/sentinel-app/reviews/${biz._id}?limit=5`),
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

  if (loading) {
    return <div style={{ padding: "60px", textAlign: "center", color: "#71717A", fontSize: "14px" }}>Chargement...</div>;
  }

  if (!business) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "#E4E4E7" }}>Bienvenue sur Sentinel</h2>
        <p style={{ color: "#71717A", marginBottom: "24px", fontSize: "14px" }}>Configurez votre entreprise pour commencer.</p>
        <a href="/app/onboarding" style={{
          display: "inline-block", padding: "10px 24px", background: "#ef4444", color: "#fff",
          borderRadius: "8px", textDecoration: "none", fontWeight: 500, fontSize: "14px"
        }}>Configurer</a>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 500 }}>Sentinel</span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>{business.businessName}</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{
            fontSize: "12px", fontWeight: 500, padding: "2px 8px", borderRadius: "4px",
            background: stats?.mode === "auto" ? "rgba(99,102,241,0.12)" : "rgba(113,113,122,0.12)",
            color: stats?.mode === "auto" ? "#818CF8" : "#A1A1AA"
          }}>
            {stats?.mode === "auto" ? "Auto" : "Manuel"}
          </span>
          <span style={{ fontSize: "13px", color: "#71717A" }}>{business.sector}</span>
        </div>
      </div>

      {/* Main stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        <StatCard label="Score global"
          value={stats?.averageRating?.toFixed(1) || "—"} suffix="/5"
          trend={trends?.scoreTrend} />
        <StatCard label="Total avis" value={stats?.totalReviews || 0}
          trend={trends?.countTrend} />
        <StatCard label="Ce mois" value={stats?.thisMonthCount || 0} />
        <StatCard label="Taux de réponse" value={`${stats?.responseRate || 0}%`} />
        <StatCard label="En attente" value={stats?.pendingResponses || 0}
          alert={stats?.pendingResponses > 0} />
      </div>

      {/* NPS + Objective + Response Time */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {/* NPS */}
        <div style={{ ...cardStyle, borderLeft: "3px solid #6366f140" }}>
          <div style={labelStyle}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />Score NPS</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "28px", fontWeight: 600, color: "#FAFAFA" }}>
              {nps?.nps ?? "—"}
            </span>
            <Trend value={nps?.trend} />
          </div>
          <div style={{ display: "flex", gap: "14px", marginTop: "10px" }}>
            <span style={{ fontSize: "12px", color: "#71717A" }}>
              <span style={{ color: "#22c55e" }}>{nps?.promoters || 0}</span> prom.
            </span>
            <span style={{ fontSize: "12px", color: "#71717A" }}>
              {nps?.passives || 0} pass.
            </span>
            <span style={{ fontSize: "12px", color: "#71717A" }}>
              <span style={{ color: "#ef4444" }}>{nps?.detractors || 0}</span> détr.
            </span>
          </div>
        </div>

        {/* Objective */}
        <div style={{ ...cardStyle, borderLeft: "3px solid #f59e0b40" }}>
          <div style={labelStyle}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />Objectif</div>
          <div style={{ fontSize: "15px", fontWeight: 500, color: "#D4D4D8", marginBottom: "12px" }}>
            Atteindre {trends?.objective?.target || 4.5}/5
          </div>
          <div style={{ height: "6px", background: "#27272A", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
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
            <span style={{ fontSize: "12px", color: "#A1A1AA" }}>
              {trends?.objective?.current || 0}/5
            </span>
            <span style={{ fontSize: "12px", color: "#71717A" }}>
              {trends?.objective?.progress || 0}%
            </span>
          </div>
        </div>

        {/* Response time */}
        <div style={{ ...cardStyle, borderLeft: "3px solid #10b98140" }}>
          <div style={labelStyle}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />Temps de réponse moyen</div>
          <div style={{ fontSize: "28px", fontWeight: 600, color: "#FAFAFA" }}>
            {trends?.avgResponseTime != null ? (
              trends.avgResponseTime < 24
                ? <>{trends.avgResponseTime}<span style={{ fontSize: "14px", fontWeight: 400, color: "#71717A" }}>h</span></>
                : <>{Math.round(trends.avgResponseTime / 24)}<span style={{ fontSize: "14px", fontWeight: 400, color: "#71717A" }}> jours</span></>
            ) : "—"}
          </div>
          <div style={{
            marginTop: "8px", fontSize: "12px", fontWeight: 500, color: "#71717A"
          }}>
            {(trends?.avgResponseTime || 999) <= 2 ? "Excellent" : (trends?.avgResponseTime || 999) <= 24 ? "Bon" : "Peut être amélioré"}
          </div>
        </div>
      </div>

      {/* Chart + Score */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: "12px", marginBottom: "20px" }}>
        <div style={{ ...cardStyle, border: "1px solid #2a2a3a", background: "#14151e" }}>
          <div style={labelStyle}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />Évolution mensuelle</div>
          {stats?.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={stats.monthlyTrend}>
                <XAxis dataKey="_id" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#151620", border: "1px solid #2a2a3a", borderRadius: "6px", fontSize: "12px", fontFamily: "Inter" }} />
                <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 2.5 }} name="Avis" />
                <Line type="monotone" dataKey="avgRating" stroke="#A1A1AA" strokeWidth={1.5} dot={{ fill: "#A1A1AA", r: 2 }} name="Note moy." />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "#52525B", fontSize: "13px" }}>
              Pas encore de données
            </div>
          )}
        </div>

        <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.04)", borderLeft: "3px solid #ef444440" }}>
          <ScoreGauge score={stats?.averageRating || 0} />
        </div>
      </div>

      {/* Sentiment breakdown */}
      {stats?.sentiments && (
        <div style={{ ...cardStyle, display: "flex", gap: "16px", marginBottom: "20px" }}>
          <SentimentBar label="Positifs" count={stats.sentiments.positive} total={stats.totalReviews} color="#22c55e" />
          <SentimentBar label="Mixtes" count={stats.sentiments.mixed} total={stats.totalReviews} color="#f59e0b" />
          <SentimentBar label="Négatifs" count={stats.sentiments.negative} total={stats.totalReviews} color="#ef4444" />
        </div>
      )}

      {/* Recent reviews */}
      <div>
        <div style={{ ...labelStyle, marginBottom: "12px" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />Derniers avis</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {recentReviews.length > 0 ? recentReviews.map(r => (
            <ReviewCard key={r._id} review={r} businessId={business._id} />
          )) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#52525B", fontSize: "13px", border: "1px solid #1e1e2a", borderRadius: "8px" }}>
              Aucun avis pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #1e1e2a", borderRadius: "10px", padding: "18px", background: "#151620"
};

const labelStyle = {
  fontSize: "12px", fontWeight: 500, color: "#71717A", marginBottom: "8px",
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
  const borderColor = alert ? "#ef4444" : "#6366f1";
  return (
    <div style={{ ...cardStyle, borderLeft: `3px solid ${borderColor}40` }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ fontSize: "24px", fontWeight: 600, color: alert ? "#ef4444" : "#FAFAFA" }}>
          {value}<span style={{ fontSize: "13px", fontWeight: 400, color: "#71717A" }}>{suffix}</span>
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
        <span style={{ fontSize: "12px", color: "#A1A1AA" }}>{label}</span>
        <span style={{ fontSize: "12px", fontWeight: 500, color }}>{count}</span>
      </div>
      <div style={{ height: "4px", background: "#27272A", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px", transition: "width 1s ease" }} />
      </div>
    </div>
  );
}
