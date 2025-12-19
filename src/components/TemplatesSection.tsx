import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { fetchTemplates, fetchTemplateDetail, TemplateDetail } from '@/services/templateService';
import { useToast } from '@/components/ui/use-toast';

// Use the same interface from templateService
export type { TemplateDetail as AgentTemplate } from '@/services/templateService';

interface TemplateCardProps {
  template: TemplateDetail;
  index: number;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, index }) => {
  const navigate = useNavigate();

  // Placeholder images (can be updated later with real template images)
  const imageMap: Record<string, string> = {
    'customer_support': 'https://i.pravatar.cc/300?img=12',
    'lead_qualification': 'https://i.pravatar.cc/300?img=28',
    'appointment_scheduler': 'https://i.pravatar.cc/300?img=47',
    'info_collector': 'https://i.pravatar.cc/300?img=15',
    'feedback_gatherer': 'https://i.pravatar.cc/300?img=60',
    'sales_agent': 'https://i.pravatar.cc/300?img=35',
  };

  const gradientMap: Record<string, string> = {
    'support': 'from-blue-900/50 to-cyan-900/30',
    'sales': 'from-emerald-900/50 to-green-900/30',
    'scheduling': 'from-purple-900/50 to-indigo-900/30',
    'data': 'from-amber-900/50 to-orange-900/30',
    'research': 'from-teal-900/50 to-cyan-900/30',
  };

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
          bg-white/5 border-white/10
          hover:bg-white/10 hover:border-white/20
          transition-all duration-300
        `}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientMap[template.category] || 'from-gray-900/50 to-gray-800/30'} opacity-50`} />

        <div className="relative p-6 space-y-4">
          {/* Image & Badge */}
          <div className="flex items-start justify-between">
            <img
              src={imageMap[template.id] || 'https://i.pravatar.cc/300?img=1'}
              alt={template.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
            />
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 capitalize">
              {template.category}
            </Badge>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">
              {template.name}
            </h3>
            <p className="text-sm text-gray-300 line-clamp-3">
              {template.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs text-gray-400">
              {template.config.model}
            </span>
            <span className="text-xs text-purple-400 group-hover:text-purple-300">
              Utiliser ce template →
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const TemplatesSection: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);

      // Fetch basic templates list
      const basicTemplates = await fetchTemplates();

      // Fetch detailed config for each template
      const detailedTemplates = await Promise.all(
        basicTemplates.map(async (t) => {
          try {
            return await fetchTemplateDetail(t.id);
          } catch (error) {
            console.error(`Error loading template ${t.id}:`, error);
            // Return basic template if detail fetch fails
            return {
              ...t,
              config: {
                name: t.name,
                type: 'customer_support',
                llm_provider: 'openai',
                model: 'gpt-4o',
                temperature: 0.7,
                max_tokens: 500,
                first_message: '',
                first_message_mode: 'assistant-speaks-first',
                prompt: '',
                voice_provider: '11labs',
                language: 'fr-FR',
              },
              tools: []
            } as TemplateDetail;
          }
        })
      );

      setTemplates(detailedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les templates. Vérifiez que le backend est lancé.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Templates d'Agents Préconfigurés
          </h2>
          <p className="text-gray-400">
            Chargement des templates depuis le backend...
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </section>
    );
  }

  if (templates.length === 0) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Templates d'Agents Préconfigurés
          </h2>
          <p className="text-gray-400">
            Aucun template disponible. Vérifiez la connexion au backend.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Templates d'Agents Préconfigurés
        </h2>
        <p className="text-gray-400">
          Choisissez un template pour démarrer rapidement avec une configuration optimisée
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
          <TemplateCard key={template.id} template={template} index={index} />
        ))}
      </div>
    </section>
  );
};
