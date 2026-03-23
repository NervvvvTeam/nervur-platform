import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NervurAurora from './NervurAurora'
import './index.css'

// ═══ Dashboard imports ═══
import { AuthProvider } from './dashboard/context/AuthContext'
import ProtectedRoute from './dashboard/components/ProtectedRoute'
import DashboardLayout from './dashboard/components/Layout'

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
const DashPhantomHistoryPage = lazy(() => import('./dashboard/pages/PhantomHistoryPage'))
const DashPhantomRecommendationsPage = lazy(() => import('./dashboard/pages/PhantomRecommendationsPage'))
const DashAnalyticsPage = lazy(() => import('./dashboard/pages/AnalyticsPage'))
const DashCompetitorsPage = lazy(() => import('./dashboard/pages/CompetitorsPage'))
const DashReportsPage = lazy(() => import('./dashboard/pages/ReportsPage'))
const DashQRCodePage = lazy(() => import('./dashboard/pages/QRCodePage'))
const DashWidgetPage = lazy(() => import('./dashboard/pages/WidgetPage'))
const DashAlertsPage = lazy(() => import('./dashboard/pages/AlertsPage'))

const Loader = () => (
  <div style={{ background: "#09090B", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: "32px", height: "32px", border: "2px solid rgba(129,140,248,0.2)", borderTop: "2px solid #818CF8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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

            {/* ═══ Espace Client (Dashboard) ═══ */}
            <Route path="/app/login" element={<DashLoginPage />} />
            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="portal" element={<DashPortalPage />} />
                <Route path="sentinel" element={<DashDashboardPage />} />
                <Route path="reviews" element={<DashReviewsPage />} />
                <Route path="reviews/:businessId/:reviewId" element={<DashReviewDetailPage />} />
                <Route path="analytics" element={<DashAnalyticsPage />} />
                <Route path="competitors" element={<DashCompetitorsPage />} />
                <Route path="reports" element={<DashReportsPage />} />
                <Route path="qrcode" element={<DashQRCodePage />} />
                <Route path="widget" element={<DashWidgetPage />} />
                <Route path="alerts" element={<DashAlertsPage />} />
                <Route path="phantom" element={<DashPhantomPage />} />
                <Route path="phantom/history" element={<DashPhantomHistoryPage />} />
                <Route path="phantom/recommendations" element={<DashPhantomRecommendationsPage />} />
                <Route path="nexus" element={<DashNexusPage />} />
                <Route path="nexus/sequences" element={<DashNexusSequencePage />} />
                <Route path="nexus/calendar" element={<DashNexusCalendarPage />} />
                <Route path="nexus/contacts" element={<DashNexusContactsPage />} />
                <Route path="nexus/campaigns" element={<DashNexusCampaignsPage />} />
                <Route path="forge" element={<DashForgeDashboardPage />} />
                <Route path="forge/history" element={<DashForgeHistoryPage />} />
                <Route path="vault" element={<DashVaultDashboardPage />} />
                <Route path="vault/history" element={<DashVaultHistoryPage />} />
                <Route path="vault/scan/:id" element={<DashVaultScanDetailPage />} />
                <Route path="vault/monitoring" element={<DashVaultMonitoringPage />} />
                <Route path="settings" element={<DashSettingsPage />} />
                <Route path="onboarding" element={<DashOnboardingPage />} />
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
