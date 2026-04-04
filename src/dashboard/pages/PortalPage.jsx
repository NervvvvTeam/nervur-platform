import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LogoNervur from "../../components/LogoNervur";

const C = {
  bg: "#F0F1F3", bgAlt: "#E8E9EC", text: "#0F172A", body: "#334155",
  muted: "#64748B", faint: "#94A3B8", accent: "#6C5CE7", accentHover: "#5A4BD6",
  accentLight: "#EEF2FF", border: "#E2E8F0", borderHover: "#CBD5E1",
  sentinel: "#DC2626", vault: "#0891B2",
};
const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const TOOLS = [
  {
    id: "sentinel", name: "Sentinel", subtitle: "E-reputation",
    desc: "Surveillez vos avis Google, repondez avec l'IA et analysez votre reputation en ligne.",
    color: C.sentinel, path: "/app/sentinel", stats: "Score | Avis | Reponses IA",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    id: "vault", name: "Vault", subtitle: "Agent Juridique IA",
    desc: "Conformite RGPD automatisee. Scan, documents legaux, registre, AIPD et veille juridique.",
    color: C.vault, path: "/app/vault", stats: "RGPD | Generateur | Registre | Veille",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  },
];

const TIPS = [
  "Repondez aux avis dans les 24h pour ameliorer votre score.",
  "Lancez un scan Vault chaque mois pour verifier votre conformite RGPD.",
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: "20px", fontWeight: 600, color: C.text, fontVariantNumeric: "tabular-nums" }}>
        {time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
      <div style={{ fontSize: "12px", color: C.muted, textTransform: "capitalize", marginTop: "2px" }}>
        {time.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
      </div>
    </div>
  );
}

function RightPanel({ hasAccess }) {
  const { get } = useApi();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = {};
        if (hasAccess("sentinel")) {
          try {
            const businesses = await get("/api/sentinel-app/businesses");
            if (businesses?.businesses?.[0]) {
              const s = await get(`/api/sentinel-app/businesses/${businesses.businesses[0]._id}/stats`);
              data.score = s?.averageRating?.toFixed(1) || "—";
              data.reviews = s?.totalReviews || 0;
            }
          } catch(e) {}
        }
        if (hasAccess("vault")) {
          try {
            const checklist = await get("/api/vault/checklist");
            const total = checklist?.items?.length || 0;
            const done = checklist?.items?.filter(i => i.done)?.length || 0;
            data.conformiteScore = total > 0 ? Math.round((done / total) * 100) : "—";
          } catch(e) {}
        }
        data.tools = [hasAccess("sentinel"), hasAccess("vault")].filter(Boolean).length;
        setStats(data);
      } catch(e) { setStats({ tools: 0 }); }
    }
    loadStats();
  }, []);

  const statItems = [
    { label: "Outils actifs", value: stats ? `${stats.tools}/2` : "—", color: "#22c55e" },
    ...(hasAccess("sentinel") ? [
      { label: "Score reputation", value: stats?.score || "—", color: C.sentinel },
      { label: "Total avis", value: stats?.reviews ?? "—", color: C.sentinel },
    ] : []),
    ...(hasAccess("vault") ? [
      { label: "Score conformite", value: stats?.conformiteScore != null ? `${stats.conformiteScore}%` : "—", color: C.vault },
    ] : []),
  ];

  return (
    <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Overview */}
      <div style={{ padding: "20px", borderRadius: "14px", background: C.accentLight, border: `1px solid ${C.accent}15` }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: C.accent, letterSpacing: "0.5px" }}>NERVÜR</span>
        <p style={{ fontSize: "13px", color: C.body, lineHeight: 1.7, marginTop: "8px" }}>
          Votre espace de gestion centralise. Accedez a vos outils et suivez vos statistiques.
        </p>
      </div>

      {/* Stats */}
      <div style={{ padding: "20px", borderRadius: "14px", background: C.bg, border: `1px solid ${C.border}` }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: C.muted, letterSpacing: "0.5px" }}>RESUME</span>
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "0" }}>
          {statItems.map((s, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0", borderBottom: i < statItems.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize: "13px", color: C.muted }}>{s.label}</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <a href="/contact" style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "14px 16px", borderRadius: "12px",
        background: C.accentLight, border: `1px solid ${C.accent}20`,
        textDecoration: "none", transition: `all 0.2s ${EASE}`,
      }}>
        <span style={{ fontSize: "18px" }}>💬</span>
        <div>
          <div style={{ fontSize: "13px", color: C.accent, fontWeight: 600 }}>Besoin d'aide ?</div>
          <div style={{ fontSize: "11px", color: C.muted }}>Contactez-nous</div>
        </div>
      </a>
    </div>
  );
}

export default function PortalPage() {
  const { user, hasAccess } = useAuth();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const tipIndex = Math.floor(Date.now() / 86400000) % TIPS.length;

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return (
    <div style={{ fontFamily: FONT }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
      `}</style>

      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
        {/* LEFT — Tools */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "32px", padding: "28px 32px", borderRadius: "16px",
            background: C.bg, border: `1px solid ${C.border}`,
            animation: "fadeInUp 0.5s ease both",
          }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: C.text, margin: 0 }}>
                Bonjour, {user?.name?.split(" ")[0] || "Client"}
              </h1>
              <p style={{ fontSize: "14px", color: C.muted, margin: "4px 0 0" }}>
                Votre espace de gestion NERVÜR
              </p>
            </div>
            <LiveClock />
          </div>

          {/* Tool Cards */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "20px" }}>
            {TOOLS.map((tool, i) => {
              const active = hasAccess(tool.id);
              const isHovered = hoveredCard === tool.id;
              return (
                <div key={tool.id}
                  onClick={() => active ? navigate(tool.path) : window.open("https://nervur.fr/contact", "_blank")}
                  onMouseEnter={() => setHoveredCard(tool.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    padding: "28px", borderRadius: "16px", cursor: "pointer",
                    background: C.bg, border: `1px solid ${isHovered && active ? `${tool.color}40` : C.border}`,
                    position: "relative", overflow: "hidden",
                    opacity: active ? 1 : 0.5,
                    transform: isHovered && active ? "translateY(-4px)" : "translateY(0)",
                    boxShadow: isHovered && active ? `0 12px 32px ${tool.color}10` : "0 1px 3px rgba(0,0,0,0.04)",
                    transition: `all 0.3s ${EASE}`,
                    animation: `fadeInUp 0.5s ease ${i * 0.1}s both`,
                  }}>
                  {/* Top accent bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: active ? tool.color : C.border }} />

                  {/* Icon */}
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "12px",
                    background: tool.color, display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "16px", transition: `transform 0.3s ${EASE}`,
                    transform: isHovered && active ? "scale(1.05)" : "scale(1)",
                    boxShadow: active ? `0 4px 12px ${tool.color}30` : "none",
                  }}>{tool.icon}</div>

                  {/* Title + badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 600, color: C.text, margin: 0 }}>{tool.name}</h3>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "4px", color: tool.color, background: `${tool.color}10` }}>{tool.subtitle}</span>
                    {active && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#22c55e", fontWeight: 500 }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
                        Actif
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "14px", color: C.body, lineHeight: 1.6, margin: "0 0 16px" }}>{tool.desc}</p>

                  {active && <div style={{ fontSize: "12px", color: C.faint, padding: "8px 12px", borderRadius: "8px", background: C.bgAlt, border: `1px solid ${C.border}`, marginBottom: "16px" }}>{tool.stats}</div>}

                  <div style={{ marginTop: "auto" }}>
                    {active ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                        color: tool.color, background: `${tool.color}10`, border: `1px solid ${tool.color}25`,
                        transition: `all 0.2s ${EASE}`,
                      }}>Ouvrir &rarr;</span>
                    ) : (
                      <span style={{ fontSize: "12px", color: C.faint }}>Non souscrit</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip */}
          <div style={{
            marginTop: "24px", padding: "16px 20px", borderRadius: "12px",
            background: C.accentLight, border: `1px solid ${C.accent}15`,
            animation: "fadeInUp 0.5s ease 0.3s both",
          }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: C.accent, letterSpacing: "0.5px" }}>CONSEIL DU JOUR</span>
            <p style={{ fontSize: "13px", color: C.body, margin: "6px 0 0", lineHeight: 1.6 }}>{TIPS[tipIndex]}</p>
          </div>
        </div>

        {/* RIGHT — Stats panel (desktop only) */}
        {!isMobile && <RightPanel hasAccess={hasAccess} />}
      </div>
    </div>
  );
}
