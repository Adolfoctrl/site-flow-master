import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { AuthPage } from "@/components/auth/AuthPage";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Equipment from "./pages/Equipment";
import Machines from "./pages/Machines";
import RentalControl from "./pages/RentalControl";
import CheckIn from "./pages/CheckIn";
import EquipmentLoan from "./pages/EquipmentLoan";
import Safety from "./pages/Safety";
import Reports from "./pages/Reports";
import Visits from "./pages/Visits";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={() => window.location.reload()} />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="/rental-control" element={<RentalControl />} />
        <Route path="/check-in" element={<CheckIn />} />
        <Route path="/equipment-loan" element={<EquipmentLoan />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/visits" element={<Visits />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;