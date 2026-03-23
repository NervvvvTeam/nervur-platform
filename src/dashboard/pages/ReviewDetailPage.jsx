import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import ResponseEditor from "../components/ResponseEditor";

const SENTIMENT_CONFIG = {
  positive: { label: "Positif", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  negative: { label: "Négatif", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  mixed: { label: "Mixte", color: "#A1A1AA", bg: "rgba(161,161,170,0.1)" }
};

export default function ReviewDetailPage() {
  const { businessId, reviewId } = useParams();
  const { get, post, put } = useApi();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadReview(); }, []);

  async function loadReview() {
    try {
      const res = await get(`/api/sentinel-app/reviews/${businessId}/${reviewId}`);
      setReview(res.review);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await post(`/api/sentinel-app/responses/${reviewId}/generate`);
      await loadReview();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegenerate() {
    setGenerating(true);
    try {
      await post(`/api/sentinel-app/responses/${reviewId}/regenerate`);
      await loadReview();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(text) {
    if (!review.response) return;
    await put(`/api/sentinel-app/responses/${review.response._id}/edit`, { text });
    await loadReview();
  }

  async function handleApprove() {
    if (!review.response) return;
    await post(`/api/sentinel-app/responses/${review.response._id}/approve`);
    await loadReview();
  }

  async function handlePublish() {
    if (!review.response) return;
    await post(`/api/sentinel-app/responses/${review.response._id}/publish`);
    await loadReview();
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Chargement...</div>;
  if (!review) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Avis introuvable</div>;

  const sent = SENTIMENT_CONFIG[review.sentiment] || SENTIMENT_CONFIG.mixed;
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

  return (
    <div style={{ maxWidth: "700px" }}>
      {/* Back */}
      <button onClick={() => navigate("/app/reviews")}
        style={{
          background: "none", border: "none", color: "#71717A", fontSize: "13px",
          cursor: "pointer", marginBottom: "24px", fontFamily: "inherit",
          padding: 0
        }}
        onMouseEnter={e => { e.target.style.color = "#FAFAFA"; }}
        onMouseLeave={e => { e.target.style.color = "#71717A"; }}>
        ← Retour aux avis
      </button>

      {/* Review */}
      <div style={{
        border: "1px solid #1e1e22", borderRadius: "10px", padding: "18px",
        borderLeft: `3px solid ${sent.color}`, background: "#141416",
        marginBottom: "24px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <span style={{ color: "#6366f1", fontSize: "18px" }}>{stars}</span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#FAFAFA", marginLeft: "12px" }}>{review.authorName}</span>
          </div>
          <span style={{
            fontSize: "11px", fontWeight: 500, padding: "4px 10px",
            borderRadius: "6px", background: sent.bg, color: sent.color
          }}>{sent.label}</span>
        </div>

        <p style={{ fontSize: "15px", color: "#D4D4D8", lineHeight: 1.8, marginBottom: "12px" }}>
          {review.text || "(Avis sans texte — uniquement une note)"}
        </p>

        <div style={{ fontSize: "11px", color: "#52525B" }}>
          Publié le {review.publishedAt ? new Date(review.publishedAt).toLocaleDateString("fr-FR") : "—"}
        </div>
      </div>

      {/* Response section */}
      {review.response ? (
        <ResponseEditor
          response={review.response}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
          onApprove={handleApprove}
          onPublish={handlePublish}
        />
      ) : (
        <div style={{
          border: "1px dashed #27272A", borderRadius: "10px", padding: "40px",
          textAlign: "center"
        }}>
          <p style={{ color: "#71717A", marginBottom: "20px", fontSize: "14px" }}>
            Aucune réponse IA générée pour cet avis.
          </p>
          <button onClick={handleGenerate} disabled={generating}
            style={{
              padding: "12px 28px", background: "#6366f1", color: "#FAFAFA", border: "none",
              borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: generating ? "wait" : "pointer",
              fontFamily: "inherit", opacity: generating ? 0.7 : 1
            }}>
            {generating ? "Génération..." : "Générer une réponse IA"}
          </button>
        </div>
      )}
    </div>
  );
}
