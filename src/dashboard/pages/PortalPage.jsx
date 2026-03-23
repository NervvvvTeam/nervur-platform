import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const ShieldIcon = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const PenIcon = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);

const BoltIcon = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ShieldCheckIcon = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const TOOLS = [
  {
    id: "sentinel",
    name: "Sentinel",
    desc: "Surveillance e-réputation, gestion des avis clients et réponses automatisées par IA.",
    color: "#ef4444",
    Icon: ShieldIcon,
    path: "/app/sentinel",
  },
  {
    id: "phantom",
    name: "Phantom",
    desc: "Audit de performance web, scores Lighthouse et recommandations d'optimisation.",
    color: "#8b5cf6",
    Icon: PenIcon,
    path: "/app/phantom",
  },
  {
    id: "nexus",
    name: "Nexus",
    desc: "Création de contenu, planification social media et séquences email.",
    color: "#10b981",
    Icon: BoltIcon,
    path: "/app/nexus",
  },
  {
    id: "vault",
    name: "Vault",
    desc: "Surveillance des fuites de données. Vérifiez si vos emails professionnels sont compromis.",
    color: "#06b6d4",
    Icon: ShieldCheckIcon,
    path: "/app/vault",
  },
];

export default function PortalPage() {
  const { user, hasAccess } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* Header */}
      <div style={{ marginBottom: "36px", padding: "24px 28px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(129,140,248,0.04) 100%)", border: "1px solid rgba(99,102,241,0.12)" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>
          Bonjour, <span style={{ color: "#818CF8" }}>{user?.name?.split(" ")[0] || "Client"}</span>
        </h1>
        <p style={{ fontSize: "14px", color: "#71717A" }}>
          Votre espace de gestion NERVÜR
        </p>
      </div>

      {/* Tools */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {TOOLS.map(tool => {
          const active = hasAccess(tool.id);
          const { Icon, color } = tool;
          return (
            <div
              key={tool.id}
              onClick={() => active ? navigate(tool.path) : window.open("https://nervur.fr/contact", "_blank")}
              style={{
                padding: "20px 24px",
                border: active ? `1px solid ${color}30` : "1px solid #1e1e2a",
                borderLeft: active ? `3px solid ${color}` : "3px solid #1e1e2a",
                borderRadius: "10px",
                background: active ? "#151620" : "#131318",
                cursor: "pointer",
                opacity: active ? 1 : 0.5,
                display: "flex", alignItems: "center", gap: "18px",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (active) { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.background = `${color}15`; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = active ? `${color}30` : "#1e1e2a"; e.currentTarget.style.borderLeft = active ? `3px solid ${color}` : "3px solid #1e1e2a"; e.currentTarget.style.background = active ? "#151620" : "#131318"; }}
            >
              {/* Icon */}
              <div style={{
                width: "48px", height: "48px", borderRadius: "10px",
                background: `${color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                <Icon color={active ? color : "#52525B"} size={24} />
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 500, color: active ? "#FAFAFA" : "#52525B", margin: 0 }}>
                    {tool.name}
                  </h3>
                  {active ? (
                    <span style={{ fontSize: "11px", fontWeight: 600, color, padding: "3px 10px", borderRadius: "4px", background: `${color}22` }}>Actif</span>
                  ) : (
                    <span style={{ fontSize: "11px", fontWeight: 400, color: "#52525B" }}>Non souscrit</span>
                  )}
                </div>
                <p style={{ fontSize: "13px", color: "#71717A", margin: 0, lineHeight: 1.5 }}>
                  {tool.desc}
                </p>
              </div>

              {/* Arrow */}
              <span style={{ color: active ? color : "#3f3f46", fontSize: "16px" }}>→</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #1e1e2a" }}>
        <p style={{ fontSize: "13px", color: "#52525B" }}>
          Besoin d'aide ?{" "}
          <a href="https://nervur.fr/contact" target="_blank" rel="noopener noreferrer"
            style={{ color: "#6366f1", textDecoration: "none" }}>
            Contactez-nous
          </a>
        </p>
      </div>
    </div>
  );
}
