import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

// ─── NERVÜR DIAGNOSTIC DIGITAL ───
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
  web: { label: "Présence Web", color: V },
  seo: { label: "SEO & Visibilité", color: "#4ADE80" },
  marketing: { label: "Marketing & Contenu", color: "#60A5FA" },
  analytics: { label: "Analytics & Data", color: "#C084FC" },
};

// ═══ QUESTIONS ═══
const QUESTIONS = [
  {
    id: 1, category: "web",
    question: "Avez-vous un site web professionnel ?",
    options: [
      { label: "Non, pas encore", score: 0 },
      { label: "Oui, mais il date de +3 ans", score: 4 },
      { label: "Oui, refait récemment", score: 7 },
      { label: "Oui, moderne et optimisé", score: 10 },
    ],
  },
  {
    id: 2, category: "web",
    question: "Votre site est-il adapté au mobile ?",
    options: [
      { label: "Je ne sais pas", score: 0 },
      { label: "Partiellement", score: 4 },
      { label: "Oui, responsive", score: 8 },
      { label: "Oui, mobile-first", score: 10 },
    ],
  },
  {
    id: 3, category: "web",
    question: "Quelle est la vitesse de chargement de votre site ?",
    options: [
      { label: "Aucune idée", score: 1 },
      { label: "Plutôt lent (+4s)", score: 3 },
      { label: "Correct (2-4s)", score: 6 },
      { label: "Rapide (<2s)", score: 10 },
    ],
  },
  {
    id: 4, category: "seo",
    question: "Apparaissez-vous sur Google pour vos mots-clés ?",
    options: [
      { label: "Je ne suis pas référencé", score: 0 },
      { label: "Au-delà de la page 2", score: 3 },
      { label: "Page 1 sur quelques mots-clés", score: 7 },
      { label: "Top 3 sur mes mots-clés principaux", score: 10 },
    ],
  },
  {
    id: 5, category: "seo",
    question: "Avez-vous une stratégie de contenu / blog ?",
    options: [
      { label: "Non, aucun contenu", score: 0 },
      { label: "Quelques articles anciens", score: 3 },
      { label: "Publication régulière", score: 7 },
      { label: "Stratégie éditoriale complète", score: 10 },
    ],
  },
  {
    id: 6, category: "marketing",
    question: "Êtes-vous actif sur les réseaux sociaux ?",
    options: [
      { label: "Non, pas du tout", score: 0 },
      { label: "Comptes créés mais inactifs", score: 2 },
      { label: "Publications régulières", score: 7 },
      { label: "Stratégie social media + communauté", score: 10 },
    ],
  },
  {
    id: 7, category: "marketing",
    question: "Utilisez-vous la publicité en ligne (Google/Meta Ads) ?",
    options: [
      { label: "Non, jamais", score: 0 },
      { label: "J'ai essayé sans succès", score: 3 },
      { label: "Campagnes occasionnelles", score: 6 },
      { label: "Campagnes optimisées avec suivi ROI", score: 10 },
    ],
  },
  {
    id: 8, category: "marketing",
    question: "Avez-vous une stratégie d'email marketing ?",
    options: [
      { label: "Non", score: 0 },
      { label: "Une newsletter basique", score: 4 },
      { label: "Emails segmentés et réguliers", score: 7 },
      { label: "Automation + séquences personnalisées", score: 10 },
    ],
  },
  {
    id: 9, category: "analytics",
    question: "Suivez-vous les statistiques de votre site ?",
    options: [
      { label: "Non, aucun outil installé", score: 0 },
      { label: "Google Analytics installé mais pas consulté", score: 3 },
      { label: "Je consulte régulièrement mes stats", score: 7 },
      { label: "Tableaux de bord + KPIs suivis", score: 10 },
    ],
  },
  {
    id: 10, category: "analytics",
    question: "Mesurez-vous votre retour sur investissement digital ?",
    options: [
      { label: "Non, pas du tout", score: 0 },
      { label: "Vaguement, au feeling", score: 3 },
      { label: "Oui, pour certains canaux", score: 7 },
      { label: "Oui, tracking complet multi-canal", score: 10 },
    ],
  },
];

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
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={CATEGORIES[categories[i]].color} stroke="#09090B" strokeWidth="2"
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
  if (score >= 85) return { grade: "A", label: "Excellent", color: "#4ADE80", desc: "Votre présence digitale est remarquable. Quelques optimisations pour atteindre la perfection." };
  if (score >= 70) return { grade: "B", label: "Bon", color: "#60A5FA", desc: "Bonne base digitale. Des axes d'amélioration concrets peuvent vous faire passer au niveau supérieur." };
  if (score >= 50) return { grade: "C", label: "Moyen", color: "#FBBF24", desc: "Votre présence digitale a du potentiel mais manque de structure. Un plan d'action ciblé changerait tout." };
  if (score >= 30) return { grade: "D", label: "Insuffisant", color: "#F97316", desc: "Plusieurs fondamentaux manquent. C'est aussi une opportunité — un accompagnement adapté peut tout transformer." };
  return { grade: "E", label: "Critique", color: "#EF4444", desc: "Votre présence digitale est quasi inexistante. La bonne nouvelle : chaque action aura un impact massif." };
};

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════
export default function DiagnosticPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useSEO("Diagnostic Digital Gratuit | NERVÜR", "Évaluez la maturité digitale de votre entreprise en 5 minutes. Diagnostic gratuit avec recommandations personnalisées.", { path: "/diagnostic" });

  // Mouse glow
  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
      glowRef.current.style.opacity = "1";
    }
  };

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
      const totalScore = catQuestions.reduce((sum, q, i) => {
        const qIndex = QUESTIONS.indexOf(q);
        return sum + (answers[qIndex]?.score || 0);
      }, 0);
      catScores[cat] = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    });

    const overall = Math.round(Object.values(catScores).reduce((a, b) => a + b, 0) / Object.keys(catScores).length);
    const gradeInfo = getGrade(overall);

    // Recommendations
    const recs = [];
    if (catScores.web < 60) recs.push({ cat: "web", title: "Refonte site web", desc: "Votre site ne reflète pas votre potentiel. Un site moderne et performant est la base de toute stratégie digitale.", priority: "Haute" });
    if (catScores.seo < 50) recs.push({ cat: "seo", title: "Stratégie SEO complète", desc: "Vous êtes invisible sur Google. Le SEO est le levier le plus rentable à long terme — chaque euro investi continue de travailler.", priority: "Haute" });
    if (catScores.marketing < 50) recs.push({ cat: "marketing", title: "Plan marketing digital", desc: "Réseaux sociaux, publicité, email — plusieurs canaux inexploités pourraient générer des leads qualifiés.", priority: "Moyenne" });
    if (catScores.analytics < 50) recs.push({ cat: "analytics", title: "Mise en place du tracking", desc: "Sans données, impossible d'optimiser. Google Analytics, conversion tracking et KPIs sont essentiels.", priority: "Haute" });
    if (catScores.web >= 60 && catScores.seo < 70) recs.push({ cat: "seo", title: "Optimisation SEO avancée", desc: "Votre site est bien construit. Maintenant, positionnez-le en première page de Google avec une stratégie SEO pointue.", priority: "Moyenne" });
    if (catScores.marketing >= 50 && catScores.marketing < 80) recs.push({ cat: "marketing", title: "Scaling marketing", desc: "Vos efforts marketing portent leurs fruits. L'étape suivante : automatiser et scaler pour maximiser le ROI.", priority: "Moyenne" });

    return { catScores, overall, ...gradeInfo, recs };
  }, [showResults, answers]);

  const progress = ((currentQ + (showResults ? 1 : 0)) / QUESTIONS.length) * 100;
  const q = QUESTIONS[currentQ];

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
        @keyframes rainbowBorder {
          0% { border-color: rgba(129,140,248,0.3); }
          50% { border-color: rgba(244,114,182,0.3); }
          100% { border-color: rgba(129,140,248,0.3); }
        }
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
        background: "#09090B", backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${VG(0.08)}` }}>
        <img src="/logo-nervur.svg" alt="NERVÜR" onClick={() => navigate("/")}
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
            <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#52525B", display: "block", marginBottom: "20px", fontFamily: "monospace" }}>
              // Diagnostic digital
            </span>

            {/* Progress bar */}
            <div style={{ marginBottom: "48px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", letterSpacing: "2px", color: V3, fontFamily: "monospace" }}>
                  Question {String(currentQ + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#52525B" }}>
                  {CATEGORIES[q.category].label}
                </span>
              </div>
              <div style={{ height: "3px", background: VG(0.08), overflow: "hidden" }}>
                <div style={{
                  width: `${progress}%`, height: "100%",
                  background: `linear-gradient(90deg, rgba(129,140,248,0.4), ${A1})`,
                  transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
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
                return (
                  <button key={i} role="radio" aria-checked={isSelected || wasAnswered} onClick={() => selectAnswer(currentQ, i, opt.score)} style={{
                    padding: "22px 28px", background: isSelected ? VG(0.08) : "transparent",
                    border: `1px solid ${isSelected ? V : VG(0.1)}`,
                    color: isSelected ? V : V3, cursor: "pointer",
                    transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                    fontFamily: "inherit", textAlign: "left", fontSize: "15px", fontWeight: isSelected ? 700 : 500,
                    letterSpacing: "0.3px", position: "relative", overflow: "hidden",
                    display: "flex", alignItems: "center", gap: "16px",
                    transform: isSelected ? "translateX(8px)" : "translateX(0)",
                  }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = VG(0.3); e.currentTarget.style.color = V; e.currentTarget.style.transform = "translateX(4px)"; }}}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = VG(0.1); e.currentTarget.style.color = V3; e.currentTarget.style.transform = "translateX(0)"; }}}>
                    {/* Number */}
                    <span style={{
                      fontSize: "11px", fontWeight: 700, color: isSelected ? "#09090B" : "#52525B",
                      background: isSelected ? V : VG(0.06), width: "28px", height: "28px",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      transition: "all 0.3s",
                    }}>
                      {isSelected ? "✓" : String.fromCharCode(65 + i)}
                    </span>
                    {opt.label}
                    {/* Slide accent */}
                    <div style={{
                      position: "absolute", left: 0, top: 0, width: "3px", height: "100%",
                      background: A1, transform: isSelected ? "scaleY(1)" : "scaleY(0)",
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
                border: `1px solid ${VG(0.1)}`, color: "#52525B", fontSize: "12px",
                letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer",
                transition: "all 0.3s", fontFamily: "inherit",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.3); e.currentTarget.style.color = V3; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.1); e.currentTarget.style.color = "#52525B"; }}>
                ← Précédente
              </button>
            )}
          </div>
        )}


        {/* ════════════ RESULTS ════════════ */}
        {showResults && results && (
          <div>
            <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#52525B", display: "block", marginBottom: "20px", fontFamily: "monospace" }}>
              // Résultats du diagnostic
            </span>

            {/* Grade hero */}
            <RevealSection>
              <div style={{
                textAlign: "center", padding: "48px 32px", marginBottom: "48px",
                border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.3)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  width: "300px", height: "300px", borderRadius: "50%",
                  background: `radial-gradient(circle, ${results.color}15 0%, transparent 70%)`,
                  filter: "blur(40px)",
                }} />
                <div style={{ position: "relative", zIndex: 2 }}>
                  <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#52525B", display: "block", marginBottom: "16px" }}>
                    Votre score de maturité digitale
                  </span>
                  <div style={{ fontSize: "clamp(64px, 10vw, 100px)", fontWeight: 900, letterSpacing: "-4px", color: results.color, lineHeight: 1 }}>
                    <AnimatedCounter target={results.overall} suffix="/100" />
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "16px", padding: "8px 20px", border: `1px solid ${results.color}40`, background: `${results.color}10` }}>
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
                border: `1px solid ${VG(0.08)}`, background: VG(0.02),
                textAlign: "center",
              }}>
                <h3 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: V2, marginBottom: "32px", fontWeight: 700 }}>
                  Répartition par catégorie
                </h3>
                <RadarChart scores={results.catScores} />
              </div>
            </RevealSection>

            {/* Category Breakdown */}
            <RevealSection>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "48px" }}>
                {Object.entries(results.catScores).map(([cat, score]) => (
                  <div key={cat} style={{
                    padding: "24px", border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.3)",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: `linear-gradient(90deg, transparent, ${CATEGORIES[cat].color}, transparent)` }} />
                    <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: CATEGORIES[cat].color, display: "block", marginBottom: "12px", fontWeight: 600 }}>
                      {CATEGORIES[cat].label}
                    </span>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: V, marginBottom: "8px" }}>
                      <AnimatedCounter target={score} suffix="%" />
                    </div>
                    <div style={{ height: "4px", background: VG(0.08), overflow: "hidden" }}>
                      <div style={{
                        width: `${score}%`, height: "100%",
                        background: `linear-gradient(90deg, ${CATEGORIES[cat].color}60, ${CATEGORIES[cat].color})`,
                        transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
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
                    Plan d'action recommandé
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {results.recs.map((rec, i) => (
                      <div key={i} style={{
                        padding: "24px 28px", border: `1px solid ${VG(0.1)}`, background: VG(0.03),
                        display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "16px", alignItems: "flex-start",
                        transition: "all 0.3s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.25); e.currentTarget.style.background = VG(0.05); }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.1); e.currentTarget.style.background = VG(0.03); }}>
                        <span style={{
                          fontSize: "16px", fontWeight: 900, color: "#09090B", width: "28px", height: "28px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: CATEGORIES[rec.cat].color,
                        }}>{i + 1}</span>
                        <div>
                          <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>{rec.title}</h4>
                          <p style={{ fontSize: "13px", color: V3, lineHeight: 1.6 }}>{rec.desc}</p>
                        </div>
                        <span style={{
                          fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700,
                          padding: "4px 10px", border: `1px solid ${rec.priority === "Haute" ? "#EF444440" : VG(0.15)}`,
                          color: rec.priority === "Haute" ? "#EF4444" : V3,
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
                border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.4)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  width: "300px", height: "300px", borderRadius: "50%",
                  background: `radial-gradient(circle, ${VG(0.06)} 0%, transparent 70%)`, filter: "blur(40px)",
                }} />
                <div style={{ position: "relative", zIndex: 2 }}>
                  <p style={{ fontSize: "16px", color: V3, marginBottom: "8px" }}>Passez de {results.grade} à A avec</p>
                  <p style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "28px" }}>
                    un accompagnement <span style={{ background: `linear-gradient(135deg, ${A1}, ${A3})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>sur-mesure</span>.
                  </p>
                  <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => navigate("/contact")} style={{
                      padding: "18px 48px", background: `linear-gradient(135deg, ${A1}, ${A3})`, color: "#09090B",
                      fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                      border: "none", cursor: "pointer", transition: "all 0.3s ease", fontFamily: "inherit",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(129,140,248,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                      Discuter avec un expert →
                    </button>
                    <button onClick={() => navigate("/simulateur")} style={{
                      padding: "18px 32px", background: "transparent", border: `1px solid ${VG(0.2)}`,
                      color: V3, fontSize: "13px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                      cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit",
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
                padding: "12px 28px", background: "transparent", border: `1px solid ${VG(0.1)}`,
                color: "#52525B", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.3); e.currentTarget.style.color = V3; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.1); e.currentTarget.style.color = "#52525B"; }}>
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
            padding: "14px 20px", background: "rgba(9,9,11,0.95)", backdropFilter: "blur(16px)",
            border: `1px solid ${VG(0.08)}`, display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ADE80", flexShrink: 0 }} />
            <span style={{ fontSize: "11px", color: V3, letterSpacing: "0.5px" }}>
              ~<strong style={{ color: V }}>2 min</strong> · 100% gratuit
            </span>
          </div>
        </aside>
      )}

      {/* FOOTER */}
      <footer style={{
        padding: isMobile ? "24px 20px" : "32px 48px", borderTop: `1px solid ${VG(0.06)}`,
        display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: isMobile ? "12px" : "0",
      }}>
        <img src="/logo-nervur.svg" alt="NERVÜR" style={{ height: "28px", width: "auto", objectFit: "contain" }} />
        <span style={{ fontSize: "11px", color: "#3F3F46" }}>© 2026 NERVÜR — Tous droits réservés</span>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        * { margin: 0; padding: 0; }
        ::selection { background: rgba(255,255,255,0.15); }
      `}</style>
    </main>
  );
}
