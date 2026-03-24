import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMemo, useState, useEffect } from "react";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

const I = (d, c) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const NAV_ICONS = {
  "/app/portal": (c) => I(<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>, c),
  "/app/sentinel": (c) => I(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, c),
  "/app/reviews": (c) => I(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>, c),
  "/app/analytics": (c) => I(<><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/><path d="M21 3l-9 9"/></>, c),
  "/app/competitors": (c) => I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>, c),
  "/app/reports": (c) => I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, c),
  "/app/qrcode": (c) => I(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></>, c),
  "/app/widget": (c) => I(<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>, c),
  "/app/alerts": (c) => I(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>, c),
  "/app/phantom": (c) => I(<><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>, c),
  "/app/phantom/history": (c) => I(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>, c),
  "/app/phantom/recommendations": (c) => I(<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>, c),
  "/app/phantom/competitors": (c) => I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>, c),
  "/app/phantom/schedule": (c) => I(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, c),
  "/app/nexus": (c) => I(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>, c),
  "/app/nexus/sequences": (c) => I(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, c),
  "/app/nexus/calendar": (c) => I(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, c),
  "/app/nexus/contacts": (c) => I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>, c),
  "/app/nexus/campaigns": (c) => I(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, c),
  "/app/forge": (c) => I(<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>, c),
  "/app/forge/history": (c) => I(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, c),
  "/app/vault": (c) => I(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>, c),
  "/app/vault/history": (c) => I(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, c),
  "/app/vault/monitoring": (c) => I(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>, c),
  "/app/vault/rgpd": (c) => I(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>, c),
  "/app/pulse": (c) => I(<><path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572"/><path d="M12 6v4l2 2-2 2v4"/></>, c),
  "/app/pulse/history": (c) => I(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>, c),
  "/app/pulse/alerts": (c) => I(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>, c),
  "/app/pulse/status": (c) => I(<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>, c),
  "/app/atlas": (c) => I(<><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></>, c),
  "/app/atlas/history": (c) => I(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>, c),
  "/app/atlas/suggestions": (c) => I(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>, c),
  "/app/atlas/reports": (c) => I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, c),
  "/app/settings": (c) => I(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>, c),
};

// Tool color themes
const TOOL_COLORS = {
  sentinel: "#ef4444",
  phantom: "#8b5cf6",
  nexus: "#10b981",
  forge: "#f59e0b",
  vault: "#06b6d4",
  pulse: "#ec4899",
  atlas: "#f59e0b",
  general: "#6366f1",
};

// Map paths to their tool color
const PATH_COLORS = {
  "/app/portal": TOOL_COLORS.general,
  "/app/sentinel": TOOL_COLORS.sentinel,
  "/app/reviews": TOOL_COLORS.sentinel,
  "/app/analytics": TOOL_COLORS.sentinel,
  "/app/competitors": TOOL_COLORS.sentinel,
  "/app/reports": TOOL_COLORS.sentinel,
  "/app/qrcode": TOOL_COLORS.sentinel,
  "/app/widget": TOOL_COLORS.sentinel,
  "/app/alerts": TOOL_COLORS.sentinel,
  "/app/phantom": TOOL_COLORS.phantom,
  "/app/phantom/history": TOOL_COLORS.phantom,
  "/app/phantom/recommendations": TOOL_COLORS.phantom,
  "/app/phantom/competitors": TOOL_COLORS.phantom,
  "/app/phantom/schedule": TOOL_COLORS.phantom,
  "/app/nexus": TOOL_COLORS.nexus,
  "/app/nexus/sequences": TOOL_COLORS.nexus,
  "/app/nexus/calendar": TOOL_COLORS.nexus,
  "/app/nexus/contacts": TOOL_COLORS.nexus,
  "/app/nexus/campaigns": TOOL_COLORS.nexus,
  "/app/forge": TOOL_COLORS.forge,
  "/app/forge/history": TOOL_COLORS.forge,
  "/app/vault": TOOL_COLORS.vault,
  "/app/vault/history": TOOL_COLORS.vault,
  "/app/vault/scan": TOOL_COLORS.vault,
  "/app/vault/monitoring": TOOL_COLORS.vault,
  "/app/vault/rgpd": TOOL_COLORS.vault,
  "/app/pulse": TOOL_COLORS.pulse,
  "/app/pulse/history": TOOL_COLORS.pulse,
  "/app/pulse/alerts": TOOL_COLORS.pulse,
  "/app/pulse/status": TOOL_COLORS.pulse,
  "/app/atlas": TOOL_COLORS.atlas,
  "/app/atlas/history": TOOL_COLORS.atlas,
  "/app/atlas/suggestions": TOOL_COLORS.atlas,
  "/app/atlas/reports": TOOL_COLORS.atlas,
  "/app/settings": "#71717A",
};

export default function Layout() {
  const { user, logout, hasAccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const activeTool = useMemo(() => {
    if (location.pathname.startsWith("/app/sentinel") || location.pathname.startsWith("/app/reviews") || location.pathname.startsWith("/app/analytics") || location.pathname.startsWith("/app/competitors") || location.pathname.startsWith("/app/reports") || location.pathname.startsWith("/app/qrcode") || location.pathname.startsWith("/app/widget") || location.pathname.startsWith("/app/alerts") || location.pathname === "/app/settings") return "sentinel";
    if (location.pathname.startsWith("/app/phantom")) return "phantom";
    if (location.pathname.startsWith("/app/nexus")) return "nexus";
    if (location.pathname.startsWith("/app/vault")) return "vault";
    if (location.pathname.startsWith("/app/pulse")) return "pulse";
    if (location.pathname.startsWith("/app/forge")) return "forge";
    if (location.pathname.startsWith("/app/atlas")) return "atlas";
    return "portal";
  }, [location.pathname]);

  const navItems = useMemo(() => {
    const items = [
      { path: "/app/portal", label: "Mes outils", toolKey: "portal", color: TOOL_COLORS.general },
    ];
    if (hasAccess("sentinel")) {
      items.push({ path: "/app/sentinel", label: "Sentinel", toolKey: "sentinel", color: TOOL_COLORS.sentinel });
    }
    if (hasAccess("phantom")) {
      items.push({ path: "/app/phantom", label: "Phantom", toolKey: "phantom", color: TOOL_COLORS.phantom });
    }
    if (hasAccess("nexus")) {
      items.push({ path: "/app/nexus", label: "Nexus", toolKey: "nexus", color: TOOL_COLORS.nexus });
    }
    if (hasAccess("vault")) {
      items.push({ path: "/app/vault", label: "Vault", toolKey: "vault", color: TOOL_COLORS.vault });
    }
    if (hasAccess("pulse")) {
      items.push({ path: "/app/pulse", label: "Pulse", toolKey: "pulse", color: TOOL_COLORS.pulse });
    }
    if (hasAccess("atlas")) {
      items.push({ path: "/app/atlas", label: "Atlas", toolKey: "atlas", color: TOOL_COLORS.atlas });
    }
    // Paramètres est dans les onglets Sentinel
    return items;
  }, [hasAccess]);

  const renderNavItem = (item, idx, mobile = false) => {
    if (item.type === "separator") {
      return (
        <div key={`sep-${idx}`} style={{
          height: "1px", background: "#1e1e2a",
          margin: mobile ? "12px 16px" : "12px 8px",
        }} />
      );
    }
    const iconFn = NAV_ICONS[item.path];
    const toolColor = item.color || TOOL_COLORS.general;
    const isItemActive = item.toolKey === activeTool;

    return (
      <NavLink key={item.path} to={item.path}
        onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
        style={() => ({
          display: "flex", alignItems: "center", gap: "10px",
          padding: mobile ? "10px 16px" : "9px 12px",
          borderRadius: "8px", textDecoration: "none",
          fontSize: mobile ? "14px" : "13px", fontWeight: isItemActive ? 500 : 400,
          color: isItemActive ? "#FAFAFA" : "#A1A1AA",
          background: isItemActive ? `${toolColor}12` : "transparent",
          borderLeft: isItemActive ? `3px solid ${toolColor}` : "3px solid transparent",
          transition: "all 0.2s ease"
        })}
        onMouseEnter={e => {
          if (!isItemActive) {
            e.currentTarget.style.borderLeft = `3px solid ${toolColor}60`;
            e.currentTarget.style.background = `${toolColor}08`;
            e.currentTarget.style.color = "#FAFAFA";
            const dot = e.currentTarget.querySelector("[data-dot]");
            if (dot) dot.style.background = toolColor;
            const icon = e.currentTarget.querySelector("[data-icon] svg");
            if (icon) icon.style.stroke = toolColor;
          }
        }}
        onMouseLeave={e => {
          if (!isItemActive) {
            e.currentTarget.style.borderLeft = "3px solid transparent";
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#A1A1AA";
            const dot = e.currentTarget.querySelector("[data-dot]");
            if (dot) dot.style.background = "#3f3f46";
            const icon = e.currentTarget.querySelector("[data-icon] svg");
            if (icon) icon.style.stroke = "#71717A";
          }
        }}>
        <span data-dot style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: isItemActive ? toolColor : "#3f3f46",
          flexShrink: 0, transition: "background 0.2s"
        }} />
        <span data-icon style={{ display: "flex", alignItems: "center", transition: "all 0.2s" }}>
          {iconFn ? iconFn(isItemActive ? toolColor : "#71717A") : null}
        </span>
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#17181f", color: "#d1d5db", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar — desktop */}
      {!isMobile && (
        <aside style={{
          width: "230px", borderRight: "1px solid #1e1e2a", padding: "24px 12px",
          display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0,
          background: "#12131a", zIndex: 50
        }}>
          {/* Logo */}
          <div style={{ marginBottom: "28px", borderBottom: "1px solid #1e1e2a", background: "rgba(99,102,241,0.04)", borderRadius: "8px", margin: "0 -4px 28px", padding: "12px 16px 16px" }}>
            <img src="/logo-nav.png" alt="NERVÜR" style={{
              height: "36px", width: "auto", marginBottom: "6px",
              filter: "invert(1) brightness(1.15)", mixBlendMode: "screen", objectFit: "contain"
            }} />
            <div style={{ fontSize: "11px", color: "#818CF8", fontWeight: 400 }}>Espace client</div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, overflowY: "auto" }}>
            {navItems.map((item, idx) => renderNavItem(item, idx))}
          </nav>

          {/* User */}
          <div style={{ borderTop: "1px solid #1e1e2a", paddingTop: "16px", padding: "16px 8px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "6px", background: "linear-gradient(135deg, #6366f1, #818CF8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 600, color: "#fff", flexShrink: 0
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#D4D4D8", fontWeight: 500 }}>{user?.name}</div>
                <div style={{ fontSize: "11px", color: "#52525B" }}>{user?.email}</div>
              </div>
            </div>
            <button onClick={() => { logout(); navigate("/app/login"); }}
              style={{
                width: "100%", padding: "7px", background: "transparent",
                border: "1px solid #27272A", borderRadius: "6px",
                color: "#71717A", fontSize: "12px", cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s"
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#3f3f46"; e.target.style.color = "#A1A1AA"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#27272A"; e.target.style.color = "#71717A"; }}>
              Se déconnecter
            </button>
          </div>
        </aside>
      )}

      {/* Mobile header */}
      {isMobile && (
        <>
          <header style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
            background: "#12131a", borderBottom: "1px solid #1e1e2a", padding: "12px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <img src="/logo-nav.png" alt="NERVÜR" style={{
              height: "26px", width: "auto",
              filter: "invert(1) brightness(1.15)", mixBlendMode: "screen", objectFit: "contain"
            }} />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: "none", border: "none", color: "#A1A1AA", fontSize: "18px", cursor: "pointer", padding: "4px" }}>
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </header>
          {mobileMenuOpen && (
            <div style={{
              position: "fixed", top: "50px", left: 0, right: 0, bottom: 0, zIndex: 49,
              background: "#12131a", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "2px",
              overflowY: "auto"
            }}>
              {navItems.map((item, idx) => renderNavItem(item, idx, true))}
              <button onClick={() => { logout(); navigate("/app/login"); }}
                style={{
                  marginTop: "auto", padding: "12px", background: "transparent",
                  border: "1px solid #27272A", borderRadius: "6px", color: "#71717A",
                  fontSize: "13px", cursor: "pointer", fontFamily: "inherit"
                }}>
                Se déconnecter
              </button>
            </div>
          )}
        </>
      )}

      {/* Main content */}
      <main style={{
        flex: 1, marginLeft: isMobile ? 0 : "230px", padding: isMobile ? "66px 20px 20px" : "36px 44px",
        minHeight: "100vh", position: "relative", zIndex: 1
      }}>
        <Outlet />
      </main>
    </div>
  );
}
