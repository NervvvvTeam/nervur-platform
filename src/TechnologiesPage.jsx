import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

const useIsMobile = (bp = 768) => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
};

const TOOLS = [
  {
    id: "sentinel",
    name: "SENTINEL",
    subtitle: "E-reputation",
    color: "#ef4444",
    description: "Surveillez vos avis Google, répondez automatiquement avec l'IA et analysez votre réputation en ligne.",
    features: ["Avis Google en temps réel", "Réponses IA automatiques", "Analyse sémantique", "Veille concurrentielle", "QR Code & Widget", "Rapports PDF"],
    price: "29",
    link: "/sentinel",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="g-sentinel" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fca5a5"/><stop offset="100%" stopColor="#ef4444"/></linearGradient></defs>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#g-sentinel)" fill="none"/>
        <path d="M9 12l2 2 4-4" stroke="url(#g-sentinel)" fill="none"/>
      </svg>
    ),
  },
  {
    id: "vault",
    name: "VAULT",
    subtitle: "Agent Juridique IA",
    color: "#06b6d4",
    description: "Agent Juridique IA — Conformité & Protection juridique. Scannez votre site, générez vos documents légaux et suivez votre conformité RGPD.",
    features: ["Scan RGPD automatisé", "Générateur de documents légaux", "Registre des traitements RGPD", "Veille juridique automatisée", "Historique et évolution du score", "Recommandations IA"],
    price: "19",
    link: "/contact",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="g-vault" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#67e8f9"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient></defs>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#g-vault)" fill="none"/>
        <path d="M9 12l2 2 4-4" stroke="url(#g-vault)" fill="none"/>
      </svg>
    ),
  },
];

export default function TechnologiesPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useSEO(
    "Nos Outils & Technologies | NERVUR",
    "Découvrez les outils SaaS NERVUR : Sentinel et Vault. Technologies IA pour PME.",
    { path: "/technologies", keywords: "outils SaaS PME, technologies IA, Sentinel, Vault, NERVUR" }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{
      background: "#0f1117", color: "#FAFAFA",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      minHeight: "100vh", position: "relative"
    }}>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .tech-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative; overflow: hidden;
        }
        .tech-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .nav-btn {
          cursor: pointer; background: transparent;
          border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa;
          font-weight: 600; font-size: 11px; letter-spacing: 2.5px;
          text-transform: uppercase; padding: 8px 22px;
          font-family: inherit; transition: all 0.3s;
        }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
        .cta-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 600; letter-spacing: 0.3px;
          cursor: pointer; transition: all 0.3s;
          background: none; border: none; padding: 0; font-family: inherit;
        }
        .cta-link:hover { opacity: 0.8; }
        .pack-card {
          flex: 1; padding: 32px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(24,24,27,0.5);
          text-align: center;
          transition: all 0.3s;
        }
        .pack-card:hover {
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
      `}</style>

      {/* NAV */}
      <nav aria-label="Navigation principale" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 20px" : "20px 48px",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        <img src="/logo-nervur.svg" alt="NERVUR" onClick={() => navigate("/")}
          style={{ height: isMobile ? "40px" : "70px", width: "auto", objectFit: "contain", cursor: "pointer" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" aria-label="Retour à l'accueil" onClick={() => navigate("/")}>Accueil</button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>Contact</button>
        </div>
      </nav>

      <main style={{ padding: isMobile ? "100px 20px 60px" : "160px 48px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        {/* RETOUR */}
        <div style={{ marginBottom: "20px" }}>
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

        {/* HERO */}
        <section aria-label="Presentation des technologies" style={{ animation: "fadeInUp 0.8s ease both", marginBottom: isMobile ? "40px" : "64px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#52525B", fontFamily: "monospace", display: "block", marginBottom: "16px" }}>
            // Nos Technologies
          </span>
          <h1 style={{ fontSize: isMobile ? "32px" : "clamp(36px, 4.5vw, 52px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: "16px" }}>
            Des outils puissants pour votre business
          </h1>
          <p style={{ fontSize: "16px", color: "#71717A", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
            Deux solutions professionnelles pour surveiller et protéger votre présence en ligne.
          </p>
        </section>

        {/* TOOLS GRID — 2x2 */}
        <section aria-label="Nos outils" style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "24px",
        }}>
          {TOOLS.map((tool, idx) => (
            <div key={tool.id} className="tech-card" style={{
              padding: isMobile ? "28px 24px" : "36px 32px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(24,24,27,0.5)",
              borderRadius: "16px",
              animation: `fadeInUp 0.8s ease ${0.1 + idx * 0.12}s both`,
            }}>
              {/* Colored top border */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                background: `linear-gradient(90deg, ${tool.color}40, ${tool.color}, ${tool.color}40)`,
                borderRadius: "16px 16px 0 0",
              }} />

              {/* Icon */}
              <div style={{
                width: "56px", height: "56px", borderRadius: "14px",
                background: `${tool.color}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "20px",
              }}>
                {tool.icon}
              </div>

              {/* Title + subtitle */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                <h3 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>{tool.name}</h3>
                <span style={{
                  fontSize: "10px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                  color: tool.color, padding: "3px 10px",
                  border: `1px solid ${tool.color}40`, borderRadius: "4px",
                }}>
                  {tool.subtitle}
                </span>
              </div>

              {/* Description */}
              <p style={{ fontSize: "14px", color: "#71717A", lineHeight: 1.7, marginBottom: "20px" }}>
                {tool.description}
              </p>

              {/* Features */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {tool.features.map((f, i) => (
                  <li key={i} style={{ fontSize: "12px", color: "#A1A1AA", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tool.color} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Price + CTA */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "32px", fontWeight: 800 }}>{tool.price}&#8364;</span>
                  <span style={{ fontSize: "14px", color: "#71717A" }}>/mois</span>
                </div>
                <button className="cta-link" onClick={() => navigate(tool.link)} style={{ color: tool.color }}>
                  Essayer la démo &rarr;
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* PRICING PACKS */}
        <section aria-label="Nos packs" style={{
          marginTop: "80px", animation: "fadeInUp 0.8s ease 0.6s both",
        }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>
              Packs multi-outils
            </h2>
            <p style={{ fontSize: "15px", color: "#71717A", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>
              Combinez vos outils et économisez. Sans engagement, annulez quand vous voulez.
            </p>
          </div>

          <div style={{ display: "flex", gap: "20px", flexDirection: isMobile ? "column" : "row" }}>
            {/* Pack Duo */}
            <div className="pack-card">
              <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#818CF8", fontWeight: 700, marginBottom: "12px" }}>Pack Duo</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px", marginBottom: "8px" }}>
                <span style={{ fontSize: "40px", fontWeight: 800 }}>39&#8364;</span>
                <span style={{ fontSize: "14px", color: "#71717A" }}>/mois</span>
              </div>
              <p style={{ fontSize: "13px", color: "#71717A", marginBottom: "20px", lineHeight: 1.6 }}>2 outils au choix</p>
              <button onClick={() => navigate("/contact")} style={{
                padding: "12px 32px", background: "transparent", border: "1px solid rgba(129,140,248,0.3)",
                color: "#818CF8", fontWeight: 600, fontSize: "13px", cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.3s", borderRadius: "8px",
              }}
                onMouseEnter={e => { e.target.style.background = "rgba(129,140,248,0.1)"; e.target.style.borderColor = "#818CF8"; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(129,140,248,0.3)"; }}>
                Contactez-nous
              </button>
            </div>

            {/* Pack Total */}
            <div className="pack-card" style={{ border: "1px solid rgba(129,140,248,0.25)", background: "rgba(99,102,241,0.06)" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#818CF8", fontWeight: 700, marginBottom: "12px" }}>Pack Total</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px", marginBottom: "8px" }}>
                <span style={{ fontSize: "40px", fontWeight: 800 }}>49&#8364;</span>
                <span style={{ fontSize: "14px", color: "#71717A" }}>/mois</span>
              </div>
              <p style={{ fontSize: "13px", color: "#71717A", marginBottom: "20px", lineHeight: 1.6 }}>Les 2 outils inclus</p>
              <button onClick={() => navigate("/contact")} style={{
                padding: "12px 32px", background: "#818CF8", border: "none",
                color: "#0f1117", fontWeight: 700, fontSize: "13px", cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.3s", borderRadius: "8px",
              }}
                onMouseEnter={e => { e.target.style.background = "#a5b4fc"; e.target.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.target.style.background = "#818CF8"; e.target.style.transform = "translateY(0)"; }}>
                Contactez-nous
              </button>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section aria-label="Nous contacter" style={{
          marginTop: "80px", textAlign: "center", padding: isMobile ? "40px 20px" : "60px 48px",
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(24,24,27,0.3)", borderRadius: "12px",
          animation: "fadeInUp 0.8s ease 0.7s both",
        }}>
          <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>
            Un besoin spécifique ?
          </h2>
          <p style={{ fontSize: "15px", color: "#71717A", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px", lineHeight: 1.7 }}>
            On conçoit des outils sur-mesure pour votre entreprise. Parlons de votre projet.
          </p>
          <button onClick={() => navigate('/contact')} style={{
            padding: "16px 40px", background: "#FAFAFA", color: "#0f1117", border: "none",
            fontWeight: 800, fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase",
            cursor: "pointer", transition: "all 0.3s ease",
          }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
            Nous contacter &rarr;
          </button>
        </section>
      </main>

      <footer style={{
        padding: isMobile ? "30px 20px" : "40px 48px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexDirection: isMobile ? "column" : "row", gap: "12px",
      }}>
        <span style={{ fontSize: "11px", color: "#52525B", letterSpacing: "1px" }}>NERVUR &copy; 2026</span>
        <span style={{ fontSize: "11px", color: "#52525B" }}>Éditeur de Technologies de Croissance</span>
      </footer>
    </div>
  );
}
