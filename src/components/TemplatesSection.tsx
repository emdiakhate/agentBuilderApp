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
    'care_coordinator': 'https://i.pravatar.cc/300?img=35',
  };

  const gradientMap: Record<string, string> = {
    'support': 'from-rose-900/50 to-pink-900/30',
    'sales': 'from-blue-900/50 to-indigo-900/30',
    'scheduling': 'from-teal-900/50 to-cyan-900/30',
    'data': 'from-amber-900/50 to-orange-900/30',
    'research': 'from-purple-900/50 to-violet-900/30',
    'health': 'from-emerald-900/50 to-green-900/30',
  };

  const categoryLabels: Record<string, string> = {
    'support': 'Support',
    'sales': 'Ventes',
    'scheduling': 'Planification',
    'data': 'Données',
    'research': 'Recherche',
    'health': 'Santé',
  };

  const handleSelectTemplate = () => {
    // Log the template being passed
    console.log('🔵 Template selected:', template);
    console.log('🔵 Template config:', template.config);

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
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card
        onClick={handleSelectTemplate}
        className={`
          relative overflow-hidden cursor-pointer rounded-2xl h-[380px]
          bg-gradient-to-br ${gradientMap[template.category] || 'from-gray-900/50 to-gray-800/30'}
          border-white/10 hover:border-white/20
          transition-all duration-300 group
        `}
      >
        {/* Badge catégorie - top right */}
        <div className="absolute top-4 right-4 z-20">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/30">
            {categoryLabels[template.category] || template.category}
          </span>
        </div>

        {/* Content - top */}
        <div className="relative z-10 p-6">
          <h3 className="text-white font-bold text-xl mb-1">
            {template.config.name}
          </h3>
          <p className="text-white/80 text-sm">
            {template.name}
          </p>
        </div>

        {/* Avatar - CENTER, BIG */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={imageMap[template.id] || 'https://i.pravatar.cc/300?img=1'}
            alt={template.name}
            className="w-48 h-48 rounded-full object-cover border-4 border-white/20 shadow-2xl"
          />
        </div>

        {/* Hover overlay */}
        <div className="
          absolute inset-0 bg-black/60 backdrop-blur-sm
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          flex items-center justify-center z-30
        ">
          <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg">
            Utiliser ce template →
          </Button>
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
      console.log('🔵 Basic templates fetched:', basicTemplates.length);

      // Fetch detailed config for each template
      const detailedTemplates = await Promise.all(
        basicTemplates.map(async (t) => {
          try {
            const detail = await fetchTemplateDetail(t.id);
            console.log(`🔵 Template detail for ${t.id}:`, {
              name: detail.name,
              hasConfig: !!detail.config,
              configKeys: detail.config ? Object.keys(detail.config) : [],
              prompt: detail.config?.prompt?.substring(0, 50) + '...'
            });
            return detail;
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
