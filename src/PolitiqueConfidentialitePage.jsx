import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

export default function PolitiqueConfidentialitePage() {
  const navigate = useNavigate();

  useSEO("Politique de Confidentialité | NERVÜR", "Politique de confidentialité et protection des données personnelles de nervur.fr conforme RGPD.", { path: "/politique-confidentialite", keywords: "politique confidentialité, RGPD, données personnelles, NERVÜR" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const VG = (a) => `rgba(255,255,255,${a})`;

  return (
    <main style={{ background: "#F5F5F7", color: "#1D1D1F", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", minHeight: "100vh" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: `1px solid ${VG(0.08)}` }}>
        <LogoNervur height={28} onClick={() => navigate("/")} />
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "1px solid rgba(129,140,248,0.25)", color: "#a1a1aa", padding: "8px 22px", fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
          Accueil
        </button>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px 80px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "8px" }}>Politique de Confidentialité</h1>
        <div style={{ width: "40px", height: "2px", background: "#818CF8", marginBottom: "40px" }} />

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>1. Responsable du traitement</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Agence Digital NERVÜR — Li Glanchard</p>
            <p>SIRET : 102 415 916 00018</p>
            <p>Email : contact@nervurpro.com</p>
            <p>Site : nervur.fr</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>2. Données collectées</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Dans le cadre de l'utilisation de nos services, nous pouvons collecter :</p>
            <p style={{ marginLeft: "16px" }}>— Données de contact : nom, email, téléphone (formulaire de contact)</p>
            <p style={{ marginLeft: "16px" }}>— Données d'utilisation : URLs analysées via nos outils (Sentinel, Phantom, Vault, etc.)</p>
            <p style={{ marginLeft: "16px" }}>— Données techniques : adresse IP, type de navigateur, pages visitées</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>3. Finalités du traitement</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Les données collectées sont utilisées pour :</p>
            <p style={{ marginLeft: "16px" }}>— Fournir les services d'analyse et d'audit demandés</p>
            <p style={{ marginLeft: "16px" }}>— Répondre aux demandes de contact</p>
            <p style={{ marginLeft: "16px" }}>— Améliorer la qualité de nos services</p>
            <p style={{ marginLeft: "16px" }}>— Établir des devis et factures</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>4. Base légale</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            Le traitement des données repose sur le consentement de l'utilisateur (article 6.1.a du RGPD) et l'exécution d'un contrat ou de mesures précontractuelles (article 6.1.b du RGPD).
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>5. Durée de conservation</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>— Données de contact : 3 ans après le dernier contact</p>
            <p>— Données d'analyse : non conservées (traitées en temps réel et non stockées)</p>
            <p>— Données techniques : 13 mois maximum</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>6. Partage des données</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Les données peuvent être transmises aux sous-traitants techniques suivants :</p>
            <p style={{ marginLeft: "16px" }}>— Netlify (hébergement du site)</p>
            <p style={{ marginLeft: "16px" }}>— Railway (hébergement de l'API)</p>
            <p style={{ marginLeft: "16px" }}>— Google PageSpeed Insights (analyse de performance)</p>
            <p style={{ marginLeft: "16px" }}>— Anthropic / OpenAI (génération de contenu IA)</p>
            <p style={{ marginTop: "8px" }}>Aucune donnée n'est vendue à des tiers.</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>7. Vos droits</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <p style={{ marginLeft: "16px" }}>— Droit d'accès à vos données personnelles</p>
            <p style={{ marginLeft: "16px" }}>— Droit de rectification</p>
            <p style={{ marginLeft: "16px" }}>— Droit à l'effacement (droit à l'oubli)</p>
            <p style={{ marginLeft: "16px" }}>— Droit à la limitation du traitement</p>
            <p style={{ marginLeft: "16px" }}>— Droit à la portabilité des données</p>
            <p style={{ marginLeft: "16px" }}>— Droit d'opposition</p>
            <p style={{ marginTop: "8px" }}>Pour exercer vos droits, contactez notre DPO : contact@nervurpro.com</p>
            <p>Vous pouvez également adresser une réclamation à la CNIL (cnil.fr).</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>8. Cookies</h2>
          <div style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            <p>Ce site utilise les cookies suivants :</p>
            <p style={{ marginLeft: "16px" }}>— Cookies essentiels : strictement n&eacute;cessaires au fonctionnement du site (toujours actifs)</p>
            <p style={{ marginLeft: "16px" }}>— Cookies analytiques : Google Tag Manager (GTM-MCHC6NMK) pour la mesure d'audience — activ&eacute;s uniquement apr&egrave;s consentement explicite de l'utilisateur</p>
            <p style={{ marginTop: "8px" }}>Lors de votre premi&egrave;re visite, un bandeau vous permet d'accepter, refuser ou personnaliser l'utilisation des cookies. Votre choix est conserv&eacute; dans le stockage local de votre navigateur. Vous pouvez modifier vos pr&eacute;f&eacute;rences &agrave; tout moment en supprimant les donn&eacute;es de navigation de votre navigateur.</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "16px" }}>9. Transferts de donn&eacute;es hors UE</h2>
          <p style={{ fontSize: "14px", lineHeight: 2, color: "#d4d4d8" }}>
            Certains de nos sous-traitants techniques (Netlify, Railway, Google, Anthropic) sont situ&eacute;s aux &Eacute;tats-Unis. Ces transferts sont encadr&eacute;s par les clauses contractuelles types de la Commission europ&eacute;enne et/ou le cadre EU-US Data Privacy Framework, conform&eacute;ment au chapitre V du RGPD.
          </p>
        </section>

        <div style={{ marginTop: "40px", padding: "16px", border: `1px solid ${VG(0.08)}`, fontSize: "12px", color: "#86868B" }}>
          Dernière mise à jour : mars 2026
        </div>
      </div>
    </main>
  );
}
