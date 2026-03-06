import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import Home from "@/pages/Home"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import VerifyEmail from "@/pages/VerifyEmail"
import Dashboard from "@/pages/Dashboard"
import Companies from "@/pages/Companies"
import CompanyView from "@/pages/CompanyView"
import DrillDown from "@/pages/DrillDown"
import PayloadViewer from "@/pages/PayloadViewer"
import Settings from "@/pages/Settings"
import Analytics from "@/pages/Analytics"
import SubscriptionManagement from "@/pages/SubscriptionManagement"
import SubscriptionCheckout from "@/pages/SubscriptionCheckout"
import SubscriptionInvoices from "@/pages/SubscriptionInvoices"
import NotFound from "@/pages/NotFound"

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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="company/:companyId" element={<CompanyView />} />
            <Route path="company/:companyId/drill-down" element={<DrillDown />} />
            <Route path="payload/:eventId" element={<PayloadViewer />} />
            <Route path="settings" element={<Settings />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="subscription-management" element={<SubscriptionManagement />} />
            <Route path="subscription-management/checkout" element={<SubscriptionCheckout />} />
            <Route path="subscription-management/invoices" element={<SubscriptionInvoices />} />
          </Route>
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}

export default App
