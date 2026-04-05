import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import SubNav from "../components/SubNav";
import { VAULT_NAV, VAULT_ACCENT as ACCENT } from "./vaultNav";
const ACCENT_LIGHT = "#22d3ee";
const BG_TINT = "rgba(6,182,212,0.06)";
const BORDER_TINT = "rgba(6,182,212,0.2)";

const EyeIcon = ({ size = 20, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const TrashIcon = ({ size = 15, color = "#6B7C93" }) => (
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
    <div className="max-w-[1100px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />
      {/* Header bar */}
      <div className="w-10 h-[3px] rounded-sm bg-gradient-to-br from-[#06b6d4] to-[#22d3ee] mb-4" />
      <div className="flex items-center gap-3 mb-1.5">
        <EyeIcon size={26} />
        <h1 className="text-[22px] font-semibold text-[#0A2540] m-0">
          Surveillance Vault
        </h1>
      </div>
      <p className="text-sm text-[#9ca3af] mb-8">
        Surveillez automatiquement vos domaines et recevez des alertes en cas de nouvelle fuite.
      </p>

      {/* Messages */}
      {error && (
        <div className="px-3.5 py-2.5 mb-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-md text-[13px] text-[#fca5a5]">
          {error}
          <button onClick={() => setError(null)} className="float-right bg-transparent border-none text-[#fca5a5] cursor-pointer text-sm p-0 leading-none">x</button>
        </div>
      )}
      {success && (
        <div className="px-3.5 py-2.5 mb-4 bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] rounded-md text-[13px] text-[#22d3ee]">
          {success}
        </div>
      )}

      {/* Active monitoring list */}
      <div className="mb-9">
        <h2 className="text-[15px] font-semibold text-[#d1d5db] mb-4">
          Surveillance active
        </h2>

        {loading && (
          <div className="text-center py-8">
            <div className="w-7 h-7 mx-auto mb-2.5 border-[3px] border-[rgba(6,182,212,0.2)] border-t-[#06b6d4] rounded-full animate-[vault-mon-spin_1s_linear_infinite]" />
            <div className="text-xs text-[#9ca3af]">Chargement...</div>
            <style>{`@keyframes vault-mon-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && configs.length === 0 && (
          <div className="px-6 py-10 text-center bg-[rgba(6,182,212,0.06)] border border-dashed border-[rgba(6,182,212,0.2)] rounded-lg">
            <EyeIcon size={36} color="#425466" />
            <p className="text-sm text-[#9ca3af] mt-3 mb-1">
              Aucune surveillance configuree
            </p>
            <p className="text-xs text-[#d1d5db]">
              Ajoutez un domaine ci-dessous pour commencer la surveillance automatique.
            </p>
          </div>
        )}

        {!loading && configs.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {configs.map(config => (
              <div key={config._id} className="px-[18px] py-4 rounded-lg transition-all duration-200" style={{
                background: config.enabled ? BG_TINT : "rgba(39,39,42,0.3)",
                border: `1px solid ${config.enabled ? BORDER_TINT : "#425466"}`,
                opacity: config.enabled ? 1 : 0.65,
              }}>
                <div className="flex items-center justify-between flex-wrap gap-2.5">
                  {/* Left info */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[15px] font-semibold text-[#0A2540]">
                        {config.domain}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-[10px]" style={{
                        background: config.enabled ? "rgba(6,182,212,0.15)" : "rgba(113,113,122,0.15)",
                        color: config.enabled ? ACCENT_LIGHT : "#6B7C93",
                      }}>
                        {config.enabled ? "Active" : "En pause"}
                      </span>
                    </div>
                    <div className="flex gap-4 flex-wrap text-xs text-[#6b7280]">
                      <span>{config.emails?.length || 0} email{(config.emails?.length || 0) > 1 ? "s" : ""} surveille{(config.emails?.length || 0) > 1 ? "s" : ""}</span>
                      <span>{config.frequency === "weekly" ? "Hebdomadaire" : "Mensuel"}</span>
                      <span>Dernier scan : {formatDate(config.lastScanAt)}</span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(config)}
                      disabled={togglingId === config._id}
                      title={config.enabled ? "Mettre en pause" : "Activer"}
                      className="w-11 h-6 rounded-xl border-none cursor-pointer relative transition-colors duration-200"
                      style={{
                        background: config.enabled ? ACCENT : "#3a3d4a",
                        opacity: togglingId === config._id ? 0.5 : 1,
                      }}
                    >
                      <div className="w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-[left] duration-200" style={{
                        left: config.enabled ? "23px" : "3px",
                      }} />
                    </button>

                    {/* Scan now */}
                    <button
                      onClick={() => handleScanNow(config)}
                      title="Scanner maintenant"
                      className="flex items-center gap-[5px] px-3 py-1.5 rounded-md bg-transparent border border-[rgba(6,182,212,0.2)] text-[#06b6d4] text-xs font-medium cursor-pointer font-[inherit] transition-all duration-150 hover:bg-[rgba(6,182,212,0.06)]"
                    >
                      <RefreshIcon size={13} />
                      Scanner
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(config._id)}
                      disabled={deletingId === config._id}
                      title="Supprimer"
                      className="flex items-center justify-center w-8 h-8 rounded-md bg-transparent border border-[rgba(239,68,68,0.2)] cursor-pointer transition-all duration-150 hover:bg-[rgba(239,68,68,0.1)]"
                      style={{ opacity: deletingId === config._id ? 0.5 : 1 }}
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
      <div className="p-6 bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.2)] rounded-[10px]">
        <h2 className="text-[15px] font-semibold text-[#d1d5db] mb-1">
          Ajouter un domaine
        </h2>
        <p className="text-xs text-[#9ca3af] mb-5">
          Configurez la surveillance automatique pour un nouveau domaine.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Domain */}
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1.5">
              Domaine
            </label>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="monentreprise.fr"
              required
              className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[rgba(6,182,212,0.2)] text-[#0A2540] text-[13px] font-[inherit] outline-none transition-colors duration-150 box-border focus:border-[#06b6d4]"
            />
          </div>

          {/* Emails */}
          <div>
            <label className="block text-xs font-medium text-[#6b7280] mb-1.5">
              Adresses email a surveiller (une par ligne)
            </label>
            <textarea
              value={emailsText}
              onChange={e => setEmailsText(e.target.value)}
              placeholder={"contact@monentreprise.fr\ndirection@monentreprise.fr\ncompta@monentreprise.fr"}
              rows={4}
              required
              className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[rgba(6,182,212,0.2)] text-[#0A2540] text-[13px] font-[inherit] outline-none resize-y transition-colors duration-150 box-border focus:border-[#06b6d4]"
            />
          </div>

          {/* Frequency + Alert email row */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-[#6b7280] mb-1.5">
                Frequence de scan
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[rgba(6,182,212,0.2)] text-[#0A2540] text-[13px] font-[inherit] outline-none cursor-pointer box-border"
              >
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-[#6b7280] mb-1.5">
                Email d'alerte (optionnel)
              </label>
              <input
                type="email"
                value={alertEmail}
                onChange={e => setAlertEmail(e.target.value)}
                placeholder="alerte@monentreprise.fr"
                className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[rgba(6,182,212,0.2)] text-[#0A2540] text-[13px] font-[inherit] outline-none transition-colors duration-150 box-border focus:border-[#06b6d4]"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-6 py-[11px] rounded-lg border-none text-white text-sm font-semibold font-[inherit] transition-all duration-200 self-start"
            style={{
              background: submitting ? "#E3E8EE" : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[rgba(0,0,0,0.15)] border-t-white rounded-full animate-[vault-mon-spin_0.8s_linear_infinite]" />
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
