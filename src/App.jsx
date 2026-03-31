import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NervurAurora from './NervurAurora'
import CookieBanner from './components/CookieBanner'
import './index.css'

// ═══ Dashboard imports ═══
import { AuthProvider } from './dashboard/context/AuthContext'
import ProtectedRoute from './dashboard/components/ProtectedRoute'
import DashboardLayout from './dashboard/components/Layout'
import { SkeletonGrid, SkeletonText } from './dashboard/components/Skeleton'

// Lazy-loaded marketing pages
const ContactPage = lazy(() => import('./ContactPage'))
const DiagnosticPage = lazy(() => import('./DiagnosticPage'))
const SentinelPage = lazy(() => import('./SentinelPage'))
const TechnologiesPage = lazy(() => import('./TechnologiesPage'))
const PhantomPage = lazy(() => import('./PhantomPage'))
const VitrinePage = lazy(() => import('./VitrinePage'))
const NexusPage = lazy(() => import('./NexusPage'))
const ForgePage = lazy(() => import('./ForgePage'))
const OraclePage = lazy(() => import('./OraclePage'))
const MentionsLegalesPage = lazy(() => import('./MentionsLegalesPage'))
const PolitiqueConfidentialitePage = lazy(() => import('./PolitiqueConfidentialitePage'))
const CGVPage = lazy(() => import('./CGVPage'))
const QuiSommesNousPage = lazy(() => import('./QuiSommesNousPage'))
const BlogPage = lazy(() => import('./BlogPage'))
const BlogReputationPage = lazy(() => import('./BlogReputationPage'))
const BlogSecuritePage = lazy(() => import('./BlogSecuritePage'))
const BlogPerformancePage = lazy(() => import('./BlogPerformancePage'))
const BlogAvisGooglePage = lazy(() => import('./BlogAvisGooglePage'))
const BlogRgpdPage = lazy(() => import('./BlogRgpdPage'))

// Lazy-loaded dashboard pages
const DashLoginPage = lazy(() => import('./dashboard/pages/LoginPage'))
const DashPortalPage = lazy(() => import('./dashboard/pages/PortalPage'))
const DashDashboardPage = lazy(() => import('./dashboard/pages/DashboardPage'))
const DashReviewsPage = lazy(() => import('./dashboard/pages/ReviewsPage'))
const DashReviewDetailPage = lazy(() => import('./dashboard/pages/ReviewDetailPage'))
const DashSettingsPage = lazy(() => import('./dashboard/pages/SettingsPage'))
const DashOnboardingPage = lazy(() => import('./dashboard/pages/OnboardingPage'))
const DashNexusPage = lazy(() => import('./dashboard/pages/NexusDashboardPage'))
const DashNexusSequencePage = lazy(() => import('./dashboard/pages/NexusSequencePage'))
const DashNexusCalendarPage = lazy(() => import('./dashboard/pages/NexusCalendarPage'))
const DashNexusContactsPage = lazy(() => import('./dashboard/pages/NexusContactsPage'))
const DashNexusCampaignsPage = lazy(() => import('./dashboard/pages/NexusCampaignsPage'))
const DashForgeDashboardPage = lazy(() => import('./dashboard/pages/ForgeDashboardPage'))
const DashForgeHistoryPage = lazy(() => import('./dashboard/pages/ForgeHistoryPage'))
const DashVaultDashboardPage = lazy(() => import('./dashboard/pages/VaultDashboardPage'))
const DashVaultHistoryPage = lazy(() => import('./dashboard/pages/VaultHistoryPage'))
const DashVaultScanDetailPage = lazy(() => import('./dashboard/pages/VaultScanDetailPage'))
const DashVaultMonitoringPage = lazy(() => import('./dashboard/pages/VaultMonitoringPage'))
const DashVaultRgpdPage = lazy(() => import('./dashboard/pages/VaultRgpdPage'))
const DashVaultGenerateurPage = lazy(() => import('./dashboard/pages/VaultGenerateurPage'))
const DashVaultRegistrePage = lazy(() => import('./dashboard/pages/VaultRegistrePage'))
const DashVaultAipdPage = lazy(() => import('./dashboard/pages/VaultAipdPage'))
const DashVaultActionsPage = lazy(() => import('./dashboard/pages/VaultActionsPage'))

// Checklist and Badge pages removed from routing (files kept)
const DashVaultVeillePage = lazy(() => import('./dashboard/pages/VaultVeillePage'))
const DashVaultHistoriquePage = lazy(() => import('./dashboard/pages/VaultHistoriquePage'))
const DashVaultAlertsPage = lazy(() => import('./dashboard/pages/VaultAlertsPage'))
const DashVaultDsarPage = lazy(() => import('./dashboard/pages/VaultDsarPage'))
const DashVaultTimelinePage = lazy(() => import('./dashboard/pages/VaultTimelinePage'))
const DashAnalyticsPage = lazy(() => import('./dashboard/pages/AnalyticsPage'))
const DashCompetitorsPage = lazy(() => import('./dashboard/pages/CompetitorsPage'))
const DashReportsPage = lazy(() => import('./dashboard/pages/ReportsPage'))
const DashQRCodePage = lazy(() => import('./dashboard/pages/QRCodePage'))
const DashWidgetPage = lazy(() => import('./dashboard/pages/WidgetPage'))
const DashAlertsPage = lazy(() => import('./dashboard/pages/AlertsPage'))

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const Loader = () => (
  <div style={{ background: "#09090B", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: "32px", height: "32px", border: "2px solid rgba(129,140,248,0.2)", borderTop: "2px solid #818CF8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

const DashboardLoader = () => (
  <div style={{ background: "#09090B", minHeight: "100vh", padding: "32px" }}>
    <SkeletonText width="200px" height="24px" />
    <div style={{ marginTop: "24px" }}><SkeletonGrid count={4} height="140px" /></div>
    <div style={{ marginTop: "24px" }}><SkeletonGrid count={2} height="240px" /></div>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* ═══ Marketing site ═══ */}
            <Route path="/" element={<NervurAurora />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/diagnostic" element={<DiagnosticPage />} />
            <Route path="/sentinel" element={<SentinelPage />} />
            <Route path="/technologies" element={<TechnologiesPage />} />
            <Route path="/signal" element={<Navigate to="/sentinel" replace />} />
            <Route path="/phantom" element={<PhantomPage />} />
            <Route path="/vitrine" element={<VitrinePage />} />
            <Route path="/nexus" element={<NexusPage />} />
            <Route path="/forge" element={<ForgePage />} />
            <Route path="/oracle" element={<OraclePage />} />
            <Route path="/atlas" element={<Navigate to="/technologies" replace />} />
            <Route path="/flux" element={<Navigate to="/nexus" replace />} />
            <Route path="/echo" element={<Navigate to="/nexus" replace />} />
            <Route path="/vertex" element={<Navigate to="/oracle" replace />} />
            <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
            <Route path="/confidentialite" element={<PolitiqueConfidentialitePage />} />
            <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialitePage />} />
            <Route path="/cgv" element={<CGVPage />} />
            <Route path="/qui-sommes-nous" element={<QuiSommesNousPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/e-reputation" element={<BlogReputationPage />} />
            <Route path="/blog/conformite-juridique" element={<BlogSecuritePage />} />
            <Route path="/blog/cybersecurite" element={<Navigate to="/blog/conformite-juridique" replace />} />
            <Route path="/blog/presence-digitale" element={<BlogPerformancePage />} />
            <Route path="/blog/performance-web" element={<Navigate to="/blog/presence-digitale" replace />} />
            <Route path="/blog/avis-google" element={<BlogAvisGooglePage />} />
            <Route path="/blog/rgpd-guide" element={<BlogRgpdPage />} />

            {/* ═══ Espace Client (Dashboard) ═══ */}
            <Route path="/app/login" element={<Suspense fallback={<DashboardLoader />}><DashLoginPage /></Suspense>} />
            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="portal" element={<Suspense fallback={<DashboardLoader />}><DashPortalPage /></Suspense>} />
                <Route path="sentinel" element={<Suspense fallback={<DashboardLoader />}><DashDashboardPage /></Suspense>} />
                <Route path="reviews" element={<Suspense fallback={<DashboardLoader />}><DashReviewsPage /></Suspense>} />
                <Route path="reviews/:businessId/:reviewId" element={<Suspense fallback={<DashboardLoader />}><DashReviewDetailPage /></Suspense>} />
                <Route path="analytics" element={<Suspense fallback={<DashboardLoader />}><DashAnalyticsPage /></Suspense>} />
                <Route path="competitors" element={<Suspense fallback={<DashboardLoader />}><DashCompetitorsPage /></Suspense>} />
                <Route path="reports" element={<Suspense fallback={<DashboardLoader />}><DashReportsPage /></Suspense>} />
                <Route path="qrcode" element={<Suspense fallback={<DashboardLoader />}><DashQRCodePage /></Suspense>} />
                <Route path="widget" element={<Suspense fallback={<DashboardLoader />}><DashWidgetPage /></Suspense>} />
                <Route path="alerts" element={<Suspense fallback={<DashboardLoader />}><DashAlertsPage /></Suspense>} />
                <Route path="nexus" element={<Suspense fallback={<DashboardLoader />}><DashNexusPage /></Suspense>} />
                <Route path="nexus/sequences" element={<Suspense fallback={<DashboardLoader />}><DashNexusSequencePage /></Suspense>} />
                <Route path="nexus/calendar" element={<Suspense fallback={<DashboardLoader />}><DashNexusCalendarPage /></Suspense>} />
                <Route path="nexus/contacts" element={<Suspense fallback={<DashboardLoader />}><DashNexusContactsPage /></Suspense>} />
                <Route path="nexus/campaigns" element={<Suspense fallback={<DashboardLoader />}><DashNexusCampaignsPage /></Suspense>} />
                <Route path="forge" element={<Suspense fallback={<DashboardLoader />}><DashForgeDashboardPage /></Suspense>} />
                <Route path="forge/history" element={<Suspense fallback={<DashboardLoader />}><DashForgeHistoryPage /></Suspense>} />
                <Route path="vault" element={<Suspense fallback={<DashboardLoader />}><DashVaultDashboardPage /></Suspense>} />
                <Route path="vault/history" element={<Suspense fallback={<DashboardLoader />}><DashVaultHistoryPage /></Suspense>} />
                <Route path="vault/scan/:id" element={<Suspense fallback={<DashboardLoader />}><DashVaultScanDetailPage /></Suspense>} />
                <Route path="vault/monitoring" element={<Suspense fallback={<DashboardLoader />}><DashVaultMonitoringPage /></Suspense>} />
                <Route path="vault/rgpd" element={<Suspense fallback={<DashboardLoader />}><DashVaultRgpdPage /></Suspense>} />
                <Route path="vault/generateur" element={<Suspense fallback={<DashboardLoader />}><DashVaultGenerateurPage /></Suspense>} />
                <Route path="vault/registre" element={<Suspense fallback={<DashboardLoader />}><DashVaultRegistrePage /></Suspense>} />
                <Route path="vault/aipd" element={<Suspense fallback={<DashboardLoader />}><DashVaultAipdPage /></Suspense>} />
                <Route path="vault/actions" element={<Suspense fallback={<DashboardLoader />}><DashVaultActionsPage /></Suspense>} />

                <Route path="vault/veille" element={<Suspense fallback={<DashboardLoader />}><DashVaultVeillePage /></Suspense>} />
                <Route path="vault/alertes" element={<Suspense fallback={<DashboardLoader />}><DashVaultAlertsPage /></Suspense>} />
                <Route path="vault/droits" element={<Suspense fallback={<DashboardLoader />}><DashVaultDsarPage /></Suspense>} />
                <Route path="vault/timeline" element={<Suspense fallback={<DashboardLoader />}><DashVaultTimelinePage /></Suspense>} />
                <Route path="vault/historique" element={<Suspense fallback={<DashboardLoader />}><DashVaultHistoriquePage /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<DashboardLoader />}><DashSettingsPage /></Suspense>} />
                <Route path="onboarding" element={<Suspense fallback={<DashboardLoader />}><DashOnboardingPage /></Suspense>} />
                <Route index element={<Navigate to="/app/portal" replace />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
        <CookieBanner />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
