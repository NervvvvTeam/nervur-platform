import { useState } from "react";

export default function ResponseEditor({ response, onSave, onRegenerate, onPublish, onApprove }) {
  const [text, setText] = useState(response?.editedText || response?.generatedText || "");
  const [saving, setSaving] = useState(false);

  const isPublished = response?.status === "published";
  const isEdited = text !== (response?.generatedText || "");

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(text); } finally { setSaving(false); }
  };

  return (
    <div style={{
      border: "1px solid #2a2d3a", borderRadius: "10px", padding: "18px",
      background: "#FFFFFF"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", fontWeight: 500, color: "#86868B" }}>
          Réponse IA
        </div>
        {response?.status && (
          <span style={{
            fontSize: "11px", fontWeight: 500, padding: "3px 10px",
            borderRadius: "6px",
            background: isPublished ? "rgba(34,197,94,0.1)" : "rgba(99,102,241,0.1)",
            color: isPublished ? "#22c55e" : "#6366f1"
          }}>
            {isPublished ? "Publiée" : response?.status === "approved" ? "Approuvée" : "Brouillon"}
          </span>
        )}
      </div>

      {isPublished ? (
        <p style={{ fontSize: "14px", color: "#86868B", lineHeight: 1.8 }}>
          {response?.finalText || response?.generatedText}
        </p>
      ) : (
        <>
          <textarea value={text} onChange={e => setText(e.target.value)}
            style={{
              width: "100%", minHeight: "160px", padding: "16px", background: "#FFFFFF",
              border: "1px solid #2a2d3a", borderRadius: "8px", color: "#424245",
              fontSize: "14px", lineHeight: 1.8, fontFamily: "inherit", resize: "vertical",
              outline: "none", boxSizing: "border-box"
            }}
            onFocus={e => { e.target.style.borderColor = "#6366f1"; }}
            onBlur={e => { e.target.style.borderColor = "#E5E5EA"; }} />

          <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
            {onRegenerate && (
              <button onClick={onRegenerate} style={btnStyle("#86868B")}>
                Régénérer
              </button>
            )}
            {isEdited && onSave && (
              <button onClick={handleSave} disabled={saving} style={btnStyle("#6366f1")}>
                {saving ? "..." : "Sauvegarder"}
              </button>
            )}
            {onApprove && response?.status === "generated" && (
              <button onClick={onApprove} style={btnStyle("#6366f1")}>
                Approuver
              </button>
            )}
            {onPublish && (
              <button onClick={() => onPublish(text)} style={{
                ...btnStyle("#6366f1"),
                background: "#6366f1", color: "#ffffff", borderColor: "#6366f1"
              }}>
                Publier →
              </button>
            )}
          </div>
        </>
      )}

      {response?.publishedAt && (
        <div style={{ marginTop: "12px", fontSize: "11px", color: "#86868B" }}>
          Publiée le {new Date(response.publishedAt).toLocaleString("fr-FR")}
        </div>
      )}
    </div>
  );
}

const btnStyle = (color) => ({
  padding: "8px 18px", background: "transparent", border: `1px solid ${color}40`,
  borderRadius: "6px", color, fontSize: "12px", cursor: "pointer",
  fontFamily: "inherit", transition: "all 0.2s", fontWeight: 600
});
