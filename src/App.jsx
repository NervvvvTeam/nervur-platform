import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NervurAurora from './NervurAurora'
import './index.css'

// ═══ Dashboard imports ═══
import { AuthProvider } from './dashboard/context/AuthContext'
import ProtectedRoute from './dashboard/components/ProtectedRoute'
import DashboardLayout from './dashboard/components/Layout'
import { SkeletonGrid, SkeletonText } from './dashboard/components/Skeleton'

// Lazy-loaded marketing pages
const ContactPage = lazy(() => import('./ContactPage'))
const SimulateurPage = lazy(() => import('./SimulateurPage'))
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
const BlogReputationPage = lazy(() => import('./BlogReputationPage'))
const BlogSecuritePage = lazy(() => import('./BlogSecuritePage'))
const BlogPerformancePage = lazy(() => import('./BlogPerformancePage'))

// Lazy-loaded dashboard pages
const DashLoginPage = lazy(() => import('./dashboard/pages/LoginPage'))
const DashPortalPage = lazy(() => import('./dashboard/pages/PortalPage'))
const DashDashboardPage = lazy(() => import('./dashboard/pages/DashboardPage'))
const DashReviewsPage = lazy(() => import('./dashboard/pages/ReviewsPage'))
const DashReviewDetailPage = lazy(() => import('./dashboard/pages/ReviewDetailPage'))
const DashSettingsPage = lazy(() => import('./dashboard/pages/SettingsPage'))
const DashOnboardingPage = lazy(() => import('./dashboard/pages/OnboardingPage'))
const DashPhantomPage = lazy(() => import('./dashboard/pages/PhantomDashboardPage'))
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
const DashPulseDashboardPage = lazy(() => import('./dashboard/pages/PulseDashboardPage'))
const DashPulseHistoryPage = lazy(() => import('./dashboard/pages/PulseHistoryPage'))
const DashPhantomHistoryPage = lazy(() => import('./dashboard/pages/PhantomHistoryPage'))
const DashPhantomRecommendationsPage = lazy(() => import('./dashboard/pages/PhantomRecommendationsPage'))
const DashAnalyticsPage = lazy(() => import('./dashboard/pages/AnalyticsPage'))
const DashCompetitorsPage = lazy(() => import('./dashboard/pages/CompetitorsPage'))
const DashReportsPage = lazy(() => import('./dashboard/pages/ReportsPage'))
const DashQRCodePage = lazy(() => import('./dashboard/pages/QRCodePage'))
const DashWidgetPage = lazy(() => import('./dashboard/pages/WidgetPage'))
const DashAlertsPage = lazy(() => import('./dashboard/pages/AlertsPage'))
const DashAtlasDashboardPage = lazy(() => import('./dashboard/pages/AtlasDashboardPage'))
const DashAtlasHistoryPage = lazy(() => import('./dashboard/pages/AtlasHistoryPage'))
const DashPhantomSchedulePage = lazy(() => import('./dashboard/pages/PhantomSchedulePage'))
const DashPhantomCompetitorsPage = lazy(() => import('./dashboard/pages/PhantomCompetitorsPage'))
const DashPulseAlertsPage = lazy(() => import('./dashboard/pages/PulseAlertsPage'))
const DashPulseStatusPage = lazy(() => import('./dashboard/pages/PulseStatusPage'))
const DashAtlasSuggestionsPage = lazy(() => import('./dashboard/pages/AtlasSuggestionsPage'))
const DashAtlasReportsPage = lazy(() => import('./dashboard/pages/AtlasReportsPage'))

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
            <Route path="/simulateur" element={<SimulateurPage />} />
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
            <Route path="/cgv" element={<CGVPage />} />
            <Route path="/qui-sommes-nous" element={<QuiSommesNousPage />} />
            <Route path="/blog/e-reputation" element={<BlogReputationPage />} />
            <Route path="/blog/cybersecurite" element={<BlogSecuritePage />} />
            <Route path="/blog/performance-web" element={<BlogPerformancePage />} />

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
                <Route path="phantom" element={<Suspense fallback={<DashboardLoader />}><DashPhantomPage /></Suspense>} />
                <Route path="phantom/history" element={<Suspense fallback={<DashboardLoader />}><DashPhantomHistoryPage /></Suspense>} />
                <Route path="phantom/recommendations" element={<Suspense fallback={<DashboardLoader />}><DashPhantomRecommendationsPage /></Suspense>} />
                <Route path="phantom/competitors" element={<Suspense fallback={<DashboardLoader />}><DashPhantomCompetitorsPage /></Suspense>} />
                <Route path="phantom/schedule" element={<Suspense fallback={<DashboardLoader />}><DashPhantomSchedulePage /></Suspense>} />
                <Route path="nexus" element={<Suspense fallback={<DashboardLoader />}><DashNexusPage /></Suspense>} />
                <Route path="nexus/sequences" element={<Suspense fallback={<DashboardLoader />}><DashNexusSequencePage /></Suspense>} />
                <Route path="nexus/calendar" element={<Suspense fallback={<DashboardLoader />}><DashNexusCalendarPage /></Suspense>} />
                <Route path="nexus/contacts" element={<Suspense fallback={<DashboardLoader />}><DashNexusContactsPage /></Suspense>} />
                <Route path="nexus/campaigns" element={<Suspense fallback={<DashboardLoader />}><DashNexusCampaignsPage /></Suspense>} />
                <Route path="forge" element={<Suspense fallback={<DashboardLoader />}><DashForgeDashboardPage /></Suspense>} />
                <Route path="forge/history" element={<Suspense fallback={<DashboardLoader />}><DashForgeHistoryPage /></Suspense>} />
                <Route path="pulse" element={<Suspense fallback={<DashboardLoader />}><DashPulseDashboardPage /></Suspense>} />
                <Route path="pulse/history" element={<Suspense fallback={<DashboardLoader />}><DashPulseHistoryPage /></Suspense>} />
                <Route path="pulse/alerts" element={<Suspense fallback={<DashboardLoader />}><DashPulseAlertsPage /></Suspense>} />
                <Route path="pulse/status" element={<Suspense fallback={<DashboardLoader />}><DashPulseStatusPage /></Suspense>} />
                <Route path="vault" element={<Suspense fallback={<DashboardLoader />}><DashVaultDashboardPage /></Suspense>} />
                <Route path="vault/history" element={<Suspense fallback={<DashboardLoader />}><DashVaultHistoryPage /></Suspense>} />
                <Route path="vault/scan/:id" element={<Suspense fallback={<DashboardLoader />}><DashVaultScanDetailPage /></Suspense>} />
                <Route path="vault/monitoring" element={<Suspense fallback={<DashboardLoader />}><DashVaultMonitoringPage /></Suspense>} />
                <Route path="vault/rgpd" element={<Suspense fallback={<DashboardLoader />}><DashVaultRgpdPage /></Suspense>} />
                <Route path="atlas" element={<Suspense fallback={<DashboardLoader />}><DashAtlasDashboardPage /></Suspense>} />
                <Route path="atlas/history" element={<Suspense fallback={<DashboardLoader />}><DashAtlasHistoryPage /></Suspense>} />
                <Route path="atlas/suggestions" element={<Suspense fallback={<DashboardLoader />}><DashAtlasSuggestionsPage /></Suspense>} />
                <Route path="atlas/reports" element={<Suspense fallback={<DashboardLoader />}><DashAtlasReportsPage /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<DashboardLoader />}><DashSettingsPage /></Suspense>} />
                <Route path="onboarding" element={<Suspense fallback={<DashboardLoader />}><DashOnboardingPage /></Suspense>} />
                <Route index element={<Navigate to="/app/portal" replace />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
