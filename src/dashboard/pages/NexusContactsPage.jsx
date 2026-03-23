import { useState, useEffect, useRef } from "react";
import { useApi } from "../hooks/useApi";

export default function NexusContactsPage() {
  const api = useApi();
  const fileRef = useRef(null);
  const [contacts, setContacts] = useState([]);
  const [lists, setLists] = useState([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ email: "", firstName: "", lastName: "", company: "" });
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => { loadContacts(); }, [selectedList, search]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedList) params.set("list", selectedList);
      if (search) params.set("search", search);
      const data = await api.get(`/api/nexus/email/contacts?${params}`);
      setContacts(data.contacts || []);
      setLists(data.lists || []);
      setTotal(data.total || 0);
      setActive(data.active || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (!newContact.email.trim()) return;
    try {
      await api.post("/api/nexus/email/contacts", { ...newContact, listName: selectedList || "Tous les contacts" });
      setNewContact({ email: "", firstName: "", lastName: "", company: "" });
      setShowAdd(false);
      loadContacts();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteContact = async (id) => {
    try {
      await api.del(`/api/nexus/email/contacts/${id}`);
      loadContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(l => l.trim());
      if (lines.length < 2) { setImporting(false); return; }

      const headers = lines[0].split(/[;,]/).map(h => h.trim().toLowerCase().replace(/"/g, ""));
      const emailIdx = headers.findIndex(h => h.includes("email") || h.includes("mail"));
      const fnIdx = headers.findIndex(h => h.includes("prenom") || h.includes("first") || h.includes("prénom"));
      const lnIdx = headers.findIndex(h => h.includes("nom") || h.includes("last"));
      const coIdx = headers.findIndex(h => h.includes("entreprise") || h.includes("company") || h.includes("societe"));

      if (emailIdx === -1) { alert("Colonne email non trouvée dans le CSV"); setImporting(false); return; }

      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[;,]/).map(c => c.trim().replace(/"/g, ""));
        if (cols[emailIdx]) {
          parsed.push({
            email: cols[emailIdx],
            firstName: fnIdx >= 0 ? cols[fnIdx] || "" : "",
            lastName: lnIdx >= 0 ? cols[lnIdx] || "" : "",
            company: coIdx >= 0 ? cols[coIdx] || "" : "",
          });
        }
      }

      const data = await api.post("/api/nexus/email/contacts/import", {
        contacts: parsed,
        listName: selectedList || "Tous les contacts",
      });
      setImportResult(data);
      loadContacts();
    } catch (err) {
      alert("Erreur import : " + err.message);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #10b981, #34d399)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>Contacts</h1>
        <p style={{ fontSize: "14px", color: "#71717A" }}>Gérez vos listes de contacts pour vos campagnes email.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
        <div style={{ padding: "16px 20px", background: "#141416", border: "1px solid #1e1e22", borderRadius: "10px", borderLeft: "3px solid #10b981" }}>
          <div style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA" }}>{total}</div>
          <div style={{ fontSize: "13px", color: "#71717A" }}>Total contacts</div>
        </div>
        <div style={{ padding: "16px 20px", background: "#141416", border: "1px solid #1e1e22", borderRadius: "10px", borderLeft: "3px solid #10b981" }}>
          <div style={{ fontSize: "22px", fontWeight: 600, color: "#10b981" }}>{active}</div>
          <div style={{ fontSize: "13px", color: "#71717A" }}>Actifs</div>
        </div>
        <div style={{ padding: "16px 20px", background: "#141416", border: "1px solid #1e1e22", borderRadius: "10px", borderLeft: "3px solid #10b981" }}>
          <div style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA" }}>{lists.length}</div>
          <div style={{ fontSize: "13px", color: "#71717A" }}>Listes</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ padding: "9px 18px", background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>
          + Ajouter un contact
        </button>
        <label style={{ padding: "9px 18px", background: "#0f0f11", border: "1px solid #27272A", borderRadius: "8px", fontSize: "13px", color: "#A1A1AA", cursor: "pointer", fontFamily: "inherit" }}>
          {importing ? "Import..." : "Importer CSV"}
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCSV} style={{ display: "none" }} />
        </label>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          style={{ padding: "9px 14px", background: "#0f0f11", border: "1px solid #27272A", borderRadius: "8px", color: "#FAFAFA", fontSize: "13px", fontFamily: "inherit", outline: "none", flex: 1, minWidth: "150px", transition: "border-color 0.2s" }}
          onFocus={e => e.target.style.borderColor = "#10b981"}
          onBlur={e => e.target.style.borderColor = "#27272A"} />
      </div>

      {/* Import result */}
      {importResult && (
        <div style={{ padding: "14px 18px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "10px", marginBottom: "16px", fontSize: "14px", color: "#10b981" }}>
          {importResult.imported} contacts importés, {importResult.skipped} ignorés sur {importResult.total} lignes.
          <button onClick={() => setImportResult(null)} style={{ marginLeft: "12px", background: "none", border: "none", color: "#71717A", cursor: "pointer", fontSize: "12px" }}>✕</button>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div style={{ padding: "20px", background: "#141416", border: "1px solid #1e1e22", borderRadius: "10px", marginBottom: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "12px" }}>
            <input type="email" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))}
              placeholder="email@exemple.com" style={{ padding: "10px 14px", background: "#0f0f11", border: "1px solid #27272A", borderRadius: "8px", color: "#FAFAFA", fontSize: "14px", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "#27272A"} />
            <input type="text" value={newContact.firstName} onChange={e => setNewContact(p => ({ ...p, firstName: e.target.value }))}
              placeholder="Prénom" style={{ padding: "10px 14px", background: "#0f0f11", border: "1px solid #27272A", borderRadius: "8px", color: "#FAFAFA", fontSize: "14px", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "#27272A"} />
            <input type="text" value={newContact.lastName} onChange={e => setNewContact(p => ({ ...p, lastName: e.target.value }))}
              placeholder="Nom" style={{ padding: "10px 14px", background: "#0f0f11", border: "1px solid #27272A", borderRadius: "8px", color: "#FAFAFA", fontSize: "14px", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "#27272A"} />
            <input type="text" value={newContact.company} onChange={e => setNewContact(p => ({ ...p, company: e.target.value }))}
              placeholder="Entreprise" style={{ padding: "10px 14px", background: "#0f0f11", border: "1px solid #27272A", borderRadius: "8px", color: "#FAFAFA", fontSize: "14px", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "#27272A"} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addContact} style={{ padding: "8px 18px", background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>Ajouter</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #27272A", borderRadius: "6px", color: "#71717A", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
          </div>
        </div>
      )}

      {/* List filter */}
      {lists.length > 1 && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
          <button onClick={() => setSelectedList("")}
            style={{ padding: "5px 14px", borderRadius: "6px", border: "none", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", background: !selectedList ? "#10b981" : "#1e1e22", color: !selectedList ? "#fff" : "#A1A1AA" }}>
            Tous
          </button>
          {lists.map(l => (
            <button key={l} onClick={() => setSelectedList(l)}
              style={{ padding: "5px 14px", borderRadius: "6px", border: "none", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", background: selectedList === l ? "#10b981" : "#1e1e22", color: selectedList === l ? "#fff" : "#A1A1AA" }}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Contact list */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#71717A", fontSize: "14px" }}>Chargement...</div>
      ) : contacts.length === 0 ? (
        <div style={{ padding: "60px 24px", textAlign: "center", background: "#141416", border: "1px solid #1e1e22", borderRadius: "10px" }}>
          <div style={{ fontSize: "16px", color: "#71717A", marginBottom: "8px" }}>Aucun contact</div>
          <p style={{ fontSize: "14px", color: "#52525B" }}>Ajoutez des contacts manuellement ou importez un fichier CSV.</p>
        </div>
      ) : (
        <div style={{ background: "#141416", border: "1px solid #1e1e22", borderRadius: "10px", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 40px", padding: "12px 20px", borderBottom: "1px solid #1e1e22", fontSize: "11px", color: "#71717A", fontWeight: 500 }}>
            <div>Email</div><div>Prénom</div><div>Entreprise</div><div>Statut</div><div></div>
          </div>
          {contacts.map(c => (
            <div key={c._id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 40px", padding: "12px 20px", borderBottom: "1px solid #1e1e22", alignItems: "center", fontSize: "13px" }}>
              <div style={{ color: "#D4D4D8" }}>{c.email}</div>
              <div style={{ color: "#A1A1AA" }}>{c.firstName} {c.lastName}</div>
              <div style={{ color: "#71717A" }}>{c.company}</div>
              <div>
                <span style={{
                  fontSize: "11px", padding: "2px 8px", borderRadius: "4px",
                  background: c.status === "active" ? "#10b98114" : c.status === "bounced" ? "#ef444414" : "#f59e0b14",
                  color: c.status === "active" ? "#10b981" : c.status === "bounced" ? "#ef4444" : "#f59e0b",
                }}>{c.status === "active" ? "Actif" : c.status === "bounced" ? "Bounce" : "Désabonné"}</span>
              </div>
              <button onClick={() => deleteContact(c._id)}
                style={{ background: "none", border: "none", color: "#52525B", cursor: "pointer", fontSize: "14px", padding: "2px" }}
                onMouseEnter={e => e.target.style.color = "#ef4444"}
                onMouseLeave={e => e.target.style.color = "#52525B"}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
