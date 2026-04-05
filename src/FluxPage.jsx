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

const PLATFORMS = ["LinkedIn", "Instagram", "Facebook", "Twitter"];
const TONES = ["Professionnel", "Décontracté", "Inspirant"];
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const PLATFORM_ICONS = {
  LinkedIn: "\u{1F4BC}",
  Instagram: "\u{1F4F7}",
  Facebook: "\u{1F30D}",
  Twitter: "\u{1D54F}",
};

const generateFallbackCalendar = (companyName, sector, platforms, tone) => {
  const templates = {
    LinkedIn: [
      { type: "Post carousel", content: `5 tendances ${sector} que ${companyName} surveille de près`, time: "09:00" },
      { type: "Article", content: `Comment ${companyName} révolutionne le ${sector} en 2026`, time: "08:30" },
      { type: "Sondage", content: `Quel est votre plus grand défi en ${sector} cette année ?`, time: "12:00" },
      { type: "Post texte", content: `Les coulisses de ${companyName} : notre approche du ${sector}`, time: "10:00" },
      { type: "Vidéo native", content: `3 conseils d'expert ${sector} par l'équipe ${companyName}`, time: "11:00" },
      { type: "Infographie", content: `${sector} en chiffres : les stats clés à connaître`, time: "09:30" },
      { type: "Témoignage client", content: `Comment notre client a transformé son ${sector} avec ${companyName}`, time: "14:00" },
    ],
    Instagram: [
      { type: "Reel", content: `Behind the scenes chez ${companyName} — ${sector} edition`, time: "12:00" },
      { type: "Carousel", content: `5 mythes sur le ${sector} démystifiés par ${companyName}`, time: "11:00" },
      { type: "Story interactive", content: `Quiz : testez vos connaissances en ${sector}`, time: "18:00" },
      { type: "Post visuel", content: `L'innovation ${sector} vue par ${companyName}`, time: "13:00" },
      { type: "Reel éducatif", content: `En 30 secondes : comprendre le ${sector} avec ${companyName}`, time: "17:00" },
      { type: "Carousel tips", content: `4 astuces ${sector} que personne ne vous dit`, time: "10:00" },
      { type: "Story sondage", content: `Votre avis compte : l'avenir du ${sector} selon vous ?`, time: "20:00" },
    ],
    Facebook: [
      { type: "Post engageant", content: `${companyName} partage ses prédictions ${sector} pour 2026`, time: "10:00" },
      { type: "Vidéo live", content: `Live Q&A : vos questions sur le ${sector} avec ${companyName}`, time: "14:00" },
      { type: "Article partagé", content: `Analyse ${sector} : ce que les données révèlent pour ${companyName}`, time: "09:00" },
      { type: "Post communauté", content: `Rejoignez la conversation : le futur du ${sector}`, time: "11:00" },
      { type: "Événement", content: `Webinaire ${companyName} : maîtriser le ${sector} en 2026`, time: "15:00" },
      { type: "Post photo", content: `L'équipe ${companyName} en action sur un projet ${sector}`, time: "12:00" },
      { type: "Sondage", content: `Quelle innovation ${sector} vous enthousiasme le plus ?`, time: "16:00" },
    ],
    Twitter: [
      { type: "Thread", content: `Thread : 7 insights ${sector} que ${companyName} a découverts ce mois-ci`, time: "08:00" },
      { type: "Tweet actu", content: `Hot take de ${companyName} sur les dernières news ${sector}`, time: "13:00" },
      { type: "Tweet question", content: `Question pour notre communauté ${sector} :`, time: "17:00" },
      { type: "Tweet stat", content: `Le saviez-vous ? Le ${sector} a évolué de 40% cette année — ${companyName}`, time: "09:00" },
      { type: "Thread éducatif", content: `Mini-cours : les bases du ${sector} par ${companyName}`, time: "10:00" },
      { type: "Tweet engagement", content: `RT si vous pensez que le ${sector} va tout changer en 2026`, time: "14:00" },
      { type: "Tweet citation", content: `"L'avenir du ${sector} appartient à ceux qui innovent" — ${companyName}`, time: "11:00" },
    ],
  };

  const calendar = DAYS.map((day, i) => {
    const platform = platforms[i % platforms.length];
    const items = templates[platform] || templates.LinkedIn;
    const item = items[i % items.length];
    return { day, platform, type: item.type, content: item.content, time: item.time };
  });

  return { calendar };
};

export default function FluxPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [platforms, setPlatforms] = useState(["LinkedIn"]);
  const [tone, setTone] = useState("Professionnel");
  const [isGenerating, setIsGenerating] = useState(false);
  const [calendar, setCalendar] = useState(null);
  const [visibleCards, setVisibleCards] = useState(0);

  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
      glowRef.current.style.opacity = 1;
    }
  };

  useSEO("FLUX — Automatisation IA | NERVÜR", "Automatisez vos workflows avec l'IA. Connexion entre vos outils, traitement de données et actions automatisées.", { path: "/flux" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Staggered reveal
  useEffect(() => {
    if (!calendar) return;
    setVisibleCards(0);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCards(count);
      if (count >= calendar.length) { clearInterval(interval); setIsGenerating(false); }
    }, 150);
    return () => clearInterval(interval);
  }, [calendar]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const togglePlatform = (p) => {
    setPlatforms(prev => prev.includes(p) ? (prev.length > 1 ? prev.filter(x => x !== p) : prev) : [...prev, p]);
  };

  const generateCalendar = async () => {
    if (!companyName.trim() || !sector.trim()) return;
    setIsGenerating(true);
    setCalendar(null);
    setVisibleCards(0);

    try {
      const res = await fetch(`${API_URL}/api/flux/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, sector, platforms, tone }),
      });
      const data = await res.json();
      if (data.calendar) { setCalendar(data.calendar); return; }
    } catch (err) { /* fallback */ }

    const fallback = generateFallbackCalendar(companyName, sector, platforms, tone);
    setCalendar(fallback.calendar);
  };

  const canGenerate = companyName.trim().length > 1 && sector.trim().length > 1;

  return (
    <div onMouseMove={handleMouseMove} style={{ background: "#FFFFFF", color: "#0A2540", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", minHeight: "100vh", position: "relative" }}>
      <div ref={glowRef} style={{ position: "fixed", left: -100, top: -100, width: "150px", height: "150px", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)", transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s", opacity: 0, mixBlendMode: "screen" }} />

      <style>{`
        .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${VG(0.08)}` }}>
        <LogoNervur height={28} onClick={() => navigate("/")} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" aria-label="Retour aux outils" onClick={() => navigate("/technologies")}>← Outils</button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>Contact</button>
        </div>
      </nav>

      {/* HERO */}
      <main style={{ padding: isMobile ? "100px 20px 60px" : "160px 48px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ animation: "fadeInUp 0.8s ease both", marginBottom: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <svg width="32" height="32" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <defs><linearGradient id="hero-flux" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient></defs>
              <rect x="3" y="4" width="20" height="18" rx="3" fill="none" stroke="url(#hero-flux)" strokeWidth="1.5" />
              <line x1="3" y1="10" x2="23" y2="10" stroke="url(#hero-flux)" strokeWidth="1.5" />
              <line x1="9" y1="4" x2="9" y2="10" stroke="url(#hero-flux)" strokeWidth="1.5" />
              <line x1="17" y1="4" x2="17" y2="10" stroke="url(#hero-flux)" strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#22d3ee", fontWeight: 700, padding: "4px 12px", border: "1px solid rgba(34,211,238,0.3)", borderRadius: "2px" }}>SOCIAL MEDIA</span>
          </div>
          <h1 style={{ fontSize: isMobile ? "36px" : "clamp(42px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: "20px" }}>FLUX</h1>
          <p style={{ fontSize: "18px", color: "#6B7C93", lineHeight: 1.8, maxWidth: "600px" }}>
            Planifiez 30 jours de contenu social en un clic. L'IA adapte le ton à chaque plateforme.
          </p>
        </div>

        {/* STATS BAR */}
        <section aria-label="Statistiques clés" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px", marginBottom: "48px", animation: "fadeInUp 0.8s ease 0.2s both" }}>
          {[
            { label: "Posts / mois", value: "120" },
            { label: "Engagement", value: "x4.1" },
            { label: "Gain de temps", value: "87%" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "20px 24px", border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.7)", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: V, marginBottom: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#6B7C93" }}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* DEMO */}
        <section aria-label="Générateur de calendrier social" style={{ animation: "fadeInUp 0.8s ease 0.4s both" }}>
          <div style={{ border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.75)", borderRadius: "12px", overflow: "hidden", backdropFilter: "blur(12px)" }}>
            {/* Dashboard header */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${VG(0.08)}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
                <span style={{ fontSize: "11px", color: "#6B7C93", marginLeft: "12px", letterSpacing: "1px" }}>flux-planner.nervur.com</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee" }} />
                <span style={{ fontSize: "9px", color: "#22d3ee", letterSpacing: "1px" }}>READY</span>
              </div>
            </div>

            <div style={{ padding: isMobile ? "20px" : "32px" }}>
              {/* Inputs */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#6B7C93", display: "block", marginBottom: "8px" }}>NOM DE L'ENTREPRISE</label>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: Acme Corp"
                    style={{ width: "100%", padding: "14px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`, color: V, fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", borderRadius: "6px", transition: "border-color 0.3s" }}
                    onFocus={e => e.target.style.borderColor = VG(0.25)} onBlur={e => e.target.style.borderColor = VG(0.1)} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#6B7C93", display: "block", marginBottom: "8px" }}>SECTEUR D'ACTIVITÉ</label>
                  <input value={sector} onChange={e => setSector(e.target.value)} placeholder="Ex: Tech SaaS, Immobilier, Mode"
                    style={{ width: "100%", padding: "14px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`, color: V, fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", borderRadius: "6px", transition: "border-color 0.3s" }}
                    onFocus={e => e.target.style.borderColor = VG(0.25)} onBlur={e => e.target.style.borderColor = VG(0.1)} />
                </div>
              </div>

              {/* Platform selector */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#6B7C93", display: "block", marginBottom: "10px" }}>PLATEFORMES</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => togglePlatform(p)} style={{
                      padding: "10px 18px", background: platforms.includes(p) ? "rgba(6,182,212,0.15)" : VG(0.04),
                      border: `1px solid ${platforms.includes(p) ? "rgba(34,211,238,0.5)" : VG(0.1)}`,
                      color: platforms.includes(p) ? "#22d3ee" : V3, fontSize: "13px", cursor: "pointer",
                      transition: "all 0.3s", fontFamily: "inherit",
                    }}>{PLATFORM_ICONS[p]} {p}</button>
                  ))}
                </div>
              </div>

              {/* Tone selector */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#6B7C93", display: "block", marginBottom: "10px" }}>TON</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)} style={{
                      padding: "10px 18px", background: tone === t ? "rgba(6,182,212,0.15)" : VG(0.04),
                      border: `1px solid ${tone === t ? "rgba(34,211,238,0.5)" : VG(0.1)}`,
                      color: tone === t ? "#22d3ee" : V3, fontSize: "13px", cursor: "pointer",
                      transition: "all 0.3s", fontFamily: "inherit",
                    }}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button onClick={generateCalendar} disabled={isGenerating || !canGenerate}
                style={{
                  padding: "14px 32px", background: canGenerate ? "linear-gradient(135deg, #06b6d4, #22d3ee)" : VG(0.06),
                  border: "none", color: canGenerate ? "#FFFFFF" : "#6B7C93", fontWeight: 700, fontSize: "12px",
                  letterSpacing: "1.5px", textTransform: "uppercase", cursor: canGenerate && !isGenerating ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease", fontFamily: "inherit", opacity: !canGenerate ? 0.4 : 1,
                }}>
                {isGenerating ? "Génération en cours..." : "Générer le calendrier →"}
              </button>

              {/* Calendar result */}
              {calendar && (
                <div style={{ marginTop: "28px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                  {calendar.map((entry, i) => (
                    <div key={i} style={{
                      padding: "18px 20px", border: "1px solid rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.03)",
                      borderRadius: "10px", opacity: i < visibleCards ? 1 : 0, transform: i < visibleCards ? "translateY(0)" : "translateY(16px)",
                      transition: "opacity 0.4s ease, transform 0.4s ease",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#22d3ee" }}>{entry.day}</span>
                        <span style={{ fontSize: "11px", color: "#6B7C93" }}>{entry.time}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px" }}>{PLATFORM_ICONS[entry.platform] || ""}</span>
                        <span style={{ fontSize: "10px", letterSpacing: "1.5px", fontWeight: 600, color: "#06b6d4", padding: "2px 8px", border: "1px solid rgba(6,182,212,0.3)", borderRadius: "2px" }}>{entry.platform}</span>
                        <span style={{ fontSize: "10px", letterSpacing: "1px", color: "#6B7C93" }}>{entry.type}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#6B7C93", lineHeight: 1.6, margin: 0 }}>{entry.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section aria-label="Appel à l'action" style={{ marginTop: "80px", textAlign: "center", padding: isMobile ? "40px 20px" : "60px 48px", border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.6)", borderRadius: "12px", animation: "fadeInUp 0.8s ease 0.6s both" }}>
          <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>
            Automatisez votre présence sociale avec Flux
          </h2>
          <p style={{ fontSize: "15px", color: "#6B7C93", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px", lineHeight: 1.7 }}>
            Planifiez, générez et publiez votre contenu social media en quelques clics. Notre équipe configure Flux sur-mesure pour votre marque.
          </p>
          <button onClick={() => navigate('/contact?outil=flux')} style={{
            padding: "16px 40px", background: V, color: "#FFFFFF", border: "none",
            fontWeight: 800, fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase",
            cursor: "pointer", transition: "all 0.3s ease" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)"; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
            Réserver un appel →
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ padding: isMobile ? "30px 20px" : "40px 48px", borderTop: `1px solid ${VG(0.08)}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
        <span style={{ fontSize: "11px", color: "#6B7C93", letterSpacing: "1px" }}>La structure derrière l'impact. © 2026</span>
        <span style={{ fontSize: "11px", color: "#6B7C93" }}>FLUX — Planificateur Social Media IA</span>
      </footer>
    </div>
  );
}
