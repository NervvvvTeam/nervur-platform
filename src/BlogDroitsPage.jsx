import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

const BG = "#FFFFFF";
const V = "#FFFFFF";
const V2 = "#425466";
const V3 = "#6B7C93";
const ACCENT = "#8b5cf6";
const ACCENT2 = "#a78bfa";
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

/* ───── DSAR Timeline ───── */
function DsarTimeline({ isMobile }) {
  const milestones = [
    { day: "J+0", label: "Reception de la demande", desc: "Enregistrer la demande dans un registre dedie avec date et type de droit exerce.", color: "#3b82f6" },
    { day: "J+1", label: "Accuse de reception", desc: "Envoyer un accuse de reception au demandeur confirmant la prise en charge.", color: "#8b5cf6" },
    { day: "J+3", label: "Verification d'identite", desc: "Verifier l'identite du demandeur. Demander une piece d'identite si necessaire.", color: "#f59e0b" },
    { day: "J+10", label: "Collecte des donnees", desc: "Identifier et rassembler toutes les donnees concernees dans vos systemes.", color: "#06b6d4" },
    { day: "J+25", label: "Preparation de la reponse", desc: "Preparer la reponse formelle et les documents a transmettre au demandeur.", color: "#f97316" },
    { day: "J+30", label: "Deadline legale", desc: "Date limite pour repondre. Passee cette date, vous etes en infraction.", color: "#ef4444" },
  ];

  return (
    <div style={{ margin: "40px 0", padding: "32px", background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, fontWeight: 700 }}>Chronologie d'une demande DSAR</span>
        <span style={{ fontSize: "13px", color: V3 }}>30 jours calendaires</span>
      </div>
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div style={{ position: "absolute", left: isMobile ? "28px" : "40px", top: "0", bottom: "0", width: "2px", background: `linear-gradient(to bottom, #3b82f6, #ef4444)` }} />
        {milestones.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: isMobile ? "16px" : "24px", alignItems: "flex-start", marginBottom: i < milestones.length - 1 ? "28px" : "0", position: "relative" }}>
            <div style={{
              width: isMobile ? "56px" : "80px", flexShrink: 0, textAlign: "center",
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "56px", height: "32px", borderRadius: "6px",
                background: `${m.color}15`, border: `1px solid ${m.color}30`,
                fontSize: "13px", fontWeight: 700, color: m.color, position: "relative", zIndex: 2,
              }}>{m.day}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: V, marginBottom: "4px" }}>{m.label}</div>
              <div style={{ fontSize: "14px", color: V3, lineHeight: 1.6 }}>{m.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── FAQ Accordion ───── */
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    {
      q: "Peut-on refuser une demande de droit d'acces ?",
      a: "Oui, dans certains cas limites. Vous pouvez refuser si la demande est manifestement infondee ou excessive (par exemple, un meme individu qui envoie des demandes repetees dans le seul but de perturber votre activite). Vous pouvez aussi refuser si l'identification du demandeur est insuffisante. En revanche, vous devez toujours motiver votre refus par ecrit et informer le demandeur de son droit de saisir la CNIL."
    },
    {
      q: "Le delai de 30 jours inclut-il les week-ends ?",
      a: "Oui, le delai de 30 jours est calcule en jours calendaires, week-ends et jours feries inclus. Le decompte commence le lendemain de la reception de la demande. Si le dernier jour tombe un samedi, un dimanche ou un jour ferie, la date limite est reportee au premier jour ouvrable suivant. En cas de demande complexe, le delai peut etre prolonge de deux mois supplementaires, mais vous devez en informer le demandeur dans le delai initial de 30 jours."
    },
    {
      q: "Comment verifier l'identite du demandeur ?",
      a: "La verification d'identite doit etre proportionnee. Si le demandeur est deja un client identifie (via son espace client par exemple), une verification legere suffit (adresse email associee au compte). Pour les demandes provenant de canaux non authentifies, vous pouvez demander une copie d'une piece d'identite. Attention : ne demandez pas plus d'informations que necessaire pour la verification, au risque de contrevenir au principe de minimisation des donnees."
    },
    {
      q: "Que faire si la demande concerne des donnees chez un sous-traitant ?",
      a: "En tant que responsable de traitement, c'est vous qui devez repondre a la demande, meme si les donnees sont stockees chez un sous-traitant. Votre contrat de sous-traitance doit prevoir une clause d'assistance pour l'exercice des droits. Contactez immediatement votre sous-traitant, demandez-lui d'extraire ou de supprimer les donnees concernees, et assurez-vous que l'operation est realisee dans le delai de 30 jours. Documentez chaque echange."
    },
    {
      q: "Faut-il documenter les demandes refusees ?",
      a: "Absolument. La documentation est essentielle, que la demande soit acceptee ou refusee. Pour chaque demande refusee, conservez : la demande originale, la date de reception, le motif du refus, la reponse envoyee au demandeur avec l'information sur son droit de recours aupres de la CNIL. Cette documentation est votre meilleure protection en cas de controle ou de plainte ulterieure."
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
  { id: "sec-droits", label: "Les 6 droits fondamentaux" },
  { id: "sec-delais", label: "Delais et obligations" },
  { id: "sec-traiter", label: "Comment traiter une demande" },
  { id: "sec-cas", label: "Cas pratiques" },
  { id: "sec-outils", label: "Outils et solutions" },
  { id: "sec-faq", label: "FAQ" },
];

export default function BlogDroitsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrollProgress = useScrollProgress();
  const [activeId, setActiveId] = useState("");

  useSEO(
    "Droits des personnes RGPD : guide complet pour gerer les demandes (DSAR) en 2026 | NERVUR",
    "Comment gerer les demandes de droits RGPD (acces, suppression, portabilite). Delais legaux, procedures, modeles de reponse. Guide pratique pour TPE/PME.",
    {
      path: "/blog/droits-personnes-rgpd",
      type: "article",
      keywords: "droits des personnes RGPD, DSAR RGPD, droit acces RGPD, droit suppression RGPD, droit portabilite, demande exercice droits",
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
      headline: "Droits des personnes RGPD : guide complet pour gerer les demandes (DSAR) en 2026",
      description: "Comment gerer les demandes de droits RGPD (acces, suppression, portabilite). Delais legaux, procedures, modeles de reponse. Guide pratique pour TPE/PME.",
      author: { "@type": "Organization", name: "NERVUR" },
      publisher: { "@type": "Organization", name: "NERVUR", url: "https://nervur.fr" },
      datePublished: "2026-03-31",
      dateModified: "2026-03-31",
      mainEntityOfPage: "https://nervur.fr/blog/droits-personnes-rgpd",
      keywords: "droits des personnes RGPD, DSAR RGPD, droit acces RGPD, droit suppression RGPD, droit portabilite, demande exercice droits",
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
      <div style={{ position: "fixed", top: 0, left: 0, width: `${scrollProgress}%`, height: "3px", background: `linear-gradient(90deg, ${ACCENT}, #c4b5fd)`, zIndex: 200, transition: "width 0.1s linear" }} />

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
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, border: `1px solid rgba(139,92,246,0.3)`, padding: "4px 12px", borderRadius: "2px" }}>DSAR / DROITS RGPD</span>
            <span style={{ fontSize: "13px", color: V3, marginLeft: "16px" }}>15 min de lecture</span>
          </div>
          <h1 style={{
            fontSize: isMobile ? "28px" : "42px", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-1px",
            background: `linear-gradient(135deg, ${V}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Droits des personnes RGPD : comment gerer les demandes DSAR en 2026
          </h1>
          <P style={{ fontSize: "19px", color: V3 }}>
            Les articles 15 a 22 du RGPD donnent aux citoyens europeens des droits fondamentaux sur leurs donnees personnelles. Droit d'acces, de rectification, d'effacement, de portabilite, d'opposition et de limitation : chaque entreprise, quelle que soit sa taille, doit pouvoir repondre a ces demandes dans un delai strict de 30 jours. Ne pas repondre, c'est risquer une sanction de la CNIL pouvant aller jusqu'a 20 millions d'euros ou 4% du chiffre d'affaires annuel. Ce guide vous explique comment gerer chaque type de demande, etape par etape, avec des modeles et des outils concrets.
          </P>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "12px", borderTop: `1px solid ${VG(0.1)}`, marginTop: "8px", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>N</div>
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
            <StatCard number="30 j" label="delai maximum pour repondre a une demande" color="#8b5cf6" />
            <StatCard number="+65%" label="d'augmentation des demandes DSAR en 2025" color="#ef4444" />
            <StatCard number="6" label="droits fondamentaux du RGPD" color="#3b82f6" />
            <StatCard number="5 min" label="pour enregistrer une demande dans Vault" color="#10b981" />
          </div>
        </Section>

        {/* Section 1 — Les 6 droits fondamentaux */}
        <Section>
          <H2 id="sec-droits">Les 6 droits fondamentaux des personnes concernees</H2>
          <P>
            Le RGPD consacre six droits principaux pour les personnes dont les donnees sont traitees. Chaque droit est defini par un article specifique du reglement et impose des obligations precises au responsable de traitement. Comprendre ces droits est la premiere etape pour mettre en place une procedure de gestion efficace des demandes DSAR (Data Subject Access Request).
          </P>
          <P>
            Toute personne physique — client, prospect, employe, candidat, visiteur de site web — peut exercer ces droits aupres de votre entreprise. Vous ne pouvez pas exiger de justification pour la plupart de ces droits : la personne n'a pas a expliquer pourquoi elle souhaite acceder a ses donnees ou les faire supprimer.
          </P>

          {[
            { num: "01", title: "Droit d'acces (article 15)", desc: "La personne peut demander la confirmation que ses donnees sont traitees et obtenir une copie de l'ensemble de ses donnees personnelles. Vous devez aussi l'informer des finalites du traitement, des categories de donnees, des destinataires, de la duree de conservation prevue et de ses droits. C'est le droit le plus frequemment exerce : il represente environ 60% des demandes DSAR recues par les PME francaises.", color: "#3b82f6" },
            { num: "02", title: "Droit de rectification (article 16)", desc: "La personne peut exiger la correction de donnees inexactes ou incompletes la concernant. Une adresse erronee, un nom mal orthographie, un numero de telephone obsolete : vous devez proceder a la rectification sans delai. Ce droit s'etend aussi au droit de completer des donnees incompletes par une declaration complementaire.", color: "#f59e0b" },
            { num: "03", title: "Droit a l'effacement (article 17)", desc: "Aussi appele droit a l'oubli, il permet a la personne de demander la suppression de ses donnees dans certains cas : les donnees ne sont plus necessaires, le consentement est retire, la personne s'oppose au traitement, les donnees ont ete traitees illicitement. Attention : ce droit n'est pas absolu. Des obligations legales de conservation (comptabilite, fiscal) peuvent justifier un refus partiel.", color: "#ef4444" },
            { num: "04", title: "Droit a la portabilite (article 20)", desc: "La personne peut recevoir ses donnees dans un format structure, couramment utilise et lisible par machine (CSV, JSON, XML). Elle peut aussi demander le transfert direct de ses donnees a un autre responsable de traitement, lorsque c'est techniquement possible. Ce droit ne s'applique qu'aux donnees fournies par la personne et traitees sur la base du consentement ou d'un contrat.", color: "#8b5cf6" },
            { num: "05", title: "Droit d'opposition (article 21)", desc: "La personne peut s'opposer a tout moment au traitement de ses donnees pour des motifs lies a sa situation particuliere. Pour la prospection commerciale (emailing, SMS marketing), l'opposition est un droit absolu : vous devez cesser le traitement immediatement, sans condition. Pour les autres traitements, vous pouvez invoquer des motifs legitimes et imperieux pour poursuivre le traitement.", color: "#f97316" },
            { num: "06", title: "Droit a la limitation (article 18)", desc: "La personne peut demander le gel temporaire du traitement de ses donnees dans quatre cas : elle conteste l'exactitude des donnees, le traitement est illicite mais elle refuse l'effacement, vous n'avez plus besoin des donnees mais elle en a besoin pour un recours juridique, ou elle a exerce son droit d'opposition et vous verifiez si vos motifs legitimes prevalent. Les donnees sont alors conservees mais ne peuvent plus etre utilisees.", color: "#6B7C93" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", margin: "24px 0", padding: "24px", background: `${m.color}06`, borderRadius: "8px", border: `1px solid ${m.color}18` }}>
              <div style={{ fontSize: "32px", fontWeight: 900, color: m.color, lineHeight: 1, flexShrink: 0, minWidth: "48px" }}>{m.num}</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: V, marginBottom: "8px" }}>{m.title}</div>
                <P style={{ margin: 0 }}>{m.desc}</P>
              </div>
            </div>
          ))}
        </Section>

        {/* Section 2 — Delais et obligations */}
        <Section>
          <H2 id="sec-delais">Delais et obligations : ce que dit la loi</H2>
          <P>
            Le RGPD fixe un cadre strict pour le traitement des demandes d'exercice de droits. Chaque entreprise, quelle que soit sa taille, doit respecter ces regles sous peine de sanctions. Voici les cinq regles essentielles a connaitre et a appliquer dans votre organisation.
          </P>

          {[
            { title: "30 jours calendaires", desc: "Le delai de reponse est de 30 jours calendaires a compter de la reception de la demande. Ce delai peut etre prolonge de deux mois supplementaires si la demande est particulierement complexe ou si vous recevez un grand nombre de demandes simultanees. Dans ce cas, vous devez informer le demandeur de cette prolongation dans le delai initial de 30 jours, en expliquant les motifs du retard.", icon: "&#9200;" },
            { title: "Gratuite du traitement", desc: "Le traitement de la demande est en principe gratuit. Vous ne pouvez facturer de frais que dans deux cas : la demande est manifestement infondee ou excessive (par sa repetition par exemple), ou la personne demande des copies supplementaires dans le cadre du droit d'acces. Dans ces cas, vous pouvez demander un montant raisonnable base sur les couts administratifs.", icon: "&#8364;" },
            { title: "Verification d'identite obligatoire", desc: "Avant de repondre a une demande, vous devez verifier l'identite du demandeur. Ne communiquez jamais des donnees personnelles a une personne non identifiee. La verification doit etre proportionnee : pour un client connecte a son espace, la verification est implicite. Pour une demande par email, vous pouvez demander une copie de piece d'identite. Ne demandez pas plus que necessaire.", icon: "&#128274;" },
            { title: "Notification aux sous-traitants", desc: "Si les donnees concernees sont stockees ou traitees par des sous-traitants (hebergeur, CRM, outil emailing, comptable en ligne), vous devez les notifier de la demande et vous assurer qu'ils procedent aux operations necessaires dans le delai imparti. C'est vous, en tant que responsable de traitement, qui etes garant du respect du delai vis-a-vis du demandeur.", icon: "&#128232;" },
            { title: "Documentation systematique", desc: "Chaque demande doit etre documentee dans un registre dedie : date de reception, identite du demandeur, type de droit exerce, actions entreprises, date de reponse, contenu de la reponse. Cette documentation est votre preuve de conformite en cas de controle CNIL. Elle vous permet aussi de detecter des tendances et d'ameliorer vos processus.", icon: "&#128203;" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "16px", margin: "20px 0", padding: "20px", background: "rgba(255,255,255,0.015)", borderRadius: "8px", border: `1px solid ${VG(0.06)}` }}>
              <div style={{ fontSize: "28px", lineHeight: 1, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: item.icon }} />
              <div>
                <div style={{ fontSize: "17px", fontWeight: 700, color: V, marginBottom: "6px" }}>{item.title}</div>
                <P style={{ margin: 0, fontSize: "15px" }}>{item.desc}</P>
              </div>
            </div>
          ))}

          <Blockquote color={ACCENT}>
            Un seul depassement du delai de 30 jours peut suffire a declencher une plainte CNIL. La rigueur dans le suivi des delais est la cle d'une gestion sereine des demandes DSAR.
          </Blockquote>
        </Section>

        {/* Section 3 — Comment traiter une demande */}
        <Section>
          <H2 id="sec-traiter">Comment traiter une demande en 5 etapes</H2>
          <P>
            Une procedure claire et documentee est essentielle pour repondre aux demandes d'exercice de droits dans les delais. Voici les cinq etapes a suivre pour chaque demande, quel que soit le type de droit exerce. L'objectif est de standardiser votre processus pour eviter les oublis et les retards.
          </P>

          {[
            { step: "1", title: "Recevoir et accuser reception (24h)", desc: "Des reception d'une demande (email, courrier, formulaire en ligne, oralement), enregistrez-la immediatement dans votre registre des demandes. Notez la date, le canal de reception, l'identite declaree du demandeur et le type de droit exerce. Envoyez un accuse de reception sous 24 heures confirmant la prise en charge de la demande et rappelant le delai de reponse de 30 jours.", color: "#3b82f6" },
            { step: "2", title: "Verifier l'identite du demandeur", desc: "Avant toute action sur les donnees, confirmez l'identite du demandeur. Si la personne est identifiee via un espace client authentifie, la verification est implicite. Sinon, demandez une copie d'une piece d'identite en precisant que vous ne la conserverez que le temps de la verification. Si l'identite ne peut pas etre confirmee, informez le demandeur et demandez des elements complementaires. Le delai de 30 jours est suspendu le temps de la verification.", color: "#8b5cf6" },
            { step: "3", title: "Identifier le type de droit et les donnees concernees", desc: "Analysez la demande pour determiner quel droit est exerce (acces, rectification, effacement, portabilite, opposition, limitation). Identifiez ensuite toutes les donnees de la personne dans vos systemes : CRM, base de donnees, emails, fichiers Excel, sauvegardes, outils tiers. N'oubliez pas les donnees detenues par vos sous-traitants. Etablissez une cartographie complete des donnees concernees.", color: "#f59e0b" },
            { step: "4", title: "Executer la demande", desc: "Procedez aux operations techniques selon le type de droit : extraction et mise en forme des donnees pour un droit d'acces, modification en base pour une rectification, suppression dans tous les systemes pour un effacement, export en format structure pour la portabilite, cessation du traitement pour une opposition, gel des donnees pour une limitation. Assurez-vous que les operations sont effectuees dans tous les systemes, y compris les sauvegardes et les archives.", color: "#06b6d4" },
            { step: "5", title: "Repondre et documenter", desc: "Redigez une reponse formelle au demandeur. Detaillez les actions entreprises, listez les donnees concernees (pour un droit d'acces), confirmez la suppression (pour un effacement), ou joignez le fichier d'export (pour la portabilite). En cas de refus partiel ou total, motivez votre decision et informez la personne de son droit de saisir la CNIL. Archivez l'integralite du dossier dans votre registre des demandes.", color: "#10b981" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", margin: "24px 0", padding: "24px", background: "rgba(255,255,255,0.015)", borderRadius: "12px", border: `1px solid ${VG(0.08)}` }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
                background: `${item.color}15`, border: `2px solid ${item.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", fontWeight: 900, color: item.color,
              }}>{item.step}</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: V, marginBottom: "8px" }}>{item.title}</div>
                <P style={{ margin: 0 }}>{item.desc}</P>
              </div>
            </div>
          ))}
        </Section>

        {/* DSAR Timeline */}
        <DsarTimeline isMobile={isMobile} />

        {/* Section 4 — Cas pratiques */}
        <Section>
          <H2 id="sec-cas">Cas pratiques : 3 scenarios concrets</H2>
          <P>
            La theorie ne suffit pas. Voici trois scenarios reels, frequemment rencontres par les TPE/PME, avec la marche a suivre detaillee pour chacun. Ces cas illustrent les nuances et les pieges a eviter dans le traitement des demandes DSAR.
          </P>

          {/* Cas 1 */}
          <div style={{ margin: "32px 0", padding: "28px", background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#3b82f6" }}>1</div>
              <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#3b82f6", fontWeight: 700 }}>Droit d'acces</span>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: V, margin: "0 0 12px" }}>Un client demande l'acces a ses donnees</h3>
            <P style={{ fontSize: "15px" }}>
              <strong style={{ color: V }}>Scenario :</strong> Un client de votre boutique en ligne vous envoie un email demandant a savoir quelles donnees vous detenez a son sujet et dans quels buts elles sont utilisees.
            </P>
            <P style={{ fontSize: "15px" }}>
              <strong style={{ color: V }}>Marche a suivre :</strong> Verifiez d'abord son identite en croisant l'adresse email avec votre base client. Identifiez ensuite toutes les sources de donnees : fiche client dans votre CRM, historique de commandes, emails echanges, cookies de navigation, donnees de facturation. Compilez ces informations dans un document clair et structure. Indiquez pour chaque categorie de donnees : la finalite du traitement, la base legale, la duree de conservation et les destinataires. Transmettez le tout sous 30 jours par un canal securise (espace client, email chiffre).
            </P>
            <div style={{ padding: "12px 16px", background: "rgba(59,130,246,0.08)", borderRadius: "6px", marginTop: "12px" }}>
              <span style={{ fontSize: "13px", color: "#93c5fd", fontWeight: 600 }}>Point de vigilance :</span>
              <span style={{ fontSize: "13px", color: V3, marginLeft: "8px" }}>Ne transmettez que les donnees de la personne concernee. Si vos fichiers contiennent des donnees de tiers (par exemple dans un historique de conversation), anonymisez-les avant envoi.</span>
            </div>
          </div>

          {/* Cas 2 */}
          <div style={{ margin: "32px 0", padding: "28px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#ef4444" }}>2</div>
              <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#ef4444", fontWeight: 700 }}>Droit a l'effacement</span>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: V, margin: "0 0 12px" }}>Un ex-employe demande la suppression de ses donnees</h3>
            <P style={{ fontSize: "15px" }}>
              <strong style={{ color: V }}>Scenario :</strong> Un ancien salarie, parti depuis 6 mois, vous demande de supprimer toutes les donnees personnelles le concernant de vos systemes.
            </P>
            <P style={{ fontSize: "15px" }}>
              <strong style={{ color: V }}>Marche a suivre :</strong> Ce cas est delicat car des obligations legales de conservation limitent le droit a l'effacement. Les bulletins de paie doivent etre conserves 5 ans, les documents sociaux et fiscaux 5 a 10 ans, et le dossier du personnel au moins 5 ans apres le depart. Vous devez expliquer au demandeur quelles donnees peuvent etre supprimees immediatement (photo, evaluations non obligatoires, donnees de badge) et lesquelles doivent etre conservees avec le fondement legal correspondant. Supprimez ce qui peut l'etre, limitez l'acces aux donnees conservees et documentez l'ensemble.
            </P>
            <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", borderRadius: "6px", marginTop: "12px" }}>
              <span style={{ fontSize: "13px", color: "#fca5a5", fontWeight: 600 }}>Point de vigilance :</span>
              <span style={{ fontSize: "13px", color: V3, marginLeft: "8px" }}>Un refus d'effacement doit toujours etre motive par ecrit en citant l'obligation legale specifique qui justifie la conservation. Ne vous contentez pas d'un refus generique.</span>
            </div>
          </div>

          {/* Cas 3 */}
          <div style={{ margin: "32px 0", padding: "28px", background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#8b5cf6" }}>3</div>
              <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8b5cf6", fontWeight: 700 }}>Droit a la portabilite</span>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: V, margin: "0 0 12px" }}>Un prospect demande la portabilite de ses donnees</h3>
            <P style={{ fontSize: "15px" }}>
              <strong style={{ color: V }}>Scenario :</strong> Un prospect inscrit a votre newsletter depuis 2 ans vous demande de recevoir ses donnees dans un format exploitable pour les transmettre a un concurrent.
            </P>
            <P style={{ fontSize: "15px" }}>
              <strong style={{ color: V }}>Marche a suivre :</strong> Le droit a la portabilite ne s'applique qu'aux donnees fournies par la personne elle-meme et traitees sur la base du consentement ou d'un contrat. Pour un prospect newsletter, les donnees portables incluent : adresse email, nom, preferences d'abonnement, historique des interactions (clics, ouvertures). Exportez ces donnees en format CSV ou JSON, formats lisibles par machine. Si le prospect demande un transfert direct vers un autre prestataire, verifiez la faisabilite technique. Si c'est impossible, transmettez le fichier au prospect qui le transmettra lui-meme.
            </P>
            <div style={{ padding: "12px 16px", background: "rgba(139,92,246,0.08)", borderRadius: "6px", marginTop: "12px" }}>
              <span style={{ fontSize: "13px", color: "#c4b5fd", fontWeight: 600 }}>Point de vigilance :</span>
              <span style={{ fontSize: "13px", color: V3, marginLeft: "8px" }}>Les donnees derivees (scores, segments, analyses) ne sont pas couvertes par le droit a la portabilite. Seules les donnees directement fournies par la personne sont concernees.</span>
            </div>
          </div>
        </Section>

        {/* Section 5 — Outils et solutions */}
        <Section>
          <H2 id="sec-outils">Outils et solutions : pourquoi automatiser la gestion des demandes</H2>
          <P>
            Sans outil dedie, la gestion des demandes DSAR est une source permanente de risques. Un email oublie dans une boite de reception, un delai de 30 jours depasse, une demande traitee sans verification d'identite, une absence de documentation : chaque erreur peut se transformer en plainte CNIL et en sanction.
          </P>
          <P>
            Les risques concrets d'une gestion manuelle sont nombreux : oubli de traiter une demande recue par courrier, confusion entre plusieurs demandes en cours, absence de suivi des delais, impossibilite de prouver la conformite en cas de controle, donnees non supprimees dans certains systemes, reponses incompletes ou tardives.
          </P>

          <Blockquote color="#ef4444">
            En 2025, 35% des sanctions CNIL liees aux droits des personnes concernaient des depassements de delai. La cause principale : l'absence de systeme de suivi centralise.
          </Blockquote>

          <P>
            Vault, developpe par NERVUR, centralise la gestion de toutes les demandes d'exercice de droits dans un tableau de bord unique. Chaque demande est enregistree avec un countdown automatique des 30 jours, des alertes a J+20 et J+25 pour anticiper les deadlines, et un workflow guide etape par etape pour ne rien oublier.
          </P>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", margin: "28px 0" }}>
            {[
              { title: "Enregistrement instantane", desc: "Saisissez une demande en 5 minutes : canal, type de droit, identite du demandeur. Vault calcule automatiquement la deadline." },
              { title: "Countdown et alertes", desc: "Visualisez en temps reel le nombre de jours restants pour chaque demande. Alertes automatiques avant expiration du delai." },
              { title: "Workflow guide", desc: "Suivez les 5 etapes de traitement avec des checklists integrees : verification d'identite, collecte, execution, reponse, archivage." },
              { title: "Registre de conformite", desc: "Generez automatiquement le registre des demandes, exportable en PDF pour les controles CNIL. Historique complet et horodate." },
            ].map((f, i) => (
              <div key={i} style={{ padding: "20px", background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.1)", borderRadius: "10px" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: V, marginBottom: "8px" }}>{f.title}</div>
                <div style={{ fontSize: "14px", color: V3, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <P>
            Vault s'integre avec les autres outils NERVUR pour une protection complete : Sentinel pour la veille e-reputation, et le module RGPD pour le registre des traitements et la politique de confidentialite. Ensemble, ces outils couvrent l'integralite de vos obligations de conformite.
          </P>
        </Section>

        {/* CTA */}
        <Section>
          <div style={{ textAlign: "center", padding: isMobile ? "40px 24px" : "56px 40px", margin: "48px 0", background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(124,58,237,0.04))", borderRadius: "16px", border: "1px solid rgba(139,92,246,0.15)" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Vault par NERVUR</span>
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: V, margin: "16px 0 12px" }}>Gerez vos demandes de droits RGPD sans stress</h3>
            <P style={{ maxWidth: "480px", margin: "0 auto 8px", color: V3 }}>
              Vault centralise chaque demande, calcule les delais, guide vos equipes etape par etape et genere le registre de conformite. Zero oubli, zero depassement.
            </P>
            <P style={{ maxWidth: "480px", margin: "0 auto 28px", color: V3, fontSize: "15px" }}>
              A partir de <span style={{ color: ACCENT, fontWeight: 700 }}>79&#8364;/mois</span> &middot; Sans engagement
            </P>
            <button onClick={() => navigate("/app/login")} style={{
              background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)`, border: "none", color: V,
              padding: "14px 40px", fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "6px",
              boxShadow: "0 4px 24px rgba(139,92,246,0.3)", transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(139,92,246,0.4)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(139,92,246,0.3)"; }}
            >Essayer Vault gratuitement</button>
          </div>
        </Section>

        {/* FAQ */}
        <Section>
          <H2 id="sec-faq">Questions frequentes sur les droits des personnes RGPD</H2>
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
                { title: "Presence digitale : comment les TPE/PME peuvent se demarquer en 2026", path: "/blog/presence-digitale", color: "#f59e0b" },
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
                NERVUR developpe des outils SaaS pour aider les PME francaises a maitriser leur presence digitale et leur conformite juridique. Vault automatise la gestion RGPD : registre des traitements, droits des personnes, politique de confidentialite et veille reglementaire.
              </p>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${VG(0.08)}`, padding: "24px 0", marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ fontSize: "13px", color: V3 }}>
            <span style={{ fontWeight: 600, color: V2 }}>L'equipe NERVUR</span> &middot; 31 mars 2026 &middot; 15 min de lecture
          </div>
          <LogoNervur height={28} onClick={() => navigate("/")} />
        </div>
      </div>
    </div>
  );
}
