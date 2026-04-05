import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

const V = "#FFFFFF", V2 = "#425466", V3 = "#6B7C93";
const VG = (a) => `rgba(255,255,255,${a})`;
const A1 = "#635BFF", A2 = "#4ADE80", A3 = "#F472B6";

const useIsMobile = (bp = 768) => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
};

const CLIENTS = [
  { name: "TechVision SAS", sector: "SaaS B2B", revenue: "45K€/mois", lastContact: "Il y a 3 jours", usage: 92, satisfaction: 4.6, risk: 8, trend: "stable" },
  { name: "GreenLeaf Bio", sector: "E-commerce", revenue: "28K€/mois", lastContact: "Il y a 18 jours", usage: 41, satisfaction: 2.8, risk: 78, trend: "declining" },
  { name: "Nexus Digital", sector: "Agence", revenue: "15K€/mois", lastContact: "Il y a 6 jours", usage: 73, satisfaction: 3.9, risk: 22, trend: "stable" },
  { name: "Orbit Finance", sector: "Fintech", revenue: "62K€/mois", lastContact: "Il y a 31 jours", usage: 29, satisfaction: 2.1, risk: 94, trend: "declining" },
  { name: "Aqua Systems", sector: "Industrie", revenue: "33K€/mois", lastContact: "Il y a 2 jours", usage: 87, satisfaction: 4.3, risk: 12, trend: "growing" },
  { name: "Stellar Media", sector: "Média", revenue: "19K€/mois", lastContact: "Il y a 12 jours", usage: 55, satisfaction: 3.2, risk: 51, trend: "declining" },
];

const RISK_FACTORS = {
  high: ["Baisse d'utilisation de -63% sur 30j", "Aucun login depuis 2 semaines", "3 tickets support non résolus", "Downgrade de plan demandé"],
  medium: ["Engagement en baisse de -25%", "Temps de session réduit", "Fonctionnalités clés ignorées"],
  low: ["Utilisation régulière", "Score NPS élevé", "Renouvellement récent"]
};

const ACTIONS = {
  high: ["Appel du CSM sous 24h", "Offrir 1 mois gratuit", "Audit de satisfaction prioritaire", "Escalade direction commerciale"],
  medium: ["Email de réengagement personnalisé", "Webinar fonctionnalités avancées", "Check-in CSM cette semaine"],
  low: ["Upsell opportunité détectée", "Programme ambassadeur", "Témoignage client"]
};

export default function PulsePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
      glowRef.current.style.opacity = 1;
    }
  };

  useSEO("PULSE — Prédiction de Churn IA | NERVÜR", "Anticipez la perte de clients grâce à l'IA prédictive. Détectez les signaux de churn et agissez avant qu'il ne soit trop tard.", { path: "/pulse" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const startScan = () => {
    setScanning(true);
    setScanComplete(false);
    setAnalysisStep(0);
    const steps = [1, 2, 3, 4];
    steps.forEach((s, i) => {
      setTimeout(() => setAnalysisStep(s), (i + 1) * 800);
    });
    setTimeout(async () => {
      // Try AI analysis
      try {
        const res = await fetch(`${API_URL}/api/pulse/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clients: CLIENTS.map(c => ({ name: c.name, risk: c.risk, usage: c.usage, satisfaction: c.satisfaction })) }),
        });
        const data = await res.json();
        if (data.analyses) {
          // Enrich CLIENTS with AI insights
          data.analyses.forEach(a => {
            const client = CLIENTS.find(c => c.name === a.name);
            if (client) { client.aiAction = a.action; client.aiFactors = a.factors; }
          });
        }
      } catch (err) { /* silent fallback */ }
      setScanning(false);
      setScanComplete(true);
    }, 4000);
  };

  const getRiskColor = (risk) => risk >= 70 ? "#ef4444" : risk >= 40 ? "#fbbf24" : "#4ADE80";
  const getRiskLabel = (risk) => risk >= 70 ? "CRITIQUE" : risk >= 40 ? "ATTENTION" : "SAIN";
  const getRiskLevel = (risk) => risk >= 70 ? "high" : risk >= 40 ? "medium" : "low";

  const totalAtRisk = CLIENTS.filter(c => c.risk >= 70).length;
  const avgRisk = Math.round(CLIENTS.reduce((a, c) => a + c.risk, 0) / CLIENTS.length);
  const revenueAtRisk = CLIENTS.filter(c => c.risk >= 70).reduce((a, c) => a + parseInt(c.revenue), 0);

  return (
    <div onMouseMove={handleMouseMove} style={{ background: "#FFFFFF", color: "#0A2540", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", minHeight: "100vh", position: "relative" }}>
      <div ref={glowRef} aria-hidden="true" style={{ position: "fixed", left: -100, top: -100, width: "150px", height: "150px", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)", transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s", opacity: 0, mixBlendMode: "screen" }} />

      <style>{`
        .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scanPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes riskPulse { 0%, 100% { box-shadow: 0 0 0 rgba(239,68,68,0); } 50% { box-shadow: 0 0 20px rgba(239,68,68,0.3); } }
      `}</style>

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${VG(0.08)}` }}>
        <LogoNervur height={28} onClick={() => navigate("/")} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" aria-label="Retour aux outils" onClick={() => navigate("/technologies")}>← Technologies</button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>Contact</button>
        </div>
      </nav>

      <main style={{ padding: isMobile ? "100px 16px 60px" : "140px 48px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        {/* RETOUR */}
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => navigate("/")} style={{
            background: "none", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "8px",
            color: "#6B7C93", fontSize: "13px", padding: "8px 20px", cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.target.style.color = "#0A2540"; e.target.style.borderColor = "rgba(0,0,0,0.3)"; }}
            onMouseLeave={e => { e.target.style.color = "#6B7C93"; e.target.style.borderColor = "rgba(0,0,0,0.15)"; }}>
            ← Retour
          </button>
        </div>
        <div style={{ animation: "fadeInUp 0.6s ease both", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <svg width="32" height="32" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <defs><linearGradient id="gp" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f0abfc" /><stop offset="100%" stopColor="#d946ef" /></linearGradient></defs>
              <path d="M13 3C7.48 3 3 7.48 3 13s4.48 10 10 10 10-4.48 10-10" fill="none" stroke="url(#gp)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 7v6l4 2" fill="none" stroke="url(#gp)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 style={{ fontSize: isMobile ? "28px" : "42px", fontWeight: 800, letterSpacing: "-2px" }}>PULSE</h1>
            <span style={{ fontSize: "9px", letterSpacing: "1.5px", color: "#d946ef", border: "1px solid rgba(217,70,239,0.3)", padding: "3px 10px", textTransform: "uppercase" }}>Prédicteur de Churn</span>
          </div>
          <p style={{ fontSize: "15px", color: "#6B7C93", maxWidth: "600px", lineHeight: 1.8 }}>
            Identifiez les clients sur le point de partir avant qu'ils ne le fassent. L'IA analyse les signaux faibles et déclenche des actions préventives.
          </p>
        </div>

        {/* STATS BAR */}
        <section aria-label="Statistiques de risque" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px", marginBottom: "32px", animation: "fadeInUp 0.6s ease 0.1s both" }}>
          {[
            { label: "CLIENTS À RISQUE", value: totalAtRisk, color: "#ef4444", suffix: `/${CLIENTS.length}` },
            { label: "SCORE RISQUE MOYEN", value: `${avgRisk}%`, color: getRiskColor(avgRisk) },
            { label: "REVENU MENACÉ", value: `${revenueAtRisk}K€`, color: "#fbbf24", suffix: "/mois" }
          ].map((s, i) => (
            <div key={i} style={{ padding: "20px", border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.75)" }}>
              <div style={{ fontSize: "9px", color: "#6B7C93", letterSpacing: "2px", marginBottom: "8px" }}>{s.label}</div>
              <span style={{ fontSize: "28px", fontWeight: 800, color: s.color }}>{s.value}</span>
              {s.suffix && <span style={{ fontSize: "14px", color: "#6B7C93", marginLeft: "4px" }}>{s.suffix}</span>}
            </div>
          ))}
        </section>

        {/* SCAN BUTTON */}
        {!scanComplete && (
          <div style={{ textAlign: "center", marginBottom: "32px", animation: "fadeInUp 0.6s ease 0.2s both" }}>
            <button onClick={startScan} disabled={scanning} style={{
              padding: "14px 40px", background: scanning ? "rgba(217,70,239,0.15)" : "linear-gradient(135deg, #d946ef, #a855f7)",
              color: V, border: "none", fontWeight: 700, fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase",
              cursor: scanning ? "wait" : "pointer", transition: "all 0.3s", fontFamily: "inherit"
            }}>
              {scanning ? "ANALYSE EN COURS..." : "LANCER L'ANALYSE PRÉDICTIVE"}
            </button>
            {scanning && (
              <div style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: "24px", fontSize: "10px", letterSpacing: "1px" }}>
                  {["Collecte données", "Analyse comportement", "Calcul prédictif", "Génération alertes"].map((step, i) => (
                    <span key={i} style={{ color: analysisStep > i ? "#d946ef" : "#6B7C93", transition: "color 0.3s", animation: analysisStep === i + 1 ? "scanPulse 0.8s ease infinite" : "none" }}>
                      {analysisStep > i ? "✓ " : analysisStep === i + 1 ? "◉ " : "○ "}{step}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: "12px", height: "3px", background: VG(0.06), maxWidth: "400px", margin: "12px auto 0", overflow: "hidden" }}>
                  <div style={{ width: `${analysisStep * 25}%`, height: "100%", background: "linear-gradient(90deg, #d946ef, #a855f7)", transition: "width 0.5s ease" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* CLIENT TABLE */}
        {scanComplete && (
          <section aria-label="Tableau des clients et risques de churn" style={{ animation: "fadeInUp 0.5s ease both" }}>
            <div style={{ border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.7)", overflow: "hidden", marginBottom: "32px" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 80px" : "2fr 1fr 1fr 1fr 120px", padding: "12px 20px", borderBottom: `1px solid ${VG(0.08)}`, background: "rgba(255,255,255,0.8)" }}>
                {(isMobile ? ["Client", "Risque"] : ["Client", "Revenu", "Utilisation", "Satisfaction", "Risque Churn"]).map((h, i) => (
                  <span key={i} style={{ fontSize: "9px", letterSpacing: "2px", color: "#6B7C93", textTransform: "uppercase", textAlign: i > 0 ? "center" : "left" }}>{h}</span>
                ))}
              </div>
              {/* Rows */}
              {CLIENTS.map((c, i) => (
                <div key={i} onClick={() => setSelectedClient(selectedClient === i ? null : i)}
                  style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 80px" : "2fr 1fr 1fr 1fr 120px", padding: "16px 20px",
                    borderBottom: `1px solid ${VG(0.05)}`, cursor: "pointer", transition: "all 0.3s",
                    background: selectedClient === i ? "rgba(217,70,239,0.05)" : "transparent",
                    borderLeft: selectedClient === i ? "2px solid #d946ef" : "2px solid transparent" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "2px" }}>{c.name}</div>
                    <div style={{ fontSize: "10px", color: "#6B7C93" }}>{c.sector}</div>
                  </div>
                  {!isMobile && <div style={{ textAlign: "center", fontSize: "13px", color: V3, alignSelf: "center" }}>{c.revenue}</div>}
                  {!isMobile && (
                    <div style={{ textAlign: "center", alignSelf: "center" }}>
                      <div role="progressbar" aria-valuenow={c.usage} aria-valuemin={0} aria-valuemax={100} aria-label={`Utilisation : ${c.usage}%`} style={{ height: "4px", background: VG(0.06), borderRadius: "2px", overflow: "hidden", width: "60px", margin: "0 auto" }}>
                        <div style={{ width: `${c.usage}%`, height: "100%", background: c.usage > 70 ? "#4ADE80" : c.usage > 40 ? "#fbbf24" : "#ef4444", borderRadius: "2px" }} />
                      </div>
                      <span aria-hidden="true" style={{ fontSize: "9px", color: "#6B7C93", marginTop: "2px", display: "block" }}>{c.usage}%</span>
                    </div>
                  )}
                  {!isMobile && <div style={{ textAlign: "center", fontSize: "13px", color: c.satisfaction >= 4 ? "#4ADE80" : c.satisfaction >= 3 ? "#fbbf24" : "#ef4444", alignSelf: "center" }}>{"★".repeat(Math.round(c.satisfaction))} {c.satisfaction}</div>}
                  <div style={{ textAlign: "center", alignSelf: "center" }}>
                    <span aria-label={`Risque de churn : ${c.risk}%, niveau ${getRiskLabel(c.risk)}`} style={{ fontSize: "11px", fontWeight: 800, color: getRiskColor(c.risk), padding: "4px 10px", background: `${getRiskColor(c.risk)}15`, border: `1px solid ${getRiskColor(c.risk)}30`, animation: c.risk >= 70 ? "riskPulse 2s ease infinite" : "none" }}>
                      {c.risk}% {getRiskLabel(c.risk)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DETAIL PANEL */}
            {selectedClient !== null && (
              <div style={{ animation: "fadeInUp 0.4s ease both", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
                <div style={{ padding: "24px", border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.7)" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#d946ef", marginBottom: "16px" }}>SIGNAUX DÉTECTÉS</div>
                  {RISK_FACTORS[getRiskLevel(CLIENTS[selectedClient].risk)].map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", borderBottom: `1px solid ${VG(0.05)}` }}>
                      <span aria-hidden="true" style={{ width: "6px", height: "6px", borderRadius: "50%", background: getRiskColor(CLIENTS[selectedClient].risk), flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: V3 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "24px", border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.7)" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#4ADE80", marginBottom: "16px" }}>ACTIONS RECOMMANDÉES</div>
                  {ACTIONS[getRiskLevel(CLIENTS[selectedClient].risk)].map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", borderBottom: `1px solid ${VG(0.05)}` }}>
                      <span style={{ fontSize: "12px", color: "#4ADE80" }}>→</span>
                      <span style={{ fontSize: "12px", color: V2 }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Tarification */}
        <section aria-label="Tarification" className="mb-20" style={{ animation: "fadeInUp 0.8s ease 0.6s both" }}>
          <div className="max-w-[520px] mx-auto border border-[rgba(236,72,153,0.3)] bg-[rgba(236,72,153,0.03)] rounded-2xl text-center relative overflow-hidden" style={{ padding: isMobile ? "32px 24px" : "48px 40px" }}>
            <div className="absolute -top-px left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-[#ec4899] to-transparent" />
            <div className="text-[10px] tracking-[3px] uppercase text-[#ec4899] font-bold mb-6">ABONNEMENT UNIQUE</div>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="font-extrabold text-white leading-none" style={{ fontSize: isMobile ? "48px" : "64px" }}>19€</span>
              <span className="text-base text-[#6B7C93] font-semibold">/mois</span>
            </div>
            <p className="text-[13px] text-[#6B7C93] mb-7">Sans engagement · Setup offert · Résultats dès le 1er jour</p>
            <div className="text-left mb-8">
              {["Surveillance uptime 24/7", "Certificat SSL & expiration domaine", "Analyse DNS & DMARC", "Headers de sécurité", "Vérification HTTP/2", "Alertes email en temps réel", "Page de statut publique", "Historique de disponibilité"].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <span className="text-[#4ADE80] text-sm min-w-[18px]">✓</span>
                  <span className="text-[13px] text-[#425466]">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/contact')} className="w-full py-3 rounded-xl font-bold text-sm border-0 cursor-pointer transition-all" style={{ background: "#ec4899", color: "#fff" }}>
              Commencer maintenant →
            </button>
          </div>
        </section>

        {/* CTA */}
        <section aria-label="Appel à l'action" style={{ marginTop: "60px", textAlign: "center", padding: isMobile ? "32px 20px" : "48px", border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.6)", animation: "fadeInUp 0.6s ease 0.4s both" }}>
          <h2 style={{ fontSize: isMobile ? "20px" : "28px", fontWeight: 800, marginBottom: "12px", letterSpacing: "-1px" }}>Arrêtez de perdre des clients dans l'ombre.</h2>
          <p style={{ fontSize: "14px", color: "#6B7C93", marginBottom: "28px", maxWidth: "450px", margin: "0 auto 28px", lineHeight: 1.7 }}>PULSE s'intègre à votre CRM et commence à prédire dès le premier jour.</p>
          <button onClick={() => navigate('/contact?outil=pulse')} style={{ padding: "14px 36px", background: V, color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)"; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
            Intégrer Pulse →
          </button>
        </section>
      </main>
    </div>
  );
}
