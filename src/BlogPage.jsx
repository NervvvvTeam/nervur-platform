import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const V = "#FAFAFA";
const VG = (a) => `rgba(250,250,250,${a})`;

const ARTICLES = [
  {
    slug: "e-reputation",
    title: "E-réputation : comment protéger votre image en ligne",
    desc: "Découvrez les stratégies essentielles pour surveiller, gérer et améliorer votre réputation numérique en tant que PME.",
    color: "#ef4444",
    tag: "E-RÉPUTATION",
    date: "15 mars 2026",
    readTime: "8 min",
  },
  {
    slug: "cybersecurite",
    title: "Cybersécurité PME : les menaces à connaître en 2026",
    desc: "Les cyberattaques ciblent de plus en plus les petites entreprises. Voici comment vous protéger efficacement.",
    color: "#06b6d4",
    tag: "CYBERSÉCURITÉ",
    date: "12 mars 2026",
    readTime: "10 min",
  },
  {
    slug: "performance-web",
    title: "Performance web : pourquoi votre site est trop lent",
    desc: "Un site lent coûte cher. Analyse des facteurs de performance et solutions concrètes pour booster vos Core Web Vitals.",
    color: "#8b5cf6",
    tag: "PERFORMANCE",
    date: "8 mars 2026",
    readTime: "7 min",
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
      background: "linear-gradient(180deg, #0f1117 0%, #161b2e 50%, #0f1117 100%)",
      color: V,
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      {/* Nav */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "16px 20px" : "20px 48px",
        borderBottom: `1px solid ${VG(0.1)}`,
      }}>
        <img src="/logo-nav.png" alt="NERVÜR" onClick={() => navigate("/")}
          style={{ height: isMobile ? "36px" : "44px", width: "auto", filter: "invert(1) brightness(1.15)", mixBlendMode: "screen", objectFit: "contain", cursor: "pointer" }} />
        <a href="/app/login" style={{
          padding: "8px 20px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          fontWeight: 700, color: "#09090B", background: "#FAFAFA", border: "none", borderRadius: "6px",
          cursor: "pointer", textDecoration: "none",
        }}>Espace Client</a>
      </header>

      {/* Hero */}
      <section style={{ padding: isMobile ? "60px 20px" : "100px 48px", textAlign: "center" }}>
        <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#71717A", display: "block", marginBottom: "16px" }}>
          // Le blog NERVÜR
        </span>
        <h1 style={{ fontSize: isMobile ? "32px" : "clamp(36px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: "16px" }}>
          Ressources & articles
        </h1>
        <p style={{ fontSize: "16px", color: "#71717A", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
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
                <span style={{ fontSize: "11px", color: "#52525B" }}>{article.readTime}</span>
              </div>
              {/* Title */}
              <h2 style={{ fontSize: "18px", fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.3px" }}>
                {article.title}
              </h2>
              {/* Desc */}
              <p style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.7, flex: 1 }}>
                {article.desc}
              </p>
              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: `1px solid ${VG(0.06)}` }}>
                <span style={{ fontSize: "11px", color: "#52525B" }}>{article.date}</span>
                <span style={{ fontSize: "12px", color: article.color, fontWeight: 600 }}>Lire →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer simple */}
      <footer style={{ borderTop: `1px solid ${VG(0.1)}`, padding: "32px 48px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#3f3f46" }}>
          © 2026 NERVÜR — Éditeur de Technologies de Croissance
        </p>
      </footer>
    </div>
  );
}
