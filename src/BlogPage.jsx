import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LogoNervur from "./components/LogoNervur";

const V = "#0A2540";
const VG = (a) => `rgba(0,0,0,${a})`;

const ARTICLES = [
  {
    slug: "e-reputation",
    title: "E-réputation : pourquoi 90% des PME perdent des clients sans le savoir",
    desc: "Découvrez les stratégies essentielles pour surveiller, gérer et améliorer votre réputation numérique. Guide complet avec statistiques et solutions concrètes.",
    color: "#635BFF",
    tag: "E-RÉPUTATION",
    date: "20 mars 2026",
    readTime: "12 min",
  },
  {
    slug: "conformite-juridique",
    title: "Conformité RGPD : guide complet pour les TPE/PME en 2026",
    desc: "Obligations légales, sanctions CNIL, étapes de mise en conformité. Tout ce que les TPE/PME doivent savoir sur le RGPD en 2026.",
    color: "#06b6d4",
    tag: "CONFORMITÉ RGPD",
    date: "18 mars 2026",
    readTime: "12 min",
  },
  {
    slug: "presence-digitale",
    title: "Présence digitale : comment les TPE/PME peuvent se démarquer en 2026",
    desc: "E-réputation, conformité juridique et stratégie digitale. Les clés pour construire une présence en ligne solide et rentable.",
    color: "#8b5cf6",
    tag: "PRÉSENCE DIGITALE",
    date: "15 mars 2026",
    readTime: "11 min",
  },
  {
    slug: "avis-google",
    title: "Avis Google : comment gérer et améliorer votre e-réputation en 2026",
    desc: "Stratégies pour obtenir plus d'avis, répondre efficacement et transformer les avis Google en levier de croissance pour votre entreprise.",
    color: "#f59e0b",
    tag: "AVIS GOOGLE",
    date: "25 mars 2026",
    readTime: "10 min",
  },
  {
    slug: "rgpd-guide",
    title: "RGPD pour les TPE/PME : les 10 obligations que vous devez respecter en 2026",
    desc: "Les 10 obligations RGPD essentielles pour les petites entreprises. Checklist interactive, sanctions et outils pour se conformer rapidement.",
    color: "#10b981",
    tag: "RGPD",
    date: "26 mars 2026",
    readTime: "13 min",
  },
  {
    slug: "registre-traitements",
    title: "Registre des traitements RGPD : modele et guide complet pour TPE/PME",
    desc: "Comment creer et maintenir votre registre des traitements RGPD. Modele gratuit, obligations legales, exemples concrets pour TPE et PME.",
    color: "#06b6d4",
    tag: "REGISTRE RGPD",
    date: "31 mars 2026",
    readTime: "11 min",
  },
  {
    slug: "aipd-guide",
    title: "AIPD RGPD : guide complet de l'analyse d'impact pour les PME",
    desc: "Quand et comment realiser une AIPD. Methodologie CNIL, criteres obligatoires, etapes pratiques pour les TPE/PME.",
    color: "#f59e0b",
    tag: "AIPD",
    date: "31 mars 2026",
    readTime: "12 min",
  },
  {
    slug: "droits-personnes-rgpd",
    title: "Droits des personnes RGPD : gerer les demandes (DSAR) en 2026",
    desc: "Comment gerer les demandes de droits RGPD : acces, suppression, portabilite. Delais legaux, procedures et modeles de reponse pour PME.",
    color: "#8b5cf6",
    tag: "DROITS RGPD",
    date: "31 mars 2026",
    readTime: "10 min",
  },
];

export default function BlogPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #F5F5F7 0%, #EEEEF0 50%, #F5F5F7 100%)",
      color: V,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* Nav */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "16px 20px" : "20px 48px",
        borderBottom: `1px solid ${VG(0.1)}`,
      }}>
        <LogoNervur height={28} onClick={() => navigate("/")} />
        <a href="/app/login" style={{
          padding: "8px 20px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          fontWeight: 700, color: "#FFFFFF", background: "#0A2540", border: "none", borderRadius: "6px",
          cursor: "pointer", textDecoration: "none",
        }}>Espace Client</a>
      </header>

      {/* Hero */}
      <section style={{ padding: isMobile ? "60px 20px" : "100px 48px", textAlign: "center" }}>
        <button onClick={() => navigate("/")} style={{
          background: "none", border: `1px solid ${VG(0.15)}`, borderRadius: "8px",
          color: "#6B7C93", fontSize: "13px", padding: "8px 20px", cursor: "pointer",
          marginBottom: "32px", transition: "all 0.3s", fontFamily: "inherit",
        }}
          onMouseEnter={e => { e.target.style.color = V; e.target.style.borderColor = VG(0.3); }}
          onMouseLeave={e => { e.target.style.color = "#6B7C93"; e.target.style.borderColor = VG(0.15); }}>
          ← Retour à l'accueil
        </button>
        <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#6B7C93", display: "block", marginBottom: "16px" }}>
          // Le blog NERVÜR
        </span>
        <h1 style={{ fontSize: isMobile ? "32px" : "clamp(36px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: "16px" }}>
          Ressources & articles
        </h1>
        <p style={{ fontSize: "16px", color: "#6B7C93", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
          Conseils, analyses et bonnes pratiques pour les PME qui veulent grandir en ligne.
        </p>
      </section>

      {/* Articles grid */}
      <section style={{ padding: isMobile ? "0 20px 80px" : "0 48px 120px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "24px" }}>
          {ARTICLES.map((article) => (
            <div key={article.slug}
              onClick={() => navigate(`/blog/${article.slug}`)}
              style={{
                border: `1px solid ${VG(0.08)}`, borderRadius: "16px",
                padding: "32px 28px", cursor: "pointer",
                background: VG(0.02), transition: "all 0.3s ease",
                display: "flex", flexDirection: "column", gap: "16px",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${article.color}40`; e.currentTarget.style.background = VG(0.04); e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.08); e.currentTarget.style.background = VG(0.02); e.currentTarget.style.transform = "translateY(0)"; }}>
              {/* Tag */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontSize: "10px", letterSpacing: "2px", fontWeight: 700,
                  color: article.color, padding: "4px 10px", borderRadius: "20px",
                  border: `1px solid ${article.color}30`, background: `${article.color}10`,
                }}>{article.tag}</span>
                <span style={{ fontSize: "11px", color: "#6B7C93" }}>{article.readTime}</span>
              </div>
              {/* Title */}
              <h2 style={{ fontSize: "18px", fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.3px" }}>
                {article.title}
              </h2>
              {/* Desc */}
              <p style={{ fontSize: "13px", color: "#6B7C93", lineHeight: 1.7, flex: 1 }}>
                {article.desc}
              </p>
              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: `1px solid ${VG(0.06)}` }}>
                <span style={{ fontSize: "11px", color: "#6B7C93" }}>{article.date}</span>
                <span style={{ fontSize: "12px", color: article.color, fontWeight: 600 }}>Lire →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer simple */}
      <footer style={{ borderTop: `1px solid ${VG(0.1)}`, padding: "32px 48px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#8898AA" }}>
          © 2026 NERVÜR — Éditeur de Technologies de Croissance
        </p>
      </footer>
    </div>
  );
}
