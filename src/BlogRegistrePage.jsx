import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

const BG = "#FFFFFF";
const V = "#0F172A";
const V2 = "#334155";
const V3 = "#64748B";
const ACCENT = "#06b6d4";
const ACCENT2 = "#22d3ee";
const VG = (a) => `rgba(100,116,139,${a})`;

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

/* ───── Registre Simulator ───── */
function RegistreSimulator() {
  const [expanded, setExpanded] = useState({});
  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  const fields = [
    {
      label: "Responsable du traitement",
      value: "SAS MonEntreprise — 12 rue des Lilas, 75011 Paris — contact@monentreprise.fr — DPO : Marie Dupont",
      icon: "\u{1F464}",
    },
    {
      label: "Finalite du traitement",
      value: "Gestion de la paie des salaries : calcul des remunerations, etablissement des bulletins de paie, declarations sociales obligatoires (URSSAF, caisses de retraite, prevoyance)",
      icon: "\u{1F3AF}",
    },
    {
      label: "Base legale",
      value: "Obligation legale (Code du travail, art. L3243-1 et suivants) et execution du contrat de travail",
      icon: "\u2696\uFE0F",
    },
    {
      label: "Categories de personnes concernees",
      value: "Salaries en CDI et CDD, stagiaires, alternants, anciens salaries (conservation limitee)",
      icon: "\u{1F465}",
    },
    {
      label: "Categories de donnees",
      value: "Identite (nom, prenom, date de naissance, numero de securite sociale), coordonnees bancaires (RIB), donnees contractuelles (poste, salaire, anciennete), absences et conges, donnees fiscales",
      icon: "\u{1F4CB}",
    },
    {
      label: "Destinataires des donnees",
      value: "Service RH interne, prestataire de paie (Sage Paie — contrat sous-traitance signe), URSSAF, caisses de retraite, administration fiscale",
      icon: "\u{1F4E8}",
    },
    {
      label: "Duree de conservation",
      value: "Bulletins de paie : 5 ans (obligation employeur). Donnees comptables associees : 10 ans. Registre du personnel : 5 ans apres le depart du salarie",
      icon: "\u23F0",
    },
    {
      label: "Mesures de securite",
      value: "Acces restreint au service RH (authentification forte), chiffrement des fichiers de paie, sauvegarde quotidienne chiffree, hebergement en France (OVH), journalisation des acces",
      icon: "\u{1F512}",
    },
  ];

  return (
    <div style={{ margin: "40px 0", padding: "32px", background: `rgba(6,182,212,0.04)`, border: `1px solid rgba(6,182,212,0.12)`, borderRadius: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, fontWeight: 700 }}>Exemple de fiche de traitement</span>
      </div>
      <div style={{ fontSize: "20px", fontWeight: 700, color: V, marginBottom: "4px" }}>Gestion de la paie</div>
      <div style={{ fontSize: "13px", color: V3, marginBottom: "24px" }}>Traitement n&#176;001 — Derniere mise a jour : 31 mars 2026</div>

      {fields.map((field, i) => (
        <div key={i} style={{ borderBottom: i < fields.length - 1 ? `1px solid ${VG(0.06)}` : "none" }}>
          <button onClick={() => toggle(i)} style={{
            width: "100%", textAlign: "left", background: "none", border: "none", padding: "16px 0", cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", fontFamily: "inherit",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px" }}>{field.icon}</span>
              <span style={{ fontSize: "15px", fontWeight: 600, color: expanded[i] ? V : V2, transition: "color 0.3s" }}>{field.label}</span>
            </div>
            <span style={{ fontSize: "18px", color: ACCENT, flexShrink: 0, transition: "transform 0.3s", transform: expanded[i] ? "rotate(45deg)" : "rotate(0)" }}>+</span>
          </button>
          <div style={{
            overflow: "hidden", maxHeight: expanded[i] ? "300px" : "0", opacity: expanded[i] ? 1 : 0,
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", paddingBottom: expanded[i] ? "16px" : "0",
          }}>
            <p style={{ fontSize: "14px", color: V3, lineHeight: 1.7, margin: "0 0 0 26px", padding: "8px 16px", background: `rgba(6,182,212,0.06)`, borderRadius: "6px", borderLeft: `2px solid ${ACCENT}` }}>{field.value}</p>
          </div>
        </div>
      ))}

      <div style={{ marginTop: "20px", padding: "12px 16px", background: `rgba(6,182,212,0.08)`, borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "14px" }}>&#x1F4A1;</span>
        <span style={{ fontSize: "13px", color: V2, lineHeight: 1.5 }}>Vault genere automatiquement cette fiche a partir d'un questionnaire guide — chaque champ est pre-rempli selon votre activite.</span>
      </div>
    </div>
  );
}

/* ───── FAQ Accordion ───── */
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    {
      q: "Le registre est-il obligatoire pour les TPE de moins de 10 salaries ?",
      a: "Oui, dans la grande majorite des cas. L'exemption de l'article 30 alinea 5 ne s'applique qu'aux entreprises de moins de 250 salaries qui ne font aucun traitement regulier. Or, des que vous avez un fichier clients, une newsletter, un logiciel de paie ou des cameras de surveillance, vos traitements sont consideres comme reguliers. En pratique, la CNIL considere que quasiment toutes les entreprises doivent tenir un registre, meme les auto-entrepreneurs.",
    },
    {
      q: "Quelle est la difference entre le registre du responsable et du sous-traitant ?",
      a: "Le registre du responsable de traitement (article 30-1) documente les traitements que vous realisez pour votre propre compte : fichier clients, paie, CRM, etc. Le registre du sous-traitant (article 30-2) documente les traitements que vous effectuez pour le compte d'autres entreprises. Un expert-comptable, par exemple, doit tenir les deux registres : un pour ses propres traitements internes, et un pour les traitements de paie qu'il realise pour ses clients.",
    },
    {
      q: "A quelle frequence mettre a jour le registre ?",
      a: "Le registre doit etre un document vivant, mis a jour des qu'un nouveau traitement est cree, qu'un traitement existant est modifie ou qu'un traitement est supprime. En pratique, prevoyez une revue complete au moins une fois par an, et une mise a jour immediate lors de tout changement significatif : nouveau logiciel, nouveau prestataire, nouvelle finalite de traitement, changement de duree de conservation.",
    },
    {
      q: "Que risque-t-on sans registre lors d'un controle CNIL ?",
      a: "L'absence de registre est l'un des premiers manquements constates et sanctionnes par la CNIL. Les consequences varient selon la taille de l'entreprise et la gravite du contexte. Pour une PME, les amendes se situent generalement entre 5 000 et 75 000 euros, accompagnees d'une mise en demeure avec un delai pour se conformer. Dans les cas les plus graves (donnees sensibles, grand nombre de personnes concernees), l'amende peut atteindre 10 millions d'euros ou 2% du chiffre d'affaires mondial.",
    },
    {
      q: "Peut-on tenir le registre sur Excel ?",
      a: "Oui, techniquement c'est possible et la CNIL fournit meme un modele Excel. Cependant, cette approche presente des limites importantes : pas de suivi des modifications, pas d'alertes de mise a jour, pas de generation automatique des fiches, risque d'erreurs et d'oublis, difficulte de partage et de collaboration. Un outil specialise comme Vault automatise la creation et la mise a jour du registre, garantit la completude des informations et vous alerte quand une revision est necessaire.",
    },
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
            fontSize: "12px", color: activeId === s.id ? ACCENT : "#64748B", cursor: "pointer",
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
  { id: "sec-registre", label: "Qu'est-ce que le registre" },
  { id: "sec-concerne", label: "Qui est concerne" },
  { id: "sec-contenu", label: "Contenu obligatoire" },
  { id: "sec-creer", label: "Comment le creer" },
  { id: "sec-outils", label: "Outils et solutions" },
  { id: "sec-faq", label: "FAQ" },
];

export default function BlogRegistrePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrollProgress = useScrollProgress();
  const [activeId, setActiveId] = useState("");

  useSEO(
    "Registre des traitements RGPD : modele et guide complet pour TPE/PME 2026 | NERVUR",
    "Comment creer et maintenir votre registre des traitements RGPD. Modele gratuit, obligations legales, exemples concrets pour TPE et PME. Guide pas a pas.",
    {
      path: "/blog/registre-traitements",
      type: "article",
      keywords: "registre des traitements RGPD, modele registre RGPD, registre RGPD obligatoire, registre traitements PME, CNIL registre",
      author: "L'equipe NERVUR",
      publishedTime: "2026-03-31T08:00:00+01:00",
      modifiedTime: "2026-03-31T10:00:00+01:00",
    }
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Registre des traitements RGPD : modele et guide complet pour TPE/PME 2026",
      description: "Comment creer et maintenir votre registre des traitements RGPD. Modele gratuit, obligations legales, exemples concrets pour TPE et PME.",
      author: { "@type": "Organization", name: "NERVUR" },
      publisher: { "@type": "Organization", name: "NERVUR", url: "https://nervur.fr" },
      datePublished: "2026-03-31",
      dateModified: "2026-03-31",
      mainEntityOfPage: "https://nervur.fr/blog/registre-traitements",
      keywords: "registre des traitements RGPD, modele registre RGPD, registre RGPD obligatoire, registre traitements PME, CNIL registre",
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
        a.blog-link { color: ${ACCENT}; text-decoration: none; border-bottom: 1px solid rgba(6,182,212,0.3); transition: border-color 0.3s; }
        a.blog-link:hover { border-color: ${ACCENT}; }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E2E8F0",
      }}>
        <LogoNervur height={32} onClick={() => navigate("/")} />
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/")} style={{
            padding: "8px 20px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit",
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#334155",
            transition: "all 0.15s",
          }}>ACCUEIL</button>
          <button onClick={() => navigate("/contact")} style={{
            padding: "8px 20px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit",
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#334155",
            transition: "all 0.15s",
          }}>CONTACT</button>
        </div>
      </nav>

      {/* Scroll progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, width: `${scrollProgress}%`, height: "3px", background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, zIndex: 200, transition: "width 0.1s linear" }} />

      {/* Floating TOC */}
      <TableOfContents sections={TOC_SECTIONS} activeId={activeId} isMobile={isMobile} />

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: isMobile ? "100px 20px 60px" : "120px 24px 60px", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", boxSizing: "border-box" }}>
        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{
          background: "none", border: "none", color: "#64748B", fontSize: "13px",
          cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px",
          marginBottom: "24px", padding: 0
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Retour
        </button>

        {/* Hero */}
        <Section>
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, border: `1px solid rgba(6,182,212,0.3)`, padding: "4px 12px", borderRadius: "2px" }}>RGPD &middot; Registre</span>
            <span style={{ fontSize: "13px", color: V3, marginLeft: "16px" }}>31 mars 2026</span>
            <span style={{ fontSize: "13px", color: V3, marginLeft: "16px" }}>14 min de lecture</span>
          </div>
          <h1 style={{
            fontSize: isMobile ? "28px" : "42px", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-1px",
            background: `linear-gradient(135deg, ${V}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Registre des traitements RGPD : modele et guide complet pour TPE/PME en 2026
          </h1>
          <P style={{ fontSize: "19px", color: V3 }}>
            Le registre des traitements est la pierre angulaire de la conformite RGPD. Prevu par l'article 30 du reglement europeen, il constitue le tout premier document demande par la CNIL lors d'un controle. Obligatoire pour les entreprises de plus de 250 salaries, il l'est aussi en pratique pour toutes les TPE et PME qui traitent des donnees personnelles de maniere reguliere — c'est-a-dire la quasi-totalite d'entre elles. Ce guide complet vous explique comment creer, remplir et maintenir votre registre pas a pas.
          </P>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "12px", borderTop: `1px solid ${VG(0.1)}`, marginTop: "8px", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>N</div>
            <div>
              <div style={{ fontSize: "14px", color: V, fontWeight: 600 }}>L'equipe NERVUR</div>
              <div style={{ fontSize: "12px", color: V3 }}>31 mars 2026</div>
            </div>
            <div style={{ marginLeft: "auto" }}><CopyLinkButton /></div>
          </div>
        </Section>

        {/* Stats */}
        <Section>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: "12px", margin: "40px 0" }}>
            <StatCard number="87%" label="des PME n'ont pas de registre conforme" color="#ef4444" />
            <StatCard number="Art. 30" label="du RGPD — obligation legale" color={ACCENT} />
            <StatCard number="75 000&#8364;" label="amende moyenne CNIL en 2025" color="#f59e0b" />
            <StatCard number="30 min" label="pour creer votre registre avec Vault" color={ACCENT2} />
          </div>
        </Section>

        {/* Section 1 — Qu'est-ce que le registre */}
        <Section>
          <H2 id="sec-registre">Qu'est-ce que le registre des traitements RGPD ?</H2>
          <P>
            Le registre des traitements est un document obligatoire qui recense l'ensemble des traitements de donnees personnelles realises par une organisation. Il constitue la cartographie complete de vos flux de donnees : quelles donnees vous collectez, pourquoi, aupres de qui, pendant combien de temps, et comment vous les protegez.
          </P>
          <P>
            Concretement, chaque fois que votre entreprise manipule des donnees permettant d'identifier une personne — que ce soit un fichier clients, une base de prospects, un logiciel de paie, un formulaire de contact sur votre site web ou meme des cameras de videosurveillance — cela constitue un traitement qui doit figurer dans votre registre.
          </P>
          <Blockquote color={ACCENT}>
            Le registre des traitements est le document numero un demande par la CNIL lors d'un controle. Son absence constitue a elle seule un manquement sanctionnable.
          </Blockquote>
          <P>
            L'article 30 du RGPD definit precisement le contenu de ce registre. Il ne s'agit pas d'un simple inventaire : chaque traitement doit etre documente avec des informations precises sur sa finalite, sa base legale, les categories de donnees concernees, les destinataires, les durees de conservation et les mesures de securite mises en oeuvre. Le registre doit etre tenu par ecrit, sous forme electronique, et mis a la disposition de la CNIL sur demande.
          </P>
          <P>
            Pour les TPE et PME, le registre presente un avantage strategique souvent meconnu : il vous oblige a prendre du recul sur vos pratiques et a identifier les donnees inutiles que vous accumulez. De nombreuses entreprises decouvrent a cette occasion qu'elles conservent des donnees dont elles n'ont plus besoin, ce qui represente un risque juridique et un cout de stockage inutile.
          </P>
        </Section>

        {/* Section 2 — Qui est concerne */}
        <Section>
          <H2 id="sec-concerne">Qui est concerne par l'obligation de registre ?</H2>
          <P>
            L'article 30 du RGPD prevoit une exemption pour les entreprises de moins de 250 salaries. Mais attention : cette exemption est assortie de trois exceptions majeures qui la rendent quasi-inapplicable en pratique.
          </P>
          <P>
            Vous devez tenir un registre meme avec moins de 250 salaries si vos traitements :
          </P>
          <div style={{ margin: "20px 0 28px" }}>
            {[
              { title: "Sont reguliers", desc: "Vous tenez un fichier clients, vous envoyez des newsletters, vous gerez la paie de vos salaries, vous utilisez un CRM — tous ces traitements sont consideres comme reguliers par la CNIL." },
              { title: "Portent sur des donnees sensibles", desc: "Donnees de sante, opinions politiques, appartenance syndicale, donnees biometriques, origine ethnique. Les cabinets medicaux, les associations et les RH sont directement concernes." },
              { title: "Comportent un risque pour les droits et libertes", desc: "Videosurveillance, geolocalisation des vehicules, profilage marketing, scoring de credit. Des qu'un traitement peut avoir un impact significatif sur les personnes, le registre est obligatoire." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", padding: "16px 20px", margin: "8px 0", background: "rgba(255,255,255,0.015)", borderRadius: "8px", border: `1px solid ${VG(0.06)}` }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ACCENT, flexShrink: 0, marginTop: "8px" }} />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: V, marginBottom: "4px" }}>{item.title}</div>
                  <div style={{ fontSize: "15px", color: V3, lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <Blockquote color="#f59e0b">
            En pratique, la CNIL considere que la quasi-totalite des entreprises, y compris les auto-entrepreneurs et les TPE, realisent des traitements reguliers qui les soumettent a l'obligation de registre.
          </Blockquote>
          <P>
            Le message est clair : ne vous fiez pas au seuil de 250 salaries pour vous croire exempt. Un boulanger qui tient un fichier de fidelite, un plombier qui utilise un logiciel de facturation, un coach qui gere des rendez-vous en ligne — tous doivent tenir un registre. La CNIL propose d'ailleurs un modele simplifie specifiquement adapte aux petites structures.
          </P>
        </Section>

        {/* Section 3 — Contenu obligatoire */}
        <Section>
          <H2 id="sec-contenu">Les 8 informations obligatoires de chaque fiche de traitement</H2>
          <P>
            Chaque traitement de votre registre doit contenir au minimum les huit informations suivantes, definies par l'article 30 du RGPD. L'absence de l'une de ces informations constitue un manquement constate par la CNIL.
          </P>
          <div style={{ margin: "28px 0" }}>
            {[
              { num: "01", title: "Nom et coordonnees du responsable de traitement", desc: "L'identite de votre entreprise (raison sociale, adresse, SIRET) et les coordonnees du responsable de traitement ou du DPO si vous en avez designe un. Si vous avez un responsable conjoint, ses coordonnees doivent aussi figurer.", color: ACCENT },
              { num: "02", title: "Finalites du traitement", desc: "L'objectif poursuivi par la collecte de donnees. Soyez precis et concret : 'Gestion de la paie des salaries', 'Envoi de la newsletter hebdomadaire', 'Prospection commerciale par email'. Chaque finalite distincte doit faire l'objet d'une fiche separee.", color: "#06b6d4" },
              { num: "03", title: "Categories de personnes concernees", desc: "Qui sont les personnes dont vous traitez les donnees : clients, prospects, salaries, fournisseurs, visiteurs du site web, candidats a l'embauche, patients, adherents. Identifiez chaque categorie distincte.", color: ACCENT2 },
              { num: "04", title: "Categories de donnees personnelles", desc: "Detaillez les types de donnees collectees pour chaque traitement : identite, coordonnees, donnees bancaires, donnees de navigation, donnees de sante, habitudes de consommation. Plus la categorie est sensible, plus la documentation doit etre rigoureuse.", color: "#f59e0b" },
              { num: "05", title: "Destinataires des donnees", desc: "Qui accede aux donnees : les services internes (RH, comptabilite, commercial), les sous-traitants (hebergeur, prestataire de paie, outil CRM), les partenaires eventuels. Chaque destinataire doit etre identifie avec son role.", color: "#ef4444" },
              { num: "06", title: "Transferts hors Union europeenne", desc: "Si des donnees sont transferees hors de l'UE (hebergement aux Etats-Unis, prestataire en Inde, filiale au Maroc), documentez le pays de destination et les garanties mises en place : clauses contractuelles types, decision d'adequation, BCR.", color: ACCENT },
              { num: "07", title: "Durees de conservation", desc: "Pour chaque categorie de donnees, la duree de conservation doit etre justifiee : obligation legale (5 ans pour les bulletins de paie), necessite contractuelle, ou decision interne motivee. Indiquez aussi les conditions d'archivage et de purge.", color: "#06b6d4" },
              { num: "08", title: "Mesures de securite techniques et organisationnelles", desc: "Decrivez les mesures de protection : chiffrement, controle d'acces par mot de passe, sauvegardes, anonymisation, formation du personnel, politique de confidentialite interne, journalisation des acces. Adaptez les mesures au niveau de risque.", color: ACCENT2 },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "20px", margin: "16px 0", padding: "20px 24px", background: "rgba(255,255,255,0.015)", borderRadius: "8px", border: `1px solid ${VG(0.06)}` }}>
                <div style={{ fontSize: "28px", fontWeight: 900, color: item.color, lineHeight: 1, flexShrink: 0, minWidth: "40px" }}>{item.num}</div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: V, marginBottom: "6px" }}>{item.title}</div>
                  <P style={{ margin: 0, fontSize: "15px" }}>{item.desc}</P>
                </div>
              </div>
            ))}
          </div>
          <P>
            Au-dela de ces huit informations obligatoires, il est recommande d'ajouter la base legale du traitement (consentement, obligation legale, interet legitime, execution du contrat), la date de creation de la fiche et la date de derniere mise a jour. Ces elements supplementaires facilitent grandement la gestion du registre au quotidien.
          </P>
        </Section>

        {/* Interactive Registre Simulator */}
        <RegistreSimulator />

        {/* Section 4 — Comment le creer pas a pas */}
        <Section>
          <H2 id="sec-creer">Comment creer votre registre en 5 etapes</H2>
          <P>
            La creation du registre peut sembler intimidante, mais en procedant methodiquement, vous pouvez obtenir un premier registre conforme en quelques heures. Voici les cinq etapes a suivre dans l'ordre.
          </P>
          {[
            {
              num: "1",
              title: "Identifier tous vos traitements de donnees",
              desc: "Commencez par lister exhaustivement tous les traitements de donnees personnelles de votre entreprise. Pensez a tous les services et processus : gestion de la paie, fichier clients et prospects, newsletter et emailing, CRM, comptabilite et facturation, candidatures et recrutement, videosurveillance, badges d'acces, site web et formulaires de contact, programme de fidelite, sous-traitance. Interrogez chaque service et chaque collaborateur. Les traitements 'invisibles' (cookies, logs serveur, sauvegardes) sont souvent oublies.",
              color: ACCENT,
            },
            {
              num: "2",
              title: "Remplir une fiche pour chaque traitement",
              desc: "Pour chaque traitement identifie, creez une fiche contenant les 8 informations obligatoires detaillees ci-dessus. Soyez factuel et precis. Evitez les formulations vagues comme 'ameliorer nos services' — privilegiez 'envoi d'offres promotionnelles personnalisees par email aux clients ayant realise un achat dans les 12 derniers mois'.",
              color: "#06b6d4",
            },
            {
              num: "3",
              title: "Verifier les bases legales de chaque traitement",
              desc: "Chaque traitement doit reposer sur une base legale valide parmi les six prevues par le RGPD : consentement de la personne, execution d'un contrat, obligation legale, sauvegarde des interets vitaux, mission d'interet public, ou interet legitime du responsable de traitement. Le choix de la base legale a des consequences importantes sur les droits des personnes et vos obligations.",
              color: ACCENT2,
            },
            {
              num: "4",
              title: "Definir les durees de conservation",
              desc: "Pour chaque type de donnees, determinez une duree de conservation justifiee. Appuyez-vous sur les referentiels de la CNIL, les obligations legales (Code du commerce, Code du travail, Code general des impots) et les recommandations sectorielles. Exemples : donnees de facturation 10 ans, donnees de paie 5 ans, prospects inactifs 3 ans, candidatures non retenues 2 ans, cookies 13 mois maximum.",
              color: "#f59e0b",
            },
            {
              num: "5",
              title: "Mettre a jour regulierement le registre",
              desc: "Le registre n'est pas un document statique. Planifiez une revue complete au moins annuelle, et mettez-le a jour immediatement en cas de nouveau traitement, changement de prestataire, modification des finalites ou des durees de conservation. Designez un responsable interne charge de cette mise a jour. Vault envoie des rappels automatiques et detecte les fiches obsoletes.",
              color: "#ef4444",
            },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", margin: "24px 0", padding: "24px", background: "rgba(255,255,255,0.015)", borderRadius: "8px", border: `1px solid ${VG(0.06)}` }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
                background: `${step.color}15`, border: `2px solid ${step.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", fontWeight: 900, color: step.color,
              }}>{step.num}</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: V, marginBottom: "8px" }}>{step.title}</div>
                <P style={{ margin: 0 }}>{step.desc}</P>
              </div>
            </div>
          ))}
        </Section>

        {/* Section 5 — Outils et solutions */}
        <Section>
          <H2 id="sec-outils">Excel ou outil specialise : quelle solution pour votre registre ?</H2>
          <P>
            Deux approches s'offrent a vous pour tenir votre registre : le tableur (Excel ou Google Sheets) et l'outil specialise. Chacune a ses avantages et ses limites. Le bon choix depend de la taille de votre entreprise, du nombre de traitements et de vos ressources internes.
          </P>

          {/* Comparison table */}
          <div style={{ margin: "28px 0", borderRadius: "12px", overflow: "hidden", border: `1px solid ${VG(0.1)}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ padding: "16px", fontSize: "13px", fontWeight: 700, color: V3, borderBottom: `1px solid ${VG(0.08)}` }}>Critere</div>
              <div style={{ padding: "16px", fontSize: "13px", fontWeight: 700, color: V3, borderBottom: `1px solid ${VG(0.08)}`, borderLeft: `1px solid ${VG(0.08)}` }}>Excel / Sheets</div>
              <div style={{ padding: "16px", fontSize: "13px", fontWeight: 700, color: ACCENT, borderBottom: `1px solid ${VG(0.08)}`, borderLeft: `1px solid ${VG(0.08)}` }}>Vault by NERVUR</div>
            </div>
            {[
              ["Cout", "Gratuit", "79\u20AC/mois"],
              ["Mise en place", "Manuelle (2-5 jours)", "Guidee (30 min)"],
              ["Alertes de mise a jour", "Non", "Oui, automatiques"],
              ["Conformite des fiches", "A verifier soi-meme", "Garantie par l'outil"],
              ["Historique des modifications", "Non", "Oui, complet"],
              ["Export PDF pour la CNIL", "Manuel", "En un clic"],
              ["Collaboration", "Limitee", "Multi-utilisateurs"],
              ["Veille reglementaire", "Non", "Integree"],
            ].map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: i < 7 ? `1px solid ${VG(0.06)}` : "none" }}>
                <div style={{ padding: "12px 16px", fontSize: "14px", color: V2 }}>{row[0]}</div>
                <div style={{ padding: "12px 16px", fontSize: "14px", color: V3, borderLeft: `1px solid ${VG(0.06)}` }}>{row[1]}</div>
                <div style={{ padding: "12px 16px", fontSize: "14px", color: V2, borderLeft: `1px solid ${VG(0.06)}` }}>{row[2]}</div>
              </div>
            ))}
          </div>

          <P>
            Le modele Excel de la CNIL est une bonne solution pour demarrer, surtout pour les tres petites structures avec peu de traitements (moins de cinq). Cependant, des que votre entreprise grandit ou que le nombre de traitements augmente, le tableur devient vite un cauchemar de maintenance : pas de rappels, pas d'historique des modifications, risque d'erreurs dans les formules, difficulte de collaboration entre plusieurs personnes.
          </P>
          <P>
            Vault automatise l'ensemble du processus. Un questionnaire guide vous aide a identifier vos traitements, les fiches sont pre-remplies selon votre secteur d'activite, et l'outil verifie automatiquement la completude de chaque fiche. Les alertes de mise a jour vous rappellent de revisiter vos traitements a intervalles reguliers, et l'export PDF genere un document pret a presenter a la CNIL en cas de controle.
          </P>
          <Blockquote color={ACCENT}>
            Les entreprises qui utilisent un outil specialise ont 4 fois plus de chances de maintenir un registre a jour sur la duree que celles qui utilisent un tableur.
          </Blockquote>
        </Section>

        {/* CTA */}
        <Section>
          <div style={{ textAlign: "center", padding: isMobile ? "40px 24px" : "56px 40px", margin: "48px 0", background: `linear-gradient(135deg, rgba(6,182,212,0.1), rgba(8,145,178,0.04))`, borderRadius: "16px", border: `1px solid rgba(6,182,212,0.15)` }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Vault par NERVUR</span>
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: V, margin: "16px 0 12px" }}>Creez votre registre RGPD en 30 minutes</h3>
            <P style={{ maxWidth: "480px", margin: "0 auto 8px", color: V3 }}>
              Vault genere automatiquement votre registre des traitements conforme a l'article 30. Questionnaire guide, fiches pre-remplies, alertes de mise a jour et export PDF pour la CNIL.
            </P>
            <P style={{ maxWidth: "480px", margin: "0 auto 28px", color: V3, fontSize: "15px" }}>
              A partir de <span style={{ color: ACCENT, fontWeight: 700 }}>79&#8364;/mois</span> &middot; Sans engagement
            </P>
            <button onClick={() => navigate("/app/login")} style={{
              background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`, border: "none", color: V,
              padding: "14px 40px", fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "6px",
              boxShadow: `0 4px 24px rgba(6,182,212,0.3)`, transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(6,182,212,0.4)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(6,182,212,0.3)"; }}
            >Creer mon registre maintenant</button>
          </div>
        </Section>

        {/* FAQ */}
        <Section>
          <H2 id="sec-faq">Questions frequentes sur le registre des traitements</H2>
          <FAQSection />
        </Section>

        {/* Related articles */}
        <Section>
          <div style={{ margin: "48px 0 40px", padding: "32px 0", borderTop: `1px solid ${VG(0.08)}` }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: V3, display: "block", marginBottom: "20px" }}>Articles connexes</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { title: "RGPD pour les TPE/PME : les 10 obligations a respecter en 2026", path: "/blog/rgpd-guide", color: "#10b981" },
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
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, flexShrink: 0 }}>N</div>
            <div>
              <div style={{ fontSize: "16px", color: V, fontWeight: 700 }}>L'equipe NERVUR</div>
              <p style={{ fontSize: "14px", color: V3, lineHeight: 1.6, margin: "4px 0 0" }}>
                NERVUR developpe des outils SaaS pour aider les PME francaises a maitriser leur presence digitale et leur conformite juridique. Vault automatise votre mise en conformite RGPD : registre des traitements, politique de confidentialite, bandeau cookies et suivi continu.
              </p>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${VG(0.08)}`, padding: "40px 0 24px", marginTop: "40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "32px", marginBottom: "32px" }}>
            {/* Col 1 — NERVUR */}
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: V, marginBottom: "12px" }}>NERVUR</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Accueil", path: "/" },
                  { label: "Contact", path: "/contact" },
                  { label: "Vault — Conformite RGPD", path: "/app/login" },
                ].map((link, i) => (
                  <span key={i} onClick={() => navigate(link.path)} style={{ fontSize: "13px", color: V3, cursor: "pointer", transition: "color 0.3s" }}
                    onMouseEnter={e => e.target.style.color = ACCENT}
                    onMouseLeave={e => e.target.style.color = V3}
                  >{link.label}</span>
                ))}
              </div>
            </div>
            {/* Col 2 — Blog */}
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: V, marginBottom: "12px" }}>Blog</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "RGPD : les 10 obligations", path: "/blog/rgpd-guide" },
                  { label: "Conformite juridique", path: "/blog/conformite-juridique" },
                  { label: "Presence digitale", path: "/blog/presence-digitale" },
                  { label: "Registre des traitements", path: "/blog/registre-traitements" },
                ].map((link, i) => (
                  <span key={i} onClick={() => navigate(link.path)} style={{ fontSize: "13px", color: V3, cursor: "pointer", transition: "color 0.3s" }}
                    onMouseEnter={e => e.target.style.color = ACCENT}
                    onMouseLeave={e => e.target.style.color = V3}
                  >{link.label}</span>
                ))}
              </div>
            </div>
            {/* Col 3 — Legal */}
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: V, marginBottom: "12px" }}>Legal</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Mentions legales", path: "/mentions-legales" },
                  { label: "Politique de confidentialite", path: "/politique-confidentialite" },
                ].map((link, i) => (
                  <span key={i} onClick={() => navigate(link.path)} style={{ fontSize: "13px", color: V3, cursor: "pointer", transition: "color 0.3s" }}
                    onMouseEnter={e => e.target.style.color = ACCENT}
                    onMouseLeave={e => e.target.style.color = V3}
                  >{link.label}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", paddingTop: "20px", borderTop: `1px solid ${VG(0.06)}` }}>
            <div style={{ fontSize: "13px", color: V3 }}>
              <span style={{ fontWeight: 600, color: V2 }}>L'equipe NERVUR</span> &middot; 31 mars 2026 &middot; 14 min de lecture
            </div>
            <LogoNervur height={22} onClick={() => navigate("/")} />
          </div>
        </div>
      </div>
    </div>
  );
}
