import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import SubNav from "../components/SubNav";
import { VAULT_NAV, VAULT_ACCENT as ACCENT } from "./vaultNav";

const ListIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const PlusIcon = ({ size = 16, color = "#0f0f11" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = ({ size = 15, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const EditIcon = ({ size = 15, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const DownloadIcon = ({ size = 15, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const DATA_CATEGORIES = [
  { key: "nom", label: "Nom / Prénom" },
  { key: "email", label: "Adresse email" },
  { key: "telephone", label: "Téléphone" },
  { key: "adresse", label: "Adresse postale" },
  { key: "bancaire", label: "Données bancaires" },
  { key: "ip", label: "Adresse IP" },
  { key: "navigation", label: "Données de navigation" },
  { key: "localisation", label: "Géolocalisation" },
  { key: "sante", label: "Données de santé" },
  { key: "photo", label: "Photo / Image" },
];

const LEGAL_BASES = [
  { value: "consentement", label: "Consentement" },
  { value: "contrat", label: "Exécution d'un contrat" },
  { value: "obligation-legale", label: "Obligation légale" },
  { value: "interet-legitime", label: "Intérêt légitime" },
  { value: "interet-vital", label: "Intérêt vital" },
  { value: "mission-publique", label: "Mission d'intérêt public" },
];

const EMPTY_FORM = {
  name: "",
  purpose: "",
  dataCategories: [],
  legalBasis: "",
  retention: "",
  recipients: "",
};

export default function VaultRegistrePage() {
  const { get, post, del } = useApi();
  const { token } = useAuth();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const fetchTreatments = useCallback(async () => {
    try {
      const data = await get("/api/vault/registre");
      setTreatments(data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (key) => {
    setForm(prev => ({
      ...prev,
      dataCategories: prev.dataCategories.includes(key)
        ? prev.dataCategories.filter(c => c !== key)
        : [...prev.dataCategories, key],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Veuillez saisir le nom du traitement.");
      return;
    }
    if (!form.purpose.trim()) {
      setError("Veuillez indiquer la finalité du traitement.");
      return;
    }
    if (form.dataCategories.length === 0) {
      setError("Veuillez sélectionner au moins une catégorie de données.");
      return;
    }
    if (!form.legalBasis) {
      setError("Veuillez sélectionner une base légale.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await post("/api/vault/registre", { ...form, _id: editingId || undefined });
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      setEditingId(null);
      await fetchTreatments();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t) => {
    setForm({
      name: t.name,
      purpose: t.purpose,
      dataCategories: t.dataCategories || [],
      legalBasis: t.legalBasis || "",
      retention: t.retention || "",
      recipients: t.recipients || "",
    });
    setEditingId(t._id);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    try {
      await del(`/api/vault/registre/${id}`);
      setTreatments(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression.");
    }
  };

  const handleCancel = () => {
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    setEditingId(null);
    setError(null);
  };

  const handleExportPdf = async () => {
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${API}/api/vault/registre/export-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur export PDF");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "registre-traitements-rgpd.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = "w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#334155] text-sm font-[inherit] outline-none transition-colors duration-150 box-border focus:border-[#06b6d4]";
  const labelStyle = "block text-[13px] font-medium text-[#d1d5db] mb-1.5";

  return (
    <div className="max-w-[1100px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-11 h-11 rounded-[10px] bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
          <ListIcon size={24} color={ACCENT} />
        </div>
        <div className="flex-1">
          <h1 className="text-[22px] font-semibold text-[#0F172A] m-0">
            Registre des traitements
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Déclarez et gérez vos activités de traitement de données (RGPD Art. 30)
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-transparent rounded-sm mb-6 mt-4" />

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...EMPTY_FORM }); setError(null); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-none text-sm font-semibold font-[inherit] transition-all duration-150 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #06b6d4, #22d3ee)", color: "#0f0f11", boxShadow: "0 4px 16px rgba(6,182,212,0.25)" }}
        >
          <PlusIcon size={16} color="#0f0f11" />
          Nouveau traitement
        </button>
        {treatments.length > 0 && (
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[rgba(6,182,212,0.2)] bg-transparent text-[#06b6d4] text-sm font-medium cursor-pointer font-[inherit] transition-all duration-150 hover:bg-[rgba(6,182,212,0.08)]"
          >
            <DownloadIcon size={14} color="#06b6d4" />
            Exporter en PDF
          </button>
        )}
        <div className="ml-auto text-[13px] text-[#6b7280]">
          {treatments.length} traitement{treatments.length !== 1 ? "s" : ""} enregistré{treatments.length !== 1 ? "s" : ""}
        </div>
      </div>

      {error && (
        <div className="px-3.5 py-2.5 mb-6 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-md text-[13px] text-[#fca5a5]">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-[#F8FAFC] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-7">
          <h2 className="text-[15px] font-semibold text-[#0F172A] m-0 mb-5">
            {editingId ? "Modifier le traitement" : "Déclarer un nouveau traitement"}
          </h2>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 mb-5">
            <div>
              <label className={labelStyle}>Nom du traitement *</label>
              <input type="text" value={form.name} onChange={e => updateField("name", e.target.value)}
                placeholder="Ex: Gestion des clients" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Base légale *</label>
              <select value={form.legalBasis} onChange={e => updateField("legalBasis", e.target.value)}
                className={inputStyle} style={{ appearance: "none" }}>
                <option value="">Sélectionnez...</option>
                {LEGAL_BASES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelStyle}>Durée de conservation</label>
              <input type="text" value={form.retention} onChange={e => updateField("retention", e.target.value)}
                placeholder="Ex: 3 ans après la fin du contrat" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Destinataires</label>
              <input type="text" value={form.recipients} onChange={e => updateField("recipients", e.target.value)}
                placeholder="Ex: Service comptabilité, prestataire CRM" className={inputStyle} />
            </div>
          </div>

          <div className="mb-5">
            <label className={labelStyle}>Finalité du traitement *</label>
            <textarea value={form.purpose} onChange={e => updateField("purpose", e.target.value)}
              placeholder="Décrivez pourquoi vous collectez ces données..."
              rows={3}
              className={`${inputStyle} resize-y`} />
          </div>

          <div className="mb-5">
            <label className={labelStyle}>Catégories de données collectées *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {DATA_CATEGORIES.map(cat => {
                const selected = form.dataCategories.includes(cat.key);
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => toggleCategory(cat.key)}
                    className="px-3 py-1.5 rounded-md text-[12px] font-medium cursor-pointer font-[inherit] transition-all duration-150 border"
                    style={{
                      background: selected ? "rgba(6,182,212,0.15)" : "transparent",
                      borderColor: selected ? "#06b6d4" : "#E2E8F0",
                      color: selected ? "#22d3ee" : "#64748B",
                    }}
                  >
                    {selected ? "\u2713 " : ""}{cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-none text-sm font-semibold font-[inherit] transition-all duration-150 cursor-pointer"
              style={{
                background: saving ? "#E2E8F0" : "linear-gradient(135deg, #06b6d4, #22d3ee)",
                color: saving ? "#64748B" : "#0f0f11",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Enregistrer"}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-transparent text-[#9ca3af] text-sm cursor-pointer font-[inherit] transition-all duration-150 hover:border-[#3f3f46] hover:text-[#d1d5db]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-[13px] text-[#6b7280] text-center py-8">Chargement...</div>
      )}

      {/* Empty state */}
      {!loading && treatments.length === 0 && !showForm && (
        <div className="bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-[10px] px-6 py-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center">
          <ListIcon size={48} color={ACCENT} />
          <div className="text-base font-semibold text-[#0F172A] mt-4 mb-2">
            Aucun traitement déclaré
          </div>
          <div className="text-[13px] text-[#9ca3af] leading-relaxed max-w-[440px] mx-auto">
            Le registre des traitements est obligatoire pour toute entreprise traitant des données personnelles.
            Commencez par déclarer vos activités de traitement.
          </div>
        </div>
      )}

      {/* Treatments list */}
      {!loading && treatments.length > 0 && (
        <div className="flex flex-col gap-3">
          {treatments.map(t => (
            <div key={t._id} className="bg-[#F8FAFC] border border-[rgba(6,182,212,0.15)] rounded-[10px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-[15px] font-semibold text-[#0F172A]">{t.name}</div>
                  <div className="text-[12px] text-[#6b7280] mt-0.5">
                    Créé le {new Date(t.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleEdit(t)}
                    className="p-2 rounded-md border border-[rgba(6,182,212,0.2)] bg-transparent cursor-pointer transition-all duration-150 hover:bg-[rgba(6,182,212,0.08)]"
                    title="Modifier">
                    <EditIcon size={14} color={ACCENT} />
                  </button>
                  <button onClick={() => handleDelete(t._id)}
                    className="p-2 rounded-md border border-[rgba(239,68,68,0.2)] bg-transparent cursor-pointer transition-all duration-150 hover:bg-[rgba(239,68,68,0.08)]"
                    title="Supprimer">
                    <TrashIcon size={14} color="#ef4444" />
                  </button>
                </div>
              </div>

              <div className="text-[13px] text-[#d1d5db] mb-3 leading-relaxed">{t.purpose}</div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {(t.dataCategories || []).map(cat => {
                  const catInfo = DATA_CATEGORIES.find(c => c.key === cat);
                  return (
                    <span key={cat} className="px-2 py-0.5 rounded text-[11px] font-medium bg-[rgba(6,182,212,0.1)] text-[#22d3ee] border border-[rgba(6,182,212,0.2)]">
                      {catInfo?.label || cat}
                    </span>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-[#6b7280]">
                {t.legalBasis && (
                  <span>Base légale : <span className="text-[#9ca3af]">{LEGAL_BASES.find(b => b.value === t.legalBasis)?.label || t.legalBasis}</span></span>
                )}
                {t.retention && (
                  <span>Conservation : <span className="text-[#9ca3af]">{t.retention}</span></span>
                )}
                {t.recipients && (
                  <span>Destinataires : <span className="text-[#9ca3af]">{t.recipients}</span></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
