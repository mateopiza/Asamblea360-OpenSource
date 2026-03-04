import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Copropiedades from "./pages/Copropiedades";
import Unidades from "./pages/Unidades";
import Asambleas from "./pages/Asambleas";
import Participantes from "./pages/Participantes";
import Acreditacion from "./pages/Acreditacion";
import Preguntas from "./pages/Preguntas";
import Soporte from "./pages/Soporte";
import Conversaciones from "./pages/Conversaciones";
import Delegaciones from "./pages/Delegaciones";
import ResultadosPublicos from "./pages/ResultadosPublicos";
import Usuarios from "./pages/Usuarios";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  // Redirect to onboarding if profile incomplete
  if (profile && !(profile as any).onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/copropiedades" element={<ProtectedRoute><Copropiedades /></ProtectedRoute>} />
            <Route path="/unidades" element={<ProtectedRoute><Unidades /></ProtectedRoute>} />
            <Route path="/asambleas" element={<ProtectedRoute><Asambleas /></ProtectedRoute>} />
            <Route path="/participantes" element={<ProtectedRoute><Participantes /></ProtectedRoute>} />
            <Route path="/acreditacion" element={<ProtectedRoute><Acreditacion /></ProtectedRoute>} />
            <Route path="/preguntas" element={<ProtectedRoute><Preguntas /></ProtectedRoute>} />
            <Route path="/soporte" element={<ProtectedRoute><Soporte /></ProtectedRoute>} />
            <Route path="/conversaciones" element={<ProtectedRoute><Conversaciones /></ProtectedRoute>} />
            <Route path="/delegaciones" element={<ProtectedRoute><Delegaciones /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
            <Route path="/resultados/:asambleaId" element={<ResultadosPublicos />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
