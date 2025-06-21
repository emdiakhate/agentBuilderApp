
import { Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

const AgentsLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/59ba1e10-7cc7-47ce-88b0-9e7ac1048277.png" 
            alt="Logo Ynnovia" 
            className="h-10 w-auto"
          />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <TooltipProvider>
          <div className="h-full overflow-y-auto p-6 animate-fade-in">
            <Outlet />
          </div>
        </TooltipProvider>
      </main>
    </div>
  );
};

export default AgentsLayout;
