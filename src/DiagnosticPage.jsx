import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

// ─── NERVÜR DIAGNOSTIC E-RÉPUTATION & CONFORMITÉ ───
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

// ═══ CATEGORIES ═══
const CATEGORIES = {
  reputation: { label: "E-réputation", color: "#818CF8" },
  conformite: { label: "Conformité légale", color: "#4ADE80" },
  presence: { label: "Présence digitale", color: "#60A5FA" },
};

// ═══ QUESTIONS (TPE/PME focused, Yes/No/Je ne sais pas) ═══
const QUESTIONS = [
  // E-réputation (5 questions)
  {
    id: 1, category: "reputation",
    question: "Connaissez-vous votre note Google actuelle ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 2, category: "reputation",
    question: "Gérez-vous activement vos avis Google ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 3, category: "reputation",
    question: "Répondez-vous aux avis de vos clients (positifs et négatifs) ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 4, category: "reputation",
    question: "Surveillez-vous ce qui se dit de votre entreprise en ligne ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 5, category: "reputation",
    question: "Demandez-vous à vos clients satisfaits de laisser un avis ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  // Conformité (5 questions)
  {
    id: 6, category: "conformite",
    question: "Avez-vous des mentions légales sur votre site web ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 7, category: "conformite",
    question: "Votre site a-t-il une bannière de consentement cookies (RGPD) ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 8, category: "conformite",
    question: "Avez-vous une politique de confidentialité à jour ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 9, category: "conformite",
    question: "Savez-vous quelles données personnelles vous collectez sur vos clients ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 10, category: "conformite",
    question: "Avez-vous désigné un responsable de la protection des données (DPO) ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  // Présence digitale (5 questions)
  {
    id: 11, category: "presence",
    question: "Avez-vous un site web professionnel ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 12, category: "presence",
    question: "Votre site est-il adapté aux mobiles (responsive) ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 13, category: "presence",
    question: "Utilisez-vous Google My Business (fiche établissement) ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 14, category: "presence",
    question: "Êtes-vous présent sur les réseaux sociaux professionnels ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
  {
    id: 15, category: "presence",
    question: "Apparaissez-vous dans les résultats Google pour votre activité ?",
    options: [
      { label: "Oui", score: 10 },
      { label: "Non", score: 0 },
      { label: "Je ne sais pas", score: 2 },
    ],
  },
];

// ═══ ANIMATED COUNTER ═══
const AnimatedCounter = ({ target, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => { started.current = false; setCount(0); }, [target]);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current && target > 0) {
        started.current = true;
        let c = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const timer = setInterval(() => { c += step; if (c >= target) { setCount(target); clearInterval(timer); } else setCount(c); }, 30);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

// ═══ REVEAL SECTION ═══
const RevealSection = ({ children }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(32px)",
      transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>{children}</div>
  );
};

// ═══ GRADE LABEL ═══
const getGrade = (score) => {
  if (score >= 85) return { grade: "A", label: "Excellent", color: "#4ADE80", desc: "Votre présence digitale est bien gérée. Quelques optimisations pour atteindre la perfection." };
  if (score >= 70) return { grade: "B", label: "Bon", color: "#60A5FA", desc: "Bonne base. Des axes d'amélioration concrets peuvent vous faire passer au niveau supérieur." };
  if (score >= 50) return { grade: "C", label: "Moyen", color: "#FBBF24", desc: "Votre présence digitale a du potentiel mais manque de structure. Un plan d'action ciblé changerait tout." };
  if (score >= 30) return { grade: "D", label: "Insuffisant", color: "#F97316", desc: "Plusieurs fondamentaux manquent. Un accompagnement adapté peut rapidement améliorer votre situation." };
  return { grade: "E", label: "Critique", color: "#EF4444", desc: "Des actions urgentes sont nécessaires. La bonne nouvelle : chaque amélioration aura un impact immédiat." };
};

// ═══ RADAR CHART (Pure SVG) ═══
const RadarChart = ({ scores, size = 280 }) => {
  const categories = Object.keys(scores);
  const n = categories.length;
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const levels = [0.25, 0.5, 0.75, 1];

  const getPoint = (i, ratio) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
  };

  const dataPoints = categories.map((cat, i) => getPoint(i, scores[cat] / 100));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }} role="img" aria-label="Résultats du diagnostic">
      {/* Grid levels */}
      {levels.map((lvl, li) => (
        <polygon key={li} points={categories.map((_, i) => { const p = getPoint(i, lvl); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" stroke={VG(0.08)} strokeWidth="1" />
      ))}
      {/* Axes */}
      {categories.map((_, i) => {
        const p = getPoint(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={VG(0.06)} strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(" ")}
        fill={VG(0.08)} stroke={V} strokeWidth="2" style={{ transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={CATEGORIES[categories[i]].color} stroke="#0f1117" strokeWidth="2"
          style={{ transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      ))}
      {/* Labels */}
      {categories.map((cat, i) => {
        const p = getPoint(i, 1.22);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", fill: CATEGORIES[cat].color, fontWeight: 600, fontFamily: "inherit" }}>
            {CATEGORIES[cat].label}
          </text>
        );
      })}
    </svg>
  );
};

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════
export default function DiagnosticPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useSEO("Diagnostic E-Réputation & Conformité Gratuit | NERVÜR", "Évaluez la gestion de votre e-réputation et votre conformité RGPD en 3 minutes. Diagnostic gratuit avec recommandations personnalisées.", { path: "/diagnostic" });

  const selectAnswer = (qIndex, optionIndex, score) => {
    setSelectedOption(optionIndex);
    setAnswers(prev => ({ ...prev, [qIndex]: { option: optionIndex, score } }));

    // Auto-advance after animation
    setTimeout(() => {
      setSelectedOption(null);
      if (qIndex < QUESTIONS.length - 1) {
        setCurrentQ(qIndex + 1);
      } else {
        setShowResults(true);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 600);
  };

  // ═══ RESULTS CALCULATION ═══
  const results = useMemo(() => {
    if (!showResults) return null;

    const catScores = {};
    Object.keys(CATEGORIES).forEach(cat => {
      const catQuestions = QUESTIONS.filter(q => q.category === cat);
      const totalPossible = catQuestions.length * 10;
      const totalScore = catQuestions.reduce((sum, q) => {
        const qIndex = QUESTIONS.indexOf(q);
        return sum + (answers[qIndex]?.score || 0);
      }, 0);
      catScores[cat] = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    });

    const overall = Math.round(Object.values(catScores).reduce((a, b) => a + b, 0) / Object.keys(catScores).length);
    const gradeInfo = getGrade(overall);

    // Recommendations based on scores -- only Sentinel and Vault
    const recs = [];

    // Sentinel recommendations (e-reputation)
    if (catScores.reputation < 50) {
      recs.push({
        cat: "reputation",
        tool: "Sentinel",
        title: "Surveillance e-réputation urgente",
        desc: "Vos avis Google ne sont pas gérés. 92% des consommateurs consultent les avis avant d'acheter (Ifop 2024). Sentinel surveille, alerte et vous aide à répondre automatiquement.",
        priority: "Haute",
      });
    } else if (catScores.reputation < 80) {
      recs.push({
        cat: "reputation",
        tool: "Sentinel",
        title: "Optimisation e-réputation",
        desc: "Votre gestion des avis peut être améliorée. Sentinel automatise la surveillance et génère des réponses personnalisées pour améliorer votre note Google.",
        priority: "Moyenne",
      });
    }

    // Vault recommendations (conformity)
    if (catScores.conformite < 50) {
      recs.push({
        cat: "conformite",
        tool: "Vault",
        title: "Mise en conformité RGPD urgente",
        desc: "Votre site présente des risques légaux importants. L'amende moyenne RGPD pour une PME est de 15 000 à 50 000 € (CNIL 2025). Vault génère automatiquement vos mentions légales, politique de confidentialité et bannière cookies.",
        priority: "Haute",
      });
    } else if (catScores.conformite < 80) {
      recs.push({
        cat: "conformite",
        tool: "Vault",
        title: "Renforcement conformité",
        desc: "Quelques points de conformité peuvent être améliorés. Vault vérifie et maintient automatiquement vos documents légaux à jour.",
        priority: "Moyenne",
      });
    }

    // Presence-based recommendations
    if (catScores.presence < 50) {
      recs.push({
        cat: "presence",
        tool: "Sentinel",
        title: "Amélioration de la visibilité",
        desc: "Votre présence en ligne est faible. Sentinel vous aide à améliorer votre visibilité Google grâce à une meilleure gestion de vos avis et de votre fiche établissement.",
        priority: "Haute",
      });
    }

    // If everything is good
    if (recs.length === 0) {
      recs.push({
        cat: "reputation",
        tool: "Sentinel + Vault",
        title: "Maintien et automatisation",
        desc: "Votre présence digitale est bien gérée. Sentinel et Vault peuvent automatiser vos tâches répétitives et vous faire gagner du temps.",
        priority: "Basse",
      });
    }

    return { catScores, overall, ...gradeInfo, recs };
  }, [showResults, answers]);

  const progress = ((currentQ + (showResults ? 1 : 0)) / QUESTIONS.length) * 100;
  const q = QUESTIONS[currentQ];

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
      <div style={{ padding: isMobile ? "90px 20px 0 20px" : "140px 48px 0 48px", maxWidth: "800px", margin: "0 auto" }}>
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

      <div style={{ paddingTop: "20px", paddingBottom: "80px", maxWidth: "800px", margin: "0 auto", padding: isMobile ? "20px 20px 60px" : "20px 48px 80px" }}>

        {/* ════════════ QUIZ MODE ════════════ */}
        {!showResults && (
          <div>
            <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#6B7280", display: "block", marginBottom: "20px", fontFamily: "monospace" }}>
              // Diagnostic e-réputation & conformité
            </span>

            {/* Progress bar */}
            <div style={{ marginBottom: "48px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", letterSpacing: "2px", color: V3, fontFamily: "monospace" }}>
                  Question {String(currentQ + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#6B7280", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: CATEGORIES[q.category].color, display: "inline-block" }} />
                  {CATEGORIES[q.category].label}
                </span>
              </div>
              <div style={{ height: "3px", background: VG(0.08), overflow: "hidden", borderRadius: "2px" }}>
                <div style={{
                  width: `${progress}%`, height: "100%",
                  background: `linear-gradient(90deg, rgba(129,140,248,0.4), ${A1})`,
                  transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)", borderRadius: "2px",
                }} />
              </div>
            </div>

            {/* Question */}
            <h1 style={{
              fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-1.5px",
              lineHeight: 1.2, marginBottom: "40px", maxWidth: "650px",
            }}>
              {q.question}
            </h1>

            {/* Options */}
            <div role="radiogroup" aria-label={q.question} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {q.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const wasAnswered = answers[currentQ]?.option === i;
                // Color-code: Oui = green, Non = red-ish, JNSP = neutral
                const optColor = opt.label === "Oui" ? "#4ADE80" : opt.label === "Non" ? "#F87171" : "#FBBF24";
                return (
                  <button key={i} role="radio" aria-checked={isSelected || wasAnswered} onClick={() => selectAnswer(currentQ, i, opt.score)} style={{
                    padding: "22px 28px", background: isSelected ? VG(0.06) : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isSelected ? optColor : VG(0.08)}`,
                    color: isSelected ? V : V3, cursor: "pointer", borderRadius: "10px",
                    transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                    fontFamily: "inherit", textAlign: "left", fontSize: "15px", fontWeight: isSelected ? 700 : 500,
                    letterSpacing: "0.3px", position: "relative", overflow: "hidden",
                    display: "flex", alignItems: "center", gap: "16px",
                    transform: isSelected ? "translateX(8px)" : "translateX(0)",
                  }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = VG(0.2); e.currentTarget.style.color = V; e.currentTarget.style.transform = "translateX(4px)"; }}}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = VG(0.08); e.currentTarget.style.color = V3; e.currentTarget.style.transform = "translateX(0)"; }}}>
                    {/* Letter */}
                    <span style={{
                      fontSize: "11px", fontWeight: 700, color: isSelected ? "#0f1117" : "#6B7280",
                      background: isSelected ? optColor : VG(0.06), width: "28px", height: "28px", borderRadius: "6px",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      transition: "all 0.3s",
                    }}>
                      {isSelected ? "✓" : String.fromCharCode(65 + i)}
                    </span>
                    {opt.label}
                    {/* Slide accent */}
                    <div style={{
                      position: "absolute", left: 0, top: 0, width: "3px", height: "100%",
                      background: optColor, transform: isSelected ? "scaleY(1)" : "scaleY(0)", borderRadius: "2px",
                      transformOrigin: "top", transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    }} />
                  </button>
                );
              })}
            </div>

            {/* Navigation hint */}
            {currentQ > 0 && (
              <button onClick={() => { setCurrentQ(currentQ - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{
                marginTop: "32px", padding: "10px 24px", background: "transparent",
                border: `1px solid ${VG(0.08)}`, color: "#6B7280", fontSize: "12px", borderRadius: "8px",
                letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer",
                transition: "all 0.3s", fontFamily: "inherit",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.2); e.currentTarget.style.color = V3; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.08); e.currentTarget.style.color = "#6B7280"; }}>
                ← Précédente
              </button>
            )}
          </div>
        )}


        {/* ════════════ RESULTS ════════════ */}
        {showResults && results && (
          <div>
            <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#6B7280", display: "block", marginBottom: "20px", fontFamily: "monospace" }}>
              // Résultats du diagnostic
            </span>

            {/* Grade hero */}
            <RevealSection>
              <div style={{
                textAlign: "center", padding: "48px 32px", marginBottom: "48px",
                border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)",
                position: "relative", overflow: "hidden", borderRadius: "16px",
              }}>
                <div style={{ position: "relative", zIndex: 2 }}>
                  <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#6B7280", display: "block", marginBottom: "16px" }}>
                    Votre score global
                  </span>
                  <div style={{ fontSize: "clamp(64px, 10vw, 100px)", fontWeight: 900, letterSpacing: "-4px", color: results.color, lineHeight: 1 }}>
                    <AnimatedCounter target={results.overall} suffix="/100" />
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "16px", padding: "8px 20px", border: `1px solid ${results.color}40`, background: `${results.color}10`, borderRadius: "8px" }}>
                    <span style={{ fontSize: "18px", fontWeight: 900, color: results.color }}>{results.grade}</span>
                    <span style={{ fontSize: "13px", color: results.color, fontWeight: 600 }}>{results.label}</span>
                  </div>
                  <p style={{ fontSize: "15px", color: V3, lineHeight: 1.7, maxWidth: "500px", margin: "20px auto 0" }}>
                    {results.desc}
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Radar Chart */}
            <RevealSection>
              <div style={{
                padding: "40px 32px", marginBottom: "48px",
                border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)",
                textAlign: "center", borderRadius: "12px",
              }}>
                <h3 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V2, marginBottom: "32px", fontWeight: 700 }}>
                  Répartition par catégorie
                </h3>
                <RadarChart scores={results.catScores} />
              </div>
            </RevealSection>

            {/* Category Breakdown */}
            <RevealSection>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px", marginBottom: "48px" }}>
                {Object.entries(results.catScores).map(([cat, score]) => (
                  <div key={cat} style={{
                    padding: "24px", border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)",
                    position: "relative", overflow: "hidden", borderRadius: "12px",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: `linear-gradient(90deg, transparent, ${CATEGORIES[cat].color}, transparent)` }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: CATEGORIES[cat].color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: CATEGORIES[cat].color, fontWeight: 600 }}>
                        {CATEGORIES[cat].label}
                      </span>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: V, marginBottom: "8px" }}>
                      <AnimatedCounter target={score} suffix="%" />
                    </div>
                    <div style={{ height: "4px", background: VG(0.08), overflow: "hidden", borderRadius: "2px" }}>
                      <div style={{
                        width: `${score}%`, height: "100%",
                        background: `linear-gradient(90deg, ${CATEGORIES[cat].color}60, ${CATEGORIES[cat].color})`,
                        transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)", borderRadius: "2px",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </RevealSection>

            {/* Recommendations */}
            {results.recs.length > 0 && (
              <RevealSection>
                <div style={{ marginBottom: "48px" }}>
                  <h3 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V2, marginBottom: "20px", fontWeight: 700 }}>
                    Recommandations personnalisées
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {results.recs.map((rec, i) => (
                      <div key={i} style={{
                        padding: "24px 28px", border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)",
                        display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "16px", alignItems: "flex-start",
                        transition: "all 0.3s", borderRadius: "12px",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.15); e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.08); e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
                        <span style={{
                          fontSize: "16px", fontWeight: 900, color: "#0f1117", width: "28px", height: "28px",
                          display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px",
                          background: CATEGORIES[rec.cat].color,
                        }}>{i + 1}</span>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{rec.title}</h4>
                            <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 8px", background: "rgba(129,140,248,0.15)", color: A1, borderRadius: "4px", fontWeight: 700 }}>
                              {rec.tool}
                            </span>
                          </div>
                          <p style={{ fontSize: "13px", color: V3, lineHeight: 1.6 }}>{rec.desc}</p>
                        </div>
                        <span style={{
                          fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700,
                          padding: "4px 10px", border: `1px solid ${rec.priority === "Haute" ? "#EF444440" : VG(0.12)}`,
                          color: rec.priority === "Haute" ? "#EF4444" : rec.priority === "Moyenne" ? "#FBBF24" : V3, borderRadius: "4px",
                        }}>{rec.priority}</span>
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
                border: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.02)",
                position: "relative", overflow: "hidden", borderRadius: "16px",
              }}>
                <div style={{ position: "relative", zIndex: 2 }}>
                  <p style={{ fontSize: "16px", color: V3, marginBottom: "8px" }}>Passez de {results.grade} à A avec</p>
                  <p style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "28px" }}>
                    <span style={{ background: `linear-gradient(135deg, ${A1}, ${A2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sentinel</span> et{" "}
                    <span style={{ background: `linear-gradient(135deg, ${A2}, ${A1})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Vault</span>.
                  </p>
                  <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => navigate("/contact")} style={{
                      padding: "18px 48px", background: `linear-gradient(135deg, ${A1}, ${A3})`, color: "#0f1117",
                      fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                      border: "none", cursor: "pointer", transition: "all 0.3s ease", fontFamily: "inherit", borderRadius: "8px",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(129,140,248,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                      Discuter avec un expert →
                    </button>
                    <button onClick={() => navigate("/simulateur")} style={{
                      padding: "18px 32px", background: "transparent", border: `1px solid ${VG(0.2)}`,
                      color: V3, fontSize: "13px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                      cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit", borderRadius: "8px",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.4); e.currentTarget.style.color = V; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.2); e.currentTarget.style.color = V3; }}>
                      Calculer mon ROI →
                    </button>
                  </div>
                </div>
              </div>
            </RevealSection>

            {/* Restart */}
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <button onClick={() => { setShowResults(false); setCurrentQ(0); setAnswers({}); window.scrollTo({ top: 0 }); }} style={{
                padding: "12px 28px", background: "transparent", border: `1px solid ${VG(0.08)}`,
                color: "#6B7280", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit", borderRadius: "8px",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.2); e.currentTarget.style.color = V3; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.08); e.currentTarget.style.color = "#6B7280"; }}>
                Refaire le diagnostic
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING BADGE */}
      {!showResults && (
        <aside style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 50 }}>
          <div style={{
            padding: "14px 20px", background: "rgba(15,17,23,0.95)", backdropFilter: "blur(16px)",
            border: `1px solid ${VG(0.08)}`, display: "flex", alignItems: "center", gap: "10px", borderRadius: "10px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ADE80", flexShrink: 0 }} />
            <span style={{ fontSize: "11px", color: V3, letterSpacing: "0.5px" }}>
              ~<strong style={{ color: V }}>3 min</strong> · 100% gratuit
            </span>
          </div>
        </aside>
      )}

      {/* FOOTER */}
      <footer style={{
        padding: isMobile ? "24px 20px" : "32px 48px", borderTop: `1px solid ${VG(0.06)}`,
        display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: isMobile ? "12px" : "0",
      }}>
        <img src="/logo-nav.png" style={{ filter: "invert(1) brightness(1.15)" }} alt="NERVÜR" style={{ height: "28px", width: "auto", objectFit: "contain" }} />
        <span style={{ fontSize: "11px", color: "#4B5563" }}>© 2026 NERVÜR — Tous droits réservés</span>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        * { margin: 0; padding: 0; }
        ::selection { background: rgba(129,140,248,0.25); }
      `}</style>
    </main>
  );
}
