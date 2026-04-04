import { useState, useRef, useCallback } from "react";
import { useApi } from "../hooks/useApi";

const ACCENT = "#f59e0b";

const STYLES = [
  { value: "modern", label: "Modern" },
  { value: "minimaliste", label: "Minimaliste" },
  { value: "bold", label: "Bold" },
  { value: "corporate", label: "Corporate" },
];

const COLOR_SCHEMES = [
  { value: "sombre", label: "Sombre" },
  { value: "clair", label: "Clair" },
  { value: "bleu", label: "Bleu" },
  { value: "vert", label: "Vert" },
];

const cardStyle = {
  background: "#141416",
  border: "1px solid #1e1e22",
  borderRadius: "10px",
  padding: "24px",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#A1A1AA",
  marginBottom: "6px",
  display: "block",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "#0f0f11",
  border: "1px solid #27272A",
  borderRadius: "8px",
  color: "#0F172A",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const selectStyle = {
  ...inputStyle,
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: "36px",
  cursor: "pointer",
};

function OptionButtons({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: `1px solid ${active ? ACCENT : "#1e1e22"}`,
              background: active ? `${ACCENT}18` : "#0f0f11",
              color: active ? ACCENT : "#A1A1AA",
              fontSize: "13px",
              fontWeight: active ? 500 : 400,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function ForgeDashboardPage() {
  const api = useApi();
  const iframeRef = useRef(null);

  const [form, setForm] = useState({
    businessName: "",
    sector: "",
    objective: "",
    description: "",
    style: "modern",
    colorScheme: "sombre",
  });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const updateField = (field) => (e) => {
    const val = typeof e === "string" ? e : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleGenerate = useCallback(async () => {
    if (!form.businessName.trim() || !form.objective.trim()) {
      setError("Le nom de l'entreprise et l'objectif sont requis.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);

    // Simulated progress during generation
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        return p + Math.random() * 12;
      });
    }, 400);

    try {
      const data = await api.post("/api/forge/generate", form);
      setProgress(100);
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 300);
    } catch (err) {
      setError(err.message || "Erreur lors de la génération");
      setLoading(false);
    } finally {
      clearInterval(interval);
    }
  }, [api, form]);

  const handleDownload = useCallback(() => {
    if (!result?.html) return;
    const blob = new Blob([result.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(result.businessName || "landing-page").replace(/\s+/g, "-").toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  const handleCopy = useCallback(async () => {
    if (!result?.html) return;
    try {
      await navigator.clipboard.writeText(result.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = result.html;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleReset = () => {
    setResult(null);
    setProgress(0);
    setError("");
  };

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#0F172A", margin: 0, marginBottom: "6px" }}>
          Générateur de landing pages
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B", margin: 0 }}>
          Générez des landing pages professionnelles en quelques secondes avec l'IA.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 16px", background: "#ef444418", border: "1px solid #ef444440",
          borderRadius: "8px", color: "#fca5a5", fontSize: "13px", marginBottom: "20px",
        }}>
          {error}
        </div>
      )}

      {/* Result view */}
      {result ? (
        <div>
          {/* Action bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "12px", marginBottom: "20px",
          }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0F172A", margin: 0 }}>
                {result.businessName || "Landing Page"}
              </h2>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0" }}>
                {result.objective || "Page générée"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={handleDownload}
                style={{
                  padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                  background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#000", border: "none",
                  cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s",
                  boxShadow: "0 4px 16px rgba(245,158,11,0.4)",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                Télécharger HTML
              </button>
              <button
                onClick={handleCopy}
                style={{
                  padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                  background: "transparent", color: copied ? "#10b981" : "#A1A1AA",
                  border: `1px solid ${copied ? "#10b981" : "#1e1e22"}`,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}
              >
                {copied ? "Copié !" : "Copier le code"}
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                  background: "transparent", color: "#64748B",
                  border: "1px solid #1e1e22",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = "#94A3B8"; e.target.style.color = "#A1A1AA"; }}
                onMouseLeave={(e) => { e.target.style.borderColor = "#1e1e22"; e.target.style.color = "#64748B"; }}
              >
                Nouvelle page
              </button>
            </div>
          </div>

          {/* Iframe preview */}
          <div style={{
            ...cardStyle,
            padding: 0,
            overflow: "hidden",
            borderRadius: "10px",
          }}>
            <div style={{
              padding: "10px 16px",
              background: "#111113",
              borderBottom: "1px solid #1e1e22",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: "12px", color: "#64748B", marginLeft: "8px" }}>
                Aperçu — {result.businessName || "landing-page"}.html
              </span>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={result.html}
              sandbox="allow-scripts"
              title="Landing page preview"
              style={{
                width: "100%",
                height: "700px",
                border: "none",
                background: "#fff",
              }}
            />
          </div>
        </div>
      ) : (
        /* Form view */
        <div style={cardStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {/* Business name */}
            <div>
              <label style={labelStyle}>Nom de l'entreprise *</label>
              <input
                type="text"
                placeholder="Ex: Ma Boulangerie"
                value={form.businessName}
                onChange={updateField("businessName")}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>

            {/* Sector */}
            <div>
              <label style={labelStyle}>Secteur d'activité</label>
              <input
                type="text"
                placeholder="Ex: Restauration, Tech, Immobilier..."
                value={form.sector}
                onChange={updateField("sector")}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>

            {/* Objective */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Objectif de la page *</label>
              <input
                type="text"
                placeholder="Ex: Collecter des leads, Présenter un produit, Promouvoir un événement..."
                value={form.objective}
                onChange={updateField("objective")}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>

            {/* Description */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Description (optionnel)</label>
              <textarea
                placeholder="Décrivez votre activité, votre offre, vos points forts..."
                value={form.description}
                onChange={updateField("description")}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "80px",
                }}
                onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>

            {/* Style */}
            <div>
              <label style={labelStyle}>Style visuel</label>
              <OptionButtons
                options={STYLES}
                value={form.style}
                onChange={updateField("style")}
              />
            </div>

            {/* Color scheme */}
            <div>
              <label style={labelStyle}>Palette de couleurs</label>
              <OptionButtons
                options={COLOR_SCHEMES}
                value={form.colorScheme}
                onChange={updateField("colorScheme")}
              />
            </div>
          </div>

          {/* Progress bar */}
          {loading && (
            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#A1A1AA" }}>
                  Génération en cours...
                </span>
                <span style={{ fontSize: "13px", color: ACCENT, fontWeight: 500 }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div style={{
                width: "100%", height: "6px", background: "#1e1e22",
                borderRadius: "3px", overflow: "hidden",
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: ACCENT,
                  borderRadius: "3px",
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>
          )}

          {/* Submit button */}
          <div style={{ marginTop: "28px" }}>
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                padding: "12px 28px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                background: loading ? "#64748B" : "linear-gradient(135deg, #f59e0b, #fbbf24)",
                color: loading ? "#A1A1AA" : "#000",
                border: "none",
                boxShadow: loading ? "none" : "0 4px 16px rgba(245,158,11,0.4)",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.target.style.opacity = "1"; }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: "14px", height: "14px",
                    border: "2px solid rgba(161,161,170,0.3)",
                    borderTop: "2px solid #A1A1AA",
                    borderRadius: "50%",
                    animation: "forgespin 0.8s linear infinite",
                    display: "inline-block",
                  }} />
                  Génération...
                </>
              ) : (
                "Générer la landing page"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Spinner keyframes */}
      <style>{`@keyframes forgespin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
