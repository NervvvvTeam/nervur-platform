import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

const V = "#FFFFFF", V2 = "#424245", V3 = "#86868B";
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

const PROJECTS = [
  {
    name: "Maison Lumière",
    type: "Architecture d'intérieur",
    description: "Site vitrine premium pour un cabinet d'architecture d'intérieur parisien. Design épuré, galerie immersive et prise de rendez-vous intégrée.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=500&fit=crop&q=80",
    tags: ["Design Premium", "Galerie Photo", "Réservation"],
    results: { visitors: "+180%", conversion: "4.2%", speed: "0.8s" },
    color: "#c084fc",
  },
  {
    name: "Café Botanica",
    type: "Restaurant & Bar",
    description: "Vitrine digitale pour un café-restaurant tendance. Menu interactif, réservation en ligne et intégration Instagram pour le feed en temps réel.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=500&fit=crop&q=80",
    tags: ["Menu Digital", "Réservation", "Instagram Feed"],
    results: { visitors: "+240%", conversion: "6.1%", speed: "0.6s" },
    color: "#f59e0b",
  },
  {
    name: "Nordic Studio",
    type: "Studio Créatif",
    description: "Portfolio haute performance pour un studio de design scandinave. Animations fluides, transitions cinématiques et showcase projets en plein écran.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop&q=80",
    tags: ["Portfolio", "Animations", "Fullscreen"],
    results: { visitors: "+320%", conversion: "5.7%", speed: "0.9s" },
    color: "#60a5fa",
  },
  {
    name: "Élysée Avocats",
    type: "Cabinet Juridique",
    description: "Site institutionnel pour un cabinet d'avocats prestigieux. Ton sobre et élégant, présentation des expertises et formulaire de prise de contact qualifié.",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=500&fit=crop&q=80",
    tags: ["Institutionnel", "Formulaire Qualifié", "SEO Local"],
    results: { visitors: "+150%", conversion: "3.8%", speed: "0.7s" },
    color: "#10b981",
  },
];

export default function VitrinePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [imageLoaded, setImageLoaded] = useState({});

  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
      glowRef.current.style.opacity = 1;
    }
  };

  useSEO("Création de Sites Vitrines | NERVÜR", "Sites vitrines modernes, rapides et optimisés SEO. Design sur-mesure, responsive et performant pour votre activité.", { path: "/vitrine" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div onMouseMove={handleMouseMove} style={{ background: "#F5F5F7", color: "#1D1D1F", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", minHeight: "100vh", position: "relative" }}>
      <div ref={glowRef} style={{ position: "fixed", left: -100, top: -100, width: "150px", height: "150px", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)", transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s", opacity: 0, mixBlendMode: "screen" }} />

      <style>{`
        .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .project-card { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .project-card:hover { transform: translateY(-8px); border-color: rgba(0,0,0,0.15) !important; }
        .project-img { transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease; }
        .project-card:hover .project-img { transform: scale(1.05); }
        .chrome-btn-v {
          position: relative; overflow: hidden; cursor: pointer;
          background: linear-gradient(135deg, #e8e8e8 0%, #b0b0b0 40%, #d6d6d6 60%, #a0a0a0 100%);
          color: #18181b; font-weight: 700; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
          padding: 12px 28px; border: none; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: inset 0 1px 0 rgba(0,0,0,0.25), inset 0 -1px 0 rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, box-shadow; backface-visibility: hidden; -webkit-font-smoothing: subpixel-antialiased; font-family: inherit;
        }
        .chrome-btn-v:hover { transform: translateY(-2px); background: linear-gradient(135deg, #f0f0f0 0%, #c0c0c0 40%, #e0e0e0 60%, #b0b0b0 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.1); }
        .chrome-btn-v::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent); transition: left 0.5s ease; }
        .chrome-btn-v:hover::before { left: 100%; }
        .chrome-btn-v::after { content: ''; position: absolute; inset: -2px; z-index: -1; border-radius: inherit; background: linear-gradient(135deg, rgba(255,120,200,0.3), rgba(120,200,255,0.3), rgba(200,255,120,0.3)); filter: blur(6px); opacity: 0; transition: opacity 0.4s ease; }
        .chrome-btn-v:hover::after { opacity: 1; }
      `}</style>

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${VG(0.08)}` }}>
        <LogoNervur height={28} onClick={() => navigate("/")} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" onClick={() => navigate("/technologies")} aria-label="Retour aux outils">← Outils</button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>Contact</button>
        </div>
      </nav>

      <main style={{ padding: isMobile ? "100px 16px 60px" : "160px 48px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* RETOUR */}
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => navigate("/")} style={{
            background: "none", border: "1px solid rgba(250,250,250,0.15)", borderRadius: "8px",
            color: "#86868B", fontSize: "13px", padding: "8px 20px", cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.target.style.color = "#1D1D1F"; e.target.style.borderColor = "rgba(250,250,250,0.3)"; }}
            onMouseLeave={e => { e.target.style.color = "#86868B"; e.target.style.borderColor = "rgba(250,250,250,0.15)"; }}>
            ← Retour
          </button>
        </div>
        {/* HERO */}
        <section aria-label="Présentation Sites Vitrines" style={{ animation: "fadeInUp 0.6s ease both", marginBottom: isMobile ? "40px" : "64px" }}>
          <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#86868B", fontFamily: "monospace", display: "block", marginBottom: "16px" }}>
            // Réalisations
          </span>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", gap: "20px" }}>
            <h1 style={{ fontSize: isMobile ? "32px" : "clamp(36px, 4.5vw, 56px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1 }}>
              Sites Vitrines<br /><span style={{ color: V3 }}>qui convertissent.</span>
            </h1>
            <p style={{ fontSize: "15px", color: "#86868B", maxWidth: "400px", lineHeight: 1.8 }}>
              Chaque projet est conçu sur-mesure. Design, performance et conversion au centre de chaque pixel.
            </p>
          </div>
        </section>


        {/* PROJECTS GRID */}
        <section aria-label="Projets réalisés" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {PROJECTS.map((project, i) => {
            const isReversed = i % 2 !== 0;
            return (
              <div key={i} className="project-card"
                style={{
                  display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0,
                  border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.7)", overflow: "hidden",
                  animation: `fadeInUp 0.6s ease ${0.1 + i * 0.1}s both`,
                  direction: !isMobile && isReversed ? "rtl" : "ltr"
                }}
                onMouseEnter={() => setHoveredProject(i)}
                onMouseLeave={() => setHoveredProject(null)}>

                {/* IMAGE */}
                <div style={{ position: "relative", overflow: "hidden", height: isMobile ? "220px" : "360px", direction: "ltr" }}>
                  {!imageLoaded[i] && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(24,24,27,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "24px", height: "24px", border: `2px solid ${VG(0.1)}`, borderTop: `2px solid ${project.color}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    </div>
                  )}
                  <img className="project-img" src={project.image} alt={project.name}
                    onLoad={() => setImageLoaded(prev => ({ ...prev, [i]: true }))}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: hoveredProject === i ? "brightness(1.1)" : "brightness(0.85)" }} />
                  <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", gap: "8px" }}>
                    <span style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", background: "rgba(9,9,11,0.8)", backdropFilter: "blur(8px)", color: project.color, padding: "4px 12px", border: `1px solid ${project.color}40` }}>
                      {project.type}
                    </span>
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(transparent, rgba(9,9,11,0.8))" }} />
                </div>

                {/* CONTENT */}
                <div style={{ padding: isMobile ? "28px 24px" : "40px 36px", display: "flex", flexDirection: "column", justifyContent: "center", direction: "ltr" }}>
                  <h2 style={{ fontSize: isMobile ? "24px" : "30px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>
                    {project.name}
                  </h2>
                  <p style={{ fontSize: "14px", color: "#86868B", lineHeight: 1.8, marginBottom: "20px" }}>
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                    {project.tags.map((t, j) => (
                      <span key={j} style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: project.color, padding: "4px 12px", border: `1px solid ${project.color}30`, background: `${project.color}08` }}>
                        {t}
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </section>

        {/* CTA */}
        <section aria-label="Appel à l'action" style={{ marginTop: "80px", textAlign: "center", padding: isMobile ? "40px 20px" : "60px 48px", border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.6)", borderRadius: "12px", animation: "fadeInUp 0.8s ease 0.5s both" }}>
          <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>
            Votre projet mérite un site à la hauteur.
          </h2>
          <p style={{ fontSize: "15px", color: "#86868B", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px", lineHeight: 1.7 }}>
            On conçoit des sites vitrines sur-mesure qui reflètent votre identité et convertissent vos visiteurs en clients.
          </p>
          <button className="chrome-btn-v" onClick={() => navigate('/contact?outil=vitrine')}>
            Lancer mon projet →
          </button>
        </section>
      </main>

      <footer style={{ padding: isMobile ? "30px 20px" : "40px 48px", borderTop: `1px solid ${VG(0.08)}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
        <span style={{ fontSize: "11px", color: "#86868B", letterSpacing: "1px" }}>NERVÜR © 2026</span>
        <span style={{ fontSize: "11px", color: "#86868B" }}>Éditeur de Technologies de Croissance</span>
      </footer>
    </div>
  );
}
