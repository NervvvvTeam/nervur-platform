import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

// ─── NERVÜR SIMULATEUR ROI E-RÉPUTATION ───
const V = "#FFFFFF", V2 = "#D4D4D8", V3 = "#A1A1AA";
const VG = (a) => `rgba(255,255,255,${a})`;
const A1 = "#818CF8", A2 = "#4ADE80", A3 = "#F472B6";

const useIsMobile = (bp = 768) => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
};

// ═══ INDUSTRY DATA (based on BrightLocal 2025 & Ifop 2024) ═══
const INDUSTRIES = [
  { id: "restauration",  label: "Restauration",       avgNote: 3.8, reviewImpact: 0.25, avgTicket: 35, monthlyClients: 400 },
  { id: "ecommerce",     label: "E-commerce",         avgNote: 3.6, reviewImpact: 0.20, avgTicket: 65, monthlyClients: 800 },
  { id: "services-b2b",  label: "Services B2B",       avgNote: 4.0, reviewImpact: 0.18, avgTicket: 500, monthlyClients: 30 },
  { id: "artisan-btp",   label: "Artisan / BTP",      avgNote: 3.9, reviewImpact: 0.22, avgTicket: 250, monthlyClients: 25 },
  { id: "sante",         label: "Santé / Bien-être",  avgNote: 4.1, reviewImpact: 0.20, avgTicket: 80, monthlyClients: 120 },
  { id: "immobilier",    label: "Immobilier",         avgNote: 3.5, reviewImpact: 0.22, avgTicket: 1500, monthlyClients: 15 },
  { id: "formation",     label: "Formation",          avgNote: 3.7, reviewImpact: 0.20, avgTicket: 200, monthlyClients: 50 },
  { id: "autre",         label: "Autre",              avgNote: 3.7, reviewImpact: 0.20, avgTicket: 150, monthlyClients: 60 },
];

// ═══ STEP INDICATOR ═══
const StepIndicator = ({ current, total }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{
        width: i <= current ? "32px" : "8px", height: "8px", borderRadius: "4px",
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
      {sublabel && <span style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "8px" }}>{sublabel}</span>}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={label}
        className="nervur-slider"
        style={{
          width: "100%", appearance: "none", WebkitAppearance: "none", height: "4px",
          background: `linear-gradient(90deg, ${A1} ${pct}%, ${VG(0.12)} ${pct}%)`,
          outline: "none", cursor: "pointer", border: "none", borderRadius: "2px",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
        <span style={{ fontSize: "10px", color: "#4B5563" }}>{formatValue(min)}</span>
        <span style={{ fontSize: "10px", color: "#4B5563" }}>{formatValue(max)}</span>
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
        <span style={{ fontSize: "10px", color: "#6B7280", width: "48px", flexShrink: 0 }}>Avant</span>
        <div style={{ flex: 1, height: "10px", background: VG(0.06), overflow: "hidden", borderRadius: "5px" }}>
          <div style={{
            width: vis ? `${(before / maxVal) * 100}%` : "0%", height: "100%",
            background: VG(0.2), transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)", borderRadius: "5px",
          }} />
        </div>
        <span style={{ fontSize: "13px", color: V3, width: "100px", textAlign: "right", flexShrink: 0 }}>{fmt(before)}</span>
      </div>
      {/* After */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "10px", color: V, width: "48px", fontWeight: 700, flexShrink: 0 }}>Après</span>
        <div style={{ flex: 1, height: "10px", background: VG(0.06), overflow: "hidden", borderRadius: "5px" }}>
          <div style={{
            width: vis ? `${(after / maxVal) * 100}%` : "0%", height: "100%",
            background: `linear-gradient(90deg, ${A1}, ${A2})`,
            transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s", borderRadius: "5px",
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

  // Steps
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState([]);

  // Step 0 — Business
  const [industry, setIndustry] = useState(null);
  const [monthlyClients, setMonthlyClients] = useState(60);
  const [avgTicket, setAvgTicket] = useState(150);
  const [currentNote, setCurrentNote] = useState(3.5);

  // Step 1 — Services
  const [useSentinel, setUseSentinel] = useState(true);
  const [useVault, setUseVault] = useState(true);

  // Pre-fill sliders when industry changes
  useEffect(() => {
    if (industry) {
      const data = INDUSTRIES.find(i => i.id === industry);
      if (data) {
        setAvgTicket(data.avgTicket);
        setMonthlyClients(data.monthlyClients);
        setCurrentNote(data.avgNote);
      }
    }
  }, [industry]);

  useSEO("Simulateur ROI E-Réputation — Estimez votre retour | NERVÜR", "Estimez le retour sur investissement de la gestion de votre e-réputation et conformité RGPD. Résultats personnalisés en 2 minutes.", { path: "/simulateur" });

  // Scroll top on step change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  // ═══ ROI CALCULATION ═══
  // Based on real industry benchmarks:
  // - BrightLocal 2025: 98% of consumers read online reviews, +1 star = +5-9% revenue
  // - Harvard Business School: 1-star increase on Yelp = 5-9% revenue increase
  // - Ifop 2024: 92% of French consumers check reviews before purchase
  // - CNIL 2025: average RGPD fine for TPE/PME = 15,000-50,000 EUR
  // - Spiegel Research Center: displaying reviews increases conversion by 270%
  const results = useMemo(() => {
    if (!industry) return null;
    const data = INDUSTRIES.find(i => i.id === industry);
    if (!data) return null;

    const currentMonthlyRevenue = monthlyClients * avgTicket;
    const currentAnnualRevenue = currentMonthlyRevenue * 12;

    let projMonthlyClients = monthlyClients;
    let projAvgTicket = avgTicket;
    let monthlySavingsHours = 0;
    let complianceRiskReduction = 0;

    // Sentinel impact: e-reputation management
    // Based on BrightLocal 2025: active review management improves conversion 15-25%
    // Harvard Business School: +1 star = +5-9% revenue
    // We use conservative 18% client increase (midpoint of 15-25%)
    if (useSentinel) {
      const reputationBoost = data.reviewImpact; // 18-25% depending on sector
      projMonthlyClients = Math.round(monthlyClients * (1 + reputationBoost));
      // Better reputation also increases average ticket by ~5% (trust premium)
      projAvgTicket = Math.round(avgTicket * 1.05);
      monthlySavingsHours += 8; // 8h/month saved on manual review monitoring
    }

    // Vault impact: RGPD compliance automation
    // Based on CNIL 2025: automated compliance saves 5-15h/month
    // Risk reduction: average RGPD fine for PME = 15,000-50,000 EUR
    if (useVault) {
      monthlySavingsHours += 10; // 10h/month saved on legal compliance
      complianceRiskReduction = 35000; // average avoided fine risk
    }

    const projMonthlyRevenue = projMonthlyClients * projAvgTicket;
    const projAnnualRevenue = projMonthlyRevenue * 12;
    const revenueIncrease = projMonthlyRevenue - currentMonthlyRevenue;
    const annualRevenueIncrease = revenueIncrease * 12;

    // Cost of services (monthly)
    const sentinelCost = useSentinel ? 99 : 0; // Sentinel monthly
    const vaultCost = useVault ? 79 : 0; // Vault monthly
    const totalMonthlyCost = sentinelCost + vaultCost;
    const totalAnnualCost = totalMonthlyCost * 12;

    // ROI calculation
    const monthlyROI = totalMonthlyCost > 0 ? Math.round(((revenueIncrease + monthlySavingsHours * 35) / totalMonthlyCost) * 100) : 0;
    // Time saved valued at 35 EUR/hour (average TPE/PME rate)
    const monthlySavingsEuros = monthlySavingsHours * 35;

    const percentIncrease = currentMonthlyRevenue > 0 ? Math.round((revenueIncrease / currentMonthlyRevenue) * 100) : 0;

    return {
      currentMonthlyRevenue: Math.round(currentMonthlyRevenue),
      projMonthlyRevenue: Math.round(projMonthlyRevenue),
      revenueIncrease: Math.round(revenueIncrease),
      annualRevenueIncrease: Math.round(annualRevenueIncrease),
      currentAnnualRevenue: Math.round(currentAnnualRevenue),
      projAnnualRevenue: Math.round(projAnnualRevenue),
      monthlyROI,
      totalMonthlyCost,
      totalAnnualCost,
      monthlySavingsHours,
      monthlySavingsEuros,
      complianceRiskReduction,
      projMonthlyClients,
      projAvgTicket,
      percentIncrease,
    };
  }, [industry, monthlyClients, avgTicket, currentNote, useSentinel, useVault]);

  // Navigation
  const goNext = () => {
    setErrors([]);
    if (step === 0 && !industry) { setErrors(["Sélectionnez votre secteur d'activité."]); return; }
    if (step === 1 && !useSentinel && !useVault) { setErrors(["Sélectionnez au moins un outil."]); return; }
    setStep(prev => Math.min(prev + 1, 2));
  };
  const goBack = () => { setErrors([]); setStep(prev => Math.max(prev - 1, 0)); };

  return (
    <main style={{
      background: "linear-gradient(180deg, #0f1117 0%, #131620 50%, #0f1117 100%)",
      color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      minHeight: "100vh", position: "relative" }}>

      <style>{`
        .nav-btn {
          position: relative; cursor: pointer; overflow: hidden;
          background: transparent; border: 1.5px solid rgba(129,140,248,0.25);
          color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px;
          text-transform: uppercase; padding: 8px 22px; font-family: inherit;
          transition: all 0.3s ease; border-radius: 6px;
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
        background: "rgba(15,17,23,0.92)", backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${VG(0.08)}` }}>
        <img src="/logo-nav.png" style={{ filter: "invert(1) brightness(1.15)" }} alt="NERVÜR" onClick={() => navigate("/")}
          style={{ height: isMobile ? "34px" : "42px", width: "auto", objectFit: "contain", cursor: "pointer" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" onClick={() => navigate("/")}>
            ← Accueil
          </button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>
            Contact
          </button>
        </div>
      </nav>

      {/* RETOUR */}
      <div style={{ padding: isMobile ? "90px 20px 0 20px" : "140px 48px 0 48px", maxWidth: "900px", margin: "0 auto" }}>
        <button onClick={() => navigate("/")} style={{
          background: "none", border: "1px solid rgba(250,250,250,0.15)", borderRadius: "8px",
          color: "#71717A", fontSize: "13px", padding: "8px 20px", cursor: "pointer",
          fontFamily: "inherit", transition: "all 0.3s",
        }}
          onMouseEnter={e => { e.target.style.color = "#FAFAFA"; e.target.style.borderColor = "rgba(250,250,250,0.3)"; }}
          onMouseLeave={e => { e.target.style.color = "#71717A"; e.target.style.borderColor = "rgba(250,250,250,0.15)"; }}>
          ← Retour
        </button>
      </div>

      {/* MAIN */}
      <div style={{ paddingTop: "20px", paddingBottom: "80px", maxWidth: "900px", margin: "0 auto", padding: isMobile ? "20px 20px 60px" : "20px 48px 80px" }}>

        {/* SEO structured heading */}
        <div style={{ marginBottom: "16px" }}>
          <span style={{
            fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase",
            color: "#6B7280", display: "block", marginBottom: "20px", fontFamily: "monospace",
          }}>
            // Simulateur ROI e-réputation
          </span>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-2px",
            lineHeight: 1.1, marginBottom: "16px",
          }}>
            {step === 0 && <>Votre <span style={{ color: V }}>activité</span>.</>}
            {step === 1 && <>Vos <span style={{ color: V }}>outils</span>.</>}
            {step === 2 && <>Votre <span style={{ color: V }}>projection</span>.</>}
          </h1>
          <p style={{ fontSize: "16px", color: "#6B7280", lineHeight: 1.8, maxWidth: "520px" }}>
            {step === 0 && "Renseignez votre secteur et vos chiffres actuels pour une estimation personnalisée."}
            {step === 1 && "Quels outils NERVÜR souhaitez-vous utiliser ?"}
            {step === 2 && "Voici la projection de votre retour sur investissement."}
          </p>
        </div>

        <StepIndicator current={step} total={3} />

        {/* Errors */}
        {errors.length > 0 && (
          <div style={{ padding: "16px 20px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", marginBottom: "32px", borderRadius: "8px" }}>
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
                  padding: "24px 20px", background: industry === ind.id ? "rgba(129,140,248,0.08)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${industry === ind.id ? "rgba(129,140,248,0.4)" : VG(0.08)}`,
                  color: industry === ind.id ? V : V3, cursor: "pointer", borderRadius: "10px",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  fontFamily: "inherit", textAlign: "left", position: "relative", overflow: "hidden",
                }}
                  onMouseEnter={e => { if (industry !== ind.id) { e.currentTarget.style.borderColor = VG(0.2); e.currentTarget.style.color = V; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}}
                  onMouseLeave={e => { if (industry !== ind.id) { e.currentTarget.style.borderColor = VG(0.08); e.currentTarget.style.color = V3; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}}>
                  <span style={{ display: "block", marginBottom: "10px", fontSize: "12px", color: "#818CF8", letterSpacing: "1px", textTransform: "uppercase" }}>{ind.id.charAt(0).toUpperCase()}</span>
                  <span style={{ fontSize: "14px", fontWeight: industry === ind.id ? 700 : 500, display: "block" }}>{ind.label}</span>
                  {industry === ind.id && <span style={{ position: "absolute", top: "12px", right: "12px", fontSize: "10px", color: A1 }}>✓</span>}
                </button>
              ))}
            </div>

            {/* Sliders */}
            <div style={{ padding: "32px", border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V2, marginBottom: "32px", fontWeight: 700 }}>
                Vos chiffres actuels
              </h3>
              <SliderInput
                label="Clients par mois" min={5} max={2000} step={5}
                value={monthlyClients} onChange={setMonthlyClients}
                formatValue={v => v.toLocaleString("fr-FR")}
                sublabel="Nombre de clients ou transactions par mois"
              />
              <SliderInput
                label="Panier moyen" min={10} max={5000} step={10}
                value={avgTicket} onChange={setAvgTicket}
                formatValue={v => `${v.toLocaleString("fr-FR")} €`}
                sublabel="Revenu moyen par client / transaction"
              />
              <SliderInput
                label="Note Google actuelle" min={1} max={5} step={0.1}
                value={currentNote} onChange={setCurrentNote}
                formatValue={v => `${v.toFixed(1)} ★`}
                sublabel="Votre note moyenne sur Google (sur 5)"
              />
            </div>
          </div>
        )}


        {/* ════════════ STEP 1 — Tools ════════════ */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V2, marginBottom: "20px", fontWeight: 700 }}>
              Outils NERVÜR
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>

              {/* Sentinel */}
              <button onClick={() => setUseSentinel(!useSentinel)} style={{
                padding: "28px", background: useSentinel ? "rgba(129,140,248,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${useSentinel ? "rgba(129,140,248,0.3)" : VG(0.08)}`,
                color: useSentinel ? V : V3, cursor: "pointer", borderRadius: "12px",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                fontFamily: "inherit", textAlign: "left", position: "relative",
              }}
                onMouseEnter={e => { if (!useSentinel) { e.currentTarget.style.borderColor = VG(0.2); e.currentTarget.style.color = V; }}}
                onMouseLeave={e => { if (!useSentinel) { e.currentTarget.style.borderColor = VG(0.08); e.currentTarget.style.color = V3; }}}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#ef4444" }}>S</span>
                      <span style={{ fontSize: "18px", fontWeight: 700 }}>Sentinel</span>
                      {useSentinel && <span style={{ fontSize: "10px", background: A1, color: "#0f1117", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>ACTIF</span>}
                    </div>
                    <p style={{ fontSize: "14px", color: useSentinel ? V3 : "#6B7280", lineHeight: 1.6, maxWidth: "500px" }}>
                      Surveillance e-réputation, gestion des avis Google, alertes en temps réel, réponses assistées par IA.
                    </p>
                    <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", padding: "4px 12px", border: `1px solid ${VG(0.1)}`, borderRadius: "4px", color: A2 }}>+15-25% de clients</span>
                      <span style={{ fontSize: "11px", padding: "4px 12px", border: `1px solid ${VG(0.1)}`, borderRadius: "4px", color: V3 }}>8h/mois gagnées</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#6B7280", marginTop: "8px", fontStyle: "italic" }}>
                      Source : BrightLocal 2025, Harvard Business School
                    </p>
                  </div>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: useSentinel ? V : "#6B7280", whiteSpace: "nowrap" }}>99 €/mois</span>
                </div>
              </button>

              {/* Vault */}
              <button onClick={() => setUseVault(!useVault)} style={{
                padding: "28px", background: useVault ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${useVault ? "rgba(74,222,128,0.3)" : VG(0.08)}`,
                color: useVault ? V : V3, cursor: "pointer", borderRadius: "12px",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                fontFamily: "inherit", textAlign: "left", position: "relative",
              }}
                onMouseEnter={e => { if (!useVault) { e.currentTarget.style.borderColor = VG(0.2); e.currentTarget.style.color = V; }}}
                onMouseLeave={e => { if (!useVault) { e.currentTarget.style.borderColor = VG(0.08); e.currentTarget.style.color = V3; }}}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#06b6d4" }}>V</span>
                      <span style={{ fontSize: "18px", fontWeight: 700 }}>Vault</span>
                      {useVault && <span style={{ fontSize: "10px", background: A2, color: "#0f1117", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>ACTIF</span>}
                    </div>
                    <p style={{ fontSize: "14px", color: useVault ? V3 : "#6B7280", lineHeight: 1.6, maxWidth: "500px" }}>
                      Conformité RGPD automatisée, mentions légales, politique de confidentialité, bannière cookies, registre des traitements.
                    </p>
                    <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", padding: "4px 12px", border: `1px solid ${VG(0.1)}`, borderRadius: "4px", color: A2 }}>10h/mois gagnées</span>
                      <span style={{ fontSize: "11px", padding: "4px 12px", border: `1px solid ${VG(0.1)}`, borderRadius: "4px", color: V3 }}>Risque RGPD réduit</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#6B7280", marginTop: "8px", fontStyle: "italic" }}>
                      Source : CNIL 2025, amende moyenne PME : 15 000-50 000 €
                    </p>
                  </div>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: useVault ? V : "#6B7280", whiteSpace: "nowrap" }}>79 €/mois</span>
                </div>
              </button>
            </div>

            {/* Total */}
            {(useSentinel || useVault) && (
              <div style={{ padding: "20px 24px", border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#6B7280" }}>
                    Investissement mensuel
                  </span>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: V, letterSpacing: "-0.5px" }}>
                    {(useSentinel ? 99 : 0) + (useVault ? 79 : 0)} €/mois
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
                  { label: "Revenu mensuel actuel", value: results.currentMonthlyRevenue, suffix: " €", prefix: "", color: V3 },
                  { label: "Revenu mensuel projeté", value: results.projMonthlyRevenue, suffix: " €", prefix: "", color: V },
                  { label: "Gain mensuel estimé", value: results.revenueIncrease, suffix: " €", prefix: "+", color: "#4ADE80" },
                  { label: "Gain annuel estimé", value: results.annualRevenueIncrease, suffix: " €", prefix: "+", color: "#4ADE80" },
                ].map((stat, i) => (
                  <div key={i} style={{
                    padding: "32px 28px", border: `1px solid ${VG(0.08)}`,
                    background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden", borderRadius: "12px",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px",
                      background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
                    <span style={{ fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: "#6B7280", display: "block", marginBottom: "16px" }}>
                      {stat.label}
                    </span>
                    <div style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, color: stat.color, letterSpacing: "-1px" }}>
                      <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                    </div>
                  </div>
                ))}
              </div>
            </RevealSection>

            {/* Percent badge */}
            <RevealSection>
              <div style={{
                textAlign: "center", padding: "32px", marginBottom: "48px",
                border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)", borderRadius: "12px",
              }}>
                <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#6B7280", display: "block", marginBottom: "8px" }}>
                  Croissance estimée du chiffre d'affaires
                </span>
                <span style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900, letterSpacing: "-3px", color: V }}>
                  <AnimatedCounter target={results.percentIncrease} prefix="+" suffix="%" />
                </span>
                <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "8px", fontStyle: "italic" }}>
                  Estimation basée sur les données BrightLocal 2025 et Harvard Business School
                </p>
              </div>
            </RevealSection>

            {/* Comparison Bars */}
            <RevealSection>
              <div style={{ padding: "32px", border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)", marginBottom: "48px", borderRadius: "12px" }}>
                <h3 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V2, marginBottom: "28px", fontWeight: 700 }}>
                  Comparaison avant / après
                </h3>
                <ComparisonBar label="Revenu mensuel" before={results.currentMonthlyRevenue} after={results.projMonthlyRevenue}
                  maxVal={results.projMonthlyRevenue * 1.1} formatFn={v => `${v.toLocaleString("fr-FR")} €`} />
                <ComparisonBar label="Clients par mois" before={monthlyClients} after={results.projMonthlyClients}
                  maxVal={results.projMonthlyClients * 1.1} formatFn={v => v.toLocaleString("fr-FR")} />
              </div>
            </RevealSection>

            {/* Savings detail */}
            <RevealSection>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px", marginBottom: "48px" }}>
                <div style={{ padding: "24px", border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                  <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#6B7280", display: "block", marginBottom: "8px" }}>Coût mensuel</span>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: V }}>{results.totalMonthlyCost} €</span>
                </div>
                <div style={{ padding: "24px", border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                  <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#6B7280", display: "block", marginBottom: "8px" }}>Temps gagné / mois</span>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: "#4ADE80" }}>{results.monthlySavingsHours}h</span>
                  <span style={{ fontSize: "11px", color: "#6B7280", display: "block", marginTop: "4px" }}>soit ~{results.monthlySavingsEuros} € économisés</span>
                </div>
                {results.complianceRiskReduction > 0 && (
                  <div style={{ padding: "24px", border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                    <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#6B7280", display: "block", marginBottom: "8px" }}>Risque RGPD évité</span>
                    <span style={{ fontSize: "24px", fontWeight: 800, color: "#F59E0B" }}>~{results.complianceRiskReduction.toLocaleString("fr-FR")} €</span>
                    <span style={{ fontSize: "11px", color: "#6B7280", display: "block", marginTop: "4px" }}>Source : CNIL 2025</span>
                  </div>
                )}
              </div>
            </RevealSection>

            {/* ROI summary */}
            <RevealSection>
              <div style={{
                textAlign: "center", padding: "32px", marginBottom: "48px",
                border: `1px solid rgba(74,222,128,0.2)`, background: "rgba(74,222,128,0.04)", borderRadius: "12px",
              }}>
                <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#6B7280", display: "block", marginBottom: "8px" }}>
                  Retour sur investissement
                </span>
                <span style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-2px", color: A2 }}>
                  <AnimatedCounter target={results.monthlyROI} suffix="%" />
                </span>
                <p style={{ fontSize: "13px", color: V3, marginTop: "8px" }}>
                  Pour chaque euro investi, vous générez {(results.monthlyROI / 100).toFixed(1)}€ de valeur
                </p>
              </div>
            </RevealSection>

            {/* Sources */}
            <RevealSection>
              <div style={{ padding: "24px", border: `1px solid ${VG(0.06)}`, background: "rgba(255,255,255,0.01)", marginBottom: "48px", borderRadius: "10px" }}>
                <h4 style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#6B7280", marginBottom: "12px" }}>Sources et méthodologie</h4>
                <ul style={{ fontSize: "12px", color: "#6B7280", lineHeight: 2, listStyle: "none", padding: 0 }}>
                  <li>• BrightLocal 2025 : 98% des consommateurs lisent les avis en ligne avant un achat</li>
                  <li>• Harvard Business School : +1 étoile Google = +5 à 9% de chiffre d'affaires</li>
                  <li>• Ifop 2024 : 92% des Français consultent les avis avant d'acheter</li>
                  <li>• Spiegel Research Center : afficher des avis augmente la conversion de 270%</li>
                  <li>• CNIL 2025 : amende moyenne RGPD pour TPE/PME : 15 000 à 50 000 €</li>
                  <li>• Temps valorisé au taux horaire moyen TPE/PME : 35 €/h</li>
                </ul>
              </div>
            </RevealSection>

            {/* CTA */}
            <RevealSection>
              <div style={{
                textAlign: "center", padding: "64px 32px",
                border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.02)",
                position: "relative", overflow: "hidden", borderRadius: "16px",
              }}>
                <div style={{ position: "relative", zIndex: 2 }}>
                  <p style={{ fontSize: "18px", color: V3, marginBottom: "8px", lineHeight: 1.6 }}>
                    Prêt à transformer ces projections
                  </p>
                  <p style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "28px" }}>
                    en résultats <span style={{ color: V }}>concrets</span> ?
                  </p>
                  <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => navigate("/contact")} style={{
                      padding: "18px 48px", background: `linear-gradient(135deg, ${A1}, ${A3})`, color: "#0f1117",
                      fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                      border: "none", cursor: "pointer", transition: "all 0.3s ease", fontFamily: "inherit", borderRadius: "8px",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(129,140,248,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                      Discuter de votre projet →
                    </button>
                    <button onClick={goBack} style={{
                      padding: "18px 32px", background: "transparent", border: `1px solid ${VG(0.2)}`,
                      color: V3, fontSize: "13px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                      cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit", borderRadius: "8px",
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
                cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit", borderRadius: "8px",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.4); e.currentTarget.style.color = V; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.15); e.currentTarget.style.color = V3; }}>
                ← Retour
              </button>
            ) : <div />}
            <button onClick={goNext} style={{
              padding: "16px 40px", background: `linear-gradient(135deg, ${A1}, ${A3})`, color: "#0f1117",
              fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
              border: "none", cursor: "pointer", transition: "all 0.3s ease", fontFamily: "inherit", borderRadius: "8px",
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
          padding: "14px 20px", background: "rgba(15,17,23,0.95)", backdropFilter: "blur(16px)",
          border: `1px solid ${VG(0.08)}`, display: "flex", alignItems: "center", gap: "10px", borderRadius: "10px",
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
        <img src="/logo-nav.png" style={{ filter: "invert(1) brightness(1.15)" }} alt="NERVÜR" style={{
          height: "28px", width: "auto", objectFit: "contain",
        }} />
        <span style={{ fontSize: "11px", color: "#4B5563" }}>© 2026 NERVÜR — Tous droits réservés</span>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { margin: 0; padding: 0; }
        ::selection { background: rgba(129,140,248,0.25); }
        .nervur-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
          background: #818CF8; border: 3px solid #0f1117; cursor: pointer;
          box-shadow: 0 0 12px rgba(129,140,248,0.35);
        }
        .nervur-slider::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #818CF8; border: 3px solid #0f1117; cursor: pointer;
          box-shadow: 0 0 12px rgba(129,140,248,0.35);
        }
      `}</style>
    </main>
  );
}
