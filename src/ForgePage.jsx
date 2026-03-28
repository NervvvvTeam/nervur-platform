import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

const V = "#FFFFFF", V2 = "#D4D4D8", V3 = "#A1A1AA";
const VG = (a) => `rgba(255,255,255,${a})`;
const A1 = "#818CF8", A2 = "#4ADE80", A3 = "#F472B6";

const useIsMobile = (bp = 768) => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
};

const PROJECT_TYPES = ["Site web", "Application mobile", "Branding", "SEO & Marketing", "E-commerce", "Consulting"];

const FALLBACK_QUOTE = {
  reference: "DEV-2026-4821",
  client: "Client",
  date: new Date().toLocaleDateString('fr-FR'),
  validite: "30 jours",
  lines: [
    { description: "Audit & Cahier des charges", quantity: 1, unitPrice: 1500, total: 1500 },
    { description: "Design UI/UX (maquettes)", quantity: 1, unitPrice: 3000, total: 3000 },
    { description: "Développement front-end", quantity: 1, unitPrice: 4500, total: 4500 },
    { description: "Intégration back-end & CMS", quantity: 1, unitPrice: 3500, total: 3500 },
    { description: "Tests, recette & mise en ligne", quantity: 1, unitPrice: 1500, total: 1500 },
  ],
  subtotal: 14000,
  tax: 2800,
  total: 16800,
  conditions: "50% à la commande, 50% à la livraison",
  notes: "Ce devis est personnalisé selon vos besoins. N'hésitez pas à nous contacter pour toute question."
};

export default function ForgePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [quote, setQuote] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleMouseMove = (e) => {
    if (glowRef.current) { glowRef.current.style.left = e.clientX + "px"; glowRef.current.style.top = e.clientY + "px"; glowRef.current.style.opacity = 1; }
  };

  useSEO("FORGE — Devis & Facturation IA | NERVÜR", "Créez des devis et factures professionnels en quelques clics grâce à l'IA. Automatisez votre gestion commerciale.", { path: "/forge" });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const generateQuote = async () => {
    if (!clientName || !projectType) return;
    setGenerating(true);
    setQuote(null);

    try {
      const res = await fetch(`${API_URL}/api/forge/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, projectType, notes }),
      });
      const data = await res.json();
      if (data.quote) { setQuote(data.quote); setGenerating(false); return; }
    } catch (err) { /* fallback */ }

    setTimeout(() => {
      setQuote({ ...FALLBACK_QUOTE, client: clientName });
      setGenerating(false);
    }, 2500);
  };

  return (
    <div onMouseMove={handleMouseMove} style={{ background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", minHeight: "100vh", position: "relative" }}>
      <div ref={glowRef} style={{ position: "fixed", left: -100, top: -100, width: "150px", height: "150px", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)", transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s", opacity: 0, mixBlendMode: "screen" }} />

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
      `}</style>

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#09090B", borderBottom: `1px solid ${VG(0.1)}` }}>
        <img src="/logo-nav.png" style={{ filter: "invert(1) brightness(1.15)" }} alt="NERVÜR" style={{ height: isMobile ? "34px" : "42px", width: "auto", objectFit: "contain" }} />
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="nav-btn" aria-label="Retour aux outils" onClick={() => navigate('/technologies')}>← Outils</button>
          <button className="nav-btn" onClick={() => navigate('/contact')}>Contact</button>
        </div>
      </nav>

      <main style={{ paddingTop: isMobile ? "90px" : "140px", maxWidth: "900px", margin: "0 auto", padding: isMobile ? "90px 20px 60px" : "140px 48px 80px" }}>
        <div style={{ animation: "fadeInUp 0.8s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "#f59e0b", textTransform: "uppercase", background: "rgba(245,158,11,0.1)", padding: "4px 12px", borderRadius: "20px", border: "1px solid rgba(245,158,11,0.2)" }}>DEVIS & FACTURATION</span>
          </div>
          <h1 style={{ fontSize: isMobile ? "42px" : "64px", fontWeight: 900, letterSpacing: "-2px", margin: 0 }}>FORGE</h1>
          <p style={{ fontSize: "16px", color: V3, maxWidth: "500px", lineHeight: 1.7, marginTop: "12px" }}>L'IA qui génère des devis professionnels personnalisés en quelques secondes. Fini les heures perdues en administratif.</p>
        </div>

        {/* Stats */}
        <section aria-label="Statistiques clés" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px", margin: "40px 0", animation: "fadeInUp 0.8s ease 0.2s both" }}>
          {[{ val: "12s", label: "TEMPS DE GÉNÉRATION" }, { val: "98%", label: "PRÉCISION TARIFAIRE" }, { val: "x8", label: "GAIN DE PRODUCTIVITÉ" }].map((s, i) => (
            <div key={i} style={{ background: `rgba(24,24,27,0.4)`, border: `1px solid ${VG(0.1)}`, borderRadius: "12px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: V }}>{s.val}</div>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: V3, marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* Form */}
        <section aria-label="Formulaire de génération de devis" style={{ background: `rgba(24,24,27,0.4)`, border: `1px solid ${VG(0.1)}`, borderRadius: "16px", padding: isMobile ? "24px" : "32px", animation: "fadeInUp 0.8s ease 0.4s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "1px" }}>Générez votre devis</span>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", letterSpacing: "1.5px", color: V3, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Nom du client</label>
            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: Restaurant Le Comptoir" style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: `1px solid ${VG(0.12)}`, borderRadius: "8px", color: V, fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", letterSpacing: "1.5px", color: V3, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Type de projet</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {PROJECT_TYPES.map(t => (
                <button key={t} onClick={() => setProjectType(t)} style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${projectType === t ? "#f59e0b" : VG(0.12)}`, background: projectType === t ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)", color: projectType === t ? "#f59e0b" : V3, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "11px", letterSpacing: "1.5px", color: V3, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Notes supplémentaires (optionnel)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Précisions, fonctionnalités souhaitées..." rows={3} style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: `1px solid ${VG(0.12)}`, borderRadius: "8px", color: V, fontSize: "14px", outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
          </div>

          <button onClick={generateQuote} disabled={generating || !clientName || !projectType} style={{ padding: "14px 32px", background: generating ? "#52525b" : "linear-gradient(135deg, #f59e0b, #d97706)", border: "none", borderRadius: "8px", color: "#09090B", fontSize: "12px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", cursor: generating ? "wait" : "pointer", fontFamily: "inherit", opacity: (!clientName || !projectType) ? 0.4 : 1, transition: "all 0.3s" }}>
            {generating ? "GÉNÉRATION EN COURS..." : "GÉNÉRER LE DEVIS →"}
          </button>
        </section>

        {/* Quote Result */}
        {quote && (
          <div style={{ marginTop: "32px", background: `rgba(24,24,27,0.4)`, border: `1px solid ${VG(0.1)}`, borderRadius: "16px", overflow: "hidden", animation: "fadeInUp 0.6s ease" }}>
            {/* Header */}
            <div style={{ padding: "24px 32px", borderBottom: `1px solid ${VG(0.08)}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: "#f59e0b", background: "rgba(245,158,11,0.15)", padding: "3px 10px", borderRadius: "12px" }}>IA FORGE</span>
                  <span style={{ fontSize: "10px", color: V3, letterSpacing: "1px" }}>Devis généré</span>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "4px" }}>Devis {quote.reference}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: "12px", color: V3 }}>
                <div>Date : {quote.date}</div>
                <div>Validité : {quote.validite}</div>
              </div>
            </div>

            {/* Client */}
            <div style={{ padding: "16px 32px", borderBottom: `1px solid ${VG(0.06)}` }}>
              <span style={{ fontSize: "11px", color: V3, letterSpacing: "1px" }}>CLIENT : </span>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>{quote.client}</span>
            </div>

            {/* Table */}
            <div style={{ padding: "0 32px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${VG(0.1)}` }}>
                    {["Prestation", "Qté", "Prix unit.", "Total"].map(h => (
                      <th key={h} style={{ padding: "12px 0", fontSize: "10px", letterSpacing: "1.5px", color: V3, textTransform: "uppercase", textAlign: h === "Prestation" ? "left" : "right", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quote.lines?.map((line, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${VG(0.05)}` }}>
                      <td style={{ padding: "12px 0", fontSize: "13px", color: V2 }}>{line.description}</td>
                      <td style={{ padding: "12px 0", fontSize: "13px", color: V3, textAlign: "right" }}>{line.quantity}</td>
                      <td style={{ padding: "12px 0", fontSize: "13px", color: V3, textAlign: "right" }}>{line.unitPrice?.toLocaleString('fr-FR')}€</td>
                      <td style={{ padding: "12px 0", fontSize: "13px", color: V, fontWeight: 600, textAlign: "right" }}>{line.total?.toLocaleString('fr-FR')}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ padding: "20px 32px", borderTop: `1px solid ${VG(0.1)}`, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <div style={{ fontSize: "13px", color: V3 }}>Sous-total HT : <span style={{ color: V, fontWeight: 600 }}>{quote.subtotal?.toLocaleString('fr-FR')}€</span></div>
              <div style={{ fontSize: "13px", color: V3 }}>TVA (20%) : <span style={{ color: V, fontWeight: 600 }}>{quote.tax?.toLocaleString('fr-FR')}€</span></div>
              <div style={{ fontSize: "20px", fontWeight: 900, color: "#f59e0b", marginTop: "4px" }}>Total TTC : {quote.total?.toLocaleString('fr-FR')}€</div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div style={{ padding: "16px 32px", borderTop: `1px solid ${VG(0.06)}`, fontSize: "13px", color: V3, fontStyle: "italic" }}>
                {quote.notes}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <section aria-label="Appel à l'action" style={{ marginTop: "60px", textAlign: "center", padding: "48px", border: `1px solid ${VG(0.1)}`, borderRadius: "16px", animation: "fadeInUp 0.8s ease 0.6s both" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>Automatisez votre facturation</h2>
          <p style={{ color: V3, marginBottom: "24px" }}>Forge génère devis, factures et relances adaptés à chaque client.</p>
          <button className="nav-btn" onClick={() => navigate('/contact?outil=forge')} style={{ padding: "14px 36px", background: V, color: "#09090B", fontWeight: 700, border: "none" }}>RÉSERVER UN APPEL →</button>
        </section>
      </main>

      <footer style={{ padding: "24px 48px", borderTop: `1px solid ${VG(0.06)}`, display: "flex", justifyContent: "space-between", fontSize: "11px", color: V3 }}>
        <span>NERVÜR © 2026</span>
        <span>FORGE — Générateur de Devis IA</span>
      </footer>
    </div>
  );
}
