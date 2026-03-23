import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

export default function QRCodePage() {
  const { get } = useApi();
  const [business, setBusiness] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBusiness(); }, []);

  async function loadBusiness() {
    try {
      const res = await get("/api/sentinel-app/businesses");
      if (res.businesses[0]) {
        setBusiness(res.businesses[0]);
        await loadQR(res.businesses[0]._id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function loadQR(bizId) {
    try {
      const res = await get(`/api/sentinel-app/tools/${bizId}/qrcode`);
      setQrData(res);
    } catch (err) { console.error(err); }
  }

  async function downloadQR() {
    const token = localStorage.getItem("sentinel_token");
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const response = await fetch(`${apiUrl}/api/sentinel-app/tools/${business._id}/qrcode/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-avis-${business.businessName.replace(/\s+/g, "-")}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Chargement...</div>;
  if (!business) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Aucune entreprise configurée</div>;

  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 500 }}>Sentinel</span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px", color: "#FAFAFA" }}>QR Code Avis</h1>
        <p style={{ fontSize: "14px", color: "#71717A", lineHeight: 1.6 }}>
          {"Imprimez ce QR code et placez-le en caisse, sur vos tables ou sur vos cartes de visite. Vos clients satisfaits pourront laisser un avis en un scan."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        {/* QR Code display */}
        <div style={{
          padding: "18px", borderRadius: "10px", textAlign: "center",
          border: "1px solid #1e1e22", background: "#141416"
        }}>
          {qrData?.qrCode ? (
            <>
              <div style={{
                background: "#FFFFFF", borderRadius: "10px", padding: "24px",
                display: "inline-block", marginBottom: "20px"
              }}>
                <img src={qrData.qrCode} alt="QR Code" style={{ width: "200px", height: "200px" }} />
              </div>
              <p style={{ fontSize: "12px", color: "#52525B", marginBottom: "20px", wordBreak: "break-all" }}>
                {qrData.reviewUrl}
              </p>
              <button onClick={downloadQR}
                style={{
                  padding: "12px 28px", background: "#6366f1",
                  color: "#FAFAFA", border: "none", borderRadius: "8px", fontSize: "14px",
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                }}>
                Télécharger HD
              </button>
            </>
          ) : (
            <p style={{ color: "#52525B", padding: "40px 0" }}>Génération du QR code...</p>
          )}
        </div>

        {/* Instructions */}
        <div style={{
          padding: "18px", borderRadius: "10px",
          border: "1px solid #1e1e22", background: "#141416"
        }}>
          <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#71717A", marginBottom: "20px" }}>
            Conseils d'utilisation
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {[
              { num: "1", title: "En caisse", desc: "Imprimez un petit chevalet avec le QR code à côté de la caisse." },
              { num: "2", title: "Sur les tables", desc: "Intégrez le QR code sur vos sets de table ou porte-menus." },
              { num: "3", title: "Carte de visite", desc: "Ajoutez le QR code au dos de vos cartes de visite." },
              { num: "4", title: "Ticket de caisse", desc: "Imprimez le QR code en bas du ticket avec un message." },
              { num: "5", title: "Réseaux sociaux", desc: "Partagez le QR code en story Instagram ou Facebook." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{
                  width: "26px", height: "26px", borderRadius: "6px",
                  background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "12px", fontWeight: 600,
                  color: "#6366f1", flexShrink: 0
                }}>{item.num}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#D4D4D8", marginBottom: "2px" }}>{item.title}</div>
                  <div style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestion message */}
      <div style={{
        marginTop: "24px", padding: "18px", borderRadius: "10px",
        border: "1px solid rgba(99,102,241,0.15)", background: "rgba(99,102,241,0.04)"
      }}>
        <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#6366f1", marginBottom: "10px" }}>
          Message suggéré
        </h3>
        <p style={{ fontSize: "15px", color: "#D4D4D8", lineHeight: 1.8, fontStyle: "italic" }}>
          {`"Votre avis compte ! Scannez ce QR code pour nous laisser un commentaire sur Google. Merci de votre confiance ! — ${business.businessName}"`}
        </p>
      </div>
    </div>
  );
}
