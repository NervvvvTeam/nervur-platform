import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import useJsonLd from "./useJsonLd";
import useFadeOnScroll from "./useFadeOnScroll";
import LogoNervur from "./components/LogoNervur";

// ─── NERVÜR AURORA ───
// Dark theme + 3-accent palette (Indigo, Green, Pink)
// Clean typography + Ghost text hovers + Bento grid + Codenames

const V = "#0A2540";   // Primary text (dark)
const V2 = "#425466";  // Mid grey
const V3 = "#6B7C93";  // Soft grey
const VG = (a) => `rgba(0,0,0,${a})`;

// ─── ACCENT PALETTE ───
const A1 = "#635BFF";  // Indigo — primary accent
const A2 = "#4ADE80";  // Green — secondary accent
const A3 = "#F472B6";  // Pink — tertiary accent
const GRAD = `linear-gradient(135deg, ${A1}, ${A3}, ${A2})`;
const AG = (a = 1) => `linear-gradient(135deg, rgba(99,91,255,${a}), rgba(244,114,182,${a}), rgba(74,222,128,${a}))`;

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
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: "12px", padding: "16px", backdropFilter: "blur(12px)",
      minWidth: "200px", maxWidth: "280px", width: "100%",
    }}>
      {/* macOS dots */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "8px", color: "rgba(0,0,0,0.12)", letterSpacing: "1px" }}>NERVÜR DASH</span>
      </div>
      {/* Mini metrics row */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["+24%", "1.2k", "98%"].map((v, i) => (
          <div key={i} style={{
            flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "6px",
            padding: "8px 6px", textAlign: "center",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#425466" }}>{v}</div>
            <div style={{ fontSize: "7px", color: "rgba(0,0,0,0.12)", marginTop: "2px", letterSpacing: "0.5px" }}>
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
            background: `linear-gradient(180deg, rgba(99,91,255,0.3) 0%, rgba(74,222,128,0.08) 100%)`,
            transformOrigin: "bottom", animation: `floatBar 3s ease-in-out ${b.delay} infinite`,
          }} />
        ))}
      </div>
      {/* Bottom status */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "7px", color: "rgba(0,0,0,0.1)", letterSpacing: "1px" }}>LIVE DATA</span>
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
  const [expandedTool, setExpandedTool] = useState(null);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [mobileAppsOpen, setMobileAppsOpen] = useState(false);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const shootingStarsRef = useRef([]);

  // Trigger a shooting star from a button's position
  const triggerShootingStar = (e, direction = "down") => {
    const canvas = canvasRef.current;
    if (!canvas || !e?.currentTarget) return;
    const canvasRect = canvas.getBoundingClientRect();
    const btnRect = e.currentTarget.getBoundingClientRect();
    // Get button center relative to canvas
    const x = btnRect.left + btnRect.width / 2 - canvasRect.left;
    const y = btnRect.top + btnRect.height / 2 - canvasRect.top;
    for (let i = 0; i < 2; i++) {
      shootingStarsRef.current.push({
        x: x + (Math.random() - 0.5) * 30, y,
        vx: direction === "down" ? (Math.random() - 0.3) * 2 : (Math.random() * 3 + 1),
        vy: direction === "down" ? (Math.random() * 3 + 1.5) : -(Math.random() * 2.5 + 1.5),
        life: 1, decay: 0.006 + Math.random() * 0.004, bright: true,
      });
    }
  };

  // Galaxy canvas for hero — stars, nebula, planet, interactive
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    // Stars — different sizes and brightnesses
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2.2 + 0.4,
      baseA: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: Math.random() > 0.85 ? [100, 150, 255] : Math.random() > 0.7 ? [255, 200, 150] : [255, 255, 255],
    }));

    // Shooting stars — use shared ref so buttons can trigger them
    const shootingStars = shootingStarsRef.current;

    // Planet drawn via CSS image now, canvas only does stars/nebula

    let time = 0;
    let raf;

    function draw() {
      time += 0.016;
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      // Mouse glow — subtle white
      if (mx > 0) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, 150);
        g.addColorStop(0, "rgba(255,255,255,0.03)");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      }

      // Draw stars with twinkling
      for (const s of stars) {
        const twinkle = Math.sin(time * s.twinkleSpeed * 60 + s.twinkleOffset) * 0.3 + 0.7;
        const alpha = s.baseA * twinkle;

        // Mouse repulsion — stars move away gently
        if (mx > 0) {
          const dx = s.x - mx, dy = s.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150 * 0.3;
            s.x += (dx / dist) * force;
            s.y += (dy / dist) * force;
          }
        }

        // Draw star
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${alpha})`;
        ctx.fill();

        // Star glow for bigger stars
        if (s.r > 1.2) {
          const sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
          sg.addColorStop(0, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${alpha * 0.15})`);
          sg.addColorStop(1, "transparent");
          ctx.fillStyle = sg;
          ctx.fillRect(s.x - s.r * 4, s.y - s.r * 4, s.r * 8, s.r * 8);
        }
      }

      // Random shooting stars
      if (Math.random() < 0.005) {
        shootingStars.push({
          x: Math.random() * w, y: Math.random() * h * 0.5,
          vx: 4 + Math.random() * 4, vy: 2 + Math.random() * 2,
          life: 1, decay: 0.02 + Math.random() * 0.02,
        });
      }
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx; ss.y += ss.vy; ss.life -= ss.decay;
        if (ss.life <= 0) { shootingStars.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        const tailLen = ss.bright ? 20 : 8;
        ctx.lineTo(ss.x - ss.vx * tailLen, ss.y - ss.vy * tailLen);
        ctx.strokeStyle = ss.bright
          ? `rgba(255,255,255,${ss.life * 0.8})`
          : `rgba(255,255,255,${ss.life * 0.5})`;
        ctx.lineWidth = ss.bright ? 2 : 1;
        ctx.stroke();
      }

      // Planet is now a real image via CSS, no canvas drawing needed

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  const glowRef = useRef(null);
  const pageRef = useRef(null);
  useFadeOnScroll(pageRef);

  useSEO(
    "NERVÜR — Agence Digitale & Nouvelles Technologies sur Mesure",
    "NERVÜR — Éditeur de nouvelles technologies sur mesure pour les entreprises. Création de sites web, développement d'outils SaaS, solutions digitales personnalisées, e-réputation et conformité RGPD.",
    {
      path: "/",
      keywords: "éditeur nouvelles technologies, création site web sur mesure, développement SaaS, agence digitale, solutions digitales entreprises, NERVÜR, e-réputation, conformité RGPD",
      imageAlt: "NERVÜR — Éditeur de Nouvelles Technologies sur Mesure",
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
    "description": "Éditeur de nouvelles technologies sur mesure. Création de sites web, outils SaaS et solutions digitales personnalisées pour les entreprises.",
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
    "knowsAbout": ["E-réputation", "Conformité juridique", "RGPD", "Audit web", "SEO", "Monitoring", "SaaS pour PME"]
  });

  // WebSite structured data with SearchAction
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NERVÜR",
    "url": "https://nervur.fr",
    "description": "Outils SaaS pour PME : e-réputation, conformité juridique, RGPD, audit web et monitoring",
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
    "offers": { "@type": "Offer", "price": "39", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31" }
  });

  // SoftwareApplication structured data — Vault
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NERVÜR Vault",
    "description": "Agent Juridique IA pour TPE/PME. Assistant IA RGPD, registre des traitements, audit d'impact CNIL, gestion des droits (DSAR), générateur de documents légaux pré-remplis, veille juridique automatisée.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://nervur.fr/vault",
    "offers": { "@type": "Offer", "price": "79", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31" }
  });

  // Oscillating hero values
  const perfScore = useOscillate(98, 2, 3000);
  const convRate = useOscillate(4.8, 0.4, 2800);
  const trafficGrowth = useOscillate(147, 12, 3200);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 200);
  }, []);

  const [navScrolled, setNavScrolled] = useState(false);

  // Back to top + nav scroll state
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 600);
      setNavScrolled(window.scrollY > 100);
    };
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
      background: "#FFFFFF", color: "#0A2540", fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
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
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scanLine {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes spin3d {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes earthScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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
          50% { box-shadow: 0 0 12px rgba(0,0,0,0.08); }
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
        .hover-card:hover { transform: translateY(-8px); border-color: rgba(99,91,255,0.35) !important; box-shadow: 0 20px 60px rgba(99,91,255,0.08); }
        .escriba-card { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .escriba-card:hover { border-color: ${VG(0.25)} !important; box-shadow: 0 12px 40px ${VG(0.1)}; }
        .escriba-card:hover .escriba-img { transform: scale(1.05); opacity: 1 !important; }
        .hover-glow:hover { box-shadow: 0 0 30px rgba(99,91,255,0.12), inset 0 0 30px rgba(99,91,255,0.04); }
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
        .bento-card:hover { transform: translateY(-6px) scale(1.01); border-color: rgba(99,91,255,0.35) !important; box-shadow: 0 24px 80px rgba(99,91,255,0.08); }
        .chrome-btn {
          position: relative; overflow: hidden; cursor: pointer;
          background: linear-gradient(135deg, #e8e8e8 0%, #b0b0b0 40%, #d6d6d6 60%, #a0a0a0 100%);
          color: #18181b; font-weight: 700; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
          padding: 12px 28px; border: none; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: inset 0 1px 0 rgba(0,0,0,0.25), inset 0 -1px 0 rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, box-shadow;
          backface-visibility: hidden;
          -webkit-font-smoothing: subpixel-antialiased;
        }
        .chrome-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #f0f0f0 0%, #c0c0c0 40%, #e0e0e0 60%, #b0b0b0 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.1);
        }
        .chrome-btn::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent);
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
        padding: isMobile ? "14px 20px" : "24px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        boxShadow: "none",
        transition: "all 0.6s ease",
        opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(-20px)" }}>
        <LogoNervur height={52} onClick={() => navigate("/")} />
        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "36px", alignItems: "center" }}>
            {[
              { label: "Services", id: "services" },
              { label: "Outils", id: "outils" },
              { label: "Projets", id: "projets" },
              { label: "Approche", id: "approche" },
            ].map((item, i) => (
              <span key={i} className="nav-link" style={{ fontSize: "14px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#6B7C93", cursor: "pointer", transition: "color 0.3s" }}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                onMouseEnter={e => { e.target.style.color = "#0A2540"; }}
                onMouseLeave={e => { e.target.style.color = "#6B7C93"; }}>
                {item.label}
              </span>
            ))}
            {/* Blog nav link */}
            <span className="nav-link" style={{ fontSize: "14px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#6B7C93", cursor: "pointer", transition: "color 0.3s" }}
              onClick={() => navigate('/blog')}
              onMouseEnter={e => { e.target.style.color = "#0A2540"; }}
              onMouseLeave={e => { e.target.style.color = "#6B7C93"; }}>
              Blog
            </span>
            {/* Apps dropdown removed */}
            {/* Bouton Espace Client */}
            <a href="/app/login" style={{
              padding: "12px 28px", fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase",
              fontWeight: 700, color: "#FFFFFF", background: "#0A2540", border: "none", borderRadius: "6px",
              cursor: "pointer", textDecoration: "none", transition: "all 0.3s",
              fontFamily: "inherit", marginLeft: "12px"
            }}
              onMouseEnter={e => { e.target.style.background = A1; e.target.style.boxShadow = "0 4px 20px rgba(99,91,255,0.3)"; }}
              onMouseLeave={e => { e.target.style.background = "#0A2540"; e.target.style.boxShadow = "none"; }}>
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
          background: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px",
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
              {[
                { label: "Sentinel", path: "/sentinel" },
                { label: "Vault", path: "/contact" },
              ].map((app, i) => (
                <span key={i} onClick={() => { navigate(app.path); setMenuOpen(false); setMobileAppsOpen(false); }} style={{
                  fontSize: "14px", letterSpacing: "2px", color: V3, cursor: "pointer", padding: "6px 0",
                  transition: "color 0.3s", textAlign: "center" }}
                  onTouchStart={e => { e.currentTarget.style.color = V; }}
                  onTouchEnd={e => { e.currentTarget.style.color = V3; }}>
                  {app.label}
                </span>
              ))}
            </div>
          </div>
          {/* Bouton Espace Client mobile */}
          <a href="/app/login" onClick={() => setMenuOpen(false)} style={{
            padding: "12px 32px", fontSize: "13px", letterSpacing: "3px", textTransform: "uppercase",
            fontWeight: 700, color: "#FFFFFF", background: "#0A2540", border: "none", borderRadius: "8px",
            cursor: "pointer", textDecoration: "none", transition: "all 0.3s",
            fontFamily: "inherit", marginTop: "16px"
          }}>
            Espace Client
          </a>
        </div>
      )}

      <main>
      {/* ═══ HERO — Dark immersive with canvas + 3D ═══ */}
      <section aria-label="Accueil" style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: isMobile ? "100px 20px 60px" : "0 48px", position: "relative", overflow: "hidden",
        background: "#000000",
      }}>
        {/* Interactive particle canvas */}
        {!isMobile && <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "default" }}
          onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }; }}
          onMouseLeave={() => { mouseRef.current = { x: -1000, y: -1000 }; }}
        />}
        {/* Scan line removed */}

        {/* Earth — static photo with float */}
        {!isMobile && <div style={{
          position: "absolute", left: "-8%", bottom: "-15%", width: "45%", maxWidth: "550px",
          aspectRatio: "1", borderRadius: "50%", overflow: "hidden",
          boxShadow: "none",
          animation: "floatUp 20s ease-in-out infinite", pointerEvents: "none", zIndex: 0,
        }}>
          <img src="/planet.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
        </div>}

        {/* Moon — top right, smaller */}
        {!isMobile && <div style={{
          position: "absolute", right: "2%", top: "8%", width: "18%", maxWidth: "220px",
          aspectRatio: "1", borderRadius: "50%", overflow: "hidden",
          boxShadow: "none",
          animation: "floatUp 25s ease-in-out 3s infinite", pointerEvents: "none", zIndex: 0,
        }}>
          <img src="/moon.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
        </div>}

        {/* Scroll indicator — bouncing arrow */}
        <div style={{
          position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 10,
          animation: "fadeInUp 1s ease 1.5s both",
        }}>
          <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Scroll</span>
          <div style={{ animation: "scrollBounce 2s ease-in-out infinite" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "0" : "60px", alignItems: "center", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>

          {/* Left — Text */}
          <div style={{ position: "relative", zIndex: 5 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              marginBottom: "32px", animation: loaded ? "fadeInUp 0.6s ease 0.2s both" : "none" }}>
              <span style={{ fontSize: "13px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                NERVÜR
              </span>
              <span style={{ width: "4px", height: "4px", background: "#635BFF", borderRadius: "50%" }} />
              <span style={{ fontSize: "13px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                Agence Digitale
              </span>
            </div>
            <div style={{ marginBottom: "28px", animation: loaded ? "fadeInUp 0.8s ease 0.4s both" : "none" }}>
              <TextReveal>
                <h1 style={{ fontSize: "clamp(38px, 5.5vw, 74px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2.5px", color: "#FFFFFF" }}>
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
              fontSize: "17px", lineHeight: 1.8, color: "rgba(255,255,255,0.6)", maxWidth: "520px",
              marginBottom: "44px",
              animation: loaded ? "fadeInUp 0.8s ease 0.6s both" : "none" }}>
              NERVÜR conçoit les stratégies digitales qui rendent votre entreprise pérenne grâce à internet. Une vision. Zéro compromis.
            </p>
            <div style={{
              display: "flex", gap: "16px", flexDirection: isMobile ? "column" : "row",
              animation: loaded ? "fadeInUp 0.8s ease 0.8s both" : "none" }}>
              <MagneticButton className="cta-btn"
                onMouseEnter={(e) => triggerShootingStar(e, "down")}
                onClick={(e) => { triggerShootingStar(e, "down"); navigate('/contact'); }}
                style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
                padding: isMobile ? "16px 28px" : "18px 44px", border: "none",
                background: "#FFFFFF",
                color: "#000000", fontSize: "14px", fontWeight: 700, letterSpacing: "1px",
                textTransform: "uppercase", cursor: "pointer", borderRadius: "8px" }}>
                Nous contacter
              </MagneticButton>
              <MagneticButton className="cta-btn"
                onMouseEnter={(e) => triggerShootingStar(e, "up")}
                onClick={(e) => { triggerShootingStar(e, "up"); document.getElementById('services')?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
                padding: isMobile ? "16px 28px" : "18px 44px", border: "1px solid rgba(255,255,255,0.25)",
                color: "#FFFFFF", fontSize: "14px", fontWeight: 600, letterSpacing: "1px",
                textTransform: "uppercase", cursor: "pointer", background: "transparent", borderRadius: "8px" }}>
                Nos services
              </MagneticButton>
            </div>
          </div>

          {/* Right — Dark glass mockup + floating cards */}
          <div style={{ position: "relative", height: "560px", paddingTop: "20px", animation: loaded ? "fadeInUp 1s ease 0.6s both" : "none", display: isMobile ? "none" : "block" }}>

            {/* Main browser mockup — dark glass */}
            <div style={{
              position: "absolute", top: "50px", left: "20px", right: "20px",
              transform: "perspective(1200px) rotateY(-8deg) rotateX(2deg)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
              background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)",
              overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              animation: loaded ? "floatUp 8s ease-in-out infinite" : "none" }}>
              {/* Browser bar */}
              <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF5F57" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FEBC2E" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#28C840" }} />
                <div style={{ flex: 1, marginLeft: "12px", height: "22px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", paddingLeft: "10px" }}>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>nervur.fr/dashboard</span>
                </div>
              </div>
              {/* Dashboard content — dark */}
              <div style={{ padding: "24px", minHeight: "220px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ width: "80px", height: "10px", borderRadius: "3px", background: "rgba(255,255,255,0.1)" }} />
                  <div style={{ display: "flex", gap: "12px" }}>
                    {[50, 40, 60].map((w, i) => <div key={i} style={{ width: `${w}px`, height: "8px", borderRadius: "3px", background: "rgba(255,255,255,0.05)" }} />)}
                  </div>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ width: "70%", height: "18px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", marginBottom: "8px" }} />
                  <div style={{ width: "45%", height: "18px", borderRadius: "3px", background: "rgba(255,255,255,0.05)" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "20px" }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height: "80px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating card 1 — Performance — dark glass */}
            <div style={{
              position: "absolute", bottom: "80px", left: "-20px", zIndex: 10,
              padding: "18px 22px", borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              animation: loaded ? "floatUp 6s ease-in-out 0.3s infinite" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <svg width="44" height="44" aria-hidden="true" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#4ADE80" strokeWidth="2.5"
                      strokeDasharray={`${2 * Math.PI * 18 * (perfScore / 100)} ${2 * Math.PI * 18}`} strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 0.8s ease" }} />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#FFFFFF", transition: "all 0.5s" }}>{Math.round(perfScore)}</span>
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>Performance</div>
                  <div style={{ fontSize: "10px", color: "#4ADE80" }}>Core Web Vitals</div>
                </div>
              </div>
            </div>

            {/* Floating card 2 — Growth — dark glass */}
            <div style={{
              position: "absolute", top: "60px", right: "-10px", zIndex: 10,
              padding: "14px 18px", borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
              animation: loaded ? "floatUp 7s ease-in-out 0.8s infinite" : "none" }}>
              <span style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px" }}>Trafic organique</span>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "#4ADE80", transition: "all 0.6s" }}>+{Math.round(trafficGrowth)}%</span>
            </div>

            {/* Floating card 3 — Conversion — dark glass */}
            <div style={{
              position: "absolute", bottom: "20px", right: "10px", zIndex: 10,
              padding: "14px 18px", borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
              animation: loaded ? "floatUp 5s ease-in-out 1.2s infinite" : "none" }}>
              <span style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px" }}>Conversion</span>
              <span style={{ fontSize: "22px", fontWeight: 800, color: A1, transition: "all 0.6s" }}>{convRate.toFixed(1)}%</span>
            </div>

          </div>

        </div>

        {/* Old scroll indicator removed — using new bouncing arrow */}
      </section>

      {/* ═══ SERVICES & OFFRES — TABBED ═══ */}
      {/* Accent divider — indigo */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />
      <section id="services" aria-label="Nos services" className="fade-section" style={{ padding: isMobile ? "60px 20px" : "120px 48px", background: "#F6F9FC" }}>
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
              color: activeTab === i ? "#FFFFFF" : "#6B7C93",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
              onMouseEnter={e => { if (activeTab !== i) { e.currentTarget.style.borderColor = VG(0.4); e.currentTarget.style.color = V; } }}
              onMouseLeave={e => { if (activeTab !== i) { e.currentTarget.style.borderColor = VG(0.15); e.currentTarget.style.color = "#6B7C93"; } }}>
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
                  border: "none", borderRadius: "16px",
                  background: "linear-gradient(145deg, #1E1E2E 0%, #2A1F4E 50%, #1E1E2E 100%)",
                  color: "#FFFFFF",
                  position: "relative", overflow: "hidden",
                  display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "24px" : "32px", alignItems: "flex-start",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"; setHoveredProduct(null); }}>
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
                      <h3 style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px", marginBottom: "12px", color: "#FFFFFF" }}>Applications & Outils Métiers</h3>
                      <p style={{ fontSize: "14px", lineHeight: 1.8, color: "rgba(255,255,255,0.6)" }}>
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
                  border: "none", borderRadius: "16px",
                  background: "linear-gradient(145deg, #0A2540 0%, #0D3B66 50%, #0A2540 100%)",
                  color: "#FFFFFF",
                  position: "relative", overflow: "hidden", display: "flex", flexDirection: "column",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"; }}>
                  <div style={{
                    position: "absolute", top: "-1px", left: "40px", right: "40px", height: "2px",
                    background: `linear-gradient(90deg, transparent, #06b6d4, transparent)` }} />
                  <ChromeIcon type="browser" size={isMobile ? 32 : 40} />
                  <div style={{ marginTop: "20px" }}>
                    <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                      Design & Performance
                    </span>
                    <h3 style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px", marginBottom: "12px", color: "#FFFFFF" }}>Site Vitrine</h3>
                    <p style={{ fontSize: "14px", lineHeight: 1.8, color: "rgba(255,255,255,0.6)" }}>
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
                border: "none", borderRadius: "16px",
                background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
                color: "#FFFFFF",
                position: "relative", overflow: "hidden",
                display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "20px" : "40px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"; }}>
                <ChromeIcon type="gauge" size={isMobile ? 32 : 40} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "6px", color: "#FFFFFF" }}>Optimisation & Performance</h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", margin: 0 }}>
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
                  padding: "40px 36px", border: "none", borderRadius: "16px",
                  background: "linear-gradient(145deg, #1E1E2E 0%, #252540 100%)",
                  color: "#FFFFFF",
                  position: "relative", overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)";
                    e.currentTarget.querySelector('.tab-line').style.transform = "scaleY(1)";
                    e.currentTarget.querySelector('.tab-line').style.opacity = "1";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
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
                  <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#6B7C93", marginBottom: "20px" }}>{c.desc}</p>
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
      {/* Accent divider — red/cyan */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.25), rgba(6,182,212,0.25), transparent)" }} />
      <section id="outils" aria-label="Nos outils" className="fade-section" style={{ padding: isMobile ? "60px 20px" : "120px 48px", background: "#F6F9FC" }}>
        <RevealSection>
          <div style={{ textAlign: "center", marginBottom: isMobile ? "30px" : "60px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: V2, display: "block", marginBottom: "16px" }}>
              // Nos outils
            </span>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
              Des outils <span style={{ background: `linear-gradient(135deg, #ef4444, #06b6d4)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>puissants</span> pour votre business.
            </h2>
            <p style={{ fontSize: "16px", color: "#6B7C93", marginTop: "16px", maxWidth: "560px", margin: "16px auto 0" }}>
              Deux outils SaaS conçus pour les TPE/PME. Simples, efficaces, sans engagement.
            </p>
          </div>
        </RevealSection>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(2, 1fr)", gap: isMobile ? "12px" : "24px", maxWidth: "1100px", margin: "0 auto" }}>

          {/* Sentinel */}
          <RevealSection delay={0}>
            <div style={{
              border: "none", borderRadius: "20px", padding: isMobile ? "16px 14px" : "36px 32px",
              position: "relative", overflow: "hidden", height: "100%",
              background: "linear-gradient(145deg, #1a1a2e 0%, #2d1b4e 40%, #1a1a2e 100%)",
              color: "#FFFFFF",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(239,68,68,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.15)"; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #ef4444, #f97316)" }} />
              <div style={{ width: isMobile ? "36px" : "44px", height: isMobile ? "36px" : "44px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: isMobile ? "12px" : "20px" }}>
                <svg width={isMobile ? "18" : "22"} height={isMobile ? "18" : "22"} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 style={{ fontSize: isMobile ? "18px" : "24px", fontWeight: 800, marginBottom: "4px", color: "#FFFFFF" }}>Sentinel</h3>
              <p style={{ fontSize: isMobile ? "11px" : "13px", color: "#ef4444", fontWeight: 600, marginBottom: isMobile ? "8px" : "12px", letterSpacing: "0.5px" }}>E-réputation & gestion des avis</p>
              {!isMobile && <p style={{ fontSize: "13px", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", marginBottom: "20px" }}>
                Surveillez vos avis Google en temps réel, répondez automatiquement par IA et analysez les tendances de votre e-réputation.
              </p>}
              {isMobile && <button onClick={(e) => { e.stopPropagation(); setExpandedTool(expandedTool === "sentinel" ? null : "sentinel"); }} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", fontSize: "12px", fontWeight: 700, cursor: "pointer", padding: "6px 12px", marginBottom: "8px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "5px", width: "100%", justifyContent: "center" }}>
                {expandedTool === "sentinel" ? "Réduire ▲" : "En savoir + ▼"}
              </button>}
              {(expandedTool === "sentinel" || !isMobile) && <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: isMobile ? "6px" : "10px", ...(isMobile ? { animation: "fadeInUp 0.3s ease-out" } : {}) }}>
                {["Surveillance avis Google", "Réponses IA automatiques", "Analyse sémantique", "Veille concurrentielle", "QR Code + Widget + Alertes"].map((f, i) => (
                  <li key={i} style={{ fontSize: isMobile ? "11px" : "13px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width={isMobile ? "12" : "14"} height={isMobile ? "12" : "14"} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>}
              <div style={{ marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: isMobile ? "12px" : "20px" }}>
                  <span style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: 800, color: "#FFFFFF" }}>39€</span>
                  <span style={{ fontSize: isMobile ? "12px" : "14px", color: "#6B7C93" }}>/mois</span>
                </div>
                <button onClick={() => navigate("/contact")} style={{ width: "100%", padding: isMobile ? "10px" : "12px", background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", borderRadius: "10px", color: "#fff", fontSize: isMobile ? "12px" : "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.3s", marginBottom: "8px" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(239,68,68,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  Commencer
                </button>
              </div>
            </div>
          </RevealSection>

          {/* Vault */}
          <RevealSection delay={240}>
            <div style={{
              border: "none", borderRadius: "20px", padding: isMobile ? "16px 14px" : "36px 32px",
              position: "relative", overflow: "hidden", height: "100%",
              background: "linear-gradient(145deg, #0a2540 0%, #0d3b66 40%, #0a2540 100%)",
              color: "#FFFFFF",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(6,182,212,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.15)"; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #06b6d4, #22d3ee)" }} />
              <div style={{ width: isMobile ? "36px" : "44px", height: isMobile ? "36px" : "44px", borderRadius: "12px", background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: isMobile ? "12px" : "20px" }}>
                <svg width={isMobile ? "18" : "22"} height={isMobile ? "18" : "22"} viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 style={{ fontSize: isMobile ? "18px" : "24px", fontWeight: 800, marginBottom: "4px", color: "#FFFFFF" }}>Vault</h3>
              <p style={{ fontSize: isMobile ? "11px" : "13px", color: "#06b6d4", fontWeight: 600, marginBottom: isMobile ? "8px" : "12px", letterSpacing: "0.5px" }}>Agent Juridique IA — Conformité & Protection juridique</p>
              {!isMobile && <p style={{ fontSize: "13px", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", marginBottom: "20px" }}>
                Votre DPO virtuel : assistant IA RGPD, registre des traitements, audit d'impact CNIL, gestion des droits, générateur de documents légaux pré-remplis et veille juridique automatisée.
              </p>}
              {isMobile && <button onClick={(e) => { e.stopPropagation(); setExpandedTool(expandedTool === "vault" ? null : "vault"); }} style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.4)", color: "#06b6d4", fontSize: "12px", fontWeight: 700, cursor: "pointer", padding: "6px 12px", marginBottom: "8px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "5px", width: "100%", justifyContent: "center" }}>
                {expandedTool === "vault" ? "Réduire ▲" : "En savoir + ▼"}
              </button>}
              {(expandedTool === "vault" || !isMobile) && <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: isMobile ? "6px" : "10px", ...(isMobile ? { animation: "fadeInUp 0.3s ease-out" } : {}) }}>
                {["Assistant IA RGPD (NOÉ) — réponses instantanées", "Générateur de documents légaux pré-remplis", "Registre des traitements automatisé", "Audit d'impact (AIPD) conforme CNIL", "Gestion des droits des personnes (DSAR)", "Veille juridique automatisée"].map((f, i) => (
                  <li key={i} style={{ fontSize: isMobile ? "11px" : "13px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width={isMobile ? "12" : "14"} height={isMobile ? "12" : "14"} viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>}
              <div style={{ marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: isMobile ? "12px" : "20px" }}>
                  <span style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: 800, color: "#FFFFFF" }}>79€</span>
                  <span style={{ fontSize: isMobile ? "12px" : "14px", color: "rgba(255,255,255,0.5)" }}>/mois</span>
                </div>
                <button onClick={() => navigate("/contact")} style={{ width: "100%", padding: isMobile ? "10px" : "12px", background: "linear-gradient(135deg, #06b6d4, #22d3ee)", border: "none", borderRadius: "10px", color: "#fff", fontSize: isMobile ? "12px" : "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.3s", marginBottom: "8px" }}
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
            <p style={{ fontSize: "16px", color: "#6B7C93", marginTop: "16px", maxWidth: "500px", margin: "16px auto 0" }}>
              Pas de surprise, pas d'engagement. Annulez quand vous voulez.
            </p>
          </div>
        </RevealSection>

        {/* Individual tools */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "20px", marginBottom: "40px" }}>
          {/* Sentinel */}
          <RevealSection delay={0}>
            <div style={{ border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px", padding: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #ef4444, #f97316)" }} />
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>Sentinel</h3>
              <p style={{ fontSize: "13px", color: "#ef4444", fontWeight: 500, marginBottom: "16px" }}>E-réputation</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                <span style={{ fontSize: "40px", fontWeight: 800 }}>39€</span>
                <span style={{ fontSize: "14px", color: "#6B7C93" }}>/mois</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Surveillance avis Google", "Réponses IA automatiques", "Analyse sémantique", "Veille concurrentielle", "QR Code + Widget + Alertes", "Rapports PDF"].map((f, i) => (
                  <li key={i} style={{ fontSize: "13px", color: "#6B7C93", display: "flex", alignItems: "center", gap: "8px" }}>
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

          {/* Vault */}
          <RevealSection delay={240}>
            <div style={{ border: "1px solid rgba(6,182,212,0.2)", borderRadius: "16px", padding: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #06b6d4, #22d3ee)" }} />
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>Vault</h3>
              <p style={{ fontSize: "13px", color: "#06b6d4", fontWeight: 500, marginBottom: "16px" }}>Agent Juridique IA — Conformité & Protection juridique</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                <span style={{ fontSize: "40px", fontWeight: 800 }}>79€</span>
                <span style={{ fontSize: "14px", color: "#6B7C93" }}>/mois</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Assistant IA RGPD (NOÉ) — réponses instantanées", "Générateur de documents légaux pré-remplis", "Registre des traitements automatisé", "Audit d'impact (AIPD) conforme CNIL", "Gestion des droits des personnes (DSAR)", "Veille juridique automatisée"].map((f, i) => (
                  <li key={i} style={{ fontSize: "13px", color: "#6B7C93", display: "flex", alignItems: "center", gap: "8px" }}>
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
                <span style={{ fontSize: "36px", fontWeight: 800 }}>99€</span>
                <span style={{ fontSize: "14px", color: "#6B7C93" }}>/mois</span>
                <span style={{ fontSize: "13px", color: "#6B7C93", textDecoration: "line-through", marginLeft: "8px" }}>118€</span>
              </div>
              <p style={{ fontSize: "13px", color: "#6B7C93", marginBottom: "20px" }}>Economisez 19% en combinant 2 outils.</p>
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
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginTop: "8px" }}>Les 2 outils</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "16px 0" }}>
                <span style={{ fontSize: "36px", fontWeight: 800 }}>129€</span>
                <span style={{ fontSize: "14px", color: "#6B7C93" }}>/mois</span>
                <span style={{ fontSize: "13px", color: "#6B7C93", textDecoration: "line-through", marginLeft: "8px" }}>148€</span>
              </div>
              <p style={{ fontSize: "13px", color: "#6B7C93", marginBottom: "20px" }}>Sentinel + Vault. Économisez sur le pack complet.</p>
              <button onClick={() => navigate("/contact")} style={{ padding: "10px 24px", background: `linear-gradient(135deg, ${A1}, ${A3})`, border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Tout prendre
              </button>
            </div>
          </div>
        </RevealSection>
      </section>}

      {/* Technologies section moved to /technologies page */}

      {/* ═══ PORTFOLIO — BENTO GRID (2+2+3) + CODENAMES ═══ */}
      {/* Accent divider — green */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.25), transparent)" }} />
      <section id="projets" aria-label="Nos projets" className="fade-section" style={{ padding: isMobile ? "60px 20px" : "100px 48px" }}>
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
          {/* Nouveau projet — teaser card */}
          <RevealSection delay={100}>
            <div style={{
              background: "linear-gradient(145deg, #0c0e18 0%, #141828 40%, #1a1040 100%)",
              minHeight: isMobile ? "160px" : "auto",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "24px 20px", borderRadius: "16px",
              position: "relative", overflow: "hidden",
              border: "1px solid rgba(99,102,241,0.12)",
            }}>
              {/* Animated background particles */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{
                    position: "absolute",
                    width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
                    borderRadius: "50%",
                    background: i % 3 === 0 ? "#635BFF" : i % 3 === 1 ? "#635BFF" : "#7A73FF",
                    left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%`,
                    opacity: 0.15 + Math.random() * 0.25,
                    animation: `nervur-float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite alternate`,
                  }} />
                ))}
              </div>

              {/* Glowing pulse ring */}
              <div style={{ position: "relative", width: "50px", height: "50px", marginBottom: "14px" }}>
                <div style={{
                  position: "absolute", inset: "-6px", borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                  animation: "nervur-pulse 2.5s ease-in-out infinite",
                }} />
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  border: "2px solid rgba(99,102,241,0.2)",
                }} />
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  border: "2px solid transparent", borderTopColor: "#635BFF", borderRightColor: "#635BFF",
                  animation: "nervur-spin 2s linear infinite",
                }} />
                <div style={{
                  position: "absolute", inset: "6px", borderRadius: "50%",
                  border: "1.5px solid transparent", borderBottomColor: "#7A73FF",
                  animation: "nervur-spin 3s linear infinite reverse",
                }} />
                {/* Center icon */}
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #6366f1, #818CF8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 16px rgba(99,102,241,0.4)",
                }}>
                  <span style={{ color: "white", fontSize: "14px", fontWeight: 900 }}>N</span>
                </div>
              </div>

              {/* Title */}
              <div style={{
                fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase",
                color: "#635BFF", marginBottom: "6px", textAlign: "center",
              }}>
                En construction
              </div>
              <div style={{
                fontSize: "14px", fontWeight: 700, color: "#0A2540", textAlign: "center",
                marginBottom: "4px", lineHeight: 1.3,
              }}>
                Nouveau projet en cours
              </div>
              <div style={{ fontSize: "11px", color: "#6B7C93", textAlign: "center", maxWidth: "200px", lineHeight: 1.5 }}>
                Restez connectés.
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: "16px", width: "110px", height: "2px", borderRadius: "2px", background: "rgba(99,102,241,0.15)", overflow: "hidden" }}>
                <div style={{
                  width: "60%", height: "100%", borderRadius: "2px",
                  background: "linear-gradient(90deg, #6366f1, #818CF8)",
                  animation: "nervur-progress 2s ease-in-out infinite",
                }} />
              </div>

              <style>{`
                @keyframes nervur-spin { to { transform: rotate(360deg); } }
                @keyframes nervur-pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
                @keyframes nervur-float { 0% { transform: translateY(0px); } 100% { transform: translateY(-15px); } }
                @keyframes nervur-progress { 0% { transform: translateX(-100%); } 50% { transform: translateX(0%); } 100% { transform: translateX(100%); } }
              `}</style>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ VALUE STRIP ═══ */}
      {/* Accent divider — purple */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(196,181,253,0.25), transparent)" }} />
      <section aria-label="Pourquoi NERVÜR" style={{ padding: isMobile ? "60px 20px" : "100px 48px", background: "#F6F9FC", position: "relative", overflow: "hidden" }}>
        {/* Background subtle gradient */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(99,91,255,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />

        <RevealSection>
          <div style={{ textAlign: "center", maxWidth: "900px", margin: "0 auto", position: "relative" }}>
            <div style={{ fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "#6B7C93", marginBottom: "24px", fontWeight: 600 }}>Pourquoi NERVUR</div>
            <h2 style={{ fontSize: isMobile ? "28px" : "clamp(36px, 4vw, 52px)", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-1.5px", marginBottom: "48px", color: V }}>
              Des outils qui travaillent.<br />
              <span style={{ color: "#6B7C93" }}>Pas des promesses.</span>
            </h2>
          </div>
        </RevealSection>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? "16px" : "24px", maxWidth: "800px", margin: "0 auto", position: "relative" }}>
          {[
            { title: "Données réelles", desc: "Chaque analyse est basée sur de vraies API — Google PageSpeed, Lighthouse, scraping réel. Zéro simulation, zéro estimation.", accent: "#4ADE80" },
            { title: "Résultats mesurables", desc: "Scores de performance, audits détaillés, signaux concurrentiels — tout est chiffré, sourcé et vérifiable.", accent: "#c084fc" },
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
                <p style={{ fontSize: "13px", lineHeight: 1.8, color: "#6B7C93" }}>{item.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* Témoignage retiré */}

      {/* ═══ PROCESS ═══ */}
      {/* Accent divider — pink */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(244,114,182,0.25), transparent)" }} />
      <section id="approche" aria-label="Notre méthode" className="fade-section" style={{ padding: isMobile ? "60px 20px" : "120px 48px" }}>
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
                <span style={{ fontSize: "40px", fontWeight: 900, color: activeStep === i ? V2 : "#E3E8EE", transition: "color 0.4s", display: "block", marginBottom: "20px", fontFamily: "monospace" }}>
                  {step.num}
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>{step.title}</h3>
                <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#6B7C93", flex: 1 }}>{step.desc}</p>
                {/* durée retirée */}
              </div>
            </RevealSection>
          ))}
        </div>
      </section>


      {/* ═══ CTA FINAL ═══ */}
      {/* Accent divider — indigo */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />
      <section id="contact" aria-label="Nous contacter" className="fade-section" style={{
        padding: isMobile ? "80px 20px" : "140px 48px", background: "rgba(99,102,241,0.015)",
        textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "500px", height: "500px", borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99,91,255,0.06) 0%, rgba(244,114,182,0.02) 30%, transparent 70%)`,
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
            <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#6B7C93", maxWidth: "460px", margin: "0 auto 40px" }}>
              Parlons de votre projet. On écoute, on diagnostique, on vous dit la vérité. Gratuit. Sans engagement.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexDirection: isMobile ? "column" : "row", alignItems: "center" }}>
              <MagneticButton className="cta-btn" onClick={() => navigate('/contact')}
                               style={{
                padding: isMobile ? "16px 32px" : "18px 48px", border: "none",
                background: `linear-gradient(135deg, ${A1}, ${A3})`,
                color: "#FFFFFF", fontSize: isMobile ? "12px" : "14px", fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", cursor: "pointer", display: "inline-block", textAlign: "center" }}>
                Nous contacter →
              </MagneticButton>
              <MagneticButton className="cta-btn" onClick={() => navigate('/contact')}
                               style={{
                padding: isMobile ? "16px 32px" : "18px 48px", border: `1px solid rgba(99,91,255,0.4)`,
                color: V, fontSize: isMobile ? "12px" : "14px", fontWeight: 600, letterSpacing: "1.5px",
                textTransform: "uppercase", cursor: "pointer", background: "transparent", display: "inline-block", textAlign: "center" }}>
                Demander un devis
              </MagneticButton>
            </div>
            {/* ROI/diagnostic links removed */}
          </div>
        </RevealSection>
      </section>

      {/* ═══ TECH MARQUEE — GRILLE TECHNIQUE ═══ */}
      {/* Accent divider — cyan */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)" }} />
      <section aria-label="Technologies utilisées" style={{ padding: "0", overflow: "hidden", background: "rgba(99,91,255,0.03)" }}>
        <div style={{ borderBottom: `1px solid ${VG(0.1)}`, padding: "24px 0", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "48px", animation: "marquee 30s linear infinite", width: "max-content" }}>
            {[...Array(4)].flatMap((_, setIdx) =>
              ["REACT", "NEXT.JS", "FIGMA", "NODE.JS", "TAILWIND", "TYPESCRIPT", "VERCEL", "WORDPRESS"].map((tech, i) => (
                <span key={`t1-${setIdx}-${i}`} style={{
                  fontSize: "13px", letterSpacing: "4px", fontFamily: "monospace",
                  color: "#6B7C93", whiteSpace: "nowrap", padding: "4px 16px", fontWeight: 600 }}>
                  <span style={{ color: "#635BFF", marginRight: "10px", fontSize: "10px" }}>◆</span>
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
          background: V, color: "#FFFFFF", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: "18px", fontWeight: 700,
          opacity: showBackToTop ? 1 : 0,
          transform: showBackToTop ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: showBackToTop ? "auto" : "none",
          boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
          /* mixBlendMode removed — logo is already white */
        }}>
        <span aria-hidden="true">↑</span>
      </button>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "#0A2540", position: "relative", overflow: "hidden" }}>
        {/* Light effect */}
        <div style={{ position: "absolute", top: "-100px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "200px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(99,91,255,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "-80px", left: "30%", width: "300px", height: "150px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ padding: isMobile ? "40px 20px 24px" : "48px 48px 24px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr 1fr 1fr", gap: isMobile ? "32px" : "40px" }}>
          {/* Col 1 — Logo + infos */}
          <div>
            <LogoNervur height={44} onClick={() => navigate("/")} />
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginTop: "12px" }}>Agence Digitale NERVÜR</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}>SIRET : 102 415 916 00018</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}>Saint-Paul-les-Dax, France</p>
          </div>

          {/* Col 2 — Outils */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#FFFFFF", marginBottom: "16px" }}>Outils</p>
            {[
              { name: "Sentinel — E-réputation", path: "/sentinel" },
              { name: "Vault — Agent Juridique IA", path: "/contact" },
            ].map((t, i) => (
              <p key={i} onClick={() => navigate(t.path)} style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 2.2, cursor: "pointer", transition: "color 0.3s" }}
                onMouseEnter={e => e.target.style.color = "#FFFFFF"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>
                {t.name}
              </p>
            ))}
          </div>

          {/* Col 3 — Navigation */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#FFFFFF", marginBottom: "16px" }}>Navigation</p>
            {[
              { name: "Accueil", path: "/" },
              { name: "Technologies", path: "/technologies" },
              { name: "Contact", path: "/contact" },
              { name: "Qui sommes-nous", path: "/qui-sommes-nous" },
            ].map((t, i) => (
              <p key={i} onClick={() => navigate(t.path)} style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 2.2, cursor: "pointer", transition: "color 0.3s" }}
                onMouseEnter={e => e.target.style.color = "#FFFFFF"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>
                {t.name}
              </p>
            ))}
          </div>

          {/* Col 4 — Blog */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#FFFFFF", marginBottom: "16px" }}>Blog</p>
            {[
              { name: "E-réputation PME", path: "/blog/e-reputation" },
              { name: "Guide RGPD", path: "/blog/rgpd-guide" },
              { name: "Registre des traitements", path: "/blog/registre-traitements" },
              { name: "AIPD — Analyse d'impact", path: "/blog/aipd-guide" },
              { name: "Droits des personnes", path: "/blog/droits-personnes-rgpd" },
              { name: "Avis Google", path: "/blog/avis-google" },
            ].map((t, i) => (
              <p key={i} onClick={() => navigate(t.path)} style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 2.2, cursor: "pointer", transition: "color 0.3s" }}
                onMouseEnter={e => e.target.style.color = "#FFFFFF"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>
                {t.name}
              </p>
            ))}
          </div>

          {/* Col 5 — Legal + Contact */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#FFFFFF", marginBottom: "16px" }}>Legal</p>
            {[
              { name: "Mentions legales", path: "/mentions-legales" },
              { name: "Politique de confidentialite", path: "/politique-de-confidentialite" },
              { name: "CGV", path: "/cgv" },
              { name: "Qui sommes-nous", path: "/qui-sommes-nous" },
            ].map((t, i) => (
              <p key={i} onClick={() => navigate(t.path)} style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 2.2, cursor: "pointer", transition: "color 0.3s" }}
                onMouseEnter={e => e.target.style.color = "#FFFFFF"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>
                {t.name}
              </p>
            ))}
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 2.2, marginTop: "8px" }}>contact@nervurpro.com</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ padding: isMobile ? "16px 20px" : "16px 48px", borderTop: `1px solid ${VG(0.06)}`, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.5px" }}>
            NERVUR 2026. Tous droits reserves.
          </span>
          <div style={{ display: "flex", gap: "20px" }}>
            {["LI", "IG", "BH", "DB"].map((s, i) => (
              <span key={i} style={{
                fontSize: "11px", letterSpacing: "2px", color: "rgba(255,255,255,0.3)", cursor: "pointer",
                width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${VG(0.1)}`, transition: "all 0.3s" }}
              onMouseEnter={e => { e.target.style.borderColor = "rgba(99,91,255,0.4)"; e.target.style.color = "#FFFFFF"; }}
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
