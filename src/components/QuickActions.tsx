import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart3, Mic2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Créer un agent',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => navigate('/agents/create'),
      color: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
    },
    {
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      onClick: () => navigate('/analytics'),
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    },
    {
      label: 'Bibliothèque de voix',
      icon: <Mic2 className="h-4 w-4" />,
      onClick: () => navigate('/voice-library'),
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    },
    {
      label: 'Templates',
      icon: <FileText className="h-4 w-4" />,
      onClick: () => navigate('/templates'),
      color: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {actions.map((action) => (
        <Button
          key={action.label}
          onClick={action.onClick}
          className={`${action.color} text-white border-0 shadow-md`}
          size="sm"
        >
          {action.icon}
          <span className="ml-2">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};
