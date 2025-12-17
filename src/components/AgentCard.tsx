import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Settings, MoreVertical } from 'lucide-react';
import { AgentType } from '@/types/agent';
import { useAgentAvatar } from '@/hooks/useAgentAvatar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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

// Gradient combinations inspired by African textiles
const CARD_GRADIENTS = [
  'from-rose-900/40 via-pink-900/30 to-orange-900/40',
  'from-blue-900/40 via-indigo-900/30 to-cyan-900/40',
  'from-emerald-900/40 via-teal-900/30 to-green-900/40',
  'from-purple-900/40 via-violet-900/30 to-pink-900/40',
  'from-amber-900/40 via-orange-900/30 to-red-900/40',
  'from-cyan-900/40 via-blue-900/30 to-indigo-900/40',
  'from-green-900/40 via-emerald-900/30 to-teal-900/40',
  'from-pink-900/40 via-rose-900/30 to-purple-900/40',
];

export const AgentCard: React.FC<AgentCardProps> = ({ agent, index, onTest }) => {
  const navigate = useNavigate();
  const { avatarUrl } = useAgentAvatar(agent.name, { customUrl: agent.avatar });
  const [isHovered, setIsHovered] = useState(false);

  // Assign gradient based on index
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  const isActive = agent.status === 'active';

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
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className={`
          relative overflow-hidden cursor-pointer group
          h-[340px] w-full
          bg-gradient-to-br ${gradient}
          border border-white/10
          hover:border-white/20
          hover:shadow-xl hover:shadow-black/20
          transition-all duration-300
        `}
        onClick={handleCardClick}
      >
        {/* Active Badge */}
        {isActive && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-emerald-500/90 text-white border-0 shadow-lg">
              Actif
            </Badge>
          </div>
        )}

        {/* Menu Dropdown */}
        <div className="absolute top-4 left-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleConfigure}>
                Configurer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTest}>
                Tester
              </DropdownMenuItem>
              <DropdownMenuItem>Dupliquer</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Avatar - Centered */}
        <div className="flex flex-col items-center justify-center h-full px-6 pt-8 pb-4">
          <Avatar className="h-32 w-32 mb-4 border-4 border-white/20 shadow-2xl">
            <AvatarImage src={avatarUrl} alt={agent.name} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500">
              {agent.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Agent Info */}
          <div className="text-center space-y-2 flex-1">
            <h3 className="text-xl font-bold text-white truncate">
              {agent.name}
            </h3>
            <p className="text-sm text-white/70 truncate">
              {agent.type || 'Agent IA'}
            </p>

            {/* Stats - Optional */}
            {agent.totalCalls !== undefined && (
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/60">
                <span>{agent.totalCalls || 0} appels</span>
                {agent.averageRating && (
                  <span>⭐ {agent.averageRating.toFixed(1)}</span>
                )}
              </div>
            )}
          </div>

          {/* Hover Actions - Bottom Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2 mt-4 w-full"
          >
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={handleTest}
            >
              <Play className="h-4 w-4 mr-1" />
              Tester
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={handleConfigure}
            >
              <Settings className="h-4 w-4 mr-1" />
              Configurer
            </Button>
          </motion.div>
        </div>

        {/* Subtle pattern overlay (optional) */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>
      </Card>
    </motion.div>
  );
};
