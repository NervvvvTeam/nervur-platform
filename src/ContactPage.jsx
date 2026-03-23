import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sanitizeInput, validateContactForm } from "./security";
import useSEO from "./useSEO";

const V = "#FFFFFF", V2 = "#D4D4D8", V3 = "#A1A1AA";
const VG = (a) => `rgba(255,255,255,${a})`;
const A1 = "#818CF8", A2 = "#4ADE80", A3 = "#F472B6";

// ═══ CHROME ICON (metallic SVG) ═══
const ChromeIcon = ({ type, size = 24 }) => {
  const gradId = `contact-chrome-${type}`;
  const icons = {
    browser: (
      <>
        <rect x="2" y="2" width="22" height="22" rx="3" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" />
        <line x1="2" y1="8" x2="24" y2="8" stroke={`url(#${gradId})`} strokeWidth="1.5" />
        <circle cx="5.5" cy="5" r="1" fill={`url(#${gradId})`} />
        <circle cx="8.5" cy="5" r="1" fill={`url(#${gradId})`} />
        <circle cx="11.5" cy="5" r="1" fill={`url(#${gradId})`} />
      </>
    ),
    dashboard: (
      <>
        <rect x="3" y="3" width="9" height="9" rx="1" fill={`url(#${gradId})`} />
        <rect x="14" y="3" width="9" height="9" rx="1" fill={`url(#${gradId})`} />
        <rect x="3" y="14" width="9" height="9" rx="1" fill={`url(#${gradId})`} />
        <rect x="14" y="14" width="9" height="9" rx="1" fill={`url(#${gradId})`} />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" />
        <line x1="16" y1="16" x2="22" y2="22" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    gauge: (
      <>
        <path d="M4 18 A9 9 0 1 1 22 18" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="13" y1="17" x2="17" y2="10" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="13" cy="17" r="2" fill={`url(#${gradId})`} />
      </>
    ),
    pen: (
      <>
        <path d="M17 3l4 4L8 20H4v-4L17 3z" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="14" y1="6" x2="18" y2="10" stroke={`url(#${gradId})`} strokeWidth="1.5" />
      </>
    ),
    plus: (
      <>
        <line x1="13" y1="5" x2="13" y2="21" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="5" y1="13" x2="21" y2="13" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    food: (
      <>
        <path d="M6 3v6a3 3 0 003 3h0a3 3 0 003-3V3" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="9" y1="12" x2="9" y2="22" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 3v4c0 2-1 4-3 4" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    cart: (
      <>
        <path d="M3 3h2l3 12h10l3-9H8" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="20" r="1.5" fill={`url(#${gradId})`} />
        <circle cx="18" cy="20" r="1.5" fill={`url(#${gradId})`} />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="8" width="20" height="13" rx="2" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" />
        <path d="M8 8V5a2 2 0 012-2h6a2 2 0 012 2v3" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" />
      </>
    ),
    wrench: (
      <>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a5 5 0 01-7 7l-7.4 7.4a2 2 0 01-2.8-2.8L11 10.5a5 5 0 017-7l-3.3 2.8z" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinejoin="round" />
      </>
    ),
    heart: (
      <>
        <path d="M13 6C13 6 9 2 5.5 5.5S5 13 13 21c8-8 8.5-12.5 4.5-15.5S13 6 13 6z" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinejoin="round" />
      </>
    ),
    building: (
      <>
        <rect x="5" y="3" width="16" height="19" rx="1" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" />
        <rect x="9" y="7" width="3" height="3" fill={`url(#${gradId})`} />
        <rect x="14" y="7" width="3" height="3" fill={`url(#${gradId})`} />
        <rect x="9" y="13" width="3" height="3" fill={`url(#${gradId})`} />
        <rect x="14" y="13" width="3" height="3" fill={`url(#${gradId})`} />
      </>
    ),
    megaphone: (
      <>
        <path d="M19 5L5 9v4l14 4V5z" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="5" y1="13" x2="7" y2="19" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="21" cy="11" r="2" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="40%" stopColor="#a0a0a0" />
          <stop offset="70%" stopColor="#d0d0d0" />
          <stop offset="100%" stopColor="#909090" />
        </linearGradient>
      </defs>
      {icons[type]}
    </svg>
  );
};

const useIsMobile = (bp = 768) => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
};

// ═══ SERVICES DATA ═══
const SERVICES = [
  { id: "site-vitrine", label: "Site Vitrine", chromeIcon: "browser", desc: "Design & développement d'un site moderne, rapide et optimisé." },
  { id: "application", label: "Application Métier", chromeIcon: "dashboard", desc: "Outil digital sur-mesure : dashboard, CRM, plateforme interne." },
  { id: "seo", label: "SEO & Marketing", chromeIcon: "search", desc: "Référencement naturel, contenu, publicité Meta & Google Ads." },
  { id: "optimisation", label: "Optimisation", chromeIcon: "gauge", desc: "Audit technique, Core Web Vitals, refactoring performance." },
  { id: "branding", label: "Branding & Design", chromeIcon: "pen", desc: "Identité visuelle, charte graphique, design system complet." },
  { id: "autre", label: "Autre projet", chromeIcon: "plus", desc: "Un besoin spécifique ? Décrivez-le nous en détail." },
];

const BUDGETS = [
  { id: "< 2k", label: "< 2 000 €" },
  { id: "2k-5k", label: "2 000 — 5 000 €" },
  { id: "5k-10k", label: "5 000 — 10 000 €" },
  { id: "10k+", label: "10 000 € +" },
  { id: "unknown", label: "À définir" },
];

const TIMELINES = [
  { id: "< 1 mois", label: "< 1 mois" },
  { id: "1-3 mois", label: "1 — 3 mois" },
  { id: "3-6 mois", label: "3 — 6 mois" },
  { id: "pas-presse", label: "Pas de deadline" },
];

// ═══ OUTILS MAPPING (for ?outil= pre-fill) ═══
const OUTILS = {
  sentinel: { name: "SENTINEL", price: "79€/mois", desc: "Bouclier e-réputation IA", color: "#ef4444", path: "/sentinel" },
  signal: { name: "SIGNAL", price: "Sur devis", desc: "Veille stratégique & concurrentielle", color: "#4ADE80", path: "/signal" },
  nexus: { name: "NEXUS", price: "Sur devis", desc: "Studio de contenu IA", color: "#4ADE80", path: "/nexus" },
  oracle: { name: "ORACLE", price: "Sur devis", desc: "Stratégie & propositions IA", color: "#a78bfa", path: "/oracle" },
  phantom: { name: "PHANTOM", price: "Sur devis", desc: "Audit UX & performance", color: "#c084fc", path: "/phantom" },
  forge: { name: "FORGE", price: "Sur devis", desc: "Devis & facturation IA", color: "#f59e0b", path: "/forge" },
  leadx: { name: "LEAD-X", price: "Sur devis", desc: "Qualification de prospects IA", color: "#4ADE80", path: "/leadx" },
  vitrine: { name: "VITRINE", price: "Sur devis", desc: "Création de sites vitrines", color: "#FAFAFA", path: "/vitrine" },
  pulse: { name: "PULSE", price: "Sur devis", desc: "Prédiction de churn IA", color: "#f472b6", path: "/pulse" },
};

// ═══ STEP INDICATOR ═══
const StepIndicator = ({ current, total }) => (
  <div role="group" aria-label={`Étape ${current + 1} sur ${total}`} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}
        aria-current={i === current ? "step" : undefined}>
        <div style={{
          width: i <= current ? "32px" : "8px",
          height: "8px",
          background: i <= current ? V : VG(0.15),
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }} />
      </div>
    ))}
    <span style={{ marginLeft: "auto", fontSize: "11px", letterSpacing: "2px", color: V3, fontFamily: "monospace" }}>
      {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </span>
  </div>
);

// ═══ SELECTABLE TAG ═══
const SelectTag = ({ label, selected, onClick, large, icon, chromeIcon, desc }) => (
  <button onClick={onClick} style={{
    padding: large ? "28px 24px" : "12px 24px",
    background: selected ? VG(0.08) : "transparent",
    border: `1px solid ${selected ? V : VG(0.12)}`,
    color: selected ? V : V3,
    fontSize: large ? "15px" : "13px",
    fontWeight: selected ? 700 : 500,
    letterSpacing: large ? "0.5px" : "1px",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    fontFamily: "inherit",
    textAlign: "left",
    position: "relative",
    overflow: "hidden",
    display: large ? "flex" : "inline-flex",
    flexDirection: large ? "column" : "row",
    gap: large ? "8px" : "0",
    width: large ? "100%" : "auto",
  }}
    onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = VG(0.35); e.currentTarget.style.color = V; }}}
    onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = VG(0.12); e.currentTarget.style.color = V3; }}}>
    {/* Accent line */}
    <div style={{
      position: "absolute", top: 0, left: 0, width: "100%", height: "2px",
      background: `linear-gradient(90deg, transparent, ${V}, transparent)`,
      transform: selected ? "scaleX(1)" : "scaleX(0)",
      transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
    }} />
    {large && chromeIcon && (
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "4px" }}>
        <span style={{ opacity: selected ? 0.9 : 0.4, transition: "opacity 0.3s", display: "flex" }}><ChromeIcon type={chromeIcon} size={24} /></span>
        <span style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-0.5px" }}>{label}</span>
      </div>
    )}
    {large && desc && (
      <span style={{ fontSize: "13px", color: selected ? V3 : "#52525B", lineHeight: 1.5, transition: "color 0.3s" }}>{desc}</span>
    )}
    {!large && label}
    {/* Check indicator */}
    {selected && (
      <span style={{
        position: large ? "absolute" : "relative",
        top: large ? "16px" : "auto",
        right: large ? "16px" : "auto",
        marginLeft: large ? 0 : "8px",
        fontSize: "10px", color: V, opacity: 0.6,
      }}>✓</span>
    )}
  </button>
);

// ═══ INPUT FIELD ═══
const FormInput = ({ label, required, ...props }) => {
  const inputId = props.id || `field-${props.name}`;
  return (
  <div>
    <label htmlFor={inputId} style={{
      fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase",
      color: V3, display: "block", marginBottom: "10px", fontWeight: 600,
    }}>
      {label}{required && <span style={{ color: "#EF4444", marginLeft: "4px" }}>*</span>}
    </label>
    <input {...props} id={inputId} style={{
      width: "100%", padding: "16px 18px", background: "rgba(24,24,27,0.5)",
      border: `1px solid ${VG(0.12)}`, color: V, fontSize: "15px",
      outline: "none", transition: "all 0.3s ease",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      boxSizing: "border-box", letterSpacing: "0.3px",
      ...(props.style || {}),
    }}
      onFocus={e => { e.target.style.borderColor = VG(0.4); e.target.style.background = "rgba(24,24,27,0.7)"; }}
      onBlur={e => { e.target.style.borderColor = VG(0.12); e.target.style.background = "rgba(24,24,27,0.5)"; }}
    />
  </div>
  );
};

// ═══ MAIN COMPONENT ═══
export default function ContactPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const outilParam = searchParams.get("outil");
  const outil = outilParam && OUTILS[outilParam.toLowerCase()] ? OUTILS[outilParam.toLowerCase()] : null;

  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [form, setForm] = useState({ nom: "", entreprise: "", email: "", tel: "", url: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState([]);
  const [slideDir, setSlideDir] = useState("next");
  const contentRef = useRef(null);

  useSEO("Contact — Démarrer un projet | NERVÜR", "Contactez NERVÜR pour lancer votre projet digital. Réponse sous 24h. Sites vitrines, applications métiers, SEO et marketing.", { path: "/contact" });

  // Mouse glow
  const glowRef = useRef(null);
  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
      glowRef.current.style.opacity = "1";
    }
  };

  const toggleService = (id) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitized = (name === "nom" || name === "entreprise" || name === "message") ? sanitizeInput(value) : value;
    setForm(prev => ({ ...prev, [name]: sanitized }));
  };

  const goNext = () => {
    setErrors([]);
    // Validate step 0
    if (step === 0 && selectedServices.length === 0) {
      setErrors(["Sélectionnez au moins un service."]);
      return;
    }
    setSlideDir("next");
    setStep(prev => Math.min(prev + 1, 2));
  };

  const goBack = () => {
    setErrors([]);
    setSlideDir("back");
    setStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);

    // Build combined form for validation
    const combined = {
      nom: form.nom,
      email: form.email,
      tel: form.tel,
      sujet: selectedServices[0] || "autre",
      message: form.message || `Services: ${selectedServices.join(", ")}. Budget: ${budget}. Timeline: ${timeline}. Entreprise: ${form.entreprise}. URL: ${form.url}.`,
    };

    const result = validateContactForm(combined, honeypot);

    if (result.isBot) {
      setSent(true);
      return;
    }

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    // Send via Netlify Forms
    const payload = {
      "form-name": "contact",
      ...result.sanitized,
      services: selectedServices.join(", "),
      budget,
      timeline,
      entreprise: sanitizeInput(form.entreprise),
      url: sanitizeInput(form.url),
    };

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(payload).toString(),
    })
      .then(() => setSent(true))
      .catch(() => setSent(true));
  };

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  /* ═══ OUTIL ACTIVATION — Submit handler ═══ */
  const handleOutilSubmit = (e) => {
    e.preventDefault();
    setErrors([]);

    const combined = {
      nom: form.nom,
      email: form.email,
      tel: form.tel,
      sujet: outil ? outil.name : "outil",
      message: form.message || `Demande d'activation ${outil?.name} (${outil?.price}). Entreprise: ${form.entreprise}.`,
    };

    const result = validateContactForm(combined, honeypot);
    if (result.isBot) { setSent(true); return; }
    if (!result.valid) { setErrors(result.errors); return; }

    const payload = {
      "form-name": "contact",
      ...result.sanitized,
      services: outil?.name || "",
      budget: outil?.price || "",
      timeline: "",
      entreprise: sanitizeInput(form.entreprise),
      url: sanitizeInput(form.url),
    };

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(payload).toString(),
    })
      .then(() => setSent(true))
      .catch(() => setSent(true));
  };

  if (sent) {
    return (
      <div onMouseMove={handleMouseMove} style={{
        background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: "48px", textAlign: "center" }} role="main">
        {/* Glow */}
        <div ref={glowRef} style={{
          position: "fixed", left: -100, top: -100, width: "150px", height: "150px",
          borderRadius: "50%", pointerEvents: "none", zIndex: 9999,
          background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)",
          transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s",
          opacity: 0, mixBlendMode: "screen",
        }} />

        <div style={{
          width: "80px", height: "80px", border: `2px solid ${V}`, display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "32px",
          animation: "fadeInUp 0.6s ease both",
        }}>✓</div>
        <h2 style={{
          fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-1.5px",
          marginBottom: "16px", animation: "fadeInUp 0.6s ease 0.15s both",
        }}>
          {outil ? "Demande envoyée !" : "Message envoyé."}
        </h2>
        <p style={{
          fontSize: "16px", color: V3, lineHeight: 1.8, maxWidth: "460px",
          animation: "fadeInUp 0.6s ease 0.3s both",
        }}>
          {outil
            ? <>Votre demande d'activation <strong style={{ color: V }}>{outil.name}</strong> a bien été reçue. Notre équipe vous recontacte sous <strong style={{ color: V }}>24 heures</strong> pour configurer votre compte.</>
            : <>Nous avons bien reçu votre demande. Notre équipe vous recontacte sous <strong style={{ color: V }}>24 heures</strong>.</>
          }
        </p>
        <button onClick={() => navigate(outil ? outil.path : "/")} style={{
          marginTop: "40px", padding: "16px 40px", background: V, color: "#09090B",
          fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
          border: "none", cursor: "pointer", transition: "all 0.3s",
          fontFamily: "inherit", animation: "fadeInUp 0.6s ease 0.45s both",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#E4E4E7"}
          onMouseLeave={e => e.currentTarget.style.background = V}>
          {outil ? `← Retour à ${outil.name}` : "Retour au site →"}
        </button>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  /* ═══ OUTIL ACTIVATION MODE — Simplified form ═══ */
  if (outil) {
    return (
      <div onMouseMove={handleMouseMove} style={{
        background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        minHeight: "100vh", position: "relative" }}>

        <div ref={glowRef} style={{
          position: "fixed", left: -100, top: -100, width: "150px", height: "150px",
          borderRadius: "50%", pointerEvents: "none", zIndex: 9999,
          background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)",
          transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s",
          opacity: 0, mixBlendMode: "screen",
        }} />

        <style>{`
          .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
          .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
          input::placeholder, textarea::placeholder { color: #3F3F46; }
        `}</style>

        {/* NAV */}
        <nav aria-label="Navigation principale" style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)",
          borderBottom: `1px solid ${VG(0.08)}` }}>
          <img src="/logo-nav.png" alt="NERVÜR" onClick={() => navigate("/")}
            style={{ height: isMobile ? "40px" : "70px", width: "auto", filter: "invert(1) brightness(1.15)", objectFit: "contain", mixBlendMode: "screen", cursor: "pointer" }} />
          <button className="nav-btn" aria-label={`Retour à ${outil.name}`} onClick={() => navigate(outil.path)}>
            ← {outil.name}
          </button>
        </nav>

        <main style={{ paddingTop: isMobile ? "90px" : "140px", paddingBottom: "80px", maxWidth: "640px", margin: "0 auto", padding: isMobile ? "90px 20px 60px" : "140px 48px 80px" }}>

          <section aria-label={`Activation ${outil.name}`}>
          {/* Header */}
          <div style={{ marginBottom: "40px", animation: "fadeInUp 0.6s ease both" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 16px",
              border: `1px solid ${outil.color}40`, background: `${outil.color}10`,
              marginBottom: "24px", borderRadius: "4px",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: outil.color }} />
              <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: outil.color, fontWeight: 700 }}>
                ACTIVATION {outil.name}
              </span>
              {outil.price !== "Sur devis" && (
                <span style={{ fontSize: "11px", color: V3, letterSpacing: "1px" }}>— {outil.price}</span>
              )}
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "12px" }}>
              Activez <span style={{ color: outil.color }}>{outil.name}</span>
            </h2>
            <p style={{ fontSize: "16px", color: "#71717A", lineHeight: 1.8 }}>
              {outil.desc}. Remplissez vos coordonnées et notre équipe configure votre compte sous 24h.
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ padding: "16px 20px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", marginBottom: "24px" }}>
              {errors.map((err, i) => (
                <p key={i} style={{ fontSize: "13px", color: "#EF4444", margin: i > 0 ? "6px 0 0" : 0 }}>{err}</p>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleOutilSubmit} autoComplete="off" style={{ animation: "fadeInUp 0.6s ease 0.15s both" }}>
            {/* Honeypot */}
            <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off"
                value={honeypot} onChange={e => setHoneypot(e.target.value)} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                <FormInput label="Nom complet" required name="nom" value={form.nom} onChange={handleChange}
                  placeholder="Jean Dupont" maxLength={100} autoComplete="name" />
                <FormInput label="Entreprise" required name="entreprise" value={form.entreprise} onChange={handleChange}
                  placeholder="Ma société" maxLength={100} autoComplete="organization" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                <FormInput label="Email" required name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="jean@exemple.com" maxLength={254} autoComplete="email" />
                <FormInput label="Téléphone" required name="tel" type="tel" value={form.tel} onChange={handleChange}
                  placeholder="06 XX XX XX XX" maxLength={20} autoComplete="tel" />
              </div>

              <FormInput label="URL de votre site / fiche Google (facultatif)" name="url" value={form.url} onChange={handleChange}
                placeholder="https://www.exemple.com" maxLength={500} autoComplete="url" />

              <div>
                <label htmlFor="outil-message" style={{ fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: V3, display: "block", marginBottom: "10px", fontWeight: 600 }}>
                  Message (facultatif)
                </label>
                <textarea id="outil-message" name="message" value={form.message} onChange={handleChange}
                  placeholder={`Précisez votre besoin (ex: nom de votre fiche Google, nombre d'établissements, attentes particulières...)`}
                  rows={4} maxLength={5000}
                  style={{
                    width: "100%", padding: "16px 18px", background: "rgba(24,24,27,0.5)",
                    border: `1px solid ${VG(0.12)}`, color: V, fontSize: "15px",
                    outline: "none", transition: "all 0.3s ease", resize: "vertical",
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    lineHeight: 1.7, boxSizing: "border-box", letterSpacing: "0.3px",
                  }}
                  onFocus={e => { e.target.style.borderColor = VG(0.4); e.target.style.background = "rgba(24,24,27,0.7)"; }}
                  onBlur={e => { e.target.style.borderColor = VG(0.12); e.target.style.background = "rgba(24,24,27,0.5)"; }}
                />
              </div>

              {/* Recap */}
              <div style={{ padding: "20px 24px", border: `1px solid ${outil.color}30`, background: `${outil.color}08`, borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#52525B", display: "block", marginBottom: "4px" }}>Votre activation</span>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: V }}>{outil.name}</span>
                    <span style={{ fontSize: "13px", color: V3, marginLeft: "8px" }}>{outil.desc}</span>
                  </div>
                  {outil.price !== "Sur devis" && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: V }}>{outil.price}</div>
                      <div style={{ fontSize: "10px", color: "#52525B" }}>Sans engagement</div>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" style={{
                padding: "18px 48px", background: outil.color, color: outil.color === "#fbbf24" || outil.color === "#4ADE80" || outil.color === "#22d3ee" || outil.color === "#f59e0b" ? "#09090B" : V,
                fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                border: "none", cursor: "pointer", transition: "all 0.3s ease",
                fontFamily: "inherit", borderRadius: "6px", width: "100%",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px ${outil.color}40`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                Demander l'activation →
              </button>

              <div style={{ display: "flex", justifyContent: "center", gap: "24px", fontSize: "11px", color: "#52525B" }}>
                <span>✓ Setup offert</span>
                <span>✓ Réponse sous 24h</span>
                <span>✓ Sans engagement</span>
              </div>
            </div>
          </form>
          </section>
        </main>

        <footer style={{
          padding: isMobile ? "24px 20px" : "32px 48px", borderTop: `1px solid ${VG(0.06)}`,
          display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: isMobile ? "12px" : "0",
        }}>
          <img src="/logo-nav.png" alt="NERVÜR" style={{ height: "28px", width: "auto", filter: "invert(1)", objectFit: "contain", mixBlendMode: "screen" }} />
          <span style={{ fontSize: "11px", color: "#3F3F46" }}>© 2026 NERVÜR — Tous droits réservés</span>
        </footer>
      </div>
    );
  }

  return (
    <div onMouseMove={handleMouseMove} style={{
      background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      minHeight: "100vh", position: "relative" }}>

      {/* Glow */}
      <div ref={glowRef} style={{
        position: "fixed", left: -100, top: -100, width: "150px", height: "150px",
        borderRadius: "50%", pointerEvents: "none", zIndex: 9999,
        background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)",
        transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s",
        opacity: 0, mixBlendMode: "screen",
      }} />

      <style>{`
        .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
      `}</style>

      {/* NAV */}
      <nav aria-label="Navigation principale" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${VG(0.08)}` }}>
        <img src="/logo-nav.png" alt="NERVÜR" onClick={() => navigate("/")}
          style={{ height: isMobile ? "40px" : "70px", width: "auto", filter: "invert(1) brightness(1.15)", objectFit: "contain", mixBlendMode: "screen", cursor: "pointer" }} />
        <button className="nav-btn" aria-label="Retour à l'accueil" onClick={() => navigate("/")}>
          ← Accueil
        </button>
      </nav>

      {/* MAIN */}
      <main style={{ paddingTop: isMobile ? "90px" : "140px", paddingBottom: "80px", maxWidth: "900px", margin: "0 auto", padding: isMobile ? "90px 20px 60px" : "140px 48px 80px" }}>

        <section aria-label="Formulaire de contact">
        {/* Header */}
        <div style={{ marginBottom: "16px" }}>
          <span style={{
            fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase",
            color: "#52525B", display: "block", marginBottom: "20px", fontFamily: "monospace",
          }}>
            // Démarrer un projet
          </span>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-2px",
            lineHeight: 1.1, marginBottom: "16px",
          }}>
            {step === 0 && <>De quoi avez-vous <span style={{ color: V }}>besoin</span> ?</>}
            {step === 1 && <>Cadrons votre <span style={{ color: V }}>projet</span>.</>}
            {step === 2 && <>Parlez-nous de <span style={{ color: V }}>vous</span>.</>}
          </h1>
          <p style={{ fontSize: "16px", color: "#52525B", lineHeight: 1.8, maxWidth: "500px" }}>
            {step === 0 && "Sélectionnez un ou plusieurs services qui correspondent à votre besoin."}
            {step === 1 && "Aidez-nous à comprendre l'envergure de votre projet."}
            {step === 2 && "Dernière étape — vos coordonnées pour qu'on vous recontacte."}
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} total={3} />

        {/* Errors */}
        {errors.length > 0 && (
          <div style={{
            padding: "16px 20px", border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.06)", marginBottom: "32px",
          }}>
            {errors.map((err, i) => (
              <p key={i} style={{ fontSize: "13px", color: "#EF4444", margin: i > 0 ? "6px 0 0" : 0 }}>{err}</p>
            ))}
          </div>
        )}

        {/* ════════════ STEP 0 — Service Selection ════════════ */}
        <div ref={contentRef} style={{
          opacity: 1,
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {step === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
              {SERVICES.map(s => (
                <SelectTag
                  key={s.id}
                  label={s.label}
                  chromeIcon={s.chromeIcon}
                  desc={s.desc}
                  large
                  selected={selectedServices.includes(s.id)}
                  onClick={() => toggleService(s.id)}
                />
              ))}
            </div>
          )}

          {/* ════════════ STEP 1 — Budget & Timeline ════════════ */}
          {step === 1 && (
            <div>
              {/* Budget */}
              <div style={{ marginBottom: "48px" }}>
                <h3 style={{
                  fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
                  color: V2, marginBottom: "20px", fontWeight: 700,
                }}>
                  Quel budget envisagez-vous ?
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {BUDGETS.map(b => (
                    <SelectTag
                      key={b.id}
                      label={b.label}
                      selected={budget === b.id}
                      onClick={() => setBudget(b.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div style={{ marginBottom: "48px" }}>
                <h3 style={{
                  fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
                  color: V2, marginBottom: "20px", fontWeight: 700,
                }}>
                  Dans quel délai ?
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {TIMELINES.map(t => (
                    <SelectTag
                      key={t.id}
                      label={t.label}
                      selected={timeline === t.id}
                      onClick={() => setTimeline(t.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Recap */}
              <div style={{
                padding: "24px 28px", border: `1px solid ${VG(0.08)}`, background: "rgba(24,24,27,0.3)",
              }}>
                <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#52525B", display: "block", marginBottom: "12px" }}>
                  Récapitulatif
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedServices.map(id => {
                    const s = SERVICES.find(x => x.id === id);
                    return s ? (
                      <span key={id} style={{
                        fontSize: "11px", letterSpacing: "1px", color: V, padding: "5px 14px",
                        border: `1px solid ${VG(0.2)}`, fontWeight: 600,
                      }}>
                        {s.label}
                      </span>
                    ) : null;
                  })}
                  {budget && (
                    <span style={{
                      fontSize: "11px", letterSpacing: "1px", color: V3, padding: "5px 14px",
                      border: `1px solid ${VG(0.1)}`,
                    }}>
                      {BUDGETS.find(b => b.id === budget)?.label}
                    </span>
                  )}
                  {timeline && (
                    <span style={{
                      fontSize: "11px", letterSpacing: "1px", color: V3, padding: "5px 14px",
                      border: `1px solid ${VG(0.1)}`,
                    }}>
                      {TIMELINES.find(t => t.id === timeline)?.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ STEP 2 — Personal Info ════════════ */}
          {step === 2 && (
            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Honeypot */}
              <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off"
                  value={honeypot} onChange={e => setHoneypot(e.target.value)} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Nom + Entreprise */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                  <FormInput label="Nom complet" required name="nom" value={form.nom} onChange={handleChange}
                    placeholder="Jean Dupont" maxLength={100} autoComplete="name" />
                  <FormInput label="Entreprise" name="entreprise" value={form.entreprise} onChange={handleChange}
                    placeholder="Ma société" maxLength={100} autoComplete="organization" />
                </div>

                {/* Email + Téléphone */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                  <FormInput label="Email" required name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="jean@exemple.com" maxLength={254} autoComplete="email" />
                  <FormInput label="Téléphone" name="tel" type="tel" value={form.tel} onChange={handleChange}
                    placeholder="06 XX XX XX XX" maxLength={20} autoComplete="tel" />
                </div>

                {/* URL site existant */}
                <FormInput label="URL de votre site actuel (facultatif)" name="url" value={form.url} onChange={handleChange}
                  placeholder="https://www.exemple.com" maxLength={500} autoComplete="url" />

                {/* Message */}
                <div>
                  <label htmlFor="project-message" style={{
                    fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase",
                    color: V3, display: "block", marginBottom: "10px", fontWeight: 600,
                  }}>
                    Décrivez votre projet<span style={{ color: "#EF4444", marginLeft: "4px" }}>*</span>
                  </label>
                  <textarea id="project-message" name="message" value={form.message} onChange={handleChange} required
                    placeholder="Vos objectifs, votre cible, vos besoins principaux, vos contraintes éventuelles..."
                    rows={6} maxLength={5000}
                    style={{
                      width: "100%", padding: "16px 18px", background: "rgba(24,24,27,0.5)",
                      border: `1px solid ${VG(0.12)}`, color: V, fontSize: "15px",
                      outline: "none", transition: "all 0.3s ease", resize: "vertical",
                      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      lineHeight: 1.7, boxSizing: "border-box", letterSpacing: "0.3px",
                    }}
                    onFocus={e => { e.target.style.borderColor = VG(0.4); e.target.style.background = "rgba(24,24,27,0.7)"; }}
                    onBlur={e => { e.target.style.borderColor = VG(0.12); e.target.style.background = "rgba(24,24,27,0.5)"; }}
                  />
                </div>

                {/* Recap mini */}
                <div style={{
                  padding: "20px 24px", background: VG(0.02), border: `1px solid ${VG(0.06)}`,
                }}>
                  <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#52525B", display: "block", marginBottom: "10px" }}>
                    Votre sélection
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {selectedServices.map(id => {
                      const s = SERVICES.find(x => x.id === id);
                      return s ? (
                        <span key={id} style={{
                          fontSize: "10px", letterSpacing: "1px", color: V2, padding: "4px 12px",
                          border: `1px solid ${VG(0.12)}`,
                        }}>{s.label}</span>
                      ) : null;
                    })}
                    {budget && <span style={{ fontSize: "10px", color: V3, padding: "4px 12px", border: `1px solid ${VG(0.08)}` }}>{BUDGETS.find(b => b.id === budget)?.label}</span>}
                    {timeline && <span style={{ fontSize: "10px", color: V3, padding: "4px 12px", border: `1px solid ${VG(0.08)}` }}>{TIMELINES.find(t => t.id === timeline)?.label}</span>}
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" style={{
                  padding: "18px 48px", background: V, color: "#09090B",
                  fontSize: "14px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                  border: "none", cursor: "pointer", transition: "all 0.3s ease",
                  fontFamily: "inherit", alignSelf: "flex-start",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#E4E4E7"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = V; e.currentTarget.style.transform = "translateY(0)"; }}>
                  Envoyer ma demande →
                </button>

                <span style={{ fontSize: "11px", color: "#3F3F46" }}>
                  En soumettant ce formulaire, vous acceptez d'être recontacté par notre équipe.
                </span>
              </div>
            </form>
          )}
        </div>

        {/* ════════════ NAVIGATION BUTTONS ════════════ */}
        {step < 2 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px" }}>
            {step > 0 ? (
              <button onClick={goBack} aria-label="Retour à l'étape précédente" style={{
                padding: "14px 32px", background: "transparent",
                border: `1px solid ${VG(0.15)}`, color: V3,
                fontSize: "13px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.4); e.currentTarget.style.color = V; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.15); e.currentTarget.style.color = V3; }}>
                ← Retour
              </button>
            ) : <div />}

            <button onClick={goNext} style={{
              padding: "16px 40px", background: V, color: "#09090B",
              fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
              border: "none", cursor: "pointer", transition: "all 0.3s ease", fontFamily: "inherit",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#E4E4E7"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = V; e.currentTarget.style.transform = "translateY(0)"; }}>
              Continuer →
            </button>
          </div>
        )}

        {step === 2 && step > 0 && (
          <div style={{ marginTop: "24px" }}>
            <button onClick={goBack} aria-label="Retour à l'étape précédente" style={{
              padding: "14px 32px", background: "transparent",
              border: `1px solid ${VG(0.15)}`, color: V3,
              fontSize: "13px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = VG(0.4); e.currentTarget.style.color = V; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = VG(0.15); e.currentTarget.style.color = V3; }}>
              ← Étape précédente
            </button>
          </div>
        )}

        </section>
      </main>

      {/* SIDE INFO — Floating */}
      <aside style={{
        position: "fixed", bottom: "32px", right: isMobile ? "16px" : "32px",
        display: isMobile ? "none" : "flex", flexDirection: "column", gap: "8px",
        zIndex: 50,
      }}>
        <div style={{
          padding: "14px 20px", background: "rgba(9,9,11,0.95)", backdropFilter: "blur(16px)",
          border: `1px solid ${VG(0.08)}`, display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ADE80", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: V3, letterSpacing: "0.5px" }}>
            Réponse sous <strong style={{ color: V }}>24h</strong>
          </span>
        </div>
      </aside>

      {/* FOOTER */}
      <footer style={{
        padding: isMobile ? "24px 20px" : "32px 48px", borderTop: `1px solid ${VG(0.06)}`,
        display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: isMobile ? "12px" : "0",
      }}>
        <img src="/logo-nav.png" alt="NERVÜR" style={{
          height: "28px", width: "auto", filter: "invert(1)", objectFit: "contain", mixBlendMode: "screen",
        }} />
        <span style={{ fontSize: "11px", color: "#3F3F46" }}>© 2026 NERVÜR — Tous droits réservés</span>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { margin: 0; padding: 0; }
        ::selection { background: rgba(255,255,255,0.15); }
        input::placeholder, textarea::placeholder { color: #3F3F46; }
      `}</style>
    </div>
  );
}
