import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const PHANTOM_NAV = [
  { path: "/app/phantom", label: "Audit", end: true },
  { path: "/app/phantom/history", label: "Historique" },
  { path: "/app/phantom/recommendations", label: "Recommandations" },
  { path: "/app/phantom/competitors", label: "Concurrents" },
  { path: "/app/phantom/schedule", label: "Planification" },
];

const FREQUENCIES = [
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
];

export default function PhantomSchedulePage() {
  const api = useApi();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    loadDomains();
    loadSchedules();
  }, []);

  const loadDomains = async () => {
    try {
      const data = await api.get("/api/phantom/history");
      setDomains(data.domains || []);
    } catch (err) {
      console.error("Load domains error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const data = await api.get("/api/phantom/schedules");
      setSchedules(data.schedules || []);
    } catch (err) {
      console.error("Load schedules error:", err);
    }
  };

  const handleAdd = async () => {
    if (!selectedDomain) return;
    if (schedules.find(s => s.domain === selectedDomain)) return;
    try {
      const data = await api.post("/api/phantom/schedules", { domain: selectedDomain, frequency });
      setSchedules(prev => [...prev, data.schedule]);
      setSelectedDomain("");
    } catch (err) {
      console.error("Add schedule error:", err);
    }
  };

  const toggleSchedule = async (id) => {
    const current = schedules.find(s => (s._id || s.id) === id);
    if (!current) return;
    try {
      const data = await api.put("/api/phantom/schedules/" + id, { enabled: !current.enabled });
      setSchedules(prev => prev.map(s =>
        (s._id || s.id) === id ? data.schedule : s
      ));
    } catch (err) {
      console.error("Toggle schedule error:", err);
    }
  };

  const removeSchedule = async (id) => {
    try {
      await api.del("/api/phantom/schedules/" + id);
      setSchedules(prev => prev.filter(s => (s._id || s.id) !== id));
    } catch (err) {
      console.error("Remove schedule error:", err);
    }
  };

  return (
    <div style={{ maxWidth: "1100px" }}>
      <SubNav color="#8b5cf6" items={PHANTOM_NAV} />

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
          Planification des audits
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B" }}>
          Programmez des audits automatiques pour vos sites.
        </p>
      </div>

      {/* Development pill */}
      <div style={{ marginBottom: "24px" }}>
        <span style={{
          fontSize: "10px", fontWeight: 500,
          background: "rgba(139,92,246,0.12)", color: "#a78bfa",
          padding: "4px 12px", borderRadius: "20px",
          display: "inline-block",
        }}>
          En cours de développement
        </span>
      </div>

      {/* Add schedule form */}
      <div style={{
        padding: "24px", background: "#E8E9EC", border: "1px solid #2a2d3a",
        borderRadius: "10px", marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#0F172A", marginBottom: "16px" }}>
          Ajouter un audit planifié
        </h2>

        {loading ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "#64748B", fontSize: "14px" }}>
            Chargement...
          </div>
        ) : domains.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
            Aucun domaine trouvé. Lancez d'abord un audit depuis l'onglet Audit.
          </div>
        ) : (
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#64748B", marginBottom: "6px" }}>
                Domaine
              </label>
              <select
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", background: "#161820",
                  border: "1px solid #2a2d3a", borderRadius: "8px", color: "#0F172A",
                  fontSize: "13px", fontFamily: "inherit", outline: "none",
                }}
              >
                <option value="">Sélectionner un domaine</option>
                {domains.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: "180px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#64748B", marginBottom: "6px" }}>
                Fréquence
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", background: "#161820",
                  border: "1px solid #2a2d3a", borderRadius: "8px", color: "#0F172A",
                  fontSize: "13px", fontFamily: "inherit", outline: "none",
                }}
              >
                {FREQUENCIES.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAdd}
              disabled={!selectedDomain}
              style={{
                padding: "10px 24px",
                background: selectedDomain ? "linear-gradient(135deg, #8b5cf6, #a78bfa)" : "#E2E8F0",
                color: "#fff", border: "none", borderRadius: "8px",
                fontSize: "13px", fontWeight: 500, cursor: selectedDomain ? "pointer" : "not-allowed",
                fontFamily: "inherit", opacity: selectedDomain ? 1 : 0.5,
                boxShadow: selectedDomain ? "0 4px 16px rgba(139,92,246,0.4)" : "none",
              }}
            >
              Ajouter
            </button>
          </div>
        )}
      </div>

      {/* Scheduled audits list */}
      <div style={{
        background: "#E8E9EC", border: "1px solid #2a2d3a",
        borderRadius: "10px", overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}>
        <div style={{
          padding: "18px 22px", borderBottom: "1px solid #2a2d3a",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#0F172A", margin: 0 }}>
            Audits planifiés
          </h2>
          <span style={{
            fontSize: "12px", color: "#8b5cf6", fontWeight: 500,
            padding: "3px 10px", background: "rgba(139,92,246,0.12)", borderRadius: "6px",
          }}>
            {schedules.length} configuré{schedules.length > 1 ? "s" : ""}
          </span>
        </div>

        {schedules.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "12px" }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <div style={{ fontSize: "14px", color: "#64748B", marginBottom: "4px" }}>
              Aucun audit planifié
            </div>
            <div style={{ fontSize: "12px", color: "#64748B" }}>
              Ajoutez un domaine ci-dessus pour programmer des audits automatiques.
            </div>
          </div>
        ) : (
          <div>
            {schedules.map((schedule, idx) => (
              <div key={schedule._id || schedule.id} style={{
                padding: "16px 22px",
                borderBottom: idx < schedules.length - 1 ? "1px solid #2a2d3a" : "none",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                opacity: schedule.enabled ? 1 : 0.5,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "8px",
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#334155" }}>
                      {schedule.domain}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>
                      {FREQUENCIES.find(f => f.value === schedule.frequency)?.label || schedule.frequency}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "4px",
                    background: schedule.enabled ? "rgba(16,185,129,0.12)" : "rgba(107,114,128,0.12)",
                    color: schedule.enabled ? "#10b981" : "#64748B",
                  }}>
                    {schedule.enabled ? "Actif" : "Inactif"}
                  </span>
                  {/* Toggle */}
                  <button
                    onClick={() => toggleSchedule(schedule._id || schedule.id)}
                    style={{
                      width: "40px", height: "22px", borderRadius: "11px", border: "none",
                      background: schedule.enabled ? "#8b5cf6" : "#E2E8F0",
                      cursor: "pointer", position: "relative", transition: "background 0.2s",
                    }}
                  >
                    <div style={{
                      width: "16px", height: "16px", borderRadius: "50%", background: "#fff",
                      position: "absolute", top: "3px",
                      left: schedule.enabled ? "21px" : "3px",
                      transition: "left 0.2s",
                    }} />
                  </button>
                  {/* Remove */}
                  <button
                    onClick={() => removeSchedule(schedule._id || schedule.id)}
                    style={{
                      background: "none", border: "none", color: "#64748B",
                      cursor: "pointer", padding: "4px", fontSize: "16px",
                    }}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
