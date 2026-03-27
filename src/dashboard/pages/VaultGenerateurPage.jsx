import { useState, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import SubNav from "../components/SubNav";

const VAULT_NAV = [
  { path: "/app/vault", label: "Dashboard", end: true },
  { path: "/app/vault/rgpd", label: "Scan RGPD" },
  { path: "/app/vault/generateur", label: "Générateur" },
  { path: "/app/vault/historique", label: "Historique" },
];

const ACCENT = "#06b6d4";

const FileIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const CopyIcon = ({ size = 15, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const DownloadIcon = ({ size = 15, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const CheckIcon = ({ size = 15, color = "#22c55e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const FORMES_JURIDIQUES = [
  "Auto-entrepreneur",
  "SARL",
  "SAS",
  "SASU",
  "EURL",
  "SCI",
  "Association loi 1901",
  "Autre",
];

const DOC_TYPES = [
  {
    key: "mentions-legales",
    label: "Mentions légales",
    description: "Obligatoire pour tout site professionnel (LCEN). Identité de l'éditeur, hébergeur, directeur de publication.",
    color: "#06b6d4",
  },
  {
    key: "politique-confidentialite",
    label: "Politique de confidentialité",
    description: "Obligatoire selon le RGPD (Art. 13-14). Données collectées, finalités, droits des utilisateurs.",
    color: "#8b5cf6",
  },
  {
    key: "cgv",
    label: "Conditions Générales de Vente",
    description: "Obligatoire pour le e-commerce. Prix, livraison, rétractation, garanties, litiges.",
    color: "#f59e0b",
  },
  {
    key: "politique-cookies",
    label: "Politique de cookies",
    description: "Recommandée par la CNIL. Types de cookies utilisés, finalités, durée de conservation.",
    color: "#22c55e",
  },
];

export default function VaultGenerateurPage() {
  const { post } = useApi();
  const { token } = useAuth();
  const [form, setForm] = useState({
    nomEntreprise: "",
    formeJuridique: "",
    adresse: "",
    siret: "",
    email: "",
    telephone: "",
    activite: "",
    siteUrl: "",
    hebergeur: "",
    directeurPublication: "",
  });
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = useCallback(async (docType) => {
    if (!form.nomEntreprise.trim()) {
      setError("Veuillez renseigner le nom de votre entreprise.");
      return;
    }
    if (!form.email.trim()) {
      setError("Veuillez renseigner votre adresse email de contact.");
      return;
    }

    setError(null);
    setLoading(true);
    setGeneratedDoc(null);
    setSelectedDoc(docType);
    setCopied(false);

    try {
      const result = await post("/api/vault/generate-document", {
        documentType: docType,
        companyInfo: form,
      });
      setGeneratedDoc(result);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la génération du document.");
    } finally {
      setLoading(false);
    }
  }, [form, post]);

  const handleCopy = () => {
    if (generatedDoc?.content) {
      navigator.clipboard.writeText(generatedDoc.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = async () => {
    if (!generatedDoc?.content) return;
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${API}/api/vault/generate-document/pdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: selectedDoc,
          companyInfo: form,
          content: generatedDoc.content,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors du téléchargement.");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const docLabel = DOC_TYPES.find(d => d.key === selectedDoc)?.label || selectedDoc;
      a.download = `${docLabel.replace(/\s+/g, "-").toLowerCase()}-${form.nomEntreprise.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = "w-full px-3.5 py-2.5 bg-[#141520] border border-[#2a2d3a] rounded-lg text-[#e4e4e7] text-sm font-[inherit] outline-none transition-colors duration-150 box-border focus:border-[#06b6d4]";
  const labelStyle = "block text-[13px] font-medium text-[#d1d5db] mb-1.5";

  return (
    <div className="max-w-[860px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-11 h-11 rounded-[10px] bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
          <FileIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#f0f0f3] m-0">
            Générateur de documents
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Créez vos documents juridiques en quelques clics
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-transparent rounded-sm mb-6 mt-4" />

      {/* Company info form */}
      <div className="bg-[#1e2029] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-7">
        <div className="flex items-center gap-2 mb-5">
          <FileIcon size={18} color={ACCENT} />
          <h2 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
            Informations de votre entreprise
          </h2>
        </div>
        <p className="text-[12px] text-[#6b7280] mb-5 leading-relaxed">
          Ces informations seront utilisées pour générer vos documents juridiques. Plus vous remplissez de champs, plus vos documents seront complets.
        </p>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          <div>
            <label className={labelStyle}>Nom de l'entreprise *</label>
            <input type="text" value={form.nomEntreprise} onChange={e => updateField("nomEntreprise", e.target.value)}
              placeholder="Ma Société" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Forme juridique</label>
            <select value={form.formeJuridique} onChange={e => updateField("formeJuridique", e.target.value)}
              className={inputStyle} style={{ appearance: "none" }}>
              <option value="">Sélectionnez...</option>
              {FORMES_JURIDIQUES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={labelStyle}>Adresse du siège</label>
            <input type="text" value={form.adresse} onChange={e => updateField("adresse", e.target.value)}
              placeholder="12 rue de la Paix, 75002 Paris" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Numéro SIRET</label>
            <input type="text" value={form.siret} onChange={e => updateField("siret", e.target.value)}
              placeholder="123 456 789 00001" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Email de contact *</label>
            <input type="email" value={form.email} onChange={e => updateField("email", e.target.value)}
              placeholder="contact@monsite.fr" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Téléphone</label>
            <input type="tel" value={form.telephone} onChange={e => updateField("telephone", e.target.value)}
              placeholder="01 23 45 67 89" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Activité de l'entreprise</label>
            <input type="text" value={form.activite} onChange={e => updateField("activite", e.target.value)}
              placeholder="Vente en ligne de vêtements" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>URL du site web</label>
            <input type="text" value={form.siteUrl} onChange={e => updateField("siteUrl", e.target.value)}
              placeholder="https://monsite.fr" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Hébergeur du site</label>
            <input type="text" value={form.hebergeur} onChange={e => updateField("hebergeur", e.target.value)}
              placeholder="OVH, o2switch, Infomaniak..." className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Directeur de publication</label>
            <input type="text" value={form.directeurPublication} onChange={e => updateField("directeurPublication", e.target.value)}
              placeholder="Prénom Nom" className={inputStyle} />
          </div>
        </div>
      </div>

      {/* Document type selection */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-4">
          <FileIcon size={18} color={ACCENT} />
          <h2 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
            Choisissez un document à générer
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {DOC_TYPES.map(doc => (
            <button
              key={doc.key}
              onClick={() => handleGenerate(doc.key)}
              disabled={loading}
              className="bg-[#1e2029] rounded-[10px] px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-left cursor-pointer font-[inherit] transition-all duration-150 hover:bg-[rgba(6,182,212,0.04)]"
              style={{
                border: selectedDoc === doc.key ? `1px solid ${doc.color}` : "1px solid rgba(6,182,212,0.15)",
                opacity: loading && selectedDoc !== doc.key ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: doc.color }} />
                <span className="text-sm font-semibold text-[#f0f0f3]">{doc.label}</span>
              </div>
              <div className="text-[11px] text-[#6b7280] leading-relaxed">
                {doc.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="px-3.5 py-2.5 mb-6 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-md text-[13px] text-[#fca5a5]">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] px-6 py-12 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center mb-7">
          <div className="mb-5">
            <div className="w-16 h-16 mx-auto border-[3px] border-[rgba(6,182,212,0.2)] border-t-[#06b6d4] rounded-full animate-[gen-spin_1s_linear_infinite]" />
          </div>
          <div className="text-base font-semibold text-[#f0f0f3] mb-2">
            Génération en cours...
          </div>
          <div className="text-[13px] text-[#9ca3af] leading-relaxed">
            Nous rédigeons votre document juridique personnalisé.
          </div>
          <style>{`@keyframes gen-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Generated document */}
      {generatedDoc && !loading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <FileIcon size={18} color={ACCENT} />
              <h3 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
                {DOC_TYPES.find(d => d.key === selectedDoc)?.label || "Document"}
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-md border border-[rgba(6,182,212,0.2)] bg-transparent text-[#06b6d4] text-xs font-medium cursor-pointer font-[inherit] transition-all duration-150 hover:bg-[rgba(6,182,212,0.08)]"
              >
                {copied ? <CheckIcon size={14} color="#22c55e" /> : <CopyIcon size={14} color="#06b6d4" />}
                {copied ? "Copié !" : "Copier le texte"}
              </button>
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-md border-none text-white text-xs font-medium cursor-pointer font-[inherit] transition-all duration-150"
                style={{ background: "linear-gradient(135deg, #06b6d4, #22d3ee)" }}
              >
                <DownloadIcon size={14} />
                Télécharger en PDF
              </button>
            </div>
          </div>

          <div className="bg-[#1e2029] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            <div className="text-[13px] text-[#d1d5db] leading-[1.9] whitespace-pre-wrap font-mono">
              {generatedDoc.content}
            </div>
          </div>

          <div className="mt-3 px-4 py-2.5 bg-[rgba(234,179,8,0.08)] border border-[rgba(234,179,8,0.2)] rounded-md text-[12px] text-[#fbbf24] leading-relaxed">
            Ce document est généré automatiquement à titre indicatif. Il est recommandé de le faire valider par un professionnel du droit avant publication.
          </div>
        </div>
      )}
    </div>
  );
}
