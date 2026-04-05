import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

const BG = "#FFFFFF";
const V = "#FFFFFF";
const V2 = "#425466";
const V3 = "#6B7C93";
const ACCENT = "#10b981";
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

const Blockquote = ({ children, color }) => (
  <blockquote style={{ borderLeft: `3px solid ${color || ACCENT}`, margin: "28px 0", padding: "16px 24px", background: `${color || ACCENT}08`, borderRadius: "0 8px 8px 0" }}>
    <p style={{ fontSize: "17px", color: V2, lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>{children}</p>
  </blockquote>
);

/* ───── RGPD Compliance Progress Tracker ───── */
function ComplianceTracker() {
  const [checked, setChecked] = useState({});
  const obligations = [
    { title: "Registre des traitements", desc: "Documentez chaque traitement de donnees : finalite, categories, duree de conservation" },
    { title: "Politique de confidentialite", desc: "Redigez et affichez une politique claire sur votre site et dans vos locaux" },
    { title: "Bandeau cookies conforme", desc: "Recueillez le consentement avant de deposer des cookies non essentiels" },
    { title: "Consentement explicite", desc: "Obtenez un consentement libre, eclaire et specifique pour chaque traitement" },
    { title: "Procedure droits des personnes", desc: "Permettez l'exercice des droits d'acces, rectification, effacement, portabilite" },
    { title: "Securisation des donnees", desc: "Chiffrement, controle d'acces, sauvegardes et mesures techniques adequates" },
    { title: "Contrats sous-traitants", desc: "Formalisez les clauses RGPD avec vos prestataires et fournisseurs" },
    { title: "Notification violations", desc: "Preparez une procedure de notification a la CNIL sous 72h en cas de fuite" },
    { title: "Formation des equipes", desc: "Sensibilisez vos collaborateurs aux bonnes pratiques de protection des donnees" },
    { title: "Audit regulier", desc: "Revoyez votre conformite au moins une fois par an et apres chaque changement majeur" },
  ];
  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));
  const count = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((count / obligations.length) * 100);

  return (
    <div style={{ margin: "40px 0", padding: "32px", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, fontWeight: 700 }}>Votre score de conformite</span>
        <span style={{ fontSize: "24px", fontWeight: 900, color: pct >= 80 ? ACCENT2 : pct >= 50 ? "#f59e0b" : "#ef4444" }}>{pct}%</span>
      </div>
      <div style={{ height: "6px", background: "rgba(16,185,129,0.1)", borderRadius: "3px", marginBottom: "24px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? ACCENT2 : pct >= 50 ? "#f59e0b" : "#ef4444", borderRadius: "3px", transition: "width 0.4s ease" }} />
      </div>
      {obligations.map((item, i) => (
        <div key={i} onClick={() => toggle(i)} style={{
          display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 0", cursor: "pointer",
          borderBottom: i < obligations.length - 1 ? `1px solid ${VG(0.06)}` : "none",
        }}>
          <div style={{
            width: "22px", height: "22px", borderRadius: "4px", flexShrink: 0, marginTop: "2px",
            border: checked[i] ? `2px solid ${ACCENT2}` : `2px solid ${VG(0.2)}`,
            background: checked[i] ? `${ACCENT2}15` : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
          }}>
            {checked[i] && <span style={{ color: ACCENT2, fontSize: "14px", fontWeight: 700 }}>&#10003;</span>}
          </div>
          <div>
            <div style={{ fontSize: "15px", color: checked[i] ? V3 : V, fontWeight: 600, textDecoration: checked[i] ? "line-through" : "none", transition: "all 0.3s" }}>{item.title}</div>
            <div style={{ fontSize: "13px", color: V3, lineHeight: 1.5, marginTop: "2px" }}>{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───── FAQ Accordion ───── */
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "Le RGPD concerne-t-il les auto-entrepreneurs ?", a: "Oui, sans exception. Tout professionnel qui traite des donnees personnelles de residents europeens est soumis au RGPD, y compris les auto-entrepreneurs, les professions liberales et les associations. Les obligations sont les memes, meme si leur mise en oeuvre peut etre simplifiee pour les petites structures." },
    { q: "Quelles sont les donnees personnelles au sens du RGPD ?", a: "Toute information permettant d'identifier directement ou indirectement une personne physique : nom, prenom, adresse email, telephone, adresse postale, numero de client, adresse IP, photo, donnees de geolocalisation, identifiant en ligne. Les donnees sensibles (sante, religion, opinions politiques, donnees biometriques) beneficient d'une protection renforcee." },
    { q: "Combien coute la mise en conformite RGPD pour une TPE ?", a: "Avec un outil specialise comme Vault, le cout demarre a partir de 69 euros par mois. Sans outil, comptez entre 2 000 et 10 000 euros pour un accompagnement par un consultant ou un avocat specialise. L'investissement est nettement inferieur aux sanctions potentielles (jusqu'a 4% du CA) et se rentabilise par la confiance accrue des clients." },
    { q: "Peut-on utiliser Google Analytics et rester conforme au RGPD ?", a: "Depuis les decisions de la CNIL de 2022, l'utilisation de Google Analytics pose des problemes de transfert de donnees vers les Etats-Unis. Google Analytics 4 avec les parametres de confidentialite adequats et un bandeau cookies conforme peut etre utilise, mais de nombreuses entreprises migrent vers des alternatives europeennes comme Matomo ou Plausible." },
    { q: "Que se passe-t-il en cas de controle CNIL ?", a: "La CNIL peut effectuer un controle sur place, en ligne ou sur pieces. Les agents verifient votre registre des traitements, votre politique de confidentialite, vos bandeaux cookies, vos contrats sous-traitants et vos procedures internes. En cas de manquement, ils peuvent prononcer une mise en demeure (avec delai pour se conformer) ou une sanction immediate pour les cas graves." },
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
            fontSize: "12px", color: activeId === s.id ? ACCENT : "#6B7C93", cursor: "pointer",
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
  { id: "sec-intro", label: "Qu'est-ce que le RGPD" },
  { id: "sec-obligations", label: "Les 10 obligations" },
  { id: "sec-sanctions", label: "Sanctions encourues" },
  { id: "sec-outils", label: "Outils pour se conformer" },
  { id: "sec-faq", label: "FAQ" },
];

export default function BlogRgpdPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrollProgress = useScrollProgress();
  const [activeId, setActiveId] = useState("");

  useSEO(
    "RGPD pour les TPE/PME : les 10 obligations que vous devez respecter en 2026 | NERVUR",
    "Guide pratique RGPD : les 10 obligations essentielles pour les TPE et PME en 2026. Registre des traitements, consentement, droits des personnes, sanctions CNIL.",
    {
      path: "/blog/rgpd-guide",
      type: "article",
      keywords: "RGPD obligations TPE PME, registre traitements RGPD, conformite RGPD 2026, sanctions CNIL PME",
      author: "L'equipe NERVUR",
      publishedTime: "2026-03-26T08:00:00+01:00",
      modifiedTime: "2026-03-28T10:00:00+01:00",
    }
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "RGPD pour les TPE/PME : les 10 obligations que vous devez respecter en 2026",
      description: "Guide pratique des 10 obligations RGPD essentielles pour les TPE et PME francaises. Sanctions, checklist et outils pour se conformer rapidement.",
      author: { "@type": "Organization", name: "NERVUR" },
      publisher: { "@type": "Organization", name: "NERVUR", url: "https://nervur.fr" },
      datePublished: "2026-03-26",
      dateModified: "2026-03-28",
      mainEntityOfPage: "https://nervur.fr/blog/rgpd-guide",
      keywords: "RGPD obligations TPE PME, registre traitements RGPD, conformite RGPD 2026, sanctions CNIL PME",
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
        a.blog-link { color: ${ACCENT}; text-decoration: none; border-bottom: 1px solid rgba(16,185,129,0.3); transition: border-color 0.3s; }
        a.blog-link:hover { border-color: ${ACCENT}; }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <LogoNervur height={28} onClick={() => navigate("/")} />
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/")} style={{
            padding: "8px 20px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit",
            background: "transparent", border: "1px solid rgba(0,0,0,0.08)", color: "#425466",
            transition: "all 0.15s",
          }}>ACCUEIL</button>
          <button onClick={() => navigate("/contact")} style={{
            padding: "8px 20px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit",
            background: "transparent", border: "1px solid rgba(0,0,0,0.08)", color: "#425466",
            transition: "all 0.15s",
          }}>CONTACT</button>
        </div>
      </nav>

      {/* Scroll progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, width: `${scrollProgress}%`, height: "3px", background: `linear-gradient(90deg, ${ACCENT}, #34d399)`, zIndex: 200, transition: "width 0.1s linear" }} />

      {/* Floating TOC */}
      <TableOfContents sections={TOC_SECTIONS} activeId={activeId} isMobile={isMobile} />

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: isMobile ? "100px 20px 60px" : "120px 24px 60px", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", boxSizing: "border-box" }}>
        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{
          background: "none", border: "none", color: "#6B7C93", fontSize: "13px",
          cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px",
          marginBottom: "24px", padding: 0
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Retour
        </button>

        {/* Hero */}
        <Section>
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, border: `1px solid rgba(16,185,129,0.3)`, padding: "4px 12px", borderRadius: "2px" }}>RGPD</span>
            <span style={{ fontSize: "13px", color: V3, marginLeft: "16px" }}>13 min de lecture</span>
          </div>
          <h1 style={{
            fontSize: isMobile ? "28px" : "42px", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-1px",
            background: `linear-gradient(135deg, ${V}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            RGPD pour les TPE/PME : les 10 obligations que vous devez respecter en 2026
          </h1>
          <P style={{ fontSize: "19px", color: V3 }}>
            Huit ans apres son entree en vigueur, le RGPD reste un casse-tete pour la majorite des TPE et PME francaises. Registre des traitements, consentement, droits des personnes, notification de violations... Les obligations sont nombreuses et les sanctions de plus en plus frequentes. Ce guide detaille les 10 obligations concretes que votre entreprise doit respecter en 2026, avec des conseils pratiques pour chacune.
          </P>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "12px", borderTop: `1px solid ${VG(0.1)}`, marginTop: "8px", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #059669)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>N</div>
            <div>
              <div style={{ fontSize: "14px", color: V, fontWeight: 600 }}>L'equipe NERVUR</div>
              <div style={{ fontSize: "12px", color: V3 }}>26 mars 2026</div>
            </div>
            <div style={{ marginLeft: "auto" }}><CopyLinkButton /></div>
          </div>
        </Section>

        {/* Stats */}
        <Section>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px", margin: "40px 0" }}>
            <StatCard number="74%" label="des PME ne sont pas conformes au RGPD en 2026" color="#ef4444" />
            <StatCard number="16K" label="plaintes reçues par la CNIL en 2025" color="#f59e0b" />
            <StatCard number="4%" label="du CA annuel : amende maximale encourue" color={ACCENT} />
          </div>
        </Section>

        {/* Section 1 */}
        <Section>
          <H2 id="sec-intro">Le RGPD en 2026 : ce que chaque dirigeant doit savoir</H2>
          <P>
            Le Reglement General sur la Protection des Donnees (RGPD) est le cadre juridique europeen qui regit la collecte, le stockage et l'utilisation des donnees personnelles. Entre en vigueur le 25 mai 2018, il s'applique a toute organisation — entreprise, association, auto-entrepreneur — qui traite des donnees de residents europeens, independamment de sa taille ou de son secteur d'activite.
          </P>
          <P>
            En 2026, le contexte a considerablement evolue. La CNIL a intensifie ses actions de controle aupres des petites structures, avec une augmentation de 180% des controles cibles sur les TPE/PME entre 2023 et 2025. Les amendes ne sont plus reservees aux geants du numerique : des boulangeries, des cabinets medicaux et des artisans ont ete sanctionnes ces deux dernieres annees.
          </P>
          <Blockquote color={ACCENT}>
            Le RGPD n'est pas qu'une contrainte legale. C'est un cadre de confiance qui, bien applique, renforce votre relation client et vous differencie de la concurrence.
          </Blockquote>
          <P>
            Les raisons de se conformer depassent largement la peur des sanctions. Une etude IFOP de 2025 revele que 68% des consommateurs francais font davantage confiance aux entreprises qui affichent leur conformite RGPD. Les mentions de protection des donnees sur un site web augmentent le taux de conversion de 12%. La conformite est devenue un argument commercial a part entiere.
          </P>
        </Section>

        {/* Section 2 — The 10 obligations */}
        <Section>
          <H2 id="sec-obligations">Les 10 obligations RGPD que vous devez respecter</H2>
          <P>
            Voici les dix obligations concretes que chaque TPE/PME doit mettre en oeuvre. Pour chacune, nous detaillons ce qui est attendu et comment y repondre de maniere pragmatique.
          </P>
          {[
            { num: "01", title: "Tenir un registre des traitements", desc: "C'est la pierre angulaire de la conformite. Documentez chaque traitement de donnees personnelles : quelles donnees, pourquoi, combien de temps, qui y accede. Les entreprises de moins de 250 salaries beneficient d'une version allégée, mais le registre reste obligatoire pour les traitements reguliers (fichier clients, paie, newsletters).", color: ACCENT },
            { num: "02", title: "Informer clairement les personnes", desc: "Chaque personne dont vous collectez des donnees doit etre informee : politique de confidentialite sur le site web, mentions dans les formulaires, information des salaries. L'information doit etre concise, transparente, comprehensible et facilement accessible. Les formulations juridiques incomprehensibles ne suffisent plus.", color: "#06b6d4" },
            { num: "03", title: "Recueillir un consentement valide", desc: "Le consentement doit etre libre, specifique, eclaire et univoque. Concretement : pas de cases pre-cochees, pas de consentement global pour plusieurs finalites, possibilite de retrait a tout moment. Conservez la preuve du consentement (date, contenu, moyen de collecte) pour pouvoir la produire en cas de controle.", color: ACCENT2 },
            { num: "04", title: "Respecter les droits des personnes", desc: "Vos clients, prospects et employes disposent de droits fondamentaux : acces a leurs donnees, rectification, effacement (droit a l'oubli), portabilite, opposition et limitation du traitement. Vous devez pouvoir repondre a toute demande dans un delai d'un mois. Designez un responsable interne et definissez une procedure claire.", color: "#f59e0b" },
            { num: "05", title: "Securiser les donnees personnelles", desc: "Le RGPD impose des mesures de securite proportionnees aux risques : chiffrement des donnees sensibles, mots de passe robustes, controle d'acces, sauvegardes regulieres, mise a jour des logiciels. Documentez ces mesures — la CNIL verifie non seulement leur existence mais aussi leur adequation au niveau de risque.", color: "#ef4444" },
            { num: "06", title: "Minimiser la collecte de donnees", desc: "Ne collectez que les donnees strictement necessaires a la finalite declaree. Un formulaire de contact n'a pas besoin de la date de naissance. Une newsletter ne necessite qu'une adresse email. Moins vous stockez de donnees, moins vous avez de risques en cas de fuite et plus votre conformite est simple a maintenir.", color: ACCENT },
            { num: "07", title: "Limiter la duree de conservation", desc: "Definissez pour chaque type de donnee une duree de conservation proportionnee. Les donnees d'un prospect inactif depuis 3 ans doivent etre supprimees ou anonymisees. Les donnees comptables doivent etre conservees 10 ans. Les donnees de candidature non retenue, 2 ans maximum. Mettez en place une purge automatique.", color: "#06b6d4" },
            { num: "08", title: "Encadrer les sous-traitants", desc: "Si vous utilisez des outils SaaS, un hebergeur, un comptable en ligne ou un prestataire marketing, vous partagez des donnees personnelles avec des sous-traitants. Chaque relation doit etre formalisee par un contrat ou des CGU incluant des clauses RGPD specifiques. Verifiez que vos sous-traitants sont eux-memes conformes.", color: "#f59e0b" },
            { num: "09", title: "Notifier les violations de donnees", desc: "En cas de violation (fuite, piratage, perte de donnees), vous devez notifier la CNIL sous 72 heures. Si le risque pour les personnes est eleve, vous devez egalement les informer individuellement. Preparez un plan de notification a l'avance : qui contacter, quel formulaire remplir, comment communiquer.", color: "#ef4444" },
            { num: "10", title: "Gerer les cookies et traceurs", desc: "Votre site web doit afficher un bandeau cookies conforme : information claire, refus aussi simple que l'acceptation, pas de depot de cookies avant le consentement (sauf cookies strictement necessaires). Les boutons Tout accepter et Tout refuser doivent etre visuellement equivalents. La CNIL controle activement ce point.", color: ACCENT },
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

        {/* Interactive Compliance Tracker */}
        <ComplianceTracker />

        {/* Section 3 */}
        <Section>
          <H2 id="sec-sanctions">Ce que vous risquez en cas de non-conformite</H2>
          <P>
            Les sanctions CNIL contre les TPE/PME se sont multipliees depuis 2024. Les montants varient considerablement selon la gravite des manquements, le nombre de personnes affectees et la cooperation de l'entreprise lors du controle.
          </P>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", margin: "28px 0" }}>
            <StatCard number="20M&#8364;" label="amende maximale prevue par le RGPD" color="#ef4444" />
            <StatCard number="150K&#8364;" label="amende record pour une PME francaise en 2025" color="#f59e0b" />
          </div>
          <P>
            Au-dela des amendes financieres, la CNIL dispose d'un arsenal de mesures : mise en demeure publique (consultable sur le site de la CNIL, avec un impact reputationnel considerable), injonction de cesser un traitement (pouvant bloquer une partie de votre activite), astreintes journalieres et limitation temporaire des traitements.
          </P>
          <P>
            Les controles peuvent etre declenches par une plainte (client, employe, concurrent), par un signalement de violation de donnees, par une campagne sectorielle de la CNIL ou par un simple controle en ligne de votre site web. La CNIL dispose d'outils automatises pour scanner les sites web et detecter les bandeaux cookies non conformes, les politiques de confidentialite manquantes et les formulaires sans mention d'information.
          </P>
          <Blockquote color="#ef4444">
            En 2025, 40% des plaintes CNIL concernaient des TPE/PME. Le risque est reel et la tendance est a l'acceleration des controles sur les petites structures.
          </Blockquote>
        </Section>

        {/* Section 4 */}
        <Section>
          <H2 id="sec-outils">Comment Vault simplifie votre conformite RGPD</H2>
          <P>
            La mise en conformite RGPD peut sembler complexe quand on la decouvre, mais les outils specialises ont considerablement simplifie le processus. Vault, developpe par NERVUR, est conçu specifiquement pour les TPE/PME qui veulent se conformer rapidement et efficacement, sans expertise juridique prealable.
          </P>
          <P>
            Vault automatise les taches les plus chronophages : generation du registre des traitements a partir d'un questionnaire guide, creation de la politique de confidentialite et des mentions legales adaptees a votre activite, mise en place du bandeau cookies conforme, suivi des demandes d'exercice de droits avec alertes de delai, et tableau de bord de conformite avec score en temps reel.
          </P>
          <P>
            Le gain de temps est considerable. Ce qui prend generalement 3 a 6 semaines avec un consultant specialise peut etre realise en quelques jours avec Vault. L'outil assure ensuite un suivi continu : alertes en cas d'evolution reglementaire, rappels de mise a jour du registre, surveillance de la conformite de votre site web et notifications proactives.
          </P>
          <P>
            Pour les entreprises qui souhaitent aller plus loin, Vault s'integre avec Sentinel pour offrir une vue complete de votre presence digitale : e-reputation et avis clients d'un cote, conformite juridique de l'autre. Les deux outils se completent pour construire une base solide de confiance numerique.
          </P>
        </Section>

        {/* CTA */}
        <Section>
          <div style={{ textAlign: "center", padding: isMobile ? "40px 24px" : "56px 40px", margin: "48px 0", background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.04))", borderRadius: "16px", border: "1px solid rgba(16,185,129,0.15)" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Vault par NERVUR</span>
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: V, margin: "16px 0 12px" }}>Conformez-vous au RGPD en quelques jours</h3>
            <P style={{ maxWidth: "480px", margin: "0 auto 8px", color: V3 }}>
              Vault genere votre registre, vos documents de conformite et surveille vos obligations en continu. Conçu pour les TPE/PME, sans jargon juridique.
            </P>
            <P style={{ maxWidth: "480px", margin: "0 auto 28px", color: V3, fontSize: "15px" }}>
              A partir de <span style={{ color: ACCENT, fontWeight: 700 }}>79&#8364;/mois</span> &middot; Sans engagement
            </P>
            <button onClick={() => navigate("/contact")} style={{
              background: `linear-gradient(135deg, ${ACCENT}, #059669)`, border: "none", color: V,
              padding: "14px 40px", fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "6px",
              boxShadow: "0 4px 24px rgba(16,185,129,0.3)", transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(16,185,129,0.4)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(16,185,129,0.3)"; }}
            >Contactez-nous</button>
          </div>
        </Section>

        {/* FAQ */}
        <Section>
          <H2 id="sec-faq">Questions frequentes sur le RGPD</H2>
          <FAQSection />
        </Section>

        {/* Related articles */}
        <Section>
          <div style={{ margin: "48px 0 40px", padding: "32px 0", borderTop: `1px solid ${VG(0.08)}` }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: V3, display: "block", marginBottom: "20px" }}>Articles connexes</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { title: "Conformite RGPD : guide complet pour les TPE/PME en 2026", path: "/blog/conformite-juridique", color: "#06b6d4" },
                { title: "Presence digitale : comment les TPE/PME peuvent se demarquer en 2026", path: "/blog/presence-digitale", color: "#8b5cf6" },
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
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #059669)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, flexShrink: 0 }}>N</div>
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
            <span style={{ fontWeight: 600, color: V2 }}>L'equipe NERVUR</span> &middot; 26 mars 2026 &middot; 13 min de lecture
          </div>
          <LogoNervur height={28} onClick={() => navigate("/")} />
        </div>
      </div>
    </div>
  );
}
