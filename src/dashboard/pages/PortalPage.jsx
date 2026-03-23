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
      <div style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>
          Bonjour, {user?.name?.split(" ")[0] || "Client"}
        </h1>
        <p style={{ fontSize: "14px", color: "#71717A" }}>
          Retrouvez vos outils ci-dessous.
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
                border: active ? `1px solid ${color}25` : "1px solid #1e1e22",
                borderRadius: "10px",
                background: active ? "#141416" : "#111113",
                cursor: "pointer",
                opacity: active ? 1 : 0.5,
                display: "flex", alignItems: "center", gap: "18px",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (active) { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.background = `${color}08`; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = active ? `${color}25` : "#1e1e22"; e.currentTarget.style.background = active ? "#141416" : "#111113"; }}
            >
              {/* Icon */}
              <div style={{
                width: "42px", height: "42px", borderRadius: "10px",
                background: `${color}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                <Icon color={active ? color : "#52525B"} />
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 500, color: active ? "#FAFAFA" : "#52525B", margin: 0 }}>
                    {tool.name}
                  </h3>
                  {active ? (
                    <span style={{ fontSize: "11px", fontWeight: 500, color, padding: "1px 8px", borderRadius: "4px", background: `${color}14` }}>Actif</span>
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
      <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #1e1e22" }}>
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
