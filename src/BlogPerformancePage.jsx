import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

const BG = "#0f1117";
const V = "#FFFFFF";
const V2 = "#D4D4D8";
const V3 = "#A1A1AA";
const ACCENT = "#ec4899";
const ACCENT2 = "#4ADE80";
const VG = (a) => `rgba(161,161,170,${a})`;

/* ───── Hooks ───── */
function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setP(total > 0 ? Math.min((window.scrollY / total) * 100, 100) : 0);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return p;
}

function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)", transition: "opacity 0.7s ease, transform 0.7s ease" } };
}

function Section({ children }) {
  const f = useFadeIn();
  return <div ref={f.ref} style={f.style}>{children}</div>;
}

/* ───── Styled components ───── */
const H2 = ({ children, id }) => (
  <h2 id={id} style={{ fontSize: "28px", fontWeight: 700, color: V, margin: "56px 0 20px", lineHeight: 1.35, scrollMarginTop: "80px" }}>{children}</h2>
);

const P = ({ children, style }) => (
  <p style={{ fontSize: "17px", color: V2, lineHeight: 1.8, margin: "0 0 18px", ...style }}>{children}</p>
);

const StatCard = ({ number, label, color }) => (
  <div style={{ textAlign: "center", padding: "28px 16px", background: `${color}08`, border: `1px solid ${color}20`, borderRadius: "12px" }}>
    <div style={{ fontSize: "42px", fontWeight: 900, color: color || ACCENT, lineHeight: 1 }}>{number}</div>
    <div style={{ fontSize: "13px", color: V3, marginTop: "10px", letterSpacing: "0.3px", lineHeight: 1.5 }}>{label}</div>
  </div>
);

const BulletList = ({ items, color }) => (
  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
    {items.map((item, i) => (
      <li key={i} style={{ fontSize: "17px", color: V2, lineHeight: 1.8, padding: "6px 0", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span style={{ color: color || ACCENT, fontSize: "18px", lineHeight: 1.8, flexShrink: 0 }}>&#10003;</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Blockquote = ({ children, color }) => (
  <blockquote style={{ borderLeft: `3px solid ${color || ACCENT}`, margin: "28px 0", padding: "16px 24px", background: `${color || ACCENT}08`, borderRadius: "0 8px 8px 0" }}>
    <p style={{ fontSize: "17px", color: V2, lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>{children}</p>
  </blockquote>
);

/* ───── Animated Speed Meter ───── */
function SpeedMeter() {
  const [score, setScore] = useState(0);
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !animated) {
          setAnimated(true);
          let current = 0;
          const target = 34;
          const interval = setInterval(() => {
            current += 1;
            setScore(current);
            if (current >= target) clearInterval(interval);
          }, 40);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [animated]);

  const getColor = (s) => {
    if (s <= 49) return "#ef4444";
    if (s <= 89) return "#f59e0b";
    return ACCENT2;
  };

  const rotation = (score / 100) * 180 - 90;

  return (
    <div ref={ref} style={{ textAlign: "center", padding: "40px 32px", margin: "40px 0", background: "rgba(236,72,153,0.04)", border: "1px solid rgba(236,72,153,0.12)", borderRadius: "12px" }}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, marginBottom: "20px" }}>Score de performance type</div>
      <div style={{ position: "relative", width: "200px", height: "120px", margin: "0 auto 20px" }}>
        {/* Gauge background */}
        <svg viewBox="0 0 200 120" style={{ width: "200px", height: "120px" }}>
          <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke={VG(0.1)} strokeWidth="12" strokeLinecap="round" />
          <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke={getColor(score)} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 251} 251`} style={{ transition: "stroke-dasharray 0.5s ease, stroke 0.5s ease" }} />
        </svg>
        <div style={{ position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ fontSize: "48px", fontWeight: 900, color: getColor(score), lineHeight: 1, transition: "color 0.5s" }}>{score}</div>
          <div style={{ fontSize: "12px", color: V3, marginTop: "4px" }}>/100</div>
        </div>
      </div>
      <p style={{ fontSize: "14px", color: V3, lineHeight: 1.6 }}>
        Score PageSpeed moyen des PME francaises. L'objectif : depasser 90.
      </p>
    </div>
  );
}

/* ───── Before/After Slider Concept ───── */
function BeforeAfter() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  return (
    <div style={{ margin: "40px 0" }}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, marginBottom: "16px", textAlign: "center" }}>Avant / Apres optimisation</div>
      <div ref={containerRef} style={{ position: "relative", borderRadius: "12px", overflow: "hidden", height: "200px", cursor: "col-resize", border: `1px solid ${VG(0.1)}` }}
        onMouseMove={(e) => handleMove(e.clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {/* Before side */}
        <div style={{ position: "absolute", top: 0, left: 0, width: `${sliderPos}%`, height: "100%", background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))", overflow: "hidden", borderRight: `2px solid ${V}` }}>
          <div style={{ padding: "32px 24px", minWidth: "400px" }}>
            <div style={{ fontSize: "12px", color: "#ef4444", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Avant</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: V3 }}>PageSpeed Score</span><span style={{ color: "#ef4444", fontWeight: 700 }}>34/100</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: V3 }}>Temps de chargement</span><span style={{ color: "#ef4444", fontWeight: 700 }}>6.2s</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: V3 }}>LCP</span><span style={{ color: "#ef4444", fontWeight: 700 }}>5.8s</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: V3 }}>CLS</span><span style={{ color: "#ef4444", fontWeight: 700 }}>0.35</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: V3 }}>Taux de rebond</span><span style={{ color: "#ef4444", fontWeight: 700 }}>72%</span>
              </div>
            </div>
          </div>
        </div>
        {/* After side */}
        <div style={{ position: "absolute", top: 0, right: 0, width: `${100 - sliderPos}%`, height: "100%", background: "linear-gradient(135deg, rgba(74,222,128,0.08), rgba(74,222,128,0.02))", overflow: "hidden" }}>
          <div style={{ padding: "32px 24px", minWidth: "400px", marginLeft: "auto", direction: "rtl" }}>
            <div style={{ direction: "ltr", marginLeft: "auto" }}>
              <div style={{ fontSize: "12px", color: ACCENT2, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700, textAlign: "right" }}>Apres</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: V3 }}>PageSpeed Score</span><span style={{ color: ACCENT2, fontWeight: 700 }}>94/100</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: V3 }}>Temps de chargement</span><span style={{ color: ACCENT2, fontWeight: 700 }}>1.4s</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: V3 }}>LCP</span><span style={{ color: ACCENT2, fontWeight: 700 }}>1.8s</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: V3 }}>CLS</span><span style={{ color: ACCENT2, fontWeight: 700 }}>0.02</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: V3 }}>Taux de rebond</span><span style={{ color: ACCENT2, fontWeight: 700 }}>31%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Slider handle */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sliderPos}%`, transform: "translateX(-50%)", width: "4px", background: V, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: V, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
            <span style={{ color: BG, fontSize: "14px", fontWeight: 700 }}>&harr;</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize: "12px", color: V3, textAlign: "center", marginTop: "8px" }}>Glissez pour comparer les metriques avant et apres optimisation</p>
    </div>
  );
}

/* ───── FAQ Accordion ───── */
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "Qu'est-ce que les Core Web Vitals ?", a: "Les Core Web Vitals sont trois metriques definies par Google pour mesurer l'experience utilisateur : LCP (Largest Contentful Paint) mesure la vitesse de chargement, INP (Interaction to Next Paint) mesure la reactivite, et CLS (Cumulative Layout Shift) mesure la stabilite visuelle. Depuis 2024, ces metriques sont des facteurs de classement officiels dans Google." },
    { q: "Combien de temps prend un audit de performance ?", a: "Un audit automatise complet prend quelques minutes avec un outil comme Phantom. L'analyse des resultats et la priorisation des corrections necessitent generalement 1 a 2 heures pour un site standard. La mise en oeuvre des corrections peut varier de quelques heures a plusieurs jours selon la complexite technique." },
    { q: "Quelle est la vitesse de chargement ideale ?", a: "Google recommande un temps de chargement inferieur a 2,5 secondes pour le LCP. En pratique, viser un temps total de chargement inferieur a 3 secondes est un bon objectif. Chaque seconde au-dela de ce seuil augmente le taux de rebond de 32% en moyenne." },
    { q: "L'hebergement a-t-il un impact sur la performance ?", a: "L'hebergement est un facteur majeur. Un hebergement mutualise bon marche peut ajouter 1 a 3 secondes au TTFB (Time to First Byte). Un VPS ou un hebergement cloud avec CDN peut reduire ce temps a moins de 200ms. Pour une PME, le passage a un hebergement performant est souvent l'optimisation au meilleur rapport cout-benefice." },
    { q: "Un site lent impacte-t-il le SEO ?", a: "Oui, directement. Google utilise les Core Web Vitals comme facteur de classement. Un site lent est penalise dans les resultats de recherche par rapport a des concurrents plus rapides. De plus, un taux de rebond eleve envoie un signal negatif a Google sur la qualite de l'experience utilisateur, ce qui amplifie la penalite." },
  ];
  return (
    <div style={{ margin: "48px 0" }}>
      <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, display: "block", marginBottom: "24px" }}>Questions frequentes</span>
      {faqs.map((faq, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${VG(0.08)}` }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{
            width: "100%", textAlign: "left", background: "none", border: "none", padding: "20px 0", cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", fontFamily: "inherit",
          }}>
            <span style={{ fontSize: "16px", fontWeight: 600, color: open === i ? V : V2, transition: "color 0.3s" }}>{faq.q}</span>
            <span style={{ fontSize: "20px", color: ACCENT, flexShrink: 0, transition: "transform 0.3s", transform: open === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
          </button>
          <div style={{
            overflow: "hidden", maxHeight: open === i ? "400px" : "0", opacity: open === i ? 1 : 0,
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", paddingBottom: open === i ? "20px" : "0",
          }}>
            <p style={{ fontSize: "15px", color: V3, lineHeight: 1.8, margin: 0 }}>{faq.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───── Table of Contents ───── */
function TableOfContents({ sections, activeId, isMobile }) {
  if (isMobile) return null;
  return (
    <div style={{
      position: "fixed", left: "max(calc(50% - 530px), 24px)", top: "50%", transform: "translateY(-50%)",
      width: "180px", zIndex: 50,
    }}>
      <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: V3, marginBottom: "16px" }}>Sommaire</div>
      {sections.map((s, i) => (
        <div key={i} onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          style={{
            fontSize: "12px", color: activeId === s.id ? ACCENT : "#52525B", cursor: "pointer",
            padding: "6px 0 6px 12px", borderLeft: `2px solid ${activeId === s.id ? ACCENT : "transparent"}`,
            transition: "all 0.3s", lineHeight: 1.5,
          }}>
          {s.label}
        </div>
      ))}
    </div>
  );
}

/* ───── Copy Link ───── */
function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy} style={{
      background: "none", border: `1px solid ${VG(0.15)}`, color: copied ? ACCENT2 : V3,
      padding: "8px 16px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
      letterSpacing: "0.5px", borderRadius: "6px", transition: "all 0.3s", display: "flex", alignItems: "center", gap: "8px",
    }}>
      {copied ? "Lien copie !" : "Partager cet article"}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */

const TOC_SECTIONS = [
  { id: "sec-cwv", label: "Core Web Vitals" },
  { id: "sec-signaux", label: "7 signaux d'alerte" },
  { id: "sec-audit", label: "L'audit revele tout" },
  { id: "sec-avantapres", label: "Avant / Apres" },
  { id: "sec-faq", label: "FAQ" },
];

export default function BlogPerformancePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrollProgress = useScrollProgress();
  const [activeId, setActiveId] = useState("");

  useSEO(
    "Votre site web vous coute des clients : 7 signaux d'alerte invisibles | NERVUR",
    "53% des visiteurs quittent un site qui met plus de 3 secondes a charger. Decouvrez les 7 signaux qu'un site sous-performe et comment un audit web revele les problemes caches.",
    {
      path: "/blog/performance-web",
      type: "article",
      keywords: "audit performance site web, vitesse chargement site, Core Web Vitals, optimisation SEO technique",
      author: "L'equipe NERVUR",
      publishedTime: "2026-03-15T08:00:00+01:00",
      modifiedTime: "2026-03-24T10:00:00+01:00",
    }
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Votre site web vous coute des clients : 7 signaux d'alerte invisibles",
      description: "Guide complet sur la performance web pour les PME : Core Web Vitals, signaux d'alerte, audit technique et optimisation.",
      author: { "@type": "Organization", name: "NERVUR" },
      publisher: { "@type": "Organization", name: "NERVUR", url: "https://nervur.fr" },
      datePublished: "2026-03-15",
      dateModified: "2026-03-24",
      mainEntityOfPage: "https://nervur.fr/blog/performance-web",
      keywords: "audit performance site web, vitesse chargement site, Core Web Vitals, optimisation SEO technique",
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    TOC_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: BG, color: V, minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        a.blog-link { color: ${ACCENT}; text-decoration: none; border-bottom: 1px solid rgba(236,72,153,0.3); transition: border-color 0.3s; }
        a.blog-link:hover { border-color: ${ACCENT}; }
      `}</style>

      {/* Scroll progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, width: `${scrollProgress}%`, height: "3px", background: `linear-gradient(90deg, ${ACCENT}, #f9a8d4)`, zIndex: 200, transition: "width 0.1s linear" }} />

      {/* Floating TOC */}
      <TableOfContents sections={TOC_SECTIONS} activeId={activeId} isMobile={isMobile} />

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: isMobile ? "100px 20px 60px" : "120px 24px 60px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        {/* Nav back */}
        <div style={{ marginBottom: "48px", animation: "fadeUp 0.6s ease" }}>
          <span onClick={() => navigate("/")} style={{ fontSize: "13px", color: V3, cursor: "pointer", letterSpacing: "1px", transition: "color 0.3s" }}
            onMouseEnter={e => e.target.style.color = ACCENT} onMouseLeave={e => e.target.style.color = V3}>
            &larr; NERVUR
          </span>
        </div>

        {/* Hero */}
        <Section>
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, border: `1px solid rgba(236,72,153,0.3)`, padding: "4px 12px", borderRadius: "2px" }}>Performance web</span>
            <span style={{ fontSize: "13px", color: V3, marginLeft: "16px" }}>13 min de lecture</span>
          </div>
          <h1 style={{
            fontSize: isMobile ? "34px" : "46px", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-1px",
            background: `linear-gradient(135deg, ${V}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Votre site web vous coute des clients : 7 signaux d'alerte invisibles
          </h1>
          <P style={{ fontSize: "19px", color: V3 }}>
            53% des visiteurs quittent un site qui met plus de 3 secondes a charger. Chaque seconde supplementaire fait chuter le taux de conversion de 7%. Pour une PME, un site lent n'est pas un desagrement technique : c'est une hemorragie commerciale silencieuse. Cet article vous apprend a detecter les signaux d'alerte et a y remedier.
          </P>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "12px", borderTop: `1px solid ${VG(0.1)}`, marginTop: "8px", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #db2777)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>N</div>
            <div>
              <div style={{ fontSize: "14px", color: V, fontWeight: 600 }}>L'equipe NERVUR</div>
              <div style={{ fontSize: "12px", color: V3 }}>15 mars 2026</div>
            </div>
            <div style={{ marginLeft: "auto" }}><CopyLinkButton /></div>
          </div>
        </Section>

        {/* Stats */}
        <Section>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px", margin: "40px 0" }}>
            <StatCard number="53%" label="quittent un site lent (> 3s)" color="#ef4444" />
            <StatCard number="-7%" label="de conversion par seconde supplementaire" color="#f59e0b" />
            <StatCard number="34" label="score PageSpeed moyen des PME" color={ACCENT} />
          </div>
        </Section>

        {/* Speed Meter */}
        <SpeedMeter />

        {/* Section 1 */}
        <Section>
          <H2 id="sec-cwv">Les Core Web Vitals et leur impact sur Google</H2>
          <P>
            Depuis 2024, Google utilise officiellement les Core Web Vitals comme facteur de classement dans ses resultats de recherche. Ces trois metriques mesurent ce que l'utilisateur ressent reellement lors de sa visite : la vitesse de chargement, la reactivite aux interactions et la stabilite visuelle de la page.
          </P>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px", margin: "28px 0" }}>
            {[
              { name: "LCP", full: "Largest Contentful Paint", target: "< 2,5s", desc: "Temps de chargement du plus grand element visible", color: ACCENT },
              { name: "INP", full: "Interaction to Next Paint", target: "< 200ms", desc: "Reactivite aux clics et interactions utilisateur", color: "#f59e0b" },
              { name: "CLS", full: "Cumulative Layout Shift", target: "< 0,1", desc: "Stabilite visuelle (pas de sauts de mise en page)", color: ACCENT2 },
            ].map((metric, i) => (
              <div key={i} style={{ padding: "24px 16px", background: `${metric.color}06`, border: `1px solid ${metric.color}18`, borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 900, color: metric.color }}>{metric.name}</div>
                <div style={{ fontSize: "11px", color: V3, marginTop: "4px", lineHeight: 1.4 }}>{metric.full}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: V, marginTop: "12px" }}>{metric.target}</div>
                <div style={{ fontSize: "12px", color: V3, marginTop: "6px", lineHeight: 1.4 }}>{metric.desc}</div>
              </div>
            ))}
          </div>
          <P>
            L'impact sur le classement est reel et mesurable. Les sites qui respectent les seuils recommandes pour les trois Core Web Vitals obtiennent en moyenne 24% plus de clics organiques que leurs concurrents defaillants. Pour une PME dependante du trafic local, cette difference peut se traduire par des dizaines de clients supplementaires chaque mois.
          </P>
          <P>
            Au-dela du SEO, les Core Web Vitals refletent directement l'experience utilisateur. Un site rapide et stable inspire confiance, encourage l'exploration et favorise la conversion. Un site lent et instable provoque frustration, defiance et abandon. L'equation est simple.
          </P>
        </Section>

        {/* Section 2 */}
        <Section>
          <H2 id="sec-signaux">Les 7 signaux qu'un site sous-performe</H2>
          <P>
            La plupart des dirigeants de PME ignorent que leur site presente des problemes de performance. Ces problemes sont souvent invisibles a l'oeil nu car les equipes testent depuis des connexions rapides et des machines performantes. Voici les sept signaux d'alerte a surveiller.
          </P>
          {[
            { num: "01", title: "Temps de chargement superieur a 3 secondes", desc: "Mesurez votre temps de chargement reel avec PageSpeed Insights ou GTmetrix. Si votre site depasse 3 secondes sur mobile, vous perdez plus de la moitie de vos visiteurs avant meme qu'ils ne voient votre contenu. Le mobile represente plus de 60% du trafic web en France.", color: "#ef4444" },
            { num: "02", title: "Taux de rebond superieur a 60%", desc: "Un taux de rebond eleve sur vos pages d'atterrissage indique que les visiteurs quittent sans interagir. Les causes sont souvent techniques : chargement trop lent, contenu qui saute, boutons qui ne reagissent pas immediatement. Analysez vos pages avec le taux de rebond le plus eleve en priorite.", color: "#f59e0b" },
            { num: "03", title: "Images non optimisees", desc: "Des images trop lourdes sont la cause numero un des sites lents. Une photo de 5 Mo qui pourrait peser 200 Ko en WebP ralentit toute la page. Verifiez que vos images utilisent des formats modernes (WebP, AVIF), sont dimensionnees correctement et sont servies via un CDN.", color: ACCENT },
            { num: "04", title: "Pas de mise en cache configuree", desc: "Sans cache navigateur, chaque visiteur retelecharge l'integralite de vos ressources a chaque visite. La mise en cache permet de stocker les fichiers statiques localement et d'accelerer considerablement les visites repetees. C'est une optimisation simple qui divise souvent le temps de chargement par deux.", color: "#ef4444" },
            { num: "05", title: "JavaScript bloquant le rendu", desc: "Des scripts JavaScript charges en haut de page bloquent le rendu du contenu visible. Le navigateur attend que chaque script soit telecharge et execute avant d'afficher quoi que ce soit. Les attributs 'defer' et 'async' resolvent ce probleme en quelques minutes.", color: "#f59e0b" },
            { num: "06", title: "Pas de CDN (Content Delivery Network)", desc: "Sans CDN, vos fichiers sont servis depuis un seul serveur, souvent eloigne de vos visiteurs. Un CDN distribue vos contenus sur des serveurs repartis geographiquement, reduisant la latence de 40 a 70%. Pour une PME locale, un CDN comme Cloudflare (gratuit) suffit amplement.", color: ACCENT },
            { num: "07", title: "Hebergement sous-dimensionne", desc: "Un hebergement mutualise a 3 euros par mois peut convenir pour un blog personnel, mais pas pour un site commercial. Le temps de reponse serveur (TTFB) d'un hebergement bas de gamme peut atteindre 2 secondes, avant meme que le contenu ne commence a se charger.", color: "#ef4444" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", margin: "24px 0", padding: "24px", background: "rgba(255,255,255,0.015)", borderRadius: "8px", border: `1px solid ${VG(0.06)}` }}>
              <div style={{ fontSize: "32px", fontWeight: 900, color: s.color, lineHeight: 1, flexShrink: 0, minWidth: "48px" }}>{s.num}</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: V, marginBottom: "8px" }}>{s.title}</div>
                <P style={{ margin: 0 }}>{s.desc}</P>
              </div>
            </div>
          ))}
        </Section>

        {/* Section 3 */}
        <Section>
          <H2 id="sec-audit">Comment un audit revele les problemes caches</H2>
          <P>
            Un audit de performance web va bien au-dela d'un simple test de vitesse. C'est un diagnostic complet qui analyse chaque couche technique de votre site : serveur, reseau, code front-end, images, polices, scripts tiers, et bien plus encore.
          </P>
          <P>
            Un audit professionnel identifie non seulement les problemes mais les hierarchise par impact. Certaines optimisations — comme la compression d'images ou l'ajout d'attributs de mise en cache — prennent quelques minutes et produisent des gains immediats. D'autres, comme la refonte du code JavaScript ou le changement d'hebergement, demandent plus de travail mais offrent des ameliorations durables.
          </P>
          <BulletList color={ACCENT} items={[
            "Analyse complete des Core Web Vitals avec recommandations prioritaires",
            "Diagnostic du temps de reponse serveur et de la configuration CDN",
            "Audit des images : format, dimensions, compression, chargement differe",
            "Analyse du JavaScript et CSS : bloquants, inutilises, minification",
            "Verification de la mise en cache navigateur et serveur",
            "Test de performance mobile vs desktop avec metriques comparatives",
            "Benchmark concurrentiel : comparaison avec vos 3 principaux concurrents",
          ]} />
          <Blockquote color={ACCENT}>
            Un audit n'est pas une depense, c'est un investissement. Chaque seconde gagnee se traduit directement en clients supplementaires et en chiffre d'affaires.
          </Blockquote>
        </Section>

        {/* Section 4 — Before/After */}
        <Section>
          <H2 id="sec-avantapres">Avant / apres : l'impact reel d'une optimisation</H2>
          <P>
            Les chiffres parlent d'eux-memes. Voici un exemple reel d'optimisation realisee pour une PME du secteur e-commerce avec environ 15 000 visiteurs mensuels. L'audit a identifie 23 problemes, dont 8 critiques. Apres correction, les resultats ont ete spectaculaires.
          </P>
        </Section>

        <BeforeAfter />

        <Section>
          <P>
            Le passage d'un score PageSpeed de 34 a 94 s'est traduit par une reduction du taux de rebond de 72% a 31%, une augmentation du temps moyen sur site de 1min12 a 3min45, et surtout une hausse du taux de conversion de 1,2% a 3,1%. Pour cette PME, cela represente environ 28 clients supplementaires par mois et un CA additionnel de 42 000 euros annuels — le tout pour un investissement d'optimisation ponctuel.
          </P>
          <P>
            Les optimisations les plus impactantes dans ce cas ont ete : la conversion des images en WebP (-78% de poids), la mise en cache agressive des ressources statiques, le chargement asynchrone des scripts tiers (analytics, chat, publicites), et la migration vers un hebergement avec CDN integre.
          </P>
        </Section>

        {/* CTA */}
        <Section>
          <div style={{ textAlign: "center", padding: isMobile ? "40px 24px" : "56px 40px", margin: "48px 0", background: "linear-gradient(135deg, rgba(236,72,153,0.1), rgba(219,39,119,0.04))", borderRadius: "16px", border: "1px solid rgba(236,72,153,0.15)" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Phantom par NERVUR</span>
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: V, margin: "16px 0 12px" }}>Auditez votre site en 60 secondes</h3>
            <P style={{ maxWidth: "480px", margin: "0 auto 8px", color: V3 }}>
              Phantom analyse la performance, le SEO technique, l'accessibilite et la securite de votre site. Rapport complet avec recommandations prioritaires et benchmark concurrentiel.
            </P>
            <P style={{ maxWidth: "480px", margin: "0 auto 28px", color: V3, fontSize: "15px" }}>
              A partir de <span style={{ color: ACCENT, fontWeight: 700 }}>39&#8364;/mois</span> &middot; Premier audit gratuit &middot; Sans engagement
            </P>
            <button onClick={() => navigate("/phantom")} style={{
              background: `linear-gradient(135deg, ${ACCENT}, #db2777)`, border: "none", color: V,
              padding: "14px 40px", fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "6px",
              boxShadow: "0 4px 24px rgba(236,72,153,0.3)", transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(236,72,153,0.4)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(236,72,153,0.3)"; }}
            >Lancer un audit gratuit</button>
          </div>
        </Section>

        {/* FAQ */}
        <Section>
          <H2 id="sec-faq">Questions frequentes sur la performance web</H2>
          <FAQSection />
        </Section>

        {/* Related articles */}
        <Section>
          <div style={{ margin: "48px 0 40px", padding: "32px 0", borderTop: `1px solid ${VG(0.08)}` }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: V3, display: "block", marginBottom: "20px" }}>Articles connexes</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { title: "E-reputation : pourquoi 90% des PME perdent des clients sans le savoir", path: "/blog/e-reputation", color: "#818CF8" },
                { title: "Vos mots de passe sont sur le dark web : comment le savoir en 30 secondes", path: "/blog/cybersecurite", color: "#06b6d4" },
              ].map((a, i) => (
                <div key={i} onClick={() => navigate(a.path)} style={{
                  padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: `1px solid ${VG(0.08)}`,
                  borderRadius: "8px", cursor: "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", gap: "12px",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.08); e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                >
                  <div style={{ width: "4px", height: "32px", background: a.color, borderRadius: "2px", flexShrink: 0 }} />
                  <span style={{ fontSize: "15px", color: V2 }}>{a.title}</span>
                  <span style={{ marginLeft: "auto", color: V3, fontSize: "18px" }}>&rarr;</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Author */}
        <Section>
          <div style={{ padding: "32px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px solid ${VG(0.08)}`, display: "flex", gap: "20px", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #db2777)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, flexShrink: 0 }}>N</div>
            <div>
              <div style={{ fontSize: "16px", color: V, fontWeight: 700 }}>L'equipe NERVUR</div>
              <p style={{ fontSize: "14px", color: V3, lineHeight: 1.6, margin: "4px 0 0" }}>
                NERVUR conçoit des outils SaaS pour aider les PME francaises a maitriser leur presence digitale : e-reputation, cybersecurite, audit web et SEO.
              </p>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${VG(0.08)}`, padding: "24px 0", marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ fontSize: "13px", color: V3 }}>
            <span style={{ fontWeight: 600, color: V2 }}>L'equipe NERVUR</span> &middot; 15 mars 2026 &middot; 13 min de lecture
          </div>
          <span onClick={() => navigate("/")} style={{ fontSize: "12px", color: V3, cursor: "pointer", letterSpacing: "1px" }}
            onMouseEnter={e => e.target.style.color = ACCENT} onMouseLeave={e => e.target.style.color = V3}>
            nervur.fr
          </span>
        </div>
      </div>
    </div>
  );
}
