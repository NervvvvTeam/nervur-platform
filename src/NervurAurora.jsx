import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import useJsonLd from "./useJsonLd";
import useFadeOnScroll from "./useFadeOnScroll";

// ─── NERVÜR AURORA ───
// Dark theme + 3-accent palette (Indigo, Green, Pink)
// Clean typography + Ghost text hovers + Bento grid + Codenames

const V = "#FFFFFF";   // Primary white
const V2 = "#D4D4D8";  // Mid grey
const V3 = "#A1A1AA";  // Soft grey
const VG = (a) => `rgba(255,255,255,${a})`;

// ─── ACCENT PALETTE ───
const A1 = "#818CF8";  // Indigo — primary accent
const A2 = "#4ADE80";  // Green — secondary accent
const A3 = "#F472B6";  // Pink — tertiary accent
const GRAD = `linear-gradient(135deg, ${A1}, ${A3}, ${A2})`;
const AG = (a = 1) => `linear-gradient(135deg, rgba(129,140,248,${a}), rgba(244,114,182,${a}), rgba(74,222,128,${a}))`;

const WORDS = ["structures", "systèmes", "marques", "résultats", "excellences"];

// ═══ CLEAN TEXT (pro — no glitch) ═══
const GlitchText = ({ children }) => (
  <span style={{ position: "relative", display: "inline-block" }}>{children}</span>
);

// ═══ ROTATING WORD ═══
const RotatingWord = () => {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % WORDS.length);
        setAnimating(false);
      }, 400);
    }, 2600);
    return () => clearInterval(interval);
  }, []);
  return (
    <span aria-live="polite" aria-atomic="true" style={{
      display: "inline-block", position: "relative", overflow: "hidden",
      verticalAlign: "bottom", height: "1.15em", minWidth: "280px" }}>
      <span style={{
        display: "inline-block",
        transition: "all 0.4s cubic-bezier(0.65, 0, 0.35, 1)",
        transform: animating ? "translateY(-110%)" : "translateY(0)",
        opacity: animating ? 0 : 1,
        background: `linear-gradient(135deg, ${A1}, ${A3})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text" }}>
        {WORDS[index]}
      </span>
    </span>
  );
};

// ═══ TEXT REVEAL (KINETIC TYPOGRAPHY) ═══
const TextReveal = ({ children, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisible(true);
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ overflow: "hidden" }}>
      <div style={{
        transform: visible ? "translateY(0)" : "translateY(110%)",
        transition: `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}>
        {children}
      </div>
    </div>
  );
};

// ═══ MAGNETIC BUTTON ═══
const MagneticButton = ({ children, className, style, onClick, onMouseEnter: onEnter, onMouseLeave: onLeave }) => {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  };
  const handleMouseLeave = (e) => {
    ref.current.style.transform = 'translate(0, 0)';
    onLeave?.(e);
  };
  return (
    <span ref={ref} className={className} style={{ ...style, transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, background 0.3s ease, color 0.3s ease, border-color 0.3s ease" }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onMouseEnter={onEnter} onClick={onClick}>
      {children}
    </span>
  );
};

// ═══ ANIMATED COUNTER ═══
const AnimatedCounter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(start);
        }, 35);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
};

// ═══ OSCILLATING VALUE (for live dashboard feel) ═══
const useOscillate = (base, range, intervalMs = 2500) => {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const timer = setInterval(() => {
      const offset = (Math.random() - 0.5) * 2 * range;
      setVal(Math.round((base + offset) * 10) / 10);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [base, range, intervalMs]);
  return val;
};

// ═══ REVEAL SECTION ═══
const RevealSection = ({ children, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisible(true);
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(50px)" }}>
      {children}
    </div>
  );
};

// ═══ GHOST TEXT CARD ═══
const GhostCard = ({ children, ghostText, style, className = "", onMouseEnter: onEnter, onMouseLeave: onLeave, ...rest }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`hover-card hover-glow ${className}`}
      onMouseEnter={(e) => { setHovered(true); onEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); onLeave?.(e); }}
      style={{ ...style, position: "relative", overflow: "hidden" }}
      {...rest}
    >
      <span style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${hovered ? 1 : 0.8})`,
        fontSize: "clamp(60px, 8vw, 120px)", fontWeight: 900,
        color: "transparent",
        WebkitTextStroke: `1px ${VG(hovered ? 0.06 : 0)}`,
        whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: hovered ? 1 : 0,
        letterSpacing: "-4px" }}>
        {ghostText}
      </span>
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};


// ═══ MOBILE HOOK ═══
const useIsMobile = (bp = 768) => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
};

// ═══ CHROME ICON (metallic SVG) ═══
const ChromeIcon = ({ type, size = 40 }) => {
  const gradId = `chrome-grad-${type}`;
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="9" height="9" rx="1" fill={`url(#${gradId})`} />
        <rect x="14" y="3" width="9" height="9" rx="1" fill={`url(#${gradId})`} />
        <rect x="3" y="14" width="9" height="9" rx="1" fill={`url(#${gradId})`} />
        <rect x="14" y="14" width="9" height="9" rx="1" fill={`url(#${gradId})`} />
      </>
    ),
    browser: (
      <>
        <rect x="2" y="2" width="22" height="22" rx="3" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" />
        <line x1="2" y1="8" x2="24" y2="8" stroke={`url(#${gradId})`} strokeWidth="1.5" />
        <circle cx="5.5" cy="5" r="1" fill={`url(#${gradId})`} />
        <circle cx="8.5" cy="5" r="1" fill={`url(#${gradId})`} />
        <circle cx="11.5" cy="5" r="1" fill={`url(#${gradId})`} />
      </>
    ),
    gauge: (
      <>
        <path d="M4 18 A9 9 0 1 1 22 18" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="13" y1="17" x2="17" y2="10" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="13" cy="17" r="2" fill={`url(#${gradId})`} />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="40%" stopColor="#a0a0a0" />
          <stop offset="70%" stopColor="#d0d0d0" />
          <stop offset="100%" stopColor="#909090" />
        </linearGradient>
      </defs>
      {paths[type]}
    </svg>
  );
};

// ═══ CHROME BUTTON ═══
const ChromeButton = ({ children, onClick }) => (
  <button className="chrome-btn" onClick={onClick}>
    {children}
  </button>
);

// ═══ PRODUCT ICON (interactive, changes on tag hover) ═══
const ProductIcon = ({ activeTag, size = 40 }) => {
  const gradId = "chrome-grad-product";
  const icons = {
    Dashboards: (
      <g key="dash">
        <rect x="3" y="3" width="9" height="9" rx="1.5" fill={`url(#${gradId})`} />
        <rect x="14" y="3" width="9" height="9" rx="1.5" fill={`url(#${gradId})`} />
        <rect x="3" y="14" width="9" height="9" rx="1.5" fill={`url(#${gradId})`} />
        <rect x="14" y="14" width="9" height="9" rx="1.5" fill={`url(#${gradId})`} />
      </g>
    ),
    CRM: (
      <g key="crm">
        <circle cx="10" cy="8" r="4" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" />
        <path d="M3 22c0-4 3.5-7 7-7s7 3 7 7" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="19" cy="10" r="3" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.3" />
        <path d="M19 13c2.5 0 5 2 5 5" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.3" strokeLinecap="round" />
      </g>
    ),
    Configurateurs: (
      <g key="config">
        <circle cx="13" cy="13" r="4" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
          const r = 8, cx = 13, cy = 13;
          const x = cx + r * Math.cos(a * Math.PI / 180);
          const y = cy + r * Math.sin(a * Math.PI / 180);
          return <circle key={a} cx={x} cy={y} r="1.5" fill={`url(#${gradId})`} />;
        })}
      </g>
    ),
    Plateformes: (
      <g key="cloud">
        <path d="M7 18h12a5 5 0 0 0 1-9.9A6 6 0 0 0 8 9a5 5 0 0 0-1 9" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="10" y1="18" x2="10" y2="22" stroke={`url(#${gradId})`} strokeWidth="1.3" strokeLinecap="round" />
        <line x1="16" y1="18" x2="16" y2="21" stroke={`url(#${gradId})`} strokeWidth="1.3" strokeLinecap="round" />
        <line x1="13" y1="18" x2="13" y2="23" stroke={`url(#${gradId})`} strokeWidth="1.3" strokeLinecap="round" />
      </g>
    ),
  };
  const current = icons[activeTag] || icons.Dashboards;
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true" style={{ transition: "transform 0.3s ease" }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="40%" stopColor="#a0a0a0" />
          <stop offset="70%" stopColor="#d0d0d0" />
          <stop offset="100%" stopColor="#909090" />
        </linearGradient>
      </defs>
      <g style={{ animation: "iconSwap 0.3s ease forwards" }} key={activeTag || "default"}>
        {current}
      </g>
    </svg>
  );
};

// ═══ DASHBOARD PREVIEW (glassmorphism mini-UI) ═══
const DashboardPreview = () => {
  const bars = [
    { h: 32, delay: "0s" },
    { h: 48, delay: "0.3s" },
    { h: 28, delay: "0.6s" },
    { h: 56, delay: "0.9s" },
    { h: 40, delay: "1.2s" },
  ];
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "12px", padding: "16px", backdropFilter: "blur(12px)",
      minWidth: "200px", maxWidth: "280px", width: "100%",
    }}>
      {/* macOS dots */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>NERVÜR DASH</span>
      </div>
      {/* Mini metrics row */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["+24%", "1.2k", "98%"].map((v, i) => (
          <div key={i} style={{
            flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "6px",
            padding: "8px 6px", textAlign: "center",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#e4e4e7" }}>{v}</div>
            <div style={{ fontSize: "7px", color: "rgba(255,255,255,0.2)", marginTop: "2px", letterSpacing: "0.5px" }}>
              {["CROISSANCE", "UTILISATEURS", "UPTIME"][i]}
            </div>
          </div>
        ))}
      </div>
      {/* Bar chart */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: "6px", height: "64px",
        padding: "0 4px", borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        {bars.map((b, i) => (
          <div key={i} style={{
            flex: 1, height: `${b.h}px`, borderRadius: "3px 3px 0 0",
            background: `linear-gradient(180deg, rgba(129,140,248,0.3) 0%, rgba(74,222,128,0.08) 100%)`,
            transformOrigin: "bottom", animation: `floatBar 3s ease-in-out ${b.delay} infinite`,
          }} />
        ))}
      </div>
      {/* Bottom status */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.15)", letterSpacing: "1px" }}>LIVE DATA</span>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#28c840", animation: "pulseGlow 2s ease infinite" }} />
      </div>
    </div>
  );
};

// ═══ MAIN COMPONENT ═══
export default function NervurAurora() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredService, setHoveredService] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [mobileAppsOpen, setMobileAppsOpen] = useState(false);
  const glowRef = useRef(null);
  const pageRef = useRef(null);
  useFadeOnScroll(pageRef);

  useSEO(
    "NERVÜR — Outils SaaS pour PME | E-réputation, Audit Web, Cybersécurité",
    "NERVÜR propose des outils SaaS innovants pour les PME : Sentinel (e-réputation), Phantom (audit web), Vault (cybersécurité), Atlas (SEO), Pulse (monitoring). À partir de 19€/mois.",
    {
      path: "/",
      keywords: "SaaS PME, e-réputation, audit web, cybersécurité, SEO, monitoring, outils PME, NERVÜR, Sentinel, Phantom, Vault, Atlas, Pulse",
      imageAlt: "NERVÜR — 5 outils SaaS pour PME : e-réputation, audit web, cybersécurité, SEO, monitoring",
    }
  );

  // Organization structured data
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NERVÜR",
    "url": "https://nervur.fr",
    "logo": "https://nervur.fr/logo-nav-clean.png",
    "image": "https://nervur.fr/og-image.png",
    "description": "Éditeur de technologies de croissance pour les PME. 5 outils SaaS : e-réputation, audit web, cybersécurité, SEO et monitoring.",
    "foundingDate": "2024",
    "areaServed": {
      "@type": "Country",
      "name": "France"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "contact@nervurpro.fr",
      "url": "https://nervur.fr/contact",
      "availableLanguage": "French"
    },
    "sameAs": [],
    "knowsAbout": ["E-réputation", "Audit web", "Cybersécurité", "SEO", "Monitoring", "SaaS pour PME"]
  });

  // WebSite structured data with SearchAction
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NERVÜR",
    "url": "https://nervur.fr",
    "description": "Outils SaaS pour PME : e-réputation, audit web, cybersécurité, SEO et monitoring",
    "inLanguage": "fr",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nervur.fr/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  });

  // SoftwareApplication structured data — Sentinel
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NERVÜR Sentinel",
    "description": "Outil de surveillance et gestion de l'e-réputation pour les PME. Monitoring des avis, alertes en temps réel.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://nervur.fr/sentinel",
    "offers": { "@type": "Offer", "price": "29", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31" }
  });

  // SoftwareApplication structured data — Phantom
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NERVÜR Phantom",
    "description": "Audit de performance et accessibilité de sites web. Scores Lighthouse, Core Web Vitals, recommandations SEO.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://nervur.fr/phantom",
    "offers": { "@type": "Offer", "price": "19", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31" }
  });

  // SoftwareApplication structured data — Vault
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NERVÜR Vault",
    "description": "Surveillance cybersécurité pour PME. Détection de fuites de données, monitoring du dark web, alertes de sécurité.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://nervur.fr/vault",
    "offers": { "@type": "Offer", "price": "39", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31" }
  });

  // SoftwareApplication structured data — Atlas
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NERVÜR Atlas",
    "description": "Outil SEO pour PME. Audit de référencement, suivi de positions, analyse de mots-clés et recommandations.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://nervur.fr/atlas",
    "offers": { "@type": "Offer", "price": "29", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31" }
  });

  // SoftwareApplication structured data — Pulse
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NERVÜR Pulse",
    "description": "Monitoring de disponibilité et performance pour sites web et API. Alertes temps réel, rapports de uptime.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://nervur.fr/pulse",
    "offers": { "@type": "Offer", "price": "19", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31" }
  });

  // Oscillating hero values
  const perfScore = useOscillate(98, 2, 3000);
  const convRate = useOscillate(4.8, 0.4, 2800);
  const trafficGrowth = useOscillate(147, 12, 3200);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 200);
  }, []);

  // Back to top visibility
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mouse glow trail
  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
      glowRef.current.style.opacity = '1';
    }
  };
  const handleMouseLeave = () => {
    if (glowRef.current) glowRef.current.style.opacity = '0';
  };

  return (
    <div ref={pageRef} style={{
      background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      minHeight: "100vh", position: "relative", overflowX: "hidden" }}>

      {/* Mouse glow removed */}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marqueeReverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        @keyframes scanDown {
          0% { top: -2px; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes terminalBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes floatBar {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.3); }
        }
        @keyframes iconSwap {
          from { opacity: 0; transform: scale(0.7) rotate(-8deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(255,255,255,0); }
          50% { box-shadow: 0 0 12px rgba(255,255,255,0.08); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(-100%); }
        }
        .hover-card { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .hover-card:hover { transform: translateY(-8px); border-color: rgba(129,140,248,0.35) !important; box-shadow: 0 20px 60px rgba(129,140,248,0.08); }
        .escriba-card { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .escriba-card:hover { border-color: ${VG(0.25)} !important; box-shadow: 0 12px 40px ${VG(0.1)}; }
        .escriba-card:hover .escriba-img { transform: scale(1.05); opacity: 1 !important; }
        .hover-glow:hover { box-shadow: 0 0 30px rgba(129,140,248,0.12), inset 0 0 30px rgba(129,140,248,0.04); }
        .cta-btn { transition: all 0.3s ease; position: relative; overflow: hidden; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px ${VG(0.3)}; }
        .cta-btn::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%); transition: transform 0.6s; transform: translateX(-100%); }
        .cta-btn:hover::after { transform: translateX(100%); }
        .nav-link { position: relative; }
        .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px; background: linear-gradient(90deg, ${A1}, ${A3}); transition: width 0.3s ease; }
        .nav-link:hover::after { width: 100%; }
        .step-card { transition: all 0.4s ease; cursor: pointer; }
        .step-card:hover, .step-active { background: ${VG(0.05)} !important; border-color: ${VG(0.3)} !important; }
        .bento-card { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .bento-card:hover { transform: translateY(-6px) scale(1.01); border-color: rgba(129,140,248,0.35) !important; box-shadow: 0 24px 80px rgba(129,140,248,0.08); }
        .chrome-btn {
          position: relative; overflow: hidden; cursor: pointer;
          background: linear-gradient(135deg, #e8e8e8 0%, #b0b0b0 40%, #d6d6d6 60%, #a0a0a0 100%);
          color: #18181b; font-weight: 700; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
          padding: 12px 28px; border: none; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, box-shadow;
          backface-visibility: hidden;
          -webkit-font-smoothing: subpixel-antialiased;
        }
        .chrome-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #f0f0f0 0%, #c0c0c0 40%, #e0e0e0 60%, #b0b0b0 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.4);
        }
        .chrome-btn::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s ease;
        }
        .chrome-btn:hover::before { left: 100%; }
        .chrome-btn::after {
          content: ''; position: absolute; inset: -2px; z-index: -1; border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,120,200,0.3), rgba(120,200,255,0.3), rgba(200,255,120,0.3));
          filter: blur(6px); opacity: 0;
          transition: opacity 0.4s ease;
        }
        .chrome-btn:hover::after { opacity: 1; }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav aria-label="Navigation principale" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "#09090B", backdropFilter: "blur(20px)", borderBottom: `1px solid ${VG(0.1)}`,
        transition: "all 0.6s ease",
        opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(-20px)" }}>
        <img src="/logo-nav.png" alt="NERVÜR — Outils SaaS pour PME" style={{
          height: isMobile ? "40px" : "95px", width: "auto",
          filter: "invert(1) brightness(1.15)",
          mixBlendMode: "screen",
          objectFit: "contain" }} />
        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "36px", alignItems: "center" }}>
            {[
              { label: "Approche", id: "approche" },
              { label: "Services", id: "services" },
              { label: "Outils", id: "outils" },
              { label: "Projets", id: "projets" },
            ].map((item, i) => (
              <span key={i} className="nav-link" style={{ fontSize: "12px", letterSpacing: "2.5px", textTransform: "uppercase", color: "#71717A", cursor: "pointer", transition: "color 0.3s" }}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                onMouseEnter={e => { e.target.style.color = "#FAFAFA"; }}
                onMouseLeave={e => { e.target.style.color = "#71717A"; }}>
                {item.label}
              </span>
            ))}
            {/* Blog nav link */}
            <span className="nav-link" style={{ fontSize: "12px", letterSpacing: "2.5px", textTransform: "uppercase", color: "#71717A", cursor: "pointer", transition: "color 0.3s" }}
              onClick={() => navigate('/blog/e-reputation')}
              onMouseEnter={e => { e.target.style.color = "#FAFAFA"; }}
              onMouseLeave={e => { e.target.style.color = "#71717A"; }}>
              Blog
            </span>
            {/* Dropdown Apps — hover */}
            <div style={{ position: "relative" }}
              onMouseEnter={() => setAppsOpen(true)}
              onMouseLeave={() => setAppsOpen(false)}>
              <span aria-haspopup="true" aria-expanded={appsOpen} style={{ fontSize: "12px", letterSpacing: "2.5px", textTransform: "uppercase", color: appsOpen ? "#FAFAFA" : "#71717A", cursor: "pointer", transition: "color 0.3s", display: "flex", alignItems: "center", gap: "5px" }}>
                Apps
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true" style={{ transition: "transform 0.3s", transform: appsOpen ? "rotate(180deg)" : "rotate(0)" }}>
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {/* Invisible bridge — fills the gap so mouse never leaves the hover zone */}
              <div style={{ position: "absolute", top: "100%", left: "-20px", right: "-20px", height: "16px" }} />
              <div style={{
                position: "absolute", top: "calc(100% + 16px)", left: "50%", transform: "translateX(-50%)",
                background: "rgba(24,24,27,0.95)", backdropFilter: "blur(20px)", border: `1px solid ${VG(0.12)}`,
                borderRadius: "12px", padding: "8px", minWidth: "260px",
                opacity: appsOpen ? 1 : 0, pointerEvents: appsOpen ? "auto" : "none",
                transition: "opacity 0.25s ease, transform 0.25s ease",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
              }}>
                {[
                  { label: "Simulateur ROI", desc: "Calculez votre ROI digital", path: "/simulateur" },
                  { label: "Diagnostic Digital", desc: "Évaluez votre maturité digitale", path: "/diagnostic" },
                ].map((app, i) => (
                  <div key={i} onClick={() => { navigate(app.path); setAppsOpen(false); }}
                    style={{
                      padding: "12px 16px", borderRadius: "8px", cursor: "pointer",
                      transition: "background 0.2s",
                      display: "flex", alignItems: "center", gap: "12px"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = VG(0.08); }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: V, letterSpacing: "0.5px" }}>{app.label}</div>
                      <div style={{ fontSize: "11px", color: V3, marginTop: "2px" }}>{app.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Bouton Espace Client */}
            <a href="/app/login" style={{
              padding: "8px 20px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
              fontWeight: 700, color: "#09090B", background: "#FAFAFA", border: "none", borderRadius: "6px",
              cursor: "pointer", textDecoration: "none", transition: "all 0.3s",
              fontFamily: "inherit", marginLeft: "12px"
            }}
              onMouseEnter={e => { e.target.style.background = A1; e.target.style.boxShadow = "0 4px 20px rgba(129,140,248,0.3)"; }}
              onMouseLeave={e => { e.target.style.background = "#FAFAFA"; e.target.style.boxShadow = "none"; }}>
              Espace Client
            </a>
          </div>
        )}
        {/* Mobile burger */}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOpen} style={{ cursor: "pointer", padding: "8px", display: "flex", flexDirection: "column", gap: "5px", zIndex: 110, background: "none", border: "none" }}>
            <span style={{ width: "24px", height: "2px", background: V, transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ width: "24px", height: "2px", background: V, transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ width: "24px", height: "2px", background: V, transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        )}
      </nav>
      {/* Mobile menu overlay */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
          background: "#09090B", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none",
          transform: menuOpen ? "translateY(0)" : "translateY(-20px)" }}>
          {[
            { label: "Accueil", action: () => { window.scrollTo({ top: 0, behavior: "smooth" }); setMenuOpen(false); } },
            { label: "Services", action: () => { document.getElementById('services')?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); } },
            // Tarifs retiré du menu mobile
            { label: "Projets", action: () => { document.getElementById('projets')?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); } },
            { label: "Approche", action: () => { document.getElementById('approche')?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); } },
            { label: "Blog", action: () => { navigate('/blog/e-reputation'); setMenuOpen(false); } },
          ].map((item, i) => (
            <span key={i} onClick={item.action} style={{
              fontSize: "18px", letterSpacing: "4px", textTransform: "uppercase", color: V, cursor: "pointer",
              fontWeight: 600, transition: "opacity 0.3s", padding: "8px 0" }}>
              {item.label}
            </span>
          ))}
          {/* Mobile Apps dropdown */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span onClick={() => setMobileAppsOpen(!mobileAppsOpen)} aria-haspopup="true" aria-expanded={mobileAppsOpen} style={{
              fontSize: "18px", letterSpacing: "4px", textTransform: "uppercase", color: V, cursor: "pointer",
              fontWeight: 600, padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              Apps
              <svg width="12" height="7" viewBox="0 0 10 6" fill="none" aria-hidden="true" style={{ transition: "transform 0.3s", transform: mobileAppsOpen ? "rotate(180deg)" : "rotate(0)" }}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div style={{
              overflow: "hidden", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              maxHeight: mobileAppsOpen ? "200px" : "0", opacity: mobileAppsOpen ? 1 : 0,
              display: "flex", flexDirection: "column", gap: "12px", marginTop: mobileAppsOpen ? "8px" : "0"
            }}>
              <span onClick={() => { navigate('/simulateur'); setMenuOpen(false); setMobileAppsOpen(false); }} style={{
                fontSize: "14px", letterSpacing: "2px", color: V3, cursor: "pointer", padding: "6px 0",
                transition: "color 0.3s", textAlign: "center" }}
                onTouchStart={e => { e.currentTarget.style.color = V; }}
                onTouchEnd={e => { e.currentTarget.style.color = V3; }}>
                Simulateur ROI
              </span>
              <span onClick={() => { navigate('/diagnostic'); setMenuOpen(false); setMobileAppsOpen(false); }} style={{
                fontSize: "14px", letterSpacing: "2px", color: V3, cursor: "pointer", padding: "6px 0",
                transition: "color 0.3s", textAlign: "center" }}
                onTouchStart={e => { e.currentTarget.style.color = V; }}
                onTouchEnd={e => { e.currentTarget.style.color = V3; }}>
                Diagnostic Digital
              </span>
            </div>
          </div>
          {/* Bouton Espace Client mobile */}
          <a href="/app/login" onClick={() => setMenuOpen(false)} style={{
            padding: "12px 32px", fontSize: "13px", letterSpacing: "3px", textTransform: "uppercase",
            fontWeight: 700, color: "#09090B", background: "#FAFAFA", border: "none", borderRadius: "8px",
            cursor: "pointer", textDecoration: "none", transition: "all 0.3s",
            fontFamily: "inherit", marginTop: "16px"
          }}>
            Espace Client
          </a>
        </div>
      )}

      <main>
      {/* ═══ HERO ═══ */}
      <section aria-label="Accueil" style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: isMobile ? "0 20px" : "0 48px", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "0" : "60px", alignItems: "center", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>

          {/* Left — Text */}
          <div style={{ position: "relative", zIndex: 5 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "6px 16px",
              marginBottom: "32px", animation: loaded ? "fadeInUp 0.6s ease 0.2s both" : "none" }}>
              <span style={{ width: "6px", height: "6px", background: V, borderRadius: "50%" }} />
              <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V }}>
                Éditeur de Technologies de Croissance
              </span>
            </div>
            <div style={{ marginBottom: "28px", animation: loaded ? "fadeInUp 0.8s ease 0.4s both" : "none" }}>
              <TextReveal>
                <h1 style={{ fontSize: "clamp(38px, 5.5vw, 74px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2.5px" }}>
                  <GlitchText active={loaded}>On bâtit des</GlitchText>
                </h1>
              </TextReveal>
              <TextReveal delay={200}>
                <span role="text" style={{ display: "block", fontSize: "clamp(38px, 5.5vw, 74px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2.5px" }}>
                  <RotatingWord />
                </span>
              </TextReveal>
            </div>
            <p style={{
              fontSize: "17px", lineHeight: 1.8, color: "#71717A", maxWidth: "520px",
              marginBottom: "44px",
              animation: loaded ? "fadeInUp 0.8s ease 0.6s both" : "none" }}>
              NERVÜR conçoit les stratégies digitales qui rendent votre entreprise pérenne grâce à internet. Deux fondateurs. Zéro compromis.
            </p>
            <div style={{
              display: "flex", gap: "16px", flexDirection: isMobile ? "column" : "row",
              animation: loaded ? "fadeInUp 0.8s ease 0.8s both" : "none" }}>
              <MagneticButton className="cta-btn"                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
                padding: isMobile ? "14px 24px" : "16px 36px", border: "none",
                background: `linear-gradient(135deg, ${A1}, ${A3})`,
                color: "#09090B", fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", cursor: "pointer" }}>
                Nos services
              </MagneticButton>
              <MagneticButton className="cta-btn"                onClick={() => navigate('/contact')} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
                padding: isMobile ? "14px 24px" : "16px 36px", border: `1px solid rgba(129,140,248,0.4)`,
                color: V, fontSize: "13px", fontWeight: 600, letterSpacing: "1.5px",
                textTransform: "uppercase", cursor: "pointer", background: "transparent" }}>
                Nous contacter
              </MagneticButton>
            </div>
          </div>

          {/* Right — Visual showcase (inspired by Clay, Digital Silk, Active Theory) */}
          <div style={{ position: "relative", height: "560px", paddingTop: "20px", animation: loaded ? "fadeInUp 1s ease 0.6s both" : "none", display: isMobile ? "none" : "block" }}>

            {/* Ambient glow behind mockup */}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: "400px", height: "400px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(129,140,248,0.06) 0%, rgba(244,114,182,0.02) 40%, transparent 70%)",
              filter: "blur(60px)" }} />

            {/* Main browser mockup — tilted in perspective */}
            <div style={{
              position: "absolute", top: "50px", left: "20px", right: "20px",
              transform: "perspective(1200px) rotateY(-8deg) rotateX(2deg)",
              border: `1px solid ${VG(0.12)}`, borderRadius: "8px",
              background: "rgba(24,24,27,0.8)", backdropFilter: "blur(20px)",
              overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              animation: loaded ? "floatUp 8s ease-in-out infinite" : "none" }}>
              {/* Browser bar */}
              <div style={{ padding: "10px 16px", borderBottom: `1px solid ${VG(0.08)}`, display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF5F57" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FEBC2E" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#28C840" }} />
                <div style={{ flex: 1, marginLeft: "12px", height: "22px", borderRadius: "4px", background: VG(0.06), display: "flex", alignItems: "center", paddingLeft: "10px" }}>
                  <span style={{ fontSize: "9px", color: "#52525B" }}>nervur.com/client-project</span>
                </div>
              </div>
              {/* Fake website content */}
              <div style={{ padding: "24px", minHeight: "220px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ width: "80px", height: "10px", borderRadius: "3px", background: VG(0.15) }} />
                  <div style={{ display: "flex", gap: "12px" }}>
                    {[50, 40, 60].map((w, i) => <div key={i} style={{ width: `${w}px`, height: "8px", borderRadius: "3px", background: VG(0.08) }} />)}
                  </div>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ width: "70%", height: "18px", borderRadius: "3px", background: VG(0.12), marginBottom: "8px" }} />
                  <div style={{ width: "45%", height: "18px", borderRadius: "3px", background: VG(0.08) }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "20px" }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height: "80px", borderRadius: "6px", background: `linear-gradient(135deg, ${VG(0.06)}, ${VG(0.12)})`, border: `1px solid ${VG(0.06)}` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating card 1 — Performance Score */}
            <div style={{
              position: "absolute", bottom: "80px", left: "-20px", zIndex: 10,
              padding: "20px 24px", borderRadius: "10px",
              border: `1px solid ${VG(0.15)}`,
              background: "rgba(24,24,27,0.85)", backdropFilter: "blur(24px)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              animation: loaded ? "floatUp 6s ease-in-out 0.3s infinite" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: `2px solid ${VG(0.2)}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <svg width="44" height="44" aria-hidden="true" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                    <circle cx="22" cy="22" r="18" fill="none" stroke={VG(0.1)} strokeWidth="2.5" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#4ADE80" strokeWidth="2.5"
                      strokeDasharray={`${2 * Math.PI * 18 * (perfScore / 100)} ${2 * Math.PI * 18}`} strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 0.8s ease" }} />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: V, transition: "all 0.5s" }}>{Math.round(perfScore)}</span>
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: V }}>Performance</div>
                  <div style={{ fontSize: "10px", color: "#4ADE80" }}>Core Web Vitals ✓</div>
                </div>
              </div>
            </div>

            {/* Floating card 2 — Growth metric */}
            <div style={{
              position: "absolute", top: "60px", right: "-10px", zIndex: 10,
              padding: "16px 20px", borderRadius: "10px",
              border: `1px solid ${VG(0.15)}`,
              background: "rgba(24,24,27,0.85)", backdropFilter: "blur(24px)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
              animation: loaded ? "floatUp 7s ease-in-out 0.8s infinite" : "none" }}>
              <span style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: V3, display: "block", marginBottom: "6px" }}>Trafic organique</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: A3, transition: "all 0.6s" }}>+{Math.round(trafficGrowth)}%</span>
                <span style={{ fontSize: "10px", color: "#4ADE80" }}>↑</span>
              </div>
              <div style={{ display: "flex", alignItems: "end", gap: "2px", height: "28px", marginTop: "8px" }}>
                {[25, 40, 35, 50, 45, 65, 60, 80, 70, 95].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: i > 6 ? "rgba(244,114,182,0.5)" : VG(0.2), borderRadius: "1px 1px 0 0" }} />
                ))}
              </div>
            </div>

            {/* Floating card 3 — Conversions */}
            <div style={{
              position: "absolute", bottom: "20px", right: "10px", zIndex: 10,
              padding: "16px 20px", borderRadius: "10px",
              border: `1px solid ${VG(0.15)}`,
              background: "rgba(24,24,27,0.85)", backdropFilter: "blur(24px)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
              animation: loaded ? "floatUp 5s ease-in-out 1.2s infinite" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: A1 }} />
                <span style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: V3 }}>Conversion</span>
              </div>
              <span style={{ fontSize: "22px", fontWeight: 800, color: A1, transition: "all 0.6s" }}>{convRate.toFixed(1)}%</span>
              <div style={{ marginTop: "6px", height: "3px", background: VG(0.1), borderRadius: "2px", width: "100px", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, convRate * 15)}%`, height: "100%", background: `linear-gradient(90deg, rgba(129,140,248,0.4), ${A1})`, borderRadius: "2px", transition: "width 0.8s ease" }} />
              </div>
            </div>

          </div>

        </div>

        <div style={{
          position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
          animation: loaded ? "fadeInUp 1s ease 1.2s both" : "none" }}>
          <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#52525B" }}>Scroll</span>
          <div style={{ width: "1px", height: "40px", background: `linear-gradient(180deg, ${V2}, transparent)` }} />
        </div>
      </section>

      {/* ═══ SERVICES & OFFRES — TABBED ═══ */}
      <section id="services" aria-label="Nos services" className="fade-section" style={{ padding: isMobile ? "60px 20px" : "120px 48px", borderTop: `1px solid ${VG(0.1)}` }}>
        <RevealSection>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: V2, display: "block", marginBottom: "16px" }}>
              // Nos services
            </span>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
              Nos <span style={{ background: `linear-gradient(135deg, ${A1}, ${A3})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>services</span>.
            </h2>
          </div>
        </RevealSection>

        {/* Tab Navigation */}
        <div id="offres" style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "64px" }}>
          {["Développement", "SEO & Marketing"].map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              padding: "12px 32px", fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", cursor: "pointer", border: `1px solid ${activeTab === i ? A1 : VG(0.15)}`,
              background: activeTab === i ? A1 : "transparent",
              color: activeTab === i ? "#09090B" : "#71717A",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
              onMouseEnter={e => { if (activeTab !== i) { e.currentTarget.style.borderColor = VG(0.4); e.currentTarget.style.color = V; } }}
              onMouseLeave={e => { if (activeTab !== i) { e.currentTarget.style.borderColor = VG(0.15); e.currentTarget.style.color = "#71717A"; } }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ position: "relative", minHeight: "400px" }}>

          {/* TAB 0 — Développement */}
          <div style={{
            opacity: activeTab === 0 ? 1 : 0,
            transform: activeTab === 0 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: activeTab === 0 ? "auto" : "none",
            position: activeTab === 0 ? "relative" : "absolute", top: 0, left: 0, right: 0 }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1100px", margin: "0 auto" }}>
              {/* Row 1 — 50/50: Applications & Site Vitrine */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>

                {/* Carte 1 — Applications & Outils Métiers */}
                <div style={{
                  padding: isMobile ? "32px 24px" : "48px 40px",
                  border: `1px solid ${VG(0.15)}`, background: "rgba(24,24,27,0.4)",
                  position: "relative", overflow: "hidden",
                  display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "24px" : "32px", alignItems: "flex-start",
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.35); e.currentTarget.style.background = "rgba(24,24,27,0.6)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.15); e.currentTarget.style.background = "rgba(24,24,27,0.4)"; setHoveredProduct(null); }}>
                  <div style={{
                    position: "absolute", top: "-1px", left: "40px", right: "40px", height: "2px",
                    background: `linear-gradient(90deg, transparent, ${A1}, transparent)` }} />
                  {/* Left: text content */}
                  <div style={{ flex: "1 1 60%", minWidth: 0 }}>
                    <ProductIcon activeTag={hoveredProduct} size={isMobile ? 32 : 40} />
                    <div style={{ marginTop: "20px" }}>
                      <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: V3, fontWeight: 700 }}>
                        Sur-mesure
                      </span>
                      <h3 style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px", marginBottom: "12px" }}>Applications & Outils Métiers</h3>
                      <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#71717A" }}>
                        On conçoit les outils digitaux dont votre entreprise a besoin. Dashboards, CRM internes, configurateurs, plateformes — chaque outil est pensé pour simplifier votre quotidien.
                      </p>
                      <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {["Dashboards", "CRM", "Configurateurs", "Plateformes"].map((t, j) => (
                          <span key={j}
                            onMouseEnter={() => setHoveredProduct(t)}
                            onMouseLeave={() => setHoveredProduct(null)}
                            style={{
                              fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
                              color: hoveredProduct === t ? V : V3,
                              padding: "5px 12px",
                              border: `1px solid ${hoveredProduct === t ? VG(0.3) : VG(0.1)}`,
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              background: hoveredProduct === t ? VG(0.05) : "transparent",
                            }}>{t}</span>
                        ))}
                      </div>
                      <div style={{ marginTop: "28px" }}>
                        <ChromeButton onClick={() => navigate('/technologies')}>Découvrir →</ChromeButton>
                      </div>
                    </div>
                  </div>
                  {/* Right: Dashboard Preview */}
                  <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DashboardPreview />
                  </div>
                </div>

                {/* Carte 2 — Site Vitrine */}
                <div style={{
                  padding: isMobile ? "32px 24px" : "48px 40px",
                  border: `1px solid ${VG(0.15)}`, background: "rgba(24,24,27,0.4)",
                  position: "relative", overflow: "hidden", display: "flex", flexDirection: "column",
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.35); e.currentTarget.style.background = "rgba(24,24,27,0.6)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.15); e.currentTarget.style.background = "rgba(24,24,27,0.4)"; }}>
                  <div style={{
                    position: "absolute", top: "-1px", left: "40px", right: "40px", height: "2px",
                    background: `linear-gradient(90deg, transparent, ${A1}, transparent)` }} />
                  <ChromeIcon type="browser" size={isMobile ? 32 : 40} />
                  <div style={{ marginTop: "20px" }}>
                    <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: V3, fontWeight: 700 }}>
                      Design & Performance
                    </span>
                    <h3 style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px", marginBottom: "12px" }}>Site Vitrine</h3>
                    <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#71717A" }}>
                      Des sites rapides, élégants et pensés pour convertir. Chaque pixel est optimisé pour refléter votre marque et capter l'attention de vos visiteurs.
                    </p>
                    <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {["Landing page", "Responsive", "Animations", "SEO-ready"].map((t, j) => (
                        <span key={j} style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: V3, padding: "5px 12px", border: `1px solid ${VG(0.1)}` }}>{t}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: "28px" }}>
                      <ChromeButton onClick={() => navigate('/vitrine')}>Découvrir →</ChromeButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2 — Optimisation pleine largeur */}
              <div style={{
                padding: isMobile ? "32px 24px" : "40px 48px",
                border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.3)",
                position: "relative", overflow: "hidden",
                display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "20px" : "40px",
                transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.3); e.currentTarget.style.background = "rgba(24,24,27,0.55)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.1); e.currentTarget.style.background = "rgba(24,24,27,0.3)"; }}>
                <ChromeIcon type="gauge" size={isMobile ? 32 : 40} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "6px" }}>Optimisation & Performance</h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#71717A", margin: 0 }}>
                    Audit technique, optimisation Core Web Vitals, refactoring. On transforme un site lent en machine de guerre.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1 — SEO & Marketing */}
          <div style={{
            opacity: activeTab === 1 ? 1 : 0,
            transform: activeTab === 1 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: activeTab === 1 ? "auto" : "none",
            position: activeTab === 1 ? "relative" : "absolute", top: 0, left: 0, right: 0 }}>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "24px", maxWidth: "1100px", margin: "0 auto" }}>
              {[
                { title: "Référencement Naturel", tag: "SEO", icon: null, desc: "Positionnez votre site sur les premiers résultats de Google pour générer durablement des visites qualifiées.", points: ["Audit SEO complet", "Optimisation on-page", "Stratégie de backlinks", "Suivi de positionnement"] },
                { title: "Content Marketing", tag: "CONTENU", icon: null, desc: "Stratégie de contenu sur-mesure pour votre cible. Articles, landing pages, newsletters — on écrit ce qui convertit.", points: ["Calendrier éditorial", "Rédaction SEO", "Landing pages", "Newsletters"] },
                { title: "Social Media & Ads", tag: "PUBLICITÉ", icon: null, desc: "Gestion de communauté et campagnes publicitaires ultra-ciblées. Meta, Google Ads, LinkedIn — on maximise votre ROI.", points: ["Meta & Google Ads", "Gestion communauté", "Ciblage avancé", "Reporting ROI"] },
                { title: "Webdesign (UX/UI)", tag: "DESIGN", icon: null, desc: "Navigation simplifiée et optimisation du taux de conversion. Chaque interaction est pensée pour guider l'utilisateur.", points: ["Wireframes & maquettes", "Tests utilisateurs", "Optimisation CRO", "Design system"] },
              ].map((c, i) => (
                <div key={i} style={{
                  padding: "40px 36px", border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.2)",
                  position: "relative", overflow: "hidden",
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = VG(0.3);
                    e.currentTarget.style.background = "rgba(24,24,27,0.5)";
                    e.currentTarget.querySelector('.tab-line').style.transform = "scaleY(1)";
                    e.currentTarget.querySelector('.tab-line').style.opacity = "1";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = VG(0.1);
                    e.currentTarget.style.background = "rgba(24,24,27,0.2)";
                    e.currentTarget.querySelector('.tab-line').style.transform = "scaleY(0)";
                    e.currentTarget.querySelector('.tab-line').style.opacity = "0";
                  }}>
                  <div className="tab-line" style={{
                    position: "absolute", top: 0, left: 0, width: "2px", height: "100%",
                    background: `linear-gradient(180deg, ${A1}, transparent)`,
                    transformOrigin: "top", transform: "scaleY(0)", opacity: 0,
                    transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease" }} />
                  <div style={{ marginBottom: "16px" }}>
                    <span style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: V2, padding: "4px 10px", border: `1px solid ${VG(0.15)}`, fontWeight: 600 }}>{c.tag}</span>
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "12px" }}>{c.title}</h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#71717A", marginBottom: "20px" }}>{c.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {c.points.map((p, j) => (
                      <span key={j} style={{ fontSize: "10px", letterSpacing: "1px", color: V3, padding: "4px 10px", background: VG(0.05), border: `1px solid ${VG(0.08)}` }}>{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* ═══ OUTILS SaaS ═══ */}
      <section id="outils" aria-label="Nos outils" className="fade-section" style={{ padding: isMobile ? "60px 20px" : "120px 48px", borderTop: `1px solid ${VG(0.1)}` }}>
        <RevealSection>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: V2, display: "block", marginBottom: "16px" }}>
              // Nos outils
            </span>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
              Des outils <span style={{ background: `linear-gradient(135deg, #ef4444, #8b5cf6, #06b6d4)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>puissants</span> pour votre business.
            </h2>
            <p style={{ fontSize: "16px", color: "#71717A", marginTop: "16px", maxWidth: "560px", margin: "16px auto 0" }}>
              Trois outils SaaS conçus pour les PME. Simples, efficaces, sans engagement.
            </p>
          </div>
        </RevealSection>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "24px", maxWidth: "1100px", margin: "0 auto" }}>

          {/* Sentinel */}
          <RevealSection delay={0}>
            <div style={{
              border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px", padding: "36px 32px",
              position: "relative", overflow: "hidden", height: "100%",
              transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(239,68,68,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #ef4444, #f97316)" }} />
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "4px" }}>Sentinel</h3>
              <p style={{ fontSize: "13px", color: "#ef4444", fontWeight: 600, marginBottom: "12px", letterSpacing: "0.5px" }}>E-reputation & gestion des avis</p>
              <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#71717A", marginBottom: "20px" }}>
                Surveillez vos avis Google en temps reel, repondez automatiquement par IA et analysez les tendances de votre e-reputation.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Surveillance avis Google", "Reponses IA automatiques", "Analyse semantique", "Veille concurrentielle", "QR Code + Widget + Alertes"].map((f, i) => (
                  <li key={i} style={{ fontSize: "13px", color: "#A1A1AA", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "36px", fontWeight: 800 }}>29€</span>
                  <span style={{ fontSize: "14px", color: "#71717A" }}>/mois</span>
                </div>
                <button onClick={() => navigate("/contact")} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(239,68,68,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  Commencer
                </button>
              </div>
            </div>
          </RevealSection>

          {/* Phantom */}
          <RevealSection delay={120}>
            <div style={{
              border: "1px solid rgba(139,92,246,0.2)", borderRadius: "16px", padding: "36px 32px",
              position: "relative", overflow: "hidden", height: "100%",
              transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(139,92,246,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #8b5cf6, #a78bfa)" }} />
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "4px" }}>Phantom</h3>
              <p style={{ fontSize: "13px", color: "#8b5cf6", fontWeight: 600, marginBottom: "12px", letterSpacing: "0.5px" }}>Audit de performance web</p>
              <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#71717A", marginBottom: "20px" }}>
                Analysez vos scores Lighthouse, Core Web Vitals et obtenez des recommandations IA en francais pour ameliorer votre site.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Audit Lighthouse complet", "Scores Performance + SEO", "Core Web Vitals detailles", "Recommandations IA", "Historique + evolution"].map((f, i) => (
                  <li key={i} style={{ fontSize: "13px", color: "#A1A1AA", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "36px", fontWeight: 800 }}>19€</span>
                  <span style={{ fontSize: "14px", color: "#71717A" }}>/mois</span>
                </div>
                <button onClick={() => navigate("/contact")} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(139,92,246,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  Commencer
                </button>
              </div>
            </div>
          </RevealSection>

          {/* Vault */}
          <RevealSection delay={240}>
            <div style={{
              border: "1px solid rgba(6,182,212,0.2)", borderRadius: "16px", padding: "36px 32px",
              position: "relative", overflow: "hidden", height: "100%",
              transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)"; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(6,182,212,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #06b6d4, #22d3ee)" }} />
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "4px" }}>Vault</h3>
              <p style={{ fontSize: "13px", color: "#06b6d4", fontWeight: 600, marginBottom: "12px", letterSpacing: "0.5px" }}>Surveillance des fuites de donnees</p>
              <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#71717A", marginBottom: "20px" }}>
                Scannez vos emails professionnels sur les bases piratees. Alertes en temps reel et recommandations IA de cybersecurite.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Detection fuites de donnees", "Scan emails professionnels", "Monitoring continu", "Alertes en temps reel", "Rapport PDF + recommandations IA"].map((f, i) => (
                  <li key={i} style={{ fontSize: "13px", color: "#A1A1AA", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "36px", fontWeight: 800 }}>19€</span>
                  <span style={{ fontSize: "14px", color: "#71717A" }}>/mois</span>
                </div>
                <button onClick={() => navigate("/contact")} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #06b6d4, #22d3ee)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(6,182,212,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  Commencer
                </button>
              </div>
            </div>
          </RevealSection>

        </div>
      </section>

      {/* Section tarifs retirée */}
      {false && <section>
        <RevealSection>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span style={{ fontSize: "12px", letterSpacing: "3px", color: A1 }}>● TARIFS</span>
            <h2 style={{ fontSize: isMobile ? "32px" : "48px", fontWeight: 900, marginTop: "16px", lineHeight: 1.1 }}>
              Des prix <span style={{ background: `linear-gradient(135deg, ${A1}, ${A3})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>imbattables</span>
            </h2>
            <p style={{ fontSize: "16px", color: "#71717A", marginTop: "16px", maxWidth: "500px", margin: "16px auto 0" }}>
              Pas de surprise, pas d'engagement. Annulez quand vous voulez.
            </p>
          </div>
        </RevealSection>

        {/* Individual tools */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>
          {/* Sentinel */}
          <RevealSection delay={0}>
            <div style={{ border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px", padding: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #ef4444, #f97316)" }} />
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>Sentinel</h3>
              <p style={{ fontSize: "13px", color: "#ef4444", fontWeight: 500, marginBottom: "16px" }}>E-reputation</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                <span style={{ fontSize: "40px", fontWeight: 800 }}>29€</span>
                <span style={{ fontSize: "14px", color: "#71717A" }}>/mois</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Surveillance avis Google", "Reponses IA automatiques", "Analyse semantique", "Veille concurrentielle", "QR Code + Widget + Alertes", "Rapports PDF"].map((f, i) => (
                  <li key={i} style={{ fontSize: "13px", color: "#A1A1AA", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/contact")} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Commencer
              </button>
            </div>
          </RevealSection>

          {/* Phantom */}
          <RevealSection delay={120}>
            <div style={{ border: "1px solid rgba(139,92,246,0.2)", borderRadius: "16px", padding: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #8b5cf6, #a78bfa)" }} />
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>Phantom</h3>
              <p style={{ fontSize: "13px", color: "#8b5cf6", fontWeight: 500, marginBottom: "16px" }}>Performance web</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                <span style={{ fontSize: "40px", fontWeight: 800 }}>19€</span>
                <span style={{ fontSize: "14px", color: "#71717A" }}>/mois</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Audit Lighthouse complet", "Scores Performance + SEO", "Core Web Vitals detailles", "Recommandations IA", "Historique + evolution"].map((f, i) => (
                  <li key={i} style={{ fontSize: "13px", color: "#A1A1AA", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/contact")} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Commencer
              </button>
            </div>
          </RevealSection>

          {/* Vault */}
          <RevealSection delay={240}>
            <div style={{ border: "1px solid rgba(6,182,212,0.2)", borderRadius: "16px", padding: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #06b6d4, #22d3ee)" }} />
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>Vault</h3>
              <p style={{ fontSize: "13px", color: "#06b6d4", fontWeight: 500, marginBottom: "16px" }}>Cybersecurite</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                <span style={{ fontSize: "40px", fontWeight: 800 }}>19€</span>
                <span style={{ fontSize: "14px", color: "#71717A" }}>/mois</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Detection fuites de donnees", "Scan emails professionnels", "Monitoring continu", "Alertes en temps reel", "Rapport PDF + recommandations IA"].map((f, i) => (
                  <li key={i} style={{ fontSize: "13px", color: "#A1A1AA", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/contact")} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #06b6d4, #22d3ee)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Commencer
              </button>
            </div>
          </RevealSection>
        </div>

        {/* Packs */}
        <RevealSection delay={360}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
            {/* Pack Duo */}
            <div style={{ border: `1px solid ${VG(0.15)}`, borderRadius: "16px", padding: "32px", background: VG(0.03) }}>
              <span style={{ fontSize: "11px", letterSpacing: "2px", color: A1, fontWeight: 600 }}>PACK DUO</span>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginTop: "8px" }}>2 outils au choix</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "16px 0" }}>
                <span style={{ fontSize: "36px", fontWeight: 800 }}>39€</span>
                <span style={{ fontSize: "14px", color: "#71717A" }}>/mois</span>
                <span style={{ fontSize: "13px", color: "#52525B", textDecoration: "line-through", marginLeft: "8px" }}>48€</span>
              </div>
              <p style={{ fontSize: "13px", color: "#71717A", marginBottom: "20px" }}>Economisez 19% en combinant 2 outils.</p>
              <button onClick={() => navigate("/contact")} style={{ padding: "10px 24px", background: `linear-gradient(135deg, ${A1}, ${A3})`, border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Choisir mes outils
              </button>
            </div>

            {/* Pack Total — highlighted */}
            <div style={{ border: `2px solid ${A1}`, borderRadius: "16px", padding: "32px", background: VG(0.05), position: "relative" }}>
              <div style={{ position: "absolute", top: "-12px", right: "20px", background: `linear-gradient(135deg, ${A1}, ${A3})`, padding: "4px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: "#fff" }}>
                POPULAIRE
              </div>
              <span style={{ fontSize: "11px", letterSpacing: "2px", color: A1, fontWeight: 600 }}>PACK TOTAL</span>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginTop: "8px" }}>Les 3 outils</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "16px 0" }}>
                <span style={{ fontSize: "36px", fontWeight: 800 }}>49€</span>
                <span style={{ fontSize: "14px", color: "#71717A" }}>/mois</span>
                <span style={{ fontSize: "13px", color: "#52525B", textDecoration: "line-through", marginLeft: "8px" }}>67€</span>
              </div>
              <p style={{ fontSize: "13px", color: "#71717A", marginBottom: "20px" }}>Sentinel + Phantom + Vault. Economisez 27%.</p>
              <button onClick={() => navigate("/contact")} style={{ padding: "10px 24px", background: `linear-gradient(135deg, ${A1}, ${A3})`, border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Tout prendre
              </button>
            </div>
          </div>
        </RevealSection>
      </section>}

      {/* Technologies section moved to /technologies page */}

      {/* ═══ PORTFOLIO — BENTO GRID (2+2+3) + CODENAMES ═══ */}
      <section id="projets" aria-label="Nos projets" className="fade-section" style={{ padding: isMobile ? "60px 20px" : "100px 48px", borderTop: `1px solid ${VG(0.1)}` }}>
        <RevealSection>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", marginBottom: isMobile ? "40px" : "64px", gap: isMobile ? "16px" : "0" }}>
            <div>
              <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: V2, display: "block", marginBottom: "16px" }}>
                // Projets
              </span>
              <TextReveal>
                <h2 style={{ fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
                  Ce qu'on <span style={{ background: `linear-gradient(135deg, ${A2}, ${A1})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>construit</span>
                </h2>
              </TextReveal>
            </div>
            <span onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: "smooth", block: "start" })}
                           style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: V2, cursor: "pointer" }}>
              Tous les projets →
            </span>
          </div>
        </RevealSection>

        {/* ROW 1 — Projets */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
          {/* EN COURS DE DÉVELOPPEMENT */}
          <RevealSection delay={100}>
            <div style={{
              background: "linear-gradient(135deg, #0f0f0f, #181818)",
              aspectRatio: isMobile ? "auto" : "4/3",
              minHeight: isMobile ? "280px" : "auto",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "40px 28px", border: `1px dashed ${VG(0.15)}`, position: "relative", overflow: "hidden"
            }}>
              <div style={{ width: "48px", height: "48px", marginBottom: "24px", position: "relative" }}>
                <div style={{
                  width: "48px", height: "48px", border: `2px solid ${VG(0.08)}`, borderTop: `2px solid ${VG(0.4)}`,
                  borderRadius: "50%", animation: "spin 1.2s linear infinite"
                }} />
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  fontSize: "14px", color: VG(0.3), fontFamily: "monospace"
                }}>%</div>
              </div>
              <div style={{ fontSize: "13px", letterSpacing: "4px", textTransform: "uppercase", color: V3, marginBottom: "12px", textAlign: "center" }}>
                En cours de developpement
              </div>
              <div style={{ width: "160px", height: "3px", background: VG(0.08), borderRadius: "2px", overflow: "hidden", marginBottom: "16px" }}>
                <div style={{
                  width: "40%", height: "100%", background: `linear-gradient(90deg, ${VG(0.2)}, ${VG(0.5)})`,
                  borderRadius: "2px", animation: "loading 2.5s ease-in-out infinite"
                }} />
              </div>
              <div style={{ fontSize: "11px", color: "#52525B", textAlign: "center", maxWidth: "240px", lineHeight: 1.6 }}>
                Nouveau projet en preparation. Restez connectes.
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ VALUE STRIP ═══ */}
      <section aria-label="Pourquoi NERVÜR" style={{ padding: isMobile ? "60px 20px" : "100px 48px", borderTop: `1px solid ${VG(0.1)}`, borderBottom: `1px solid ${VG(0.1)}`, position: "relative", overflow: "hidden" }}>
        {/* Background subtle gradient */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(129,140,248,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />

        <RevealSection>
          <div style={{ textAlign: "center", maxWidth: "900px", margin: "0 auto", position: "relative" }}>
            <div style={{ fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "#52525B", marginBottom: "24px", fontWeight: 600 }}>Pourquoi NERVUR</div>
            <h2 style={{ fontSize: isMobile ? "28px" : "clamp(36px, 4vw, 52px)", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-1.5px", marginBottom: "48px", color: V }}>
              Des outils qui travaillent.<br />
              <span style={{ color: "#52525B" }}>Pas des promesses.</span>
            </h2>
          </div>
        </RevealSection>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? "16px" : "24px", maxWidth: "800px", margin: "0 auto", position: "relative" }}>
          {[
            { title: "Donnees reelles", desc: "Chaque analyse est basee sur de vraies API — Google PageSpeed, Lighthouse, scraping reel. Zero simulation, zero estimation.", accent: "#4ADE80" },
            { title: "Resultats mesurables", desc: "Scores de performance, audits detailles, signaux concurrentiels — tout est chiffre, source et verifiable.", accent: "#c084fc" },
          ].map((item, i) => (
            <RevealSection key={i} delay={i * 150}>
              <div style={{
                padding: isMobile ? "28px 24px" : "36px 32px",
                border: `1px solid ${VG(0.08)}`,
                background: VG(0.02),
                position: "relative",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.2); e.currentTarget.style.background = VG(0.04); }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.08); e.currentTarget.style.background = VG(0.02); }}>
                <div style={{ width: "32px", height: "2px", background: item.accent, marginBottom: "20px", opacity: 0.7 }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.3px", marginBottom: "12px", color: V }}>{item.title}</h3>
                <p style={{ fontSize: "13px", lineHeight: 1.8, color: "#71717A" }}>{item.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* Témoignage retiré */}

      {/* ═══ PROCESS ═══ */}
      <section id="approche" aria-label="Notre méthode" className="fade-section" style={{ padding: isMobile ? "60px 20px" : "120px 48px", borderTop: `1px solid ${VG(0.1)}` }}>
        <RevealSection>
          <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: V2, display: "block", marginBottom: "16px" }}>
            // Notre méthode
          </span>
          <TextReveal>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: "64px" }}>
              Comment on donne <span style={{ background: `linear-gradient(135deg, ${A3}, ${A1})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>vie</span> aux idées
            </h2>
          </TextReveal>
        </RevealSection>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: "16px" }}>
          {[
            { num: "01", title: "Comprendre", desc: "On dissèque votre business, vos objectifs et vos blocages. On identifie ce que personne n'a vu.", time: "1 – 2 jours" },
            { num: "02", title: "Structurer", desc: "On analyse votre marché et on construit la stratégie. Chaque décision est alignée avec vos objectifs.", time: "2 – 3 jours" },
            { num: "03", title: "Concevoir", desc: "On transforme la stratégie en réalité. Design sur-mesure, développement performant, chaque détail compte.", time: "5 – 10 jours" },
            { num: "04", title: "Déployer", desc: "Lancement optimisé, suivi post-livraison, ajustements continus. On ne vous lâche pas.", time: "1 – 2 jours" },
          ].map((step, i) => (
            <RevealSection key={i} delay={i * 120}>
              <div className={`step-card ${activeStep === i ? "step-active" : ""}`}
                onClick={() => setActiveStep(i)}
                style={{
                  padding: "36px 28px", border: `1px solid ${VG(0.08)}`,
                  background: activeStep === i ? VG(0.05) : "transparent",
                  display: "flex", flexDirection: "column", minHeight: "280px",
                  position: "relative" }}>
                {activeStep === i && (
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: `linear-gradient(90deg, ${A1}, ${A3}, transparent)` }} />
                )}
                <span style={{ fontSize: "40px", fontWeight: 900, color: activeStep === i ? V2 : "#27272A", transition: "color 0.4s", display: "block", marginBottom: "20px", fontFamily: "monospace" }}>
                  {step.num}
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>{step.title}</h3>
                <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#71717A", flex: 1 }}>{step.desc}</p>
                {/* durée retirée */}
              </div>
            </RevealSection>
          ))}
        </div>
      </section>


      {/* ═══ CTA FINAL ═══ */}
      <section id="contact" aria-label="Nous contacter" className="fade-section" style={{
        padding: isMobile ? "80px 20px" : "140px 48px", borderTop: `1px solid ${VG(0.1)}`,
        textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "500px", height: "500px", borderRadius: "50%",
          background: `radial-gradient(circle, rgba(129,140,248,0.06) 0%, rgba(244,114,182,0.02) 30%, transparent 70%)`,
          filter: "blur(60px)" }} />
        <RevealSection>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ width: "1px", height: "60px", background: `linear-gradient(180deg, ${V2}, transparent)`, margin: "0 auto 40px" }} />
            <TextReveal>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: "20px", maxWidth: "700px" }}>
                Votre marque mérite une{" "}
                <span style={{ background: `linear-gradient(135deg, ${A1}, ${A3})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>structure</span>.
              </h2>
            </TextReveal>
            <TextReveal delay={150}>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: "20px", maxWidth: "700px" }}>
                Pas un devis.
              </h2>
            </TextReveal>
            <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#71717A", maxWidth: "460px", margin: "0 auto 40px" }}>
              Réservez un appel de 30 minutes. On écoute, on diagnostique, on vous dit la vérité. Gratuit. Sans engagement.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexDirection: isMobile ? "column" : "row", alignItems: "center" }}>
              <MagneticButton className="cta-btn" onClick={() => navigate('/contact')}
                               style={{
                padding: isMobile ? "16px 32px" : "18px 48px", border: "none",
                background: `linear-gradient(135deg, ${A1}, ${A3})`,
                color: "#09090B", fontSize: isMobile ? "12px" : "14px", fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", cursor: "pointer", display: "inline-block", textAlign: "center" }}>
                Réserver un appel →
              </MagneticButton>
              <MagneticButton className="cta-btn" onClick={() => navigate('/contact')}
                               style={{
                padding: isMobile ? "16px 32px" : "18px 48px", border: `1px solid rgba(129,140,248,0.4)`,
                color: V, fontSize: isMobile ? "12px" : "14px", fontWeight: 600, letterSpacing: "1.5px",
                textTransform: "uppercase", cursor: "pointer", background: "transparent", display: "inline-block", textAlign: "center" }}>
                Demander un devis
              </MagneticButton>
            </div>
            <div style={{ marginTop: "24px", display: "flex", gap: "32px", flexWrap: "wrap", justifyContent: "center" }}>
              <span onClick={() => navigate('/simulateur')} style={{
                fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase",
                color: V3, cursor: "pointer", borderBottom: `1px solid ${VG(0.2)}`,
                paddingBottom: "4px", transition: "all 0.3s",
              }}
                onMouseEnter={e => { e.target.style.color = V; e.target.style.borderColor = V; }}
                onMouseLeave={e => { e.target.style.color = V3; e.target.style.borderColor = VG(0.2); }}>
                Calculez votre ROI digital gratuitement →
              </span>
              <span onClick={() => navigate('/diagnostic')} style={{
                fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase",
                color: V3, cursor: "pointer", borderBottom: `1px solid ${VG(0.2)}`,
                paddingBottom: "4px", transition: "all 0.3s",
              }}
                onMouseEnter={e => { e.target.style.color = V; e.target.style.borderColor = V; }}
                onMouseLeave={e => { e.target.style.color = V3; e.target.style.borderColor = VG(0.2); }}>
                Évaluez votre maturité digitale →
              </span>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ═══ TECH MARQUEE — GRILLE TECHNIQUE ═══ */}
      <section aria-label="Technologies utilisées" style={{ borderTop: `1px solid ${VG(0.1)}`, padding: "0", overflow: "hidden" }}>
        <div style={{ borderBottom: `1px solid ${VG(0.05)}`, padding: "16px 0", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "40px", animation: "marquee 35s linear infinite", width: "max-content" }}>
            {[...Array(4)].flatMap((_, setIdx) =>
              ["REACT", "NEXT.JS", "FIGMA", "NODE.JS", "TAILWIND", "TYPESCRIPT", "VERCEL", "WORDPRESS"].map((tech, i) => (
                <span key={`t1-${setIdx}-${i}`} style={{
                  fontSize: "11px", letterSpacing: "3px", fontFamily: "monospace",
                  color: "#27272A", whiteSpace: "nowrap", padding: "4px 16px" }}>
                  <span style={{ color: V2, marginRight: "8px", animation: "terminalBlink 2s infinite", fontSize: "8px" }}>▸</span>
                  {tech}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      </main>

      {/* ═══ BACK TO TOP ═══ */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
               aria-label="Retour en haut de page"
               style={{
          position: "fixed", bottom: "32px", right: "32px", zIndex: 99,
          width: "48px", height: "48px", borderRadius: "50%",
          background: V, color: "#09090B", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: "18px", fontWeight: 700,
          opacity: showBackToTop ? 1 : 0,
          transform: showBackToTop ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: showBackToTop ? "auto" : "none",
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          mixBlendMode: "difference",
        }}>
        <span aria-hidden="true">↑</span>
      </button>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: `1px solid ${VG(0.1)}` }}>
        <div style={{ padding: isMobile ? "40px 20px 24px" : "48px 48px 24px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr 1fr 1fr", gap: isMobile ? "32px" : "40px" }}>
          {/* Col 1 — Logo + infos */}
          <div>
            <img src="/logo-nav.png" alt="NERVÜR — Éditeur de technologies de croissance pour PME" style={{ height: "28px", width: "auto", filter: "invert(1) brightness(1.15)", mixBlendMode: "screen", objectFit: "contain", marginBottom: "16px" }} />
            <p style={{ fontSize: "12px", color: "#52525B", lineHeight: 1.8 }}>Agence Digital NERVUR</p>
            <p style={{ fontSize: "12px", color: "#52525B", lineHeight: 1.8 }}>SIRET : 102 415 916 00018</p>
            <p style={{ fontSize: "12px", color: "#52525B", lineHeight: 1.8 }}>Saint-Paul-les-Dax, France</p>
          </div>

          {/* Col 2 — Outils */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#71717A", marginBottom: "16px" }}>Outils</p>
            {[
              { name: "Sentinel — E-réputation", path: "/sentinel" },
              { name: "Phantom — Audit web", path: "/phantom" },
              { name: "Vault — Cybersécurité", path: "/vault" },
            ].map((t, i) => (
              <p key={i} onClick={() => navigate(t.path)} style={{ fontSize: "12px", color: "#52525B", lineHeight: 2.2, cursor: "pointer", transition: "color 0.3s" }}
                onMouseEnter={e => e.target.style.color = A1}
                onMouseLeave={e => e.target.style.color = "#52525B"}>
                {t.name}
              </p>
            ))}
          </div>

          {/* Col 3 — Navigation */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#71717A", marginBottom: "16px" }}>Navigation</p>
            {[
              { name: "Accueil", path: "/" },
              { name: "Technologies", path: "/technologies" },
              { name: "Contact", path: "/contact" },
              { name: "Simulateur", path: "/simulateur" },
              { name: "Diagnostic", path: "/diagnostic" },
            ].map((t, i) => (
              <p key={i} onClick={() => navigate(t.path)} style={{ fontSize: "12px", color: "#52525B", lineHeight: 2.2, cursor: "pointer", transition: "color 0.3s" }}
                onMouseEnter={e => e.target.style.color = A1}
                onMouseLeave={e => e.target.style.color = "#52525B"}>
                {t.name}
              </p>
            ))}
          </div>

          {/* Col 4 — Blog */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#71717A", marginBottom: "16px" }}>Blog</p>
            {[
              { name: "E-reputation PME", path: "/blog/e-reputation" },
              { name: "Cybersecurite PME", path: "/blog/cybersecurite" },
              { name: "Performance web", path: "/blog/performance-web" },
            ].map((t, i) => (
              <p key={i} onClick={() => navigate(t.path)} style={{ fontSize: "12px", color: "#52525B", lineHeight: 2.2, cursor: "pointer", transition: "color 0.3s" }}
                onMouseEnter={e => e.target.style.color = A1}
                onMouseLeave={e => e.target.style.color = "#52525B"}>
                {t.name}
              </p>
            ))}
          </div>

          {/* Col 5 — Legal + Contact */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#71717A", marginBottom: "16px" }}>Legal</p>
            {[
              { name: "Mentions legales", path: "/mentions-legales" },
              { name: "Politique de confidentialite", path: "/confidentialite" },
              { name: "CGV", path: "/cgv" },
              { name: "Qui sommes-nous", path: "/qui-sommes-nous" },
            ].map((t, i) => (
              <p key={i} onClick={() => navigate(t.path)} style={{ fontSize: "12px", color: "#52525B", lineHeight: 2.2, cursor: "pointer", transition: "color 0.3s" }}
                onMouseEnter={e => e.target.style.color = A1}
                onMouseLeave={e => e.target.style.color = "#52525B"}>
                {t.name}
              </p>
            ))}
            <p style={{ fontSize: "12px", color: "#52525B", lineHeight: 2.2, marginTop: "8px" }}>contact@nervurpro.fr</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ padding: isMobile ? "16px 20px" : "16px 48px", borderTop: `1px solid ${VG(0.06)}`, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "11px", color: "#3F3F46", letterSpacing: "0.5px" }}>
            NERVUR 2026. Tous droits reserves.
          </span>
          <div style={{ display: "flex", gap: "20px" }}>
            {["LI", "IG", "BH", "DB"].map((s, i) => (
              <span key={i} style={{
                fontSize: "11px", letterSpacing: "2px", color: "#3F3F46", cursor: "pointer",
                width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${VG(0.1)}`, transition: "all 0.3s" }}
              onMouseEnter={e => { e.target.style.borderColor = "rgba(129,140,248,0.4)"; e.target.style.color = A1; }}
              onMouseLeave={e => { e.target.style.borderColor = VG(0.1); e.target.style.color = "#3F3F46"; }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
