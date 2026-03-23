import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import ReviewCard from "../components/ReviewCard";

const FILTERS = [
  { key: "all", label: "Tous", color: "#6366f1" },
  { key: "positive", label: "Positifs", color: "#22c55e" },
  { key: "negative", label: "Négatifs", color: "#ef4444" },
  { key: "mixed", label: "Mixtes", color: "#f59e0b" },
];

const STATUS_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "pending", label: "En attente" },
  { key: "generated", label: "Réponse prête" },
  { key: "published", label: "Publiés" },
];

export default function ReviewsPage() {
  const { get } = useApi();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentiment, setSentiment] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadBusiness();
  }, []);

  useEffect(() => {
    if (business) loadReviews();
  }, [business, sentiment, status, page]);

  async function loadBusiness() {
    try {
      const res = await get("/api/sentinel-app/businesses");
      if (res.businesses[0]) setBusiness(res.businesses[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadReviews() {
    try {
      const params = new URLSearchParams({ page, limit: 20, sentiment, status });
      const res = await get(`/api/sentinel-app/reviews/${business._id}?${params}`);
      setReviews(res.reviews);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Chargement...</div>;
  if (!business) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Aucune entreprise configurée</div>;

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 500 }}>Sentinel</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA" }}>Avis clients</h1>
          <span style={{ fontSize: "12px", color: "#52525B" }}>{pagination?.total || 0} avis au total</span>
        </div>
        <p style={{ fontSize: "14px", color: "#71717A" }}>Consultez et gérez les avis de vos clients.</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => { setSentiment(f.key); setPage(1); }}
              style={{
                padding: "6px 14px", fontSize: "12px", fontWeight: 500,
                background: sentiment === f.key ? `${f.color}15` : "transparent",
                border: `1px solid ${sentiment === f.key ? `${f.color}35` : "#1e1e22"}`,
                borderRadius: "6px", color: sentiment === f.key ? f.color : "#71717A",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s"
              }}>{f.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {STATUS_FILTERS.map(f => (
            <button key={f.key} onClick={() => { setStatus(f.key); setPage(1); }}
              style={{
                padding: "6px 14px", fontSize: "12px", fontWeight: 500,
                background: status === f.key ? "rgba(99,102,241,0.1)" : "transparent",
                border: `1px solid ${status === f.key ? "rgba(99,102,241,0.2)" : "#1e1e22"}`,
                borderRadius: "6px", color: status === f.key ? "#6366f1" : "#71717A",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s"
              }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {reviews.length > 0 ? reviews.map(r => (
          <ReviewCard key={r._id} review={r} businessId={business._id} />
        )) : (
          <div style={{ padding: "60px", textAlign: "center", color: "#52525B", border: "1px dashed #27272A", borderRadius: "10px" }}>
            Aucun avis avec ces filtres
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{
                width: "36px", height: "36px", borderRadius: "8px", border: `1px solid #1e1e22`,
                background: page === i + 1 ? "#6366f1" : "transparent",
                color: page === i + 1 ? "#FAFAFA" : "#71717A",
                cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: 500,
                transition: "all 0.2s"
              }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
