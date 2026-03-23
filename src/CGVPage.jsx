import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

export default function CGVPage() {
  const navigate = useNavigate();

  useSEO("Conditions Générales de Vente | NERVÜR", "CGV de l'agence NERVÜR. Prestations, tarifs, paiement, propriété intellectuelle et résiliation.", { path: "/cgv" });

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
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "8px" }}>Conditions Générales de Vente</h1>
        <div style={{ width: "40px", height: "2px", background: "#818CF8", marginBottom: "40px" }} />

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>1. Objet</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre l'Agence Digital NERVÜR (ci-après « le Prestataire ») et ses clients (ci-après « le Client ») dans le cadre de prestations de services digitaux : gestion de réputation en ligne, audit de performance web, veille concurrentielle, génération de contenu IA, création de sites vitrines, et tout autre service proposé par le Prestataire.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>2. Prestations</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Le Prestataire propose les services suivants :</p>
            <p style={{ marginLeft: "16px" }}>— Gestion de réputation en ligne (Sentinel)</p>
            <p style={{ marginLeft: "16px" }}>— Audit de performance web (Phantom)</p>
            <p style={{ marginLeft: "16px" }}>— Surveillance des fuites de données (Vault)</p>
            <p style={{ marginLeft: "16px" }}>— Création de sites vitrines</p>
            <p style={{ marginTop: "8px" }}>Le détail des prestations est défini dans le devis, la proposition commerciale ou l'offre d'abonnement acceptée par le Client.</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>3. Abonnements et souscription</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Certains services sont proposés sous forme d'abonnement mensuel. Les formules disponibles et leurs tarifs sont communiqués sur le site nervur.fr ou lors de l'échange commercial.</p>
            <p style={{ marginTop: "8px" }}>L'abonnement prend effet à la date d'activation du compte client sur la plateforme app.nervur.fr. Il est reconduit tacitement chaque mois, sauf résiliation par le Client dans les conditions prévues à l'article 9.</p>
            <p style={{ marginTop: "8px" }}>Pour les prestations sur mesure (création de site, audit ponctuel), un devis gratuit est établi préalablement. Le devis est valable 30 jours. La commande est confirmée à réception du devis signé et de l'acompte éventuel.</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>4. Tarifs et paiement</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Les prix sont exprimés en euros (EUR) et hors taxes (TVA non applicable, article 293 B du CGI).</p>
            <p style={{ marginTop: "8px" }}>Modalités de paiement :</p>
            <p style={{ marginLeft: "16px" }}>— Abonnements : prélèvement SEPA mensuel automatique, après signature du mandat de prélèvement par le Client.</p>
            <p style={{ marginLeft: "16px" }}>— Prestations ponctuelles : virement bancaire ou tout autre moyen convenu entre les parties. Un acompte de 30 % peut être demandé à la commande, le solde étant dû à la livraison.</p>
            <p style={{ marginTop: "8px" }}>En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire de 40 EUR pour frais de recouvrement.</p>
            <p style={{ marginTop: "8px" }}>En cas d'échéance de prélèvement impayée, l'accès aux services concernés pourra être suspendu après relance restée sans effet pendant 7 jours.</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>5. Délais</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            Les délais de livraison sont communiqués à titre indicatif dans le devis. Le Prestataire s'engage à mettre en œuvre tous les moyens nécessaires pour respecter les délais convenus. Tout retard du Client dans la fourniture des éléments nécessaires (contenus, accès, validations) reporte d'autant le délai de livraison.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>6. Propriété intellectuelle</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            Le transfert des droits de propriété intellectuelle sur les livrables s'effectue au profit du Client dès le paiement intégral de la prestation. Le Prestataire conserve le droit de mentionner la réalisation dans son portfolio et ses références commerciales, sauf opposition écrite du Client. Les outils logiciels (Sentinel, Phantom, Vault, etc.) restent la propriété du Prestataire ; le Client bénéficie d'un droit d'accès pendant la durée de son abonnement.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>7. Responsabilité</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            Le Prestataire est tenu à une obligation de moyens. Les analyses, audits et recommandations fournis par les outils NERVÜR sont basés sur des données accessibles publiquement et des algorithmes d'intelligence artificielle. Ils sont délivrés à titre indicatif et ne garantissent pas de résultats spécifiques. La responsabilité du Prestataire est limitée au montant de la prestation concernée.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>8. Droit de rétractation</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>
              Conformément aux articles L221-18 et suivants du Code de la consommation, le Client consommateur dispose d'un délai de 14 jours calendaires à compter de la souscription de l'abonnement ou de l'acceptation du devis pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
            </p>
            <p style={{ marginTop: "8px" }}>
              Pour exercer ce droit, le Client doit adresser sa demande par email à contact@nervurpro.fr ou par courrier postal à l'adresse du siège social du Prestataire. Le remboursement sera effectué dans un délai de 14 jours suivant la réception de la demande, par le même moyen de paiement que celui utilisé pour la transaction initiale.
            </p>
            <p style={{ marginTop: "8px" }}>
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les prestations de services pleinement exécutées avant la fin du délai de rétractation et dont l'exécution a commencé avec l'accord préalable et exprès du Client et renoncement exprès à son droit de rétractation.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>9. Résiliation</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>
              Pour les abonnements, le Client peut résilier à tout moment par email à contact@nervurpro.fr. La résiliation prend effet à la fin de la période mensuelle en cours. Aucun remboursement au prorata ne sera effectué pour le mois en cours.
            </p>
            <p style={{ marginTop: "8px" }}>
              En cas de manquement grave de l'une des parties à ses obligations, l'autre partie pourra résilier le contrat par lettre recommandée après mise en demeure restée infructueuse pendant 15 jours. Les prestations réalisées avant la résiliation restent dues.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>10. Médiateur de la consommation</h2>
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
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>11. Droit applicable et litiges</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            Les présentes CGV sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable ou à recourir à la médiation. À défaut, les tribunaux compétents du ressort du siège social du Prestataire seront seuls compétents.
          </p>
        </section>

        <div style={{ marginTop: "40px", padding: "16px", border: `1px solid ${VG(0.08)}`, fontSize: "12px", color: "#52525B" }}>
          Dernière mise à jour : mars 2026
        </div>
      </div>
    </main>
  );
}
