import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

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

const ChromeButton = ({ children, onClick }) => (
  <button className="chrome-btn" onClick={onClick}>{children}</button>
);

export default function TechnologiesPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);

  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
      glowRef.current.style.opacity = 1;
    }
  };

  useSEO("Nos Outils & Technologies | NERVÜR", "Découvrez la suite complète d'outils SaaS NERVÜR : Sentinel, Phantom et Vault. Technologies IA pour PME.", { path: "/technologies", keywords: "outils SaaS PME, technologies IA, Sentinel, Phantom, Vault, NERVÜR" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes loading { 0% { transform: translateX(-100%); } 50% { transform: translateX(150%); } 100% { transform: translateX(-100%); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 rgba(74,222,128,0); } 50% { box-shadow: 0 0 12px rgba(74,222,128,0.3); } }
        .chrome-btn {
          position: relative; overflow: hidden; cursor: pointer;
          background: linear-gradient(135deg, #e8e8e8 0%, #b0b0b0 40%, #d6d6d6 60%, #a0a0a0 100%);
          color: #18181b; font-weight: 700; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
          padding: 12px 28px; border: none; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, box-shadow; backface-visibility: hidden; -webkit-font-smoothing: subpixel-antialiased;
        }
        .chrome-btn:hover { transform: translateY(-2px); background: linear-gradient(135deg, #f0f0f0 0%, #c0c0c0 40%, #e0e0e0 60%, #b0b0b0 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.4); }
        .chrome-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transition: left 0.5s ease; }
        .chrome-btn:hover::before { left: 100%; }
        .chrome-btn::after { content: ''; position: absolute; inset: -2px; z-index: -1; border-radius: inherit; background: linear-gradient(135deg, rgba(255,120,200,0.3), rgba(120,200,255,0.3), rgba(200,255,120,0.3)); filter: blur(6px); opacity: 0; transition: opacity 0.4s ease; }
        .chrome-btn:hover::after { opacity: 1; }
        .hover-card { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .hover-card:hover { transform: translateY(-8px); border-color: rgba(255,255,255,0.4) !important; box-shadow: 0 20px 60px rgba(255,255,255,0.1); }
      `}</style>

      {/* NAV */}
      <nav aria-label="Navigation principale" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${VG(0.08)}` }}>
        <img src="/logo-nav.png" alt="NERVÜR" onClick={() => navigate("/")}
          style={{ height: isMobile ? "40px" : "70px", width: "auto", filter: "invert(1) brightness(1.15)", objectFit: "contain", mixBlendMode: "screen", cursor: "pointer" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" aria-label="Retour à l'accueil" onClick={() => navigate("/")}>← Accueil</button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>Contact</button>
        </div>
      </nav>

      <main style={{ padding: isMobile ? "100px 20px 60px" : "160px 48px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* HERO */}
        <section aria-label="Présentation des technologies" style={{ animation: "fadeInUp 0.8s ease both", marginBottom: isMobile ? "40px" : "64px" }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", gap: isMobile ? "16px" : "0" }}>
            <div>
              <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#52525B", fontFamily: "monospace", display: "block", marginBottom: "16px" }}>
                // Nos Technologies
              </span>
              <h1 style={{ fontSize: isMobile ? "32px" : "clamp(36px, 4.5vw, 56px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1 }}>
                Des outils qui <span style={{ color: V }}>travaillent</span> pour vous.
              </h1>
            </div>
          </div>
          {/* DEMO BANNER */}
          <div style={{
            marginTop: "32px", padding: isMobile ? "16px 20px" : "20px 32px",
            background: "linear-gradient(135deg, rgba(192,132,252,0.08), rgba(96,165,250,0.08))",
            border: "1px solid rgba(192,132,252,0.2)", borderRadius: "8px",
            display: "flex", alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? "12px" : "20px", flexDirection: isMobile ? "column" : "row"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#c084fc" }}>Démos interactives</span>
            </div>
            <p style={{ fontSize: "13px", color: V3, lineHeight: 1.7, margin: 0 }}>
              Ce que vous voyez ici sont des <strong style={{ color: V }}>démonstrations simplifiées</strong>. L'outil final déployé pour votre entreprise est 100% sur-mesure, connecté à vos données et optimisé pour vos performances réelles.
            </p>
          </div>
        </section>

        {/* GRID */}
        <section aria-label="Nos outils" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "24px" }}>

          {/* SENTINEL */}
          <div className="hover-card" style={{
            padding: isMobile ? "32px 24px" : "40px 32px",
            border: `1px solid ${VG(0.12)}`, background: "rgba(24,24,27,0.4)",
            position: "relative", overflow: "hidden", cursor: "pointer",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", animation: "fadeInUp 0.8s ease 0.1s both" }}
            onClick={() => navigate('/sentinel')}>
            <div style={{ position: "absolute", top: "-1px", left: "32px", right: "32px", height: "2px", background: "linear-gradient(90deg, transparent, #f87171, transparent)" }} />
            <svg width="40" height="40" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <defs><linearGradient id="grad-sentinel" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fca5a5" /><stop offset="100%" stopColor="#ef4444" /></linearGradient></defs>
              <path d="M13 2L4 6v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" fill="none" stroke="url(#grad-sentinel)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 13l2.5 2.5L17 10" fill="none" stroke="url(#grad-sentinel)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px" }}>SENTINEL</h3>
                <span style={{ fontSize: "8px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#4ADE80", padding: "3px 8px", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80", animation: "pulseGlow 2s ease infinite" }} />
                  DÉMO LIVE
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.7, marginBottom: "20px" }}>
                Le bouclier complet. Surveille votre e-réputation, scanne vos concurrents et détecte les opportunités marché — propulsé par l'IA.
              </p>
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${VG(0.06)}`, borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= 2 ? "#fbbf24" : VG(0.15), fontSize: "10px" }}>★</span>)}
                  <span style={{ fontSize: "9px", color: "#71717A", marginLeft: "4px" }}>Avis négatif détecté</span>
                </div>
                <div style={{ height: "6px", borderRadius: "3px", background: VG(0.06), overflow: "hidden" }}>
                  <div style={{ width: "75%", height: "100%", borderRadius: "3px", background: "linear-gradient(90deg, #ef4444, #fbbf24)" }} />
                </div>
                <div style={{ fontSize: "8px", color: VG(0.25), marginTop: "6px", letterSpacing: "0.5px" }}>847 AVIS / MOIS • 47 SIGNAUX / 24H</div>
              </div>
              <ChromeButton onClick={(e) => { e.stopPropagation(); navigate('/sentinel'); }}>Tester →</ChromeButton>
            </div>
          </div>

          {/* PHANTOM */}
          <div className="hover-card" style={{
            padding: isMobile ? "32px 24px" : "40px 32px",
            border: `1px solid ${VG(0.12)}`, background: "rgba(24,24,27,0.4)",
            position: "relative", overflow: "hidden", cursor: "pointer",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", animation: "fadeInUp 0.8s ease 0.3s both" }}
            onClick={() => navigate('/phantom')}>
            <div style={{ position: "absolute", top: "-1px", left: "32px", right: "32px", height: "2px", background: "linear-gradient(90deg, transparent, #ec4899, transparent)" }} />
            <svg width="40" height="40" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <defs><linearGradient id="grad-phantom" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f9a8d4" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
              <rect x="3" y="3" width="20" height="20" rx="2" fill="none" stroke="url(#grad-phantom)" strokeWidth="1.3" />
              <path d="M8 10h10M8 14h7M8 18h4" fill="none" stroke="url(#grad-phantom)" strokeWidth="1.1" strokeLinecap="round" />
              <circle cx="20" cy="6" r="2.5" fill="#ec4899" opacity="0.5" />
            </svg>
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px" }}>PHANTOM</h3>
                <span style={{ fontSize: "8px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#4ADE80", padding: "3px 8px", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80", animation: "pulseGlow 2s ease infinite" }} />
                  DÉMO LIVE
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.7, marginBottom: "20px" }}>
                L'agent invisible qui crawle votre site et trouve les tueurs de conversion. Audit UX complet.
              </p>
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${VG(0.06)}`, borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "4px", textAlign: "center" }}>
                  {[{ l: "PERF", v: "42", c: "#ef4444" }, { l: "A11Y", v: "61", c: "#fbbf24" }, { l: "SEO", v: "38", c: "#ef4444" }, { l: "CRO", v: "27", c: "#ef4444" }].map((m, i) => (
                    <div key={i}>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: m.c }}>{m.v}</div>
                      <div style={{ fontSize: "7px", color: "#52525B", letterSpacing: "0.5px" }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "8px", color: VG(0.25), marginTop: "6px" }}>4 CRITIQUES • 3 ALERTES DÉTECTÉES</div>
              </div>
              <ChromeButton onClick={(e) => { e.stopPropagation(); navigate('/phantom'); }}>Tester →</ChromeButton>
            </div>
          </div>

          {/* NEXUS */}
          <div className="hover-card" style={{
            padding: isMobile ? "32px 24px" : "40px 32px",
            border: `1px solid ${VG(0.12)}`, background: "rgba(24,24,27,0.4)",
            position: "relative", overflow: "hidden", cursor: "pointer",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", animation: "fadeInUp 0.8s ease 0.6s both" }}
            onClick={() => navigate('/nexus')}>
            <div style={{ position: "absolute", top: "-1px", left: "32px", right: "32px", height: "2px", background: "linear-gradient(90deg, transparent, #4ADE80, transparent)" }} />
            <svg width="40" height="40" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <defs><linearGradient id="grad-nexus" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#86efac" /><stop offset="100%" stopColor="#22c55e" /></linearGradient></defs>
              <rect x="4" y="4" width="18" height="18" rx="3" fill="none" stroke="url(#grad-nexus)" strokeWidth="1.3" />
              <path d="M9 13h8M13 9v8" fill="none" stroke="url(#grad-nexus)" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px" }}>NEXUS</h3>
                <span style={{ fontSize: "8px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#4ADE80", padding: "3px 8px", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80", animation: "pulseGlow 2s ease infinite" }} />
                  DÉMO LIVE
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.7, marginBottom: "20px" }}>
                Studio de contenu IA complet. Posts, emails, séquences et calendrier social media — tout-en-un.
              </p>
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${VG(0.06)}`, borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ fontSize: "9px", color: "#4ADE80" }}>Post LinkedIn — Professionnel</div>
                  <div style={{ fontSize: "9px", color: "#86efac" }}>Séquence email — Prospection x5</div>
                  <div style={{ fontSize: "9px", color: "#22d3ee" }}>Calendrier social — 7j multi-plateforme</div>
                </div>
                <div style={{ fontSize: "8px", color: VG(0.25), marginTop: "6px" }}>2.4K CONTENUS/MOIS • 120 POSTS • x4.1 ENGAGEMENT</div>
              </div>
              <ChromeButton onClick={(e) => { e.stopPropagation(); navigate('/nexus'); }}>Tester →</ChromeButton>
            </div>
          </div>

          {/* EN COURS DE DÉVELOPPEMENT */}
          <div style={{
            padding: isMobile ? "32px 24px" : "40px 32px",
            border: `1px dashed ${VG(0.15)}`, background: "rgba(15,15,15,0.6)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            animation: "fadeInUp 0.8s ease 0.7s both", minHeight: "280px" }}>
            <div style={{ width: "48px", height: "48px", marginBottom: "24px", position: "relative" }}>
              <div style={{
                width: "48px", height: "48px", border: `2px solid ${VG(0.08)}`, borderTop: `2px solid ${VG(0.4)}`,
                borderRadius: "50%", animation: "spin 1.2s linear infinite"
              }} />
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                fontSize: "14px", color: VG(0.3), fontFamily: "monospace"
              }}>%</div>
            </div>
            <div style={{ fontSize: "12px", letterSpacing: "4px", textTransform: "uppercase", color: V3, marginBottom: "12px", textAlign: "center" }}>
              En cours de développement
            </div>
            <div style={{ width: "120px", height: "2px", background: VG(0.08), borderRadius: "2px", overflow: "hidden", marginBottom: "16px" }}>
              <div style={{
                width: "40%", height: "100%", background: `linear-gradient(90deg, ${VG(0.2)}, ${VG(0.5)})`,
                borderRadius: "2px", animation: "loading 2.5s ease-in-out infinite"
              }} />
            </div>
            <div style={{ fontSize: "11px", color: "#52525B", textAlign: "center", maxWidth: "220px", lineHeight: 1.6 }}>
              Nouvel outil en préparation. Restez connectés.
            </div>
          </div>

        </section>

        {/* CTA */}
        <section aria-label="Nous contacter" style={{
          marginTop: "80px", textAlign: "center", padding: isMobile ? "40px 20px" : "60px 48px",
          border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.3)", borderRadius: "12px",
          animation: "fadeInUp 0.8s ease 0.5s both" }}>
          <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>
            Un besoin spécifique ?
          </h2>
          <p style={{ fontSize: "15px", color: "#71717A", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px", lineHeight: 1.7 }}>
            On conçoit des outils sur-mesure pour votre entreprise. Parlons de votre projet.
          </p>
          <button onClick={() => navigate('/contact')} style={{
            padding: "16px 40px", background: V, color: "#09090B", border: "none",
            fontWeight: 800, fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase",
            cursor: "pointer", transition: "all 0.3s ease" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
            Nous contacter →
          </button>
        </section>
      </main>

      <footer style={{
        padding: isMobile ? "30px 20px" : "40px 48px", borderTop: `1px solid ${VG(0.08)}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
        <span style={{ fontSize: "11px", color: "#52525B", letterSpacing: "1px" }}>NERVÜR © 2026</span>
        <span style={{ fontSize: "11px", color: "#52525B" }}>Éditeur de Technologies de Croissance</span>
      </footer>
    </div>
  );
}
