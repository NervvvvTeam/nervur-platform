import { useState } from "react";
import { useApi } from "../hooks/useApi";

const OBJECTIVES = [
  "Prospection - Convertir des leads froids",
  "Nurturing - Accompagner les prospects",
  "Relance - Réactiver des contacts inactifs",
  "Onboarding - Accueillir de nouveaux clients",
  "Upsell - Proposer des offres complémentaires",
];

export default function NexusSequencePage() {
  const api = useApi();
  const [objective, setObjective] = useState(OBJECTIVES[0]);
  const [companyName, setCompanyName] = useState("");
  const [audience, setAudience] = useState("");
  const [emailCount, setEmailCount] = useState(5);
  const [tone, setTone] = useState("Professionnel");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.post("/api/nexus/sequence", {
        objective, companyName: companyName.trim(), audience: audience.trim(),
        emailCount, tone,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Erreur de génération");
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = (email) => {
    const text = `Objet : ${email.subject}\n\n${email.body}\n\n[${email.cta}]`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #10b981, #34d399)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>
          Séquences email
        </h1>
        <p style={{ fontSize: "14px", color: "#71717A" }}>
          Générez des séquences email automatisées prêtes à l'emploi.
        </p>
      </div>

      {/* Form */}
      <div style={{
        padding: "24px", background: "#141416", border: "1px solid #1e1e22",
        borderRadius: "10px", marginBottom: "20px"
      }}>
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", color: "#71717A", marginBottom: "8px", fontWeight: 500 }}>Objectif</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {OBJECTIVES.map(o => (
              <button key={o} onClick={() => setObjective(o)}
                style={{
                  padding: "10px 16px", borderRadius: "8px", textAlign: "left",
                  fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                  background: objective === o ? "#10b98112" : "#0f0f11",
                  color: objective === o ? "#10b981" : "#A1A1AA",
                  border: objective === o ? "1px solid #10b98125" : "1px solid #1e1e22",
                }}>{o}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#71717A", marginBottom: "8px", fontWeight: 500 }}>Entreprise</div>
            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
              placeholder="NERVÜR"
              style={{
                width: "100%", padding: "10px 14px", background: "#0f0f11",
                border: "1px solid #27272A", borderRadius: "8px",
                color: "#FAFAFA", fontSize: "14px", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "#27272A"} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#71717A", marginBottom: "8px", fontWeight: 500 }}>Audience cible</div>
            <input type="text" value={audience} onChange={e => setAudience(e.target.value)}
              placeholder="Restaurateurs, e-commerçants..."
              style={{
                width: "100%", padding: "10px 14px", background: "#0f0f11",
                border: "1px solid #27272A", borderRadius: "8px",
                color: "#FAFAFA", fontSize: "14px", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "#27272A"} />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#71717A", marginBottom: "8px", fontWeight: 500 }}>
            Nombre d'emails : {emailCount}
          </div>
          <input type="range" min={3} max={7} value={emailCount} onChange={e => setEmailCount(+e.target.value)}
            style={{ width: "200px", accentColor: "#10b981" }} />
        </div>

        <button onClick={generate} disabled={loading}
          style={{
            padding: "12px 28px",
            background: "linear-gradient(135deg, #10b981, #34d399)",
            color: "#fff",
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500,
            cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
            opacity: loading ? 0.5 : 1,
            boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
          }}>
          {loading ? "Génération..." : "Générer la séquence"}
        </button>
      </div>

      {error && (
        <div style={{
          padding: "14px 18px", background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px",
          color: "#f87171", fontSize: "14px", marginBottom: "16px"
        }}>{error}</div>
      )}

      {/* Result */}
      {result && (
        <div>
          {result.summary && (
            <div style={{
              padding: "16px 20px", background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.15)", borderRadius: "10px",
              marginBottom: "16px"
            }}>
              <div style={{ fontSize: "12px", color: "#10b981", marginBottom: "6px", fontWeight: 500 }}>Stratégie</div>
              <p style={{ fontSize: "14px", color: "#D4D4D8", lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(result.sequence || []).map((email, i) => (
              <div key={i} style={{
                padding: "22px 24px", background: "#141416", border: "1px solid #1e1e22",
                borderRadius: "10px", borderLeft: "3px solid #10b981",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      fontSize: "12px", fontWeight: 600, color: "#10b981",
                      padding: "3px 10px", borderRadius: "4px", background: "#10b98114",
                    }}>{email.day}</span>
                    <span style={{ fontSize: "13px", color: "#71717A" }}>Email {i + 1}/{result.sequence.length}</span>
                  </div>
                  <button onClick={() => copyEmail(email)}
                    style={{
                      padding: "4px 12px", background: "#0f0f11", border: "1px solid #1e1e22",
                      borderRadius: "4px", color: "#71717A", fontSize: "11px",
                      cursor: "pointer", fontFamily: "inherit",
                    }}>Copier</button>
                </div>

                <div style={{
                  fontSize: "15px", fontWeight: 500, color: "#E4E4E7", marginBottom: "10px",
                  padding: "8px 12px", background: "#0f0f11", borderRadius: "6px",
                }}>
                  {email.subject}
                </div>

                <div style={{
                  fontSize: "14px", color: "#A1A1AA", lineHeight: 1.7, whiteSpace: "pre-wrap",
                  marginBottom: "10px",
                }}>
                  {email.body}
                </div>

                <div style={{
                  display: "inline-block", padding: "8px 20px", background: "#10b98118",
                  borderRadius: "6px", border: "1px solid #10b98125",
                  fontSize: "13px", fontWeight: 500, color: "#10b981",
                }}>
                  {email.cta}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
