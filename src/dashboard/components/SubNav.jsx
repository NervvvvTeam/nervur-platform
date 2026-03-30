import { NavLink, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import AuditIcon from "./AuditIcon";

const I = (d, c, s = 15) => <svg key={c} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const ICONS = {
  "Dashboard": (c) => I(<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>, c),
  "Avis clients": (c) => I(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>, c),
  "Analyse IA": (c) => I(<><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/><path d="M21 3l-9 9"/></>, c),
  "Concurrents": (c) => I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>, c),
  "Rapports": (c) => I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, c),
  "QR Code": (c) => I(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></>, c),
  "Widget": (c) => I(<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>, c),
  "Alertes": (c) => I(<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, c),
  "Timeline": (c) => I(<><path d="M12 2v20"/><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 6h-2"/><path d="M6 18h-2"/><path d="M18 12h2"/></>, c),
  "Paramètres": (c) => I(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>, c),
  "Historique": (c) => I(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, c),
  "Recommandations": (c) => I(<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>, c),
  "Générateur": (c) => I(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>, c),
  "Contacts": (c) => I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></>, c),
  "Campagnes": (c) => I(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, c),
  "Séquences": (c) => I(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, c),
  "Calendrier": (c) => I(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, c),
  "Scanner": (c) => I(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>, c),
  "Scan RGPD": (c) => I(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>, c),
  "Surveillance": (c) => I(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>, c),
  "Moniteur": (c) => I(<><path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572"/><path d="M12 6v4l2 2-2 2v4"/></>, c),
  "Projets": (c) => I(<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>, c),
  "Évolution": (c) => I(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>, c),
  "Planification": (c) => I(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, c),
  "Page de statut": (c) => I(<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>, c),
  "Suggestions IA": (c) => I(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>, c),
  "Rapports": (c) => I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, c),
  "Registre": (c) => I(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>, c),
  "Checklist": (c) => I(<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>, c),
  "Badge": (c) => I(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>, c),
  "Veille": (c) => I(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>, c),
  "Actions": (c) => I(<><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></>, c),
  "Audit": (c) => <AuditIcon color={c} />,
};

const MAX_VISIBLE = 7;

export default function SubNav({ items, color }) {
  const [hoveredPath, setHoveredPath] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on navigation
  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  const visibleItems = items.length > MAX_VISIBLE ? items.slice(0, MAX_VISIBLE) : items;
  const overflowItems = items.length > MAX_VISIBLE ? items.slice(MAX_VISIBLE) : [];
  const isOverflowActive = overflowItems.some(item => location.pathname === item.path);

  const tabStyle = (isActive, isHovered) => ({
    padding: "10px 14px", fontSize: "13px", fontWeight: isActive ? 500 : 400,
    color: isActive ? color : isHovered ? "#9ca3af" : "#6b7280",
    borderBottom: isActive ? `2px solid ${color}` : "2px solid transparent",
    textDecoration: "none", transition: "all 0.2s",
    marginBottom: "-1px", whiteSpace: "nowrap",
    display: "flex", alignItems: "center", gap: "6px",
    background: !isActive && isHovered ? "rgba(255,255,255,0.03)" : "transparent",
  });

  return (
    <nav style={{
      display: "flex", alignItems: "center", gap: "2px", marginBottom: "28px",
      borderBottom: "1px solid #2a2d3a", position: "relative",
      boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
    }}>
      {visibleItems.map(item => {
        const iconFn = ICONS[item.label];
        const isHovered = hoveredPath === item.path;
        return (
          <NavLink key={item.path} to={item.path} end={item.end !== false}
            onMouseEnter={() => setHoveredPath(item.path)}
            onMouseLeave={() => setHoveredPath(null)}
            style={({ isActive }) => tabStyle(isActive, isHovered)}>
            {({ isActive }) => (
              <>
                {iconFn && iconFn(isActive ? color : isHovered ? "#9ca3af" : "#6b7280")}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}

      {overflowItems.length > 0 && (
        <div ref={moreRef} style={{ position: "relative", marginLeft: "auto" }}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            style={{
              ...tabStyle(isOverflowActive, hoveredPath === "__more"),
              cursor: "pointer", border: "none", fontFamily: "inherit",
              borderBottom: isOverflowActive ? `2px solid ${color}` : moreOpen ? `2px solid ${color}40` : "2px solid transparent",
              color: isOverflowActive ? color : moreOpen ? "#6b7280" : "#9ca3af",
            }}
            onMouseEnter={() => setHoveredPath("__more")}
            onMouseLeave={() => setHoveredPath(null)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isOverflowActive ? color : "#9ca3af"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
            <span>Plus</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points={moreOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
            </svg>
          </button>

          {moreOpen && (
            <div style={{
              position: "absolute", top: "100%", right: 0, marginTop: "4px",
              background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px",
              padding: "6px", minWidth: "180px", zIndex: 100,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
            }}>
              {overflowItems.map(item => {
                const iconFn = ICONS[item.label];
                const isActive = location.pathname === item.path;
                const isHovered = hoveredPath === item.path;
                return (
                  <NavLink key={item.path} to={item.path} end={item.end !== false}
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "10px 12px", borderRadius: "6px",
                      fontSize: "13px", fontWeight: isActive ? 500 : 400,
                      color: isActive ? color : isHovered ? "#d1d5db" : "#6b7280",
                      background: isActive ? `${color}15` : isHovered ? "rgba(255,255,255,0.05)" : "transparent",
                      textDecoration: "none", transition: "all 0.15s",
                    }}>
                    {iconFn && iconFn(isActive ? color : isHovered ? "#d1d5db" : "#9ca3af")}
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
