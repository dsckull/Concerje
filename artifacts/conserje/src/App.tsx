import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { AppLayout } from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import MoradoresPage from "@/pages/MoradoresPage";
import ImportarPage from "@/pages/ImportarPage";
import EncomendasPage from "@/pages/EncomendasPage";
import VisitantesPage from "@/pages/VisitantesPage";
import OcorrenciasPage from "@/pages/OcorrenciasPage";
import FinanceiroPage from "@/pages/FinanceiroPage";
import AssembleiasPage from "@/pages/AssembleiasPage";
import ReservasPage from "@/pages/ReservasPage";
import JuridicoPage from "@/pages/JuridicoPage";
import DefComPage from "@/pages/DefComPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/moradores" component={MoradoresPage} />
          <Route path="/importar" component={ImportarPage} />
          <Route path="/encomendas" component={EncomendasPage} />
          <Route path="/visitantes" component={VisitantesPage} />
          <Route path="/ocorrencias" component={OcorrenciasPage} />
          <Route path="/financeiro" component={FinanceiroPage} />
          <Route path="/assembleias" component={AssembleiasPage} />
          <Route path="/reservas" component={ReservasPage} />
          <Route path="/juridico" component={JuridicoPage} />
          <Route path="/defcom" component={DefComPage} />
          <Route component={NotFound} />
        </Switch>
      </ErrorBoundary>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
