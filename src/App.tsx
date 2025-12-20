import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import DashboardNew from "./pages/DashboardNew";
import DashboardStats from "./pages/DashboardStats";
import AiPhotographer from "./pages/AiPhotographer";
import InteriorDesign from "./pages/InteriorDesign";
import ExteriorDesign from "./pages/ExteriorDesign";
import FoodEnhancement from "./pages/FoodEnhancement";
import ComingSoon from "./pages/ComingSoon";
import Admin from "./pages/Admin";
import ManageUsers from "./pages/ManageUsers";
import Settings from "./pages/Settings";
import ApiKeys from "./pages/ApiKeys";
import ApiDocumentationPage from "./pages/ApiDocumentation";
import TopUp from "./pages/TopUp";
import PaymentHistory from "./pages/PaymentHistory";
import PricingNew from "./pages/PricingNew";
import MyPayments from "./pages/MyPayments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/stats" element={<DashboardStats />} />
            <Route path="/dashboard" element={<DashboardNew />} />
            <Route path="/dashboard-old" element={<Dashboard />} />
            <Route path="/ai-photographer" element={<AiPhotographer />} />
            <Route path="/interior-design" element={<InteriorDesign />} />
            <Route path="/exterior-design" element={<ExteriorDesign />} />
            <Route path="/food-enhancement" element={<FoodEnhancement />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="/api-documentation" element={<ApiDocumentationPage />} />
            <Route path="/top-up" element={<TopUp />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/pricing" element={<PricingNew />} />
            <Route path="/my-payments" element={<MyPayments />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
