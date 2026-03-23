import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

export default function MentionsLegalesPage() {
  const navigate = useNavigate();

  useSEO("Mentions Légales | NERVÜR", "Mentions légales du site nervur.fr. Éditeur, hébergement, propriété intellectuelle et droit applicable.", { path: "/mentions-legales" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const VG = (a) => `rgba(255,255,255,${a})`;

  return (
    <main style={{ background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", minHeight: "100vh" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: `1px solid ${VG(0.08)}` }}>
        <img src="/logo-nav.png" alt="NERVÜR" onClick={() => navigate("/")} style={{ height: "70px", width: "auto", filter: "invert(1) brightness(1.15)", objectFit: "contain", mixBlendMode: "screen", cursor: "pointer" }} />
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "1px solid rgba(129,140,248,0.25)", color: "#a1a1aa", padding: "8px 22px", fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
          Accueil
        </button>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px 80px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "8px" }}>Mentions Légales</h1>
        <div style={{ width: "40px", height: "2px", background: "#818CF8", marginBottom: "40px" }} />

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>1. Éditeur du site</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Nom commercial : Agence Digital NERVÜR</p>
            <p>Dirigeant : Li Glanchard</p>
            <p>Statut : Auto-entrepreneur (Entreprise individuelle)</p>
            <p>SIRET : 102 415 916 00018</p>
            <p>Siège social : Saint-Paul-lès-Dax, France</p>
            <p>Email : contact@nervurpro.fr</p>
            <p>Site web : nervur.fr</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>2. Directeur de la publication</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>Li Glanchard — contact@nervurpro.fr</p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>3. Hébergement</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Site web hébergé par : Netlify, Inc.</p>
            <p>Adresse : 512 2nd Street, Suite 200, San Francisco, CA 94107, USA</p>
            <p>Site : netlify.com</p>
            <p style={{ marginTop: "8px" }}>API hébergée par : Railway Corp.</p>
            <p>Site : railway.app</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>4. Nom de domaine</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Nom de domaine enregistré auprès de : OVHcloud</p>
            <p>Adresse : 2 rue Kellermann, 59100 Roubaix, France</p>
            <p>Site : ovhcloud.com</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>5. Propriété intellectuelle</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            L'ensemble du contenu de ce site (textes, images, logos, graphismes, icônes, logiciels) est la propriété exclusive de l'Agence Digital NERVÜR ou de ses partenaires. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation préalable écrite de l'éditeur.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>6. Responsabilité</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            L'éditeur s'efforce de fournir des informations aussi précises que possible. Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes ou des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations. Les outils d'analyse proposés fournissent des recommandations à titre indicatif et ne constituent pas un conseil professionnel garanti.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>7. Liens hypertextes</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            Le site nervur.fr peut contenir des liens hypertextes vers d'autres sites. L'éditeur ne dispose d'aucun moyen de contrôle du contenu de ces sites tiers et n'assume aucune responsabilité quant à leur contenu.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>8. Droit de rétractation</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>
              Conformément aux articles L221-18 et suivants du Code de la consommation, le Client consommateur dispose d'un délai de 14 jours calendaires à compter de la souscription pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
            </p>
            <p style={{ marginTop: "8px" }}>
              Pour exercer ce droit, le Client doit notifier sa décision par email à contact@nervurpro.fr ou par courrier à l'adresse du siège social. Le Prestataire procédera au remboursement dans un délai de 14 jours suivant la réception de la demande.
            </p>
            <p style={{ marginTop: "8px" }}>
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les prestations de services pleinement exécutées avant la fin du délai de rétractation et dont l'exécution a commencé avec l'accord préalable et exprès du Client et renoncement exprès à son droit de rétractation.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>9. Médiateur de la consommation</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>
              Conformément aux articles L611-1 et R612-1 du Code de la consommation, en cas de litige non résolu directement avec le Prestataire, le Client consommateur peut recourir gratuitement à un médiateur de la consommation.
            </p>
            <p style={{ marginTop: "8px" }}>
              Médiateur compétent : Médiation de la consommation — MEDICYS
            </p>
            <p>Adresse : 73 boulevard de Clichy, 75009 Paris</p>
            <p>Site : medicys.fr</p>
            <p style={{ marginTop: "8px" }}>
              Plateforme européenne de règlement en ligne des litiges : <span style={{ color: "#818CF8" }}>https://ec.europa.eu/consumers/odr</span>
            </p>
            <p style={{ marginTop: "8px" }}>
              Avant de saisir le médiateur, le Client doit avoir préalablement adressé une réclamation écrite au Prestataire par email (contact@nervurpro.fr) ou par courrier postal.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>10. Droit applicable</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            Les présentes mentions légales sont régies par le droit français. En cas de litige, et après tentative de résolution amiable ou de médiation, les tribunaux français seront seuls compétents.
          </p>
        </section>

        <div style={{ marginTop: "40px", padding: "16px", border: `1px solid ${VG(0.08)}`, fontSize: "12px", color: "#52525B" }}>
          Dernière mise à jour : mars 2026
        </div>
      </div>
    </main>
  );
}
