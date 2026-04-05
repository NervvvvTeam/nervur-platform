import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sanitizeInput, validateContactForm } from "./security";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

const useIsMobile = (bp = 768) => {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth <= bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
};

const SUJETS = [
  "Demande d'information",
  "Souscrire à Sentinel (39€/mois)",
  "Souscrire à Vault (79€/mois)",
  "Pack Duo — 2 outils (99€/mois)",
  "Projet de développement web",
  "SEO & Marketing",
  "Autre",
];

const ToolIcon = ({ type, color, size = 18 }) => {
  const icons = {
    sentinel: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    vault: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[type]}</svg>;
};

const TOOLS = [
  { name: "Sentinel", icon: "sentinel", price: "39€/mois", desc: "E-réputation", color: "#ef4444" },
  { name: "Vault", icon: "vault", price: "79€/mois", desc: "Agent Juridique IA", color: "#06b6d4" },
];

const PACKS = [
  { name: "Pack Duo", price: "99\u20AC/mois", desc: "Sentinel + Vault" },
];

export default function ContactPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [form, setForm] = useState({ nom: "", email: "", tel: "", sujet: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useSEO(
    "Contact — NERVÜR | Demande d'information & Devis",
    "Contactez NERVÜR pour vos outils SaaS ou projets web. Réponse sous 24h. Devis gratuit pour Sentinel et Vault.",
    { path: "/contact", keywords: "contact NERVÜR, devis SaaS PME, demande information, outils PME" }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);

    const combined = {
      nom: form.nom,
      email: form.email,
      tel: form.tel,
      sujet: form.sujet || "Demande d'information",
      message: form.message,
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

    const payload = {
      name: result.sanitized.nom,
      email: result.sanitized.email,
      phone: result.sanitized.tel || "",
      subject: result.sanitized.sujet || "Demande d'information",
      message: result.sanitized.message,
    };

    setSubmitting(true);

    fetch(`${import.meta.env.VITE_API_URL || ""}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data.error || "Erreur lors de l'envoi.");
        }
        setSent(true);
      })
      .catch((err) => {
        setErrors([err.message || "Erreur lors de l'envoi du message."]);
      })
      .finally(() => setSubmitting(false));
  };

  // ── Styles ──
  const inputBase = {
    width: "100%",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(0,0,0,0.08)",
    color: "#1D1D1F",
    fontSize: "15px",
    outline: "none",
    borderRadius: "8px",
    transition: "border-color 0.2s, background 0.2s",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    boxSizing: "border-box",
    letterSpacing: "0.2px",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    color: "#86868B",
    display: "block",
    marginBottom: "8px",
  };

  const focusHandlers = {
    onFocus: (e) => {
      e.target.style.borderColor = "#6366f1";
      e.target.style.background = "rgba(24,24,27,0.8)";
    },
    onBlur: (e) => {
      e.target.style.borderColor = "rgba(0,0,0,0.08)";
      e.target.style.background = "rgba(255,255,255,0.8)";
    },
  };

  // ── Sent state ──
  if (sent) {
    return (
      <div style={{
        background: "#F5F5F7", color: "#1D1D1F",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "48px", textAlign: "center",
      }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px", marginBottom: "28px",
        }}>
          ✓
        </div>
        <h2 style={{
          fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800,
          letterSpacing: "-1px", marginBottom: "16px",
        }}>
          Message envoyé !
        </h2>
        <p style={{ fontSize: "16px", color: "#86868B", lineHeight: 1.8, maxWidth: "440px" }}>
          Nous avons bien reçu votre message. Notre équipe vous recontacte sous{" "}
          <strong style={{ color: "#1D1D1F" }}>24 heures</strong>.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "36px", padding: "14px 36px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#1D1D1F", fontSize: "14px", fontWeight: 600,
            border: "none", borderRadius: "8px", cursor: "pointer",
            transition: "opacity 0.2s", fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Retour au site
        </button>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: "#F5F5F7", color: "#1D1D1F",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      minHeight: "100vh", position: "relative",
    }}>
      <style>{`
        input::placeholder, textarea::placeholder, select option { color: #52525B; }
        select option { background: #18181B; color: #FAFAFA; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .contact-nav-btn {
          cursor: pointer; background: transparent;
          border: 1px solid rgba(0,0,0,0.1); color: #A1A1AA;
          font-weight: 600; font-size: 12px; letter-spacing: 1.5px;
          text-transform: uppercase; padding: 8px 20px;
          font-family: inherit; transition: all 0.2s; border-radius: 6px;
        }
        .contact-nav-btn:hover { color: #FAFAFA; border-color: rgba(0,0,0,0.15); }
      `}</style>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 20px" : "20px 48px",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <LogoNervur height={28} onClick={() => navigate("/")} />
        <button className="contact-nav-btn" onClick={() => navigate("/")}>
          Accueil
        </button>
      </nav>

      {/* RETOUR */}
      <div style={{ padding: isMobile ? "100px 20px 0 20px" : "140px 48px 0 48px", maxWidth: "1100px", margin: "0 auto" }}>
        <button onClick={() => navigate("/")} style={{
          background: "none", border: "1px solid rgba(250,250,250,0.15)", borderRadius: "8px",
          color: "#86868B", fontSize: "13px", padding: "8px 20px", cursor: "pointer",
          fontFamily: "inherit", transition: "all 0.3s",
        }}
          onMouseEnter={e => { e.target.style.color = "#1D1D1F"; e.target.style.borderColor = "rgba(250,250,250,0.3)"; }}
          onMouseLeave={e => { e.target.style.color = "#86868B"; e.target.style.borderColor = "rgba(250,250,250,0.15)"; }}>
          ← Retour
        </button>
      </div>

      {/* MAIN */}
      <main style={{
        paddingTop: "20px",
        paddingBottom: "80px",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: isMobile ? "100px 20px 60px" : "140px 48px 80px",
      }}>
        {/* HEADER */}
        <div style={{
          textAlign: "center", marginBottom: isMobile ? "40px" : "56px",
          animation: "fadeInUp 0.5s ease both",
        }}>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800,
            letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "16px",
          }}>
            Contactez-<span style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>nous</span>
          </h1>
          <p style={{
            fontSize: "17px", color: "#86868B", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto",
          }}>
            Une question sur nos outils ? Un projet web ? Parlons-en.
          </p>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 380px",
          gap: isMobile ? "40px" : "48px",
          alignItems: "start",
        }}>
          {/* ──── LEFT: FORM ──── */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: "12px",
            padding: isMobile ? "28px 20px" : "36px 32px",
            animation: "fadeInUp 0.5s ease 0.1s both",
          }}>
            {/* Errors */}
            {errors.length > 0 && (
              <div style={{
                padding: "14px 18px", borderRadius: "8px",
                border: "1px solid rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.06)", marginBottom: "24px",
              }}>
                {errors.map((err, i) => (
                  <p key={i} style={{
                    fontSize: "13px", color: "#EF4444",
                    margin: i > 0 ? "6px 0 0" : 0,
                  }}>{err}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Honeypot */}
              <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off"
                  value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Nom */}
                <div>
                  <label htmlFor="contact-nom" style={labelStyle}>
                    Nom complet <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    id="contact-nom" name="nom" type="text"
                    value={form.nom} onChange={handleChange}
                    placeholder="Jean Dupont" maxLength={100}
                    autoComplete="name" required
                    style={inputBase} {...focusHandlers}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="contact-email" style={labelStyle}>
                    Email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    id="contact-email" name="email" type="email"
                    value={form.email} onChange={handleChange}
                    placeholder="jean@exemple.com" maxLength={254}
                    autoComplete="email" required
                    style={inputBase} {...focusHandlers}
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label htmlFor="contact-tel" style={labelStyle}>
                    Téléphone <span style={{ color: "#86868B", fontWeight: 400 }}>(facultatif)</span>
                  </label>
                  <input
                    id="contact-tel" name="tel" type="tel"
                    value={form.tel} onChange={handleChange}
                    placeholder="06 XX XX XX XX" maxLength={20}
                    autoComplete="tel"
                    style={inputBase} {...focusHandlers}
                  />
                </div>

                {/* Sujet */}
                <div>
                  <label htmlFor="contact-sujet" style={labelStyle}>
                    Sujet <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    id="contact-sujet" name="sujet"
                    value={form.sujet} onChange={handleChange}
                    required
                    style={{
                      ...inputBase,
                      appearance: "none",
                      WebkitAppearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23A1A1AA' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 16px center",
                      paddingRight: "40px",
                      cursor: "pointer",
                    }}
                    {...focusHandlers}
                  >
                    <option value="" disabled>Choisir un sujet...</option>
                    {SUJETS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" style={labelStyle}>
                    Message <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    id="contact-message" name="message"
                    value={form.message} onChange={handleChange}
                    placeholder="Décrivez votre besoin..."
                    rows={5} maxLength={5000} required
                    style={{
                      ...inputBase,
                      resize: "vertical",
                      lineHeight: 1.7,
                      minHeight: "120px",
                    }}
                    {...focusHandlers}
                  />
                </div>

                {/* RGPD Consent */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <input
                    type="checkbox"
                    id="contact-consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    style={{
                      marginTop: "3px",
                      accentColor: "#6366f1",
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                  <label htmlFor="contact-consent" style={{
                    fontSize: "13px",
                    color: "#86868B",
                    lineHeight: 1.6,
                    cursor: "pointer",
                  }}>
                    J'accepte que mes donn&eacute;es soient trait&eacute;es conform&eacute;ment &agrave; la{" "}
                    <a
                      href="/politique-de-confidentialite"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#818CF8", textDecoration: "underline", textUnderlineOffset: "3px" }}
                    >
                      politique de confidentialit&eacute;
                    </a>.
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !consent}
                  style={{
                    padding: "16px 32px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#1D1D1F",
                    fontSize: "15px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: (submitting || !consent) ? "not-allowed" : "pointer",
                    transition: "opacity 0.2s, transform 0.2s",
                    fontFamily: "inherit",
                    width: "100%",
                    opacity: (submitting || !consent) ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting && consent) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.opacity = "0.9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.opacity = (submitting || !consent) ? "0.6" : "1";
                  }}
                >
                  {submitting ? "Envoi en cours..." : "Envoyer le message"}
                </button>
              </div>
            </form>
          </div>

          {/* ──── RIGHT: INFO PANEL ──── */}
          <div style={{
            display: "flex", flexDirection: "column", gap: "24px",
            animation: "fadeInUp 0.5s ease 0.2s both",
          }}>
            {/* Nos outils */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "12px",
              padding: "24px",
            }}>
              <h3 style={{
                fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", color: "#86868B",
                marginBottom: "16px",
              }}>
                Nos outils
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {TOOLS.map((t) => (
                  <div key={t.name} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 14px", borderRadius: "8px",
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${t.color}20`,
                    transition: "border-color 0.2s",
                  }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: `${t.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ToolIcon type={t.icon} color={t.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          fontSize: "14px", fontWeight: 700, color: t.color,
                        }}>{t.name}</span>
                        <span style={{
                          fontSize: "12px", fontWeight: 600, color: "#424245",
                          marginLeft: "auto", whiteSpace: "nowrap",
                        }}>{t.price}</span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#86868B" }}>{t.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nos packs */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "12px",
              padding: "24px",
            }}>
              <h3 style={{
                fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", color: "#86868B",
                marginBottom: "16px",
              }}>
                Nos packs
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {PACKS.map((p) => (
                  <div key={p.name} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 14px", borderRadius: "8px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1D1D1F" }}>{p.name}</div>
                      <div style={{ fontSize: "12px", color: "#86868B" }}>{p.desc}</div>
                    </div>
                    <span style={{
                      fontSize: "14px", fontWeight: 700,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      whiteSpace: "nowrap",
                    }}>{p.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "12px",
              padding: "24px",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <a href="mailto:contact@nervur.fr" style={{
                    fontSize: "14px", color: "#424245", textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#1D1D1F")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#424245")}
                  >
                    contact@nervur.fr
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span style={{ fontSize: "14px", color: "#86868B" }}>
                    Réponse sous 24h
                  </span>
                </div>
              </div>
            </div>

            {/* Espace client link */}
            <button
              onClick={() => navigate("/app/login")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "12px 20px",
                background: "transparent",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "8px",
                color: "#86868B",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)";
                e.currentTarget.style.color = "#1D1D1F";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                e.currentTarget.style.color = "#86868B";
              }}
            >
              Espace client →
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{
        padding: isMobile ? "24px 20px" : "32px 48px",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: isMobile ? "12px" : "0",
      }}>
        <LogoNervur height={28} onClick={() => navigate("/")} />
        <span style={{ fontSize: "11px", color: "#3F3F46" }}>
          © 2026 NERVÜR — Tous droits réservés
        </span>
      </footer>
    </div>
  );
}
