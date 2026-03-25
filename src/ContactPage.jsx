import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sanitizeInput, validateContactForm } from "./security";
import useSEO from "./useSEO";

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
  "Souscrire à Sentinel (29€/mois)",
  "Souscrire à Phantom (19€/mois)",
  "Souscrire à Pulse (19€/mois)",
  "Souscrire à Vault (19€/mois)",
  "Pack Duo — 2 outils (39€/mois)",
  "Pack Total — 4 outils (49€/mois)",
  "Projet de développement web",
  "SEO & Marketing",
  "Autre",
];

const ToolIcon = ({ type, color, size = 18 }) => {
  const icons = {
    sentinel: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    phantom: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
    vault: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>,
    pulse: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[type]}</svg>;
};

const TOOLS = [
  { name: "Sentinel", icon: "sentinel", price: "29€/mois", desc: "E-réputation", color: "#ef4444" },
  { name: "Phantom", icon: "phantom", price: "19€/mois", desc: "Audit web", color: "#8b5cf6" },
  { name: "Pulse", icon: "pulse", price: "19€/mois", desc: "Monitoring santé web", color: "#ec4899" },
  { name: "Vault", icon: "vault", price: "19€/mois", desc: "Cybersécurité", color: "#06b6d4" },
];

const PACKS = [
  { name: "Pack Duo", price: "39\u20AC/mois", desc: "2 outils au choix" },
  { name: "Pack Total", price: "49\u20AC/mois", desc: "Les 4 outils" },
];

export default function ContactPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [form, setForm] = useState({ nom: "", email: "", tel: "", sujet: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useSEO(
    "Contact — NERVÜR | Demande d'information & Devis",
    "Contactez NERVÜR pour vos outils SaaS ou projets web. Réponse sous 24h. Devis gratuit pour Sentinel, Phantom, Pulse et Vault.",
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
    background: "rgba(24,24,27,0.6)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#FAFAFA",
    fontSize: "15px",
    outline: "none",
    borderRadius: "8px",
    transition: "border-color 0.2s, background 0.2s",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    boxSizing: "border-box",
    letterSpacing: "0.2px",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    color: "#A1A1AA",
    display: "block",
    marginBottom: "8px",
  };

  const focusHandlers = {
    onFocus: (e) => {
      e.target.style.borderColor = "#6366f1";
      e.target.style.background = "rgba(24,24,27,0.8)";
    },
    onBlur: (e) => {
      e.target.style.borderColor = "rgba(255,255,255,0.1)";
      e.target.style.background = "rgba(24,24,27,0.6)";
    },
  };

  // ── Sent state ──
  if (sent) {
    return (
      <div style={{
        background: "#0f1117", color: "#FAFAFA",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
        <p style={{ fontSize: "16px", color: "#A1A1AA", lineHeight: 1.8, maxWidth: "440px" }}>
          Nous avons bien reçu votre message. Notre équipe vous recontacte sous{" "}
          <strong style={{ color: "#FAFAFA" }}>24 heures</strong>.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "36px", padding: "14px 36px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#FAFAFA", fontSize: "14px", fontWeight: 600,
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
      background: "#0f1117", color: "#FAFAFA",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
          border: 1px solid rgba(255,255,255,0.12); color: #A1A1AA;
          font-weight: 600; font-size: 12px; letter-spacing: 1.5px;
          text-transform: uppercase; padding: 8px 20px;
          font-family: inherit; transition: all 0.2s; border-radius: 6px;
        }
        .contact-nav-btn:hover { color: #FAFAFA; border-color: rgba(255,255,255,0.3); }
      `}</style>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 20px" : "20px 48px",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <img
          src="/logo-nav.png" alt="NERVÜR"
          onClick={() => navigate("/")}
          style={{
            height: isMobile ? "40px" : "70px", width: "auto",
            filter: "invert(1) brightness(1.15)", objectFit: "contain",
            mixBlendMode: "screen", cursor: "pointer",
          }}
        />
        <button className="contact-nav-btn" onClick={() => navigate("/")}>
          Accueil
        </button>
      </nav>

      {/* MAIN */}
      <main style={{
        paddingTop: isMobile ? "100px" : "140px",
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
            fontSize: "17px", color: "#71717A", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto",
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
            border: "1px solid rgba(255,255,255,0.06)",
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
                    Téléphone <span style={{ color: "#52525B", fontWeight: 400 }}>(facultatif)</span>
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

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "16px 32px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#FAFAFA",
                    fontSize: "15px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    transition: "opacity 0.2s, transform 0.2s",
                    fontFamily: "inherit",
                    width: "100%",
                    opacity: submitting ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.opacity = "0.9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.opacity = submitting ? "0.6" : "1";
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
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "24px",
            }}>
              <h3 style={{
                fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", color: "#A1A1AA",
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
                          fontSize: "12px", fontWeight: 600, color: "#D4D4D8",
                          marginLeft: "auto", whiteSpace: "nowrap",
                        }}>{t.price}</span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#71717A" }}>{t.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nos packs */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "24px",
            }}>
              <h3 style={{
                fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", color: "#A1A1AA",
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
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#FAFAFA" }}>{p.name}</div>
                      <div style={{ fontSize: "12px", color: "#71717A" }}>{p.desc}</div>
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
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "24px",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <a href="mailto:contact@nervur.fr" style={{
                    fontSize: "14px", color: "#D4D4D8", textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#FAFAFA")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#D4D4D8")}
                  >
                    contact@nervur.fr
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span style={{ fontSize: "14px", color: "#71717A" }}>
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
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#A1A1AA",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                e.currentTarget.style.color = "#FAFAFA";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#A1A1AA";
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
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: isMobile ? "12px" : "0",
      }}>
        <img src="/logo-nav.png" alt="NERVÜR" style={{
          height: "28px", width: "auto", filter: "invert(1)",
          objectFit: "contain", mixBlendMode: "screen",
        }} />
        <span style={{ fontSize: "11px", color: "#3F3F46" }}>
          © 2026 NERVÜR — Tous droits réservés
        </span>
      </footer>
    </div>
  );
}
