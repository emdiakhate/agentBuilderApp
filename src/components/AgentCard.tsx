import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
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

// Dark mode gradient combinations inspired by image 2
const CARD_GRADIENTS = [
  'from-rose-900/50 to-pink-900/30',
  'from-blue-900/50 to-indigo-900/30',
  'from-teal-900/50 to-cyan-900/30',
  'from-purple-900/50 to-violet-900/30',
  'from-emerald-900/50 to-green-900/30',
  'from-amber-900/50 to-orange-900/30',
  'from-fuchsia-900/50 to-pink-900/30',
  'from-indigo-900/50 to-blue-900/30',
];

export const AgentCard: React.FC<AgentCardProps> = ({ agent, index, onTest }) => {
  const navigate = useNavigate();
  const { avatarUrl } = useAgentAvatar(agent.name, { customUrl: agent.avatar, index });

  // Assign gradient based on index
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

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
      navigate(`/agents/${agent.id}?tab=test`);
    }
  };

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/agents/${agent.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <Card
        className={`
          relative overflow-hidden cursor-pointer group
          h-[380px] w-full
          bg-gradient-to-br ${gradient}
          border border-white/10
          hover:border-white/20
          hover:shadow-2xl hover:shadow-black/30
          transition-all duration-300
          rounded-3xl
        `}
        onClick={handleCardClick}
      >
        {/* Menu Dropdown - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white/50 hover:text-white"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-[#1a1a2e] border-white/10">
              <DropdownMenuItem onClick={handleConfigure} className="text-white hover:bg-white/10">
                Configurer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTest} className="text-white hover:bg-white/10">
                Tester
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-white/10">
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400 hover:bg-white/10">
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Badge - Top Right */}
        {isActive && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-emerald-500 text-white border-0 shadow-lg text-xs px-2 py-1">
              Actif
            </Badge>
          </div>
        )}

        {/* Content Container */}
        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Header Info - Top */}
          <div className="space-y-1 mb-4">
            <h3 className="text-white font-bold text-xl truncate">
              {agent.name}
            </h3>
            <p className="text-white/70 text-sm truncate">
              {agent.type || 'Directrice opérationnelle'}
            </p>
            <p className="text-white/50 text-xs">
              {totalCalls} appels
            </p>
          </div>

          {/* Large Avatar - Center */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={agent.name}
                className="w-48 h-48 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                onError={(e) => {
                  // Fallback to initials if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Fallback initials */}
              <div className="absolute inset-0 w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold opacity-0 [&:has(+img[style*='display: none'])]:opacity-100">
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Subtle overlay pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        </div>
      </Card>
    </motion.div>
  );
};
