import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

export default function QuiSommesNousPage() {
  const navigate = useNavigate();

  useSEO("Qui sommes-nous | NERVÜR", "Découvrez NERVÜR, agence digitale spécialisée en technologies de croissance pour PME. Notre mission, notre équipe, notre approche.", { path: "/qui-sommes-nous", keywords: "NERVÜR, agence digitale, technologies croissance, PME, équipe" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const VG = (a) => `rgba(255,255,255,${a})`;
  const A1 = "#818CF8", A2 = "#4ADE80", A3 = "#F472B6";

  const ValueIcon = ({ type }) => {
    const s = { width: 28, height: 28, stroke: "#3b82f6", strokeWidth: 1.5, fill: "none" };
    if (type === "performance") return <svg viewBox="0 0 24 24" style={s} aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
    if (type === "code") return <svg viewBox="0 0 24 24" style={s} aria-hidden="true"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="14" y1="4" x2="10" y2="20" /></svg>;
    if (type === "access") return <svg viewBox="0 0 24 24" style={s} aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
    return <svg viewBox="0 0 24 24" style={s} aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
  };

  const values = [
    { icon: "performance", title: "Performance", desc: "Des outils rapides, précis et construits pour générer des résultats concrets." },
    { icon: "code", title: "Code sur mesure", desc: "Chaque site et chaque outil est développé à la main, ligne par ligne — jamais de templates." },
    { icon: "access", title: "Accessibilité", desc: "La technologie pro accessible à toutes les entreprises, sans complexité ni tarifs prohibitifs." },
    { icon: "proximity", title: "Proximité", desc: "Un accompagnement humain derrière chaque projet. Vous n'êtes jamais seul." },
  ];

  const timeline = [
    { year: "2024", text: "Naissance de NERVÜR. Premiers projets de sites vitrines et développement des outils internes d'automatisation." },
    { year: "2025", text: "Développement de la suite d'outils IA : Sentinel, Phantom et Vault." },
    { year: "2026", text: "Lancement commercial. Sentinel devient le premier produit SaaS de gestion de réputation en ligne." },
  ];

  const services = [
    {
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      title: "Sites vitrines",
      desc: "Des sites modernes, rapides et optimisés SEO. Développés sur mesure pour refléter votre image."
    },
    {
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      title: "Outils d'automatisation",
      desc: "Gestion d'avis, création de contenu, veille concurrentielle — tout automatisé par l'IA."
    },
    {
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
      title: "Accompagnement digital",
      desc: "Stratégie, mise en place et suivi. On vous accompagne à chaque étape de votre croissance."
    },
  ];

  return (
    <main style={{ background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", minHeight: "100vh" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: `1px solid ${VG(0.08)}` }}>
        <img src="/logo-nav.png" alt="NERVÜR" onClick={() => navigate("/")} style={{ height: "70px", width: "auto", filter: "invert(1) brightness(1.15)", objectFit: "contain", mixBlendMode: "screen", cursor: "pointer" }} />
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: `1px solid ${VG(0.15)}`, color: "#a1a1aa", padding: "8px 22px", fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
          Accueil
        </button>
      </nav>

      {/* Hero avec image de fond */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1400&h=600&fit=crop)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.12 }} />
        <div style={{ position: "relative", maxWidth: "900px", margin: "0 auto", padding: "100px 24px 80px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#3b82f6", marginBottom: "16px" }}>À propos</p>
          <h1 style={{ fontSize: "42px", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, marginBottom: "20px" }}>
            L'agence digitale qui <span style={{ color: "#3b82f6" }}>automatise</span> votre croissance
          </h1>
          <p style={{ fontSize: "17px", lineHeight: 1.7, color: "#a1a1aa", maxWidth: "650px", margin: "0 auto" }}>
            Passionnés de code et de développement web, on crée des sites vitrines sur mesure et des outils d'automatisation intelligents pour propulser votre activité en ligne.
          </p>
        </div>
      </div>

      {/* Ce qu'on fait — avec vraies images */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "80px 24px 0" }}>
        <h2 style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#3b82f6", marginBottom: "40px", textAlign: "center" }}>Ce qu'on fait</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {services.map((s, i) => (
            <div key={i} style={{ border: `1px solid ${VG(0.06)}`, borderRadius: "12px", overflow: "hidden", background: VG(0.02) }}>
              <img src={s.img} alt={s.title} style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />
              <div style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{s.title}</h3>
                <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#a1a1aa" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 24px 0" }}>
        <div style={{ padding: "40px", border: `1px solid ${VG(0.08)}`, borderRadius: "12px", background: VG(0.02) }}>
          <h2 style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#3b82f6", marginBottom: "16px" }}>Notre mission</h2>
          <p style={{ fontSize: "16px", lineHeight: 1.9, color: "#d4d4d8" }}>
            Rendre la technologie accessible à toutes les entreprises. Nos outils analysent, optimisent et automatisent votre présence digitale pour que vous puissiez vous concentrer sur votre cœur de métier.
          </p>
          <p style={{ fontSize: "16px", lineHeight: 1.9, color: "#d4d4d8", marginTop: "12px" }}>
            De la création de votre site vitrine à la gestion de vos avis Google, en passant par la création de contenu et la veille concurrentielle — NERVÜR est votre partenaire digital complet.
          </p>
        </div>
      </div>

      {/* Valeurs */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "80px 24px 0" }}>
        <h2 style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#3b82f6", marginBottom: "40px", textAlign: "center" }}>Nos valeurs</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
          {values.map((v, i) => (
            <div key={i} style={{ padding: "28px 24px", border: `1px solid ${VG(0.06)}`, borderRadius: "10px", background: VG(0.02) }}>
              <div style={{ marginBottom: "12px" }}><ValueIcon type={v.icon} /></div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>{v.title}</h3>
              <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#a1a1aa" }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fondateur */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 24px 0" }}>
        <h2 style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#3b82f6", marginBottom: "40px", textAlign: "center" }}>Le fondateur</h2>
        <div style={{ display: "flex", gap: "40px", alignItems: "center", flexWrap: "wrap", padding: "40px", border: `1px solid ${VG(0.08)}`, borderRadius: "12px", background: VG(0.02) }}>
          <div style={{ flex: "0 0 auto" }}>
            <img
              src="/fondateur.jpg.png"
              alt="Li Glanchard — Fondateur NERVÜR"
              style={{ width: "160px", height: "200px", borderRadius: "12px", objectFit: "cover", objectPosition: "70% 20%", border: `2px solid ${VG(0.1)}` }}
            />
          </div>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Li Glanchard</h3>
            <p style={{ fontSize: "13px", color: "#3b82f6", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>Fondateur & Développeur</p>
            <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#a1a1aa" }}>
              Passionné de code et de développement web depuis toujours, Li a fondé NERVÜR pour mettre ses compétences techniques au service des entreprises. Sites vitrines, applications web, outils d'automatisation — chaque ligne de code est écrite à la main avec un objectif : des résultats concrets pour ses clients.
            </p>
          </div>
        </div>
      </div>

      {/* Image workspace */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px 0" }}>
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=400&fit=crop"
          alt="Espace de travail développement"
          style={{ width: "100%", height: "280px", objectFit: "cover", borderRadius: "12px", border: `1px solid ${VG(0.08)}` }}
        />
      </div>

      {/* Timeline */}
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "80px 24px 0" }}>
        <h2 style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#3b82f6", marginBottom: "40px", textAlign: "center" }}>Notre parcours</h2>
        <div style={{ borderLeft: `2px solid ${VG(0.1)}`, paddingLeft: "32px", marginLeft: "20px" }}>
          {timeline.map((t, i) => (
            <div key={i} style={{ marginBottom: i < timeline.length - 1 ? "32px" : 0, position: "relative" }}>
              <div style={{ position: "absolute", left: "-41px", top: "2px", width: "12px", height: "12px", borderRadius: "50%", background: i === timeline.length - 1 ? "#3b82f6" : VG(0.2), border: `2px solid ${i === timeline.length - 1 ? "#3b82f6" : VG(0.3)}` }} />
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#3b82f6", marginBottom: "6px", letterSpacing: "1px" }}>{t.year}</p>
              <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#d4d4d8" }}>{t.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "24px", textAlign: "center" }}>
          {[
            { number: "50+", label: "Projets livrés" },
            { number: "3", label: "Outils IA" },
            { number: "100%", label: "Code sur mesure" },
            { number: "24h", label: "Délai de réponse" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "24px", border: `1px solid ${VG(0.06)}`, borderRadius: "10px", background: VG(0.02) }}>
              <p style={{ fontSize: "28px", fontWeight: 800, color: "#3b82f6", marginBottom: "4px" }}>{s.number}</p>
              <p style={{ fontSize: "12px", color: "#71717a", letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 24px 100px", textAlign: "center" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>Prêt à transformer votre présence digitale ?</h2>
        <p style={{ fontSize: "15px", color: "#a1a1aa", marginBottom: "28px" }}>Discutons de votre projet. Premier échange gratuit et sans engagement.</p>
        <button
          onClick={() => navigate("/contact")}
          style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "14px 36px", fontSize: "13px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "6px" }}
        >
          Nous contacter
        </button>
      </div>
    </main>
  );
}
