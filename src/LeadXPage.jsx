import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

const V = "#FFFFFF", V3 = "#A1A1AA";
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

const QUESTIONS = [
  { q: "Quel est votre secteur d'activité ?", options: ["Restauration", "E-commerce", "Services B2B", "BTP / Artisan", "Santé", "Autre"], scores: [10, 20, 25, 15, 20, 5] },
  { q: "Quel est votre budget digital annuel ?", options: ["< 2 000€", "2 000 – 5 000€", "5 000 – 15 000€", "15 000€+"], scores: [-10, 10, 30, 50] },
  { q: "Quel est votre objectif principal ?", options: ["Plus de clients", "Automatiser mes process", "Image de marque", "Croissance rapide"], scores: [15, 25, 10, 30] },
  { q: "Quand souhaitez-vous démarrer ?", options: ["Immédiatement", "1 – 3 mois", "3 – 6 mois", "Juste curieux"], scores: [40, 25, 10, -20] },
];

export default function LeadXPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);
  const chatEndRef = useRef(null);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [messages, setMessages] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
      glowRef.current.style.opacity = 1;
    }
  };

  useSEO("LEAD-X — Qualification de Prospects IA | NERVÜR", "Qualifiez vos prospects automatiquement avec l'IA. Scoring, segmentation et recommandations pour optimiser votre conversion.", { path: "/lead-x" });

  useEffect(() => {
    window.scrollTo(0, 0);
    // Initial bot message
    setTimeout(() => {
      setMessages([{ from: "bot", text: "Bonjour ! Je suis Lead-X, votre agent de qualification. Répondez à quelques questions pour voir si nous pouvons vous accompagner." }]);
      setBotTyping(false);
    }, 500);
    setBotTyping(true);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  const handleAnswer = (optionIdx) => {
    if (step >= QUESTIONS.length) return;
    const q = QUESTIONS[step];
    const pts = q.scores[optionIdx];
    const newScore = score + pts;
    const newMessages = [
      ...messages,
      { from: "user", text: q.options[optionIdx] },
    ];
    setMessages(newMessages);
    setScore(newScore);

    if (step < QUESTIONS.length - 1) {
      setBotTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { from: "bot", text: QUESTIONS[step + 1].q }]);
        setBotTyping(false);
        setStep(step + 1);
      }, 800);
    } else {
      setBotTyping(true);
      setTimeout(async () => {
        setShowResult(true);
        const qualified = newScore >= 50;
        setMessages(prev => [...prev, {
          from: "bot",
          text: qualified
            ? `Analyse terminée. Score : ${newScore}/100. Profil : Prospect qualifié ✓ Vous correspondez parfaitement à nos critères. Un créneau de démonstration vous est proposé ci-dessous.`
            : `Analyse terminée. Score : ${newScore}/100. Ce prospect nécessite un accompagnement préalable. Nous vous recommandons de consulter nos ressources gratuites avant de planifier un appel.`
        }]);
        setBotTyping(false);
        // Fetch AI recommendation
        try {
          const answers = newMessages.filter(m => m.from === "user").map(m => m.text);
          const res = await fetch(`${API_URL}/api/leadx/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sector: answers[0], budget: answers[1], objective: answers[2], timeline: answers[3], score: newScore }),
          });
          const data = await res.json();
          if (data.recommendation) setAiRecommendation(data);
        } catch (err) { /* silent fallback */ }
      }, 1200);
    }
  };

  const maxScore = QUESTIONS.reduce((sum, q) => sum + Math.max(...q.scores), 0);
  const scorePercent = Math.max(0, Math.min(100, (score / maxScore) * 100));
  const qualified = score >= 50;

  return (
    <div onMouseMove={handleMouseMove} style={{
      background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      minHeight: "100vh", position: "relative" }}>

      <div ref={glowRef} style={{
        position: "fixed", left: -100, top: -100, width: "150px", height: "150px",
        borderRadius: "50%", pointerEvents: "none", zIndex: 9999,
        background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)",
        transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s",
        opacity: 0, mixBlendMode: "screen",
      }} />

      <style>{`
        .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotPulse { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }
      `}</style>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${VG(0.08)}` }}>
        <img src="/logo-nav.png" style={{ filter: "invert(1) brightness(1.15)" }} alt="NERVÜR" onClick={() => navigate("/")}
          style={{ height: isMobile ? "40px" : "70px", width: "auto", objectFit: "contain", cursor: "pointer" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" aria-label="Retour aux outils" onClick={() => navigate("/technologies")}>← Outils</button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>Contact</button>
        </div>
      </nav>

      <main style={{ padding: isMobile ? "100px 20px 60px" : "160px 48px 80px", maxWidth: "800px", margin: "0 auto" }}>
        {/* HERO */}
        <div style={{ animation: "fadeInUp 0.8s ease both", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <svg width="32" height="32" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <defs><linearGradient id="hero-leadx" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#93c5fd" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
              <path d="M4 4h18v14H8l-4 4V4z" fill="none" stroke="url(#hero-leadx)" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="9" cy="11" r="1" fill="url(#hero-leadx)" /><circle cx="13" cy="11" r="1" fill="url(#hero-leadx)" /><circle cx="17" cy="11" r="1" fill="url(#hero-leadx)" />
            </svg>
            <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#3b82f6", fontWeight: 700, padding: "4px 12px", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "2px" }}>QUALIFICATION</span>
          </div>
          <h1 style={{ fontSize: isMobile ? "36px" : "clamp(42px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: "20px" }}>LEAD-X</h1>
          <p style={{ fontSize: "18px", color: "#71717A", lineHeight: 1.8, maxWidth: "600px" }}>
            Remplacez votre formulaire mort par un agent qui trie vos prospects chauds et rejette les curieux.
          </p>
        </div>

        {/* Score gauge */}
        <section aria-label="Score de qualification" style={{ marginBottom: "24px", padding: "16px 20px", border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.4)", borderRadius: "8px", animation: "fadeInUp 0.8s ease 0.2s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#52525B" }}>Score de qualification</span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: scorePercent > 60 ? "#4ADE80" : scorePercent > 30 ? "#fbbf24" : "#ef4444" }}>{Math.round(scorePercent)}%</span>
          </div>
          <div style={{ height: "6px", borderRadius: "3px", background: VG(0.06), overflow: "hidden" }}>
            <div style={{ width: `${scorePercent}%`, height: "100%", borderRadius: "3px", background: scorePercent > 60 ? "linear-gradient(90deg, #3b82f6, #4ADE80)" : scorePercent > 30 ? "linear-gradient(90deg, #3b82f6, #fbbf24)" : "linear-gradient(90deg, #3b82f6, #ef4444)", transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }} />
          </div>
        </section>

        {/* Chat interface */}
        <section aria-label="Chat de qualification" style={{
          border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.5)", borderRadius: "12px",
          overflow: "hidden", backdropFilter: "blur(12px)", animation: "fadeInUp 0.8s ease 0.3s both" }}>

          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${VG(0.08)}`, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80" }} />
            <span style={{ fontSize: "11px", color: V3, letterSpacing: "1px" }}>Lead-X Agent — En ligne</span>
          </div>

          <div style={{ padding: "20px", minHeight: "300px", maxHeight: "450px", overflowY: "auto" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                marginBottom: "12px", animation: "fadeInUp 0.3s ease both" }}>
                <div style={{
                  maxWidth: "75%", padding: "12px 16px", borderRadius: msg.from === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  background: msg.from === "user" ? "rgba(59,130,246,0.15)" : VG(0.06),
                  color: msg.from === "user" ? "#93c5fd" : V3, fontSize: "13px", lineHeight: 1.6 }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {botTyping && (
              <div style={{ display: "flex", gap: "4px", padding: "12px 16px", background: VG(0.06), borderRadius: "12px 12px 12px 2px", width: "fit-content" }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: V3, animation: `dotPulse 1.4s ease ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}

            {/* Answer buttons */}
            {!showResult && !botTyping && step < QUESTIONS.length && messages.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
                {QUESTIONS[step].options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)} style={{
                    padding: "8px 16px", border: `1px solid ${VG(0.15)}`, background: "transparent",
                    color: V, fontSize: "12px", cursor: "pointer", transition: "all 0.3s",
                    fontFamily: "inherit", borderRadius: "6px" }}
                    onMouseEnter={e => { e.target.style.background = VG(0.08); e.target.style.borderColor = VG(0.3); }}
                    onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.borderColor = VG(0.15); }}>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </section>

        {/* Result & CTA */}
        {showResult && (
          <section aria-label="Résultat de qualification" style={{
            marginTop: "40px", textAlign: "center", padding: isMobile ? "40px 20px" : "60px 48px",
            border: `1px solid ${qualified ? "rgba(74,222,128,0.2)" : VG(0.1)}`,
            background: qualified ? "rgba(74,222,128,0.03)" : "rgba(24,24,27,0.3)",
            borderRadius: "12px", animation: "fadeInUp 0.6s ease both" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>{qualified ? "✓" : "→"}</div>
            <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px", color: qualified ? "#4ADE80" : V }}>
              {qualified ? "Prospect Qualifié" : "Nurturing recommandé"}
            </h2>
            <p style={{ fontSize: "15px", color: "#71717A", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px", lineHeight: 1.7 }}>
              {qualified
                ? "Ce profil correspond à nos critères. Imaginez filtrer automatiquement vos vrais prospects."
                : "Ce profil nécessite un accompagnement. Lead-X le détecte instantanément pour vous."}
            </p>
            <button onClick={() => navigate('/contact?outil=leadx')} style={{
              padding: "16px 40px", background: V, color: "#09090B", border: "none",
              fontWeight: 800, fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.3s ease" }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(255,255,255,0.2)"; }}
              onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
              Réserver un appel →
            </button>
          </section>
        )}
      </main>

      <footer style={{
        padding: isMobile ? "30px 20px" : "40px 48px", borderTop: `1px solid ${VG(0.08)}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
        <span style={{ fontSize: "11px", color: "#52525B", letterSpacing: "1px" }}>NERVÜR © 2026</span>
        <span style={{ fontSize: "11px", color: "#52525B" }}>LEAD-X — Qualificateur de Prospects</span>
      </footer>
    </div>
  );
}
