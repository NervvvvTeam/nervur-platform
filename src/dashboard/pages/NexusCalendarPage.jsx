import { useState } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const NEXUS_NAV = [
  { path: "/app/nexus", label: "Générateur", end: true },
  { path: "/app/nexus/contacts", label: "Contacts" },
  { path: "/app/nexus/campaigns", label: "Campagnes" },
  { path: "/app/nexus/sequences", label: "Séquences" },
  { path: "/app/nexus/calendar", label: "Calendrier" },
];

const PLATFORMS = ["LinkedIn", "Instagram", "Facebook", "X (Twitter)"];

const PLATFORM_COLORS = {
  LinkedIn: "#0077b5",
  Instagram: "#e4405f",
  Facebook: "#1877f2",
  "X (Twitter)": "#1da1f2",
  Twitter: "#1da1f2",
};

export default function NexusCalendarPage() {
  const api = useApi();
  const [sector, setSector] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["LinkedIn", "Instagram"]);
  const [weekCount, setWeekCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const togglePlatform = (p) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const generate = async () => {
    if (!sector.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.post("/api/nexus/calendar", {
        sector: sector.trim(), companyName: companyName.trim(),
        platforms: selectedPlatforms, weekCount,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Erreur de génération");
    } finally {
      setLoading(false);
    }
  };

  const copyPost = (post, id) => {
    const text = post.content + (post.hashtags ? "\n\n" + post.hashtags : "");
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ maxWidth: "1100px" }}>
      <SubNav color="#10b981" items={NEXUS_NAV} />
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #10b981, #34d399)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>
          Calendrier éditorial
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>
          Planifiez vos publications sur plusieurs semaines en un clic.
        </p>
      </div>

      {/* Form */}
      <div style={{
        padding: "24px", background: "#1e2029", border: "1px solid #2a2d3a",
        borderRadius: "10px", marginBottom: "20px"
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Secteur d'activité</div>
            <input type="text" value={sector} onChange={e => setSector(e.target.value)}
              placeholder="Restauration, e-commerce, SaaS..."
              style={{
                width: "100%", padding: "10px 14px", background: "#1e2029",
                border: "1px solid #2a2d3a", borderRadius: "8px",
                color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "#2a2d3a"} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Entreprise</div>
            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
              placeholder="NERVÜR"
              style={{
                width: "100%", padding: "10px 14px", background: "#1e2029",
                border: "1px solid #2a2d3a", borderRadius: "8px",
                color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "#2a2d3a"} />
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Plateformes</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {PLATFORMS.map(p => (
              <button key={p} onClick={() => togglePlatform(p)}
                style={{
                  padding: "7px 16px", borderRadius: "6px",
                  fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                  background: selectedPlatforms.includes(p) ? (PLATFORM_COLORS[p] || "#10b981") + "20" : "#1e2029",
                  color: selectedPlatforms.includes(p) ? (PLATFORM_COLORS[p] || "#10b981") : "#9ca3af",
                  border: selectedPlatforms.includes(p) ? `1px solid ${(PLATFORM_COLORS[p] || "#10b981")}30` : "1px solid #2a2d3a",
                }}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>
            Nombre de semaines : {weekCount}
          </div>
          <input type="range" min={1} max={4} value={weekCount} onChange={e => setWeekCount(+e.target.value)}
            style={{ width: "200px", accentColor: "#10b981" }} />
        </div>

        <button onClick={generate} disabled={loading || !sector.trim() || selectedPlatforms.length === 0}
          style={{
            padding: "12px 28px",
            background: "linear-gradient(135deg, #10b981, #34d399)",
            color: "#fff",
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500,
            cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
            opacity: loading || !sector.trim() ? 0.5 : 1,
            boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
          }}>
          {loading ? "Génération..." : "Générer le calendrier"}
        </button>
      </div>

      {error && (
        <div style={{
          padding: "14px 18px", background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px",
          color: "#f87171", fontSize: "14px", marginBottom: "16px"
        }}>{error}</div>
      )}

      {/* Result */}
      {result && (
        <div>
          {result.strategy && (
            <div style={{
              padding: "16px 20px", background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.15)", borderRadius: "10px",
              marginBottom: "16px"
            }}>
              <div style={{ fontSize: "12px", color: "#10b981", marginBottom: "6px", fontWeight: 500 }}>Stratégie éditoriale</div>
              <p style={{ fontSize: "14px", color: "#d1d5db", lineHeight: 1.6, margin: 0 }}>{result.strategy}</p>
            </div>
          )}

          {(result.weeks || []).map((week, wi) => (
            <div key={wi} style={{ marginBottom: "24px" }}>
              <div style={{
                fontSize: "14px", fontWeight: 600, color: "#f0f0f3",
                marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px"
              }}>
                <span style={{
                  fontSize: "11px", padding: "3px 10px", borderRadius: "4px",
                  background: "#10b98114", color: "#10b981",
                }}>Semaine {week.week}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(week.posts || []).map((post, pi) => {
                  const postId = `${wi}-${pi}`;
                  const pColor = PLATFORM_COLORS[post.platform] || "#10b981";
                  return (
                    <div key={pi} style={{
                      padding: "18px 20px", background: "#1e2029", border: "1px solid #2a2d3a",
                      borderRadius: "10px", borderLeft: `3px solid ${pColor}`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 500, color: "#d1d5db" }}>{post.day}</span>
                          <span style={{
                            fontSize: "11px", padding: "2px 8px", borderRadius: "4px",
                            background: pColor + "18", color: pColor,
                          }}>{post.platform}</span>
                          {post.type && (
                            <span style={{ fontSize: "11px", color: "#d1d5db" }}>{post.type}</span>
                          )}
                        </div>
                        <button onClick={() => copyPost(post, postId)}
                          style={{
                            padding: "4px 12px", background: copiedId === postId ? "#10b98120" : "#1e2029",
                            border: "1px solid #2a2d3a", borderRadius: "4px",
                            color: copiedId === postId ? "#10b981" : "#9ca3af",
                            fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
                          }}>
                          {copiedId === postId ? "Copié !" : "Copier"}
                        </button>
                      </div>

                      {post.topic && (
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#6b7280", marginBottom: "8px" }}>
                          {post.topic}
                        </div>
                      )}

                      <div style={{
                        fontSize: "14px", color: "#d1d5db", lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                      }}>
                        {post.content}
                      </div>

                      {post.hashtags && (
                        <div style={{ fontSize: "12px", color: "#10b981", marginTop: "8px" }}>
                          {post.hashtags}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
