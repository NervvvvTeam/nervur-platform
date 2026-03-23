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

const TYPES = [
  { value: "Post LinkedIn", label: "LinkedIn" },
  { value: "Post Instagram", label: "Instagram" },
  { value: "Post Facebook", label: "Facebook" },
  { value: "Tweet/X", label: "X (Twitter)" },
  { value: "Email Marketing", label: "Email" },
  { value: "Description Produit", label: "Fiche produit" },
];

const TONES = [
  { value: "Professionnel", label: "Professionnel" },
  { value: "Decontracte", label: "Décontracté" },
  { value: "Inspirant", label: "Inspirant" },
  { value: "Persuasif", label: "Persuasif" },
];

export default function NexusDashboardPage() {
  const api = useApi();
  const [type, setType] = useState("Post LinkedIn");
  const [tone, setTone] = useState("Professionnel");
  const [topic, setTopic] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("generate");
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  const loadTemplates = async () => {
    try {
      const data = await api.get("/api/nexus/templates");
      setTemplates(data.templates || []);
    } catch {}
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await api.get("/api/nexus/history");
      setHistory(data.contents || []);
    } catch {}
    setHistoryLoading(false);
  };

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const data = await api.post("/api/nexus/generate", { type, tone, topic: topic.trim(), companyName: companyName.trim() });
      setResult(data.content || "");
    } catch (err) {
      setError(err.message || "Erreur de génération");
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (t) => {
    setType(t.type);
    setTone(t.tone);
    setTopic(t.topic);
    setTab("generate");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text || result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = async (id) => {
    try {
      await api.post(`/api/nexus/history/${id}/favorite`);
      loadHistory();
    } catch {}
  };

  const deleteContent = async (id) => {
    try {
      await api.del(`/api/nexus/history/${id}`);
      loadHistory();
    } catch {}
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ maxWidth: "800px" }}>
      <SubNav color="#10b981" items={NEXUS_NAV} />
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #10b981, #34d399)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>
          Générateur de contenu
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>
          Créez des posts, emails et descriptions produit avec l'IA.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid #2a2d3a", paddingBottom: "4px" }}>
        {[
          { key: "generate", label: "Générer" },
          { key: "templates", label: "Templates" },
          { key: "history", label: "Historique" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: "8px 18px", borderRadius: "6px 6px 0 0", border: "none",
              fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
              background: tab === t.key ? "#1e2029" : "transparent",
              color: tab === t.key ? "#10b981" : "#9ca3af",
              borderBottom: tab === t.key ? "2px solid #10b981" : "2px solid transparent",
            }}>{t.label}</button>
        ))}
      </div>

      {/* GENERATE TAB */}
      {tab === "generate" && (
        <>
          <div style={{ padding: "24px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", marginBottom: "20px" }}>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Type de contenu</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {TYPES.map(t => (
                  <button key={t.value} onClick={() => setType(t.value)}
                    style={{
                      padding: "7px 16px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                      background: type === t.value ? "#10b98120" : "#1e2029",
                      color: type === t.value ? "#10b981" : "#6b7280",
                      border: type === t.value ? "1px solid #10b98130" : "1px solid #2a2d3a",
                    }}>{t.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Ton</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {TONES.map(t => (
                  <button key={t.value} onClick={() => setTone(t.value)}
                    style={{
                      padding: "7px 16px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                      background: tone === t.value ? "#10b98120" : "#1e2029",
                      color: tone === t.value ? "#10b981" : "#6b7280",
                      border: tone === t.value ? "1px solid #10b98130" : "1px solid #2a2d3a",
                    }}>{t.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>
                Nom de l'entreprise <span style={{ color: "#d1d5db" }}>(optionnel)</span>
              </div>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: NERVÜR"
                style={{ width: "100%", padding: "10px 14px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "8px", color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#2a2d3a"} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Sujet / Briefing</div>
              <textarea value={topic} onChange={e => setTopic(e.target.value)}
                placeholder={"Décrivez le sujet de votre contenu...\nEx: Lancement de notre nouvelle offre d'audit SEO pour les restaurants"} rows={3}
                style={{ width: "100%", padding: "12px 14px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "8px", color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#2a2d3a"} />
            </div>

            <button onClick={generate} disabled={loading || !topic.trim()}
              style={{ padding: "12px 28px", background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: loading ? "wait" : "pointer", fontFamily: "inherit", opacity: loading || !topic.trim() ? 0.5 : 1, boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>
              {loading ? "Génération..." : "Générer le contenu"}
            </button>
          </div>

          {error && (
            <div style={{ padding: "14px 18px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", color: "#f87171", fontSize: "14px", marginBottom: "16px" }}>{error}</div>
          )}

          {result && (
            <div style={{ padding: "24px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#9ca3af" }}>Résultat</div>
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: "#10b98114", color: "#10b981" }}>{type}</span>
                </div>
                <button onClick={() => copyToClipboard()}
                  style={{ padding: "6px 14px", background: copied ? "#10b98120" : "#1e2029", border: "1px solid #2a2d3a", borderRadius: "6px", color: copied ? "#10b981" : "#6b7280", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                  {copied ? "Copié !" : "Copier"}
                </button>
              </div>
              <div style={{ fontSize: "14px", color: "#d1d5db", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{result}</div>
              <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                <button onClick={generate} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #2a2d3a", borderRadius: "6px", color: "#6b7280", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Régénérer</button>
                <button onClick={() => { setResult(""); setTopic(""); }} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #2a2d3a", borderRadius: "6px", color: "#9ca3af", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Nouveau</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* TEMPLATES TAB */}
      {tab === "templates" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
          {templates.map(t => (
            <div key={t.id} onClick={() => useTemplate(t)}
              style={{
                padding: "18px 20px", background: "#1e2029", border: "1px solid #2a2d3a",
                borderRadius: "10px", cursor: "pointer", transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#10b98130"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2d3a"}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: "#10b98114", color: "#10b981" }}>{t.category}</span>
                <span style={{ fontSize: "11px", color: "#d1d5db" }}>{t.type}</span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#d1d5db", marginBottom: "6px" }}>{t.name}</div>
              <div style={{ fontSize: "12px", color: "#9ca3af", lineHeight: 1.5 }}>{t.topic.substring(0, 80)}...</div>
            </div>
          ))}
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <>
          {historyLoading ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#9ca3af" }}>Chargement...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: "16px", color: "#9ca3af", marginBottom: "8px" }}>Aucun contenu généré</div>
              <p style={{ fontSize: "14px", color: "#d1d5db" }}>Vos contenus générés apparaîtront ici.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {history.map(c => (
                <div key={c._id} style={{
                  padding: "18px 22px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: "#10b98114", color: "#10b981" }}>{c.type}</span>
                      <span style={{ fontSize: "11px", color: "#d1d5db" }}>{formatDate(c.createdAt)}</span>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => toggleFavorite(c._id)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: c.favorite ? "#f59e0b" : "#d1d5db" }}>
                        {c.favorite ? "★" : "☆"}
                      </button>
                      <button onClick={() => copyToClipboard(c.content)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "#9ca3af", fontFamily: "inherit" }}>
                        Copier
                      </button>
                      <button onClick={() => deleteContent(c._id)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#d1d5db" }}
                        onMouseEnter={e => e.target.style.color = "#ef4444"}
                        onMouseLeave={e => e.target.style.color = "#d1d5db"}>✕</button>
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>{c.topic}</div>
                  <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: "120px", overflow: "hidden" }}>
                    {c.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
