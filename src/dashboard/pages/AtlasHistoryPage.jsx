import { useState, useEffect, useRef } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const ATLAS_COLOR = "#f59e0b";

const ATLAS_NAV = [
  { path: "/app/atlas", label: "Projets", end: true },
  { path: "/app/atlas/history", label: "Évolution" },
  { path: "/app/atlas/suggestions", label: "Suggestions IA" },
  { path: "/app/atlas/reports", label: "Rapports" },
];

function MiniChart({ data, width = 400, height = 160, dataKey = "averagePosition", label = "Position moyenne", inverted = true, color = "#f59e0b" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length < 2) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const values = data.map(d => d[dataKey] || 0);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;

    const padX = 40;
    const padY = 20;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    // Grid lines
    ctx.strokeStyle = "#E3E8EE";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padY + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.stroke();

      const posVal = inverted
        ? Math.round(maxVal - (range / 4) * i)
        : Math.round(minVal + (range / 4) * (4 - i));
      ctx.fillStyle = "#6B7C93";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(posVal.toLocaleString("fr-FR"), padX - 8, y + 4);
    }

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    const points = data.map((d, i) => {
      const val = d[dataKey] || 0;
      const normalizedY = inverted
        ? padY + chartH - ((val - minVal) / range) * chartH
        : padY + chartH - ((val - minVal) / range) * chartH;
      return {
        x: padX + (chartW / (data.length - 1)) * i,
        y: normalizedY,
      };
    });

    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Fill area
    ctx.lineTo(points[points.length - 1].x, padY + chartH);
    ctx.lineTo(points[0].x, padY + chartH);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, padY, 0, padY + chartH);
    gradient.addColorStop(0, color.replace(")", ",0.15)").replace("rgb", "rgba").replace("#", ""));
    // Use hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const grad2 = ctx.createLinearGradient(0, padY, 0, padY + chartH);
    grad2.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
    grad2.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad2;
    ctx.fill();

    // Dots
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

  }, [data, width, height, dataKey, inverted, color]);

  if (!data || data.length < 2) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#6B7C93", fontSize: "13px" }}>
        Pas assez de donnees pour afficher le graphique. Lancez au moins 2 verifications.
      </div>
    );
  }

  return <canvas ref={canvasRef} style={{ width: `${width}px`, height: `${height}px` }} />;
}

function DistributionBar({ rankings }) {
  if (!rankings || rankings.length === 0) return null;

  const top10 = rankings.filter(r => r.position <= 10).length;
  const top30 = rankings.filter(r => r.position > 10 && r.position <= 30).length;
  const top100 = rankings.filter(r => r.position > 30).length;
  const total = rankings.length;

  const segments = [
    { count: top10, label: "Top 10", color: "#22c55e", pct: Math.round((top10 / total) * 100) },
    { count: top30, label: "Top 11-30", color: "#f59e0b", pct: Math.round((top30 / total) * 100) },
    { count: top100, label: "Top 31+", color: "#ef4444", pct: Math.round((top100 / total) * 100) },
  ];

  return (
    <div>
      {/* Bar */}
      <div style={{
        display: "flex", height: "28px", borderRadius: "8px", overflow: "hidden",
        background: "#16171f", marginBottom: "12px",
      }}>
        {segments.map((seg, i) => (
          seg.count > 0 && (
            <div key={i} style={{
              width: `${seg.pct}%`, minWidth: seg.count > 0 ? "24px" : "0",
              background: seg.color + "30", display: "flex", alignItems: "center",
              justifyContent: "center", borderRight: i < 2 && seg.count > 0 ? "1px solid #1e2029" : "none",
            }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: seg.color }}>{seg.count}</span>
            </div>
          )
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: seg.color }} />
            <span style={{ fontSize: "11px", color: "#6B7C93" }}>{seg.label}: <span style={{ color: seg.color, fontWeight: 600 }}>{seg.count}</span> ({seg.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeywordMovers({ rankings, type = "best" }) {
  if (!rankings || rankings.length === 0) return null;

  const sorted = [...rankings]
    .filter(r => r.change && r.change !== 0)
    .sort((a, b) => type === "best" ? (b.change || 0) - (a.change || 0) : (a.change || 0) - (b.change || 0))
    .slice(0, 5);

  if (sorted.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0", color: "#6B7C93", fontSize: "12px" }}>
        Aucune variation detectee.
      </div>
    );
  }

  const isBest = type === "best";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {sorted.map((r, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", background: "#16171f", borderRadius: "8px",
          border: "1px solid #2a2d3a",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "22px", height: "22px", borderRadius: "6px",
              background: isBest ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              color: isBest ? "#22c55e" : "#ef4444", fontSize: "11px", fontWeight: 700,
            }}>
              {i + 1}
            </span>
            <span style={{ color: "#0A2540", fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.keyword}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: "6px",
              background: (r.position <= 10 ? "#22c55e" : r.position <= 30 ? "#f59e0b" : "#ef4444") + "18",
              color: r.position <= 10 ? "#22c55e" : r.position <= 30 ? "#f59e0b" : "#ef4444",
              fontSize: "12px", fontWeight: 600,
            }}>
              {r.position}
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "2px",
              color: isBest ? "#22c55e" : "#ef4444", fontSize: "12px", fontWeight: 600,
            }}>
              {isBest ? "\↑" : "\↓"} {Math.abs(r.change)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AtlasHistoryPage() {
  const { get } = useApi();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await get("/api/atlas/projects");
        setProjects(data);
        if (data.length > 0) setSelectedProject(data[0]._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentProject = projects.find(p => p._id === selectedProject);
  const history = currentProject?.history || [];
  const rankings = currentProject?.rankings || [];

  const chartWidth = typeof window !== "undefined" ? Math.min(600, window.innerWidth - 160) : 600;

  return (
    <div>
      <SubNav items={ATLAS_NAV} color={ATLAS_COLOR} />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))",
        borderRadius: "14px", padding: "28px 32px", marginBottom: "28px",
        border: "1px solid rgba(245,158,11,0.15)", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "3px",
          background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0A2540", margin: 0, marginBottom: "6px" }}>
          Evolution des positions
        </h1>
        <p style={{ color: "#6B7C93", fontSize: "13px", margin: 0 }}>
          Historique de vos positions moyennes au fil du temps
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7C93" }}>Chargement...</div>
      ) : projects.length === 0 ? (
        <div style={{
          background: "#FFFFFF", borderRadius: "14px", padding: "60px 32px",
          border: "1px solid #2a2d3a", textAlign: "center",
        }}>
          <h3 style={{ color: "#0A2540", fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>Aucun projet</h3>
          <p style={{ color: "#6B7C93", fontSize: "13px", margin: 0 }}>Creez un projet dans l'onglet Projets pour voir son evolution.</p>
        </div>
      ) : (
        <>
          {/* Project Selector */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#6B7C93", marginBottom: "8px" }}>Projet</label>
            <select
              value={selectedProject || ""}
              onChange={e => setSelectedProject(e.target.value)}
              style={{
                padding: "10px 14px", background: "#FFFFFF",
                border: "1px solid #2a2d3a", borderRadius: "8px", color: "#0A2540",
                fontSize: "13px", fontFamily: "inherit", outline: "none", minWidth: "260px",
              }}
            >
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.domain} ({p.keywords?.length || 0} mots-cles)</option>
              ))}
            </select>
          </div>

          {/* Position Distribution */}
          {rankings.length > 0 && (
            <div style={{
              background: "#FFFFFF", borderRadius: "14px", padding: "24px",
              border: "1px solid #2a2d3a", marginBottom: "24px",
            }}>
              <h3 style={{ color: "#0A2540", fontSize: "14px", fontWeight: 600, margin: "0 0 16px" }}>
                Distribution des positions — {currentProject?.domain}
              </h3>
              <DistributionBar rankings={rankings} />
            </div>
          )}

          {/* Charts Row: Position + Traffic */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
            {/* Position Chart */}
            <div style={{
              background: "#FFFFFF", borderRadius: "14px", padding: "24px",
              border: "1px solid #2a2d3a",
            }}>
              <h3 style={{ color: "#0A2540", fontSize: "14px", fontWeight: 600, margin: "0 0 16px" }}>
                Position moyenne
              </h3>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <MiniChart data={history} width={Math.min(chartWidth, 500)} height={180} dataKey="averagePosition" inverted={true} color="#f59e0b" />
              </div>
              <div style={{ textAlign: "center", marginTop: "8px", fontSize: "11px", color: "#6B7C93" }}>
                Note : une position basse (proche de 1) est meilleure
              </div>
            </div>

            {/* Traffic Evolution Chart */}
            <div style={{
              background: "#FFFFFF", borderRadius: "14px", padding: "24px",
              border: "1px solid #2a2d3a",
            }}>
              <h3 style={{ color: "#0A2540", fontSize: "14px", fontWeight: 600, margin: "0 0 16px" }}>
                Trafic estime
              </h3>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <MiniChart
                  data={history.filter(h => h.estimatedTraffic !== undefined)}
                  width={Math.min(chartWidth, 500)}
                  height={180}
                  dataKey="estimatedTraffic"
                  inverted={false}
                  color="#22c55e"
                />
              </div>
              <div style={{ textAlign: "center", marginTop: "8px", fontSize: "11px", color: "#6B7C93" }}>
                Estimation du trafic mensuel total
              </div>
            </div>
          </div>

          {/* Movers: Best Progressions + Biggest Drops */}
          {rankings.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "24px" }}>
              {/* Best Progressions */}
              <div style={{
                background: "#FFFFFF", borderRadius: "14px", padding: "24px",
                border: "1px solid #2a2d3a",
              }}>
                <h3 style={{ color: "#0A2540", fontSize: "14px", fontWeight: 600, margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#22c55e" }}>{"\↑"}</span>
                  Meilleures progressions
                </h3>
                <KeywordMovers rankings={rankings} type="best" />
              </div>

              {/* Biggest Drops */}
              <div style={{
                background: "#FFFFFF", borderRadius: "14px", padding: "24px",
                border: "1px solid #2a2d3a",
              }}>
                <h3 style={{ color: "#0A2540", fontSize: "14px", fontWeight: 600, margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ef4444" }}>{"\↓"}</span>
                  Plus fortes baisses
                </h3>
                <KeywordMovers rankings={rankings} type="worst" />
              </div>
            </div>
          )}

          {/* History Table */}
          <div style={{
            background: "#FFFFFF", borderRadius: "14px",
            border: "1px solid #2a2d3a", overflow: "hidden",
          }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #2a2d3a" }}>
              <h3 style={{ color: "#0A2540", fontSize: "14px", fontWeight: 600, margin: 0 }}>Historique des verifications</h3>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "#6B7C93", fontSize: "13px" }}>
                Aucune verification effectuee. Lancez un check depuis l'onglet Projets.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Date", "Position moyenne", "Mots-cles", "Top 10", "Trafic est."].map(h => (
                        <th key={h} style={{
                          textAlign: "left", padding: "10px 24px",
                          fontSize: "11px", color: "#6B7C93", fontWeight: 500,
                          textTransform: "uppercase", letterSpacing: "0.5px",
                          borderBottom: "1px solid #2a2d3a",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...history].reverse().map((h, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #2a2d3a20" }}>
                        <td style={{ padding: "12px 24px", color: "#425466", fontSize: "13px" }}>
                          {new Date(h.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td style={{ padding: "12px 24px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            minWidth: "32px", padding: "2px 8px", borderRadius: "6px",
                            background: h.averagePosition <= 10 ? "rgba(34,197,94,0.12)" : h.averagePosition <= 30 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                            color: h.averagePosition <= 10 ? "#22c55e" : h.averagePosition <= 30 ? "#f59e0b" : "#ef4444",
                            fontSize: "13px", fontWeight: 600,
                          }}>
                            {h.averagePosition}
                          </span>
                        </td>
                        <td style={{ padding: "12px 24px", color: "#6B7C93", fontSize: "13px" }}>
                          {h.keywordCount}
                        </td>
                        <td style={{ padding: "12px 24px", color: "#22c55e", fontSize: "13px", fontWeight: 500 }}>
                          {h.inTop10 !== undefined ? h.inTop10 : "--"}
                        </td>
                        <td style={{ padding: "12px 24px", color: "#f59e0b", fontSize: "13px", fontWeight: 500 }}>
                          {h.estimatedTraffic !== undefined ? h.estimatedTraffic.toLocaleString("fr-FR") : "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
