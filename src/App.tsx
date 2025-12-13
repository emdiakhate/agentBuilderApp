
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import AgentsLayout from "./layouts/AgentsLayout";
import Dashboard from "./pages/Dashboard";
import AgentsDashboard from "./pages/AgentsDashboard";
import AgentDetails from "./pages/AgentDetails";
import AgentCreate from "./pages/AgentCreate";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry if we get a 404 for new123 agent
        if (error?.message?.includes("Agent with id new123 not found")) {
          return false;
        }
        return failureCount < 3;
      }
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AgentsLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/agents" element={<AgentsDashboard />} />
              <Route path="/agents/create" element={<AgentCreate />} />
              <Route path="/agents/:agentId" element={<AgentDetails />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
