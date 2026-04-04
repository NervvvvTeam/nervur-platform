import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMemo, useState, useEffect } from "react";
import LogoNervur from "../../components/LogoNervur";
import VaultMiaChat from "./VaultMiaChat";

function useBreakpoint() {
  const getBreakpoint = () => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w < 768) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  };
  const [bp, setBp] = useState(getBreakpoint);
  useEffect(() => {
    const handler = () => setBp(getBreakpoint());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return bp;
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
  "/app/vault/generateur": (c) => I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, c),
  "/app/vault/historique": (c) => I(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, c),
  "/app/vault/veille": (c) => I(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>, c),
  "/app/atlas": (c) => I(<><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></>, c),
  "/app/atlas/history": (c) => I(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>, c),
  "/app/atlas/suggestions": (c) => I(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>, c),
  "/app/atlas/reports": (c) => I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, c),
  "/app/settings": (c) => I(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>, c),
};

// Tool color themes
const TOOL_COLORS = {
  sentinel: "#ef4444",
  nexus: "#10b981",
  forge: "#f59e0b",
  vault: "#06b6d4",
  atlas: "#f59e0b",
  general: "#6C5CE7",
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
  "/app/nexus": TOOL_COLORS.nexus,
  "/app/nexus/sequences": TOOL_COLORS.nexus,
  "/app/nexus/calendar": TOOL_COLORS.nexus,
  "/app/nexus/contacts": TOOL_COLORS.nexus,
  "/app/nexus/campaigns": TOOL_COLORS.nexus,
  "/app/forge": TOOL_COLORS.forge,
  "/app/forge/history": TOOL_COLORS.forge,
  "/app/vault": TOOL_COLORS.vault,
  "/app/vault/rgpd": TOOL_COLORS.vault,
  "/app/vault/generateur": TOOL_COLORS.vault,
  "/app/vault/historique": TOOL_COLORS.vault,
  "/app/vault/history": TOOL_COLORS.vault,
  "/app/vault/scan": TOOL_COLORS.vault,
  "/app/vault/monitoring": TOOL_COLORS.vault,
  "/app/vault/veille": TOOL_COLORS.vault,
  "/app/atlas": TOOL_COLORS.atlas,
  "/app/atlas/history": TOOL_COLORS.atlas,
  "/app/atlas/suggestions": TOOL_COLORS.atlas,
  "/app/atlas/reports": TOOL_COLORS.atlas,
  "/app/settings": "#64748B",
};

export default function Layout() {
  const { user, logout, hasAccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const activeTool = useMemo(() => {
    if (location.pathname.startsWith("/app/sentinel") || location.pathname.startsWith("/app/reviews") || location.pathname.startsWith("/app/analytics") || location.pathname.startsWith("/app/competitors") || location.pathname.startsWith("/app/reports") || location.pathname.startsWith("/app/qrcode") || location.pathname.startsWith("/app/widget") || location.pathname.startsWith("/app/alerts") || location.pathname === "/app/settings") return "sentinel";
    if (location.pathname.startsWith("/app/nexus")) return "nexus";
    if (location.pathname.startsWith("/app/vault")) return "vault";
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
    if (hasAccess("nexus")) {
      items.push({ path: "/app/nexus", label: "Nexus", toolKey: "nexus", color: TOOL_COLORS.nexus });
    }
    if (hasAccess("vault")) {
      items.push({ path: "/app/vault", label: "Vault", toolKey: "vault", color: TOOL_COLORS.vault });
    }
    // Paramètres est dans les onglets Sentinel
    return items;
  }, [hasAccess]);

  const renderNavItem = (item, idx, mobile = false) => {
    if (item.type === "separator") {
      return (
        <div key={`sep-${idx}`} className={`h-px bg-[#1e1e2a] ${mobile ? "mx-4 my-3" : "mx-2 my-3"}`} />
      );
    }
    const iconFn = NAV_ICONS[item.path];
    const toolColor = item.color || TOOL_COLORS.general;
    const isItemActive = item.toolKey === activeTool;

    const tablet = !mobile && isTablet;
    return (
      <NavLink key={item.path} to={item.path}
        onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
        title={tablet ? item.label : undefined}
        className={`flex items-center ${tablet ? "justify-center" : ""} gap-2.5 rounded-lg no-underline transition-all duration-200 ${
          mobile ? "px-4 py-2.5 text-sm" : tablet ? "px-1 py-2.5 text-[13px]" : "px-3 py-2 text-[13px]"
        } ${isItemActive ? "font-medium text-[#0F172A]" : "font-normal text-[#64748B]"}`}
        style={{
          background: isItemActive ? `${toolColor}12` : "transparent",
          borderLeft: isItemActive ? `3px solid ${toolColor}` : "3px solid transparent",
        }}
        onMouseEnter={e => {
          if (!isItemActive) {
            e.currentTarget.style.borderLeft = `3px solid ${toolColor}60`;
            e.currentTarget.style.background = `${toolColor}08`;
            e.currentTarget.style.color = "#0F172A";
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
            if (dot) dot.style.background = "#94A3B8";
            const icon = e.currentTarget.querySelector("[data-icon] svg");
            if (icon) icon.style.stroke = "#64748B";
          }
        }}>
        {!tablet && <span data-dot className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200"
          style={{ background: isItemActive ? toolColor : "#94A3B8" }} />}
        <span data-icon className="flex items-center transition-all duration-200">
          {iconFn ? iconFn(isItemActive ? toolColor : "#64748B") : null}
        </span>
        {!tablet && <span>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-700 font-['Inter',system-ui,sans-serif]">
      {/* Sidebar — desktop & tablet */}
      {!isMobile && (
        <aside className={`${isTablet ? "w-[64px]" : "w-[230px]"} border-r border-[#E2E8F0] ${isTablet ? "px-1.5" : "px-3"} py-6 flex flex-col fixed top-0 bottom-0 left-0 bg-white z-50 transition-[width] duration-200`}>
          {/* Branding */}
          <div className={`-mx-1 mb-7 border-b border-[#E2E8F0] ${isTablet ? "px-1 text-center" : "px-4"} pt-3 pb-3.5`}>
            {isTablet ? (
              <div className="font-bold text-[#0F172A] tracking-wider text-xs">N</div>
            ) : (
              <>
                <LogoNervur height={32} onClick={() => navigate("/app/portal")} />
                <div className="text-[11px] text-[#4F46E5] font-normal mt-0.5">Espace client</div>
              </>
            )}
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
            {navItems.map((item, idx) => renderNavItem(item, idx))}
          </nav>

          {/* User */}
          <div className={`border-t border-[#E2E8F0] pt-4 ${isTablet ? "px-0.5" : "px-2"}`}>
            <div className={`flex items-center ${isTablet ? "justify-center" : "gap-2.5"} mb-3`}>
              <div className={`${isTablet ? "w-7 h-7 text-[11px]" : "w-8 h-8 text-[13px]"} rounded-md bg-gradient-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center font-semibold text-white shrink-0`}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              {!isTablet && <div>
                <div className="text-[13px] text-[#334155] font-medium">{user?.name}</div>
                <div className="text-[11px] text-[#94A3B8]">{user?.email}</div>
              </div>}
            </div>
            <button onClick={() => { logout(); navigate("/app/login"); }}
              title={isTablet ? "Se déconnecter" : undefined}
              className={`w-full py-[7px] bg-transparent border border-[#E2E8F0] rounded-md text-[#64748B] text-xs cursor-pointer font-[inherit] transition-all duration-150 hover:border-[#CBD5E1] hover:text-[#64748B] ${isTablet ? "px-1" : ""}`}>
              {isTablet ? "\u2190" : "Se déconnecter"}
            </button>
          </div>
        </aside>
      )}

      {/* Mobile header */}
      {isMobile && (
        <>
          <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-2.5 flex justify-between items-center">
            <LogoNervur height={28} onClick={() => navigate("/app/portal")} />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-transparent border-none text-[#64748B] text-xl cursor-pointer p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors duration-150">
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </header>
          {mobileMenuOpen && (
            <>
            <div className="fixed inset-0 z-[48] bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed top-[48px] left-0 right-0 bottom-0 z-[49] bg-white/98 backdrop-blur-md px-4 py-3 flex flex-col gap-0.5 overflow-y-auto">
              {navItems.map((item, idx) => renderNavItem(item, idx, true))}
              <button onClick={() => { logout(); navigate("/app/login"); }}
                className="mt-auto p-3 bg-transparent border border-[#E2E8F0] rounded-md text-[#64748B] text-[13px] cursor-pointer font-[inherit]">
                Se déconnecter
              </button>
            </div>
            </>
          )}
        </>
      )}

      {/* Main content */}
      <main className={`flex-1 min-h-screen relative z-[1] ${isMobile ? "ml-0 pt-[60px] px-4 pb-5" : isTablet ? "ml-[64px] px-5 py-6" : "ml-[230px] px-11 py-9"}`}
        style={{
          background: `radial-gradient(ellipse 80% 50% at 70% 0%, ${(PATH_COLORS[location.pathname] || TOOL_COLORS.general)}10 0%, transparent 70%)`,
        }}>
        <Outlet />
      </main>

      {/* NOÉ chat — available on all Vault pages */}
      {location.pathname.startsWith("/app/vault") && <VaultMiaChat />}
    </div>
  );
}
