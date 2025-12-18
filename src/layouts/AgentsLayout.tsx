import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

/**
 * Dark Mode Layout pour les pages avec Sidebar
 * Utilisé pour: Dashboard, Agents, Voice Library, Integrations, Analytics, Settings
 */
const AgentsLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#0a0a1a]">
      {/* Dark Mode Sidebar */}
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
