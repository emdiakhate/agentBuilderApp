import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';

/**
 * Dark Mode Layout avec Sidebar
 * Utilisé pour toutes les pages de l'application (Dashboard, Agents, etc.)
 */
const DarkLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#0a0a1a]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-[240px] transition-all duration-300">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DarkLayout;
