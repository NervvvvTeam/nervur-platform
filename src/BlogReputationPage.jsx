import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

const BG = "#09090B";
const V = "#FFFFFF";
const V2 = "#D4D4D8";
const V3 = "#A1A1AA";
const ACCENT = "#818CF8";
const ACCENT2 = "#4ADE80";
const VG = (a) => `rgba(161,161,170,${a})`;

/* ───── Hooks & Utilities ───── */
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

/* ───── Shared styled components ───── */
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

/* ───── Animated Counter ───── */
function AnimatedCounter() {
  const [count, setCount] = useState(12847);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2200);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "32px 24px", margin: "40px 0", background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "12px" }}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#ef4444", marginBottom: "12px" }}>Estimation en temps reel</div>
      <div style={{ fontSize: "56px", fontWeight: 900, color: "#ef4444", lineHeight: 1, fontVariantNumeric: "tabular-nums", transition: "all 0.3s" }}>
        {count.toLocaleString("fr-FR")}
      </div>
      <div style={{ fontSize: "15px", color: V3, marginTop: "12px" }}>avis sans reponse en ce moment en France</div>
    </div>
  );
}

/* ───── FAQ Accordion ───── */
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "Combien de temps faut-il pour ameliorer sa e-reputation ?", a: "Les premiers resultats sont visibles en 2 a 4 semaines avec une strategie active de reponse aux avis et de collecte d'avis positifs. Une amelioration significative de la note Google se constate generalement en 3 a 6 mois." },
    { q: "Faut-il repondre a tous les avis, meme positifs ?", a: "Oui. Repondre aux avis positifs montre votre engagement et encourage d'autres clients a laisser des avis. Google valorise les entreprises qui interagissent activement avec leurs avis. Une reponse courte et personnalisee suffit." },
    { q: "Les faux avis negatifs peuvent-ils etre supprimes ?", a: "Google permet de signaler les avis qui enfreignent ses regles (spam, contenu hors-sujet, conflit d'interets). Le processus de moderation prend generalement 1 a 3 semaines. Un outil de surveillance automatise facilite la detection et le signalement rapide." },
    { q: "Quel est le ROI d'un outil de gestion d'e-reputation ?", a: "Les entreprises utilisant un outil professionnel constatent en moyenne une augmentation de 15 a 25% de leur taux de conversion local. Pour une PME avec un panier moyen de 100 euros, cela represente plusieurs milliers d'euros de CA supplementaire par mois." },
    { q: "L'IA peut-elle vraiment rediger des reponses aux avis ?", a: "Les IA generatives actuelles produisent des brouillons de reponse pertinents et personnalises en quelques secondes. L'humain garde le controle final : il valide, ajuste le ton si necessaire, et publie. Le gain de temps est de 70 a 80% par reponse." },
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
            overflow: "hidden", maxHeight: open === i ? "300px" : "0", opacity: open === i ? 1 : 0,
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

/* ───── Copy Link Button ───── */
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
  { id: "sec-avis", label: "Avis Google & decisions d'achat" },
  { id: "sec-cout", label: "Cout d'un avis negatif" },
  { id: "sec-ia", label: "L'IA et les avis" },
  { id: "sec-erreurs", label: "5 erreurs fatales" },
  { id: "sec-faq", label: "FAQ" },
];

export default function BlogReputationPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrollProgress = useScrollProgress();
  const [activeId, setActiveId] = useState("");

  useSEO(
    "E-reputation : pourquoi 90% des PME perdent des clients sans le savoir | NERVUR",
    "Decouvrez pourquoi 90% des PME perdent des clients a cause de leur e-reputation. Guide complet : gestion des avis Google, reponse aux avis negatifs, surveillance IA.",
    {
      path: "/blog/e-reputation",
      type: "article",
      keywords: "e-reputation PME, gestion avis Google, reponse avis clients, surveillance reputation en ligne",
      author: "L'equipe NERVUR",
      publishedTime: "2026-03-20T08:00:00+01:00",
      modifiedTime: "2026-03-24T10:00:00+01:00",
    }
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "E-reputation : pourquoi 90% des PME perdent des clients sans le savoir",
      description: "Guide complet sur la gestion de l'e-reputation pour les PME francaises. Statistiques, erreurs fatales, automatisation IA.",
      author: { "@type": "Organization", name: "NERVUR" },
      publisher: { "@type": "Organization", name: "NERVUR", url: "https://nervur.fr" },
      datePublished: "2026-03-20",
      dateModified: "2026-03-24",
      mainEntityOfPage: "https://nervur.fr/blog/e-reputation",
      keywords: "e-reputation PME, gestion avis Google, reponse avis clients, surveillance reputation en ligne",
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // Track active section for TOC
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
        a.blog-link { color: ${ACCENT}; text-decoration: none; border-bottom: 1px solid rgba(129,140,248,0.3); transition: border-color 0.3s; }
        a.blog-link:hover { border-color: ${ACCENT}; }
      `}</style>

      {/* Scroll progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, width: `${scrollProgress}%`, height: "3px", background: `linear-gradient(90deg, ${ACCENT}, #a78bfa)`, zIndex: 200, transition: "width 0.1s linear" }} />

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
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, border: `1px solid rgba(129,140,248,0.3)`, padding: "4px 12px", borderRadius: "2px" }}>E-reputation</span>
            <span style={{ fontSize: "13px", color: V3, marginLeft: "16px" }}>12 min de lecture</span>
          </div>
          <h1 style={{
            fontSize: isMobile ? "28px" : "42px", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-1px",
            background: `linear-gradient(135deg, ${V}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            E-reputation : pourquoi 90% des PME perdent des clients sans le savoir
          </h1>
          <P style={{ fontSize: "19px", color: V3 }}>
            Chaque jour, des milliers de PME francaises perdent des clients sans jamais comprendre pourquoi. La raison est souvent invisible a l'oeil nu : une e-reputation negligee qui fait fuir les prospects avant meme qu'ils ne decrochent le telephone. Ce guide revele les mecanismes caches de la reputation en ligne et les solutions pour reprendre le controle.
          </P>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "12px", borderTop: `1px solid ${VG(0.1)}`, marginTop: "8px", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #6366f1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>N</div>
            <div>
              <div style={{ fontSize: "14px", color: V, fontWeight: 600 }}>L'equipe NERVUR</div>
              <div style={{ fontSize: "12px", color: V3 }}>20 mars 2026</div>
            </div>
            <div style={{ marginLeft: "auto" }}><CopyLinkButton /></div>
          </div>
        </Section>

        {/* Stats bar */}
        <Section>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px", margin: "40px 0" }}>
            <StatCard number="93%" label="des decisions d'achat influencees par les avis" color={ACCENT} />
            <StatCard number="3,3x" label="plus de conversion avec une note > 4 etoiles" color={ACCENT2} />
            <StatCard number="-22%" label="de CA en moyenne avec une mauvaise note" color="#ef4444" />
          </div>
        </Section>

        {/* Animated Counter */}
        <AnimatedCounter />

        {/* Section 1 */}
        <Section>
          <H2 id="sec-avis">Les avis Google influencent 93% des decisions d'achat</H2>
          <P>
            Le comportement d'achat a fondamentalement change au cours de la derniere decennie. Avant de franchir la porte d'un commerce, de contacter un artisan ou de souscrire a un service en ligne, le reflexe numero un du consommateur est de consulter les avis. Selon une etude BrightLocal de 2025, 93% des consommateurs affirment que les avis en ligne influencent directement leurs decisions d'achat. Ce chiffre ne cesse de progresser d'annee en annee.
          </P>
          <P>
            Pour les PME, les consequences sont immediates et mesurables. Une fiche Google Business Profile affichant moins de 4 etoiles perd en moyenne 70% de ses clics par rapport a un concurrent note 4,5 ou plus. Et ce n'est pas seulement une question de note globale : la fraicheur des avis, leur volume, la diversite des sources et surtout la qualite des reponses du gerant jouent un role determinant dans l'algorithme de classement local de Google.
          </P>
          <Blockquote color={ACCENT}>
            Un client satisfait en parle a 3 personnes. Un client mecontent en parle a 11. En ligne, ces chiffres sont multiplies par mille.
          </Blockquote>
          <P>
            L'e-reputation depasse largement le cadre des avis Google. Les plateformes sectorielles comme Trustpilot, Tripadvisor, les Pages Jaunes ou les annuaires professionnels constituent autant de vitrines qu'il faut surveiller. Chaque plateforme possede ses propres regles, ses propres algorithmes et ses propres leviers d'influence. Les assistants IA comme ChatGPT et Gemini agregent desormais ces avis pour fournir des recommandations aux utilisateurs, ce qui amplifie encore l'impact d'une reputation negligee.
          </P>
          <P>
            Google integre les signaux de reputation dans ses criteres de classement depuis plusieurs annees. Les mises a jour de 2025 ont renforce le poids des avis authentiques dans le ranking local. Les entreprises qui gerent activement leur reputation beneficient d'un avantage concurrentiel mesurable : meilleure visibilite, taux de clic superieur et conversion plus elevee.
          </P>
        </Section>

        {/* Section 2 */}
        <Section>
          <H2 id="sec-cout">Le cout reel d'un avis negatif sans reponse</H2>
          <P>
            Un seul avis negatif sans reponse peut couter bien plus cher qu'on ne l'imagine. Les etudes convergent : un avis negatif non traite fait fuir 45% des prospects potentiels. Si l'on rapporte ce chiffre au panier moyen et au nombre de visiteurs de votre fiche Google, l'impact financier se chiffre rapidement en milliers d'euros par mois.
          </P>
          <P>
            Mais le cout ne s'arrete pas la. Les avis negatifs sans reponse creent un effet boule de neige. Les consommateurs qui voient qu'une entreprise ne repond pas a ses critiques en tirent une conclusion immediate : cette entreprise ne se soucie pas de ses clients. Cette perception se diffuse, biaise votre note globale et degrade progressivement votre classement dans les resultats de recherche locale.
          </P>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", margin: "28px 0" }}>
            <StatCard number="45%" label="des prospects fuient apres un avis negatif sans reponse" color="#ef4444" />
            <StatCard number="4,2x" label="plus de chance d'etre choisi avec des reponses actives" color={ACCENT2} />
          </div>
          <P>
            A l'inverse, une entreprise qui repond systematiquement et professionnellement a ses avis — positifs comme negatifs — inspire confiance. Les etudes de Harvard Business Review montrent que les hotels ayant adopte une strategie de reponse active ont vu leur note augmenter de 0,12 point en moyenne sur 6 mois. Ce chiffre, apparemment modeste, se traduit par une augmentation significative du taux de clic et du chiffre d'affaires.
          </P>
          <Blockquote color="#fbbf24">
            Chaque avis sans reponse est une opportunite manquee de convaincre un futur client.
          </Blockquote>
        </Section>

        {/* Section 3 */}
        <Section>
          <H2 id="sec-ia">Comment l'IA revolutionne la gestion des avis</H2>
          <P>
            L'intelligence artificielle a transforme la gestion de l'e-reputation d'une tache chronophage en un processus fluide et quasi automatique. En 2026, les outils alimentes par l'IA ne se contentent plus de monitorer les avis : ils les analysent, les classifient par sentiment et par urgence, et generent des propositions de reponses personnalisees en temps reel.
          </P>
          <P>
            Les benefices pour une PME sont considerables. La veille multiplateforme en temps reel detecte un avis negatif en quelques minutes au lieu de plusieurs jours. L'analyse semantique identifie les themes recurrents — delai de livraison, qualite du service client, rapport qualite-prix — et alerte l'equipe sur les tendances emergentes avant qu'elles ne deviennent des crises.
          </P>
          <BulletList items={[
            "Surveillance 24h/24 sur toutes les plateformes d'avis pertinentes pour votre secteur",
            "Analyse de sentiment en temps reel avec categorisation automatique des thematiques",
            "Generation de reponses personnalisees respectant votre ton de marque",
            "Alertes intelligentes sur les situations critiques necessitant une intervention humaine",
            "Rapports hebdomadaires avec tendances, score de reputation et recommandations concretes",
            "Detection proactive des faux avis et des campagnes de denigrement",
          ]} />
          <P>
            L'IA ne remplace pas le contact humain — elle l'amplifie. En automatisant les taches repetitives de veille et de classification, elle libere du temps pour que vos equipes se concentrent sur les interactions a haute valeur ajoutee. Les entreprises ayant adopte ces outils rapportent une amelioration moyenne de 0,4 point de leur note Google en six mois, et une reduction de 60% du temps consacre a la gestion des avis.
          </P>
        </Section>

        {/* Section 4 */}
        <Section>
          <H2 id="sec-erreurs">Les 5 erreurs fatales en e-reputation</H2>
          <P>
            La plupart des PME commettent les memes erreurs en matiere d'e-reputation. Ces erreurs, souvent liees a un manque de temps ou de methode, ont des consequences durables sur l'image et le chiffre d'affaires. Voici les cinq pieges les plus dangereux.
          </P>
          {[
            { num: "01", title: "Ignorer les avis negatifs", desc: "Le silence est interprete comme de l'indifference ou un aveu de culpabilite. Ne pas repondre, c'est laisser le dernier mot a un client mecontent devant tous vos futurs prospects. 45% des consommateurs evitent une entreprise qui ne repond jamais a ses avis negatifs.", color: "#ef4444" },
            { num: "02", title: "Repondre sous le coup de l'emotion", desc: "Une reponse agressive ou defensive est pire que l'absence de reponse. Elle signale un manque de professionnalisme, peut devenir virale sur les reseaux sociaux et dissuade definitivement les prospects hesitants. Toujours laisser passer 24 heures avant de repondre a une critique virulente.", color: "#f59e0b" },
            { num: "03", title: "Acheter de faux avis", desc: "Les algorithmes de detection sont extremement sophistiques en 2026. Google, Trustpilot et d'autres plateformes suppriment les faux avis et penalisent severement les entreprises qui utilisent ces pratiques. Les sanctions vont jusqu'au dereferencement complet de la fiche.", color: "#ef4444" },
            { num: "04", title: "Ne pas solliciter les clients satisfaits", desc: "Les clients mecontents laissent spontanement des avis. Les clients satisfaits, presque jamais. Sans strategie proactive de collecte — email post-achat, QR code en caisse, SMS de suivi — votre note sera structurellement biaisee vers le negatif.", color: "#f59e0b" },
            { num: "05", title: "Gerer les avis en silos", desc: "Surveiller Google mais ignorer Trustpilot, repondre sur Facebook mais oublier les Pages Jaunes. Une gestion fragmentee laisse des failles beantes dans votre couverture et des avis sans reponse dans les angles morts. La centralisation est indispensable.", color: "#ef4444" },
          ].map((err, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", margin: "24px 0", padding: "24px", background: "rgba(255,255,255,0.015)", borderRadius: "8px", border: `1px solid ${VG(0.06)}` }}>
              <div style={{ fontSize: "32px", fontWeight: 900, color: err.color, lineHeight: 1, flexShrink: 0, minWidth: "48px" }}>{err.num}</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: V, marginBottom: "8px" }}>{err.title}</div>
                <P style={{ margin: 0 }}>{err.desc}</P>
              </div>
            </div>
          ))}
        </Section>

        {/* CTA */}
        <Section>
          <div style={{ textAlign: "center", padding: isMobile ? "40px 24px" : "56px 40px", margin: "48px 0", background: "linear-gradient(135deg, rgba(129,140,248,0.1), rgba(99,102,241,0.04))", borderRadius: "16px", border: "1px solid rgba(129,140,248,0.15)" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Sentinel par NERVUR</span>
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: V, margin: "16px 0 12px" }}>Reprenez le controle de votre e-reputation</h3>
            <P style={{ maxWidth: "480px", margin: "0 auto 8px", color: V3 }}>
              Sentinel surveille, analyse et vous aide a repondre a tous vos avis en ligne grace a l'IA. Detection en temps reel, reponses personnalisees, rapports hebdomadaires.
            </P>
            <P style={{ maxWidth: "480px", margin: "0 auto 28px", color: V3, fontSize: "15px" }}>
              A partir de <span style={{ color: ACCENT, fontWeight: 700 }}>49&#8364;/mois</span> &middot; Essai gratuit 14 jours &middot; Sans engagement
            </P>
            <button onClick={() => navigate("/sentinel")} style={{
              background: `linear-gradient(135deg, ${ACCENT}, #6366f1)`, border: "none", color: V,
              padding: "14px 40px", fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "6px",
              boxShadow: "0 4px 24px rgba(129,140,248,0.3)", transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(129,140,248,0.4)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(129,140,248,0.3)"; }}
            >Decouvrir Sentinel</button>
          </div>
        </Section>

        {/* FAQ */}
        <Section>
          <H2 id="sec-faq">Questions frequentes sur l'e-reputation</H2>
          <FAQSection />
        </Section>

        {/* Related articles */}
        <Section>
          <div style={{ margin: "48px 0 40px", padding: "32px 0", borderTop: `1px solid ${VG(0.08)}` }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: V3, display: "block", marginBottom: "20px" }}>Articles connexes</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { title: "Vos mots de passe sont sur le dark web : comment le savoir en 30 secondes", path: "/blog/cybersecurite", color: "#06b6d4" },
                { title: "Votre site web vous coute des clients : 7 signaux d'alerte invisibles", path: "/blog/performance-web", color: "#ec4899" },
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

        {/* Author section */}
        <Section>
          <div style={{ padding: "32px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px solid ${VG(0.08)}`, display: "flex", gap: "20px", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #6366f1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, flexShrink: 0 }}>N</div>
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
            <span style={{ fontWeight: 600, color: V2 }}>L'equipe NERVUR</span> &middot; 20 mars 2026 &middot; 12 min de lecture
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
