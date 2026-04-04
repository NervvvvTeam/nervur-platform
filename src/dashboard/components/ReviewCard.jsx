import { useNavigate } from "react-router-dom";

const SENTIMENT_CONFIG = {
  positive: {
    label: "Positif",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.3)",
    starColor: "#22c55e",
    icon: "✓"
  },
  negative: {
    label: "Négatif",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.3)",
    starColor: "#ef4444",
    icon: "✕"
  },
  mixed: {
    label: "Mixte",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.25)",
    starColor: "#f59e0b",
    icon: "~"
  }
};

const STATUS_CONFIG = {
  pending: { label: "En attente", color: "#64748B" },
  generated: { label: "Réponse prête", color: "#4F46E5" },
  approved: { label: "Approuvée", color: "#4F46E5" },
  published: { label: "Publiée", color: "#22c55e" },
  failed: { label: "Erreur", color: "#ef4444" }
};

export default function ReviewCard({ review, businessId }) {
  const navigate = useNavigate();
  const sent = SENTIMENT_CONFIG[review.sentiment] || SENTIMENT_CONFIG.mixed;
  const status = STATUS_CONFIG[review.responseStatus] || STATUS_CONFIG.pending;

  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

  return (
    <div onClick={() => navigate(`/app/reviews/${businessId}/${review._id}`)}
      style={{
        padding: "16px 18px", borderRadius: "10px", cursor: "pointer",
        transition: "all 0.15s",
        background: sent.bg,
        border: `1px solid ${sent.border}`,
        borderLeft: `4px solid ${sent.color}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateX(2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: sent.starColor, fontSize: "13px", letterSpacing: "1px" }}>{stars}</span>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#0F172A" }}>{review.authorName}</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{
            fontSize: "11px", fontWeight: 600, padding: "3px 10px",
            borderRadius: "20px", background: `${sent.color}18`, color: sent.color,
            display: "flex", alignItems: "center", gap: "4px"
          }}>
            <span style={{ fontSize: "10px" }}>{sent.icon}</span>
            {sent.label}
          </span>
          <span style={{
            fontSize: "11px", color: status.color, display: "flex", alignItems: "center", gap: "4px"
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%", background: status.color,
              display: "inline-block"
            }} />
            {status.label}
          </span>
        </div>
      </div>

      {/* Text */}
      <p style={{
        fontSize: "13px", color: "#334155", lineHeight: 1.6, margin: 0,
        overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
      }}>
        {review.text || "(Avis sans texte)"}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
        <span style={{ fontSize: "11px", color: "#64748B" }}>
          {review.publishedAt ? new Date(review.publishedAt).toLocaleDateString("fr-FR") : ""}
        </span>
        {review.response && (
          <span style={{ fontSize: "11px", color: "#4F46E5", fontWeight: 500 }}>Réponse IA disponible →</span>
        )}
      </div>
    </div>
  );
}
