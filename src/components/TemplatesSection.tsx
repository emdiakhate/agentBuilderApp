import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  // Avatar images for templates
  const imageMap: Record<string, string> = {
    'customer_support': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    'lead_qualification': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'appointment_scheduler': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    'info_collector': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    'feedback_gatherer': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    'care_coordinator': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
  };

  // 3-color gradients for modern look
  const gradientMap: Record<string, string> = {
    'support': 'from-rose-500 via-pink-500 to-fuchsia-500',
    'sales': 'from-blue-500 via-indigo-500 to-purple-500',
    'scheduling': 'from-teal-500 via-cyan-500 to-sky-500',
    'data': 'from-amber-500 via-orange-500 to-red-500',
    'research': 'from-purple-500 via-violet-500 to-indigo-500',
    'health': 'from-emerald-500 via-green-500 to-teal-500',
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
          relative overflow-hidden cursor-pointer rounded-2xl h-[420px]
          bg-gradient-to-br ${gradientMap[template.category] || 'from-gray-500 via-gray-600 to-gray-700'}
          border-2 border-white/20 hover:border-white/40
          shadow-xl hover:shadow-2xl
          transition-all duration-300 group
        `}
      >
        {/* Badge catégorie - top right */}
        <div className="absolute top-5 right-5 z-20">
          <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
            {categoryLabels[template.category] || template.category}
          </span>
        </div>

        {/* Name + Role - top left */}
        <div className="absolute top-5 left-5 z-20 max-w-[60%]">
          <h3 className="text-white font-bold text-2xl mb-0.5 drop-shadow-lg">
            {template.config.name}
          </h3>
          <p className="text-white/90 text-sm font-medium drop-shadow-md">
            {template.name}
          </p>
        </div>

        {/* Avatar - BOTTOM, occupying 75% of card height */}
        <div className="absolute bottom-0 left-0 right-0 h-[75%] flex items-end justify-center pb-8">
          <img
            src={imageMap[template.id] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face'}
            alt={template.name}
            className="w-64 h-64 rounded-full object-cover border-4 border-white/30 shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Hover overlay */}
        <div className="
          absolute inset-0 bg-black/70 backdrop-blur-sm
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          flex items-center justify-center z-30
        ">
          <Button className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-4 rounded-xl shadow-2xl text-base">
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
