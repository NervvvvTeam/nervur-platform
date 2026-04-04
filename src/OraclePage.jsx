import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

const V = "#F0F1F3", V2 = "#D4D4D8", V3 = "#A1A1AA";
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

const BIZ_TYPES = ["Restaurant", "E-commerce", "Agence", "SaaS", "Commerce de proximité", "Freelance"];
const CHALLENGES = ["Acquérir plus de clients", "Augmenter le panier moyen", "Réduire le turnover", "Digitaliser mes process", "Lancer un nouveau produit", "Développer à l'international"];

// ═══ VERTEX DATA (Propositions Commerciales) ═══
const SECTORS = ["SaaS B2B", "E-commerce", "Agence Marketing", "Conseil RH", "Immobilier"];
const BUDGETS = ["5K – 15K€", "15K – 50K€", "50K – 100K€", "100K+€"];
const NEEDS = ["Refonte site web", "Application mobile", "CRM sur-mesure", "Automatisation process", "Plateforme marketplace"];
const PROPOSAL_SECTIONS = {
  "Refonte site web": {
    title: "Proposition — Refonte Digitale Complète",
    sections: [
      { heading: "1. Audit & Diagnostic", content: "Analyse UX complète de l'existant. Cartographie des parcours utilisateurs. Benchmark concurrentiel sur 5 acteurs. Rapport de recommandations priorisées." },
      { heading: "2. Direction Artistique", content: "3 pistes créatives alignées avec votre positionnement. Moodboard, typographies, palette. Design system complet (composants réutilisables)." },
      { heading: "3. Développement", content: "Architecture headless (Next.js + CMS). Responsive-first. Optimisation Core Web Vitals. Intégration analytics avancé." },
      { heading: "4. Déploiement & Suivi", content: "Migration SEO sans perte de trafic. Formation équipe. Support 90 jours post-lancement. Monitoring performances." }
    ]
  },
  "Application mobile": {
    title: "Proposition — Application Mobile Native",
    sections: [
      { heading: "1. Discovery & Cadrage", content: "Ateliers de co-conception (5 sessions). User stories & personas. Architecture fonctionnelle. Prototype interactif Figma." },
      { heading: "2. Design UI/UX", content: "Design system mobile-first. Micro-interactions & animations. Tests utilisateurs sur prototype. Accessibilité AA." },
      { heading: "3. Développement Natif", content: "React Native (iOS + Android). API RESTful sécurisée. Push notifications. Mode offline-first." },
      { heading: "4. Lancement", content: "Publication App Store & Play Store. ASO (App Store Optimization). Onboarding utilisateur intégré. Analytics embarqué." }
    ]
  },
  "CRM sur-mesure": {
    title: "Proposition — CRM Sur-Mesure Intelligent",
    sections: [
      { heading: "1. Analyse Processus", content: "Mapping complet du cycle de vente. Identification des points de friction. Intégrations existantes à conserver. KPIs à tracker." },
      { heading: "2. Architecture", content: "Base de données relationnelle optimisée. API GraphQL. Système de permissions granulaire. Pipeline de données temps réel." },
      { heading: "3. Développement", content: "Dashboard exécutif personnalisable. Automatisation séquences email. Scoring leads IA. Rapports PDF automatiques." },
      { heading: "4. Formation & Support", content: "Formation équipe commerciale (2 jours). Documentation vidéo. Support dédié 6 mois. Évolutions itératives." }
    ]
  },
  "Automatisation process": {
    title: "Proposition — Automatisation Intelligente",
    sections: [
      { heading: "1. Cartographie", content: "Audit des processus manuels. Identification des tâches automatisables. Calcul du ROI par processus. Priorisation impact/effort." },
      { heading: "2. Architecture Technique", content: "Orchestrateur de workflows (n8n/custom). Connecteurs API sur-mesure. File d'attente asynchrone. Monitoring & alertes." },
      { heading: "3. Implémentation", content: "Automatisation par lots itératifs. Tests de non-régression. Fallback manuel intégré. Documentation technique complète." },
      { heading: "4. Optimisation Continue", content: "Tableau de bord performances. Alertes anomalies. Rapport mensuel gains. Évolutions trimestrielles." }
    ]
  },
  "Plateforme marketplace": {
    title: "Proposition — Plateforme Marketplace",
    sections: [
      { heading: "1. Stratégie & Modèle", content: "Définition du business model (commission, abonnement). Étude de marché. Parcours vendeur & acheteur. MVP features list." },
      { heading: "2. Architecture Plateforme", content: "Multi-tenant SaaS. Système de paiement (Stripe Connect). Gestion des litiges. Moteur de recherche & filtres." },
      { heading: "3. Développement", content: "Back-office vendeur & admin. Système d'avis vérifiés. Messagerie intégrée. Tableau de bord analytics." },
      { heading: "4. Go-to-Market", content: "Stratégie d'amorçage (chicken & egg). SEO marketplace. Programme early adopters. Itérations post-lancement." }
    ]
  }
};

const FALLBACK = {
  diagnostic: "Votre défi principal est d'acquérir de nouveaux clients dans un marché compétitif. La clé est de combiner acquisition digitale et fidélisation.",
  opportunities: [
    { title: "SEO local + Google Business", impact: "fort", effort: "moyen", description: "Optimiser votre présence locale pour capter les recherches de proximité." },
    { title: "Programme de parrainage", impact: "moyen", effort: "faible", description: "Vos clients satisfaits sont vos meilleurs ambassadeurs." },
    { title: "Automatisation email", impact: "fort", effort: "moyen", description: "Séquences automatisées pour convertir les prospects en clients." },
  ],
  actions: [
    { priority: 1, action: "Optimiser la fiche Google Business Profile", timeline: "1 semaine", expectedResult: "+30% visibilité locale" },
    { priority: 2, action: "Créer une landing page dédiée", timeline: "2 semaines", expectedResult: "+25% conversions" },
    { priority: 3, action: "Mettre en place le retargeting publicitaire", timeline: "1 mois", expectedResult: "+15% taux de retour" },
    { priority: 4, action: "Lancer un programme de fidélité", timeline: "6 semaines", expectedResult: "+20% rétention" },
  ],
  kpis: [
    { name: "Coût d'acquisition client", target: "< 25€", timeline: "3 mois" },
    { name: "Taux de conversion site", target: "> 3.5%", timeline: "2 mois" },
    { name: "Net Promoter Score", target: "> 50", timeline: "6 mois" },
  ],
  quote: "La meilleure façon de prédire l'avenir, c'est de le créer. — Peter Drucker"
};

export default function OraclePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);
  const [businessType, setBusinessType] = useState("");
  const [revenue, setRevenue] = useState("");
  const [employees, setEmployees] = useState("");
  const [challenge, setChallenge] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [visibleSections, setVisibleSections] = useState(0);
  const [activeTab, setActiveTab] = useState("strategie");
  // Vertex states
  const [vStep, setVStep] = useState(0);
  const [vCompanyName, setVCompanyName] = useState("");
  const [vSector, setVSector] = useState("");
  const [vBudget, setVBudget] = useState("");
  const [vNeed, setVNeed] = useState("");
  const [vGenerating, setVGenerating] = useState(false);
  const [vProposal, setVProposal] = useState(null);
  const [vVisibleSections, setVVisibleSections] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleMouseMove = (e) => {
    if (glowRef.current) { glowRef.current.style.left = e.clientX + "px"; glowRef.current.style.top = e.clientY + "px"; glowRef.current.style.opacity = 1; }
  };

  useSEO("ORACLE — Stratégie & Propositions IA | NERVÜR", "Générez des propositions commerciales et stratégies marketing sur-mesure grâce à l'intelligence artificielle.", { path: "/oracle" });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const startAnalysis = async () => {
    if (!businessType || !challenge) return;
    setAnalyzing(true);
    setAnalysis(null);
    setVisibleSections(0);

    let result = null;
    try {
      const res = await fetch(`${API_URL}/api/oracle/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType, revenue, employees, challenge }),
      });
      const data = await res.json();
      if (data.analysis) result = data.analysis;
    } catch (err) { /* fallback */ }

    setTimeout(() => {
      setAnalysis(result || FALLBACK);
      setAnalyzing(false);
      [1, 2, 3, 4, 5].forEach((s, i) => {
        setTimeout(() => setVisibleSections(s), (i + 1) * 400);
      });
    }, result ? 500 : 3000);
  };

  // Vertex proposal generation
  const generateProposal = async () => {
    setVGenerating(true);
    setVVisibleSections(0);
    try {
      const res = await fetch(`${API_URL}/api/vertex/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: vCompanyName, sector: vSector, budget: vBudget, need: vNeed }),
      });
      const data = await res.json();
      if (data.proposal) {
        setVProposal(data.proposal);
        setVGenerating(false);
        [1, 2, 3, 4].forEach((s, i) => { setTimeout(() => setVVisibleSections(s), (i + 1) * 500); });
        return;
      }
    } catch (err) { /* fallback */ }
    const data = PROPOSAL_SECTIONS[vNeed] || PROPOSAL_SECTIONS["Refonte site web"];
    setTimeout(() => {
      setVProposal(data);
      setVGenerating(false);
      [1, 2, 3, 4].forEach((s, i) => { setTimeout(() => setVVisibleSections(s), (i + 1) * 500); });
    }, 2500);
  };

  const canProceed = () => {
    if (vStep === 0) return vCompanyName.length > 1;
    if (vStep === 1) return !!vSector;
    if (vStep === 2) return !!vBudget;
    if (vStep === 3) return !!vNeed;
    return false;
  };

  const impactColor = (i) => i === "fort" ? "#4ADE80" : i === "moyen" ? "#fbbf24" : "#71717A";
  const effortColor = (e) => e === "faible" ? "#4ADE80" : e === "moyen" ? "#fbbf24" : "#ef4444";

  return (
    <div onMouseMove={handleMouseMove} style={{ background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", minHeight: "100vh", position: "relative" }}>
      <div ref={glowRef} style={{ position: "fixed", left: -100, top: -100, width: "150px", height: "150px", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)", transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s", opacity: 0, mixBlendMode: "screen" }} />

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
      `}</style>

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#09090B", borderBottom: `1px solid ${VG(0.1)}` }}>
        <LogoNervur height={28} onClick={() => navigate("/")} />
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="nav-btn" onClick={() => navigate('/technologies')} aria-label="Retour aux outils">← Outils</button>
          <button className="nav-btn" onClick={() => navigate('/contact')}>Contact</button>
        </div>
      </nav>

      <main style={{ paddingTop: isMobile ? "90px" : "140px", maxWidth: "900px", margin: "0 auto", padding: isMobile ? "90px 20px 60px" : "140px 48px 80px" }}>
        <div style={{ animation: "fadeInUp 0.8s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "#a78bfa", textTransform: "uppercase", background: "rgba(167,139,250,0.1)", padding: "4px 12px", borderRadius: "20px", border: "1px solid rgba(167,139,250,0.2)" }}>STRATÉGIE</span>
          </div>
          <h1 style={{ fontSize: isMobile ? "42px" : "64px", fontWeight: 900, letterSpacing: "-2px", margin: 0 }}>ORACLE</h1>
          <p style={{ fontSize: "16px", color: V3, maxWidth: "500px", lineHeight: 1.7, marginTop: "12px" }}>Votre conseiller stratégique IA. Décrivez votre entreprise et votre défi — Oracle génère un plan d'action sur-mesure.</p>
        </div>

        {/* Stats */}
        <section aria-label="Statistiques Oracle" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px", margin: "40px 0", animation: "fadeInUp 0.8s ease 0.2s both" }}>
          {[{ val: "500+", label: "ANALYSES GÉNÉRÉES" }, { val: "94%", label: "TAUX DE SATISFACTION" }, { val: "x2.7", label: "CROISSANCE MOYENNE" }].map((s, i) => (
            <div key={i} style={{ background: `rgba(24,24,27,0.4)`, border: `1px solid ${VG(0.1)}`, borderRadius: "12px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: V }}>{s.val}</div>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: V3, marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* TABS */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", animation: "fadeInUp 0.8s ease 0.35s both" }}>
          {[
            { key: "strategie", label: "Analyse stratégique", color: "#a78bfa" },
            { key: "proposition", label: "Proposition commerciale", color: "#f59e0b" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "10px 24px", fontSize: "11px", letterSpacing: "1.5px",
              textTransform: "uppercase", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              background: activeTab === tab.key ? `${tab.color}20` : "transparent",
              border: `1px solid ${activeTab === tab.key ? `${tab.color}60` : VG(0.1)}`,
              color: activeTab === tab.key ? tab.color : "#52525B",
              transition: "all 0.3s", borderRadius: "8px",
            }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === "strategie" && (<>
        {/* Form */}
        <section aria-label="Formulaire d'analyse stratégique" style={{ background: `rgba(24,24,27,0.4)`, border: `1px solid ${VG(0.1)}`, borderRadius: "16px", padding: isMobile ? "24px" : "32px", animation: "fadeInUp 0.8s ease 0.4s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a78bfa" }} />
            <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "1px" }}>Décrivez votre entreprise</span>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", letterSpacing: "1.5px", color: V3, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Type d'entreprise</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {BIZ_TYPES.map(t => (
                <button key={t} onClick={() => setBusinessType(t)} style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${businessType === t ? "#a78bfa" : VG(0.12)}`, background: businessType === t ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.03)", color: businessType === t ? "#a78bfa" : V3, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "11px", letterSpacing: "1.5px", color: V3, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>CA annuel (optionnel)</label>
              <input value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="Ex: 200K€" style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: `1px solid ${VG(0.12)}`, borderRadius: "8px", color: V, fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "11px", letterSpacing: "1.5px", color: V3, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Nombre d'employés (optionnel)</label>
              <input value={employees} onChange={e => setEmployees(e.target.value)} placeholder="Ex: 12" style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: `1px solid ${VG(0.12)}`, borderRadius: "8px", color: V, fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "11px", letterSpacing: "1.5px", color: V3, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Votre défi principal</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CHALLENGES.map(c => (
                <button key={c} onClick={() => setChallenge(c)} style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${challenge === c ? "#a78bfa" : VG(0.12)}`, background: challenge === c ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.03)", color: challenge === c ? "#a78bfa" : V3, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{c}</button>
              ))}
            </div>
          </div>

          <button onClick={startAnalysis} disabled={analyzing || !businessType || !challenge} style={{ padding: "14px 32px", background: analyzing ? "#52525b" : "linear-gradient(135deg, #a78bfa, #7c3aed)", border: "none", borderRadius: "8px", color: V, fontSize: "12px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", cursor: analyzing ? "wait" : "pointer", fontFamily: "inherit", opacity: (!businessType || !challenge) ? 0.4 : 1, transition: "all 0.3s" }}>
            {analyzing ? "ANALYSE EN COURS..." : "LANCER L'ANALYSE STRATÉGIQUE →"}
          </button>
        </section>

        {/* Results */}
        {analysis && (
          <section aria-label="Résultats de l'analyse" style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Diagnostic */}
            {visibleSections >= 1 && (
              <div style={{ background: `rgba(24,24,27,0.4)`, border: `1px solid ${VG(0.1)}`, borderRadius: "12px", padding: "24px", animation: "fadeInUp 0.5s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: "#a78bfa", background: "rgba(167,139,250,0.15)", padding: "3px 10px", borderRadius: "12px" }}>DIAGNOSTIC</span>
                </div>
                <p style={{ fontSize: "15px", color: V2, lineHeight: 1.7, margin: 0 }}>{analysis.diagnostic}</p>
              </div>
            )}

            {/* Opportunities */}
            {visibleSections >= 2 && (
              <div style={{ background: `rgba(24,24,27,0.4)`, border: `1px solid ${VG(0.1)}`, borderRadius: "12px", padding: "24px", animation: "fadeInUp 0.5s ease" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "1px", marginBottom: "16px" }}>Opportunités identifiées</h3>
                {analysis.opportunities?.map((o, i) => (
                  <div key={i} style={{ padding: "14px 0", borderBottom: i < analysis.opportunities.length - 1 ? `1px solid ${VG(0.06)}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px" }}>{o.title}</span>
                      <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "10px", background: `${impactColor(o.impact)}20`, color: impactColor(o.impact), fontWeight: 700, letterSpacing: "1px" }}>IMPACT {o.impact?.toUpperCase()}</span>
                      <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "10px", background: `${effortColor(o.effort)}20`, color: effortColor(o.effort), fontWeight: 700, letterSpacing: "1px" }}>EFFORT {o.effort?.toUpperCase()}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: V3, margin: 0 }}>{o.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {visibleSections >= 3 && (
              <div style={{ background: `rgba(24,24,27,0.4)`, border: `1px solid ${VG(0.1)}`, borderRadius: "12px", padding: "24px", animation: "fadeInUp 0.5s ease" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "1px", marginBottom: "16px" }}>Plan d'action prioritaire</h3>
                {analysis.actions?.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px", padding: "12px 0", borderBottom: i < analysis.actions.length - 1 ? `1px solid ${VG(0.06)}` : "none" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(167,139,250,0.15)", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px", flexShrink: 0 }}>{a.priority}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{a.action}</div>
                      <div style={{ fontSize: "12px", color: V3 }}>
                        <span style={{ marginRight: "16px" }}>Délai : {a.timeline}</span>
                        <span style={{ color: "#4ADE80" }}>Résultat : {a.expectedResult}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* KPIs */}
            {visibleSections >= 4 && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px", animation: "fadeInUp 0.5s ease" }}>
                {analysis.kpis?.map((k, i) => (
                  <div key={i} style={{ background: `rgba(24,24,27,0.4)`, border: `1px solid ${VG(0.1)}`, borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: V3, marginBottom: "8px", textTransform: "uppercase" }}>{k.name}</div>
                    <div style={{ fontSize: "24px", fontWeight: 900, color: "#a78bfa" }}>{k.target}</div>
                    <div style={{ fontSize: "11px", color: V3, marginTop: "4px" }}>Objectif : {k.timeline}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Quote */}
            {visibleSections >= 5 && analysis.quote && (
              <div style={{ textAlign: "center", padding: "32px", fontStyle: "italic", color: V3, fontSize: "15px", lineHeight: 1.7, animation: "fadeInUp 0.5s ease" }}>
                "{analysis.quote}"
              </div>
            )}
          </section>
        )}

        {/* CTA */}
        <section aria-label="Appel à l'action" style={{ marginTop: "60px", textAlign: "center", padding: "48px", border: `1px solid ${VG(0.1)}`, borderRadius: "16px", animation: "fadeInUp 0.8s ease 0.6s both" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>Passez à l'action avec Oracle</h2>
          <p style={{ color: V3, marginBottom: "24px" }}>Notre équipe met en place votre plan stratégique personnalisé.</p>
          <button className="nav-btn" onClick={() => navigate('/contact?outil=oracle')} style={{ padding: "14px 36px", background: V, color: "#09090B", fontWeight: 700, border: "none" }}>RÉSERVER UN APPEL →</button>
        </section>
        </>)}

        {activeTab === "proposition" && (<>
          {/* VERTEX PROGRESS */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "32px", animation: "fadeInUp 0.6s ease 0.1s both" }}>
            {["Entreprise", "Secteur", "Budget", "Besoin"].map((s, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: "3px", background: i <= vStep ? "linear-gradient(90deg, #f59e0b, #fde68a)" : VG(0.08), transition: "background 0.5s", marginBottom: "6px", borderRadius: "2px" }} />
                <span style={{ fontSize: "9px", letterSpacing: "1px", color: i <= vStep ? "#f59e0b" : "#52525B" }}>{s}</span>
              </div>
            ))}
          </div>

          {/* VERTEX FORM STEPS */}
          {!vProposal && !vGenerating && (
            <div style={{ border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.4)", borderRadius: "16px", padding: isMobile ? "24px" : "40px", animation: "fadeInUp 0.5s ease both" }}>
              {vStep === 0 && (
                <div>
                  <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "12px" }}>NOM DE L'ENTREPRISE</label>
                  <input value={vCompanyName} onChange={e => setVCompanyName(e.target.value)} placeholder="Ex: Acme Corp"
                    style={{ width: "100%", padding: "14px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`, borderRadius: "8px", color: V, fontSize: "16px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
              )}
              {vStep === 1 && (
                <div>
                  <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "12px" }}>SECTEUR D'ACTIVITÉ</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {SECTORS.map(s => (
                      <button key={s} onClick={() => setVSector(s)} style={{
                        padding: "10px 20px", background: vSector === s ? "rgba(245,158,11,0.15)" : VG(0.04),
                        border: `1px solid ${vSector === s ? "rgba(245,158,11,0.5)" : VG(0.1)}`, color: vSector === s ? "#fde68a" : V3,
                        fontSize: "13px", cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit", borderRadius: "8px"
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {vStep === 2 && (
                <div>
                  <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "12px" }}>BUDGET ESTIMÉ</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {BUDGETS.map(b => (
                      <button key={b} onClick={() => setVBudget(b)} style={{
                        padding: "10px 20px", background: vBudget === b ? "rgba(245,158,11,0.15)" : VG(0.04),
                        border: `1px solid ${vBudget === b ? "rgba(245,158,11,0.5)" : VG(0.1)}`, color: vBudget === b ? "#fde68a" : V3,
                        fontSize: "13px", cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit", borderRadius: "8px"
                      }}>{b}</button>
                    ))}
                  </div>
                </div>
              )}
              {vStep === 3 && (
                <div>
                  <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "12px" }}>TYPE DE PROJET</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {NEEDS.map(n => (
                      <button key={n} onClick={() => setVNeed(n)} style={{
                        padding: "14px 20px", background: vNeed === n ? "rgba(245,158,11,0.15)" : VG(0.04),
                        border: `1px solid ${vNeed === n ? "rgba(245,158,11,0.5)" : VG(0.1)}`, color: vNeed === n ? "#fde68a" : V3,
                        fontSize: "13px", cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit", textAlign: "left", borderRadius: "8px"
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between" }}>
                {vStep > 0 && <button onClick={() => setVStep(vStep - 1)} aria-label="Étape précédente" style={{ padding: "10px 24px", background: "transparent", border: `1px solid ${VG(0.15)}`, borderRadius: "8px", color: V3, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>← Retour</button>}
                <button onClick={() => vStep < 3 ? setVStep(vStep + 1) : generateProposal()} disabled={!canProceed()}
                  style={{ padding: "10px 24px", background: canProceed() ? "linear-gradient(135deg, #f59e0b, #d97706)" : VG(0.06), border: "none", borderRadius: "8px", color: canProceed() ? "#09090B" : "#52525B", fontSize: "12px", fontWeight: 700, cursor: canProceed() ? "pointer" : "not-allowed", fontFamily: "inherit", marginLeft: "auto", letterSpacing: "1px", textTransform: "uppercase" }}>
                  {vStep < 3 ? "Suivant →" : "Générer la proposition →"}
                </button>
              </div>
            </div>
          )}

          {/* GENERATING */}
          {vGenerating && (
            <div style={{ textAlign: "center", padding: "60px 20px", border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.4)", borderRadius: "16px", animation: "fadeInUp 0.5s ease both" }}>
              <div style={{ fontSize: "14px", color: "#f59e0b", marginBottom: "16px" }}>Génération de la proposition pour {vCompanyName}...</div>
              <div style={{ height: "3px", background: VG(0.06), maxWidth: "300px", margin: "0 auto", overflow: "hidden", borderRadius: "2px" }}>
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, #f59e0b, #fde68a)", animation: "fadeInUp 2.5s ease both" }} />
              </div>
            </div>
          )}

          {/* PROPOSAL */}
          {vProposal && (
            <div style={{ animation: "fadeInUp 0.5s ease both" }}>
              <div style={{ border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.4)", overflow: "hidden", borderRadius: "16px" }}>
                <div style={{ padding: "24px 32px", borderBottom: `1px solid ${VG(0.08)}`, background: "rgba(245,158,11,0.05)" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#52525B", marginBottom: "8px" }}>NERVÜR — PROPOSITION COMMERCIALE</div>
                  <h2 style={{ fontSize: isMobile ? "20px" : "26px", fontWeight: 800, letterSpacing: "-1px" }}>{vProposal.title}</h2>
                  <div style={{ marginTop: "12px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", color: V3 }}>Client : <strong style={{ color: V }}>{vCompanyName}</strong></span>
                    <span style={{ fontSize: "11px", color: V3 }}>Secteur : <strong style={{ color: V }}>{vSector}</strong></span>
                    <span style={{ fontSize: "11px", color: V3 }}>Budget : <strong style={{ color: "#f59e0b" }}>{vBudget}</strong></span>
                  </div>
                </div>
                {vProposal.sections.map((s, i) => (
                  <div key={i} style={{
                    padding: "24px 32px", borderBottom: `1px solid ${VG(0.05)}`,
                    opacity: vVisibleSections > i ? 1 : 0, transform: vVisibleSections > i ? "translateY(0)" : "translateY(12px)",
                    transition: "all 0.5s ease"
                  }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px", color: "#fde68a" }}>{s.heading}</h3>
                    <p style={{ fontSize: "13px", color: V3, lineHeight: 1.8 }}>{s.content}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "20px", display: "flex", gap: "12px", justifyContent: "center" }}>
                <button onClick={() => { setVProposal(null); setVStep(0); setVCompanyName(""); setVSector(""); setVBudget(""); setVNeed(""); setVVisibleSections(0); }}
                  style={{ padding: "12px 28px", background: "transparent", border: `1px solid ${VG(0.15)}`, borderRadius: "8px", color: V3, fontSize: "12px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Nouvelle proposition
                </button>
                <button onClick={() => navigate('/contact?outil=oracle')}
                  style={{ padding: "12px 28px", background: V, color: "#09090B", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Nous contacter →
                </button>
              </div>
            </div>
          )}
        </>)}
      </main>

      <footer style={{ padding: "24px 48px", borderTop: `1px solid ${VG(0.06)}`, display: "flex", justifyContent: "space-between", fontSize: "11px", color: V3 }}>
        <span>NERVÜR © 2026</span>
        <span>ORACLE — Conseiller Stratégique IA</span>
      </footer>
    </div>
  );
}
