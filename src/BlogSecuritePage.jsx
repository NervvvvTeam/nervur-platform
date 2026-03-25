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

/* ───── Mini Scanner Demo ───── */
function ScannerDemo() {
  const [phase, setPhase] = useState("idle"); // idle, scanning, results
  const [progress, setProgress] = useState(0);
  const [scanLine, setScanLine] = useState(0);

  const startScan = () => {
    setPhase("scanning");
    setProgress(0);
    setScanLine(0);
    const lines = [
      "Connexion aux bases de donnees...",
      "Analyse du dark web...",
      "Verification des fuites recentes...",
      "Croisement avec les bases compromises...",
      "Analyse des mots de passe exposes...",
      "Generation du rapport...",
    ];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(Math.min((step / lines.length) * 100, 100));
      setScanLine(Math.min(step, lines.length - 1));
      if (step >= lines.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("results"), 600);
      }
    }, 800);
  };

  if (phase === "idle") {
    return (
      <div style={{ textAlign: "center", padding: "48px 32px", margin: "40px 0", background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: "12px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, marginBottom: "16px" }}>Demo interactive</div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: V, margin: "0 0 12px" }}>Simulateur de scan dark web</h3>
        <p style={{ fontSize: "15px", color: V3, marginBottom: "24px" }}>Decouvrez comment Vault detecte les fuites en quelques secondes</p>
        <button onClick={startScan} style={{
          background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`, border: "none", color: V,
          padding: "14px 36px", fontSize: "14px", fontWeight: 700, letterSpacing: "1px",
          cursor: "pointer", fontFamily: "inherit", borderRadius: "6px",
          boxShadow: "0 4px 24px rgba(6,182,212,0.3)", transition: "transform 0.2s",
        }}
          onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.target.style.transform = "translateY(0)"}
        >Lancer le scan</button>
      </div>
    );
  }

  if (phase === "scanning") {
    const lines = [
      "Connexion aux bases de donnees...",
      "Analyse du dark web...",
      "Verification des fuites recentes...",
      "Croisement avec les bases compromises...",
      "Analyse des mots de passe exposes...",
      "Generation du rapport...",
    ];
    return (
      <div style={{ padding: "40px 32px", margin: "40px 0", background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: "12px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, marginBottom: "20px" }}>Scan en cours...</div>
        <div style={{ height: "4px", background: "rgba(6,182,212,0.1)", borderRadius: "2px", marginBottom: "20px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, #22d3ee)`, borderRadius: "2px", transition: "width 0.5s ease" }} />
        </div>
        <div style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: 2 }}>
          {lines.slice(0, scanLine + 1).map((line, i) => (
            <div key={i} style={{ color: i === scanLine ? ACCENT : V3, transition: "color 0.3s" }}>
              <span style={{ color: ACCENT2, marginRight: "8px" }}>&gt;</span>{line}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 32px", margin: "40px 0", background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: "12px" }}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#ef4444", marginBottom: "20px" }}>Resultats du scan</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
        <div style={{ textAlign: "center", padding: "16px", background: "rgba(239,68,68,0.08)", borderRadius: "8px" }}>
          <div style={{ fontSize: "32px", fontWeight: 900, color: "#ef4444" }}>3</div>
          <div style={{ fontSize: "11px", color: V3, marginTop: "4px" }}>fuites detectees</div>
        </div>
        <div style={{ textAlign: "center", padding: "16px", background: "rgba(245,158,11,0.08)", borderRadius: "8px" }}>
          <div style={{ fontSize: "32px", fontWeight: 900, color: "#f59e0b" }}>7</div>
          <div style={{ fontSize: "11px", color: V3, marginTop: "4px" }}>mots de passe exposes</div>
        </div>
        <div style={{ textAlign: "center", padding: "16px", background: "rgba(6,182,212,0.08)", borderRadius: "8px" }}>
          <div style={{ fontSize: "32px", fontWeight: 900, color: ACCENT }}>12</div>
          <div style={{ fontSize: "11px", color: V3, marginTop: "4px" }}>emails compromis</div>
        </div>
      </div>
      <p style={{ fontSize: "14px", color: V3, lineHeight: 1.7, marginBottom: "20px" }}>
        Ceci est une simulation. Pour un veritable audit de vos donnees, utilisez Vault.
      </p>
      <button onClick={() => setPhase("idle")} style={{
        background: "none", border: `1px solid ${VG(0.2)}`, color: V3, padding: "10px 20px", fontSize: "13px",
        cursor: "pointer", fontFamily: "inherit", borderRadius: "4px", marginRight: "12px",
      }}>Relancer</button>
    </div>
  );
}

/* ───── Expandable Checklist ───── */
function SecurityChecklist() {
  const [checked, setChecked] = useState({});
  const items = [
    "Activer l'authentification a deux facteurs (2FA) sur tous les comptes critiques",
    "Utiliser un gestionnaire de mots de passe (Bitwarden, 1Password)",
    "Verifier regulierement les fuites via un outil de surveillance",
    "Former les employes aux techniques de phishing",
    "Mettre a jour tous les logiciels et systemes d'exploitation",
    "Chiffrer les donnees sensibles au repos et en transit",
    "Effectuer des sauvegardes regulieres et tester leur restauration",
  ];
  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));
  const count = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ margin: "40px 0", padding: "32px", background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.12)", borderRadius: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Checklist securite</span>
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
    { q: "Comment savoir si mes mots de passe sont sur le dark web ?", a: "Des outils comme Vault scannent en continu les bases de donnees compromises et les forums du dark web pour detecter vos identifiants. Le processus est entierement automatise et les resultats arrivent en quelques secondes. Vous pouvez aussi verifier manuellement sur haveibeenpwned.com pour un premier diagnostic." },
    { q: "Que faire si mes donnees ont fuite ?", a: "Changez immediatement les mots de passe des comptes concernes. Activez l'authentification a deux facteurs partout ou c'est possible. Surveillez vos comptes bancaires pendant les semaines suivantes. Si des donnees clients sont concernees, vous avez l'obligation legale RGPD de notifier la CNIL sous 72 heures." },
    { q: "Les PME sont-elles vraiment ciblees par les hackers ?", a: "Oui, et de plus en plus. 43% des cyberattaques ciblent les PME selon le rapport Verizon DBIR 2025. Les PME sont des cibles privilegiees car elles disposent souvent de moins de protections que les grandes entreprises, tout en detenant des donnees precieuses (clients, fournisseurs, donnees bancaires)." },
    { q: "Quel est le cout moyen d'une fuite de donnees pour une PME ?", a: "Selon IBM Security, le cout moyen d'une violation de donnees pour une PME est d'environ 120 000 euros en France en 2025. Ce montant inclut les frais directs (remediation, notification), les amendes RGPD potentielles, la perte de clients et l'atteinte a la reputation." },
    { q: "La conformite RGPD protege-t-elle contre les fuites ?", a: "La conformite RGPD impose des mesures de protection qui reduisent significativement les risques, mais elle ne garantit pas une protection totale. En revanche, une entreprise non conforme s'expose a des amendes pouvant atteindre 4% de son CA annuel en cas de fuite, en plus des couts directs de l'incident." },
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
  { id: "sec-fuites", label: "Comment les fuites arrivent" },
  { id: "sec-consequences", label: "Consequences pour les PME" },
  { id: "sec-verifier", label: "Verifier vos donnees" },
  { id: "sec-mesures", label: "7 mesures essentielles" },
  { id: "sec-faq", label: "FAQ" },
];

export default function BlogSecuritePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrollProgress = useScrollProgress();
  const [activeId, setActiveId] = useState("");

  useSEO(
    "Vos mots de passe sont sur le dark web : comment le savoir en 30 secondes | NERVUR",
    "En moyenne, chaque employe a 3 mots de passe compromis. Decouvrez comment verifier si vos donnees d'entreprise ont fuite et les mesures pour vous proteger.",
    {
      path: "/blog/cybersecurite",
      type: "article",
      keywords: "fuite donnees entreprise, mot de passe dark web, cybersecurite PME, RGPD conformite",
      author: "L'equipe NERVUR",
      publishedTime: "2026-03-18T08:00:00+01:00",
      modifiedTime: "2026-03-24T10:00:00+01:00",
    }
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Vos mots de passe sont sur le dark web : comment le savoir en 30 secondes",
      description: "Guide cybersecurite PME : detecter les fuites de donnees, proteger ses mots de passe, assurer la conformite RGPD.",
      author: { "@type": "Organization", name: "NERVUR" },
      publisher: { "@type": "Organization", name: "NERVUR", url: "https://nervur.fr" },
      datePublished: "2026-03-18",
      dateModified: "2026-03-24",
      mainEntityOfPage: "https://nervur.fr/blog/cybersecurite",
      keywords: "fuite donnees entreprise, mot de passe dark web, cybersecurite PME, RGPD conformite",
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
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, border: `1px solid rgba(6,182,212,0.3)`, padding: "4px 12px", borderRadius: "2px" }}>Cybersecurite</span>
            <span style={{ fontSize: "13px", color: V3, marginLeft: "16px" }}>14 min de lecture</span>
          </div>
          <h1 style={{
            fontSize: isMobile ? "28px" : "42px", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-1px",
            background: `linear-gradient(135deg, ${V}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Vos mots de passe sont sur le dark web : comment le savoir en 30 secondes
          </h1>
          <P style={{ fontSize: "19px", color: V3 }}>
            En moyenne, chaque employe d'une PME possede 3 mots de passe deja compromis dans des fuites de donnees. Le plus inquietant ? La grande majorite des dirigeants l'ignorent completement. Cet article vous explique comment les fuites se produisent, comment verifier votre exposition et surtout comment vous proteger avant qu'il ne soit trop tard.
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
            <StatCard number="43%" label="des cyberattaques ciblent les PME" color="#ef4444" />
            <StatCard number="120K&#8364;" label="cout moyen d'une fuite pour une PME" color="#f59e0b" />
            <StatCard number="72h" label="delai RGPD pour notifier la CNIL" color={ACCENT} />
          </div>
        </Section>

        {/* Section 1 */}
        <Section>
          <H2 id="sec-fuites">Comment les fuites de donnees arrivent</H2>
          <P>
            Les fuites de donnees ne sont pas reservees aux grandes entreprises. En 2025, le nombre de PME touchees par des violations de donnees a augmente de 38% par rapport a l'annee precedente. Les mecanismes sont souvent plus simples qu'on ne le pense, et c'est precisement ce qui les rend dangereux.
          </P>
          <P>
            Le vecteur numero un reste le phishing : un email qui imite un fournisseur, une banque ou un service connu incite un employe a saisir ses identifiants sur un faux site. En 2025, les attaques de phishing sont devenues extremement sophistiquees grace a l'IA generative, capable de produire des emails indiscernables des vrais, avec un francais parfait et des logos identiques.
          </P>
          <P>
            Le deuxieme vecteur est la reutilisation des mots de passe. Quand un employe utilise le meme mot de passe pour son compte personnel Netflix et pour le CRM de l'entreprise, une fuite chez Netflix compromet automatiquement l'acces au CRM. Les bases de donnees volees circulent sur le dark web et sont utilisees pour des attaques dites de "credential stuffing" — des robots testent automatiquement des millions de combinaisons email/mot de passe sur des centaines de services.
          </P>
          <Blockquote color={ACCENT}>
            81% des violations de donnees impliquent des mots de passe faibles ou reutilises. La premiere vulnerabilite d'une entreprise, c'est l'humain.
          </Blockquote>
          <P>
            Les autres vecteurs incluent les logiciels obsoletes non mis a jour, les appareils personnels non securises utilises pour le travail (BYOD), les acces Wi-Fi publics non proteges et les fournisseurs tiers dont la securite est insuffisante. Une PME peut etre parfaitement protegee en interne et se retrouver compromise via un prestataire.
          </P>
        </Section>

        {/* Section 2 */}
        <Section>
          <H2 id="sec-consequences">Les consequences pour une PME : amendes RGPD et perte de confiance</H2>
          <P>
            Les consequences d'une fuite de donnees pour une PME sont devastatrices et multi-dimensionnelles. L'impact financier immediat — couts de remediation, notification des clients, expertise forensique — n'est souvent que la partie visible de l'iceberg.
          </P>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", margin: "28px 0" }}>
            <StatCard number="4%" label="du CA annuel : amende RGPD maximale" color="#ef4444" />
            <StatCard number="60%" label="des PME ferment dans les 6 mois apres une cyberattaque majeure" color="#f59e0b" />
          </div>
          <P>
            Le RGPD impose des obligations strictes. En cas de fuite de donnees personnelles, l'entreprise doit notifier la CNIL dans un delai de 72 heures et informer individuellement les personnes concernees si le risque est eleve. Le non-respect de ces obligations entraine des amendes pouvant atteindre 20 millions d'euros ou 4% du chiffre d'affaires annuel mondial.
          </P>
          <P>
            Mais c'est souvent la perte de confiance qui fait le plus de degats a long terme. Les clients dont les donnees ont ete compromises perdent confiance en l'entreprise. Selon les etudes, 65% des consommateurs cessent de faire affaire avec une entreprise apres une violation de donnees. Pour une PME dont l'activite repose sur la proximite et la confiance, cet impact peut etre fatal.
          </P>
          <Blockquote color="#ef4444">
            La question n'est pas de savoir si votre entreprise sera ciblee, mais quand. La preparation est la seule defense efficace.
          </Blockquote>
        </Section>

        {/* Scanner Demo */}
        <ScannerDemo />

        {/* Section 3 */}
        <Section>
          <H2 id="sec-verifier">Comment verifier si vos donnees ont fuite</H2>
          <P>
            Verifier votre exposition aux fuites de donnees est la premiere etape indispensable. Plusieurs approches complementaires existent, de la verification manuelle gratuite a la surveillance automatisee permanente.
          </P>
          <P>
            Le site haveibeenpwned.com, cree par le chercheur en securite Troy Hunt, permet de verifier gratuitement si une adresse email apparait dans des fuites connues. C'est un bon point de depart, mais il ne couvre qu'une fraction des fuites existantes et ne surveille pas en temps reel.
          </P>
          <P>
            Pour une protection reellement efficace, les PME ont besoin d'un outil de surveillance continue qui scanne les bases de donnees compromises, les forums du dark web et les paste sites en temps reel. Ces outils alertent immediatement des que des identifiants lies a votre domaine sont detectes, permettant une reaction en minutes au lieu de mois.
          </P>
          <BulletList items={[
            "Verifiez chaque adresse email de l'entreprise sur haveibeenpwned.com",
            "Auditez les mots de passe stockes dans les navigateurs de vos employes",
            "Recherchez votre nom de domaine dans les bases de fuites connues",
            "Mettez en place une surveillance automatisee continue de votre domaine",
            "Testez regulierement la resistance de vos mots de passe a des attaques par dictionnaire",
          ]} />
        </Section>

        {/* Section 4 */}
        <Section>
          <H2 id="sec-mesures">Les 7 mesures de protection essentielles</H2>
          <P>
            La cybersecurite d'une PME repose sur des mesures concretes et applicables immediatement. Voici les sept piliers d'une protection efficace, classes par priorite.
          </P>
          {[
            { num: "01", title: "Authentification a deux facteurs (2FA)", desc: "Activez le 2FA sur tous les comptes critiques : email professionnel, CRM, comptabilite, banque. Privilegiez les applications d'authentification (Google Authenticator, Authy) au SMS, plus vulnerable aux attaques par SIM swapping.", color: ACCENT },
            { num: "02", title: "Gestionnaire de mots de passe", desc: "Deployez un gestionnaire de mots de passe (Bitwarden, 1Password) pour toute l'equipe. Chaque compte doit avoir un mot de passe unique, complexe et genere aleatoirement. Le gestionnaire elimine le besoin de memoriser les mots de passe.", color: ACCENT2 },
            { num: "03", title: "Surveillance des fuites en continu", desc: "Un outil comme Vault scanne en permanence les bases de donnees compromises et le dark web pour detecter vos identifiants. L'alerte immediate permet de changer les mots de passe compromis avant qu'ils ne soient exploites.", color: ACCENT },
            { num: "04", title: "Formation anti-phishing", desc: "Formez regulierement vos employes a reconnaitre les tentatives de phishing. Les simulations de phishing internes sont un excellent outil pedagogique. Un employe averti est la meilleure defense contre l'ingenierie sociale.", color: "#f59e0b" },
            { num: "05", title: "Mises a jour systematiques", desc: "Les logiciels obsoletes sont des portes ouvertes pour les attaquants. Automatisez les mises a jour de tous les systemes d'exploitation, navigateurs et logiciels metier. Les failles zero-day sont patchees en quelques heures par les editeurs.", color: ACCENT },
            { num: "06", title: "Chiffrement des donnees", desc: "Chiffrez les donnees sensibles au repos (disques durs, sauvegardes) et en transit (HTTPS, VPN). En cas de vol physique d'un ordinateur ou d'interception reseau, les donnees restent illisibles sans la cle de dechiffrement.", color: ACCENT2 },
            { num: "07", title: "Plan de reponse aux incidents", desc: "Preparez un plan d'action en cas de fuite : qui prevenir, comment isoler la breche, comment notifier la CNIL et les clients, comment communiquer. Un plan teste et repete regulierement reduit le temps de reaction de 75% en moyenne.", color: "#ef4444" },
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

        {/* Interactive Checklist */}
        <SecurityChecklist />

        {/* CTA */}
        <Section>
          <div style={{ textAlign: "center", padding: isMobile ? "40px 24px" : "56px 40px", margin: "48px 0", background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(8,145,178,0.04))", borderRadius: "16px", border: "1px solid rgba(6,182,212,0.15)" }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT }}>Vault par NERVUR</span>
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: V, margin: "16px 0 12px" }}>Protegez votre entreprise des fuites de donnees</h3>
            <P style={{ maxWidth: "480px", margin: "0 auto 8px", color: V3 }}>
              Vault surveille le dark web en continu, detecte les fuites de donnees liees a votre entreprise et vous guide vers la conformite RGPD. Configuration en 5 minutes.
            </P>
            <P style={{ maxWidth: "480px", margin: "0 auto 28px", color: V3, fontSize: "15px" }}>
              A partir de <span style={{ color: ACCENT, fontWeight: 700 }}>69&#8364;/mois</span> &middot; Essai gratuit 14 jours &middot; Sans engagement
            </P>
            <button onClick={() => navigate("/vault")} style={{
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
          <H2 id="sec-faq">Questions frequentes sur la cybersecurite</H2>
          <FAQSection />
        </Section>

        {/* Related articles */}
        <Section>
          <div style={{ margin: "48px 0 40px", padding: "32px 0", borderTop: `1px solid ${VG(0.08)}` }}>
            <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: V3, display: "block", marginBottom: "20px" }}>Articles connexes</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { title: "E-reputation : pourquoi 90% des PME perdent des clients sans le savoir", path: "/blog/e-reputation", color: "#818CF8" },
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

        {/* Author */}
        <Section>
          <div style={{ padding: "32px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px solid ${VG(0.08)}`, display: "flex", gap: "20px", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, flexShrink: 0 }}>N</div>
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
            <span style={{ fontWeight: 600, color: V2 }}>L'equipe NERVUR</span> &middot; 18 mars 2026 &middot; 14 min de lecture
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
