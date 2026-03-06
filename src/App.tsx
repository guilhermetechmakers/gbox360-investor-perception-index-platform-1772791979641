import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ModalProvider } from "@/components/modals"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"
import Home from "@/pages/Home"
import UnifiedAuthPage from "@/pages/UnifiedAuthPage"
import ForgotPasswordPage from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"
import VerifyEmail from "@/pages/VerifyEmail"
import Dashboard from "@/pages/Dashboard"
import Companies from "@/pages/Companies"
import CompanyView from "@/pages/CompanyView"
import DrillDown from "@/pages/DrillDown"
import PayloadViewer from "@/pages/PayloadViewer"
import Settings from "@/pages/Settings"
import UserProfile from "@/pages/UserProfile"
import Analytics from "@/pages/Analytics"
import SubscriptionManagement from "@/pages/SubscriptionManagement"
import SubscriptionCheckout from "@/pages/SubscriptionCheckout"
import TransactionHistory from "@/pages/TransactionHistory"
import AdminDashboard from "@/pages/AdminDashboard"
import AdminAuditLogs from "@/pages/AdminAuditLogs"
import AdminDataReplay from "@/pages/AdminDataReplay"
import AdminDrilldown from "@/pages/AdminDrilldown"
import AdminUserManagement from "@/pages/AdminUserManagement"
import NotFound from "@/pages/NotFound"
import ServerError500 from "@/pages/ServerError500"
import AboutHelp from "@/pages/AboutHelp"
import PrivacyPolicy from "@/pages/PrivacyPolicy"
import TermsOfService from "@/pages/TermsOfService"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <ModalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-help" element={<AboutHelp />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/legal/terms" element={<Navigate to="/terms" replace />} />
          <Route path="/auth" element={<UnifiedAuthPage />} />
          <Route path="/login" element={<Navigate to="/auth?tab=login" replace />} />
          <Route path="/signup" element={<Navigate to="/auth?tab=signup" replace />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="company/:companyId" element={<CompanyView />} />
            <Route path="company/:companyId/ipi" element={<CompanyView />} />
            <Route path="company/:companyId/drill-down" element={<DrillDown />} />
            <Route path="company/:companyId/ipi/drilldown" element={<DrillDown />} />
            <Route path="payload/:eventId" element={<PayloadViewer />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="subscription-management" element={<SubscriptionManagement />} />
            <Route path="subscription-management/checkout" element={<SubscriptionCheckout />} />
            <Route path="subscription-management/invoices" element={<TransactionHistory />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="data-replay" element={<AdminDataReplay />} />
            <Route path="drilldown/:eventId" element={<AdminDrilldown />} />
            <Route path="user-management" element={<AdminUserManagement />} />
          </Route>
          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/500" element={<ServerError500 />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
      </ModalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
