import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════
   NERVÜR — Landing Page V3
   Gris clair + couleurs vives + animations GSAP + interactif
   ═══════════════════════════════════════════════════════════ */

const C = {
  bg: "#EDEEF0", bgAlt: "#E3E4E8", bgCard: "#FFFFFF",
  text: "#1A1D23", body: "#4A4D55", muted: "#71747C", faint: "#9B9EA6",
  accent: "#6C5CE7", accentHover: "#5A4BD6", accentLight: "rgba(108,92,231,0.1)",
  border: "#D1D3D8", borderHover: "#A8ABB3",
  sentinel: "#FF6B6B", vault: "#00B4D8", green: "#00C48C", amber: "#FFBE0B",
  dark: "#1A1D23", darkCard: "#22252D",
};
const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/* ───── Hooks ───── */
function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => { const h = () => setM(window.innerWidth < 768); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return m;
}

function useOscillate(base, range, interval) {
  const [val, setVal] = useState(base);
  useEffect(() => { const iv = setInterval(() => setVal(base + (Math.random() - 0.5) * 2 * range), interval); return () => clearInterval(iv); }, [base, range, interval]);
  return val;
}

function useJsonLd(data) {
  useEffect(() => { const s = document.createElement("script"); s.type = "application/ld+json"; s.text = JSON.stringify(data); document.head.appendChild(s); return () => { try { document.head.removeChild(s); } catch {} }; }, []);
}

/* ───── Tilt Card ───── */
function TiltCard({ children, style = {}, intensity = 8, className = "" }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateY(-4px)`;
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateY(0)"; };
  return <div ref={ref} className={className} style={{ transition: `transform 0.4s ${EASE}`, ...style }} onMouseMove={handleMove} onMouseLeave={handleLeave}>{children}</div>;
}

/* ───── Animated Counter ───── */
function AnimCounter({ target, suffix = "", prefix = "" }) {
  const ref = useRef(null); const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { let s = 0; const step = Math.max(1, Math.ceil(target / 40)); const iv = setInterval(() => { s += step; if (s >= target) { setVal(target); clearInterval(iv); } else setVal(s); }, 30); obs.unobserve(el); } }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

/* ───── Rotating Word ───── */
function RotatingWord({ words }) {
  const [i, setI] = useState(0);
  useEffect(() => { const iv = setInterval(() => setI(p => (p + 1) % words.length), 2600); return () => clearInterval(iv); }, [words.length]);
  return (
    <span style={{ display: "inline-block", position: "relative" }}>
      {words.map((w, j) => (
        <span key={j} style={{ position: j === i ? "relative" : "absolute", left: 0, opacity: j === i ? 1 : 0, transform: j === i ? "translateY(0)" : "translateY(15px)", transition: `all 0.5s ${EASE}`,
          background: "linear-gradient(135deg, #6C5CE7, #00B4D8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>{w}</span>
      ))}
    </span>
  );
}

/* ───── Marquee ───── */
function Marquee({ items }) {
  return (
    <div style={{ overflow: "hidden", padding: "24px 0" }}>
      <div style={{ display: "flex", gap: "48px", animation: "marquee 25s linear infinite", whiteSpace: "nowrap" }}>
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} style={{ fontSize: "14px", fontWeight: 600, color: C.faint, letterSpacing: "2px", textTransform: "uppercase", flexShrink: 0 }}>
            <span style={{ color: C.accent, marginRight: "12px" }}>◆</span>{t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───── Gradient Blob Background ───── */
function GradientBlobs() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)", filter: "blur(60px)", animation: "blobMove1 15s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "45%", height: "55%", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,180,216,0.12) 0%, transparent 70%)", filter: "blur(60px)", animation: "blobMove2 18s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "30%", right: "20%", width: "30%", height: "40%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,107,0.08) 0%, transparent 70%)", filter: "blur(60px)", animation: "blobMove3 20s ease-in-out infinite" }} />
    </div>
  );
}

/* ───── Section Reveal (GSAP) ───── */
function GsapReveal({ children, delay = 0, y = 40 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    gsap.fromTo(el, { opacity: 0, y }, { opacity: 1, y: 0, duration: 0.8, delay: delay / 1000, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" }
    });
  }, []);
  return <div ref={ref} style={{ opacity: 0 }}>{children}</div>;
}

/* ═══ MAIN COMPONENT ═══ */
export default function NervurAurora() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedTool, setExpandedTool] = useState(null);
  const [showTop, setShowTop] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const perfScore = useOscillate(98, 1.5, 2800);
  const convRate = useOscillate(4.8, 0.3, 3200);
  const trafficGrowth = useOscillate(147, 8, 3000);

  useSEO("NERVÜR — Agence Digitale & Nouvelles Technologies sur Mesure", "NERVÜR — Agence digitale. Creation de sites web, outils SaaS, solutions digitales sur mesure.", { path: "/", keywords: "agence digitale, creation site web, SaaS, NERVÜR, e-reputation, RGPD", imageAlt: "NERVÜR" });
  useJsonLd({ "@context": "https://schema.org", "@type": "Organization", "name": "NERVÜR", "url": "https://nervur.fr", "logo": "https://nervur.fr/logo-nav-clean.png", "description": "Agence digitale & nouvelles technologies sur mesure.", "foundingDate": "2024", "areaServed": { "@type": "Country", "name": "France" }, "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "email": "contact@nervurpro.fr", "url": "https://nervur.fr/contact", "availableLanguage": "French" } });
  useJsonLd({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "NERVÜR Sentinel", "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "url": "https://nervur.fr/sentinel", "offers": { "@type": "Offer", "price": "39", "priceCurrency": "EUR" } });
  useJsonLd({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "NERVÜR Vault", "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "url": "https://nervur.fr/vault", "offers": { "@type": "Offer", "price": "79", "priceCurrency": "EUR" } });

  useEffect(() => { setTimeout(() => setLoaded(true), 300); }, []);
  useEffect(() => { const h = () => setShowTop(window.scrollY > 500); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);

  const NAV = [{ l: "Services", h: "#services" }, { l: "Outils", h: "#outils" }, { l: "Methode", h: "#approche" }, { l: "Blog", h: "/blog" }, { l: "Contact", h: "/contact" }];
  const scrollTo = (id) => { setMenuOpen(false); if (id.startsWith("/")) navigate(id); else document.querySelector(id)?.scrollIntoView({ behavior: "smooth" }); };

  const SERVICES_DEV = [
    { title: "Applications & Outils Metiers", desc: "Dashboards, CRM, configurateurs — chaque outil est pense pour votre quotidien.", tags: ["Dashboards", "CRM", "Plateformes"], color: C.accent },
    { title: "Sites Vitrines & E-commerce", desc: "Des sites rapides, elegants et penses pour convertir vos visiteurs en clients.", tags: ["Landing page", "Responsive", "SEO-ready"], color: C.green },
    { title: "Optimisation & Performance", desc: "Audit technique, Core Web Vitals, refactoring. On transforme un site lent en machine.", tags: ["Audit", "Core Web Vitals", "Refactoring"], color: C.amber },
  ];

  const SERVICES_SEO = [
    { title: "Referencement Naturel", tag: "SEO", desc: "Premiers resultats Google, durablement.", color: C.accent },
    { title: "Content Marketing", tag: "CONTENU", desc: "Articles, landing pages, newsletters — on ecrit ce qui convertit.", color: C.green },
    { title: "Social Media & Ads", tag: "ADS", desc: "Meta, Google Ads, LinkedIn — on maximise votre ROI.", color: C.sentinel },
    { title: "Webdesign UX/UI", tag: "DESIGN", desc: "Navigation simplifiee et optimisation du taux de conversion.", color: C.vault },
  ];

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: FONT, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInScale { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-14px); } }
        @keyframes floatSlow { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes marquee { 0% { transform:translateX(0); } 100% { transform:translateX(-33.33%); } }
        @keyframes blobMove1 { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(30px,-20px) scale(1.05); } 66% { transform:translate(-15px,15px) scale(0.95); } }
        @keyframes blobMove2 { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(-25px,15px) scale(1.08); } 66% { transform:translate(20px,-10px) scale(0.97); } }
        @keyframes blobMove3 { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(15px,20px) scale(1.03); } }
        @keyframes gradientShift { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
        @keyframes scanLine { 0% { top:0; } 100% { top:100%; } }
        ::selection { background: ${C.accentLight}; }
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; margin: 0; }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "12px 20px" : "14px 48px",
        background: "rgba(26,29,35,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <LogoNervur height={isMobile ? 26 : 30} onClick={() => navigate("/")} variant="dark" />
        {!isMobile && (
          <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
            {NAV.map((l, i) => (
              <span key={i} onClick={() => scrollTo(l.h)} style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.55)", cursor: "pointer", transition: "all 0.2s", position: "relative" }}
                onMouseEnter={e => { e.target.style.color = "#fff"; }}
                onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.55)"; }}
              >{l.l}</span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {!isMobile && <button onClick={() => navigate("/app/login")} style={{
            padding: "9px 22px", background: C.accent, color: "#fff", border: "none",
            borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
            fontFamily: FONT, transition: `all 0.3s ${EASE}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(108,92,231,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >Espace Client</button>}
          {isMobile && <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", flexDirection: "column", gap: "5px" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: "20px", height: "2px", background: "#fff", borderRadius: "1px", transition: "all 0.3s", transform: menuOpen ? (i===0?"rotate(45deg) translate(5px,5px)":i===2?"rotate(-45deg) translate(5px,-5px)":"scaleX(0)") : "none" }} />)}
          </button>}
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99, background: C.dark, padding: "80px 24px", display: "flex", flexDirection: "column", gap: "20px", animation: "fadeInUp 0.3s ease" }}>
          {NAV.map((l, i) => <span key={i} onClick={() => scrollTo(l.h)} style={{ fontSize: "22px", fontWeight: 600, color: "#fff", cursor: "pointer" }}>{l.l}</span>)}
          <button onClick={() => { setMenuOpen(false); navigate("/app/login"); }} style={{ marginTop: "16px", padding: "14px", background: C.accent, color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Espace Client</button>
        </div>
      )}

      {/* ═══ HERO — Full screen with animated gradient background ═══ */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "center", textAlign: "center", position: "relative", overflow: "hidden",
        padding: isMobile ? "120px 20px 60px" : "140px 48px 80px",
        background: `linear-gradient(135deg, ${C.dark} 0%, #1E2235 30%, #1A2A3A 60%, ${C.dark} 100%)`,
        backgroundSize: "300% 300%", animation: "gradientShift 12s ease infinite",
      }}>
        <GradientBlobs />

        {/* Scan line effect */}
        <div style={{ position: "absolute", left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${C.accent}40, transparent)`, animation: "scanLine 4s linear infinite", pointerEvents: "none", zIndex: 1 }} />

        {/* Floating particles */}
        {!isMobile && [
          { top: "15%", left: "10%", size: 6, color: C.accent, dur: "5s", delay: "0s" },
          { top: "25%", right: "15%", size: 4, color: C.green, dur: "6s", delay: "1s" },
          { bottom: "30%", left: "20%", size: 5, color: C.sentinel, dur: "4.5s", delay: "0.5s" },
          { bottom: "20%", right: "25%", size: 3, color: C.vault, dur: "5.5s", delay: "2s" },
          { top: "40%", left: "5%", size: 4, color: C.amber, dur: "7s", delay: "1.5s" },
          { top: "60%", right: "8%", size: 5, color: C.accent, dur: "6.5s", delay: "0.8s" },
        ].map((p, i) => (
          <div key={i} style={{ position: "absolute", ...p, width: p.size, height: p.size, borderRadius: "50%", background: p.color, opacity: 0.6, animation: `floatSlow ${p.dur} ease-in-out ${p.delay} infinite`, pointerEvents: "none" }} />
        ))}

        <div style={{ position: "relative", zIndex: 2, maxWidth: "800px" }}>
          <div style={{ animation: loaded ? "fadeInScale 0.6s ease 0.1s both" : "none" }}>
            <span style={{ display: "inline-block", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "8px 20px", borderRadius: "9999px", fontSize: "13px", fontWeight: 500, marginBottom: "28px", backdropFilter: "blur(8px)" }}>
              Agence Digitale & Technologies sur Mesure
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-2px", lineHeight: 1.05, marginBottom: "24px", animation: loaded ? "fadeInUp 0.8s ease 0.2s both" : "none" }}>
            On construit vos<br/>outils <RotatingWord words={["digitaux", "sur mesure", "de croissance", "SaaS"]} />
          </h1>

          <p style={{ fontSize: isMobile ? "16px" : "20px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 40px", animation: loaded ? "fadeInUp 0.8s ease 0.35s both" : "none" }}>
            Sites web, applications metiers, outils SaaS — nous concevons les technologies qui font grandir votre entreprise.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", animation: loaded ? "fadeInUp 0.8s ease 0.5s both" : "none" }}>
            <button onClick={() => navigate("/contact")} style={{
              padding: "16px 36px", background: C.accent, color: "#fff", border: "none",
              borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: FONT,
              transition: `all 0.3s ${EASE}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(108,92,231,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >Discuter de votre projet</button>
            <button onClick={() => scrollTo("#outils")} style={{
              padding: "16px 36px", background: "rgba(255,255,255,0.06)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px",
              fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: FONT,
              transition: `all 0.3s ${EASE}`, backdropFilter: "blur(8px)",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            >Voir nos outils</button>
          </div>
        </div>

        {/* Animated stats floating at bottom of hero */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", gap: isMobile ? "12px" : "20px", marginTop: isMobile ? "40px" : "80px", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "Trafic", value: `+${Math.round(trafficGrowth)}%`, color: C.green, delay: "0s", dur: "5s" },
            { label: "Performance", value: `${Math.round(perfScore)}/100`, color: C.accent, delay: "0.5s", dur: "6s" },
            { label: "Conversion", value: `${convRate.toFixed(1)}%`, color: C.amber, delay: "1s", dur: "5.5s" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: isMobile ? "16px 20px" : "20px 32px", borderRadius: "14px",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)", animation: `float ${s.dur} ease-in-out ${s.delay} infinite`,
              textAlign: "center", minWidth: "120px",
            }}>
              <div style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 700, color: s.color, lineHeight: 1, transition: "all 0.6s" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "6px", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", animation: loaded ? "fadeInUp 0.7s ease 1.2s both" : "none" }}>
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(180deg, rgba(255,255,255,0.3), transparent)", margin: "0 auto" }} />
        </div>
      </section>

      {/* ═══ MARQUEE TECH ═══ */}
      <div style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <Marquee items={["React", "Next.js", "Node.js", "MongoDB", "Figma", "Railway", "Vercel", "TypeScript", "GSAP", "PostgreSQL"]} />
      </div>

      {/* ═══ SERVICES ═══ */}
      <section id="services" style={{ padding: isMobile ? "60px 20px" : "100px 48px", background: C.bg }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <GsapReveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: C.accent, display: "block", marginBottom: "10px" }}>Services</span>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, color: C.text, letterSpacing: "-1px" }}>Ce qu'on fait pour vous</h2>
            </div>
          </GsapReveal>

          {/* Tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "48px" }}>
            {["Developpement", "SEO & Marketing"].map((t, i) => (
              <button key={i} onClick={() => setActiveTab(i)} style={{
                padding: "10px 28px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                borderRadius: "9999px", fontFamily: FONT, transition: `all 0.3s ${EASE}`,
                background: activeTab === i ? C.accent : "transparent", color: activeTab === i ? "#fff" : C.muted,
                border: activeTab === i ? "none" : `1.5px solid ${C.border}`,
              }}>{t}</button>
            ))}
          </div>

          {/* Dev tab */}
          <div style={{ display: activeTab === 0 ? "grid" : "none", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px" }}>
            {SERVICES_DEV.map((s, i) => (
              <GsapReveal key={i} delay={i * 100}>
                <TiltCard style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "32px", cursor: "pointer", height: "100%", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: s.color }} />
                  <h3 style={{ fontSize: "20px", fontWeight: 600, color: C.text, marginBottom: "10px" }}>{s.title}</h3>
                  <p style={{ fontSize: "14px", color: C.body, lineHeight: 1.7, marginBottom: "20px" }}>{s.desc}</p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {s.tags.map((t, j) => <span key={j} style={{ fontSize: "11px", color: s.color, padding: "4px 10px", background: `${s.color}12`, borderRadius: "6px", fontWeight: 500 }}>{t}</span>)}
                  </div>
                </TiltCard>
              </GsapReveal>
            ))}
          </div>

          {/* SEO tab */}
          <div style={{ display: activeTab === 1 ? "grid" : "none", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "20px" }}>
            {SERVICES_SEO.map((s, i) => (
              <GsapReveal key={i} delay={i * 80}>
                <TiltCard style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "32px", cursor: "pointer" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: s.color, padding: "4px 10px", background: `${s.color}12`, borderRadius: "4px", display: "inline-block", marginBottom: "14px" }}>{s.tag}</span>
                  <h3 style={{ fontSize: "20px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>{s.title}</h3>
                  <p style={{ fontSize: "14px", color: C.body, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                </TiltCard>
              </GsapReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OUTILS SaaS ═══ */}
      <section id="outils" style={{ padding: isMobile ? "60px 20px" : "100px 48px", background: C.bgAlt }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <GsapReveal>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: C.accent, display: "block", marginBottom: "10px" }}>Nos outils</span>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, color: C.text, letterSpacing: "-1px" }}>
                Des outils <span style={{ background: `linear-gradient(135deg, ${C.sentinel}, ${C.vault})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>puissants</span> pour votre business
              </h2>
            </div>
          </GsapReveal>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "24px" }}>
            {[
              { name: "Sentinel", sub: "E-reputation & avis", desc: "Surveillez vos avis Google, repondez par IA et analysez votre reputation en ligne.", color: C.sentinel,
                features: ["Surveillance avis Google", "Reponses IA automatiques", "Analyse semantique", "Veille concurrentielle", "QR Code + Widget"], price: "39",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              { name: "Vault", sub: "Agent Juridique IA", desc: "Votre DPO virtuel : conformite RGPD automatisee, documents legaux, registre et veille.", color: C.vault,
                features: ["Assistant IA RGPD (NOE)", "Generateur documents legaux", "Registre des traitements", "Audit AIPD conforme CNIL", "Gestion des droits DSAR"], price: "79",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
            ].map((tool, i) => (
              <GsapReveal key={i} delay={i * 150}>
                <TiltCard intensity={5} style={{
                  background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "20px",
                  padding: isMobile ? "28px 24px" : "40px 36px", position: "relative", overflow: "hidden", cursor: "pointer", height: "100%",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${tool.color}, ${tool.color}80)` }} />
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: tool.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: `0 8px 24px ${tool.color}30` }}>{tool.icon}</div>
                  <h3 style={{ fontSize: "26px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>{tool.name}</h3>
                  <p style={{ fontSize: "14px", color: tool.color, fontWeight: 600, marginBottom: "14px" }}>{tool.sub}</p>
                  <p style={{ fontSize: "15px", color: C.body, lineHeight: 1.7, marginBottom: "20px" }}>{tool.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {tool.features.map((f, j) => (
                      <li key={j} style={{ fontSize: "14px", color: C.body, display: "flex", alignItems: "center", gap: "10px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tool.color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "40px", fontWeight: 700, color: C.text }}>{tool.price}€</span>
                    <span style={{ fontSize: "14px", color: C.muted }}>/mois</span>
                  </div>
                  <button onClick={() => navigate("/contact")} style={{
                    width: "100%", padding: "14px", background: tool.color, border: "none",
                    borderRadius: "12px", color: "#fff", fontSize: "15px", fontWeight: 600,
                    cursor: "pointer", fontFamily: FONT, transition: `all 0.3s ${EASE}`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${tool.color}30`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >Commencer</button>
                </TiltCard>
              </GsapReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ POURQUOI ═══ */}
      <section style={{ padding: isMobile ? "60px 20px" : "100px 48px", background: C.bg }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <GsapReveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: C.accent, display: "block", marginBottom: "10px" }}>Pourquoi NERVÜR</span>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, color: C.text, letterSpacing: "-1px" }}>
                Des outils qui travaillent.<br/><span style={{ color: C.faint }}>Pas des promesses.</span>
              </h2>
            </div>
          </GsapReveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { title: "Donnees reelles", desc: "Chaque metrique vient de vos vrais avis et vraies donnees. Zero demo, zero fake.", color: C.green, icon: "📊" },
              { title: "Resultats mesurables", desc: "Score de reputation, taux de conformite — tout est chiffre et tracable.", color: C.accent, icon: "📈" },
              { title: "Support reactif", desc: "Une question ? On repond sous 24h. Pas un chatbot, une vraie equipe.", color: C.amber, icon: "💬" },
            ].map((v, i) => (
              <GsapReveal key={i} delay={i * 100}>
                <TiltCard style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "32px", cursor: "pointer", height: "100%" }}>
                  <div style={{ fontSize: "32px", marginBottom: "16px" }}>{v.icon}</div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>{v.title}</h3>
                  <p style={{ fontSize: "14px", color: C.body, lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
                </TiltCard>
              </GsapReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ METHODE ═══ */}
      <section id="approche" style={{ padding: isMobile ? "60px 20px" : "100px 48px", background: C.bgAlt }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <GsapReveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: C.accent, display: "block", marginBottom: "10px" }}>Notre methode</span>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, color: C.text, letterSpacing: "-1px" }}>4 etapes. 0 surprise.</h2>
            </div>
          </GsapReveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "20px" }}>
            {[
              { n: "1", title: "Comprendre", desc: "On ecoute votre besoin, vos contraintes, vos objectifs.", color: C.accent },
              { n: "2", title: "Structurer", desc: "Architecture technique, UX, specs fonctionnelles.", color: C.vault },
              { n: "3", title: "Concevoir", desc: "Developpement iteratif avec demos regulieres.", color: C.green },
              { n: "4", title: "Deployer", desc: "Mise en production, formation, support continu.", color: C.amber },
            ].map((s, i) => (
              <GsapReveal key={i} delay={i * 100}>
                <TiltCard style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "28px 24px", textAlign: "center", cursor: "pointer", height: "100%" }}>
                  <div style={{ fontSize: "48px", fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: "14px" }}>{s.n}</div>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>{s.title}</h3>
                  <p style={{ fontSize: "13px", color: C.body, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </TiltCard>
              </GsapReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{
        padding: isMobile ? "80px 20px" : "120px 48px", textAlign: "center",
        background: `linear-gradient(135deg, ${C.dark} 0%, #2D1B69 40%, #1A3A4A 70%, ${C.dark} 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        <GradientBlobs />
        <div style={{ position: "relative", zIndex: 2 }}>
          <GsapReveal>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, color: "#fff", letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "20px" }}>
              Votre entreprise merite<br/>une <span style={{ background: "linear-gradient(135deg, #00C48C, #00B4D8, #6C5CE7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>vraie structure</span> digitale.
            </h2>
            <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.55)", maxWidth: "520px", margin: "0 auto 40px", lineHeight: 1.7 }}>Pas un devis. Une conversation.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/contact")} style={{ padding: "16px 40px", background: "#fff", color: C.dark, border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: FONT, transition: `all 0.3s ${EASE}` }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(255,255,255,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >Discuter de votre projet</button>
              <button onClick={() => navigate("/diagnostic")} style={{ padding: "16px 40px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: FONT, transition: `all 0.3s ${EASE}` }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              >Diagnostic gratuit</button>
            </div>
          </GsapReveal>
        </div>
      </section>

      {/* ═══ MARQUEE BOTTOM ═══ */}
      <div style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}` }}>
        <Marquee items={["E-reputation", "RGPD", "Audit Web", "SEO", "Conformite", "Monitoring", "SaaS", "Sites Web"]} />
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: C.dark, padding: isMobile ? "48px 20px 24px" : "64px 48px 32px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? "32px" : "48px" }}>
          <div>
            <LogoNervur height={28} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} variant="dark" />
            <p style={{ fontSize: "14px", lineHeight: 1.7, marginTop: "16px", color: "rgba(255,255,255,0.4)" }}>Agence digitale & nouvelles technologies sur mesure pour les entreprises.</p>
            <p style={{ fontSize: "13px", marginTop: "12px", color: "rgba(255,255,255,0.3)" }}>contact@nervurpro.fr</p>
          </div>
          {[
            { title: "Navigation", links: [{ n: "Sentinel", p: "/sentinel" }, { n: "Vault", p: "/contact" }, { n: "Technologies", p: "/technologies" }, { n: "Contact", p: "/contact" }] },
            { title: "Blog", links: [{ n: "Guide RGPD", p: "/blog/rgpd-guide" }, { n: "Registre traitements", p: "/blog/registre-traitements" }, { n: "AIPD", p: "/blog/aipd-guide" }, { n: "Avis Google", p: "/blog/avis-google" }] },
            { title: "Legal", links: [{ n: "Mentions legales", p: "/mentions-legales" }, { n: "Confidentialite", p: "/confidentialite" }, { n: "CGV", p: "/cgv" }] },
          ].map((col, i) => (
            <div key={i}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "16px" }}>{col.title}</p>
              {col.links.map((l, j) => (
                <p key={j} onClick={() => navigate(l.p)} style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 2.2, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
                >{l.n}</p>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: "1100px", margin: "48px auto 0", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>
          NERVÜR {new Date().getFullYear()}. Tous droits reserves.
        </div>
      </footer>

      {/* Back to top */}
      {showTop && <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{
        position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
        width: "48px", height: "48px", borderRadius: "50%", background: C.accent, color: "#fff",
        border: "none", cursor: "pointer", fontSize: "20px", boxShadow: "0 4px 16px rgba(108,92,231,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center", transition: `all 0.3s ${EASE}`,
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(108,92,231,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(108,92,231,0.3)"; }}
      >&#8593;</button>}
    </div>
  );
}
