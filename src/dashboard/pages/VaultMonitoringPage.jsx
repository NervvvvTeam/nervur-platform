import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import SubNav from "../components/SubNav";

const VAULT_NAV = [
  { path: "/app/vault", label: "Scanner", end: true },
  { path: "/app/vault/monitoring", label: "Surveillance" },
  { path: "/app/vault/history", label: "Historique" },
  { path: "/app/vault/rgpd", label: "Conformit\u00e9 RGPD" },
];

const ACCENT = "#06b6d4";
const ACCENT_LIGHT = "#22d3ee";
const BG_TINT = "rgba(6,182,212,0.06)";
const BORDER_TINT = "rgba(6,182,212,0.2)";

const EyeIcon = ({ size = 20, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const TrashIcon = ({ size = 15, color = "#9ca3af" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const RefreshIcon = ({ size = 15, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const PlusIcon = ({ size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return "Jamais";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function VaultMonitoringPage() {
  const { get, post, del } = useApi();
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const [domain, setDomain] = useState("");
  const [emailsText, setEmailsText] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [alertEmail, setAlertEmail] = useState("");

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get("/api/vault/monitoring");
      setConfigs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const emails = emailsText
        .split(/[\n,;]+/)
        .map(e => e.trim())
        .filter(e => e.length > 0);
      await post("/api/vault/monitoring", { domain, emails, frequency, alertEmail });
      setSuccess("Surveillance activée avec succès !");
      setDomain("");
      setEmailsText("");
      setAlertEmail("");
      setFrequency("weekly");
      fetchConfigs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (config) => {
    setTogglingId(config._id);
    try {
      await post("/api/vault/monitoring", {
        domain: config.domain,
        emails: config.emails,
        frequency: config.frequency,
        alertEmail: config.alertEmail,
        enabled: !config.enabled,
      });
      fetchConfigs();
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await del(`/api/vault/monitoring/${id}`);
      setSuccess("Surveillance supprimée.");
      fetchConfigs();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleScanNow = (config) => {
    navigate("/app/vault", { state: { prefillDomain: config.domain, prefillEmails: config.emails } });
  };

  return (
    <div style={{ maxWidth: "860px" }}>
      <SubNav color="#06b6d4" items={VAULT_NAV} />
      {/* Header bar */}
      <div style={{
        width: "40px", height: "3px", borderRadius: "2px",
        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
        marginBottom: "16px"
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
        <EyeIcon size={26} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
          Surveillance Vault
        </h1>
      </div>
      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "32px" }}>
        Surveillez automatiquement vos domaines et recevez des alertes en cas de nouvelle fuite.
      </p>

      {/* Messages */}
      {error && (
        <div style={{
          padding: "10px 14px", marginBottom: "16px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "6px", fontSize: "13px", color: "#fca5a5",
        }}>
          {error}
          <button onClick={() => setError(null)} style={{
            float: "right", background: "none", border: "none", color: "#fca5a5",
            cursor: "pointer", fontSize: "14px", padding: 0, lineHeight: 1,
          }}>x</button>
        </div>
      )}
      {success && (
        <div style={{
          padding: "10px 14px", marginBottom: "16px",
          background: "rgba(6,182,212,0.1)", border: `1px solid ${BORDER_TINT}`,
          borderRadius: "6px", fontSize: "13px", color: ACCENT_LIGHT,
        }}>
          {success}
        </div>
      )}

      {/* Active monitoring list */}
      <div style={{ marginBottom: "36px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#d1d5db", marginBottom: "16px" }}>
          Surveillance active
        </h2>

        {loading && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{
              width: "28px", height: "28px", margin: "0 auto 10px",
              border: `3px solid ${BORDER_TINT}`, borderTop: `3px solid ${ACCENT}`,
              borderRadius: "50%", animation: "vault-mon-spin 1s linear infinite",
            }} />
            <div style={{ fontSize: "12px", color: "#9ca3af" }}>Chargement...</div>
            <style>{`@keyframes vault-mon-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && configs.length === 0 && (
          <div style={{
            padding: "40px 24px", textAlign: "center",
            background: BG_TINT, border: `1px dashed ${BORDER_TINT}`,
            borderRadius: "8px",
          }}>
            <EyeIcon size={36} color="#d1d5db" />
            <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "12px", marginBottom: "4px" }}>
              Aucune surveillance configuree
            </p>
            <p style={{ fontSize: "12px", color: "#d1d5db" }}>
              Ajoutez un domaine ci-dessous pour commencer la surveillance automatique.
            </p>
          </div>
        )}

        {!loading && configs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {configs.map(config => (
              <div key={config._id} style={{
                padding: "16px 18px",
                background: config.enabled ? BG_TINT : "rgba(39,39,42,0.3)",
                border: `1px solid ${config.enabled ? BORDER_TINT : "#d1d5db"}`,
                borderRadius: "8px",
                opacity: config.enabled ? 1 : 0.65,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  {/* Left info */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3" }}>
                        {config.domain}
                      </span>
                      <span style={{
                        fontSize: "10px", fontWeight: 500,
                        padding: "2px 8px", borderRadius: "10px",
                        background: config.enabled ? "rgba(6,182,212,0.15)" : "rgba(113,113,122,0.15)",
                        color: config.enabled ? ACCENT_LIGHT : "#9ca3af",
                      }}>
                        {config.enabled ? "Active" : "En pause"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12px", color: "#6b7280" }}>
                      <span>{config.emails?.length || 0} email{(config.emails?.length || 0) > 1 ? "s" : ""} surveille{(config.emails?.length || 0) > 1 ? "s" : ""}</span>
                      <span>{config.frequency === "weekly" ? "Hebdomadaire" : "Mensuel"}</span>
                      <span>Dernier scan : {formatDate(config.lastScanAt)}</span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(config)}
                      disabled={togglingId === config._id}
                      title={config.enabled ? "Mettre en pause" : "Activer"}
                      style={{
                        width: "44px", height: "24px", borderRadius: "12px",
                        background: config.enabled ? ACCENT : "#3a3d4a",
                        border: "none", cursor: "pointer", position: "relative",
                        transition: "background 0.2s",
                        opacity: togglingId === config._id ? 0.5 : 1,
                      }}
                    >
                      <div style={{
                        width: "18px", height: "18px", borderRadius: "50%",
                        background: "#fff", position: "absolute", top: "3px",
                        left: config.enabled ? "23px" : "3px",
                        transition: "left 0.2s",
                      }} />
                    </button>

                    {/* Scan now */}
                    <button
                      onClick={() => handleScanNow(config)}
                      title="Scanner maintenant"
                      style={{
                        display: "flex", alignItems: "center", gap: "5px",
                        padding: "6px 12px", borderRadius: "6px",
                        background: "transparent", border: `1px solid ${BORDER_TINT}`,
                        color: ACCENT, fontSize: "12px", fontWeight: 500,
                        cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = BG_TINT; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <RefreshIcon size={13} />
                      Scanner
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(config._id)}
                      disabled={deletingId === config._id}
                      title="Supprimer"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: "32px", height: "32px", borderRadius: "6px",
                        background: "transparent", border: "1px solid rgba(239,68,68,0.2)",
                        cursor: "pointer", transition: "all 0.15s",
                        opacity: deletingId === config._id ? 0.5 : 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <TrashIcon size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add domain form */}
      <div style={{
        padding: "24px",
        background: BG_TINT,
        border: `1px solid ${BORDER_TINT}`,
        borderRadius: "10px",
      }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#d1d5db", marginBottom: "4px" }}>
          Ajouter un domaine
        </h2>
        <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "20px" }}>
          Configurez la surveillance automatique pour un nouveau domaine.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Domain */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#6b7280", marginBottom: "6px" }}>
              Domaine
            </label>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="monentreprise.fr"
              required
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "6px",
                background: "#1e2029", border: `1px solid ${BORDER_TINT}`,
                color: "#f0f0f3", fontSize: "13px", fontFamily: "inherit",
                outline: "none", transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = ACCENT; }}
              onBlur={e => { e.target.style.borderColor = BORDER_TINT; }}
            />
          </div>

          {/* Emails */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#6b7280", marginBottom: "6px" }}>
              Adresses email a surveiller (une par ligne)
            </label>
            <textarea
              value={emailsText}
              onChange={e => setEmailsText(e.target.value)}
              placeholder={"contact@monentreprise.fr\ndirection@monentreprise.fr\ncompta@monentreprise.fr"}
              rows={4}
              required
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "6px",
                background: "#1e2029", border: `1px solid ${BORDER_TINT}`,
                color: "#f0f0f3", fontSize: "13px", fontFamily: "inherit",
                outline: "none", resize: "vertical", transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = ACCENT; }}
              onBlur={e => { e.target.style.borderColor = BORDER_TINT; }}
            />
          </div>

          {/* Frequency + Alert email row */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "180px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#6b7280", marginBottom: "6px" }}>
                Frequence de scan
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "6px",
                  background: "#1e2029", border: `1px solid ${BORDER_TINT}`,
                  color: "#f0f0f3", fontSize: "13px", fontFamily: "inherit",
                  outline: "none", cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: "180px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#6b7280", marginBottom: "6px" }}>
                Email d'alerte (optionnel)
              </label>
              <input
                type="email"
                value={alertEmail}
                onChange={e => setAlertEmail(e.target.value)}
                placeholder="alerte@monentreprise.fr"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "6px",
                  background: "#1e2029", border: `1px solid ${BORDER_TINT}`,
                  color: "#f0f0f3", fontSize: "13px", fontFamily: "inherit",
                  outline: "none", transition: "border-color 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={e => { e.target.style.borderColor = ACCENT; }}
                onBlur={e => { e.target.style.borderColor = BORDER_TINT; }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "11px 24px", borderRadius: "8px",
              background: submitting ? "#2a2d3a" : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
              border: "none", color: "#fff", fontSize: "14px", fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
              alignSelf: "flex-start",
            }}
          >
            {submitting ? (
              <>
                <div style={{
                  width: "14px", height: "14px",
                  border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff",
                  borderRadius: "50%", animation: "vault-mon-spin 0.8s linear infinite",
                }} />
                Activation...
              </>
            ) : (
              <>
                <PlusIcon size={15} />
                Activer la surveillance
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
