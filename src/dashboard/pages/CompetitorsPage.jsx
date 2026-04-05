import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
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

export default function CompetitorsPage() {
  const { get, post, del } = useApi();
  const [business, setBusiness] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState("");
  const [newReviews, setNewReviews] = useState("");

  useEffect(() => { loadBusiness(); }, []);

  async function loadBusiness() {
    try {
      const res = await get("/api/sentinel-app/businesses");
      if (res.businesses[0]) {
        setBusiness(res.businesses[0]);
        await loadCompetitors(res.businesses[0]._id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function loadCompetitors(bizId) {
    try {
      const res = await get(`/api/sentinel-app/competitors/${bizId}`);
      setData(res);
    } catch (err) { console.error(err); }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await post(`/api/sentinel-app/competitors/${business._id}`, {
        name: newName.trim(),
        currentRating: parseFloat(newRating) || undefined,
        totalReviews: parseInt(newReviews) || undefined,
      });
      setNewName("");
      setNewRating("");
      setNewReviews("");
      await loadCompetitors(business._id);
    } catch (err) { console.error(err); }
    finally { setAdding(false); }
  }

  async function handleDelete(compId) {
    try {
      await del(`/api/sentinel-app/competitors/${business._id}/${compId}`);
      await loadCompetitors(business._id);
    } catch (err) { console.error(err); }
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#424245" }}>Chargement...</div>;
  if (!business) return <div style={{ padding: "60px", textAlign: "center", color: "#424245" }}>Aucune entreprise configurée</div>;

  const chartData = data ? [
    { name: data.business.name.substring(0, 15), rating: data.business.rating, isOwn: true },
    ...(data.competitors || []).map(c => ({
      name: c.name.substring(0, 15),
      rating: Math.round(c.currentRating * 10) / 10,
      isOwn: false,
    }))
  ] : [];

  return (
    <div style={{ maxWidth: "1100px" }}>
      <SubNav color="#ef4444" items={SENTINEL_NAV} />
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #ef4444, #f97316)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#1D1D1F", marginBottom: "6px" }}>Veille concurrentielle</h1>
        <p style={{ fontSize: "14px", color: "#86868B" }}>
          Comparez vos scores avec vos concurrents directs.
        </p>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div style={{
          padding: "18px", borderRadius: "10px", border: "1px solid #2a2d3a",
          background: "#FFFFFF", marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
        }}>
          <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#86868B", marginBottom: "20px" }}>
            Comparaison des scores
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
              <XAxis dataKey="name" tick={{ fill: "#86868B", fontSize: 11 }} axisLine={false} />
              <YAxis domain={[0, 5]} tick={{ fill: "#424245", fontSize: 11 }} axisLine={false} />
              <Bar dataKey="rating" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.isOwn ? "#ef4444" : "#424245"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "12px" }}>
            <span style={{ fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#ef4444" }} />
              Votre entreprise
            </span>
            <span style={{ fontSize: "12px", color: "#86868B", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#E5E5EA" }} />
              Concurrents
            </span>
          </div>
        </div>
      )}

      {/* Competitor cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {/* Own card */}
        {data && (
          <div style={{
            padding: "18px", borderRadius: "10px",
            border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.04)"
          }}>
            <div style={{ fontSize: "12px", color: "#ef4444", fontWeight: 500, marginBottom: "8px" }}>Vous</div>
            <h3 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "12px", color: "#1D1D1F" }}>{data.business.name}</h3>
            <div style={{ display: "flex", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "28px", fontWeight: 600, color: "#ef4444" }}>{data.business.rating}</div>
                <div style={{ fontSize: "11px", color: "#86868B" }}>Score moyen</div>
              </div>
              <div>
                <div style={{ fontSize: "28px", fontWeight: 600, color: "#424245" }}>{data.business.totalReviews}</div>
                <div style={{ fontSize: "11px", color: "#86868B" }}>Avis total</div>
              </div>
            </div>
          </div>
        )}

        {/* Competitor cards */}
        {(data?.competitors || []).map(comp => {
          const diff = data ? (data.business.rating - comp.currentRating).toFixed(1) : 0;
          const ahead = diff > 0;
          return (
            <div key={comp._id} style={{
              padding: "18px", borderRadius: "10px",
              border: "1px solid #2a2d3a", background: "#FFFFFF",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              position: "relative"
            }}>
              <button onClick={() => handleDelete(comp._id)}
                style={{
                  position: "absolute", top: "12px", right: "12px", background: "none",
                  border: "none", color: "#424245", cursor: "pointer", fontSize: "16px", padding: "4px"
                }}
                onMouseEnter={e => e.target.style.color = "#ef4444"}
                onMouseLeave={e => e.target.style.color = "#424245"}>
                x
              </button>
              <div style={{ fontSize: "12px", color: "#86868B", fontWeight: 500, marginBottom: "8px" }}>Concurrent</div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "12px", color: "#424245" }}>{comp.name}</h3>
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: "28px", fontWeight: 600, color: "#424245" }}>
                    {Math.round(comp.currentRating * 10) / 10}
                  </div>
                  <div style={{ fontSize: "11px", color: "#86868B" }}>Score moyen</div>
                </div>
                <div>
                  <div style={{ fontSize: "28px", fontWeight: 600, color: "#424245" }}>{comp.totalReviews}</div>
                  <div style={{ fontSize: "11px", color: "#86868B" }}>Avis</div>
                </div>
                <div style={{
                  fontSize: "13px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
                  color: ahead ? "#ef4444" : "#ef4444",
                  background: ahead ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.1)",
                }}>
                  {ahead ? `+${diff}` : diff}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add competitor */}
      {(data?.competitors?.length || 0) < 5 && (
        <div style={{
          padding: "18px", borderRadius: "10px",
          border: "1px dashed #2a2d3a", background: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
        }}>
          <h3 style={{ fontSize: "14px", color: "#86868B", marginBottom: "16px", fontWeight: 600 }}>Ajouter un concurrent</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input placeholder="Nom du concurrent" value={newName} onChange={e => setNewName(e.target.value)}
              style={{
                flex: "2", minWidth: "180px", padding: "12px 16px", background: "#FFFFFF",
                border: "1px solid #2a2d3a", borderRadius: "8px",
                color: "#1D1D1F", fontSize: "14px", fontFamily: "inherit", outline: "none",
                boxSizing: "border-box", transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#ef4444"}
              onBlur={e => e.target.style.borderColor = "#E5E5EA"} />
            <input placeholder="Note (ex: 4.2)" value={newRating} onChange={e => setNewRating(e.target.value)}
              style={{
                flex: "1", minWidth: "100px", padding: "12px 16px", background: "#FFFFFF",
                border: "1px solid #2a2d3a", borderRadius: "8px",
                color: "#1D1D1F", fontSize: "14px", fontFamily: "inherit", outline: "none",
                boxSizing: "border-box", transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#ef4444"}
              onBlur={e => e.target.style.borderColor = "#E5E5EA"} />
            <input placeholder="Nb avis" value={newReviews} onChange={e => setNewReviews(e.target.value)}
              style={{
                flex: "1", minWidth: "80px", padding: "12px 16px", background: "#FFFFFF",
                border: "1px solid #2a2d3a", borderRadius: "8px",
                color: "#1D1D1F", fontSize: "14px", fontFamily: "inherit", outline: "none",
                boxSizing: "border-box", transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#ef4444"}
              onBlur={e => e.target.style.borderColor = "#E5E5EA"} />
            <button onClick={handleAdd} disabled={adding}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #ef4444, #f97316)",
                color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px",
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(239,68,68,0.4)"
              }}>
              {adding ? "..." : "Ajouter"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
