import { useState, useEffect, useCallback } from "react";

const GTM_ID = "GTM-MCHC6NMK";
const CONSENT_KEY = "nervur_cookie_consent";

function injectGTM() {
  if (document.getElementById("gtm-script")) return;
  // GTM script
  const script = document.createElement("script");
  script.id = "gtm-script";
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;
  document.head.appendChild(script);

  // GTM noscript
  const noscript = document.createElement("noscript");
  noscript.id = "gtm-noscript";
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.insertBefore(noscript, document.body.firstChild);
}

function removeGTM() {
  const script = document.getElementById("gtm-script");
  if (script) script.remove();
  const noscript = document.getElementById("gtm-noscript");
  if (noscript) noscript.remove();
  // Remove any GTM-injected scripts
  document.querySelectorAll('script[src*="googletagmanager.com"]').forEach((el) => el.remove());
  // Clear dataLayer
  if (window.dataLayer) window.dataLayer = [];
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      const consent = JSON.parse(stored);
      if (consent.analytics) injectGTM();
      // Already consented, don't show banner
      return;
    }
    // Show banner after a short delay for UX
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const saveConsent = useCallback((accepted) => {
    const consent = {
      analytics: accepted,
      date: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    if (accepted) {
      injectGTM();
    } else {
      removeGTM();
    }
    setVisible(false);
    setShowCustomize(false);
  }, []);

  const handleAccept = () => saveConsent(true);
  const handleRefuse = () => saveConsent(false);
  const handleCustomSave = () => saveConsent(analytics);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        padding: isMobile ? "16px" : "20px 32px",
        background: "rgba(15,17,23,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(99,102,241,0.2)",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.1)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        animation: "cookieSlideUp 0.4s ease",
      }}
    >
      <style>{`
        @keyframes cookieSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {!showCustomize ? (
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? "16px" : "24px",
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: "14px",
                color: "#424245",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Ce site utilise des cookies pour mesurer l'audience et am&eacute;liorer votre exp&eacute;rience.
              Vous pouvez accepter, refuser ou personnaliser vos choix.{" "}
              <a
                href="/politique-de-confidentialite"
                style={{
                  color: "#818CF8",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                Politique de confidentialit&eacute;
              </a>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexShrink: 0,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleRefuse}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
                color: "#86868B",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
                flex: isMobile ? 1 : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)";
                e.currentTarget.style.color = "#1D1D1F";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)";
                e.currentTarget.style.color = "#86868B";
              }}
            >
              Refuser
            </button>
            <button
              onClick={() => setShowCustomize(true)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "8px",
                color: "#818CF8",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
                flex: isMobile ? 1 : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)";
                e.currentTarget.style.background = "rgba(99,102,241,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Personnaliser
            </button>
            <button
              onClick={handleAccept}
              style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                borderRadius: "8px",
                color: "#1D1D1F",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "opacity 0.2s",
                flex: isMobile ? 1 : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Accepter
            </button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#1D1D1F",
              marginBottom: "20px",
              margin: "0 0 20px 0",
            }}
          >
            Personnaliser les cookies
          </h3>

          {/* Essential cookies */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 0",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#424245", margin: 0 }}>
                Cookies essentiels
              </p>
              <p style={{ fontSize: "12px", color: "#86868B", margin: "4px 0 0" }}>
                N&eacute;cessaires au fonctionnement du site. Toujours actifs.
              </p>
            </div>
            <div
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                background: "#6366f1",
                opacity: 0.5,
                cursor: "not-allowed",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "#1D1D1F",
                  transition: "all 0.2s",
                }}
              />
            </div>
          </div>

          {/* Analytics cookies */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 0",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#424245", margin: 0 }}>
                Cookies analytiques
              </p>
              <p style={{ fontSize: "12px", color: "#86868B", margin: "4px 0 0" }}>
                Google Tag Manager — mesure d'audience et am&eacute;lioration du site.
              </p>
            </div>
            <button
              onClick={() => setAnalytics(!analytics)}
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                background: analytics ? "#6366f1" : "#3F3F46",
                border: "none",
                cursor: "pointer",
                position: "relative",
                flexShrink: 0,
                transition: "background 0.2s",
                padding: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: analytics ? "22px" : "2px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "#1D1D1F",
                  transition: "left 0.2s",
                }}
              />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setShowCustomize(false)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
                color: "#86868B",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)";
                e.currentTarget.style.color = "#1D1D1F";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)";
                e.currentTarget.style.color = "#86868B";
              }}
            >
              Retour
            </button>
            <button
              onClick={handleCustomSave}
              style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                borderRadius: "8px",
                color: "#1D1D1F",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Enregistrer mes choix
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
