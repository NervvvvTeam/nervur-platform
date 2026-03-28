import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

const BG = "#0f1117";
const V = "#FFFFFF";
const V2 = "#D4D4D8";
const V3 = "#A1A1AA";
const ACCENT = "#06b6d4";
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

/* ───── RGPD Compliance Checklist ───── */
function RgpdChecklist() {
  const [checked, setChecked] = useState({});
  const items = [
    "Nommer un referent RGPD (DPO ou responsable interne)",
    "Tenir un registre des traitements de donnees personnelles",
    "Rediger et afficher une politique de confidentialite conforme",
    "Recueillir le consentement explicite pour chaque traitement",
    "Securiser le stockage des donnees personnelles (chiffrement)",
    "Mettre en place une procedure de reponse aux demandes d'exercice de droits",
    "Documenter les mesures de securite techniques et organisationnelles",
    "Prevoir un plan de notification en cas de violation de donnees",
  ];
  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));
  const count = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ margin: "40px 0", padding: "32px", background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.12)", borderRadius: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Checklist conformite RGPD</span>
        <span style={{ fontSize: "13px", color: count === items.length ? ACCENT2 : V3 }}>{count}/{items.length}</span>
      </div>
      <div style={{ height: "4px", background: "rgba(6,182,212,0.1)", borderRadius: "2px", marginBottom: "24px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(count / items.length) * 100}%`, background: count === items.length ? ACCENT2 : ACCENT, borderRadius: "2px", transition: "width 0.4s ease" }} />
      </div>
      {items.map((item, i) => (
        <div key={i} onClick={() => toggle(i)} style={{
          display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 0", cursor: "pointer",
          borderBottom: i < items.length - 1 ? `1px solid ${VG(0.06)}` : "none",
        }}>
          <div style={{
            width: "22px", height: "22px", borderRadius: "4px", flexShrink: 0, marginTop: "2px",
            border: checked[i] ? `2px solid ${ACCENT2}` : `2px solid ${VG(0.2)}`,
            background: checked[i] ? `${ACCENT2}15` : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>
            {checked[i] && <span style={{ color: ACCENT2, fontSize: "14px", fontWeight: 700 }}>&#10003;</span>}
          </div>
          <span style={{ fontSize: "15px", color: checked[i] ? V3 : V2, lineHeight: 1.6, textDecoration: checked[i] ? "line-through" : "none", transition: "all 0.3s" }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

/* ───── FAQ Accordion ───── */
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "Le RGPD s'applique-t-il a toutes les entreprises ?", a: "Oui. Le RGPD s'applique a toute organisation, quelle que soit sa taille, qui traite des donnees personnelles de residents europeens. Cela inclut les TPE, les PME, les auto-entrepreneurs et les associations. Il n'existe aucune exemption liee a la taille de l'entreprise, meme si les obligations de documentation sont allégées pour les structures de moins de 250 salaries." },
    { q: "Faut-il obligatoirement nommer un DPO ?", a: "La designation d'un DPO (Delegue a la Protection des Donnees) est obligatoire pour les organismes publics, les entreprises dont l'activite principale implique un suivi regulier et systematique des personnes a grande echelle, et celles qui traitent des donnees sensibles a grande echelle. Pour les TPE/PME classiques, un referent RGPD interne suffit generalement." },
    { q: "Quels sont les risques en cas de non-conformite ?", a: "Les sanctions peuvent atteindre 20 millions d'euros ou 4% du chiffre d'affaires annuel mondial. En pratique, la CNIL privilegie d'abord les mises en demeure et les injonctions. Cependant, les amendes prononcees contre des PME se multiplient depuis 2024, avec des montants allant de 5 000 a 150 000 euros selon la gravite des manquements." },
    { q: "Combien de temps prend une mise en conformite RGPD ?", a: "Pour une TPE/PME standard, comptez 2 a 4 semaines pour mettre en place les fondamentaux : registre des traitements, politique de confidentialite, formulaires de consentement et procedures de gestion des droits. Un outil specialise comme Vault peut reduire ce delai a quelques jours grace a l'automatisation des documents et du suivi." },
    { q: "Les donnees des employes sont-elles concernees par le RGPD ?", a: "Absolument. Les fiches de paie, les CV, les evaluations, les horaires, les adresses personnelles — toutes ces donnees sont des donnees personnelles protegees par le RGPD. L'entreprise doit informer ses salaries des traitements effectues, limiter la collecte au strict necessaire et securiser le stockage de ces informations." },
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
  { id: "sec-contexte", label: "Pourquoi le RGPD en 2026" },
  { id: "sec-obligations", label: "Les 6 obligations cles" },
  { id: "sec-sanctions", label: "Sanctions et controles" },
  { id: "sec-etapes", label: "5 etapes pour se conformer" },
  { id: "sec-faq", label: "FAQ" },
];

export default function BlogSecuritePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrollProgress = useScrollProgress();
  const [activeId, setActiveId] = useState("");

  useSEO(
    "Conformite RGPD : guide complet pour les TPE/PME en 2026 | NERVUR",
    "RGPD pour les TPE et PME : obligations legales, sanctions, etapes de mise en conformite. Guide pratique pour respecter le reglement europeen sur la protection des donnees.",
    {
      path: "/blog/conformite-juridique",
      type: "article",
      keywords: "RGPD PME, conformite RGPD, protection donnees entreprise, obligations legales RGPD 2026",
      author: "L'equipe NERVUR",
      publishedTime: "2026-03-18T08:00:00+01:00",
      modifiedTime: "2026-03-28T10:00:00+01:00",
    }
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Conformite RGPD : guide complet pour les TPE/PME en 2026",
      description: "Guide pratique RGPD pour les TPE/PME : obligations legales, sanctions CNIL, etapes de mise en conformite et outils pour automatiser le processus.",
      author: { "@type": "Organization", name: "NERVUR" },
      publisher: { "@type": "Organization", name: "NERVUR", url: "https://nervur.fr" },
      datePublished: "2026-03-18",
      dateModified: "2026-03-28",
      mainEntityOfPage: "https://nervur.fr/blog/conformite-juridique",
      keywords: "RGPD PME, conformite RGPD, protection donnees entreprise, obligations legales RGPD 2026",
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

      {/* Scroll progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, width: `${scrollProgress}%`, height: "3px", background: `linear-gradient(90deg, ${ACCENT}, #22d3ee)`, zIndex: 200, transition: "width 0.1s linear" }} />

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
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, border: `1px solid rgba(6,182,212,0.3)`, padding: "4px 12px", borderRadius: "2px" }}>Conformite juridique</span>
            <span style={{ fontSize: "13px", color: V3, marginLeft: "16px" }}>12 min de lecture</span>
          </div>
          <h1 style={{
            fontSize: isMobile ? "28px" : "42px", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-1px",
            background: `linear-gradient(135deg, ${V}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Conformite RGPD : guide complet pour les TPE/PME en 2026
          </h1>
          <P style={{ fontSize: "19px", color: V3 }}>
            Le RGPD n'est pas reserve aux grandes entreprises. En 2026, la CNIL intensifie ses controles aupres des TPE et PME, avec des amendes qui se comptent en dizaines de milliers d'euros. Pourtant, la grande majorite des petites structures francaises ne sont toujours pas en conformite. Ce guide vous explique concretement ce que vous devez faire, pourquoi c'est urgent, et comment y parvenir sans mobiliser des ressources disproportionnees.
          </P>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "12px", borderTop: `1px solid ${VG(0.1)}`, marginTop: "8px", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>N</div>
            <div>
              <div style={{ fontSize: "14px", color: V, fontWeight: 600 }}>L'equipe NERVUR</div>
              <div style={{ fontSize: "12px", color: V3 }}>18 mars 2026</div>
            </div>
            <div style={{ marginLeft: "auto" }}><CopyLinkButton /></div>
          </div>
        </Section>

        {/* Stats */}
        <Section>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px", margin: "40px 0" }}>
            <StatCard number="74%" label="des PME francaises ne sont pas conformes au RGPD" color="#ef4444" />
            <StatCard number="20M&#8364;" label="amende maximale prevue par le reglement" color="#f59e0b" />
            <StatCard number="+180%" label="d'augmentation des controles CNIL en 2025" color={ACCENT} />
          </div>
        </Section>

        {/* Section 1 */}
        <Section>
          <H2 id="sec-contexte">Pourquoi la conformite RGPD est incontournable en 2026</H2>
          <P>
            Le Reglement General sur la Protection des Donnees (RGPD) est entre en vigueur le 25 mai 2018. Huit ans plus tard, force est de constater que la majorite des TPE et PME francaises n'ont pas encore pris la mesure de leurs obligations. Selon les dernieres estimations de la CNIL, pres de 74% des petites entreprises presentent des lacunes significatives en matiere de conformite.
          </P>
          <P>
            Cette situation etait toleree pendant les premieres annees d'application, la CNIL privilegiant la pedagogie. Mais le contexte a radicalement change. Depuis 2024, le regulateur a adopte une posture beaucoup plus ferme, avec une augmentation de 180% du nombre de controles cibles sur les TPE/PME. Les secteurs les plus vises sont le commerce en ligne, la sante, l'immobilier et les services a la personne.
          </P>
          <Blockquote color={ACCENT}>
            Le RGPD n'est pas une contrainte administrative de plus. C'est un avantage concurrentiel : les clients font davantage confiance aux entreprises qui protegent leurs donnees.
          </Blockquote>
          <P>
            Les consommateurs sont desormais sensibilises a la protection de leurs donnees. Une etude IFOP de 2025 revele que 68% des Francais verifient la politique de confidentialite avant de transmettre leurs coordonnees a une entreprise. Les mentions de conformite RGPD sur un site web augmentent le taux de conversion de 12% en moyenne. La conformite n'est donc pas seulement une obligation legale — c'est un levier commercial.
          </P>
          <P>
            En 2026, de nouvelles directives europeennes renforcent encore les exigences, notamment sur le consentement aux cookies, la portabilite des donnees et les transferts hors UE. Les entreprises qui n'ont pas encore entame leur mise en conformite s'exposent a des risques juridiques et financiers croissants.
          </P>
        </Section>

        {/* Section 2 */}
        <Section>
          <H2 id="sec-obligations">Les 6 obligations cles du RGPD pour les TPE/PME</H2>
          <P>
            Le RGPD repose sur plusieurs principes fondamentaux que chaque entreprise doit respecter, independamment de sa taille. Voici les six obligations essentielles que toute TPE/PME doit maitriser.
          </P>
          {[
            { num: "01", title: "Tenir un registre des traitements", desc: "Chaque entreprise doit documenter l'ensemble des traitements de donnees personnelles qu'elle effectue : finalite, categories de donnees, destinataires, duree de conservation. Ce registre est le document fondamental de la conformite RGPD. Il doit etre tenu a jour et accessible en cas de controle. Pour les structures de moins de 250 salaries, une version allégée est acceptee, mais le registre reste obligatoire des lors que le traitement est regulier.", color: ACCENT },
            { num: "02", title: "Informer les personnes concernees", desc: "Toute personne dont vous collectez des donnees doit etre informee de maniere claire et accessible : quelles donnees, pourquoi, combien de temps, quels droits. Cette information doit figurer dans votre politique de confidentialite, vos formulaires de contact, vos conditions generales et vos contrats de travail.", color: ACCENT2 },
            { num: "03", title: "Recueillir un consentement valide", desc: "Le consentement doit etre libre, specifique, eclaire et univoque. Les cases pre-cochees, le consentement implicite ou les formulations ambigues sont proscrits. Chaque finalite de traitement necessite un consentement distinct. L'entreprise doit pouvoir prouver que le consentement a ete recueilli et permettre son retrait a tout moment.", color: "#f59e0b" },
            { num: "04", title: "Garantir les droits des personnes", desc: "Vos clients, prospects et employes disposent de droits precis : acces, rectification, effacement, portabilite, opposition et limitation du traitement. Vous devez mettre en place une procedure pour repondre a ces demandes dans un delai d'un mois maximum. L'absence de reponse constitue un manquement sanctionnable.", color: "#ef4444" },
            { num: "05", title: "Securiser les donnees personnelles", desc: "Le RGPD impose des mesures de securite techniques et organisationnelles adaptees au niveau de risque : chiffrement, controle d'acces, sauvegardes, pseudonymisation. Ces mesures doivent etre documentees et regulierement reevaluees. En cas de violation, l'entreprise doit notifier la CNIL sous 72 heures.", color: ACCENT },
            { num: "06", title: "Encadrer les sous-traitants", desc: "Si vous confiez des donnees personnelles a des prestataires (hebergeur, outil CRM, comptable en ligne), vous devez formaliser la relation par un contrat incluant des clauses RGPD specifiques. Vous restez responsable du traitement meme lorsqu'un sous-traitant intervient. Verifiez que vos fournisseurs sont eux-memes conformes.", color: "#f59e0b" },
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

        {/* Section 3 */}
        <Section>
          <H2 id="sec-sanctions">Sanctions CNIL : ce que risquent les TPE/PME</H2>
          <P>
            Les sanctions financieres ne sont plus reservees aux geants du numerique. Depuis 2024, la CNIL prononce regulierement des amendes contre des TPE et PME. Les montants varient de 5 000 euros pour des manquements mineurs a plus de 150 000 euros pour des infractions graves, comme l'absence de registre des traitements ou le defaut de notification apres une violation de donnees.
          </P>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", margin: "28px 0" }}>
            <StatCard number="4%" label="du CA annuel mondial : amende maximale RGPD" color="#ef4444" />
            <StatCard number="72h" label="delai pour notifier la CNIL en cas de violation" color="#f59e0b" />
          </div>
          <P>
            Au-dela des amendes, la CNIL dispose d'un arsenal de mesures coercitives : mise en demeure publique (atteinte a la reputation), injonction de cesser un traitement (blocage de l'activite), limitation temporaire d'un traitement et astreintes journalieres. Une mise en demeure publique peut avoir des consequences commerciales bien superieures a l'amende elle-meme.
          </P>
          <P>
            Les controles de la CNIL peuvent etre declenches par une plainte d'un client ou d'un employe, par une violation de donnees signalee, par une campagne sectorielle de controles ou meme par une simple visite de votre site web. Les agents de la CNIL verifient en priorite : la presence d'une politique de confidentialite, la conformite du bandeau cookies, le registre des traitements et les procedures de gestion des droits.
          </P>
          <Blockquote color="#ef4444">
            En 2025, la CNIL a recu plus de 16 000 plaintes, dont 40% concernaient des TPE/PME. Ne pas etre en conformite, c'est jouer a la roulette avec la perennite de votre entreprise.
          </Blockquote>
        </Section>

        {/* Interactive Checklist */}
        <RgpdChecklist />

        {/* Section 4 */}
        <Section>
          <H2 id="sec-etapes">5 etapes pour mettre votre entreprise en conformite</H2>
          <P>
            La mise en conformite RGPD peut sembler complexe, mais elle se decompose en etapes logiques et progressives. Voici un plan d'action concret adapte aux TPE/PME, realisable en quelques semaines.
          </P>
          <BulletList items={[
            "Etape 1 : Cartographiez vos traitements de donnees — listez tous les fichiers, bases de donnees, formulaires et outils qui collectent des donnees personnelles (clients, prospects, employes, fournisseurs)",
            "Etape 2 : Redigez votre registre des traitements — pour chaque traitement, documentez la finalite, les categories de donnees, les destinataires, la duree de conservation et les mesures de securite",
            "Etape 3 : Mettez a jour votre information — redigez ou actualisez votre politique de confidentialite, vos mentions legales, vos formulaires et vos bandeaux cookies",
            "Etape 4 : Securisez vos donnees — mettez en place le chiffrement, les sauvegardes, le controle d'acces et formez vos equipes aux bonnes pratiques",
            "Etape 5 : Instaurez des procedures — creez un processus de reponse aux demandes d'exercice de droits et un plan de notification en cas de violation",
          ]} />
          <P>
            Un outil comme Vault automatise une grande partie de ces etapes : generation du registre des traitements, modeles de politique de confidentialite, suivi des demandes de droits, alertes de conformite et tableau de bord de suivi. Ce qui prend des semaines manuellement peut etre realise en quelques jours avec l'aide de l'automatisation.
          </P>
          <P>
            N'attendez pas un controle ou une plainte pour agir. La mise en conformite proactive est toujours moins couteuse — en temps, en argent et en stress — que la remediation en urgence apres un incident. Les entreprises conformes beneficient en outre d'une meilleure image aupres de leurs clients et partenaires.
          </P>
        </Section>

        {/* CTA */}
        <Section>
          <div style={{ textAlign: "center", padding: isMobile ? "40px 24px" : "56px 40px", margin: "48px 0", background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(8,145,178,0.04))", borderRadius: "16px", border: "1px solid rgba(6,182,212,0.15)" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Vault par NERVUR</span>
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: V, margin: "16px 0 12px" }}>Simplifiez votre conformite RGPD</h3>
            <P style={{ maxWidth: "480px", margin: "0 auto 8px", color: V3 }}>
              Vault genere votre registre des traitements, vos documents de conformite et surveille vos obligations en continu. Configuration en 5 minutes, conformite en quelques jours.
            </P>
            <P style={{ maxWidth: "480px", margin: "0 auto 28px", color: V3, fontSize: "15px" }}>
              A partir de <span style={{ color: ACCENT, fontWeight: 700 }}>69&#8364;/mois</span> &middot; Essai gratuit 14 jours &middot; Sans engagement
            </P>
            <button onClick={() => navigate("/demo/vault")} style={{
              background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`, border: "none", color: V,
              padding: "14px 40px", fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "6px",
              boxShadow: "0 4px 24px rgba(6,182,212,0.3)", transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(6,182,212,0.4)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(6,182,212,0.3)"; }}
            >Decouvrir Vault</button>
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
                { title: "E-reputation : pourquoi 90% des PME perdent des clients sans le savoir", path: "/blog/e-reputation", color: "#818CF8" },
                { title: "RGPD pour les TPE/PME : les 10 obligations que vous devez respecter en 2026", path: "/blog/rgpd-guide", color: "#8b5cf6" },
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
                NERVUR conçoit des outils SaaS pour aider les PME francaises a maitriser leur presence digitale : e-reputation avec Sentinel et conformite juridique avec Vault.
              </p>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${VG(0.08)}`, padding: "24px 0", marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ fontSize: "13px", color: V3 }}>
            <span style={{ fontWeight: 600, color: V2 }}>L'equipe NERVUR</span> &middot; 18 mars 2026 &middot; 12 min de lecture
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
