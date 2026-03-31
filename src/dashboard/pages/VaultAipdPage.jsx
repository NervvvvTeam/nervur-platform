import { useState, useEffect } from "react";
import { VAULT_NAV, VAULT_ACCENT as ACCENT } from "./vaultNav";
import SubNav from "../components/SubNav";

/* ===================================================================== */
/*  Constants & Data                                                      */
/* ===================================================================== */

const SectorIcon = ({ type, size = 24, color = ACCENT }) => {
  const paths = {
    commerce: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/><path d="M9 4v4"/><path d="M15 4v4"/></>,
    ecommerce: <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>,
    restauration: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></>,
    sante: <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>,
    services: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
    artisan: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>,
    education: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
    finance: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    tech: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
    immobilier: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    transport: <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    autre: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[type] || paths.autre}
    </svg>
  );
};

const SECTEURS = [
  { value: "commerce", label: "Commerce / Retail" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "restauration", label: "Restauration / Hotellerie" },
  { value: "sante", label: "Sante / Medical" },
  { value: "services", label: "Services / Consulting" },
  { value: "artisan", label: "Artisanat / BTP" },
  { value: "education", label: "Education / Formation" },
  { value: "finance", label: "Finance / Assurance" },
  { value: "tech", label: "Tech / SaaS" },
  { value: "immobilier", label: "Immobilier" },
  { value: "transport", label: "Transport / Logistique" },
  { value: "autre", label: "Autre" },
];

const EMPLOYEE_RANGES = ["1-5", "6-20", "21-50", "51-250", "250+"];

const DATA_CATEGORIES = [
  "Identité", "Coordonnées", "Données bancaires", "Email", "Téléphone",
  "Adresse IP", "Géolocalisation", "Images/Vidéo", "Données de santé",
  "Données biométriques", "Habitudes d'achat", "Préférences",
  "Données professionnelles", "Données de navigation",
];

const LEGAL_BASES = [
  { value: "Consentement", desc: "La personne a donné son accord explicite" },
  { value: "Contrat", desc: "Nécessaire pour exécuter un contrat" },
  { value: "Obligation légale", desc: "Imposé par la loi (fiscal, social...)" },
  { value: "Intérêt légitime", desc: "Intérêt de l'entreprise, sans atteinte aux droits" },
];

const DURATIONS = [
  "3 mois", "6 mois", "1 an", "2 ans", "3 ans", "5 ans", "10 ans", "Indéterminée",
];

const NECESSITY_QUESTIONS = [
  { q: "Les données collectées sont-elles strictement nécessaires à la finalité ?", ref: "Principe de minimisation - Art. 5" },
  { q: "La durée de conservation est-elle définie et justifiée ?", ref: "Limitation de la conservation" },
  { q: "Les personnes sont-elles informées de la collecte ?", ref: "Transparence - Art. 13-14" },
  { q: "Un mécanisme de consentement est-il en place ?", ref: "Si base légale = consentement" },
  { q: "Les droits des personnes sont-ils facilement exerçables ?", ref: "Accès, rectification, suppression" },
  { q: "Les données sont-elles chiffrées au repos et en transit ?", ref: "Sécurité - Art. 32" },
  { q: "L'accès aux données est-il restreint aux personnes habilitées ?", ref: "Contrôle d'accès" },
  { q: "Un contrat sous-traitant RGPD est-il signé avec chaque prestataire ?", ref: "Art. 28" },
];

const RISK_SCENARIOS = [
  { key: "acces", name: "Accès illégitime aux données", desc: "Piratage, vol, accès non autorisé" },
  { key: "modif", name: "Modification non désirée des données", desc: "Erreur humaine, malveillance" },
  { key: "perte", name: "Disparition des données", desc: "Perte, crash, suppression accidentelle" },
  { key: "collecte", name: "Collecte excessive de données", desc: "Non-respect du principe de minimisation" },
  { key: "detourne", name: "Usage détourné des données", desc: "Profilage non consenti, finalité déviée" },
  { key: "transfert", name: "Transfert non autorisé", desc: "Sous-traitant hors UE, partage illicite" },
];

const RISK_LEVELS_LABELS = ["Négligeable", "Limitée", "Importante", "Maximale"];

const TREATMENT_SUGGESTIONS = {
  ecommerce: ["Gestion des commandes", "Newsletter marketing", "Cookies & analytics", "Programme fidélité", "Avis clients"],
  restauration: ["Réservations en ligne", "Vidéosurveillance", "Carte de fidélité", "Commandes livraison"],
  commerce: ["Vidéosurveillance magasin", "Carte fidélité", "Caisse enregistreuse", "Fichier clients"],
  sante: ["Dossiers patients", "Prise de rendez-vous", "Téléconsultation", "Ordonnances numériques"],
  services: ["Gestion RH et paie", "CRM clients", "Facturation", "Suivi de projets"],
  artisan: ["Devis et factures", "Fichier clients", "Planning chantiers", "Photos de réalisations"],
  education: ["Inscription élèves", "Suivi pédagogique", "Plateforme e-learning", "Communication parents"],
  finance: ["KYC clients", "Gestion des contrats", "Analyse de risques", "Transactions financières"],
  tech: ["Comptes utilisateurs", "Analytics produit", "Support client", "Logs techniques"],
  immobilier: ["Dossiers locataires", "Mandats de gestion", "Visites virtuelles", "Gestion copropriété"],
  transport: ["Suivi des livraisons", "GPS véhicules", "Gestion conducteurs", "Bordereaux expédition"],
  autre: ["Fichier clients", "Gestion administrative", "Communication", "Archivage"],
};

const RECIPIENT_SUGGESTIONS = ["Hébergeur web", "Prestataire paiement", "Expert-comptable", "Livreur", "Éditeur CRM", "Prestataire emailing"];

const NOE_SUGGESTIONS = {
  ecommerce: {
    step1: "Pour un e-commerce, les traitements courants sont : gestion des commandes, newsletter marketing, analyse de navigation (cookies), programme de fidélité.",
    step2: "Pensez à bien distinguer les données nécessaires à la commande (contrat) de celles liées au marketing (consentement). Ce sont deux bases légales différentes.",
    step3: "Les cookies analytics et marketing nécessitent un bandeau de consentement conforme. Vérifiez aussi que votre politique de confidentialité est à jour.",
    step4: "Les risques principaux pour un e-commerce : fuite de données bancaires, accès illégitime au back-office, et transferts vers des prestataires hors UE (Stripe US, Mailchimp...).",
    step5: "Un score inférieur à 50 nécessite des actions correctives urgentes avant de poursuivre le traitement.",
    step6: "Priorité : sécurisez les données de paiement et vérifiez les contrats avec vos sous-traitants (hébergeur, paiement, emailing).",
  },
  restauration: {
    step1: "Pour la restauration, les traitements fréquents sont : réservations en ligne, vidéosurveillance, fidélité client, avis Google.",
    step2: "La vidéosurveillance nécessite une AIPD spécifique. Les données de réservation relèvent généralement de la base légale contractuelle.",
    step3: "Si vous utilisez la vidéosurveillance, vous devez afficher un panneau d'information et déclarer le dispositif à la CNIL.",
    step4: "Attention à la vidéosurveillance : les images sont des données personnelles sensibles avec un risque élevé d'usage détourné.",
    step5: "La vidéosurveillance augmente significativement le score de risque. Assurez-vous de limiter la conservation à 30 jours maximum.",
    step6: "Actions prioritaires : panneau d'information vidéo, limitation de conservation, et registre des accès aux images.",
  },
  commerce: {
    step1: "Pour un commerce de détail, les traitements typiques incluent : vidéosurveillance, carte fidélité, fichier clients, caisse enregistreuse.",
    step2: "La carte de fidélité collecte souvent plus de données que nécessaire. Appliquez le principe de minimisation.",
    step3: "Vérifiez que les clients sont informés de la collecte, notamment pour la carte de fidélité et la vidéosurveillance.",
    step4: "Les commerces physiques ont des risques spécifiques liés à la vidéosurveillance et à la sécurité des terminaux de paiement.",
    step5: "Un bon score pour un commerce se situe au-dessus de 70. En dessous, des mesures correctives sont nécessaires.",
    step6: "Pensez à former vos employés à la protection des données : c'est souvent le maillon faible de la chaîne.",
  },
  sante: {
    step1: "Attention : les données de santé sont des données sensibles (Art. 9 RGPD). Une AIPD est quasi-systématiquement obligatoire.",
    step2: "Les données de santé imposent des mesures de sécurité renforcées : chiffrement, hébergement HDS certifié, traçabilité des accès.",
    step3: "Le secret médical et le RGPD se cumulent. Chaque accès aux données doit être tracé et justifié.",
    step4: "Les risques sont maximaux pour les données de santé : toute fuite peut avoir des conséquences irréversibles pour les patients.",
    step5: "Pour les données de santé, un score inférieur à 75 est préoccupant et nécessite un plan d'action immédiat.",
    step6: "Vérifiez impérativement que votre hébergeur est certifié HDS (Hébergeur de Données de Santé).",
  },
  services: {
    step1: "Pour les services et le consulting, les traitements courants sont : CRM clients, gestion RH/paie, facturation, suivi de projets.",
    step2: "Les données RH sont particulièrement sensibles. Séparez bien les traitements RH des traitements commerciaux.",
    step3: "Assurez-vous que les salariés sont informés des traitements les concernant (note d'information, clause contrat de travail).",
    step4: "Le risque de fuite de données RH (bulletins de paie, évaluations) est souvent sous-estimé dans les cabinets de conseil.",
    step5: "Un score moyen est normal pour les services, mais les données RH méritent une attention particulière.",
    step6: "Signez des clauses de confidentialité avec vos consultants et vérifiez les contrats avec votre expert-comptable.",
  },
  artisan: {
    step1: "Pour un artisan, les traitements sont généralement simples : devis/factures, fichier clients, planning. Le risque est souvent limité.",
    step2: "Même un petit fichier clients Excel est un traitement de données personnelles soumis au RGPD.",
    step3: "L'avantage d'une petite structure : moins de données = moins de risques. Mais les obligations restent les mêmes.",
    step4: "Le risque principal pour un artisan : la perte de données par manque de sauvegarde.",
    step5: "Les artisans ont généralement un bon score grâce à la faible quantité de données traitées.",
    step6: "Priorité n°1 : mettez en place une sauvegarde régulière de vos fichiers clients et devis.",
  },
  education: {
    step1: "L'éducation traite souvent des données de mineurs, ce qui renforce les obligations RGPD (consentement parental, information adaptée).",
    step2: "Les données de mineurs imposent le consentement du titulaire de l'autorité parentale pour les enfants de moins de 15 ans.",
    step3: "La transparence est cruciale avec les parents : politique de confidentialité claire et accessible.",
    step4: "Les données scolaires et de mineurs sont des cibles prisées. Le risque de réputation est très élevé en cas de fuite.",
    step5: "Pour l'éducation, visez un score supérieur à 80 en raison de la vulnérabilité du public concerné.",
    step6: "Formez le personnel éducatif aux bonnes pratiques RGPD et sécurisez les accès aux plateformes numériques.",
  },
  finance: {
    step1: "Le secteur financier est très réglementé (RGPD + réglementation bancaire). Les obligations de KYC imposent une collecte de données importante.",
    step2: "Les données financières sont soumises à des durées de conservation légales spécifiques (5 ans minimum pour les transactions).",
    step3: "La conformité RGPD se cumule avec les obligations de la réglementation financière (ACPR, AMF).",
    step4: "Les données financières ont une valeur élevée sur le marché noir. Les risques de piratage sont maximaux.",
    step5: "Le secteur financier doit viser un score supérieur à 85 compte tenu de la sensibilité des données.",
    step6: "Audit de sécurité annuel, tests d'intrusion et formation continue des collaborateurs sont indispensables.",
  },
  tech: {
    step1: "Pour une entreprise tech/SaaS, les traitements incluent : comptes utilisateurs, analytics, logs techniques, support client.",
    step2: "Les logs techniques contiennent souvent des données personnelles (IP, user-agent). Ne les oubliez pas dans votre registre.",
    step3: "Privacy by design : intégrez la protection des données dès la conception de vos produits.",
    step4: "Les entreprises tech sont des cibles privilégiées : APIs exposées, bases de données volumineuses, dépendances tierces.",
    step5: "Une startup tech devrait viser un score supérieur à 70 minimum avant de lancer son produit.",
    step6: "Implémentez le Privacy by Design, documentez vos mesures de sécurité et réalisez des tests d'intrusion réguliers.",
  },
  immobilier: {
    step1: "L'immobilier collecte des données sensibles : pièces d'identité, revenus, garanties. La protection est essentielle.",
    step2: "Les dossiers de location contiennent de nombreuses données personnelles. Respectez la liste limitative des pièces justificatives autorisées.",
    step3: "Informez les candidats locataires de leurs droits et de la finalité du traitement de leur dossier.",
    step4: "Le risque de fuite de dossiers complets (identité + revenus + garants) est un risque majeur pour l'immobilier.",
    step5: "L'immobilier devrait viser un score supérieur à 70 en raison du volume de données personnelles traitées.",
    step6: "Sécurisez le stockage des dossiers de location et détruisez les dossiers des candidats non retenus dans les délais légaux.",
  },
  transport: {
    step1: "Le transport et la logistique traitent des données de géolocalisation, qui sont des données personnelles sensibles.",
    step2: "La géolocalisation des véhicules de salariés nécessite une information préalable et un encadrement strict.",
    step3: "Les conducteurs doivent être informés du dispositif de géolocalisation et de ses finalités précises.",
    step4: "La géolocalisation en temps réel est un traitement à risque élevé qui nécessite souvent une AIPD.",
    step5: "Le transport a des risques spécifiques liés à la géolocalisation. Un score inférieur à 60 nécessite des actions correctives.",
    step6: "Limitez l'accès à la géolocalisation, définissez des plages d'activation et informez clairement les conducteurs.",
  },
  autre: {
    step1: "Quel que soit votre secteur, le RGPD s'applique dès que vous collectez des données personnelles, même basiques.",
    step2: "Identifiez bien toutes les données que vous collectez, y compris celles que vous ne considérez pas comme personnelles (IP, cookies...).",
    step3: "La transparence est le pilier du RGPD : informez toujours les personnes concernées.",
    step4: "Évaluez les risques en fonction de la sensibilité des données et du volume de personnes concernées.",
    step5: "Un score général supérieur à 70 indique un bon niveau de conformité. En dessous, des améliorations sont nécessaires.",
    step6: "Documentez toutes vos mesures de conformité : c'est votre preuve d'accountability en cas de contrôle CNIL.",
  },
};

const NECESSITY_RECS = [
  "Réduisez les données collectées au strict nécessaire. Auditez chaque champ de formulaire.",
  "Définissez et documentez des durées de conservation précises pour chaque type de données.",
  "Rédigez et publiez une politique de confidentialité complète et accessible.",
  "Mettez en place un mécanisme de consentement conforme (opt-in, granulaire, retirable).",
  "Créez une procédure documentée pour répondre aux demandes d'exercice des droits sous 30 jours.",
  "Implémentez le chiffrement TLS/SSL pour les transmissions et le chiffrement AES-256 pour le stockage.",
  "Mettez en place une politique de gestion des accès avec authentification forte et traçabilité.",
  "Signez un contrat de sous-traitance RGPD (Art. 28) avec chaque prestataire ayant accès aux données.",
];

/* ===================================================================== */
/*  Demo data                                                             */
/* ===================================================================== */

const DEMO_AIPDS = [];

/* ===================================================================== */
/*  SVG Icons                                                             */
/* ===================================================================== */

const ScaleIcon = ({ size = 32, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18" /><path d="M2 7l10-4 10 4" />
    <path d="M2 7l3 9a5.002 5.002 0 0 0 4 0L6 7" />
    <path d="M18 7l3 9a5.002 5.002 0 0 1-4 0l-2-9" />
  </svg>
);

const PlusIcon = ({ size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronLeftIcon = ({ size = 16, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const CheckIcon = ({ size = 16, color = "#22c55e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size = 16, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ===================================================================== */
/*  Helpers                                                               */
/* ===================================================================== */

const riskColor = (level) => {
  if (level === "faible") return "#22c55e";
  if (level === "moyen") return "#f59e0b";
  if (level === "eleve") return "#f97316";
  return "#ef4444";
};

const riskLabel = (level) => {
  if (level === "faible") return "Faible";
  if (level === "moyen") return "Moyen";
  if (level === "eleve") return "Élevé";
  return "Critique";
};

const scoreToLevel = (score) => {
  if (score >= 76) return "faible";
  if (score >= 51) return "moyen";
  if (score >= 26) return "eleve";
  return "critique";
};

const calcRiskScore = (risks) => {
  if (!risks || risks.length === 0) return 100;
  const avgProduct = risks.reduce((s, r) => s + r.gravity * r.likelihood, 0) / risks.length;
  const maxProduct = 16;
  return Math.round(100 - (avgProduct / maxProduct) * 100);
};

const calcRiskLevel = (risks) => scoreToLevel(calcRiskScore(risks));

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

const sectorInfo = (val) => SECTEURS.find((s) => s.value === val) || SECTEURS[SECTEURS.length - 1];

const heatCellColor = (score) => {
  if (score <= 4) return "#22c55e";
  if (score <= 8) return "#f59e0b";
  if (score <= 12) return "#f97316";
  return "#ef4444";
};

/* ===================================================================== */
/*  Sub-components                                                        */
/* ===================================================================== */

/* NOÉ suggestion box */
const NoeBox = ({ text }) => {
  if (!text) return null;
  return (
    <div style={{
      background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)",
      borderLeft: "3px solid #06b6d4", borderRadius: 8, padding: "12px 16px",
      marginTop: 12, marginBottom: 8, fontSize: 13, color: "#94a3b8", lineHeight: 1.6,
    }}>
      <span style={{ fontWeight: 600, color: "#06b6d4", marginRight: 8 }}>🤖 NOÉ suggère :</span>
      {text}
    </div>
  );
};

/* Step progress bar */
const StepProgress = ({ current, total = 6 }) => {
  const labels = ["Contexte", "Traitement", "Nécessité", "Risques", "Carte", "Actions"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24, overflowX: "auto" }}>
      {labels.map((lab, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 64 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? ACCENT : active ? "rgba(6,182,212,0.15)" : "#1e2029",
                border: active ? `2px solid ${ACCENT}` : done ? "none" : "2px solid #2a2d3a",
                color: done ? "#fff" : active ? ACCENT : "#64748b", fontSize: 12, fontWeight: 700,
              }}>
                {done ? <CheckIcon size={14} color="#fff" /> : i + 1}
              </div>
              <span style={{ fontSize: 10, marginTop: 4, color: active ? ACCENT : done ? "#94a3b8" : "#475569", fontWeight: active ? 600 : 400 }}>
                {lab}
              </span>
            </div>
            {i < total - 1 && (
              <div style={{ width: 32, height: 2, background: done ? ACCENT : "#2a2d3a", margin: "0 2px", marginBottom: 16 }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* Score ring gauge */
const ScoreRing = ({ score, size = 120 }) => {
  const level = scoreToLevel(score);
  const color = riskColor(level);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e2029" strokeWidth={10} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        </svg>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>/100</div>
        </div>
      </div>
      <div style={{
        marginTop: 8, padding: "4px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600,
        background: `${color}18`, color, border: `1px solid ${color}33`,
      }}>
        {riskLabel(level)}
      </div>
    </div>
  );
};

/* Heat map 4x4 */
const HeatMap = ({ risks }) => {
  const grid = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => []));
  (risks || []).forEach((r, i) => {
    const gi = Math.min(Math.max((r.gravity || 1) - 1, 0), 3);
    const li = Math.min(Math.max((r.likelihood || 1) - 1, 0), 3);
    grid[3 - gi][li].push(i);
  });
  const axisLabels = ["Negl.", "Limitee", "Import.", "Maximale"];
  const cellW = 60;
  const cellH = 52;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Y-axis label */}
      <div style={{ marginLeft: 62, marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Gravite &#8593;</span>
      </div>
      <div style={{ display: "flex", gap: 0 }}>
        {/* Y labels */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", width: 58, paddingRight: 6 }}>
          {[...axisLabels].reverse().map((l, i) => (
            <span key={i} style={{ fontSize: 10, color: "#94a3b8", textAlign: "right", height: cellH, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{l}</span>
          ))}
        </div>
        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(4, ${cellW}px)`, gridTemplateRows: `repeat(4, ${cellH}px)`, gap: 2 }}>
          {grid.flat().map((dots, idx) => {
            const row = Math.floor(idx / 4);
            const col = idx % 4;
            const g = 4 - row;
            const l = col + 1;
            const product = g * l;
            return (
              <div key={idx} style={{
                background: `${heatCellColor(product)}20`, border: `1px solid ${heatCellColor(product)}44`,
                borderRadius: 6, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 4, padding: 4,
              }}>
                {dots.map((rIdx) => (
                  <div key={rIdx} style={{
                    width: 18, height: 18, borderRadius: "50%", background: heatCellColor(product),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: "#fff",
                  }}>
                    {rIdx + 1}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      {/* X labels */}
      <div style={{ display: "flex", marginLeft: 64, gap: 2, marginTop: 4 }}>
        {axisLabels.map((l, i) => (
          <span key={i} style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", width: cellW }}>{l}</span>
        ))}
      </div>
      <div style={{ textAlign: "center", marginLeft: 64, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>&larr; Vraisemblance &rarr;</span>
      </div>
    </div>
  );
};

/* ===================================================================== */
/*  Main Component                                                        */
/* ===================================================================== */

export default function VaultAipdPage() {
  /* view: "list" | "detail" | "wizard" */
  const [view, setView] = useState("list");
  const [analyses, setAnalyses] = useState(DEMO_AIPDS);
  const [selectedId, setSelectedId] = useState(null);
  const [step, setStep] = useState(0);

  /* Wizard state */
  const [wiz, setWiz] = useState({
    sector: "", company: "", employees: "",
    treatmentName: "", treatmentDesc: "", dataTypes: [],
    legalBasis: "", recipients: "", duration: "",
    necessity: Array(8).fill(null),
    risks: RISK_SCENARIOS.map(() => ({ gravity: 1, likelihood: 1 })),
    actions: [],
  });

  const updateWiz = (key, val) => setWiz((p) => ({ ...p, [key]: val }));

  const toggleDataType = (dt) => {
    setWiz((p) => ({
      ...p,
      dataTypes: p.dataTypes.includes(dt) ? p.dataTypes.filter((d) => d !== dt) : [...p.dataTypes, dt],
    }));
  };

  const setNecessity = (idx, val) => {
    setWiz((p) => {
      const n = [...p.necessity];
      n[idx] = val;
      return { ...p, necessity: n };
    });
  };

  const setRisk = (idx, field, val) => {
    setWiz((p) => {
      const r = [...p.risks];
      r[idx] = { ...r[idx], [field]: val };
      return { ...p, risks: r };
    });
  };

  /* NOÉ auto-fill risks based on sector + data types */
  const autoFillRisks = () => {
    const hasSensitive = wiz.dataTypes.some(d => ["Données de santé", "Données biométriques", "Images/Vidéo"].includes(d));
    const hasFinancial = wiz.dataTypes.includes("Données bancaires");
    const hasTracking = wiz.dataTypes.some(d => ["Géolocalisation", "Adresse IP", "Données de navigation"].includes(d));
    const hasIdentity = wiz.dataTypes.some(d => ["Identité", "Coordonnées", "Email", "Téléphone"].includes(d));
    const isHighVolume = ["21-50", "51-250", "250+"].includes(wiz.employees);
    const s = wiz.sector;

    const base = {
      acces:     { gravity: hasFinancial || hasSensitive ? 4 : hasIdentity ? 3 : 2, likelihood: isHighVolume ? 3 : s === "tech" ? 3 : 2 },
      modif:     { gravity: hasSensitive ? 3 : hasFinancial ? 3 : 2, likelihood: 1 },
      disparition: { gravity: hasSensitive ? 4 : hasFinancial ? 3 : 2, likelihood: s === "tech" ? 1 : 2 },
      collecte:  { gravity: hasSensitive ? 3 : 2, likelihood: hasTracking ? 3 : hasSensitive ? 2 : s === "ecommerce" ? 3 : 2 },
      detourne:  { gravity: hasSensitive ? 4 : hasTracking ? 3 : 2, likelihood: hasTracking ? 2 : 1 },
      transfert: { gravity: hasFinancial ? 3 : hasSensitive ? 3 : 2, likelihood: s === "ecommerce" || s === "tech" ? 3 : s === "finance" ? 2 : 1 },
    };

    // Sector-specific adjustments
    if (s === "sante") { base.acces.gravity = 4; base.acces.likelihood = 3; base.detourne.gravity = 4; }
    if (s === "commerce" && wiz.treatmentName.toLowerCase().includes("vidéo")) { base.detourne.gravity = 4; base.detourne.likelihood = 2; base.collecte.gravity = 3; base.collecte.likelihood = 3; }
    if (s === "restauration") { base.transfert.likelihood = 1; }
    if (s === "finance") { base.acces.gravity = 4; base.acces.likelihood = 3; base.modif.gravity = 4; }

    const keys = ["acces", "modif", "disparition", "collecte", "detourne", "transfert"];
    return keys.map(k => ({ gravity: Math.min(4, base[k].gravity), likelihood: Math.min(4, base[k].likelihood) }));
  };

  const startWizard = () => {
    setWiz({
      sector: "", company: "", employees: "",
      treatmentName: "", treatmentDesc: "", dataTypes: [],
      legalBasis: "", recipients: "", duration: "",
      necessity: Array(8).fill(null),
      risks: RISK_SCENARIOS.map(() => ({ gravity: 1, likelihood: 1 })),
      actions: [],
    });
    setStep(0);
    setView("wizard");
  };

  const openDetail = (id) => {
    setSelectedId(id);
    setView("detail");
  };

  /* Generate actions from necessity + risks */
  const generateActions = () => {
    const acts = [];
    wiz.necessity.forEach((v, i) => {
      if (v === false) {
        acts.push({ title: NECESSITY_RECS[i], priority: i === 5 || i === 0 ? "Critique" : "Haute", editing: false });
      }
    });
    wiz.risks.forEach((r, i) => {
      const product = r.gravity * r.likelihood;
      if (product >= 9) {
        acts.push({
          title: `Traiter le risque "${RISK_SCENARIOS[i].name}" (score ${product}/16)`,
          priority: product >= 12 ? "Critique" : "Haute", editing: false,
        });
      }
    });
    if (acts.length === 0) {
      acts.push({ title: "Maintenir les mesures actuelles et réaliser un audit annuel", priority: "Moyenne", editing: false });
    }
    return acts;
  };

  useEffect(() => {
    if (step === 5) {
      const acts = generateActions();
      updateWiz("actions", acts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const saveAnalysis = () => {
    const score = calcRiskScore(wiz.risks.map((r, i) => ({ ...r, name: RISK_SCENARIOS[i].name })));
    const level = scoreToLevel(score);
    const newA = {
      id: "p" + Date.now(),
      name: wiz.treatmentName || "Analyse sans nom",
      sector: wiz.sector || "autre",
      company: wiz.company || "Mon entreprise",
      employees: wiz.employees || "1-5",
      riskLevel: level,
      score,
      date: new Date().toISOString(),
      dataTypes: wiz.dataTypes,
      treatment: wiz.treatmentDesc,
      legalBasis: wiz.legalBasis,
      recipients: wiz.recipients,
      duration: wiz.duration,
      risks: wiz.risks.map((r, i) => ({ name: RISK_SCENARIOS[i].name, gravity: r.gravity, likelihood: r.likelihood })),
      necessity: wiz.necessity,
      actions: wiz.actions.map((a) => ({ title: a.title, priority: a.priority })),
    };
    setAnalyses((prev) => [newA, ...prev]);
    setView("list");
  };

  const noeSuggestion = (stepKey) => {
    const sector = wiz.sector || "autre";
    return (NOE_SUGGESTIONS[sector] || NOE_SUGGESTIONS.autre)[stepKey] || null;
  };

  const selected = analyses.find((a) => a.id === selectedId);

  const deleteAnalysis = (id) => {
    if (!window.confirm("Supprimer cette analyse ?")) return;
    setAnalyses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      try { localStorage.setItem("vault_aipd", JSON.stringify(next)); } catch (_) {}
      return next;
    });
    if (selectedId === id) setView("list");
  };

  const exportPDF = (analysisId) => {
    const analysis = analysisId ? analyses.find((a) => a.id === analysisId) : selected;
    if (!analysis) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>AIPD - ${analysis.name}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
  h1 { color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; }
  h2 { color: #1e293b; margin-top: 30px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
  .risk-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  .risk-table th, .risk-table td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
  .risk-table th { background: #f1f5f9; }
  .action-item { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head><body>
<h1>Analyse d'Impact — ${analysis.name}</h1>
<p><strong>Entreprise :</strong> ${analysis.company || '—'} | <strong>Secteur :</strong> ${analysis.sector || '—'} | <strong>Date :</strong> ${new Date(analysis.date).toLocaleDateString('fr-FR')}</p>
<p><strong>Score de risque :</strong> ${analysis.score}/100 — <strong>Niveau :</strong> ${analysis.riskLevel}</p>

<h2>Données concernées</h2>
<p>${(analysis.dataTypes || []).join(', ')}</p>

<h2>Description du traitement</h2>
<p>${analysis.treatment || '—'}</p>
<p><strong>Base légale :</strong> ${analysis.legalBasis || '—'}</p>

<h2>Analyse des risques</h2>
<table class="risk-table">
  <thead><tr><th>Scénario</th><th>Gravité</th><th>Vraisemblance</th><th>Score</th></tr></thead>
  <tbody>
    ${(analysis.risks || []).map(r =>
      '<tr><td>' + r.name + '</td><td>' + r.gravity + '/4</td><td>' + r.likelihood + '/4</td><td>' + (r.gravity * r.likelihood) + '/16</td></tr>'
    ).join('')}
  </tbody>
</table>

<h2>Plan d'action</h2>
${(analysis.actions || []).map(a => '<div class="action-item">• ' + (typeof a === 'string' ? a : a.title || a) + '</div>').join('')}

<div class="footer">
  Ce document constitue une preuve d'accountability RGPD (Article 35).<br>
  Généré par NERVÜR Vault — Agent Juridique IA — ${new Date().toLocaleDateString('fr-FR')}
</div>
</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  /* ------------------------------------------------------------------ */
  /*  Common styles                                                      */
  /* ------------------------------------------------------------------ */
  const card = {
    background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: 12, padding: 20,
  };
  const inputStyle = {
    width: "100%", background: "#161820", border: "1px solid #2a2d3a", borderRadius: 8,
    padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none",
  };
  const btnPrimary = {
    background: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px",
    fontWeight: 600, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
  };
  const btnSecondary = {
    background: "transparent", color: "#94a3b8", border: "1px solid #2a2d3a", borderRadius: 8,
    padding: "10px 20px", fontWeight: 500, fontSize: 14, cursor: "pointer",
  };

  /* ------------------------------------------------------------------ */
  /*  WIZARD STEPS                                                       */
  /* ------------------------------------------------------------------ */

  const renderStep0 = () => (
    <div>
      <h3 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Étape 1 — Secteur & Contexte</h3>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Identifiez votre secteur d'activité pour des recommandations personnalisées.</p>

      <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Secteur d'activité</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8, marginBottom: 20 }}>
        {SECTEURS.map((s) => (
          <button key={s.value} onClick={() => updateWiz("sector", s.value)} style={{
            background: wiz.sector === s.value ? "rgba(6,182,212,0.12)" : "#161820",
            border: wiz.sector === s.value ? `2px solid ${ACCENT}` : "1px solid #2a2d3a",
            borderRadius: 10, padding: "12px 10px", cursor: "pointer", textAlign: "center",
            color: wiz.sector === s.value ? "#e2e8f0" : "#94a3b8", transition: "all .15s",
          }}>
            <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}><SectorIcon type={s.value} size={24} color={wiz.sector === s.value ? ACCENT : "#64748b"} /></div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{s.label}</div>
          </button>
        ))}
      </div>

      <NoeBox text={noeSuggestion("step1")} />

      <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, marginTop: 16 }}>Nom de l'entreprise</label>
      <input value={wiz.company} onChange={(e) => updateWiz("company", e.target.value)} placeholder="Ex : Ma Boutique SAS" style={inputStyle} />

      <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, marginTop: 16 }}>Nombre de salariés</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {EMPLOYEE_RANGES.map((r) => (
          <button key={r} onClick={() => updateWiz("employees", r)} style={{
            background: wiz.employees === r ? "rgba(6,182,212,0.12)" : "#161820",
            border: wiz.employees === r ? `2px solid ${ACCENT}` : "1px solid #2a2d3a",
            borderRadius: 8, padding: "8px 18px", color: wiz.employees === r ? ACCENT : "#94a3b8",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>
            {r}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => {
    const suggestions = TREATMENT_SUGGESTIONS[wiz.sector] || TREATMENT_SUGGESTIONS.autre;
    return (
      <div>
        <h3 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Étape 2 — Description du traitement</h3>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Décrivez précisément le traitement de données que vous souhaitez analyser.</p>

        <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Nom du traitement</label>
        <input value={wiz.treatmentName} onChange={(e) => updateWiz("treatmentName", e.target.value)} placeholder="Ex : Gestion des commandes" style={inputStyle} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, marginBottom: 16 }}>
          {suggestions.map((s) => (
            <button key={s} onClick={() => updateWiz("treatmentName", s)} style={{
              background: wiz.treatmentName === s ? "rgba(6,182,212,0.12)" : "transparent",
              border: `1px solid ${wiz.treatmentName === s ? ACCENT : "#2a2d3a"}`,
              borderRadius: 20, padding: "4px 12px", color: wiz.treatmentName === s ? ACCENT : "#64748b",
              fontSize: 12, cursor: "pointer",
            }}>
              {s}
            </button>
          ))}
        </div>

        <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Finalité du traitement</label>
        <textarea value={wiz.treatmentDesc} onChange={(e) => updateWiz("treatmentDesc", e.target.value)}
          placeholder="Décrivez la finalité du traitement et les opérations effectuées sur les données..."
          rows={3} style={{ ...inputStyle, resize: "vertical" }} />

        <NoeBox text={noeSuggestion("step2")} />

        <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8, marginTop: 16 }}>Catégories de données collectées</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {DATA_CATEGORIES.map((dt) => (
            <button key={dt} onClick={() => toggleDataType(dt)} style={{
              background: wiz.dataTypes.includes(dt) ? "rgba(6,182,212,0.12)" : "#161820",
              border: `1px solid ${wiz.dataTypes.includes(dt) ? ACCENT : "#2a2d3a"}`,
              borderRadius: 8, padding: "6px 14px", color: wiz.dataTypes.includes(dt) ? ACCENT : "#94a3b8",
              fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .15s",
            }}>
              {wiz.dataTypes.includes(dt) && <span style={{ marginRight: 4 }}>✓</span>}
              {dt}
            </button>
          ))}
        </div>

        <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Base légale</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginBottom: 20 }}>
          {LEGAL_BASES.map((lb) => (
            <button key={lb.value} onClick={() => updateWiz("legalBasis", lb.value)} style={{
              background: wiz.legalBasis === lb.value ? "rgba(6,182,212,0.12)" : "#161820",
              border: wiz.legalBasis === lb.value ? `2px solid ${ACCENT}` : "1px solid #2a2d3a",
              borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left",
            }}>
              <div style={{ color: wiz.legalBasis === lb.value ? "#e2e8f0" : "#94a3b8", fontSize: 13, fontWeight: 600 }}>{lb.value}</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{lb.desc}</div>
            </button>
          ))}
        </div>

        <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Destinataires des données</label>
        <input value={wiz.recipients} onChange={(e) => updateWiz("recipients", e.target.value)} placeholder="Ex : Hébergeur web, Expert-comptable" style={inputStyle} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6, marginBottom: 16 }}>
          {RECIPIENT_SUGGESTIONS.map((r) => (
            <button key={r} onClick={() => updateWiz("recipients", wiz.recipients ? wiz.recipients + ", " + r : r)} style={{
              background: "transparent", border: "1px solid #2a2d3a", borderRadius: 20,
              padding: "3px 10px", color: "#64748b", fontSize: 11, cursor: "pointer",
            }}>
              + {r}
            </button>
          ))}
        </div>

        <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Durée de conservation</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DURATIONS.map((d) => (
            <button key={d} onClick={() => updateWiz("duration", d)} style={{
              background: wiz.duration === d ? "rgba(6,182,212,0.12)" : "#161820",
              border: `1px solid ${wiz.duration === d ? ACCENT : "#2a2d3a"}`,
              borderRadius: 8, padding: "6px 14px", color: wiz.duration === d ? ACCENT : "#94a3b8",
              fontSize: 12, cursor: "pointer",
            }}>
              {d}
            </button>
          ))}
        </div>
        <NoeBox text="La CNIL recommande de ne pas dépasser 3 ans pour les données clients inactifs et 13 mois pour les cookies." />
      </div>
    );
  };

  const renderStep2 = () => (
    <div>
      <h3 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Étape 3 — Nécessité & Proportionnalité</h3>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Évaluez la conformité de votre traitement aux principes du RGPD.</p>

      <NoeBox text={noeSuggestion("step3")} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {NECESSITY_QUESTIONS.map((nq, i) => (
          <div key={i} style={{
            ...card, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            borderLeft: wiz.necessity[i] === true ? "3px solid #22c55e" : wiz.necessity[i] === false ? "3px solid #ef4444" : "3px solid #2a2d3a",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{nq.q}</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>({nq.ref})</div>
              {wiz.necessity[i] === false && (
                <div style={{ color: "#f59e0b", fontSize: 11, marginTop: 6, fontStyle: "italic" }}>
                  Recommandation : {NECESSITY_RECS[i]}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button onClick={() => setNecessity(i, true)} style={{
                background: wiz.necessity[i] === true ? "#22c55e22" : "#161820",
                border: `1px solid ${wiz.necessity[i] === true ? "#22c55e" : "#2a2d3a"}`,
                borderRadius: 8, padding: "6px 16px", color: wiz.necessity[i] === true ? "#22c55e" : "#64748b",
                fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }}>
                <CheckIcon size={14} color={wiz.necessity[i] === true ? "#22c55e" : "#64748b"} /> Oui
              </button>
              <button onClick={() => setNecessity(i, false)} style={{
                background: wiz.necessity[i] === false ? "#ef444422" : "#161820",
                border: `1px solid ${wiz.necessity[i] === false ? "#ef4444" : "#2a2d3a"}`,
                borderRadius: 8, padding: "6px 16px", color: wiz.necessity[i] === false ? "#ef4444" : "#64748b",
                fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }}>
                <XIcon size={14} color={wiz.necessity[i] === false ? "#ef4444" : "#64748b"} /> Non
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Étape 4 — Analyse des risques</h3>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Évaluez la gravité et la vraisemblance de chaque scénario de risque.</p>

      <NoeBox text={"NOÉ a pré-rempli les scores de risque en fonction de votre secteur d'activité et des données collectées. Vous pouvez ajuster chaque score selon votre contexte spécifique."} />
      <NoeBox text={noeSuggestion("step4")} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {RISK_SCENARIOS.map((rs, i) => {
          const product = wiz.risks[i].gravity * wiz.risks[i].likelihood;
          const cellColor = heatCellColor(product);
          return (
            <div key={rs.key} style={{ ...card, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{rs.name}</div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>{rs.desc}</div>
                </div>
                <div style={{
                  background: `${cellColor}22`, border: `1px solid ${cellColor}44`, borderRadius: 8,
                  padding: "4px 12px", fontSize: 13, fontWeight: 700, color: cellColor,
                }}>
                  {product}/16
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Gravité</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4].map((v) => (
                      <button key={v} onClick={() => setRisk(i, "gravity", v)} style={{
                        background: wiz.risks[i].gravity === v ? `${heatCellColor(v * wiz.risks[i].likelihood)}22` : "#161820",
                        border: `1px solid ${wiz.risks[i].gravity === v ? heatCellColor(v * wiz.risks[i].likelihood) : "#2a2d3a"}`,
                        borderRadius: 6, padding: "5px 10px", color: wiz.risks[i].gravity === v ? heatCellColor(v * wiz.risks[i].likelihood) : "#64748b",
                        fontSize: 11, fontWeight: 600, cursor: "pointer", minWidth: 32,
                      }}>
                        {v}
                        <div style={{ fontSize: 8, fontWeight: 400 }}>{RISK_LEVELS_LABELS[v - 1]}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Vraisemblance</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4].map((v) => (
                      <button key={v} onClick={() => setRisk(i, "likelihood", v)} style={{
                        background: wiz.risks[i].likelihood === v ? `${heatCellColor(wiz.risks[i].gravity * v)}22` : "#161820",
                        border: `1px solid ${wiz.risks[i].likelihood === v ? heatCellColor(wiz.risks[i].gravity * v) : "#2a2d3a"}`,
                        borderRadius: 6, padding: "5px 10px", color: wiz.risks[i].likelihood === v ? heatCellColor(wiz.risks[i].gravity * v) : "#64748b",
                        fontSize: 11, fontWeight: 600, cursor: "pointer", minWidth: 32,
                      }}>
                        {v}
                        <div style={{ fontSize: 8, fontWeight: 400 }}>{RISK_LEVELS_LABELS[v - 1]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep4 = () => {
    const riskData = wiz.risks.map((r, i) => ({ ...r, name: RISK_SCENARIOS[i].name }));
    const score = calcRiskScore(riskData);
    const level = scoreToLevel(score);
    return (
      <div>
        <h3 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Étape 5 — Carte de chaleur & Score</h3>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Visualisez votre matrice de risques et votre score global de conformité.</p>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ ...card, padding: 24 }}>
            <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Matrice de risques</div>
            <HeatMap risks={riskData} />
          </div>
          <div style={{ ...card, padding: 24, textAlign: "center", minWidth: 200 }}>
            <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Score global</div>
            <ScoreRing score={score} />
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { label: "1-4 : Acceptable", color: "#22c55e" },
            { label: "5-8 : Modéré", color: "#f59e0b" },
            { label: "9-12 : Préoccupant", color: "#f97316" },
            { label: "13-16 : Critique", color: "#ef4444" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Risk detail table */}
        <div style={{ ...card, padding: 16, marginBottom: 16 }}>
          <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Détail des risques</div>
          {riskData.map((r, i) => {
            const product = r.gravity * r.likelihood;
            const c = heatCellColor(product);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i < riskData.length - 1 ? "1px solid #2a2d3a" : "none" }}>
                <span style={{ color: "#e2e8f0", fontSize: 12 }}>{i + 1}. {r.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#64748b", fontSize: 11 }}>G:{r.gravity} x V:{r.likelihood}</span>
                  <span style={{ background: `${c}22`, color: c, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
                    {product}/16
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <NoeBox text={noeSuggestion("step5")} />
      </div>
    );
  };

  const renderStep5 = () => {
    const riskData = wiz.risks.map((r, i) => ({ ...r, name: RISK_SCENARIOS[i].name }));
    const score = calcRiskScore(riskData);
    const level = scoreToLevel(score);
    const risksHighCount = riskData.filter((r) => r.gravity * r.likelihood >= 9).length;
    const nonCount = wiz.necessity.filter((n) => n === false).length;
    const confCount = wiz.necessity.filter((n) => n === true).length;

    const updateAction = (idx, title) => {
      setWiz((p) => {
        const a = [...p.actions];
        a[idx] = { ...a[idx], title };
        return { ...p, actions: a };
      });
    };

    const priorityColor = (p) => {
      if (p === "Critique") return "#ef4444";
      if (p === "Haute") return "#f97316";
      return "#f59e0b";
    };

    return (
      <div>
        <h3 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Étape 6 — Plan d'action & Résultat</h3>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Vos actions correctives et le résumé de votre analyse d'impact.</p>

        <NoeBox text={noeSuggestion("step6")} />

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginTop: 16, marginBottom: 20 }}>
          {[
            { label: "Traitement", value: wiz.treatmentName || "\u2014", iconType: "clipboard" },
            { label: "Secteur", value: sectorInfo(wiz.sector).label, iconType: wiz.sector || "autre" },
            { label: "Score", value: `${score}/100`, iconType: "chart", color: riskColor(level) },
            { label: "Niveau", value: riskLabel(level), iconType: "target", color: riskColor(level) },
          ].map((c, i) => (
            <div key={i} style={{ ...card, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}><SectorIcon type={c.iconType} size={20} color={c.color || ACCENT} /></div>
              <div style={{ color: "#64748b", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
              <div style={{ color: c.color || "#e2e8f0", fontSize: 15, fontWeight: 700, marginTop: 2 }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ color: "#94a3b8", fontSize: 13 }}><strong style={{ color: "#e2e8f0" }}>{risksHighCount}</strong> risques élevés identifiés</div>
          <div style={{ color: "#94a3b8", fontSize: 13 }}><strong style={{ color: "#e2e8f0" }}>{wiz.actions.length}</strong> mesures recommandées</div>
          <div style={{ color: "#94a3b8", fontSize: 13 }}><strong style={{ color: "#22c55e" }}>{confCount}</strong> points de conformité</div>
          <div style={{ color: "#94a3b8", fontSize: 13 }}><strong style={{ color: "#ef4444" }}>{nonCount}</strong> non-conformités</div>
        </div>

        {/* Actions */}
        <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Plan d'action correctif</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {wiz.actions.map((a, i) => (
            <div key={i} style={{ ...card, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                background: `${priorityColor(a.priority)}22`, color: priorityColor(a.priority),
                fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, flexShrink: 0,
                border: `1px solid ${priorityColor(a.priority)}33`,
              }}>
                {a.priority}
              </span>
              <input
                value={a.title}
                onChange={(e) => updateAction(i, e.target.value)}
                style={{ ...inputStyle, border: "none", background: "transparent", padding: "2px 0", flex: 1 }}
              />
            </div>
          ))}
        </div>

        {/* Accountability banner */}
        <div style={{
          background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)",
          borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>📜</span>
          <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>
            <strong style={{ color: "#e2e8f0" }}>Preuve d'accountability RGPD</strong><br />
            Cette AIPD constitue votre preuve de conformité au titre de l'article 35 du RGPD. Conservez ce document et mettez-le à jour lors de toute modification du traitement.
          </div>
        </div>

        {/* Save / Export */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={saveAnalysis} style={btnPrimary}>Enregistrer l'analyse</button>
          <button onClick={() => exportPDF()} style={btnSecondary}>Exporter PDF</button>
        </div>
      </div>
    );
  };

  const wizardSteps = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  /* ------------------------------------------------------------------ */
  /*  DETAIL VIEW                                                        */
  /* ------------------------------------------------------------------ */

  const renderDetail = () => {
    if (!selected) return null;
    const s = selected;
    const sc = sectorInfo(s.sector);
    const color = riskColor(s.riskLevel);
    return (
      <div>
        <button onClick={() => setView("list")} style={{ ...btnSecondary, marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ChevronLeftIcon size={14} /> Retour à la liste
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center" }}><SectorIcon type={s.sector} size={32} /></div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: "#e2e8f0", fontSize: 20, fontWeight: 700, margin: 0 }}>{s.name}</h2>
            <div style={{ color: "#64748b", fontSize: 13 }}>{s.company} — {sc.label}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{s.score}</div>
            <div style={{
              background: `${color}18`, color, fontSize: 11, fontWeight: 600, padding: "2px 12px",
              borderRadius: 20, border: `1px solid ${color}33`,
            }}>
              {riskLabel(s.riskLevel)}
            </div>
          </div>
        </div>

        {/* Section: Contexte */}
        <div style={{ ...card, marginBottom: 12 }}>
          <h4 style={{ color: ACCENT, fontSize: 14, fontWeight: 700, marginBottom: 10, marginTop: 0 }}>1. Contexte</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
            <div><span style={{ color: "#64748b" }}>Entreprise :</span> <span style={{ color: "#e2e8f0" }}>{s.company}</span></div>
            <div><span style={{ color: "#64748b" }}>Secteur :</span> <span style={{ color: "#e2e8f0", display: "inline-flex", alignItems: "center", gap: 6 }}><SectorIcon type={s.sector} size={14} /> {sc.label}</span></div>
            <div><span style={{ color: "#64748b" }}>Effectif :</span> <span style={{ color: "#e2e8f0" }}>{s.employees} salariés</span></div>
            <div><span style={{ color: "#64748b" }}>Date :</span> <span style={{ color: "#e2e8f0" }}>{fmtDate(s.date)}</span></div>
          </div>
        </div>

        {/* Section: Traitement */}
        <div style={{ ...card, marginBottom: 12 }}>
          <h4 style={{ color: ACCENT, fontSize: 14, fontWeight: 700, marginBottom: 10, marginTop: 0 }}>2. Description du traitement</h4>
          <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{s.treatment}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, marginBottom: 10 }}>
            <div><span style={{ color: "#64748b" }}>Base légale :</span> <span style={{ color: "#e2e8f0" }}>{s.legalBasis}</span></div>
            <div><span style={{ color: "#64748b" }}>Conservation :</span> <span style={{ color: "#e2e8f0" }}>{s.duration || "—"}</span></div>
            <div><span style={{ color: "#64748b" }}>Destinataires :</span> <span style={{ color: "#e2e8f0" }}>{s.recipients || "—"}</span></div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(s.dataTypes || []).map((dt) => (
              <span key={dt} style={{
                background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)",
                borderRadius: 6, padding: "3px 10px", color: ACCENT, fontSize: 11,
              }}>
                {dt}
              </span>
            ))}
          </div>
        </div>

        {/* Section: Nécessité */}
        <div style={{ ...card, marginBottom: 12 }}>
          <h4 style={{ color: ACCENT, fontSize: 14, fontWeight: 700, marginBottom: 10, marginTop: 0 }}>3. Nécessité & Proportionnalité</h4>
          {NECESSITY_QUESTIONS.map((nq, i) => {
            const val = s.necessity ? s.necessity[i] : null;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < 7 ? "1px solid #2a2d3a22" : "none" }}>
                {val === true ? <CheckIcon size={14} /> : val === false ? <XIcon size={14} /> : <span style={{ width: 14, height: 14, display: "inline-block" }} />}
                <span style={{ color: "#e2e8f0", fontSize: 12, flex: 1 }}>{nq.q}</span>
                <span style={{ color: "#64748b", fontSize: 10 }}>({nq.ref})</span>
              </div>
            );
          })}
        </div>

        {/* Section: Risques + Heat map */}
        <div style={{ ...card, marginBottom: 12 }}>
          <h4 style={{ color: ACCENT, fontSize: 14, fontWeight: 700, marginBottom: 10, marginTop: 0 }}>4. Analyse des risques</h4>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 16 }}>
            <HeatMap risks={s.risks} />
            <ScoreRing score={s.score} size={100} />
          </div>
          {(s.risks || []).map((r, i) => {
            const product = r.gravity * r.likelihood;
            const c = heatCellColor(product);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: i < s.risks.length - 1 ? "1px solid #2a2d3a22" : "none" }}>
                <span style={{ color: "#e2e8f0", fontSize: 12 }}>{r.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#64748b", fontSize: 11 }}>G:{r.gravity} x V:{r.likelihood}</span>
                  <span style={{ background: `${c}22`, color: c, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>{product}/16</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section: Actions */}
        <div style={{ ...card, marginBottom: 12 }}>
          <h4 style={{ color: ACCENT, fontSize: 14, fontWeight: 700, marginBottom: 10, marginTop: 0 }}>5. Plan d'action</h4>
          {(s.actions || []).map((a, i) => {
            const title = typeof a === "string" ? a : a.title;
            const priority = typeof a === "string" ? "Haute" : a.priority;
            const pc = priority === "Critique" ? "#ef4444" : priority === "Haute" ? "#f97316" : "#f59e0b";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < s.actions.length - 1 ? "1px solid #2a2d3a22" : "none" }}>
                <span style={{
                  background: `${pc}22`, color: pc, fontSize: 10, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 4, border: `1px solid ${pc}33`, flexShrink: 0,
                }}>
                  {priority}
                </span>
                <span style={{ color: "#e2e8f0", fontSize: 12 }}>{title}</span>
              </div>
            );
          })}
        </div>

        {/* Accountability banner */}
        <div style={{
          background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)",
          borderRadius: 10, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>📜</span>
          <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>
            <strong style={{ color: "#e2e8f0" }}>Preuve d'accountability RGPD</strong><br />
            Cette AIPD constitue votre preuve de conformité au titre de l'article 35 du RGPD. Conservez ce document et mettez-le à jour lors de toute modification du traitement.
          </div>
        </div>

        <button onClick={() => exportPDF()} style={btnSecondary}>Exporter PDF</button>
      </div>
    );
  };

  /* ------------------------------------------------------------------ */
  /*  LIST VIEW                                                          */
  /* ------------------------------------------------------------------ */

  const renderList = () => (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ color: "#e2e8f0", fontSize: 20, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <ScaleIcon size={24} /> Analyses d'Impact (AIPD)
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>
            Gérez vos analyses d'impact sur la protection des données — Article 35 RGPD
          </p>
        </div>
        <button onClick={startWizard} style={btnPrimary}>
          <PlusIcon size={14} /> Nouvelle analyse
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total analyses", value: analyses.length, color: ACCENT },
          { label: "Faible", value: analyses.filter((a) => a.riskLevel === "faible").length, color: "#22c55e" },
          { label: "Moyen", value: analyses.filter((a) => a.riskLevel === "moyen").length, color: "#f59e0b" },
          { label: "Élevé", value: analyses.filter((a) => a.riskLevel === "eleve").length, color: "#f97316" },
          { label: "Critique", value: analyses.filter((a) => a.riskLevel === "critique").length, color: "#ef4444" },
        ].map((st) => (
          <div key={st.label} style={{ ...card, padding: "12px 18px", textAlign: "center", minWidth: 90 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: st.color }}>{st.value}</div>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Cards */}
      {analyses.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px", background: "#1e2029",
          borderRadius: 12, border: "1px solid #2a2d3a",
        }}>
          <div style={{
            background: "rgba(6,182,212,0.08)", width: 56, height: 56, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <ScaleIcon size={24} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
            Aucune analyse d'impact
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Cliquez sur 'Nouvelle analyse' pour commencer.
          </div>
        </div>
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {analyses.map((a) => {
          const sc = sectorInfo(a.sector);
          const color = riskColor(a.riskLevel);
          return (
            <div key={a.id} onClick={() => openDetail(a.id)} style={{
              ...card, padding: "16px 20px", cursor: "pointer", transition: "border-color .15s",
              display: "flex", alignItems: "center", gap: 16,
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = ACCENT + "66"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2a2d3a"}
            >
              <div style={{ display: "flex", alignItems: "center" }}><SectorIcon type={a.sector} size={28} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{a.name}</span>
                  <span style={{
                    background: `${color}18`, color, fontSize: 10, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 12, border: `1px solid ${color}33`,
                  }}>
                    {riskLabel(a.riskLevel)}
                  </span>
                </div>
                <div style={{ color: "#64748b", fontSize: 12, marginBottom: 6 }}>
                  {a.company} — {sc.label} — {fmtDate(a.date)}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(a.dataTypes || []).slice(0, 5).map((dt) => (
                    <span key={dt} style={{
                      background: "#161820", border: "1px solid #2a2d3a", borderRadius: 4,
                      padding: "1px 8px", color: "#64748b", fontSize: 10,
                    }}>
                      {dt}
                    </span>
                  ))}
                  {(a.dataTypes || []).length > 5 && (
                    <span style={{ color: "#475569", fontSize: 10 }}>+{a.dataTypes.length - 5}</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color }}>{a.score}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>/100</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 8 }} onClick={(e) => e.stopPropagation()}>
                <button
                  title="Modifier"
                  onClick={() => openDetail(a.id)}
                  style={{
                    background: "transparent", border: "1px solid #2a2d3a", borderRadius: 6,
                    padding: "5px 7px", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center",
                    transition: "color .15s, border-color .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = ACCENT + "66"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#2a2d3a"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button
                  title="Supprimer"
                  onClick={() => deleteAnalysis(a.id)}
                  style={{
                    background: "transparent", border: "1px solid #2a2d3a", borderRadius: 6,
                    padding: "5px 7px", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center",
                    transition: "color .15s, border-color .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef444466"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#2a2d3a"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  WIZARD VIEW                                                        */
  /* ------------------------------------------------------------------ */

  const renderWizard = () => (
    <div>
      <button onClick={() => setView("list")} style={{ ...btnSecondary, marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", fontSize: 13 }}>
        <ChevronLeftIcon size={14} /> Annuler
      </button>

      <StepProgress current={step} />

      <div style={{ ...card, padding: 24, marginBottom: 16 }}>
        {wizardSteps[step]()}
      </div>

      {/* Navigation */}
      {step < 5 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
            style={{ ...btnSecondary, opacity: step === 0 ? 0.3 : 1 }}>
            Précédent
          </button>
          <button onClick={() => {
            // Auto-fill risks when entering step 3 (risks)
            if (step === 2) {
              const filled = autoFillRisks();
              setWiz(p => ({ ...p, risks: filled }));
            }
            setStep((s) => Math.min(5, s + 1));
          }} style={btnPrimary}>
            Suivant
          </button>
        </div>
      )}
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div>
      <SubNav color={ACCENT} items={VAULT_NAV} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 48px" }}>
        {view === "list" && renderList()}
        {view === "detail" && renderDetail()}
        {view === "wizard" && renderWizard()}
      </div>
    </div>
  );
}
