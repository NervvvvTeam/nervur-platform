import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const NEXUS_NAV = [
  { path: "/app/nexus", label: "Générateur", end: true },
  { path: "/app/nexus/contacts", label: "Contacts" },
  { path: "/app/nexus/campaigns", label: "Campagnes" },
  { path: "/app/nexus/sequences", label: "Séquences" },
  { path: "/app/nexus/calendar", label: "Calendrier" },
];

export default function NexusCampaignsPage() {
  const api = useApi();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(null);
  const [lists, setLists] = useState([]);

  // Create form
  const [objective, setObjective] = useState("Présenter nos services");
  const [companyName, setCompanyName] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professionnel");
  const [selectedList, setSelectedList] = useState("Tous les contacts");
  const [generated, setGenerated] = useState(null);
  const [editSubject, setEditSubject] = useState("");
  const [editHtml, setEditHtml] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campData, listData] = await Promise.all([
        api.get("/api/nexus/email/campaigns"),
        api.get("/api/nexus/email/contacts/lists"),
      ]);
      setCampaigns(campData.campaigns || []);
      setLists(listData.lists || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async () => {
    setGenerating(true);
    try {
      const data = await api.post("/api/nexus/email/generate-email", {
        objective, companyName: companyName.trim(), audience: audience.trim(), tone,
      });
      setGenerated(data);
      setEditSubject(data.subject || "");
      setEditHtml(data.html || "");
    } catch (err) {
      alert("Erreur IA : " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const saveCampaign = async () => {
    if (!editSubject.trim() || !editHtml.trim()) return;
    try {
      await api.post("/api/nexus/email/campaigns", {
        name: editSubject,
        subject: editSubject,
        htmlContent: editHtml,
        textContent: generated?.textContent || "",
        fromName: companyName || "NERVÜR",
        listName: selectedList,
      });
      setShowCreate(false);
      setGenerated(null);
      setEditSubject("");
      setEditHtml("");
      loadData();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const sendCampaign = async (id) => {
    if (!confirm("Envoyer cette campagne à tous les contacts de la liste ?")) return;
    setSending(id);
    try {
      const data = await api.post(`/api/nexus/email/campaigns/${id}/send`);
      alert(`Campagne envoyée ! ${data.sent} emails envoyés, ${data.failed} échoués.`);
      loadData();
    } catch (err) {
      alert("Erreur envoi : " + err.message);
    } finally {
      setSending(null);
    }
  };

  const deleteCampaign = async (id) => {
    if (!confirm("Supprimer cette campagne ?")) return;
    try {
      await api.del(`/api/nexus/email/campaigns/${id}`);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ maxWidth: "1100px" }}>
      <SubNav color="#10b981" items={NEXUS_NAV} />
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #10b981, #34d399)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>Campagnes email</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>Créez et envoyez des campagnes email avec l'IA.</p>
      </div>

      <button onClick={() => setShowCreate(!showCreate)}
        style={{ padding: "10px 22px", background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", marginBottom: "24px", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>
        + Nouvelle campagne
      </button>

      {/* Create campaign */}
      {showCreate && (
        <div style={{ padding: "24px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", marginBottom: "24px" }}>
          <div style={{ fontSize: "15px", fontWeight: 500, color: "#f0f0f3", marginBottom: "18px" }}>Créer une campagne</div>

          {!generated ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Objectif de l'email</div>
                  <input type="text" value={objective} onChange={e => setObjective(e.target.value)}
                    placeholder="Présenter nos services, promotion, invitation..."
                    style={{ width: "100%", padding: "10px 14px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "8px", color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#2a2d3a"} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Entreprise</div>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                    placeholder="NERVÜR"
                    style={{ width: "100%", padding: "10px 14px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "8px", color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#2a2d3a"} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Audience</div>
                  <input type="text" value={audience} onChange={e => setAudience(e.target.value)}
                    placeholder="Restaurateurs, e-commerçants..."
                    style={{ width: "100%", padding: "10px 14px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "8px", color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#2a2d3a"} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Liste de contacts</div>
                  <select value={selectedList} onChange={e => setSelectedList(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "8px", color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#2a2d3a"}>
                    <option value="Tous les contacts">Tous les contacts</option>
                    {lists.map(l => <option key={l.name} value={l.name}>{l.name} ({l.active} actifs)</option>)}
                  </select>
                </div>
              </div>
              <button onClick={generateEmail} disabled={generating || !objective.trim()}
                style={{ padding: "10px 22px", background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: generating ? "wait" : "pointer", fontFamily: "inherit", opacity: generating ? 0.5 : 1, boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>
                {generating ? "Génération IA..." : "Générer l'email"}
              </button>
            </>
          ) : (
            <>
              {/* Edit generated email */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Objet</div>
                <input type="text" value={editSubject} onChange={e => setEditSubject(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "8px", color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#2a2d3a"} />
              </div>

              {/* Preview */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Aperçu</div>
                <div style={{
                  background: "#fff", borderRadius: "8px", padding: "20px",
                  maxHeight: "400px", overflowY: "auto",
                }} dangerouslySetInnerHTML={{ __html: editHtml }} />
              </div>

              {/* HTML editor */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Code HTML (modifiable)</div>
                <textarea value={editHtml} onChange={e => setEditHtml(e.target.value)} rows={8}
                  style={{ width: "100%", padding: "12px 14px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "8px", color: "#6b7280", fontSize: "12px", fontFamily: "monospace", outline: "none", boxSizing: "border-box", resize: "vertical", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#10b981"}
                  onBlur={e => e.target.style.borderColor = "#2a2d3a"} />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={saveCampaign}
                  style={{ padding: "10px 22px", background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>
                  Sauvegarder le brouillon
                </button>
                <button onClick={generateEmail} disabled={generating}
                  style={{ padding: "10px 22px", background: "transparent", border: "1px solid #2a2d3a", borderRadius: "8px", color: "#6b7280", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
                  Régénérer
                </button>
                <button onClick={() => { setGenerated(null); setShowCreate(false); }}
                  style={{ padding: "10px 22px", background: "transparent", border: "1px solid #2a2d3a", borderRadius: "8px", color: "#9ca3af", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
                  Annuler
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Campaign list */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#9ca3af" }}>Chargement...</div>
      ) : campaigns.length === 0 && !showCreate ? (
        <div style={{ padding: "60px 24px", textAlign: "center", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: "16px", color: "#9ca3af", marginBottom: "8px" }}>Aucune campagne</div>
          <p style={{ fontSize: "14px", color: "#d1d5db" }}>Créez votre première campagne email avec l'IA.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {campaigns.map(c => (
            <div key={c._id} style={{
              padding: "20px 24px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              borderLeft: c.status === "sent" ? "3px solid #10b981" : "3px solid #10b981",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 500, color: "#d1d5db", marginBottom: "2px" }}>{c.subject}</div>
                  <div style={{ fontSize: "12px", color: "#d1d5db" }}>
                    {c.listName} — {formatDate(c.createdAt)}
                  </div>
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "4px",
                  background: c.status === "sent" ? "#10b98114" : "#f59e0b14",
                  color: c.status === "sent" ? "#10b981" : "#f59e0b",
                }}>
                  {c.status === "sent" ? "Envoyé" : c.status === "draft" ? "Brouillon" : c.status}
                </span>
              </div>

              {/* Stats for sent campaigns */}
              {c.status === "sent" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
                  {[
                    { label: "Envoyés", value: c.stats?.sent || 0, color: "#f0f0f3" },
                    { label: "Délivrés", value: c.stats?.delivered || 0, color: "#10b981" },
                    { label: "Ouverts", value: c.stats?.opened || 0, color: "#3b82f6" },
                    { label: "Cliqués", value: c.stats?.clicked || 0, color: "#8b5cf6" },
                  ].map(s => (
                    <div key={s.label} style={{ padding: "10px 14px", background: "#1e2029", borderRadius: "6px", border: "1px solid #2a2d3a" }}>
                      <div style={{ fontSize: "18px", fontWeight: 600, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: "11px", color: "#9ca3af" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px" }}>
                {c.status === "draft" && (
                  <button onClick={() => sendCampaign(c._id)} disabled={sending === c._id}
                    style={{ padding: "7px 16px", background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: sending === c._id ? "wait" : "pointer", fontFamily: "inherit", opacity: sending === c._id ? 0.5 : 1, boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>
                    {sending === c._id ? "Envoi..." : "Envoyer"}
                  </button>
                )}
                <button onClick={() => deleteCampaign(c._id)}
                  style={{ padding: "7px 16px", background: "transparent", border: "1px solid #2a2d3a", borderRadius: "6px", color: "#9ca3af", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
