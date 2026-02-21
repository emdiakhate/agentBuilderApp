import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Phone, Rocket, Settings } from 'lucide-react';
import { AgentType } from '@/types/agent';
import { useAgentAvatar } from '@/hooks/useAgentAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AgentCardProps {
  agent: AgentType;
  index: number;
  onTest?: (agentId: string) => void;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'Customer Service': return 'Support Client';
    case 'Sales & Marketing': return 'Ventes';
    case 'Customer Onboarding': return 'Formation';
    case 'Technical Support': return 'Support Technique';
    case 'customer_support': return 'Support Client';
    case 'sales': return 'Ventes';
    case 'appointment_booking': return 'Prise de RDV';
    case 'lead_qualification': return 'Qualification';
    case 'information_provider': return 'Informations';
    default: return type || 'Général';
  }
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, index, onTest }) => {
  const navigate = useNavigate();
  const { avatarUrl } = useAgentAvatar(agent.name, { customUrl: agent.avatar, index });

  const isActive = agent.status === 'active';
  const totalCalls = agent.totalCalls || 0;

  const handleCardClick = () => {
    navigate(`/agents/${agent.id}`);
  };

  const handleTest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTest) {
      onTest(agent.id);
    } else {
      navigate(`/agents/${agent.id}?test=true`);
    }
  };

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/agents/${agent.id}`);
  };

  return (
    <Card
      className="relative overflow-hidden cursor-pointer group bg-white dark:bg-[#111c2e] border border-gray-200 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-500/30 hover:shadow-lg dark:hover:shadow-emerald-500/5 transition-all duration-300 rounded-2xl"
      onClick={handleCardClick}
    >
      {/* Header with gradient banner */}
      <div className="h-20 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10 relative">
        {/* Menu */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#1a2536] border-gray-200 dark:border-white/10">
              <DropdownMenuItem onClick={handleConfigure} className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                Configurer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTest} className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                Tester
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10">
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge className={isActive
            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs"
            : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30 text-xs"
          }>
            {isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </div>

      {/* Avatar overlapping the banner */}
      <div className="flex justify-center -mt-10 relative z-10">
        <img
          src={avatarUrl}
          alt={agent.name}
          className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-[#111c2e] shadow-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5 pt-3 text-center">
        <h3 className="text-gray-900 dark:text-white font-semibold text-lg truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {agent.name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {getTypeLabel(agent.type)}
        </p>

        {agent.description && (
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 line-clamp-2">
            {agent.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-6 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Phone className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{totalCalls}</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Appels</p>
          </div>
          <div className="text-center">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{agent.averageRating || 0}/5</span>
            <p className="text-xs text-gray-400 dark:text-gray-500">Note</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
            onClick={handleTest}
          >
            <Rocket className="mr-1.5 h-3 w-3" />
            Tester
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-xs"
            onClick={handleConfigure}
          >
            <Settings className="mr-1.5 h-3 w-3" />
            Configurer
          </Button>
        </div>
      </div>
    </Card>
  );
};
