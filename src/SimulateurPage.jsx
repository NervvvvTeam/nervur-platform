import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

// ─── NERVÜR SIMULATEUR ROI DIGITAL ───
const V = "#FFFFFF", V2 = "#D4D4D8", V3 = "#A1A1AA";
const VG = (a) => `rgba(255,255,255,${a})`;
const A1 = "#818CF8", A2 = "#4ADE80", A3 = "#F472B6";

// ═══ CHROME ICON (metallic SVG) ═══
const ChromeIcon = ({ type, size = 24 }) => {
  const gradId = `sim-chrome-${type}`;
  const icons = {
    browser: (<><rect x="2" y="2" width="22" height="22" rx="3" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" /><line x1="2" y1="8" x2="24" y2="8" stroke={`url(#${gradId})`} strokeWidth="1.5" /><circle cx="5.5" cy="5" r="1" fill={`url(#${gradId})`} /><circle cx="8.5" cy="5" r="1" fill={`url(#${gradId})`} /><circle cx="11.5" cy="5" r="1" fill={`url(#${gradId})`} /></>),
    dashboard: (<><rect x="3" y="3" width="9" height="9" rx="1" fill={`url(#${gradId})`} /><rect x="14" y="3" width="9" height="9" rx="1" fill={`url(#${gradId})`} /><rect x="3" y="14" width="9" height="9" rx="1" fill={`url(#${gradId})`} /><rect x="14" y="14" width="9" height="9" rx="1" fill={`url(#${gradId})`} /></>),
    search: (<><circle cx="11" cy="11" r="7" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" /><line x1="16" y1="16" x2="22" y2="22" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" /></>),
    gauge: (<><path d="M4 18 A9 9 0 1 1 22 18" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" /><line x1="13" y1="17" x2="17" y2="10" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" /><circle cx="13" cy="17" r="2" fill={`url(#${gradId})`} /></>),
    pen: (<><path d="M17 3l4 4L8 20H4v-4L17 3z" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinejoin="round" /><line x1="14" y1="6" x2="18" y2="10" stroke={`url(#${gradId})`} strokeWidth="1.5" /></>),
    plus: (<><line x1="13" y1="5" x2="13" y2="21" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" /><line x1="5" y1="13" x2="21" y2="13" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" /></>),
    food: (<><path d="M6 3v6a3 3 0 003 3h0a3 3 0 003-3V3" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" /><line x1="9" y1="12" x2="9" y2="22" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" /><path d="M18 3v4c0 2-1 4-3 4" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" /></>),
    cart: (<><path d="M3 3h2l3 12h10l3-9H8" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="10" cy="20" r="1.5" fill={`url(#${gradId})`} /><circle cx="18" cy="20" r="1.5" fill={`url(#${gradId})`} /></>),
    briefcase: (<><rect x="3" y="8" width="20" height="13" rx="2" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" /><path d="M8 8V5a2 2 0 012-2h6a2 2 0 012 2v3" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" /></>),
    wrench: (<><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a5 5 0 01-7 7l-7.4 7.4a2 2 0 01-2.8-2.8L11 10.5a5 5 0 017-7l-3.3 2.8z" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinejoin="round" /></>),
    heart: (<><path d="M13 6C13 6 9 2 5.5 5.5S5 13 13 21c8-8 8.5-12.5 4.5-15.5S13 6 13 6z" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinejoin="round" /></>),
    building: (<><rect x="5" y="3" width="16" height="19" rx="1" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" /><rect x="9" y="7" width="3" height="3" fill={`url(#${gradId})`} /><rect x="14" y="7" width="3" height="3" fill={`url(#${gradId})`} /><rect x="9" y="13" width="3" height="3" fill={`url(#${gradId})`} /><rect x="14" y="13" width="3" height="3" fill={`url(#${gradId})`} /></>),
    megaphone: (<><path d="M19 5L5 9v4l14 4V5z" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinejoin="round" /><line x1="5" y1="13" x2="7" y2="19" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" /><circle cx="21" cy="11" r="2" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" /></>),
    book: (<><path d="M4 4h7v18H4z" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" /><path d="M11 4h7v18h-7z" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" /><line x1="11" y1="4" x2="11" y2="22" stroke={`url(#${gradId})`} strokeWidth="1.5" /></>),
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
      {icons[type]}
    </svg>
  );
};

const useIsMobile = (bp = 768) => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
};

// ═══ INDUSTRY DATA ═══
const INDUSTRIES = [
  { id: "restauration",  label: "Restauration",  chromeIcon: "food", avgConversion: 2.1, seoBoost: 55, avgTransaction: 35 },
  { id: "ecommerce",     label: "E-commerce",    chromeIcon: "cart", avgConversion: 2.5, seoBoost: 80, avgTransaction: 65 },
  { id: "services-b2b",  label: "Services B2B",  chromeIcon: "briefcase", avgConversion: 2.3, seoBoost: 45, avgTransaction: 500 },
  { id: "artisan-btp",   label: "Artisan / BTP", chromeIcon: "wrench", avgConversion: 3.1, seoBoost: 70, avgTransaction: 250 },
  { id: "sante",         label: "Santé",         chromeIcon: "heart", avgConversion: 3.5, seoBoost: 50, avgTransaction: 80 },
  { id: "immobilier",    label: "Immobilier",    chromeIcon: "building", avgConversion: 1.8, seoBoost: 65, avgTransaction: 1500 },
  { id: "formation",     label: "Formation",     chromeIcon: "book", avgConversion: 2.8, seoBoost: 60, avgTransaction: 200 },
  { id: "autre",         label: "Autre",         chromeIcon: "plus", avgConversion: 2.2, seoBoost: 50, avgTransaction: 150 },
];

// ═══ SERVICE IMPACTS ═══
const SERVICES = [
  { id: "site-vitrine",  label: "Site Vitrine",    chromeIcon: "browser", impact: "+30% conversion",  convMult: 1.30, traffMult: 1.0,  cost: 3500, desc: "Un site moderne et rapide qui transforme vos visiteurs en clients." },
  { id: "seo",           label: "SEO",             chromeIcon: "search", impact: "Boost trafic organique", convMult: 1.0,  traffMult: null, cost: 2000, desc: "Positionnez-vous en premier sur Google, durablement." },
  { id: "marketing-ads", label: "Marketing / Ads", chromeIcon: "megaphone", impact: "+45% trafic",      convMult: 1.0,  traffMult: 1.45, cost: 2500, desc: "Campagnes Meta & Google Ads ultra-ciblées pour un ROI maximal." },
  { id: "optimisation",  label: "Optimisation",    chromeIcon: "gauge", impact: "+25% conversion",  convMult: 1.25, traffMult: 1.0,  cost: 1500, desc: "Chaque seconde de chargement en moins = +7% de conversions." },
  { id: "branding",      label: "Branding",        chromeIcon: "pen", impact: "+15% conversion",  convMult: 1.15, traffMult: 1.0,  cost: 2000, desc: "Une identité forte qui inspire confiance et fidélise." },
];

// ═══ STEP INDICATOR ═══
const StepIndicator = ({ current, total }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{
        width: i <= current ? "32px" : "8px", height: "8px",
        background: i <= current ? A1 : VG(0.15),
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }} />
    ))}
    <span style={{ marginLeft: "auto", fontSize: "11px", letterSpacing: "2px", color: V3, fontFamily: "monospace" }}>
      {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </span>
  </div>
);

// ═══ ANIMATED COUNTER ═══
const AnimatedCounter = ({ target, suffix = "", prefix = "", duration = 35 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false;
    setCount(0);
  }, [target]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started.current && target > 0) {
        started.current = true;
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 45));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(current);
        }, duration);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString("fr-FR")}{suffix}</span>;
};

// ═══ REVEAL SECTION ═══
const RevealSection = ({ children }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>{children}</div>
  );
};

// ═══ SLIDER INPUT ═══
const SliderInput = ({ label, min, max, step, value, onChange, formatValue, sublabel }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: "36px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
        <label style={{ fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: V3, fontWeight: 600 }}>
          {label}
        </label>
        <span style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: V, letterSpacing: "-1px" }}>
          {formatValue(value)}
        </span>
      </div>
      {sublabel && <span style={{ fontSize: "11px", color: "#52525B", display: "block", marginBottom: "8px" }}>{sublabel}</span>}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={label}
        className="nervur-slider"
        style={{
          width: "100%", appearance: "none", WebkitAppearance: "none", height: "4px",
          background: `linear-gradient(90deg, ${A1} ${pct}%, ${VG(0.12)} ${pct}%)`,
          outline: "none", cursor: "pointer", border: "none",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
        <span style={{ fontSize: "10px", color: "#3F3F46" }}>{formatValue(min)}</span>
        <span style={{ fontSize: "10px", color: "#3F3F46" }}>{formatValue(max)}</span>
      </div>
    </div>
  );
};

// ═══ COMPARISON BAR ═══
const ComparisonBar = ({ label, before, after, maxVal, formatFn }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const fmt = formatFn || (v => v.toLocaleString("fr-FR"));
  return (
    <div ref={ref} style={{ marginBottom: "28px" }}>
      <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: V3, marginBottom: "10px", display: "block" }}>{label}</span>
      {/* Before */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <span style={{ fontSize: "10px", color: "#52525B", width: "48px", flexShrink: 0 }}>Avant</span>
        <div style={{ flex: 1, height: "10px", background: VG(0.06), overflow: "hidden" }}>
          <div style={{
            width: vis ? `${(before / maxVal) * 100}%` : "0%", height: "100%",
            background: VG(0.2), transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
          }} />
        </div>
        <span style={{ fontSize: "13px", color: V3, width: "100px", textAlign: "right", flexShrink: 0 }}>{fmt(before)}</span>
      </div>
      {/* After */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "10px", color: V, width: "48px", fontWeight: 700, flexShrink: 0 }}>Après</span>
        <div style={{ flex: 1, height: "10px", background: VG(0.06), overflow: "hidden" }}>
          <div style={{
            width: vis ? `${(after / maxVal) * 100}%` : "0%", height: "100%",
            background: `linear-gradient(90deg, ${V}, ${V2})`,
            transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
          }} />
        </div>
        <span style={{ fontSize: "13px", color: V, fontWeight: 700, width: "100px", textAlign: "right", flexShrink: 0 }}>{fmt(after)}</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════
export default function SimulateurPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);

  // Steps
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState([]);

  // Step 0 — Business
  const [industry, setIndustry] = useState(null);
  const [visitors, setVisitors] = useState(5000);
  const [conversionRate, setConversionRate] = useState(2.2);
  const [avgTransaction, setAvgTransaction] = useState(150);

  // Step 1 — Goals
  const [selectedServices, setSelectedServices] = useState([]);

  // URL param loading
  const fromUrl = useRef(false);

  // Pre-fill sliders when industry changes
  useEffect(() => {
    if (fromUrl.current) return;
    if (industry) {
      const data = INDUSTRIES.find(i => i.id === industry);
      if (data) {
        setConversionRate(data.avgConversion);
        setAvgTransaction(data.avgTransaction);
      }
    }
  }, [industry]);

  // Load from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ind = params.get("i");
    if (ind && INDUSTRIES.find(x => x.id === ind)) {
      fromUrl.current = true;
      setIndustry(ind);
      if (params.get("v")) setVisitors(Number(params.get("v")));
      if (params.get("c")) setConversionRate(Number(params.get("c")));
      if (params.get("t")) setAvgTransaction(Number(params.get("t")));
      if (params.get("s")) setSelectedServices(params.get("s").split(",").filter(Boolean));
      setStep(2);
      setTimeout(() => { fromUrl.current = false; }, 100);
    }
  }, []);

  useSEO("Simulateur ROI — Estimez votre retour | NERVÜR", "Estimez le retour sur investissement de votre projet digital avec notre simulateur gratuit. Résultats personnalisés en 2 minutes.", { path: "/simulateur" });

  // Scroll top on step change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  // Update URL params on results
  useEffect(() => {
    if (step === 2 && industry) {
      const params = new URLSearchParams({ i: industry, v: visitors, c: conversionRate, t: avgTransaction, s: selectedServices.join(",") });
      window.history.replaceState(null, "", `/simulateur?${params.toString()}`);
    }
  }, [step, industry, visitors, conversionRate, avgTransaction, selectedServices]);

  // Mouse glow
  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
      glowRef.current.style.opacity = "1";
    }
  };

  // ═══ ROI CALCULATION ═══
  const results = useMemo(() => {
    if (!industry) return null;
    const data = INDUSTRIES.find(i => i.id === industry);
    if (!data) return null;

    const currentConversions = visitors * (conversionRate / 100);
    const currentRevenue = currentConversions * avgTransaction;

    let projTraffic = visitors;
    let projConvRate = conversionRate;

    selectedServices.forEach(sId => {
      const svc = SERVICES.find(s => s.id === sId);
      if (!svc) return;
      if (sId === "seo") {
        projTraffic *= (1 + data.seoBoost / 100);
      } else {
        if (svc.traffMult && svc.traffMult !== 1.0) projTraffic *= svc.traffMult;
        if (svc.convMult && svc.convMult !== 1.0) projConvRate *= svc.convMult;
      }
    });

    const projConversions = projTraffic * (projConvRate / 100);
    const projRevenue = projConversions * avgTransaction;
    const revenueIncrease = projRevenue - currentRevenue;

    const totalInvestment = selectedServices.reduce((sum, id) => sum + (SERVICES.find(s => s.id === id)?.cost || 0), 0);
    const monthsROI = revenueIncrease > 0 ? Math.max(1, Math.ceil(totalInvestment / revenueIncrease)) : null;

    const recommendations = [];
    if (!selectedServices.includes("seo")) recommendations.push({ title: "Ajoutez le SEO", desc: `Potentiel +${data.seoBoost}% de trafic organique pour votre secteur.`, chromeIcon: "search" });
    if (!selectedServices.includes("site-vitrine") && conversionRate < 3) recommendations.push({ title: "Refonte site vitrine", desc: "Un site moderne peut augmenter votre conversion de +30%.", chromeIcon: "browser" });
    if (!selectedServices.includes("optimisation") && conversionRate < 2.5) recommendations.push({ title: "Optimisation performance", desc: "Chaque seconde de chargement coûte -7% de conversions.", chromeIcon: "gauge" });
    if (!selectedServices.includes("marketing-ads") && visitors < 3000) recommendations.push({ title: "Publicité ciblée", desc: "Boostez votre trafic de +45% avec des campagnes Meta & Google Ads.", chromeIcon: "megaphone" });

    return {
      currentRevenue: Math.round(currentRevenue),
      projRevenue: Math.round(projRevenue),
      revenueIncrease: Math.round(revenueIncrease),
      monthsROI,
      totalInvestment,
      projTraffic: Math.round(projTraffic),
      projConvRate: Math.round(projConvRate * 100) / 100,
      currentConversions: Math.round(currentConversions),
      projConversions: Math.round(projConversions),
      recommendations,
      percentIncrease: currentRevenue > 0 ? Math.round((revenueIncrease / currentRevenue) * 100) : 0,
    };
  }, [industry, visitors, conversionRate, avgTransaction, selectedServices]);

  // Navigation
  const goNext = () => {
    setErrors([]);
    if (step === 0 && !industry) { setErrors(["Sélectionnez votre secteur d'activité."]); return; }
    if (step === 1 && selectedServices.length === 0) { setErrors(["Sélectionnez au moins un service."]); return; }
    setStep(prev => Math.min(prev + 1, 2));
  };
  const goBack = () => { setErrors([]); setStep(prev => Math.max(prev - 1, 0)); };
  const toggleService = (id) => setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  return (
    <main onMouseMove={handleMouseMove} style={{
      background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      minHeight: "100vh", position: "relative" }}>

      {/* Glow */}
      <div ref={glowRef} style={{
        position: "fixed", left: -100, top: -100, width: "150px", height: "150px",
        borderRadius: "50%", pointerEvents: "none", zIndex: 9999,
        background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.03) 40%, transparent 70%)",
        transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s",
        opacity: 0, mixBlendMode: "screen",
      }} />

      <style>{`
        .nav-btn {
          position: relative; cursor: pointer; overflow: hidden;
          background: transparent; border: 1.5px solid rgba(129,140,248,0.25);
          color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px;
          text-transform: uppercase; padding: 8px 22px; font-family: inherit;
          transition: all 0.3s ease;
        }
        .nav-btn:hover {
          color: #fafafa; border-color: rgba(129,140,248,0.5);
          box-shadow: 0 0 16px rgba(129,140,248,0.15);
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${VG(0.08)}` }}>
        <img src="/logo-nervur.svg" alt="NERVÜR" onClick={() => navigate("/")}
          style={{ height: isMobile ? "40px" : "70px", width: "auto", objectFit: "contain", cursor: "pointer" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" onClick={() => navigate("/")}>
            ← Accueil
          </button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>
            Contact
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ paddingTop: isMobile ? "90px" : "140px", paddingBottom: "80px", maxWidth: "900px", margin: "0 auto", padding: isMobile ? "90px 20px 60px" : "140px 48px 80px" }}>

        {/* SEO structured heading */}
        <div style={{ marginBottom: "16px" }}>
          <span style={{
            fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase",
            color: "#52525B", display: "block", marginBottom: "20px", fontFamily: "monospace",
          }}>
            // Simulateur ROI digital
          </span>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-2px",
            lineHeight: 1.1, marginBottom: "16px",
          }}>
            {step === 0 && <>Votre <span style={{ color: V }}>business</span>.</>}
            {step === 1 && <>Vos <span style={{ color: V }}>objectifs</span>.</>}
            {step === 2 && <>Votre <span style={{ color: V }}>projection</span>.</>}
          </h1>
          <p style={{ fontSize: "16px", color: "#52525B", lineHeight: 1.8, maxWidth: "520px" }}>
            {step === 0 && "Renseignez votre secteur et vos chiffres actuels pour une estimation personnalisée."}
            {step === 1 && "Quels leviers digitaux voulez-vous activer ? Sélectionnez vos priorités."}
            {step === 2 && "Voici la projection de votre retour sur investissement digital."}
          </p>
        </div>

        <StepIndicator current={step} total={3} />

        {/* Errors */}
        {errors.length > 0 && (
          <div style={{ padding: "16px 20px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", marginBottom: "32px" }}>
            {errors.map((err, i) => <p key={i} style={{ fontSize: "13px", color: "#EF4444", margin: i > 0 ? "6px 0 0" : 0 }}>{err}</p>)}
          </div>
        )}


        {/* ════════════ STEP 0 — Business ════════════ */}
        {step === 0 && (
          <div>
            {/* Industry Grid */}
            <h3 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V2, marginBottom: "20px", fontWeight: 700 }}>
              Votre secteur d'activité
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "12px", marginBottom: "48px" }}>
              {INDUSTRIES.map(ind => (
                <button key={ind.id} onClick={() => setIndustry(ind.id)} style={{
                  padding: "24px 20px", background: industry === ind.id ? VG(0.08) : "transparent",
                  border: `1px solid ${industry === ind.id ? V : VG(0.1)}`,
                  color: industry === ind.id ? V : V3, cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  fontFamily: "inherit", textAlign: "left", position: "relative", overflow: "hidden",
                }}
                  onMouseEnter={e => { if (industry !== ind.id) { e.currentTarget.style.borderColor = VG(0.3); e.currentTarget.style.color = V; }}}
                  onMouseLeave={e => { if (industry !== ind.id) { e.currentTarget.style.borderColor = VG(0.1); e.currentTarget.style.color = V3; }}}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "2px",
                    background: `linear-gradient(90deg, transparent, ${V}, transparent)`,
                    transform: industry === ind.id ? "scaleX(1)" : "scaleX(0)",
                    transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  }} />
                  <span style={{ display: "block", marginBottom: "10px", opacity: industry === ind.id ? 0.9 : 0.4, transition: "opacity 0.3s" }}><ChromeIcon type={ind.chromeIcon} size={22} /></span>
                  <span style={{ fontSize: "14px", fontWeight: industry === ind.id ? 700 : 500, display: "block" }}>{ind.label}</span>
                  {industry === ind.id && <span style={{ position: "absolute", top: "12px", right: "12px", fontSize: "10px", opacity: 0.5 }}>✓</span>}
                </button>
              ))}
            </div>

            {/* Sliders */}
            <div style={{ padding: "32px", border: `1px solid ${VG(0.08)}`, background: VG(0.02) }}>
              <h3 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V2, marginBottom: "32px", fontWeight: 700 }}>
                Vos chiffres actuels
              </h3>
              <SliderInput
                label="Visiteurs mensuels" min={100} max={50000} step={100}
                value={visitors} onChange={setVisitors}
                formatValue={v => v.toLocaleString("fr-FR")}
                sublabel="Nombre de visiteurs uniques sur votre site par mois"
              />
              <SliderInput
                label="Taux de conversion" min={0.5} max={10} step={0.1}
                value={conversionRate} onChange={setConversionRate}
                formatValue={v => `${v.toFixed(1)} %`}
                sublabel={industry ? `Moyenne ${INDUSTRIES.find(i => i.id === industry)?.label || ""} : ${INDUSTRIES.find(i => i.id === industry)?.avgConversion || 2.2}%` : "Pourcentage de visiteurs qui deviennent clients"}
              />
              <SliderInput
                label="Panier moyen" min={10} max={5000} step={10}
                value={avgTransaction} onChange={setAvgTransaction}
                formatValue={v => `${v.toLocaleString("fr-FR")} €`}
                sublabel="Revenu moyen par transaction / client"
              />
            </div>
          </div>
        )}


        {/* ════════════ STEP 1 — Goals ════════════ */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V2, marginBottom: "20px", fontWeight: 700 }}>
              Quels leviers activer ?
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {SERVICES.map(svc => {
                const selected = selectedServices.includes(svc.id);
                const impactLabel = svc.id === "seo" && industry
                  ? `+${INDUSTRIES.find(i => i.id === industry)?.seoBoost || 50}% trafic organique`
                  : svc.impact;
                return (
                  <button key={svc.id} onClick={() => toggleService(svc.id)} style={{
                    padding: "24px 28px", background: selected ? VG(0.06) : "transparent",
                    border: `1px solid ${selected ? V : VG(0.1)}`, color: selected ? V : V3,
                    cursor: "pointer", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    fontFamily: "inherit", textAlign: "left", position: "relative", overflow: "hidden",
                    display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "16px", alignItems: "center",
                  }}
                    onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = VG(0.3); e.currentTarget.style.color = V; }}}
                    onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = VG(0.1); e.currentTarget.style.color = V3; }}}>
                    {/* Line accent */}
                    <div style={{
                      position: "absolute", top: 0, left: 0, width: "100%", height: "2px",
                      background: `linear-gradient(90deg, transparent, ${V}, transparent)`,
                      transform: selected ? "scaleX(1)" : "scaleX(0)",
                      transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    }} />
                    <span style={{ opacity: selected ? 0.9 : 0.4, transition: "opacity 0.3s", display: "flex" }}><ChromeIcon type={svc.chromeIcon} size={24} /></span>
                    <div>
                      <span style={{ fontSize: "16px", fontWeight: 700, display: "block", marginBottom: "4px" }}>{svc.label}</span>
                      <span style={{ fontSize: "13px", color: selected ? V3 : "#52525B", lineHeight: 1.5, transition: "color 0.3s" }}>{svc.desc}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        fontSize: "11px", letterSpacing: "1px", padding: "5px 12px",
                        border: `1px solid ${selected ? VG(0.3) : VG(0.1)}`,
                        color: selected ? V : V3, fontWeight: 600,
                        transition: "all 0.3s",
                      }}>{impactLabel}</span>
                      {selected && <span style={{ display: "block", marginTop: "8px", fontSize: "10px", color: "#52525B" }}>
                        ~{svc.cost.toLocaleString("fr-FR")} €
                      </span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Investment estimate */}
            {selectedServices.length > 0 && (
              <div style={{ padding: "20px 24px", border: `1px solid ${VG(0.08)}`, background: VG(0.02) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#52525B" }}>
                    Investissement estimé
                  </span>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: V, letterSpacing: "-0.5px" }}>
                    ~{selectedServices.reduce((s, id) => s + (SERVICES.find(x => x.id === id)?.cost || 0), 0).toLocaleString("fr-FR")} €
                  </span>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ════════════ STEP 2 — Results Dashboard ════════════ */}
        {step === 2 && results && (
          <div aria-live="polite">
            {/* Stat Cards */}
            <RevealSection>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "48px" }}>
                {[
                  { label: "Revenu mensuel actuel", value: results.currentRevenue, suffix: " €", prefix: "", color: V3 },
                  { label: "Revenu mensuel projeté", value: results.projRevenue, suffix: " €", prefix: "", color: V },
                  { label: "Augmentation mensuelle", value: results.revenueIncrease, suffix: " €", prefix: "+", color: "#4ADE80" },
                  { label: "Retour sur investissement", value: results.monthsROI || 0, suffix: results.monthsROI ? " mois" : "", prefix: results.monthsROI ? "~" : "", color: V, note: results.monthsROI ? null : "—" },
                ].map((stat, i) => (
                  <div key={i} style={{
                    padding: "32px 28px", border: `1px solid ${VG(0.1)}`,
                    background: "rgba(24,24,27,0.3)", position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px",
                      background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
                    <span style={{ fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: "#52525B", display: "block", marginBottom: "16px" }}>
                      {stat.label}
                    </span>
                    <div style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, color: stat.color, letterSpacing: "-1px" }}>
                      {stat.note || <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />}
                    </div>
                  </div>
                ))}
              </div>
            </RevealSection>

            {/* Percent badge */}
            <RevealSection>
              <div style={{
                textAlign: "center", padding: "32px", marginBottom: "48px",
                border: `1px solid ${VG(0.08)}`, background: VG(0.02),
              }}>
                <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#52525B", display: "block", marginBottom: "8px" }}>
                  Croissance estimée
                </span>
                <span style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900, letterSpacing: "-3px", color: V }}>
                  <AnimatedCounter target={results.percentIncrease} prefix="+" suffix="%" />
                </span>
              </div>
            </RevealSection>

            {/* Comparison Bars */}
            <RevealSection>
              <div style={{ padding: "32px", border: `1px solid ${VG(0.08)}`, background: VG(0.02), marginBottom: "48px" }}>
                <h3 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V2, marginBottom: "28px", fontWeight: 700 }}>
                  Comparaison avant / après
                </h3>
                <ComparisonBar label="Revenu mensuel" before={results.currentRevenue} after={results.projRevenue}
                  maxVal={results.projRevenue * 1.1} formatFn={v => `${v.toLocaleString("fr-FR")} €`} />
                <ComparisonBar label="Trafic mensuel" before={visitors} after={results.projTraffic}
                  maxVal={results.projTraffic * 1.1} formatFn={v => v.toLocaleString("fr-FR")} />
                <ComparisonBar label="Conversions / mois" before={results.currentConversions} after={results.projConversions}
                  maxVal={results.projConversions * 1.1} formatFn={v => v.toLocaleString("fr-FR")} />
              </div>
            </RevealSection>

            {/* Investment summary */}
            <RevealSection>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "48px" }}>
                <div style={{ padding: "24px", border: `1px solid ${VG(0.08)}`, background: VG(0.02) }}>
                  <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#52525B", display: "block", marginBottom: "8px" }}>Investissement total</span>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: V }}>{results.totalInvestment.toLocaleString("fr-FR")} €</span>
                </div>
                <div style={{ padding: "24px", border: `1px solid ${VG(0.08)}`, background: VG(0.02) }}>
                  <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#52525B", display: "block", marginBottom: "8px" }}>Rentabilisé en</span>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: "#4ADE80" }}>
                    {results.monthsROI ? `~${results.monthsROI} mois` : "—"}
                  </span>
                </div>
              </div>
            </RevealSection>

            {/* Recommendations */}
            {results.recommendations.length > 0 && (
              <RevealSection>
                <div style={{ marginBottom: "48px" }}>
                  <h3 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V2, marginBottom: "20px", fontWeight: 700 }}>
                    Recommandations personnalisées
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {results.recommendations.map((rec, i) => (
                      <div key={i} style={{
                        padding: "20px 24px", border: `1px solid ${VG(0.1)}`, background: VG(0.03),
                        display: "flex", gap: "16px", alignItems: "flex-start",
                        transition: "all 0.3s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.25); e.currentTarget.style.background = VG(0.05); }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.1); e.currentTarget.style.background = VG(0.03); }}>
                        <span style={{ opacity: 0.5, flexShrink: 0, display: "flex" }}><ChromeIcon type={rec.chromeIcon} size={20} /></span>
                        <div>
                          <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>{rec.title}</h4>
                          <p style={{ fontSize: "13px", color: V3, lineHeight: 1.6 }}>{rec.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealSection>
            )}

            {/* CTA */}
            <RevealSection>
              <div style={{
                textAlign: "center", padding: "64px 32px",
                border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.4)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  width: "300px", height: "300px", borderRadius: "50%",
                  background: `radial-gradient(circle, ${VG(0.06)} 0%, transparent 70%)`,
                  filter: "blur(40px)",
                }} />
                <div style={{ position: "relative", zIndex: 2 }}>
                  <p style={{ fontSize: "18px", color: V3, marginBottom: "8px", lineHeight: 1.6 }}>
                    Prêt à transformer ces projections
                  </p>
                  <p style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "28px" }}>
                    en résultats <span style={{ color: V }}>concrets</span> ?
                  </p>
                  <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => navigate("/contact")} style={{
                      padding: "18px 48px", background: `linear-gradient(135deg, ${A1}, ${A3})`, color: "#09090B",
                      fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                      border: "none", cursor: "pointer", transition: "all 0.3s ease", fontFamily: "inherit",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(129,140,248,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                      Discuter de votre projet →
                    </button>
                    <button onClick={goBack} style={{
                      padding: "18px 32px", background: "transparent", border: `1px solid ${VG(0.2)}`,
                      color: V3, fontSize: "13px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                      cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.4); e.currentTarget.style.color = V; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.2); e.currentTarget.style.color = V3; }}>
                      ← Modifier
                    </button>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        )}


        {/* ════════════ NAVIGATION BUTTONS ════════════ */}
        {step < 2 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px" }}>
            {step > 0 ? (
              <button onClick={goBack} style={{
                padding: "14px 32px", background: "transparent", border: `1px solid ${VG(0.15)}`,
                color: V3, fontSize: "13px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.4); e.currentTarget.style.color = V; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.15); e.currentTarget.style.color = V3; }}>
                ← Retour
              </button>
            ) : <div />}
            <button onClick={goNext} style={{
              padding: "16px 40px", background: `linear-gradient(135deg, ${A1}, ${A3})`, color: "#09090B",
              fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
              border: "none", cursor: "pointer", transition: "all 0.3s ease", fontFamily: "inherit",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(129,140,248,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              Continuer →
            </button>
          </div>
        )}
      </div>

      {/* FLOATING BADGE */}
      <aside style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 50 }}>
        <div style={{
          padding: "14px 20px", background: "rgba(9,9,11,0.95)", backdropFilter: "blur(16px)",
          border: `1px solid ${VG(0.08)}`, display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ADE80", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: V3, letterSpacing: "0.5px" }}>
            100% <strong style={{ color: V }}>gratuit</strong>
          </span>
        </div>
      </aside>

      {/* FOOTER */}
      <footer style={{
        padding: isMobile ? "24px 20px" : "32px 48px", borderTop: `1px solid ${VG(0.06)}`,
        display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: isMobile ? "12px" : "0",
      }}>
        <img src="/logo-nervur.svg" alt="NERVÜR" style={{
          height: "28px", width: "auto", objectFit: "contain",
        }} />
        <span style={{ fontSize: "11px", color: "#3F3F46" }}>© 2026 NERVÜR — Tous droits réservés</span>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { margin: 0; padding: 0; }
        ::selection { background: rgba(255,255,255,0.15); }
        .nervur-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
          background: #818CF8; border: 3px solid #09090B; cursor: pointer;
          box-shadow: 0 0 12px rgba(129,140,248,0.35);
        }
        .nervur-slider::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #818CF8; border: 3px solid #09090B; cursor: pointer;
          box-shadow: 0 0 12px rgba(129,140,248,0.35);
        }
      `}</style>
    </main>
  );
}
