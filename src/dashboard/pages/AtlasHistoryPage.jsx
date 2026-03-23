import { useState, useEffect, useRef } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const ATLAS_COLOR = "#f59e0b";

const ATLAS_NAV = [
  { path: "/app/atlas", label: "Projets", end: true },
  { path: "/app/atlas/history", label: "\u00c9volution" },
];

function MiniChart({ data, width = 400, height = 160 }) {
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

    const positions = data.map(d => d.averagePosition);
    const maxPos = Math.max(...positions, 50);
    const minPos = Math.min(...positions, 1);
    const range = maxPos - minPos || 1;

    const padX = 40;
    const padY = 20;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    // Grid lines
    ctx.strokeStyle = "#2a2d3a";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padY + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.stroke();

      // Labels (inverted - lower position = higher on chart)
      const posVal = Math.round(maxPos - (range / 4) * i);
      ctx.fillStyle = "#6b7280";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(posVal.toString(), padX - 8, y + 4);
    }

    // Draw line (inverted Y - position 1 is top)
    ctx.beginPath();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    const points = data.map((d, i) => ({
      x: padX + (chartW / (data.length - 1)) * i,
      y: padY + chartH - ((d.averagePosition - minPos) / range) * chartH,
    }));

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
    gradient.addColorStop(0, "rgba(245,158,11,0.15)");
    gradient.addColorStop(1, "rgba(245,158,11,0)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Dots
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.fill();
      ctx.strokeStyle = "#1e2029";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

  }, [data, width, height]);

  if (!data || data.length < 2) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: "13px" }}>
        Pas assez de donnees pour afficher le graphique. Lancez au moins 2 verifications.
      </div>
    );
  }

  return <canvas ref={canvasRef} style={{ width: `${width}px`, height: `${height}px` }} />;
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
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f0f0f3", margin: 0, marginBottom: "6px" }}>
          Evolution des positions
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
          Historique de vos positions moyennes au fil du temps
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>Chargement...</div>
      ) : projects.length === 0 ? (
        <div style={{
          background: "#1e2029", borderRadius: "14px", padding: "60px 32px",
          border: "1px solid #2a2d3a", textAlign: "center",
        }}>
          <h3 style={{ color: "#f0f0f3", fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>Aucun projet</h3>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Creez un projet dans l'onglet Projets pour voir son evolution.</p>
        </div>
      ) : (
        <>
          {/* Project Selector */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>Projet</label>
            <select
              value={selectedProject || ""}
              onChange={e => setSelectedProject(e.target.value)}
              style={{
                padding: "10px 14px", background: "#1e2029",
                border: "1px solid #2a2d3a", borderRadius: "8px", color: "#f0f0f3",
                fontSize: "13px", fontFamily: "inherit", outline: "none", minWidth: "260px",
              }}
            >
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.domain} ({p.keywords?.length || 0} mots-cles)</option>
              ))}
            </select>
          </div>

          {/* Chart */}
          <div style={{
            background: "#1e2029", borderRadius: "14px", padding: "24px",
            border: "1px solid #2a2d3a", marginBottom: "24px",
          }}>
            <h3 style={{ color: "#f0f0f3", fontSize: "14px", fontWeight: 600, margin: "0 0 16px" }}>
              Position moyenne — {currentProject?.domain}
            </h3>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <MiniChart data={history} width={Math.min(600, typeof window !== "undefined" ? window.innerWidth - 160 : 600)} height={180} />
            </div>
            <div style={{ textAlign: "center", marginTop: "8px", fontSize: "11px", color: "#6b7280" }}>
              Note : une position basse (proche de 1) est meilleure
            </div>
          </div>

          {/* History Table */}
          <div style={{
            background: "#1e2029", borderRadius: "14px",
            border: "1px solid #2a2d3a", overflow: "hidden",
          }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #2a2d3a" }}>
              <h3 style={{ color: "#f0f0f3", fontSize: "14px", fontWeight: 600, margin: 0 }}>Historique des verifications</h3>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>
                Aucune verification effectuee. Lancez un check depuis l'onglet Projets.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Date", "Position moyenne", "Mots-cles"].map(h => (
                      <th key={h} style={{
                        textAlign: "left", padding: "10px 24px",
                        fontSize: "11px", color: "#6b7280", fontWeight: 500,
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        borderBottom: "1px solid #2a2d3a",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((h, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #2a2d3a20" }}>
                      <td style={{ padding: "12px 24px", color: "#d1d5db", fontSize: "13px" }}>
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
                      <td style={{ padding: "12px 24px", color: "#9ca3af", fontSize: "13px" }}>
                        {h.keywordCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
