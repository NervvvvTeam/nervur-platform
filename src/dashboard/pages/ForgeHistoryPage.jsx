import { useState } from "react";

const ACCENT = "#f59e0b";

const cardStyle = {
  background: "#141416",
  border: "1px solid #1e1e22",
  borderRadius: "10px",
  padding: "24px",
};

export default function ForgeHistoryPage() {
  const [selectedPage, setSelectedPage] = useState(null);

  // Coming soon state — no history backend yet
  const pages = [];

  if (selectedPage) {
    return (
      <div style={{ maxWidth: "1100px" }}>
        {/* Header with back button */}
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={() => setSelectedPage(null)}
            style={{
              background: "none", border: "none", color: "#71717A",
              fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
              padding: "0", display: "flex", alignItems: "center", gap: "6px",
              marginBottom: "12px",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#A1A1AA")}
            onMouseLeave={(e) => (e.target.style.color = "#71717A")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Retour à l'historique
          </button>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#FAFAFA", margin: 0 }}>
            {selectedPage.businessName}
          </h2>
          <p style={{ fontSize: "13px", color: "#71717A", margin: "4px 0 0" }}>
            Généré le {selectedPage.date}
          </p>
        </div>

        {/* Iframe preview */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{
            padding: "10px 16px", background: "#111113",
            borderBottom: "1px solid #1e1e22",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: "12px", color: "#52525B", marginLeft: "8px" }}>
              Aperçu — {selectedPage.businessName}.html
            </span>
          </div>
          <iframe
            srcDoc={selectedPage.html}
            sandbox="allow-scripts"
            title="Landing page preview"
            style={{ width: "100%", height: "700px", border: "none", background: "#fff" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ACCENT }} />
          <span style={{ fontSize: "12px", color: ACCENT, fontWeight: 500 }}>Forge</span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA", margin: 0, marginBottom: "6px" }}>
          Historique
        </h1>
        <p style={{ fontSize: "14px", color: "#71717A", margin: 0 }}>
          Retrouvez toutes vos landing pages générées.
        </p>
      </div>

      {pages.length === 0 ? (
        /* Coming soon / Empty state */
        <div style={{
          ...cardStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
        }}>
          {/* Clock icon */}
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "20px",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#FAFAFA", margin: "0 0 8px" }}>
            Bientôt disponible
          </h3>
          <p style={{ fontSize: "14px", color: "#71717A", margin: 0, maxWidth: "400px", lineHeight: "1.6" }}>
            L'historique de vos pages générées sera bientôt accessible ici.
            En attendant, vous pouvez créer de nouvelles landing pages depuis l'onglet "Créer une page".
          </p>
          <a
            href="/app/forge"
            style={{
              marginTop: "24px",
              padding: "10px 22px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              background: `${ACCENT}18`,
              color: ACCENT,
              border: `1px solid ${ACCENT}40`,
              textDecoration: "none",
              transition: "all 0.15s",
              display: "inline-block",
            }}
          >
            Créer une page
          </a>
        </div>
      ) : (
        /* History list (ready for when backend is available) */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {pages.map((page, idx) => (
            <div
              key={idx}
              style={{
                ...cardStyle,
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onClick={() => setSelectedPage(page)}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3f3f46")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e22")}
            >
              {/* Thumbnail placeholder */}
              <div style={{
                width: "100%", height: "160px", borderRadius: "6px",
                background: "#0f0f11", border: "1px solid #1e1e22",
                marginBottom: "14px", overflow: "hidden",
              }}>
                <iframe
                  srcDoc={page.html}
                  sandbox=""
                  title={page.businessName}
                  style={{
                    width: "200%", height: "320px", border: "none",
                    transform: "scale(0.5)", transformOrigin: "top left",
                    pointerEvents: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#FAFAFA", margin: "0 0 4px" }}>
                    {page.businessName}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#71717A", margin: 0 }}>
                    {page.date}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Delete would go here when backend is ready
                  }}
                  style={{
                    background: "none", border: "none", color: "#52525B",
                    cursor: "pointer", padding: "4px", borderRadius: "4px",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#ef4444")}
                  onMouseLeave={(e) => (e.target.style.color = "#52525B")}
                  title="Supprimer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
