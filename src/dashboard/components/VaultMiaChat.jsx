import { useState, useRef, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";

const DEMO_RESPONSES = {
  "rgpd": "Le **RGPD** (Règlement Général sur la Protection des Données) est le règlement européen n°2016/679 qui encadre le traitement des données personnelles. Il s'applique à toute organisation traitant des données de résidents européens, quel que soit son lieu d'établissement.\n\nLes principes fondamentaux : licéité, loyauté, transparence, limitation des finalités, minimisation, exactitude, limitation de conservation, intégrité et confidentialité.",
  "dpo": "Le **DPO** (Délégué à la Protection des Données) est obligatoire dans 3 cas :\n\n1. Vous êtes un organisme public\n2. Votre activité principale implique un suivi régulier et systématique à grande échelle\n3. Vous traitez des données sensibles à grande échelle\n\nMême si vous n'êtes pas obligé, nommer un DPO est fortement recommandé par la CNIL.",
  "cnil": "La **CNIL** est l'autorité française de protection des données. Elle peut :\n\n- Contrôler les entreprises (sur place ou en ligne)\n- Prononcer des sanctions jusqu'à **20M€ ou 4% du CA mondial**\n- Émettre des mises en demeure\n- Publier des recommandations\n\nEn 2025, la CNIL a prononcé plus de 200M€ d'amendes.",
  "cookie": "Pour être conforme, votre **bannière cookies** doit :\n\n1. Permettre de refuser aussi facilement que d'accepter\n2. Lister les finalités des cookies\n3. Ne déposer aucun cookie non essentiel avant consentement\n4. Permettre le retrait du consentement à tout moment\n5. Conserver la preuve du consentement\n\nLa CNIL contrôle activement la conformité des bannières.",
  "mention": "Les **mentions légales** sont obligatoires pour tout site professionnel (Loi LCEN). Elles doivent inclure :\n\n- Nom/raison sociale et forme juridique\n- Adresse du siège\n- Email et téléphone\n- Numéro SIRET/RCS\n- Nom du directeur de publication\n- Hébergeur (nom, adresse, téléphone)",
  "droit": "Les personnes concernées ont **6 droits** selon le RGPD :\n\n1. **Droit d'accès** (Art. 15) — savoir quelles données vous détenez\n2. **Droit de rectification** (Art. 16) — corriger des données inexactes\n3. **Droit à l'effacement** (Art. 17) — demander la suppression\n4. **Droit à la portabilité** (Art. 20) — récupérer ses données\n5. **Droit d'opposition** (Art. 21) — s'opposer au traitement\n6. **Droit de limitation** (Art. 18) — geler un traitement\n\nDélai de réponse : **30 jours maximum**.",
  "aipd": "Une **AIPD** (Analyse d'Impact) est obligatoire quand le traitement est susceptible d'engendrer un risque élevé. C'est le cas notamment :\n\n- Profilage avec effets juridiques\n- Traitement à grande échelle de données sensibles\n- Surveillance systématique d'une zone publique\n- Croisement de données à grande échelle\n\nUtilisez notre outil AIPD dans l'onglet **Audit** pour réaliser votre analyse.",
  "sous-traitant": "Le **contrat de sous-traitance RGPD** (Art. 28) est obligatoire avec tout prestataire traitant des données pour votre compte. Il doit définir :\n\n- L'objet et la durée du traitement\n- Les obligations du sous-traitant\n- Les mesures de sécurité\n- Le sort des données en fin de contrat\n\nGénérez ce contrat dans l'onglet **Générateur**.",
  "incident": "En cas de **violation de données** (Art. 33-34 RGPD) :\n\n1. **72h** pour notifier la CNIL (si risque pour les droits)\n2. Notifier les personnes concernées si risque élevé\n3. Documenter l'incident dans un registre interne\n\nDéclarez vos incidents dans l'onglet **Actions** > Incidents.",
  "default": "Je suis **NOÉ**, votre assistant juridique IA. Je peux vous aider sur :\n\n- Le RGPD et la conformité\n- Les obligations légales (mentions, cookies, CGV)\n- Les droits des personnes\n- Les analyses d'impact (AIPD)\n- La gestion des incidents\n\nPosez-moi votre question !",
};

const QUICK_QUESTIONS = [
  "Qu'est-ce que le RGPD ?",
  "Dois-je nommer un DPO ?",
  "Quels sont les droits des personnes ?",
  "Comment gérer un incident de données ?",
  "Mentions légales obligatoires ?",
];

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

function getResponse(input) {
  const lower = input.toLowerCase();
  for (const key of Object.keys(DEMO_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) {
      return DEMO_RESPONSES[key];
    }
  }
  return DEMO_RESPONSES["default"];
}

const ChatBubbleIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <path d="M8 10h.01" strokeWidth="2.5"/><path d="M12 10h.01" strokeWidth="2.5"/><path d="M16 10h.01" strokeWidth="2.5"/>
  </svg>
);

const XIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SparkleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v1m0 16v1m-7.07-2.93l.71-.71M5.64 5.64l-.71-.71M3 12h1m16 0h1m-2.93 7.07l-.71-.71M18.36 5.64l.71-.71" />
    <circle cx="12" cy="12" r="4" fill="#06b6d4" stroke="none" />
  </svg>
);

const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function VaultMiaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typewriterRef = useRef(null);
  const { post } = useApi();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Cleanup typewriter interval on unmount
  useEffect(() => {
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, []);

  const typewriterEffect = useCallback((fullText) => {
    let index = 0;
    // Add an empty bot message that will be filled character by character
    setMessages((prev) => [...prev, { role: "bot", content: "" }]);
    setTyping(false);

    typewriterRef.current = setInterval(() => {
      index++;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "bot", content: fullText.slice(0, index) };
        return updated;
      });
      if (index >= fullText.length) {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      }
    }, 30);
  }, []);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || typing) return;

    const userMsg = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Build history from existing messages (last 5 user/assistant pairs)
    const history = [...messages, userMsg]
      .filter((m) => m.role === "user" || m.role === "bot")
      .slice(-5)
      .map((m) => ({ role: m.role === "bot" ? "assistant" : m.role, content: m.content }));

    try {
      const data = await post("/api/vault/noe-chat", { message: msg, history });
      if (data && data.response && !data.fallback) {
        typewriterEffect(data.response);
      } else {
        // API returned fallback flag or empty response — use local fallback
        const fallbackResponse = getResponse(msg);
        typewriterEffect(fallbackResponse);
      }
    } catch (err) {
      console.error("NOÉ chat API error:", err);
      // Fallback to keyword-matching
      const fallbackResponse = getResponse(msg);
      typewriterEffect(fallbackResponse);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Ouvrir NOÉ"
        title="Posez vos questions juridiques à NOÉ"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #06b6d4, #22d3ee)",
          border: "none",
          boxShadow: "0 4px 20px rgba(6,182,212,0.4)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: open ? 0 : 1,
          transition: "transform 0.2s, box-shadow 0.2s",
          animation: mounted && !open ? "noe-pulse 2s ease-in-out 1" : "none",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {open ? (
          <XIcon size={26} />
        ) : (
          <>
            <ChatBubbleIcon size={26} />
            <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: "0.5px", marginTop: 1 }}>NOÉ</span>
          </>
        )}
      </button>

      {/* Chat panel */}
      <div
        style={{
          position: "fixed",
          bottom: 90,
          right: 24,
          zIndex: 1001,
          width: 380,
          height: 500,
          background: "#F8FAFC",
          borderRadius: 14,
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          border: "1px solid rgba(6,182,212,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "opacity 0.25s ease, transform 0.25s ease",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.95)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 16px",
            background: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(6,182,212,0.04))",
            borderBottom: "1px solid rgba(6,182,212,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(6,182,212,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SparkleIcon size={18} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                NOÉ
              </div>
              <div style={{ fontSize: 11, color: "#06b6d4" }}>
                Assistant Juridique IA
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "#64748B",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              borderRadius: 6,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#0F172A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#64748B"; }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.length === 0 && !typing && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16, lineHeight: 1.6 }}>
                Bonjour ! Je suis <strong style={{ color: "#06b6d4" }}>NOÉ</strong>, votre assistant juridique.
                <br />Posez-moi une question ou choisissez un sujet :
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    style={{
                      background: "rgba(6,182,212,0.08)",
                      border: "1px solid rgba(6,182,212,0.2)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: "#334155",
                      fontSize: 12,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(6,182,212,0.15)";
                      e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(6,182,212,0.08)";
                      e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  background: msg.role === "user" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                  borderLeft: msg.role === "bot" ? "3px solid #06b6d4" : "none",
                  fontSize: 13,
                  color: "#334155",
                  lineHeight: 1.6,
                }}
                dangerouslySetInnerHTML={
                  msg.role === "bot"
                    ? { __html: renderMarkdown(msg.content) }
                    : undefined
                }
              >
                {msg.role === "user" ? msg.content : undefined}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "10px 18px",
                  borderRadius: "12px 12px 12px 2px",
                  background: "rgba(255,255,255,0.04)",
                  borderLeft: "3px solid #06b6d4",
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                <span className="noe-dot" style={{ animationDelay: "0ms" }} />
                <span className="noe-dot" style={{ animationDelay: "150ms" }} />
                <span className="noe-dot" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {/* Quick questions after bot response */}
          {messages.length > 0 && !typing && messages[messages.length - 1]?.role === "bot" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {QUICK_QUESTIONS.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  style={{
                    background: "rgba(6,182,212,0.06)",
                    border: "1px solid rgba(6,182,212,0.15)",
                    borderRadius: 6,
                    padding: "5px 10px",
                    color: "#64748B",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(6,182,212,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(6,182,212,0.06)"; }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid rgba(6,182,212,0.1)",
            background: "rgba(20,21,32,0.6)",
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question juridique..."
            style={{
              flex: 1,
              padding: "9px 12px",
              background: "#F8FAFC",
              border: "1px solid #2a2d3a",
              borderRadius: 8,
              color: "#334155",
              fontSize: 13,
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#06b6d4"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || typing}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "none",
              background: input.trim() && !typing ? "linear-gradient(135deg, #06b6d4, #22d3ee)" : "#E2E8F0",
              color: input.trim() && !typing ? "#0f0f11" : "#64748B",
              cursor: input.trim() && !typing ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
          >
            <SendIcon size={16} />
          </button>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes noe-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(6,182,212,0.4); }
          50% { box-shadow: 0 4px 30px rgba(6,182,212,0.7), 0 0 40px rgba(6,182,212,0.3); }
        }
        @keyframes noe-dot-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .noe-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #06b6d4;
          display: inline-block;
          animation: noe-dot-bounce 1.2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
