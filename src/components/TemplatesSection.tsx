import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  gradient: string;
  category: string;
}

// Templates VAPI officiels
export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'customer-support-specialist',
    name: 'Customer Support Specialist',
    role: 'Agent de Support Client',
    description: 'Résolution de problèmes produits, réponses aux questions et expériences clients satisfaisantes avec connaissances techniques et empathie.',
    image: 'https://i.pravatar.cc/300?img=12',
    gradient: 'from-blue-900/50 to-cyan-900/30',
    category: 'Support'
  },
  {
    id: 'lead-qualification-specialist',
    name: 'Lead Qualification Specialist',
    role: 'Spécialiste Qualification de Leads',
    description: 'Identification de prospects qualifiés, compréhension des défis business et connexion avec les représentants commerciaux appropriés.',
    image: 'https://i.pravatar.cc/300?img=28',
    gradient: 'from-emerald-900/50 to-green-900/30',
    category: 'Sales'
  },
  {
    id: 'appointment-scheduler',
    name: 'Appointment Scheduler',
    role: 'Planificateur de Rendez-vous',
    description: 'Réservation, confirmation, reprogrammation ou annulation efficace de rendez-vous avec informations claires sur les services.',
    image: 'https://i.pravatar.cc/300?img=47',
    gradient: 'from-purple-900/50 to-indigo-900/30',
    category: 'Business'
  },
  {
    id: 'info-collector',
    name: 'Info Collector',
    role: 'Collecteur d\'Informations',
    description: 'Collecte méthodique d\'informations précises et complètes auprès des clients avec assurance qualité des données et conformité réglementaire.',
    image: 'https://i.pravatar.cc/300?img=15',
    gradient: 'from-amber-900/50 to-orange-900/30',
    category: 'Business'
  },
  {
    id: 'care-coordinator',
    name: 'Care Coordinator',
    role: 'Coordinateur de Soins',
    description: 'Planification de rendez-vous médicaux, réponses aux questions de santé et coordination des services patients avec conformité HIPAA.',
    image: 'https://i.pravatar.cc/300?img=44',
    gradient: 'from-rose-900/50 to-pink-900/30',
    category: 'Health'
  },
  {
    id: 'feedback-gatherer',
    name: 'Feedback Gatherer',
    role: 'Collecteur de Feedback',
    description: 'Enquêtes engageantes, collecte de feedback clients et recherche de marché avec taux de complétion élevés.',
    image: 'https://i.pravatar.cc/300?img=60',
    gradient: 'from-teal-900/50 to-cyan-900/30',
    category: 'Research'
  }
];

interface TemplateCardProps {
  template: AgentTemplate;
  index: number;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, index }) => {
  const navigate = useNavigate();

  const handleSelectTemplate = () => {
    // Navigate to create agent with template pre-filled
    navigate(`/agents/create?template=${template.id}`, {
      state: { template }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <Card
        onClick={handleSelectTemplate}
        className={`
          relative overflow-hidden cursor-pointer group
          h-[280px] w-full
          bg-gradient-to-br ${template.gradient}
          border border-white/10
          hover:border-white/30
          hover:shadow-2xl hover:shadow-black/40
          transition-all duration-300
          rounded-2xl
        `}
      >
        {/* Category Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-white/20 backdrop-blur text-white border-0 text-xs">
            {template.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="relative z-10 p-5 flex flex-col h-full">
          {/* Avatar Image - Large */}
          <div className="flex-1 flex items-center justify-center mb-3">
            <img
              src={template.image}
              alt={template.name}
              className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-white/20"
              onError={(e) => {
                // Fallback to gradient circle with initials
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* Fallback */}
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold opacity-0 [&:has(+img[style*='display: none'])]:opacity-100">
              {template.name.slice(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Info - Bottom */}
          <div className="space-y-1 text-center">
            <h3 className="text-white font-bold text-lg truncate">
              {template.name}
            </h3>
            <p className="text-white/80 text-sm font-medium truncate">
              {template.role}
            </p>
            <p className="text-white/60 text-xs line-clamp-2">
              {template.description}
            </p>
          </div>

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center space-y-2">
              <p className="text-white font-bold text-lg">
                Utiliser ce template
              </p>
              <p className="text-white/80 text-sm px-4">
                Créer un agent avec cette configuration
              </p>
            </div>
          </motion.div>
        </div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        </div>
      </Card>
    </motion.div>
  );
};

interface TemplatesSectionProps {
  className?: string;
}

export const TemplatesSection: React.FC<TemplatesSectionProps> = ({ className }) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Choisir un Template
          </h2>
          <p className="text-gray-400 text-sm">
            Démarrez rapidement avec un agent pré-configuré
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {AGENT_TEMPLATES.map((template, index) => (
          <TemplateCard key={template.id} template={template} index={index} />
        ))}
      </div>
    </div>
  );
};
