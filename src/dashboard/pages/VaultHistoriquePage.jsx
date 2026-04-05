import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import SubNav from "../components/SubNav";
import { VAULT_NAV, VAULT_ACCENT as ACCENT } from "./vaultNav";

const ClockIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const GlobeIcon = ({ size = 16, color = "#6B7C93" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const TrashIcon = ({ size = 14, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function getScoreColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getScoreLabel(score) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Correct";
  if (score >= 40) return "Insuffisant";
  return "Critique";
}

const FileIcon = ({ size = 20, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const DownloadIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

function formatDateFr(dateStr) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function VaultHistoriquePage() {
  const { get, del } = useApi();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analyses");
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await get("/api/vault/rgpd-history");
      setHistory(data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Fetch generated documents
  useEffect(() => {
    async function loadDocs() {
      try {
        const docs = await get("/api/vault/documents");
        setDocuments(docs);
      } catch {
        // Demo fallback
        setDocuments([
          { id: "demo-doc-1", documentType: "mentions-legales", label: "Mentions l\u00e9gales", company: "Ma Soci\u00e9t\u00e9", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
          { id: "demo-doc-2", documentType: "politique-confidentialite", label: "Politique de confidentialit\u00e9", company: "Ma Soci\u00e9t\u00e9", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
          { id: "demo-doc-3", documentType: "cgv", label: "Conditions g\u00e9n\u00e9rales de vente", company: "Ma Soci\u00e9t\u00e9", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        ]);
      } finally {
        setDocsLoading(false);
      }
    }
    loadDocs();
  }, [get]);

  const downloadPdf = async (docId, label) => {
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("sentinel_token");
      const res = await fetch(`${API}/api/vault/documents/${docId}/pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${label.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erreur t\u00e9l\u00e9chargement PDF:", e);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer cette analyse ?")) return;
    try {
      await del(`/api/vault/rgpd-scan/${id}`);
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch {
      // silently fail
    }
  };

  const handleView = (id) => {
    navigate("/app/vault/rgpd", { state: { loadScanId: id } });
  };

  // Group scans by domain for evolution tracking
  const domainGroups = {};
  for (const scan of history) {
    const domain = scan.domain || "inconnu";
    if (!domainGroups[domain]) domainGroups[domain] = [];
    domainGroups[domain].push(scan);
  }

  return (
    <div className="max-w-[1100px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-11 h-11 rounded-[10px] bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
          <ClockIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#0A2540] m-0">
            Historique
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Analyses de conformit&eacute; et documents g&eacute;n&eacute;r&eacute;s
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-transparent rounded-sm mb-5 mt-4" />

      {/* Tab buttons */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "analyses", label: "Analyses" },
          { key: "documents", label: "Documents" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="px-4 py-[7px] rounded-lg text-[13px] font-semibold border cursor-pointer transition-all duration-150 font-[inherit]"
            style={{
              background: activeTab === t.key ? "rgba(6,182,212,0.12)" : "transparent",
              color: activeTab === t.key ? ACCENT : "#64748b",
              borderColor: activeTab === t.key ? "rgba(6,182,212,0.3)" : "rgba(0,0,0,0.06)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== ANALYSES TAB ===== */}
      {activeTab === "analyses" && <>
      {/* Loading */}
      {loading && (
        <div className="text-[13px] text-[#6b7280] text-center py-8">Chargement de l'historique...</div>
      )}

      {/* Empty state */}
      {!loading && history.length === 0 && (
        <div className="bg-white border border-[#E3E8EE] rounded-[10px] px-6 py-10 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center">
          <ClockIcon size={40} color="#6B7C93" />
          <div className="text-base font-semibold text-[#6b7280] mt-3 mb-1.5">
            Aucune analyse effectuée
          </div>
          <div className="text-[13px] text-[#52525b] leading-relaxed max-w-[400px] mx-auto mb-4">
            Lancez votre première analyse de conformité depuis l'onglet Scan RGPD pour commencer à suivre l'évolution de votre site.
          </div>
          <button
            onClick={() => navigate("/app/vault/rgpd")}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border-none text-sm font-semibold font-[inherit] cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #22d3ee)`, color: "#0f0f11" }}
          >
            Lancer un scan
          </button>
        </div>
      )}

      {/* History by domain */}
      {!loading && Object.keys(domainGroups).length > 0 && (
        <div className="flex flex-col gap-6">
          {Object.entries(domainGroups).map(([domain, scans]) => (
            <div key={domain}>
              <div className="flex items-center gap-2 mb-3">
                <GlobeIcon size={16} color={ACCENT} />
                <h3 className="text-[15px] font-semibold text-[#0A2540] m-0">{domain}</h3>
                <span className="text-[11px] text-[#6b7280] bg-[rgba(107,114,128,0.15)] px-2 py-0.5 rounded">
                  {scans.length} analyse{scans.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Score evolution mini chart */}
              {scans.filter(s => s.status === "completed" && s.score != null).length >= 2 && (
                <div className="bg-[rgba(6,182,212,0.04)] border border-[rgba(6,182,212,0.12)] rounded-lg px-5 py-3 mb-3">
                  <div className="text-[11px] text-[#6b7280] mb-2 font-medium">Évolution du score</div>
                  <div className="flex items-end gap-1 h-[40px]">
                    {scans.filter(s => s.status === "completed" && s.score != null).reverse().map((s, i) => {
                      const height = Math.max(4, (s.score / 100) * 36);
                      const color = getScoreColor(s.score);
                      return (
                        <div key={s._id} title={`${s.score}/100 — ${formatDate(s.createdAt)}`}
                          className="flex-1 max-w-[40px] rounded-t-sm transition-all duration-300 cursor-help"
                          style={{ height: `${height}px`, background: color, opacity: 0.8 }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scan list */}
              <div className="flex flex-col gap-2">
                {scans.map(scan => (
                  <div
                    key={scan._id}
                    onClick={() => handleView(scan._id)}
                    className="bg-white rounded-[10px] px-[18px] py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] cursor-pointer transition-all duration-150 flex items-center justify-between border border-[#E3E8EE] hover:border-[rgba(6,182,212,0.3)] hover:bg-[rgba(6,182,212,0.04)]"
                  >
                    <div className="flex items-center gap-3">
                      <GlobeIcon size={16} color="#6B7C93" />
                      <div>
                        <div className="text-[13px] font-semibold text-[#0A2540]">
                          {scan.url || scan.domain}
                        </div>
                        <div className="text-[11px] text-[#6b7280] mt-0.5">
                          {formatDate(scan.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {scan.status === "completed" && scan.score != null && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#6b7280]">
                            {getScoreLabel(scan.score)}
                          </span>
                          <span className="text-sm font-bold" style={{ color: getScoreColor(scan.score) }}>
                            {scan.score}/100
                          </span>
                        </div>
                      )}
                      {scan.status === "error" && (
                        <span className="text-[11px] text-[#ef4444]">Erreur</span>
                      )}
                      {scan.status === "scanning" && (
                        <span className="text-[11px] text-[#eab308]">En cours</span>
                      )}
                      <button
                        onClick={(e) => handleDelete(scan._id, e)}
                        className="p-1.5 rounded-md bg-transparent border-none cursor-pointer transition-all duration-150 hover:bg-[rgba(239,68,68,0.1)]"
                        title="Supprimer"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </>}

      {/* ===== DOCUMENTS TAB ===== */}
      {activeTab === "documents" && <>
        {docsLoading && (
          <div className="text-[13px] text-[#6b7280] text-center py-8">Chargement des documents...</div>
        )}

        {/* Empty state */}
        {!docsLoading && documents.length === 0 && (
          <div className="bg-white border border-[#E3E8EE] rounded-[10px] px-6 py-10 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center">
            <FileIcon size={40} color="#6B7C93" />
            <div className="text-base font-semibold text-[#6b7280] mt-3 mb-1.5">
              Aucun document g&eacute;n&eacute;r&eacute;
            </div>
            <div className="text-[13px] text-[#52525b] leading-relaxed max-w-[440px] mx-auto mb-4">
              Rendez-vous dans le G&eacute;n&eacute;rateur pour cr&eacute;er vos documents juridiques.
            </div>
            <button
              onClick={() => navigate("/app/vault/generateur")}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border-none text-sm font-semibold font-[inherit] cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #22d3ee)`, color: "#0f0f11" }}
            >
              Ouvrir le g&eacute;n&eacute;rateur
            </button>
          </div>
        )}

        {/* Documents list */}
        {!docsLoading && documents.length > 0 && (
          <div className="flex flex-col gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id || doc._id}
                className="bg-white rounded-[10px] px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#E3E8EE] hover:border-[rgba(6,182,212,0.25)] transition-all duration-150 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.18)] flex items-center justify-center flex-shrink-0">
                    <FileIcon size={20} color={ACCENT} />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-[#0A2540]">
                      {doc.label}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {doc.company && (
                        <span className="text-[11px] text-[#9ca3af]">{doc.company}</span>
                      )}
                      <span className="text-[11px] text-[#6b7280]">
                        G&eacute;n&eacute;r&eacute; le {formatDateFr(doc.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/app/vault/generateur", { state: { viewDocId: doc.id || doc._id } })}
                    className="flex items-center gap-1.5 px-3 py-[6px] rounded-lg text-[12px] font-semibold border cursor-pointer transition-all duration-150 font-[inherit]"
                    style={{
                      background: "transparent",
                      color: "#6B7C93",
                      borderColor: "rgba(0,0,0,0.08)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)"; e.currentTarget.style.color = "#0A2540"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; e.currentTarget.style.color = "#6B7C93"; }}
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => downloadPdf(doc.id || doc._id, doc.label)}
                    className="flex items-center gap-1.5 px-3 py-[6px] rounded-lg text-[12px] font-semibold border-none cursor-pointer transition-all duration-150 font-[inherit]"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT}, #22d3ee)`,
                      color: "#0f0f11",
                    }}
                  >
                    <DownloadIcon size={13} color="#0f0f11" />
                    T&eacute;l&eacute;charger PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>}
    </div>
  );
}
