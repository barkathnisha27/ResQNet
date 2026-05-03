import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/authContext";
import Login from "./pages/Login";
import PublicDashboard from "./pages/PublicDashboard";
import NGODashboard from "./pages/NGODashboard";
import NgoSimulationPage from "./pages/NgoSimulationPage";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import GovPredictionPage from "./pages/GovPredictionPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(user!.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginRedirect />} />
            <Route path="/citizen" element={<ProtectedRoute allowedRoles={["citizen"]}><PublicDashboard /></ProtectedRoute>} />
            <Route path="/ngo" element={<ProtectedRoute allowedRoles={["ngo"]}><NGODashboard /></ProtectedRoute>} />
            <Route path="/ngo/simulation" element={<ProtectedRoute allowedRoles={["ngo"]}><NgoSimulationPage /></ProtectedRoute>} />
            <Route path="/command" element={<ProtectedRoute allowedRoles={["government"]}><GovernmentDashboard /></ProtectedRoute>} />
            <Route path="/ai-prediction" element={<ProtectedRoute allowedRoles={["government"]}><GovPredictionPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

function LoginRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    const routes = { citizen: "/citizen", ngo: "/ngo", government: "/command" };
    return <Navigate to={routes[user.role]} replace />;
  }
  return <Login />;
}

export default App;
