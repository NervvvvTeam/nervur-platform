import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

const BG = "#0f1117";
const V = "#FFFFFF";
const V2 = "#D4D4D8";
const V3 = "#A1A1AA";
const ACCENT = "#f59e0b";
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

/* ───── Star Rating Visual ───── */
function StarRatingVisual() {
  const [rating, setRating] = useState(3.2);
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !animated) {
          setAnimated(true);
          let current = 3.2;
          const target = 4.7;
          const interval = setInterval(() => {
            current += 0.05;
            setRating(Math.min(current, target));
            if (current >= target) clearInterval(interval);
          }, 60);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [animated]);

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fill = Math.min(1, Math.max(0, rating - (i - 1)));
    stars.push(
      <div key={i} style={{ position: "relative", width: "36px", height: "36px" }}>
        <span style={{ fontSize: "36px", color: VG(0.15), position: "absolute", top: 0, left: 0 }}>&#9733;</span>
        <div style={{ overflow: "hidden", width: `${fill * 100}%`, position: "absolute", top: 0, left: 0 }}>
          <span style={{ fontSize: "36px", color: ACCENT }}>&#9733;</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ textAlign: "center", padding: "40px 32px", margin: "40px 0", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "12px" }}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, marginBottom: "16px" }}>Evolution de la note Google</div>
      <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "12px" }}>
        {stars}
      </div>
      <div style={{ fontSize: "48px", fontWeight: 900, color: ACCENT, lineHeight: 1, transition: "all 0.3s" }}>
        {rating.toFixed(1)}
      </div>
      <p style={{ fontSize: "14px", color: V3, marginTop: "12px", lineHeight: 1.6 }}>
        Evolution moyenne en 6 mois avec une strategie de gestion active des avis
      </p>
    </div>
  );
}

/* ───── Tips Box ───── */
function TipsBox({ title, tips, color }) {
  return (
    <div style={{ margin: "32px 0", padding: "28px", background: `${color}06`, border: `1px solid ${color}18`, borderRadius: "12px" }}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: color, marginBottom: "16px", fontWeight: 700 }}>{title}</div>
      {tips.map((tip, i) => (
        <div key={i} style={{ display: "flex", gap: "12px", padding: "8px 0" }}>
          <span style={{ color: color, fontWeight: 900, fontSize: "14px", flexShrink: 0, minWidth: "20px" }}>{i + 1}.</span>
          <span style={{ fontSize: "15px", color: V2, lineHeight: 1.7 }}>{tip}</span>
        </div>
      ))}
    </div>
  );
}

/* ───── FAQ Accordion ───── */
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "Peut-on supprimer un avis Google negatif ?", a: "Vous ne pouvez pas supprimer directement un avis, mais vous pouvez le signaler a Google s'il enfreint les regles (spam, contenu hors-sujet, conflit d'interets, propos haineux). La moderation prend 1 a 3 semaines. Si l'avis est authentique mais negatif, la meilleure strategie est d'y repondre professionnellement et de le noyer sous des avis positifs plus recents." },
    { q: "Combien d'avis faut-il pour etre credible ?", a: "Google ne fixe pas de minimum, mais les etudes montrent qu'un minimum de 10 a 15 avis est necessaire pour que les consommateurs considerent la note comme fiable. L'ideal est de viser 50 avis ou plus, avec un flux regulier de nouveaux avis (au moins 2 a 4 par mois) pour maintenir la fraicheur." },
    { q: "Les reponses aux avis influencent-elles le classement Google ?", a: "Oui. Google confirme que la reactivite du proprietaire est un signal de classement pour la recherche locale. Les entreprises qui repondent regulierement a leurs avis beneficient d'un meilleur positionnement dans le Local Pack (les 3 resultats affiches sur la carte). De plus, les reponses augmentent l'engagement et encouragent d'autres clients a laisser des avis." },
    { q: "Est-il legal d'offrir des avantages en echange d'avis ?", a: "C'est un sujet delicat. Les regles de Google interdisent explicitement d'acheter des avis ou d'offrir des incitations en echange d'avis positifs. En revanche, solliciter un avis honnete (sans conditionner le contenu) est tout a fait legal et recommande. Evitez les formulations du type donnez-nous 5 etoiles pour obtenir une reduction." },
    { q: "A quelle frequence faut-il verifier ses avis Google ?", a: "Idealement quotidiennement, ou au minimum 2 a 3 fois par semaine. Le delai de reponse est un facteur cle : repondre dans les 24 heures montre votre reactivite et votre professionnalisme. Un outil de surveillance comme Sentinel envoie des alertes en temps reel a chaque nouvel avis, eliminant le besoin de verification manuelle." },
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
  { id: "sec-importance", label: "Importance des avis" },
  { id: "sec-repondre", label: "Bien repondre aux avis" },
  { id: "sec-obtenir", label: "Obtenir plus d'avis" },
  { id: "sec-negatifs", label: "Gerer les avis negatifs" },
  { id: "sec-faq", label: "FAQ" },
];

export default function BlogAvisGooglePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrollProgress = useScrollProgress();
  const [activeId, setActiveId] = useState("");

  useSEO(
    "Avis Google : comment gerer et ameliorer votre e-reputation en 2026 | NERVUR",
    "Guide complet sur la gestion des avis Google pour les TPE/PME. Comment obtenir plus d'avis, repondre efficacement et ameliorer votre note pour attirer plus de clients.",
    {
      path: "/blog/avis-google",
      type: "article",
      keywords: "avis Google entreprise, gestion avis Google, ameliorer note Google, e-reputation avis clients 2026",
      author: "L'equipe NERVUR",
      publishedTime: "2026-03-25T08:00:00+01:00",
      modifiedTime: "2026-03-28T10:00:00+01:00",
    }
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Avis Google : comment gerer et ameliorer votre e-reputation en 2026",
      description: "Guide complet sur la gestion des avis Google pour les TPE/PME : strategies pour obtenir plus d'avis, repondre efficacement et ameliorer sa note.",
      author: { "@type": "Organization", name: "NERVUR" },
      publisher: { "@type": "Organization", name: "NERVUR", url: "https://nervur.fr" },
      datePublished: "2026-03-25",
      dateModified: "2026-03-28",
      mainEntityOfPage: "https://nervur.fr/blog/avis-google",
      keywords: "avis Google entreprise, gestion avis Google, ameliorer note Google, e-reputation avis clients 2026",
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
      <div style={{ position: "fixed", top: 0, left: 0, width: `${scrollProgress}%`, height: "3px", background: `linear-gradient(90deg, ${ACCENT}, #fbbf24)`, zIndex: 200, transition: "width 0.1s linear" }} />

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
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, border: `1px solid rgba(245,158,11,0.3)`, padding: "4px 12px", borderRadius: "2px" }}>Avis Google</span>
            <span style={{ fontSize: "13px", color: V3, marginLeft: "16px" }}>10 min de lecture</span>
          </div>
          <h1 style={{
            fontSize: isMobile ? "28px" : "42px", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-1px",
            background: `linear-gradient(135deg, ${V}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Avis Google : comment gerer et ameliorer votre e-reputation en 2026
          </h1>
          <P style={{ fontSize: "19px", color: V3 }}>
            Les avis Google sont devenus le premier critere de choix des consommateurs. Avant de franchir la porte d'un commerce, de contacter un artisan ou de reserver un restaurant, le reflexe universel est de consulter les avis en ligne. Pourtant, la majorite des TPE/PME subissent leurs avis au lieu de les transformer en levier de croissance. Ce guide vous donne toutes les cles pour reprendre le controle.
          </P>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "12px", borderTop: `1px solid ${VG(0.1)}`, marginTop: "8px", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #d97706)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>N</div>
            <div>
              <div style={{ fontSize: "14px", color: V, fontWeight: 600 }}>L'equipe NERVUR</div>
              <div style={{ fontSize: "12px", color: V3 }}>25 mars 2026</div>
            </div>
            <div style={{ marginLeft: "auto" }}><CopyLinkButton /></div>
          </div>
        </Section>

        {/* Stats */}
        <Section>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px", margin: "40px 0" }}>
            <StatCard number="93%" label="des consommateurs lisent les avis avant d'acheter" color={ACCENT} />
            <StatCard number="4,2" label="note minimum pour inspirer confiance" color={ACCENT2} />
            <StatCard number="+25%" label="de conversion avec une note superieure a 4,5" color="#818CF8" />
          </div>
        </Section>

        {/* Star Rating Animation */}
        <StarRatingVisual />

        {/* Section 1 */}
        <Section>
          <H2 id="sec-importance">Pourquoi les avis Google sont devenus indispensables</H2>
          <P>
            Les avis Google ne sont plus un simple complement d'information — ils sont devenus le premier filtre de selection des consommateurs. En 2026, 93% des Francais consultent les avis en ligne avant de faire appel a un professionnel local. Ce chiffre atteint 97% chez les 25-45 ans, la tranche d'age au plus fort pouvoir d'achat.
          </P>
          <P>
            L'impact sur le chiffre d'affaires est direct et mesurable. Une entreprise affichant une note de 4,5 etoiles ou plus genere en moyenne 25% de contacts supplementaires par rapport a un concurrent note 3,5. Chaque dixieme de point compte : passer de 4,2 a 4,3 peut suffire a gagner plusieurs positions dans le Local Pack de Google (les trois resultats affiches sur la carte).
          </P>
          <Blockquote color={ACCENT}>
            Vos avis Google sont votre meilleure publicite. Ils travaillent pour vous jour et nuit, gratuitement, et influencent directement vos ventes.
          </Blockquote>
          <P>
            Google utilise les avis comme un signal de classement majeur pour la recherche locale. Le volume d'avis, la note moyenne, la fraicheur des avis recents et surtout l'activite du proprietaire (reponses aux avis) sont autant de facteurs qui influencent votre positionnement. Une fiche Google avec 50 avis recents et des reponses actives sera systematiquement favorisee par rapport a une fiche avec 10 avis anciens et aucune interaction.
          </P>
          <P>
            Les assistants IA comme ChatGPT, Gemini et Copilot agregent desormais les avis Google pour formuler leurs recommandations. Quand un utilisateur demande un bon plombier a Lyon, l'IA s'appuie sur les avis Google pour etablir son classement. Ignorer ses avis, c'est se rendre invisible pour toute une generation de consommateurs qui utilisent l'IA comme moteur de recherche.
          </P>
        </Section>

        {/* Section 2 */}
        <Section>
          <H2 id="sec-repondre">L'art de repondre aux avis : bonnes pratiques</H2>
          <P>
            Repondre aux avis n'est pas une option — c'est une necessite strategique. Google confirme que la reactivite du proprietaire influence le classement local. Mais au-dela du SEO, chaque reponse est une opportunite de marketing : elle s'adresse autant au client qui a laisse l'avis qu'aux centaines de prospects qui la liront ensuite.
          </P>
          <TipsBox title="Repondre aux avis positifs" color={ACCENT2} tips={[
            "Remerciez le client en le mentionnant par son prenom pour personnaliser l'echange",
            "Referencez un detail specifique de son experience pour montrer que vous avez lu attentivement",
            "Mentionnez un produit ou service que le client pourrait apprecier lors d'une prochaine visite",
            "Invitez-le a revenir et a recommander votre etablissement a son entourage",
            "Restez bref et chaleureux — 3 a 5 phrases suffisent pour un avis positif",
          ]} />
          <TipsBox title="Repondre aux avis negatifs" color="#ef4444" tips={[
            "Attendez 24 heures avant de repondre pour eviter toute reaction a chaud",
            "Commencez par remercier le client pour son retour, meme s'il est injuste",
            "Reconnaissez le probleme sans chercher d'excuses ni rejeter la faute",
            "Expliquez concretement les mesures prises pour corriger la situation",
            "Proposez de poursuivre la discussion en prive (telephone ou email) pour resoudre le litige",
          ]} />
          <P>
            La qualite de vos reponses reflete directement le professionnalisme de votre entreprise. Un prospect hesitant qui lit une reponse empathique et constructive a un avis negatif sera rassure. A l'inverse, une reponse agressive ou defensive le fera fuir definitivement. La regle d'or : ecrivez chaque reponse en pensant aux futurs clients qui la liront.
          </P>
        </Section>

        {/* Section 3 */}
        <Section>
          <H2 id="sec-obtenir">Comment obtenir plus d'avis Google (legalement)</H2>
          <P>
            Le principal obstacle a une bonne note Google n'est pas les avis negatifs — c'est le manque d'avis. Les clients mecontents laissent spontanement des avis. Les clients satisfaits, presque jamais. Sans strategie proactive de collecte, votre note sera structurellement biaisee vers le negatif. La bonne nouvelle : il suffit de solliciter pour obtenir des resultats spectaculaires.
          </P>
          <BulletList items={[
            "Envoyez un email ou SMS automatique 24 a 48 heures apres chaque prestation avec un lien direct vers le formulaire d'avis Google",
            "Placez un QR code en caisse, sur vos cartes de visite et sur vos factures renvoyant directement vers votre page d'avis",
            "Demandez verbalement a vos clients satisfaits de laisser un avis — le taux de conversion est de 70% quand la demande est faite en personne",
            "Integrez un lien d'avis Google dans votre signature email et sur votre site web",
            "Utilisez les publications Google Business Profile pour rappeler l'importance des avis et encourager vos abonnes",
            "Ne filtrez jamais les demandes en fonction du niveau de satisfaction attendu — les regles Google interdisent la collecte selective",
          ]} />
          <P>
            Les entreprises qui mettent en place une strategie de collecte systematique obtiennent en moyenne 4 a 6 fois plus d'avis que celles qui laissent faire. Le volume d'avis rassure les consommateurs, renforce votre classement Google et dilue mecaniquement l'impact des avis negatifs occasionnels.
          </P>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", margin: "28px 0" }}>
            <StatCard number="70%" label="des clients laissent un avis quand on leur demande en personne" color={ACCENT2} />
            <StatCard number="4-6x" label="plus d'avis avec une strategie de collecte active" color={ACCENT} />
          </div>
        </Section>

        {/* Section 4 */}
        <Section>
          <H2 id="sec-negatifs">Transformer les avis negatifs en opportunites</H2>
          <P>
            Un avis negatif n'est pas une catastrophe — c'est une opportunite deguisee. Les etudes montrent que les consommateurs font davantage confiance aux entreprises avec une note de 4,2 a 4,5 qu'a celles affichant un 5,0 parfait (qui semble suspect). Quelques avis negatifs, traites avec professionnalisme, renforcent en realite votre credibilite.
          </P>
          <P>
            La cle est de ne jamais laisser un avis negatif sans reponse. Un avis negatif sans reponse fait fuir 45% des prospects. Un avis negatif avec une reponse constructive ne fait fuir que 18% des prospects — et peut meme convaincre certains indecis grace au professionnalisme affiche dans la reponse.
          </P>
          {[
            { num: "01", title: "Ne supprimez pas — repondez", desc: "Tenter de supprimer un avis authentique est contre-productif. Meme si Google accede a votre signalement, le client mecontent reviendra poster un avis encore plus virulent. Repondez avec empathie et professionnalisme — c'est la reponse qui restera dans les memoires, pas l'avis original.", color: ACCENT },
            { num: "02", title: "Identifiez le probleme reel", desc: "Derriere chaque avis negatif se cache un probleme operationnel. Utilisez les avis negatifs comme un outil de diagnostic gratuit. Si plusieurs clients mentionnent les memes points faibles, c'est un signal d'alarme precieux qui vous permet d'ameliorer votre service.", color: "#ef4444" },
            { num: "03", title: "Proposez une resolution concrete", desc: "Les clients veulent etre entendus et voir que leur retour a un impact. Proposez une solution tangible : remplacement, remboursement partiel, invitation a revenir. Dans 30% des cas, un client mecontent qui a obtenu satisfaction met a jour son avis ou en laisse un nouveau plus positif.", color: ACCENT2 },
            { num: "04", title: "Noyez le negatif sous le positif", desc: "La meilleure defense contre les avis negatifs est un flux continu d'avis positifs. Avec une strategie de collecte active, chaque avis negatif sera rapidement entoure de temoignages positifs recents, minimisant son impact visuel et numerique.", color: ACCENT },
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

        {/* CTA */}
        <Section>
          <div style={{ textAlign: "center", padding: isMobile ? "40px 24px" : "56px 40px", margin: "48px 0", background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.04))", borderRadius: "16px", border: "1px solid rgba(245,158,11,0.15)" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Sentinel par NERVUR</span>
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: V, margin: "16px 0 12px" }}>Automatisez la gestion de vos avis Google</h3>
            <P style={{ maxWidth: "480px", margin: "0 auto 8px", color: V3 }}>
              Sentinel surveille tous vos avis en temps reel, genere des reponses personnalisees par IA et vous aide a collecter plus d'avis positifs. Resultat : une meilleure note, plus de clients.
            </P>
            <P style={{ maxWidth: "480px", margin: "0 auto 28px", color: V3, fontSize: "15px" }}>
              A partir de <span style={{ color: ACCENT, fontWeight: 700 }}>39&#8364;/mois</span> &middot; Sans engagement
            </P>
            <button onClick={() => navigate("/contact")} style={{
              background: `linear-gradient(135deg, ${ACCENT}, #d97706)`, border: "none", color: "#0f1117",
              padding: "14px 40px", fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "6px",
              boxShadow: "0 4px 24px rgba(245,158,11,0.3)", transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(245,158,11,0.4)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(245,158,11,0.3)"; }}
            >Contactez-nous</button>
          </div>
        </Section>

        {/* FAQ */}
        <Section>
          <H2 id="sec-faq">Questions frequentes sur les avis Google</H2>
          <FAQSection />
        </Section>

        {/* Related articles */}
        <Section>
          <div style={{ margin: "48px 0 40px", padding: "32px 0", borderTop: `1px solid ${VG(0.08)}` }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: V3, display: "block", marginBottom: "20px" }}>Articles connexes</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { title: "E-reputation : pourquoi 90% des PME perdent des clients sans le savoir", path: "/blog/e-reputation", color: "#818CF8" },
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
                NERVUR conçoit des outils SaaS pour aider les PME francaises a maitriser leur presence digitale : e-reputation avec Sentinel et conformite juridique avec Vault.
              </p>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${VG(0.08)}`, padding: "24px 0", marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ fontSize: "13px", color: V3 }}>
            <span style={{ fontWeight: 600, color: V2 }}>L'equipe NERVUR</span> &middot; 25 mars 2026 &middot; 10 min de lecture
          </div>
          <LogoNervur height={22} onClick={() => navigate("/")} />
        </div>
      </div>
    </div>
  );
}
