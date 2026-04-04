import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

const BG = "#0f1117";
const V = "#FFFFFF";
const V2 = "#D4D4D8";
const V3 = "#A1A1AA";
const ACCENT = "#8b5cf6";
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

/* ───── Digital Maturity Quiz ───── */
function DigitalMaturityQuiz() {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const questions = [
    { q: "Avez-vous une fiche Google Business Profile optimisee ?", weight: 2 },
    { q: "Repondez-vous a tous vos avis Google (positifs et negatifs) ?", weight: 2 },
    { q: "Votre site web est-il adapte aux mobiles ?", weight: 1.5 },
    { q: "Votre entreprise est-elle conforme au RGPD ?", weight: 2 },
    { q: "Utilisez-vous des outils de surveillance de votre e-reputation ?", weight: 1.5 },
    { q: "Votre politique de confidentialite est-elle a jour ?", weight: 1 },
  ];
  const toggle = (i) => {
    setAnswers(prev => ({ ...prev, [i]: !prev[i] }));
    setShowResult(false);
  };
  const score = Object.entries(answers).filter(([, v]) => v).reduce((sum, [k]) => sum + questions[k].weight, 0);
  const maxScore = questions.reduce((sum, q) => sum + q.weight, 0);
  const pct = Math.round((score / maxScore) * 100);

  return (
    <div style={{ margin: "40px 0", padding: "32px", background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "12px" }}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, marginBottom: "20px" }}>Auto-diagnostic rapide</div>
      <h3 style={{ fontSize: "20px", fontWeight: 700, color: V, margin: "0 0 20px" }}>Evaluez votre maturite digitale</h3>
      {questions.map((item, i) => (
        <div key={i} onClick={() => toggle(i)} style={{
          display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", cursor: "pointer",
          borderBottom: i < questions.length - 1 ? `1px solid ${VG(0.06)}` : "none",
        }}>
          <div style={{
            width: "22px", height: "22px", borderRadius: "4px", flexShrink: 0, marginTop: "2px",
            border: answers[i] ? `2px solid ${ACCENT2}` : `2px solid ${VG(0.2)}`,
            background: answers[i] ? `${ACCENT2}15` : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
          }}>
            {answers[i] && <span style={{ color: ACCENT2, fontSize: "14px", fontWeight: 700 }}>&#10003;</span>}
          </div>
          <span style={{ fontSize: "15px", color: answers[i] ? V3 : V2, lineHeight: 1.6, transition: "all 0.3s" }}>{item.q}</span>
        </div>
      ))}
      <button onClick={() => setShowResult(true)} style={{
        marginTop: "20px", background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)`, border: "none", color: V,
        padding: "12px 28px", fontSize: "13px", fontWeight: 700, letterSpacing: "1px",
        cursor: "pointer", fontFamily: "inherit", borderRadius: "6px", transition: "transform 0.2s",
      }}
        onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.target.style.transform = "translateY(0)"}
      >Voir mon score</button>
      {showResult && (
        <div style={{ marginTop: "20px", padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", fontWeight: 900, color: pct >= 70 ? ACCENT2 : pct >= 40 ? "#f59e0b" : "#ef4444" }}>{pct}%</div>
          <p style={{ fontSize: "14px", color: V3, marginTop: "8px", lineHeight: 1.6 }}>
            {pct >= 70 ? "Bon niveau de maturite digitale. Continuez a optimiser avec les bons outils." :
             pct >= 40 ? "Maturite moyenne. Des axes d'amelioration importants existent, notamment en e-reputation et conformite." :
             "Maturite faible. Il est urgent d'agir sur votre presence digitale et votre conformite juridique."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───── FAQ Accordion ───── */
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "Quels sont les piliers de la presence digitale d'une PME ?", a: "Les trois piliers fondamentaux sont : la visibilite en ligne (fiche Google Business, referencement local, avis clients), la reputation numerique (gestion proactive des avis, surveillance de l'image de marque) et la conformite juridique (RGPD, mentions legales, politique de confidentialite). Maitriser ces trois axes garantit une presence digitale solide et perenne." },
    { q: "Combien coute la mise en place d'une strategie digitale pour une PME ?", a: "Avec les outils SaaS actuels, une strategie digitale complete (e-reputation + conformite) demarre a partir de 100 euros par mois. C'est un investissement modeste compare au cout d'une reputation negligee (perte de clients) ou d'une non-conformite RGPD (amendes). Le retour sur investissement est generalement mesurable des le premier trimestre." },
    { q: "Faut-il etre present sur les reseaux sociaux ?", a: "Pas necessairement. Pour une TPE/PME locale, la priorite absolue est une fiche Google Business Profile bien optimisee et une gestion active des avis. Les reseaux sociaux sont un complement utile mais secondaire. Concentrez vos efforts la ou vos clients vous cherchent reellement : sur Google." },
    { q: "Comment mesurer l'efficacite de sa presence digitale ?", a: "Les indicateurs cles sont : votre note Google moyenne, le volume et la fraicheur de vos avis, votre classement dans les recherches locales, le taux de clics sur votre fiche Google, et votre niveau de conformite RGPD. Des outils comme Sentinel (e-reputation) et Vault (conformite) fournissent ces metriques en temps reel." },
    { q: "Quelle est la difference entre e-reputation et presence digitale ?", a: "L'e-reputation est une composante de la presence digitale. La presence digitale englobe tout ce qui concerne votre existence en ligne : site web, fiches d'annuaire, avis, reseaux sociaux, conformite juridique. L'e-reputation se concentre specifiquement sur la perception que les internautes ont de votre entreprise a travers les avis et les contenus en ligne." },
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
  { id: "sec-enjeux", label: "Enjeux du digital en 2026" },
  { id: "sec-piliers", label: "Les 3 piliers essentiels" },
  { id: "sec-ereputation", label: "E-reputation : le levier n°1" },
  { id: "sec-conformite", label: "Conformite juridique" },
  { id: "sec-faq", label: "FAQ" },
];

export default function BlogPerformancePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrollProgress = useScrollProgress();
  const [activeId, setActiveId] = useState("");

  useSEO(
    "Presence digitale : comment les TPE/PME peuvent se demarquer en 2026 | NERVUR",
    "Guide complet sur la presence digitale des TPE/PME : e-reputation, conformite RGPD, avis Google. Strategies concretes pour se demarquer en ligne en 2026.",
    {
      path: "/blog/presence-digitale",
      type: "article",
      keywords: "presence digitale PME, strategie digitale TPE, e-reputation entreprise, conformite RGPD PME 2026",
      author: "L'equipe NERVUR",
      publishedTime: "2026-03-15T08:00:00+01:00",
      modifiedTime: "2026-03-28T10:00:00+01:00",
    }
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Presence digitale : comment les TPE/PME peuvent se demarquer en 2026",
      description: "Guide complet sur la presence digitale des TPE/PME : e-reputation, conformite RGPD, avis Google et strategies concretes.",
      author: { "@type": "Organization", name: "NERVUR" },
      publisher: { "@type": "Organization", name: "NERVUR", url: "https://nervur.fr" },
      datePublished: "2026-03-15",
      dateModified: "2026-03-28",
      mainEntityOfPage: "https://nervur.fr/blog/presence-digitale",
      keywords: "presence digitale PME, strategie digitale TPE, e-reputation entreprise, conformite RGPD PME 2026",
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
        a.blog-link { color: ${ACCENT}; text-decoration: none; border-bottom: 1px solid rgba(139,92,246,0.3); transition: border-color 0.3s; }
        a.blog-link:hover { border-color: ${ACCENT}; }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px",
        background: "rgba(15,17,23,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <LogoNervur height={32} onClick={() => navigate("/")} />
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/")} style={{
            padding: "8px 20px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit",
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#e4e4e7",
            transition: "all 0.15s",
          }}>ACCUEIL</button>
          <button onClick={() => navigate("/contact")} style={{
            padding: "8px 20px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit",
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#e4e4e7",
            transition: "all 0.15s",
          }}>CONTACT</button>
        </div>
      </nav>

      {/* Scroll progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, width: `${scrollProgress}%`, height: "3px", background: `linear-gradient(90deg, ${ACCENT}, #c084fc)`, zIndex: 200, transition: "width 0.1s linear" }} />

      {/* Floating TOC */}
      <TableOfContents sections={TOC_SECTIONS} activeId={activeId} isMobile={isMobile} />

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: isMobile ? "100px 20px 60px" : "120px 24px 60px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", boxSizing: "border-box" }}>
        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{
          background: "none", border: "none", color: "#71717A", fontSize: "13px",
          cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px",
          marginBottom: "24px", padding: 0
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Retour
        </button>

        {/* Hero */}
        <Section>
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, border: `1px solid rgba(139,92,246,0.3)`, padding: "4px 12px", borderRadius: "2px" }}>Presence digitale</span>
            <span style={{ fontSize: "13px", color: V3, marginLeft: "16px" }}>11 min de lecture</span>
          </div>
          <h1 style={{
            fontSize: isMobile ? "28px" : "42px", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-1px",
            background: `linear-gradient(135deg, ${V}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Presence digitale : comment les TPE/PME peuvent se demarquer en 2026
          </h1>
          <P style={{ fontSize: "19px", color: V3 }}>
            En 2026, une entreprise qui n'existe pas en ligne n'existe pas tout court. Pourtant, la majorite des TPE et PME francaises sous-exploitent leur presence digitale, laissant des milliers d'euros de chiffre d'affaires sur la table. Ce guide vous montre comment construire une presence digitale solide autour de deux axes strategiques : la gestion de votre e-reputation et la conformite juridique.
          </P>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "12px", borderTop: `1px solid ${VG(0.1)}`, marginTop: "8px", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>N</div>
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
            <StatCard number="87%" label="des Francais consultent les avis avant d'acheter" color="#ef4444" />
            <StatCard number="46%" label="des recherches Google sont a intention locale" color="#f59e0b" />
            <StatCard number="3,8x" label="plus de contacts pour les fiches Google optimisees" color={ACCENT} />
          </div>
        </Section>

        {/* Section 1 */}
        <Section>
          <H2 id="sec-enjeux">Les enjeux du digital pour les TPE/PME en 2026</H2>
          <P>
            La transformation digitale des entreprises francaises s'est acceleree de maniere spectaculaire depuis 2020. Mais pour la majorite des TPE et PME, le digital se resume encore a un site vitrine vieillissant et une fiche Google Business Profile a peine remplie. Cette approche minimaliste est devenue un handicap concurrentiel majeur.
          </P>
          <P>
            Les chiffres sont sans appel : 87% des consommateurs consultent les avis en ligne avant de faire appel a une entreprise locale. 46% des recherches Google ont une intention locale. Et les entreprises qui gerent activement leur presence digitale generent en moyenne 3,8 fois plus de contacts que celles qui la negligent. Le digital n'est plus une option — c'est le premier point de contact entre votre entreprise et vos futurs clients.
          </P>
          <Blockquote color={ACCENT}>
            Votre presence digitale, c'est votre vitrine permanente. Elle travaille pour vous 24h/24, 7j/7. Mais si elle est negligee, elle travaille contre vous.
          </Blockquote>
          <P>
            En 2026, deux dimensions de la presence digitale sont devenues incontournables pour toute entreprise, quelle que soit sa taille : la gestion de l'e-reputation (avis clients, image en ligne) et la conformite juridique (RGPD, mentions legales, politique de confidentialite). Ces deux piliers conditionnent a la fois la confiance des consommateurs et la securite juridique de l'entreprise.
          </P>
          <P>
            Les entreprises qui maitrisent ces deux dimensions constatent des resultats tangibles : amelioration de la note Google, augmentation du trafic local, hausse du taux de conversion et reduction des risques juridiques. A l'inverse, celles qui les ignorent s'exposent a une erosion progressive de leur clientele et a des sanctions financieres croissantes.
          </P>
        </Section>

        {/* Section 2 */}
        <Section>
          <H2 id="sec-piliers">Les 3 piliers d'une presence digitale efficace</H2>
          <P>
            Construire une presence digitale solide ne necessite pas un budget marketing colossal ni une equipe technique dediee. Il suffit de maitriser trois piliers fondamentaux, chacun renforçant les deux autres.
          </P>
          {[
            { num: "01", title: "Visibilite locale : etre trouve par les bons clients", desc: "Votre fiche Google Business Profile est votre actif digital le plus precieux. Elle doit etre complete, a jour et enrichie regulierement : photos, horaires, description, categories, produits et services. Les entreprises avec une fiche completement remplie reçoivent 7 fois plus de clics que les fiches incompletes. Ajoutez-y des publications regulieres et des reponses systematiques aux avis pour booster votre classement local.", color: ACCENT },
            { num: "02", title: "E-reputation : transformer les avis en levier de croissance", desc: "Les avis ne sont pas une fatalite — ils sont un outil de vente. Une strategie d'e-reputation proactive comprend : la collecte systematique d'avis aupres des clients satisfaits, la reponse rapide et professionnelle a chaque avis (positif ou negatif), la surveillance multiplateforme et l'analyse des tendances. Un outil comme Sentinel automatise ces taches et transforme la gestion des avis en un avantage concurrentiel.", color: "#818CF8" },
            { num: "03", title: "Conformite juridique : proteger son entreprise et rassurer ses clients", desc: "La conformite RGPD n'est pas seulement une obligation legale — c'est un signal de confiance. Les entreprises qui affichent clairement leur conformite convertissent 12% de plus que les autres. Les fondamentaux : politique de confidentialite a jour, bandeau cookies conforme, registre des traitements, procedures de gestion des droits. Un outil comme Vault simplifie et automatise l'ensemble du processus.", color: "#06b6d4" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", margin: "24px 0", padding: "24px", background: "rgba(255,255,255,0.015)", borderRadius: "8px", border: `1px solid ${VG(0.06)}` }}>
              <div style={{ fontSize: "32px", fontWeight: 900, color: m.color, lineHeight: 1, flexShrink: 0, minWidth: "48px" }}>{m.num}</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: V, marginBottom: "8px" }}>{m.title}</div>
                <P style={{ margin: 0 }}>{m.desc}</P>
              </div>
            </div>
          ))}
        </Section>

        {/* Digital Maturity Quiz */}
        <DigitalMaturityQuiz />

        {/* Section 3 */}
        <Section>
          <H2 id="sec-ereputation">E-reputation : le levier de croissance numero un</H2>
          <P>
            Pour une TPE/PME, l'e-reputation est le facteur qui influence le plus directement le chiffre d'affaires. Les etudes montrent qu'une augmentation de 0,5 point de la note Google se traduit par une hausse de 15 a 25% du taux de conversion local. Concretement, pour un restaurant, un artisan ou un commerce de proximite, cela represente des dizaines de clients supplementaires chaque mois.
          </P>
          <P>
            La cle d'une bonne e-reputation repose sur trois actions simples mais regulieres : solliciter activement les avis de vos clients satisfaits (email, SMS, QR code), repondre a chaque avis dans un delai de 24 a 48 heures, et surveiller en permanence ce qui se dit de votre entreprise sur les differentes plateformes.
          </P>
          <BulletList items={[
            "Mettez en place un processus automatique de collecte d'avis apres chaque prestation ou vente",
            "Repondez a 100% de vos avis — les reponses aux avis positifs encouragent d'autres clients a en laisser",
            "Personnalisez chaque reponse en mentionnant le prenom du client et en referencant sa situation specifique",
            "Utilisez un outil de surveillance multiplateforme pour ne manquer aucun avis (Google, Pages Jaunes, Facebook, Trustpilot)",
            "Analysez les tendances de vos avis pour identifier les points forts et les axes d'amelioration de votre activite",
            "Signalez les faux avis a Google avec les preuves adequates — la moderation prend 1 a 3 semaines",
          ]} />
          <P>
            Un outil comme Sentinel centralise la surveillance, propose des reponses personnalisees generees par l'IA et fournit des rapports hebdomadaires sur l'evolution de votre reputation. Le gain de temps est considerable : les entreprises utilisatrices rapportent une reduction de 70% du temps consacre a la gestion des avis, tout en ameliorant leur reactivite et la qualite de leurs reponses.
          </P>
        </Section>

        {/* Section 4 */}
        <Section>
          <H2 id="sec-conformite">Conformite juridique : le filet de securite indispensable</H2>
          <P>
            La conformite RGPD est le deuxieme pilier strategique de votre presence digitale. Au-dela de l'obligation legale, elle represente un gage de serieux et de professionnalisme aux yeux de vos clients, partenaires et prospects.
          </P>
          <P>
            En 2026, les controles de la CNIL se sont intensifies aupres des petites structures. Les amendes pour non-conformite touchent desormais regulierement des entreprises de moins de 50 salaries, avec des montants allant de 5 000 a plus de 100 000 euros. Les manquements les plus frequents sont l'absence de politique de confidentialite, le defaut de registre des traitements et les bandeaux cookies non conformes.
          </P>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", margin: "28px 0" }}>
            <StatCard number="74%" label="des PME ne sont pas conformes au RGPD" color="#ef4444" />
            <StatCard number="+12%" label="de conversion avec les mentions de conformite" color={ACCENT2} />
          </div>
          <P>
            Les bonnes nouvelles : la mise en conformite d'une TPE/PME est beaucoup plus simple et rapide qu'on ne le pense. Un outil comme Vault guide les entrepreneurs pas a pas, genere automatiquement les documents necessaires (registre des traitements, politique de confidentialite, mentions legales) et assure un suivi continu de la conformite.
          </P>
          <Blockquote color="#06b6d4">
            La conformite RGPD n'est pas un cout. C'est un investissement qui protege votre entreprise et renforce la confiance de vos clients.
          </Blockquote>
        </Section>

        {/* CTA */}
        <Section>
          <div style={{ textAlign: "center", padding: isMobile ? "40px 24px" : "56px 40px", margin: "48px 0", background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(124,58,237,0.04))", borderRadius: "16px", border: "1px solid rgba(139,92,246,0.15)" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Sentinel + Vault par NERVUR</span>
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: V, margin: "16px 0 12px" }}>Maitrisez votre presence digitale</h3>
            <P style={{ maxWidth: "480px", margin: "0 auto 8px", color: V3 }}>
              Sentinel gere votre e-reputation (avis, surveillance, reponses IA). Vault assure votre conformite RGPD (registre, documents, suivi). Deux outils complementaires pour une presence digitale complete.
            </P>
            <P style={{ maxWidth: "480px", margin: "0 auto 28px", color: V3, fontSize: "15px" }}>
              A partir de <span style={{ color: ACCENT, fontWeight: 700 }}>39&#8364;/mois</span> &middot; Sans engagement
            </P>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/contact")} style={{
                background: `linear-gradient(135deg, #818CF8, #6366f1)`, border: "none", color: V,
                padding: "14px 32px", fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "6px",
                boxShadow: "0 4px 24px rgba(129,140,248,0.3)", transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.target.style.transform = "translateY(0)"; }}
              >Contactez-nous</button>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section>
          <H2 id="sec-faq">Questions frequentes sur la presence digitale</H2>
          <FAQSection />
        </Section>

        {/* Related articles */}
        <Section>
          <div style={{ margin: "48px 0 40px", padding: "32px 0", borderTop: `1px solid ${VG(0.08)}` }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: V3, display: "block", marginBottom: "20px" }}>Articles connexes</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { title: "E-reputation : pourquoi 90% des PME perdent des clients sans le savoir", path: "/blog/e-reputation", color: "#818CF8" },
                { title: "Conformite RGPD : guide complet pour les TPE/PME en 2026", path: "/blog/conformite-juridique", color: "#06b6d4" },
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
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, flexShrink: 0 }}>N</div>
            <div>
              <div style={{ fontSize: "16px", color: V, fontWeight: 700 }}>L'equipe NERVUR</div>
              <p style={{ fontSize: "14px", color: V3, lineHeight: 1.6, margin: "4px 0 0" }}>
                NERVUR conçoit des outils SaaS pour aider les PME francaises a maitriser leur presence digitale : e-reputation avec Sentinel et conformite juridique avec Vault.
              </p>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${VG(0.08)}`, padding: "24px 0", marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ fontSize: "13px", color: V3 }}>
            <span style={{ fontWeight: 600, color: V2 }}>L'equipe NERVUR</span> &middot; 15 mars 2026 &middot; 11 min de lecture
          </div>
          <LogoNervur height={22} onClick={() => navigate("/")} />
        </div>
      </div>
    </div>
  );
}
