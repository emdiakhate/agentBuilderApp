import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Bot,
  Mic,
  Link,
  BarChart3,
  Settings,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Accueil', icon: <Home size={20} />, path: '/' },
  { label: 'Mes Agents', icon: <Bot size={20} />, path: '/agents' },
  { label: 'Conversations', icon: <MessageSquare size={20} />, path: '/conversations' },
  { label: 'Bibliothèque de Voix', icon: <Mic size={20} />, path: '/voice-library' },
  { label: 'Intégrations', icon: <Link size={20} />, path: '/integrations' },
  { label: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
  { label: 'Paramètres', icon: <Settings size={20} />, path: '/settings' },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get user info (from localStorage or context)
  const userName = localStorage.getItem('user_name') || 'Malik';
  const userEmail = localStorage.getItem('user_email') || 'malik@example.com';
  const userPlan = localStorage.getItem('user_plan') || 'Starter';

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1a1a2e] text-white">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">AgentBuilder</h1>
                <p className="text-xs text-gray-400">AI Voice Agents</p>
              </div>
            </motion.div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                'hover:bg-white/5',
                isActive && 'bg-white/10 border-l-4 border-purple-500',
                !isActive && 'border-l-4 border-transparent'
              )}
            >
              <span className={cn(
                'flex-shrink-0',
                isActive ? 'text-purple-400' : 'text-gray-400'
              )}>
                {item.icon}
              </span>

              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'text-sm font-medium',
                    isActive ? 'text-white' : 'text-gray-300'
                  )}
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://i.pravatar.cc/100?u=${userName}`} />
              <AvatarFallback className="bg-purple-500">
                {userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">
              {userPlan}
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://i.pravatar.cc/100?u=${userName}`} />
              <AvatarFallback className="bg-purple-500">
                {userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1a2e] text-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 240 }}
        className={cn(
          'hidden lg:block fixed left-0 top-0 h-screen z-40 transition-all duration-300',
          className
        )}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-[240px] z-50"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
