import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

/**
 * Layout pour les pages avec Sidebar - supporte dark et light mode
 * Utilisé pour: Dashboard, Agents, Voice Library, Integrations, Analytics, Settings
 */
const AgentsLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0f1923] transition-colors duration-300">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[240px] transition-all duration-300">
        <div className="p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AgentsLayout;
