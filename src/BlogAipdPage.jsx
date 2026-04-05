import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

const BG = "#FFFFFF";
const V = "#FFFFFF";
const V2 = "#425466";
const V3 = "#6B7C93";
const ACCENT = "#f59e0b";
const ACCENT2 = "#fbbf24";
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

/* ───── AIPD Checker — Interactive Criteria ───── */
function AipdChecker() {
  const [checked, setChecked] = useState({});
  const criteria = [
    { title: "Evaluation ou scoring", desc: "Profilage, notation, prediction de comportement (ex : scoring bancaire, evaluation de performance)" },
    { title: "Decision automatique avec effet juridique", desc: "Traitement automatise produisant des effets juridiques ou affectant significativement les personnes" },
    { title: "Surveillance systematique", desc: "Observation, suivi ou controle des personnes concernees (ex : videoprotection, geolocalisation)" },
    { title: "Donnees sensibles ou hautement personnelles", desc: "Sante, biometrie, opinions politiques, orientation sexuelle, infractions, donnees financieres" },
    { title: "Collecte a grande echelle", desc: "Volume important de donnees ou nombre significatif de personnes concernees" },
    { title: "Croisement ou combinaison de donnees", desc: "Rapprochement de jeux de donnees issus de sources differentes" },
    { title: "Personnes vulnerables", desc: "Enfants, salaries, patients, personnes agees, demandeurs d'asile" },
    { title: "Usage innovant ou nouvelle technologie", desc: "Intelligence artificielle, objets connectes, reconnaissance faciale, blockchain" },
    { title: "Exclusion du benefice d'un droit ou d'un contrat", desc: "Le traitement empeche les personnes d'exercer un droit ou d'acceder a un service" },
  ];
  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));
  const count = Object.values(checked).filter(Boolean).length;

  let resultText = "";
  let resultColor = V3;
  if (count === 0) {
    resultText = "Cochez les criteres applicables a votre traitement";
    resultColor = V3;
  } else if (count === 1) {
    resultText = "AIPD recommandee mais pas obligatoire (1 critere)";
    resultColor = "#f59e0b";
  } else {
    resultText = `AIPD obligatoire (${count} criteres sur 9 — seuil : 2)`;
    resultColor = "#ef4444";
  }

  return (
    <div style={{ margin: "40px 0", padding: "32px", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, fontWeight: 700 }}>Testez votre obligation</span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: resultColor }}>{count}/9</span>
      </div>
      <div style={{ padding: "12px 16px", background: `${resultColor}10`, border: `1px solid ${resultColor}30`, borderRadius: "8px", marginBottom: "24px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: resultColor }}>{resultText}</span>
      </div>
      {criteria.map((item, i) => (
        <div key={i} onClick={() => toggle(i)} style={{
          display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 0", cursor: "pointer",
          borderBottom: i < criteria.length - 1 ? `1px solid ${VG(0.06)}` : "none",
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
            <div style={{ fontSize: "15px", color: checked[i] ? ACCENT : V, fontWeight: 600, transition: "all 0.3s" }}>{item.title}</div>
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
    { q: "Une TPE de 5 salaries doit-elle faire une AIPD ?", a: "Pas systematiquement. L'obligation d'AIPD depend de la nature du traitement, pas de la taille de l'entreprise. Une TPE de 5 salaries qui met en place de la videosurveillance avec reconnaissance faciale, ou qui traite des donnees de sante a grande echelle, devra realiser une AIPD. En revanche, une TPE qui gere un simple fichier clients (nom, email, telephone) n'en aura generalement pas besoin. Le critere determinant est le nombre de criteres du WP248 remplis par le traitement." },
    { q: "Quelle est la difference entre AIPD et PIA ?", a: "Il n'y en a aucune sur le fond. PIA (Privacy Impact Assessment) est le terme anglophone utilise par la CNIL dans son logiciel open source. AIPD (Analyse d'Impact relative a la Protection des Donnees) est le terme officiel francais issu de la traduction du RGPD. DPIA (Data Protection Impact Assessment) est le terme utilise dans la version anglaise du RGPD. Les trois acronymes designent exactement la meme demarche d'evaluation des risques prevue a l'article 35." },
    { q: "Faut-il envoyer l'AIPD a la CNIL ?", a: "Non, l'AIPD n'a pas a etre transmise a la CNIL de maniere systematique. En revanche, vous devez la tenir a disposition en cas de controle. Il existe une exception importante : si apres avoir identifie et mis en place toutes les mesures de reduction des risques, le risque residuel reste eleve, vous devez consulter la CNIL avant de mettre en oeuvre le traitement (article 36 du RGPD). La CNIL dispose alors d'un delai de 8 semaines pour vous repondre." },
    { q: "A quelle frequence revoir l'AIPD ?", a: "Le RGPD impose de reexaminer l'AIPD regulierement, au minimum tous les 3 ans selon les recommandations de la CNIL. Mais une revision s'impose aussi a chaque changement significatif du traitement : modification des finalites, ajout de nouvelles categories de donnees, changement de sous-traitant, evolution technologique, nouvelle interconnexion de systemes, ou suite a un incident de securite." },
    { q: "Que se passe-t-il si je ne fais pas d'AIPD alors que c'est obligatoire ?", a: "L'absence d'AIPD quand elle est requise constitue un manquement au RGPD passible de sanctions. La CNIL peut prononcer une amende administrative pouvant atteindre 10 millions d'euros ou 2% du chiffre d'affaires annuel mondial. En pratique, la CNIL commence generalement par une mise en demeure avec un delai pour se conformer. Toutefois, si le traitement a entraine une violation de donnees, l'absence d'AIPD sera un facteur aggravant dans le calcul de la sanction." },
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
  { id: "sec-definition", label: "Qu'est-ce qu'une AIPD" },
  { id: "sec-obligatoire", label: "Quand est-elle obligatoire" },
  { id: "sec-methodologie", label: "La methodologie CNIL" },
  { id: "sec-etapes", label: "Les 4 etapes" },
  { id: "sec-outils", label: "Outils et solutions" },
  { id: "sec-faq", label: "FAQ" },
];

export default function BlogAipdPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrollProgress = useScrollProgress();
  const [activeId, setActiveId] = useState("");

  useSEO(
    "AIPD RGPD : guide complet de l'analyse d'impact pour les PME 2026 | NERVUR",
    "Quand et comment realiser une AIPD (analyse d'impact). Methodologie CNIL, criteres obligatoires, etapes pratiques. Guide complet pour TPE/PME.",
    {
      path: "/blog/aipd-guide",
      type: "article",
      keywords: "AIPD RGPD, analyse impact protection donnees, AIPD obligatoire, AIPD CNIL methodologie, PIA RGPD PME",
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
      headline: "AIPD RGPD : guide complet de l'analyse d'impact pour les PME 2026",
      description: "Quand et comment realiser une AIPD (analyse d'impact relative a la protection des donnees). Methodologie CNIL, criteres obligatoires, etapes pratiques pour TPE/PME.",
      author: { "@type": "Organization", name: "NERVUR" },
      publisher: { "@type": "Organization", name: "NERVUR", url: "https://nervur.fr" },
      datePublished: "2026-03-31",
      dateModified: "2026-03-31",
      mainEntityOfPage: "https://nervur.fr/blog/aipd-guide",
      keywords: "AIPD RGPD, analyse impact protection donnees, AIPD obligatoire, AIPD CNIL methodologie, PIA RGPD PME",
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
        a.blog-link { color: ${ACCENT}; text-decoration: none; border-bottom: 1px solid rgba(245,158,11,0.3); transition: border-color 0.3s; }
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
      <div style={{ position: "fixed", top: 0, left: 0, width: `${scrollProgress}%`, height: "3px", background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, zIndex: 200, transition: "width 0.1s linear" }} />

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
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, border: `1px solid rgba(245,158,11,0.3)`, padding: "4px 12px", borderRadius: "2px" }}>AIPD</span>
            <span style={{ fontSize: "13px", color: V3, marginLeft: "16px" }}>15 min de lecture</span>
          </div>
          <h1 style={{
            fontSize: isMobile ? "28px" : "42px", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-1px",
            background: `linear-gradient(135deg, ${V}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            AIPD : guide complet de l'analyse d'impact pour les PME en 2026
          </h1>
          <P style={{ fontSize: "19px", color: V3 }}>
            L'Analyse d'Impact relative a la Protection des Donnees (AIPD) est l'un des mecanismes les plus importants du RGPD. Prevue a l'article 35, elle oblige les organisations a evaluer les risques de leurs traitements de donnees avant leur mise en oeuvre. Pour les TPE/PME, comprendre quand et comment realiser une AIPD est essentiel pour eviter les sanctions et proteger les donnees de vos clients. Ce guide detaille la methodologie CNIL, les criteres d'obligation et les etapes pratiques pour mener votre analyse d'impact.
          </P>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "12px", borderTop: `1px solid ${VG(0.1)}`, marginTop: "8px", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #d97706)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>N</div>
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
            <StatCard number="Art. 35" label="du RGPD — obligation legale" color={ACCENT} />
            <StatCard number="9" label="criteres de la CNIL pour determiner l'obligation" color="#06b6d4" />
            <StatCard number="72h" label="pour notifier une violation de donnees" color="#ef4444" />
            <StatCard number="15 min" label="pour generer votre AIPD avec Vault" color="#10b981" />
          </div>
        </Section>

        {/* Section 1 — Definition */}
        <Section>
          <H2 id="sec-definition">Qu'est-ce qu'une AIPD ?</H2>
          <P>
            L'AIPD — Analyse d'Impact relative a la Protection des Donnees — est une demarche d'evaluation prevue par l'article 35 du Reglement General sur la Protection des Donnees (RGPD). Son objectif est d'identifier et de minimiser les risques qu'un traitement de donnees personnelles fait peser sur les droits et libertes des personnes concernees.
          </P>
          <P>
            Contrairement a un simple audit de conformite qui verifie le respect des regles en place, l'AIPD va plus loin. Elle exige une analyse prospective et methodique des risques potentiels : qu'adviendrait-il si les donnees etaient divulguees, alterees ou rendues inaccessibles ? Quelles consequences pour les personnes dont les donnees sont traitees ? L'AIPD est un outil de prevention, pas seulement de constat.
          </P>
          <Blockquote color={ACCENT}>
            L'AIPD n'est pas un document administratif de plus. C'est un processus d'analyse qui vous oblige a penser les risques avant de les creer — et a documenter les mesures que vous prenez pour les reduire.
          </Blockquote>
          <P>
            En pratique, l'AIPD produit un document structure qui decrit le traitement envisage, evalue sa necessite et sa proportionnalite, identifie les risques pour les personnes, et detaille les mesures de securite mises en place pour ramener ces risques a un niveau acceptable. Ce document doit etre conserve et mis a jour regulierement — il sera demande en cas de controle de la CNIL.
          </P>
          <P>
            Le terme PIA (Privacy Impact Assessment) est souvent utilise comme synonyme. C'est le terme anglophone adopte par la CNIL pour son outil logiciel open source. DPIA (Data Protection Impact Assessment) est le terme de la version anglaise du RGPD. Les trois designent exactement la meme demarche.
          </P>
        </Section>

        {/* Section 2 — Quand est-elle obligatoire */}
        <Section>
          <H2 id="sec-obligatoire">Quand l'AIPD est-elle obligatoire ?</H2>
          <P>
            L'article 35 du RGPD indique qu'une AIPD est requise lorsqu'un traitement est "susceptible d'engendrer un risque eleve pour les droits et libertes des personnes physiques". Mais comment determiner concretement si votre traitement presente un tel risque ? Le Groupe de travail Article 29 (WP29, devenu le CEPD) a publie des lignes directrices (WP248) qui definissent 9 criteres precis.
          </P>
          <P>
            La regle est simple : si votre traitement remplit au moins 2 de ces 9 criteres, la realisation d'une AIPD est obligatoire. Si un seul critere est rempli, l'AIPD est recommandee mais pas imposee. Ces criteres ont ete repris et precises par la CNIL dans sa liste des traitements soumis a AIPD obligatoire.
          </P>
          <P style={{ fontWeight: 600, color: V }}>
            Les 9 criteres du WP248 :
          </P>

          {[
            { num: "01", title: "Evaluation ou scoring", desc: "Tout traitement qui implique du profilage, de la notation ou de la prediction de comportement. Exemples : scoring de credit, evaluation de la performance des salaries, notation des eleves, algorithme de recommandation personnalisee.", color: ACCENT },
            { num: "02", title: "Decision automatique avec effet juridique", desc: "Traitement qui produit des effets juridiques ou affecte significativement les personnes sans intervention humaine. Exemples : refus automatique de credit, tri automatise de candidatures, exclusion automatique d'un service.", color: "#06b6d4" },
            { num: "03", title: "Surveillance systematique", desc: "Observation, suivi ou controle continu des personnes concernees. Exemples : videosurveillance, geolocalisation des vehicules de flotte, suivi des horaires par badge, monitoring des emails professionnels.", color: ACCENT2 },
            { num: "04", title: "Donnees sensibles ou hautement personnelles", desc: "Traitement de donnees revelant l'origine raciale, les opinions politiques, les convictions religieuses, l'appartenance syndicale, la sante, la vie sexuelle, les donnees biometriques ou genetiques. Egalement les donnees financieres, de localisation precise ou les communications electroniques.", color: "#ef4444" },
            { num: "05", title: "Collecte a grande echelle", desc: "Volume important de donnees ou nombre significatif de personnes concernees (en valeur absolue ou en proportion de la population). La CNIL ne fixe pas de seuil chiffre — l'appreciation se fait au cas par cas selon le contexte.", color: "#10b981" },
            { num: "06", title: "Croisement ou combinaison de donnees", desc: "Rapprochement de jeux de donnees issus de sources ou de traitements differents, d'une maniere qui depasse les attentes raisonnables des personnes. Exemples : enrichissement de fichier client avec des donnees issues des reseaux sociaux.", color: "#8b5cf6" },
            { num: "07", title: "Personnes vulnerables", desc: "Le traitement concerne des personnes en situation de dependance ou d'asymetrie de pouvoir : salaries, enfants, patients, personnes agees, demandeurs d'asile, personnes en situation de handicap. Le desequilibre rend plus difficile l'expression d'un consentement libre.", color: ACCENT },
            { num: "08", title: "Usage innovant ou nouvelle technologie", desc: "Utilisation d'une technologie emergente dont les consequences sur la vie privee ne sont pas encore pleinement evaluees : intelligence artificielle, reconnaissance faciale, objets connectes (IoT), blockchain, traitement de donnees biometriques par de nouveaux procedes.", color: "#06b6d4" },
            { num: "09", title: "Exclusion du benefice d'un droit ou contrat", desc: "Le traitement peut empecher les personnes d'exercer un droit, d'acceder a un service ou de beneficier d'un contrat. Exemples : refus d'ouverture de compte bancaire, exclusion d'une assurance, blocage d'acces a un service public.", color: "#ef4444" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", margin: "24px 0", padding: "24px", background: "rgba(255,255,255,0.015)", borderRadius: "8px", border: `1px solid ${VG(0.06)}` }}>
              <div style={{ fontSize: "32px", fontWeight: 900, color: m.color, lineHeight: 1, flexShrink: 0, minWidth: "48px" }}>{m.num}</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: V, marginBottom: "8px" }}>{m.title}</div>
                <P style={{ margin: 0 }}>{m.desc}</P>
              </div>
            </div>
          ))}

          <P style={{ marginTop: "32px" }}>
            En complement, la CNIL a publie une liste de 14 types de traitements pour lesquels une AIPD est systematiquement obligatoire en France, independamment du nombre de criteres : traitements de donnees de sante a grande echelle, profilage faisant grief, surveillance constante de l'activite des salaries, etc.
          </P>
        </Section>

        {/* Interactive AIPD Checker */}
        <AipdChecker />

        {/* Section 3 — Methodologie CNIL */}
        <Section>
          <H2 id="sec-methodologie">La methodologie PIA de la CNIL</H2>
          <P>
            La CNIL a developpe une methodologie structuree pour conduire les AIPD, documentee dans ses guides PIA (Privacy Impact Assessment). Cette methodologie repose sur 4 principes fondamentaux qui garantissent une analyse rigoureuse et complete. Elle est reconnue comme reference au niveau europeen.
          </P>

          {[
            { num: "1", title: "Description du traitement et de ses finalites", desc: "Identifiez avec precision le traitement : quelles donnees sont collectees, aupres de qui, dans quel but, par quels moyens, pendant combien de temps, et qui y a acces. Cette cartographie exhaustive est le socle de toute l'analyse. Plus la description est precise, plus l'evaluation des risques sera pertinente. Incluez les flux de donnees, les interconnexions avec d'autres systemes et les transferts eventuels hors UE.", color: ACCENT },
            { num: "2", title: "Evaluation de la necessite et de la proportionnalite", desc: "Verifiez que le traitement est necessaire et proportionnel a l'objectif poursuivi. La base legale est-elle valide ? Les donnees collectees sont-elles minimisees ? La duree de conservation est-elle justifiee ? Les personnes sont-elles correctement informees ? Peuvent-elles exercer leurs droits ? Cette etape permet de verifier la conformite aux principes fondamentaux du RGPD (articles 5 et 6).", color: "#06b6d4" },
            { num: "3", title: "Evaluation des risques pour les droits et libertes", desc: "Identifiez les evenements redoutes (acces illegitime, modification non souhaitee, disparition des donnees) et evaluez leur gravite et leur vraisemblance. La gravite se mesure par l'impact sur les personnes : prejudice financier, atteinte a la reputation, discrimination, perte de controle sur ses donnees. La vraisemblance depend des menaces, des vulnerabilites et des mesures de securite existantes.", color: ACCENT2 },
            { num: "4", title: "Mesures pour traiter les risques identifies", desc: "Definissez les mesures organisationnelles et techniques pour reduire chaque risque a un niveau acceptable : chiffrement, pseudonymisation, controle d'acces, journalisation, formation du personnel, clauses contractuelles avec les sous-traitants. Evaluez ensuite les risques residuels apres application de ces mesures. Si le risque residuel reste eleve, consultez la CNIL avant de mettre en oeuvre le traitement.", color: "#10b981" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", margin: "24px 0", padding: "28px", background: `${m.color}06`, borderRadius: "12px", border: `1px solid ${m.color}18` }}>
              <div style={{ fontSize: "36px", fontWeight: 900, color: m.color, lineHeight: 1, flexShrink: 0, minWidth: "40px" }}>{m.num}</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: V, marginBottom: "10px" }}>{m.title}</div>
                <P style={{ margin: 0 }}>{m.desc}</P>
              </div>
            </div>
          ))}

          <Blockquote color="#06b6d4">
            La CNIL met a disposition un logiciel open source gratuit (PIA) pour guider la realisation des AIPD. Cependant, cet outil reste technique et chronophage pour les TPE/PME qui n'ont pas de DPO dedie.
          </Blockquote>
        </Section>

        {/* Section 4 — Les 4 etapes pratiques */}
        <Section>
          <H2 id="sec-etapes">Les 4 etapes pratiques pour realiser votre AIPD</H2>
          <P>
            Voici un guide operationnel pour mener votre AIPD de maniere pragmatique, meme sans expertise juridique prealable. Chaque etape est detaillee avec des questions concretes a vous poser et des exemples adaptes aux TPE/PME.
          </P>

          <div style={{ margin: "32px 0" }}>
            <div style={{ padding: "28px", background: "rgba(245,158,11,0.04)", border: `1px solid rgba(245,158,11,0.15)`, borderRadius: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #d97706)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 900, color: BG, flexShrink: 0 }}>1</div>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: V, marginBottom: "12px" }}>Decrire le contexte du traitement</div>
                  <P style={{ margin: "0 0 12px" }}>
                    Repondez de maniere exhaustive aux questions suivantes : Qui est le responsable du traitement ? Quelles sont les finalites (pourquoi ces donnees sont collectees) ? Quelles categories de donnees sont concernees ? Aupres de qui sont-elles collectees ? Combien de personnes sont concernees ? Qui a acces aux donnees en interne et en externe ? Comment sont-elles stockees et transferees ? Quelle est la duree de conservation prevue ?
                  </P>
                  <P style={{ margin: 0 }}>
                    Concretement, pour un site e-commerce : vous collectez nom, adresse, email, telephone, historique d'achats et donnees de paiement aupres de vos clients. Les donnees sont stockees chez votre hebergeur, partagees avec votre prestataire de paiement et votre transporteur. La duree de conservation est de 3 ans apres le dernier achat pour les donnees commerciales, 10 ans pour les factures.
                  </P>
                </div>
              </div>
            </div>

            <div style={{ padding: "28px", background: "rgba(6,182,212,0.04)", border: `1px solid rgba(6,182,212,0.15)`, borderRadius: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `linear-gradient(135deg, #06b6d4, #0891b2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 900, color: BG, flexShrink: 0 }}>2</div>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: V, marginBottom: "12px" }}>Evaluer la necessite et la proportionnalite</div>
                  <P style={{ margin: "0 0 12px" }}>
                    Verifiez que votre traitement respecte les principes fondamentaux du RGPD. La base legale est-elle identifiee et valide (consentement, contrat, obligation legale, interet legitime) ? Les donnees collectees sont-elles toutes strictement necessaires a la finalite declaree (principe de minimisation) ? La duree de conservation est-elle proportionnee ?
                  </P>
                  <P style={{ margin: 0 }}>
                    Les personnes sont-elles informees de maniere transparente ? Peuvent-elles exercer leurs droits (acces, rectification, effacement, portabilite, opposition) ? Les transferts hors UE sont-ils encadres par des garanties appropriees ? Si la base legale est l'interet legitime, avez-vous realise un test de mise en balance ?
                  </P>
                </div>
              </div>
            </div>

            <div style={{ padding: "28px", background: "rgba(251,191,36,0.04)", border: `1px solid rgba(251,191,36,0.15)`, borderRadius: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT2}, ${ACCENT})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 900, color: BG, flexShrink: 0 }}>3</div>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: V, marginBottom: "12px" }}>Identifier et evaluer les risques</div>
                  <P style={{ margin: "0 0 12px" }}>
                    Pour chaque evenement redoute — acces illegitime aux donnees (confidentialite), modification non autorisee (integrite), disparition ou indisponibilite (disponibilite) — evaluez deux dimensions : la gravite de l'impact sur les personnes et la vraisemblance de l'evenement.
                  </P>
                  <P style={{ margin: "0 0 12px" }}>
                    La gravite se mesure sur 4 niveaux : negligeable (desagrement surmontable), limitee (desagrement significatif), importante (consequences serieuses) et maximale (consequences irreversibles). La vraisemblance suit la meme echelle : negligeable, limitee, importante, maximale. Le niveau de risque est le produit gravite x vraisemblance.
                  </P>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "16px" }}>
                    <div style={{ padding: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#ef4444" }}>Confidentialite</div>
                      <div style={{ fontSize: "11px", color: V3, marginTop: "4px" }}>Acces illegitime</div>
                    </div>
                    <div style={{ padding: "16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: ACCENT }}>Integrite</div>
                      <div style={{ fontSize: "11px", color: V3, marginTop: "4px" }}>Modification non desiree</div>
                    </div>
                    <div style={{ padding: "16px", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#06b6d4" }}>Disponibilite</div>
                      <div style={{ fontSize: "11px", color: V3, marginTop: "4px" }}>Disparition des donnees</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "28px", background: "rgba(16,185,129,0.04)", border: `1px solid rgba(16,185,129,0.15)`, borderRadius: "12px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `linear-gradient(135deg, #10b981, #059669)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 900, color: BG, flexShrink: 0 }}>4</div>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: V, marginBottom: "12px" }}>Definir les mesures et evaluer les risques residuels</div>
                  <P style={{ margin: "0 0 12px" }}>
                    Pour chaque risque identifie, definissez des mesures techniques et organisationnelles proportionnees. Mesures techniques : chiffrement des donnees au repos et en transit, pseudonymisation, controle d'acces par role, authentification forte, journalisation des acces, sauvegardes automatisees, tests d'intrusion reguliers.
                  </P>
                  <P style={{ margin: "0 0 12px" }}>
                    Mesures organisationnelles : politique de securite documentee, formation du personnel, procedure de gestion des incidents, clauses contractuelles avec les sous-traitants, limitation des acces au strict necessaire, revue periodique des habilitations.
                  </P>
                  <P style={{ margin: 0 }}>
                    Apres application des mesures, reevaluez chaque risque pour determiner le risque residuel. Si celui-ci reste eleve malgre toutes les mesures envisagees, vous devez consulter la CNIL avant de demarrer le traitement (article 36 RGPD). La CNIL disposera d'un delai de 8 semaines pour vous repondre, prolongeable de 6 semaines supplementaires.
                  </P>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Section 5 — Outils et solutions */}
        <Section>
          <H2 id="sec-outils">Outils et solutions pour realiser votre AIPD</H2>
          <P>
            Plusieurs outils existent pour vous accompagner dans la realisation de votre AIPD. Le logiciel PIA de la CNIL est gratuit et open source, mais il reste complexe pour les non-specialistes et ne propose pas d'automatisation. Les cabinets de conseil proposent un accompagnement sur mesure, mais a des tarifs generalement compris entre 3 000 et 15 000 euros par AIPD — difficilement justifiable pour une TPE.
          </P>
          <P>
            Vault, developpe par NERVUR, automatise l'integralite du processus AIPD avec la methodologie officielle de la CNIL. A partir d'un questionnaire guide adapte a votre secteur d'activite, Vault genere automatiquement la description du traitement, evalue la necessite et la proportionnalite, calcule les niveaux de risques (gravite x vraisemblance), propose des mesures de reduction adaptees, et evalue les risques residuels.
          </P>
          <P>
            Le document final est exporte au format PDF, pret a etre presente en cas de controle de la CNIL. Vault integre egalement un systeme d'alertes pour vous rappeler de revoir votre AIPD a intervalles reguliers ou lors de changements significatifs de votre traitement. Le processus complet prend environ 15 minutes, contre plusieurs jours avec les methodes traditionnelles.
          </P>
          <P>
            Pour les entreprises qui utilisent deja Vault pour leur conformite RGPD globale (registre des traitements, politique de confidentialite, gestion des droits), l'AIPD s'integre naturellement dans le tableau de bord existant. Les informations deja renseignees sont reutilisees, evitant la double saisie et garantissant la coherence entre vos differents documents de conformite.
          </P>
        </Section>

        {/* CTA */}
        <Section>
          <div style={{ textAlign: "center", padding: isMobile ? "40px 24px" : "56px 40px", margin: "48px 0", background: `linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.04))`, borderRadius: "16px", border: "1px solid rgba(245,158,11,0.15)" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Vault par NERVUR</span>
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: V, margin: "16px 0 12px" }}>Generez votre AIPD conforme CNIL en 15 minutes</h3>
            <P style={{ maxWidth: "480px", margin: "0 auto 8px", color: V3 }}>
              Vault automatise la methodologie PIA de la CNIL : description, evaluation des risques, mesures de reduction et export PDF. Concu pour les TPE/PME, sans expertise juridique requise.
            </P>
            <P style={{ maxWidth: "480px", margin: "0 auto 28px", color: V3, fontSize: "15px" }}>
              A partir de <span style={{ color: ACCENT, fontWeight: 700 }}>79&#8364;/mois</span> &middot; Sans engagement
            </P>
            <button onClick={() => navigate("/app/login")} style={{
              background: `linear-gradient(135deg, ${ACCENT}, #d97706)`, border: "none", color: BG,
              padding: "14px 40px", fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "6px",
              boxShadow: "0 4px 24px rgba(245,158,11,0.3)", transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(245,158,11,0.4)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(245,158,11,0.3)"; }}
            >Generer mon AIPD</button>
          </div>
        </Section>

        {/* FAQ */}
        <Section>
          <H2 id="sec-faq">Questions frequentes sur l'AIPD</H2>
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
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #d97706)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, flexShrink: 0 }}>N</div>
            <div>
              <div style={{ fontSize: "16px", color: V, fontWeight: 700 }}>L'equipe NERVUR</div>
              <p style={{ fontSize: "14px", color: V3, lineHeight: 1.6, margin: "4px 0 0" }}>
                NERVUR concoit des outils SaaS pour aider les PME francaises a maitriser leur presence digitale : e-reputation avec Sentinel et conformite juridique avec Vault.
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
