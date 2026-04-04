import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

/* ═══════════════════════════════════════════════════════════
   NERVÜR — Landing Page (Refonte Pro)
   Style: Clean, white, professional, luxe
   ═══════════════════════════════════════════════════════════ */

/* ───── Design Tokens ───── */
const C = {
  bg: "#FFFFFF",
  bgAlt: "#F8FAFC",
  text: "#0F172A",
  body: "#334155",
  muted: "#64748B",
  faint: "#94A3B8",
  accent: "#4F46E5",
  accentHover: "#4338CA",
  accentLight: "#EEF2FF",
  border: "#E2E8F0",
  borderHover: "#CBD5E1",
  sentinel: "#DC2626",
  vault: "#0891B2",
  dark: "#0F172A",
};
const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const cardShadow = "0 1px 3px rgba(0,0,0,0.04)";
const cardHoverShadow = "0 12px 32px rgba(0,0,0,0.06)";

/* ───── Hooks ───── */
function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setP(total > 0 ? Math.min((window.scrollY / total) * 100, 100) : 0);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return p;
}

function useJsonLd(data) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);
}

/* ───── Reusable Components ───── */
function RevealSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: `opacity 0.7s ${EASE} ${delay}ms, transform 0.7s ${EASE} ${delay}ms`,
    }}>{children}</div>
  );
}

function useOscillate(base, range, interval) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const iv = setInterval(() => {
      setVal(base + (Math.random() - 0.5) * 2 * range);
    }, interval);
    return () => clearInterval(iv);
  }, [base, range, interval]);
  return val;
}

function AnimatedCounter({ target, suffix = "", prefix = "" }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const iv = setInterval(() => {
          start += step;
          if (start >= target) { setVal(target); clearInterval(iv); }
          else setVal(start);
        }, 35);
        obs.unobserve(el);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

function RotatingWord({ words }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setI(p => (p + 1) % words.length), 2600);
    return () => clearInterval(iv);
  }, [words.length]);
  return (
    <span style={{ display: "inline-block", position: "relative" }}>
      {words.map((w, j) => (
        <span key={j} style={{
          position: j === i ? "relative" : "absolute",
          left: 0, color: C.accent,
          opacity: j === i ? 1 : 0,
          transform: j === i ? "translateY(0)" : "translateY(12px)",
          transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
        }}>{w}</span>
      ))}
    </span>
  );
}

/* Card wrapper with hover lift + accent glow */
function Card({ children, style = {}, hoverLift = true, accentColor, ...props }) {
  const hoverBorder = accentColor ? `${accentColor}40` : C.accent + "30";
  const hoverBg = accentColor ? `${accentColor}04` : C.accentLight;
  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "16px",
        padding: "36px 32px",
        boxShadow: cardShadow,
        transition: `all 0.4s ${EASE}`,
        ...style,
      }}
      onMouseEnter={hoverLift ? e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(79,70,229,0.08)`;
        e.currentTarget.style.borderColor = hoverBorder;
        e.currentTarget.style.background = hoverBg;
      } : undefined}
      onMouseLeave={hoverLift ? e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = cardShadow;
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.background = C.bg;
      } : undefined}
      {...props}
    >{children}</div>
  );
}

function SectionLabel({ children }) {
  return <span style={{ fontSize: "13px", fontWeight: 600, color: C.accent, display: "block", marginBottom: "12px" }}>{children}</span>;
}

function SectionTitle({ children }) {
  return <h2 style={{ fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 700, color: C.text, letterSpacing: "-1px", lineHeight: 1.15, margin: 0 }}>{children}</h2>;
}

function BtnPrimary({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: "14px 32px", background: C.accent, color: "#FFFFFF", border: "none",
      borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer",
      fontFamily: FONT, transition: `all 0.2s ${EASE}`, ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = "translateY(0)"; }}
    >{children}</button>
  );
}

function BtnSecondary({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: "14px 32px", background: "transparent", color: C.body, border: `1.5px solid ${C.border}`,
      borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer",
      fontFamily: FONT, transition: `all 0.2s ${EASE}`, ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.background = C.bgAlt; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "transparent"; }}
    >{children}</button>
  );
}

function CheckItem({ children, color = C.accent }) {
  return (
    <li style={{ fontSize: "15px", color: C.body, display: "flex", alignItems: "center", gap: "10px", lineHeight: 1.6 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      {children}
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function NervurAurora() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrollProgress = useScrollProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedTool, setExpandedTool] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useSEO(
    "NERVÜR — Agence Digitale & Nouvelles Technologies sur Mesure",
    "NERVÜR — Editeur de nouvelles technologies sur mesure pour les entreprises. Creation de sites web, developpement d'outils SaaS, solutions digitales personnalisees, e-reputation et conformite RGPD.",
    {
      path: "/",
      keywords: "editeur nouvelles technologies, creation site web sur mesure, developpement SaaS, agence digitale, solutions digitales entreprises, NERVÜR, e-reputation, conformite RGPD",
      imageAlt: "NERVÜR — Agence Digitale & Nouvelles Technologies sur Mesure",
    }
  );

  useJsonLd({
    "@context": "https://schema.org", "@type": "Organization",
    "name": "NERVÜR", "url": "https://nervur.fr",
    "logo": "https://nervur.fr/logo-nav-clean.png",
    "description": "Editeur de nouvelles technologies sur mesure. Creation de sites web, outils SaaS et solutions digitales personnalisees pour les entreprises.",
    "foundingDate": "2024",
    "areaServed": { "@type": "Country", "name": "France" },
    "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "email": "contact@nervurpro.fr", "url": "https://nervur.fr/contact", "availableLanguage": "French" },
    "knowsAbout": ["E-reputation", "Conformite RGPD", "SaaS pour PME", "Creation de sites web", "SEO"]
  });

  useJsonLd({
    "@context": "https://schema.org", "@type": "WebSite",
    "name": "NERVÜR", "url": "https://nervur.fr",
    "description": "Agence digitale & nouvelles technologies sur mesure", "inLanguage": "fr",
    "potentialAction": { "@type": "SearchAction", "target": "https://nervur.fr/?q={search_term_string}", "query-input": "required name=search_term_string" }
  });

  useJsonLd({
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "NERVÜR Sentinel", "description": "Outil de surveillance et gestion de l'e-reputation pour les PME.",
    "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "url": "https://nervur.fr/sentinel",
    "offers": { "@type": "Offer", "price": "39", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31" }
  });

  useJsonLd({
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "NERVÜR Vault", "description": "Agent Juridique IA pour TPE/PME. Conformite RGPD automatisee.",
    "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "url": "https://nervur.fr/vault",
    "offers": { "@type": "Offer", "price": "79", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31" }
  });

  const perfScore = useOscillate(98, 1.5, 2800);
  const convRate = useOscillate(4.8, 0.3, 3200);
  const trafficGrowth = useOscillate(147, 8, 3000);

  useEffect(() => { setTimeout(() => setLoaded(true), 200); }, []);
  useEffect(() => {
    const h = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const NAV_LINKS = [
    { label: "Services", href: "#services" },
    { label: "Outils", href: "#outils" },
    { label: "Methode", href: "#approche" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  const scrollTo = (id) => {
    setMenuOpen(false);
    if (id.startsWith("/")) { navigate(id); return; }
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: FONT, minHeight: "100vh" }}>

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInScale { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity:1; } 50% { opacity:0.7; } }
        @keyframes countUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; margin: 0; }
        ::selection { background: ${C.accentLight}; color: ${C.accent}; }
      `}</style>

      {/* ═══ Scroll Progress Bar ═══ */}
      <div style={{ position: "fixed", top: 0, left: 0, width: `${scrollProgress}%`, height: "2px", background: C.accent, zIndex: 200, transition: "width 0.1s linear" }} />

      {/* ═══ NAVIGATION ═══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "14px 20px" : "16px 48px",
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <LogoNervur height={isMobile ? 28 : 32} onClick={() => navigate("/")} variant="light" />

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            {NAV_LINKS.map((l, i) => (
              <span key={i} onClick={() => scrollTo(l.href)} style={{
                fontSize: "15px", fontWeight: 500, color: C.muted, cursor: "pointer",
                transition: "color 0.2s",
              }}
                onMouseEnter={e => e.target.style.color = C.text}
                onMouseLeave={e => e.target.style.color = C.muted}
              >{l.label}</span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {!isMobile && (
            <button onClick={() => navigate("/app/login")} style={{
              padding: "10px 24px", background: C.accent, color: "#FFFFFF",
              border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
              cursor: "pointer", fontFamily: FONT, transition: `all 0.2s ${EASE}`,
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.accentHover}
              onMouseLeave={e => e.currentTarget.style.background = C.accent}
            >Espace Client</button>
          )}

          {/* Mobile burger */}
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: "none", border: "none", cursor: "pointer", padding: "4px",
              display: "flex", flexDirection: "column", gap: "5px",
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: "22px", height: "2px", background: C.text, borderRadius: "1px",
                  transition: "all 0.3s", transform: menuOpen ? (i === 0 ? "rotate(45deg) translate(5px,5px)" : i === 2 ? "rotate(-45deg) translate(5px,-5px)" : "scaleX(0)") : "none" }} />
              ))}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
          background: C.bg, padding: "80px 24px 40px",
          display: "flex", flexDirection: "column", gap: "24px",
          animation: "fadeInUp 0.3s ease-out",
        }}>
          {NAV_LINKS.map((l, i) => (
            <span key={i} onClick={() => scrollTo(l.href)} style={{
              fontSize: "20px", fontWeight: 600, color: C.text, cursor: "pointer",
            }}>{l.label}</span>
          ))}
          <button onClick={() => { setMenuOpen(false); navigate("/app/login"); }} style={{
            marginTop: "16px", padding: "16px", background: C.accent, color: "#FFFFFF",
            border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: 600,
            cursor: "pointer", fontFamily: FONT,
          }}>Espace Client</button>
        </div>
      )}


      {/* ═══ HERO ═══ */}
      <section style={{
        padding: isMobile ? "60px 20px 40px" : "100px 48px 80px",
        maxWidth: "1200px", margin: "0 auto",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "40px" : "60px", alignItems: "center",
        }}>
          {/* Left — Text */}
          <div>
            <span style={{
              display: "inline-block", background: C.accentLight, color: C.accent,
              padding: "6px 16px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600,
              marginBottom: "24px",
              animation: loaded ? "fadeInScale 0.6s ease 0.1s both" : "none",
            }}>Agence Digitale & Technologies</span>

            <h1 style={{
              fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700, color: C.text,
              letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "24px",
              animation: loaded ? "fadeInUp 0.7s ease 0.2s both" : "none",
            }}>
              On construit vos<br/>
              outils{" "}
              <RotatingWord words={["digitaux", "sur mesure", "de croissance", "SaaS"]} />
            </h1>

            <p style={{
              fontSize: "18px", color: C.body, lineHeight: 1.7, maxWidth: "480px", marginBottom: "36px",
              animation: loaded ? "fadeInUp 0.7s ease 0.35s both" : "none",
            }}>
              Sites web, applications metiers, outils SaaS — nous concevons les technologies qui font grandir votre entreprise.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", animation: loaded ? "fadeInUp 0.7s ease 0.5s both" : "none" }}>
              <BtnPrimary onClick={() => navigate("/contact")}>Discuter de votre projet</BtnPrimary>
              <BtnSecondary onClick={() => scrollTo("#outils")}>Voir nos outils</BtnSecondary>
            </div>
          </div>

          {/* Right — Product Mockup */}
          <div style={{ animation: loaded ? "fadeInScale 0.8s ease 0.3s both" : "none" }}>
            <div style={{
              borderRadius: "16px", border: `1px solid ${C.border}`, background: C.bgAlt,
              boxShadow: "0 24px 48px rgba(0,0,0,0.08)", overflow: "hidden",
              aspectRatio: "16/10", display: "flex", alignItems: "center", justifyContent: "center",
              transition: `all 0.4s ${EASE}`, position: "relative",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 32px 64px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 24px 48px rgba(0,0,0,0.08)"; }}
            >
              {/* Browser chrome bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "12px 16px",
                background: C.bg, borderBottom: `1px solid ${C.border}`,
                display: "flex", gap: "6px", alignItems: "center" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
                <div style={{ flex: 1, marginLeft: "12px", height: "24px", background: C.bgAlt, borderRadius: "6px", display: "flex", alignItems: "center", paddingLeft: "12px" }}>
                  <span style={{ fontSize: "11px", color: C.faint }}>nervur.fr</span>
                </div>
              </div>
              <div style={{ padding: "52px 20px 20px", position: "relative", width: "100%" }}>
                {/* Mini dashboard header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "0 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 28" fill="none"><path d="M2 26V2L22 26V2" stroke={C.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>NERVÜR Dashboard</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s ease infinite" }} />
                    En ligne
                  </span>
                </div>
                {/* Stats */}
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
                  {[{ n: Math.round(perfScore), l: "Score", c: C.accent }, { n: Math.round(trafficGrowth), l: "Avis", c: "#22c55e" }, { n: "98%", l: "Conforme", c: C.vault }].map((s, i) => (
                    <div key={i} style={{ flex: 1, padding: "10px 8px", background: C.bg, borderRadius: "8px", border: `1px solid ${C.border}`, textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: s.c, transition: "all 0.6s ease" }}>{s.n}</div>
                      <div style={{ fontSize: "10px", color: C.faint, marginTop: "2px" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {/* Mini chart bars */}
                <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: "40px", padding: "0 8px" }}>
                  {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 50, 88].map((h, i) => (
                    <div key={i} style={{
                      flex: 1, borderRadius: "2px",
                      background: h > 80 ? C.accent : h > 60 ? `${C.accent}60` : `${C.accent}30`,
                      height: `${h}%`, transition: `height 0.8s ${EASE} ${i * 50}ms`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: "16px", marginTop: "60px",
        }}>
          {[
            { value: trafficGrowth, display: `+${Math.round(trafficGrowth)}%`, label: "Trafic organique moyen", color: "#22c55e", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
            { value: perfScore, display: `${Math.round(perfScore)}/100`, label: "Score performance", color: C.accent, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
            { value: convRate, display: `${convRate.toFixed(1)}%`, label: "Taux de conversion", color: "#f59e0b", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg> },
          ].map((s, i) => (
            <RevealSection key={i} delay={i * 150}>
              <Card style={{ textAlign: "center", padding: "32px 24px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>{s.icon}</div>
                <div style={{ fontSize: "42px", fontWeight: 700, color: s.color, lineHeight: 1, transition: "all 0.6s ease" }}>
                  {s.display}
                </div>
                <div style={{ fontSize: "14px", color: C.muted, marginTop: "10px", fontWeight: 500 }}>{s.label}</div>
              </Card>
            </RevealSection>
          ))}
        </div>
      </section>


      {/* ═══ SERVICES ═══ */}
      <section id="services" style={{ padding: isMobile ? "60px 20px" : "100px 48px", background: C.bgAlt }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <SectionLabel>Services</SectionLabel>
              <SectionTitle>Ce qu'on fait pour vous</SectionTitle>
            </div>
          </RevealSection>

          {/* Tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "48px" }}>
            {["Developpement", "SEO & Marketing"].map((tab, i) => (
              <button key={i} onClick={() => setActiveTab(i)} style={{
                padding: "10px 28px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                borderRadius: "9999px", fontFamily: FONT, transition: `all 0.3s ${EASE}`,
                background: activeTab === i ? C.accent : "transparent",
                color: activeTab === i ? "#FFFFFF" : C.muted,
                border: activeTab === i ? "none" : `1.5px solid ${C.border}`,
              }}
                onMouseEnter={e => { if (activeTab !== i) e.currentTarget.style.borderColor = C.borderHover; }}
                onMouseLeave={e => { if (activeTab !== i) e.currentTarget.style.borderColor = C.border; }}
              >{tab}</button>
            ))}
          </div>

          {/* Tab 0 — Dev */}
          <div style={{ position: "relative", minHeight: "300px" }}>
            <div style={{
              opacity: activeTab === 0 ? 1 : 0,
              transform: activeTab === 0 ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.5s ${EASE}`,
              pointerEvents: activeTab === 0 ? "auto" : "none",
              position: activeTab === 0 ? "relative" : "absolute", top: 0, left: 0, right: 0,
            }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
                {[
                  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
                    title: "Applications & Outils Metiers", desc: "Dashboards, CRM, configurateurs, plateformes — chaque outil est pense pour simplifier votre quotidien.",
                    tags: ["Dashboards", "CRM", "Configurateurs", "Plateformes"] },
                  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
                    title: "Sites Vitrines", desc: "Des sites rapides, elegants et penses pour convertir. Chaque pixel est optimise pour refleter votre marque.",
                    tags: ["Landing page", "Responsive", "Animations", "SEO-ready"] },
                ].map((c, i) => (
                  <RevealSection key={i} delay={i * 120}>
                    <Card style={{ height: "100%", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "0%", background: C.accent, borderRadius: "0 2px 2px 0", transition: `height 0.4s ${EASE}` }} className="card-accent-bar" />
                      <div style={{ marginBottom: "20px", width: "44px", height: "44px", borderRadius: "12px", background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", transition: `all 0.3s ${EASE}` }}>{c.icon}</div>
                      <h3 style={{ fontSize: "22px", fontWeight: 600, color: C.text, marginBottom: "10px", letterSpacing: "-0.3px" }}>{c.title}</h3>
                      <p style={{ fontSize: "15px", color: C.body, lineHeight: 1.7, marginBottom: "20px" }}>{c.desc}</p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {c.tags.map((t, j) => (
                          <span key={j} style={{ fontSize: "12px", color: C.body, padding: "5px 14px", background: C.bgAlt, borderRadius: "6px", transition: `all 0.2s ${EASE}` }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.accentLight; e.currentTarget.style.color = C.accent; }}
                            onMouseLeave={e => { e.currentTarget.style.background = C.bgAlt; e.currentTarget.style.color = C.body; }}
                          >{t}</span>
                        ))}
                      </div>
                    </Card>
                  </RevealSection>
                ))}
              </div>
              <RevealSection delay={240}>
                <Card style={{ marginTop: "20px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: "24px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 600, color: C.text, marginBottom: "4px" }}>Optimisation & Performance</h3>
                    <p style={{ fontSize: "15px", color: C.body, lineHeight: 1.7, margin: 0 }}>Audit technique, optimisation Core Web Vitals, refactoring. On transforme un site lent en machine de guerre.</p>
                  </div>
                </Card>
              </RevealSection>
            </div>

            {/* Tab 1 — SEO & Marketing */}
            <div style={{
              opacity: activeTab === 1 ? 1 : 0,
              transform: activeTab === 1 ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.5s ${EASE}`,
              pointerEvents: activeTab === 1 ? "auto" : "none",
              position: activeTab === 1 ? "relative" : "absolute", top: 0, left: 0, right: 0,
            }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "20px" }}>
                {[
                  { title: "Referencement Naturel", tag: "SEO", desc: "Positionnez votre site sur les premiers resultats de Google.", points: ["Audit SEO complet", "Optimisation on-page", "Strategie de backlinks", "Suivi de positionnement"] },
                  { title: "Content Marketing", tag: "CONTENU", desc: "Strategie de contenu sur-mesure pour votre cible.", points: ["Calendrier editorial", "Redaction SEO", "Landing pages", "Newsletters"] },
                  { title: "Social Media & Ads", tag: "PUBLICITE", desc: "Gestion de communaute et campagnes publicitaires ultra-ciblees.", points: ["Meta & Google Ads", "Gestion communaute", "Ciblage avance", "Reporting ROI"] },
                  { title: "Webdesign (UX/UI)", tag: "DESIGN", desc: "Navigation simplifiee et optimisation du taux de conversion.", points: ["Wireframes & maquettes", "Tests utilisateurs", "Optimisation CRO", "Design system"] },
                ].map((c, i) => (
                  <Card key={i} style={{ padding: "32px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: C.accent, padding: "3px 10px", background: C.accentLight, borderRadius: "4px", display: "inline-block", marginBottom: "16px" }}>{c.tag}</span>
                    <h3 style={{ fontSize: "20px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>{c.title}</h3>
                    <p style={{ fontSize: "14px", color: C.body, lineHeight: 1.7, marginBottom: "16px" }}>{c.desc}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {c.points.map((p, j) => (
                        <span key={j} style={{ fontSize: "12px", color: C.muted, padding: "4px 10px", background: C.bgAlt, borderRadius: "4px" }}>{p}</span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ OUTILS SaaS ═══ */}
      <section id="outils" style={{ padding: isMobile ? "60px 20px" : "100px 48px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: isMobile ? "30px" : "60px" }}>
              <SectionLabel>Nos outils</SectionLabel>
              <SectionTitle>Des outils <span style={{ color: C.accent }}>puissants</span> pour votre business</SectionTitle>
              <p style={{ fontSize: "16px", color: C.muted, marginTop: "16px", maxWidth: "560px", margin: "16px auto 0" }}>
                Deux outils SaaS conçus pour les TPE/PME. Simples, efficaces, sans engagement.
              </p>
            </div>
          </RevealSection>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "24px" }}>
            {/* Sentinel */}
            <RevealSection delay={0}>
              <Card style={{ position: "relative", overflow: "hidden", height: "100%", padding: isMobile ? "24px 20px" : "36px 32px" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: C.sentinel }} />
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${C.sentinel}10`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.sentinel} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>Sentinel</h3>
                <p style={{ fontSize: "14px", color: C.sentinel, fontWeight: 600, marginBottom: "16px" }}>E-reputation & gestion des avis</p>
                {!isMobile && <p style={{ fontSize: "15px", lineHeight: 1.7, color: C.body, marginBottom: "20px" }}>
                  Surveillez vos avis Google en temps reel, repondez automatiquement par IA et analysez les tendances de votre e-reputation.
                </p>}
                {isMobile && <button onClick={(e) => { e.stopPropagation(); setExpandedTool(expandedTool === "sentinel" ? null : "sentinel"); }} style={{ background: `${C.sentinel}10`, border: `1px solid ${C.sentinel}30`, color: C.sentinel, fontSize: "12px", fontWeight: 600, cursor: "pointer", padding: "8px 12px", marginBottom: "12px", borderRadius: "8px", width: "100%", fontFamily: FONT }}>
                  {expandedTool === "sentinel" ? "Reduire" : "En savoir plus"}
                </button>}
                {(expandedTool === "sentinel" || !isMobile) && <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {["Surveillance avis Google", "Reponses IA automatiques", "Analyse semantique", "Veille concurrentielle", "QR Code + Widget + Alertes"].map((f, i) => (
                    <CheckItem key={i} color={C.sentinel}>{f}</CheckItem>
                  ))}
                </ul>}
                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "36px", fontWeight: 700, color: C.text }}>39€</span>
                    <span style={{ fontSize: "14px", color: C.muted }}>/mois</span>
                  </div>
                  <button onClick={() => navigate("/contact")} style={{
                    width: "100%", padding: "14px", background: C.sentinel, border: "none",
                    borderRadius: "10px", color: "#fff", fontSize: "15px", fontWeight: 600,
                    cursor: "pointer", fontFamily: FONT, transition: `all 0.2s ${EASE}`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(220,38,38,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >Commencer</button>
                </div>
              </Card>
            </RevealSection>

            {/* Vault */}
            <RevealSection delay={150}>
              <Card style={{ position: "relative", overflow: "hidden", height: "100%", padding: isMobile ? "24px 20px" : "36px 32px" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: C.vault }} />
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${C.vault}10`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.vault} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>Vault</h3>
                <p style={{ fontSize: "14px", color: C.vault, fontWeight: 600, marginBottom: "16px" }}>Agent Juridique IA — Conformite RGPD</p>
                {!isMobile && <p style={{ fontSize: "15px", lineHeight: 1.7, color: C.body, marginBottom: "20px" }}>
                  Votre DPO virtuel : assistant IA RGPD, registre des traitements, audit d'impact CNIL, gestion des droits, generateur de documents legaux et veille juridique automatisee.
                </p>}
                {isMobile && <button onClick={(e) => { e.stopPropagation(); setExpandedTool(expandedTool === "vault" ? null : "vault"); }} style={{ background: `${C.vault}10`, border: `1px solid ${C.vault}30`, color: C.vault, fontSize: "12px", fontWeight: 600, cursor: "pointer", padding: "8px 12px", marginBottom: "12px", borderRadius: "8px", width: "100%", fontFamily: FONT }}>
                  {expandedTool === "vault" ? "Reduire" : "En savoir plus"}
                </button>}
                {(expandedTool === "vault" || !isMobile) && <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {["Assistant IA RGPD (NOE)", "Generateur de documents legaux", "Registre des traitements automatise", "Audit d'impact (AIPD) conforme CNIL", "Gestion des droits (DSAR)", "Veille juridique automatisee"].map((f, i) => (
                    <CheckItem key={i} color={C.vault}>{f}</CheckItem>
                  ))}
                </ul>}
                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "36px", fontWeight: 700, color: C.text }}>79€</span>
                    <span style={{ fontSize: "14px", color: C.muted }}>/mois</span>
                  </div>
                  <button onClick={() => navigate("/contact")} style={{
                    width: "100%", padding: "14px", background: C.vault, border: "none",
                    borderRadius: "10px", color: "#fff", fontSize: "15px", fontWeight: 600,
                    cursor: "pointer", fontFamily: FONT, transition: `all 0.2s ${EASE}`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(8,145,178,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >Commencer</button>
                </div>
              </Card>
            </RevealSection>
          </div>
        </div>
      </section>


      {/* ═══ POURQUOI NERVÜR ═══ */}
      <section style={{ padding: isMobile ? "60px 20px" : "100px 48px", background: C.bgAlt }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <SectionLabel>Pourquoi NERVÜR</SectionLabel>
              <SectionTitle>Des outils qui travaillent.<br/><span style={{ color: C.faint }}>Pas des promesses.</span></SectionTitle>
            </div>
          </RevealSection>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "20px" }}>
            {[
              { title: "Des donnees reelles, pas du vent", desc: "Chaque metrique de Sentinel vient de vos vrais avis Google. Chaque document de Vault est genere selon vos vraies donnees entreprise. Zero demo, zero fake." },
              { title: "Des resultats mesurables", desc: "Score de reputation, taux de conformite RGPD, temps de reponse aux avis — tout est chiffre et traçable. Vous voyez exactement ce que vous payez." },
            ].map((v, i) => (
              <RevealSection key={i} delay={i * 120}>
                <Card style={{ position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: C.accent }} />
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>{v.title}</h3>
                  <p style={{ fontSize: "15px", color: C.body, lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ METHODOLOGIE ═══ */}
      <section id="approche" style={{ padding: isMobile ? "60px 20px" : "100px 48px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <SectionLabel>Notre methode</SectionLabel>
              <SectionTitle>4 etapes. 0 surprise.</SectionTitle>
            </div>
          </RevealSection>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: "20px" }}>
            {[
              { n: "1", title: "Comprendre", desc: "On ecoute votre besoin, vos contraintes, vos objectifs. Pas de jargon, pas de slides." },
              { n: "2", title: "Structurer", desc: "Architecture technique, UX, specs fonctionnelles. On pose les fondations avant de coder." },
              { n: "3", title: "Concevoir", desc: "Developpement iteratif avec demos regulieres. Vous voyez l'avancement en temps reel." },
              { n: "4", title: "Deployer", desc: "Mise en production, formation, support. On ne disparait pas apres la livraison." },
            ].map((s, i) => (
              <RevealSection key={i} delay={i * 100}>
                <Card style={{ textAlign: "center", padding: "32px 24px" }}>
                  <div style={{ fontSize: "48px", fontWeight: 700, color: C.accent, lineHeight: 1, marginBottom: "16px" }}>{s.n}</div>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>{s.title}</h3>
                  <p style={{ fontSize: "14px", color: C.body, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ CTA FINAL ═══ */}
      <section style={{ padding: isMobile ? "80px 20px" : "120px 48px", background: C.dark, textAlign: "center" }}>
        <RevealSection>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "20px" }}>
            Votre entreprise merite<br/>une <span style={{ color: "#818CF8" }}>vraie structure</span> digitale.
          </h2>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", maxWidth: "520px", margin: "0 auto 40px", lineHeight: 1.7 }}>
            Pas un devis. Une conversation. Dites-nous ce dont vous avez besoin.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/contact")} style={{
              padding: "16px 40px", background: "#FFFFFF", color: C.dark, border: "none",
              borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer",
              fontFamily: FONT, transition: `all 0.2s ${EASE}`,
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
              onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}
            >Discuter de votre projet</button>
            <button onClick={() => navigate("/diagnostic")} style={{
              padding: "16px 40px", background: "transparent", color: "#FFFFFF",
              border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: "10px",
              fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: FONT,
              transition: `all 0.2s ${EASE}`,
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
            >Diagnostic gratuit</button>
          </div>
        </RevealSection>
      </section>


      {/* ═══ TECH STACK ═══ */}
      <section style={{ padding: "48px 24px", background: C.bgAlt, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: `repeat(${isMobile ? 3 : 6}, 1fr)`, gap: 0 }}>
          {["React", "Next.js", "Node.js", "MongoDB", "Figma", "Railway"].map((t, i) => (
            <div key={i} style={{ textAlign: "center", padding: "16px 8px", fontSize: "13px", fontWeight: 500, color: C.faint }}>{t}</div>
          ))}
        </div>
      </section>


      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: C.dark, padding: isMobile ? "48px 20px 24px" : "64px 48px 32px", color: "rgba(255,255,255,0.5)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? "32px" : "48px" }}>

          {/* Col 1 — Logo & Desc */}
          <div>
            <LogoNervur height={28} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} variant="dark" />
            <p style={{ fontSize: "14px", lineHeight: 1.7, marginTop: "16px", color: "rgba(255,255,255,0.4)" }}>
              Agence digitale & nouvelles technologies sur mesure pour les entreprises.
            </p>
            <p style={{ fontSize: "13px", marginTop: "12px", color: "rgba(255,255,255,0.3)" }}>contact@nervurpro.fr</p>
          </div>

          {/* Col 2 — Outils + Nav */}
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", marginBottom: "16px" }}>Navigation</p>
            {[
              { name: "Sentinel", path: "/sentinel" },
              { name: "Vault", path: "/contact" },
              { name: "Technologies", path: "/technologies" },
              { name: "Contact", path: "/contact" },
              { name: "Diagnostic", path: "/diagnostic" },
            ].map((t, i) => (
              <p key={i} onClick={() => navigate(t.path)} style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 2.2, cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#FFFFFF"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
              >{t.name}</p>
            ))}
          </div>

          {/* Col 3 — Blog */}
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", marginBottom: "16px" }}>Blog</p>
            {[
              { name: "E-reputation PME", path: "/blog/e-reputation" },
              { name: "Guide RGPD", path: "/blog/rgpd-guide" },
              { name: "Registre des traitements", path: "/blog/registre-traitements" },
              { name: "AIPD", path: "/blog/aipd-guide" },
              { name: "Droits des personnes", path: "/blog/droits-personnes-rgpd" },
              { name: "Avis Google", path: "/blog/avis-google" },
            ].map((t, i) => (
              <p key={i} onClick={() => navigate(t.path)} style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 2.2, cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#FFFFFF"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
              >{t.name}</p>
            ))}
          </div>

          {/* Col 4 — Legal */}
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", marginBottom: "16px" }}>Legal</p>
            {[
              { name: "Mentions legales", path: "/mentions-legales" },
              { name: "Confidentialite", path: "/confidentialite" },
              { name: "CGV", path: "/cgv" },
            ].map((t, i) => (
              <p key={i} onClick={() => navigate(t.path)} style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 2.2, cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#FFFFFF"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
              >{t.name}</p>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: "1100px", margin: "48px auto 0", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>NERVÜR {new Date().getFullYear()}. Tous droits reserves.</p>
        </div>
      </footer>


      {/* Back to top */}
      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
          width: "44px", height: "44px", borderRadius: "50%",
          background: C.accent, color: "#FFFFFF", border: "none",
          cursor: "pointer", fontSize: "18px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: `all 0.3s ${EASE}`,
        }}>&#8593;</button>
      )}

    </div>
  );
}
