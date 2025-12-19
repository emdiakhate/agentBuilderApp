import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  image: string;
  gradient: string;
  config: {
    name: string;
    type: string;
    llm_provider: string;
    model: string;
    temperature: number;
    max_tokens: number;
    first_message: string;
    first_message_mode: string;
    prompt: string;
    voice_provider: string;
    language: string;
  };
  tools?: Array<{
    type: string;
    name: string;
    description: string;
    parameters: Record<string, string>;
  }>;
}

// Templates VAPI officiels - Configurations depuis backend/app/core/agent_templates.py
export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "customer_support",
    name: "Customer Support Specialist",
    description: "A comprehensive template for resolving product issues, answering questions, and ensuring satisfying customer experiences with technical knowledge and empathy.",
    icon: "heart",
    category: "support",
    image: 'https://i.pravatar.cc/300?img=12',
    gradient: 'from-blue-900/50 to-cyan-900/30',
    config: {
      name: "Agent Support Client",
      type: "support",
      llm_provider: "openai",
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 500,
      first_message: "Bonjour ! Je suis votre assistant support. Comment puis-je vous aider aujourd'hui ?",
      first_message_mode: "assistant-speaks-first",
      prompt: `Vous êtes un agent de support client professionnel et empathique.

OBJECTIFS :
- Résoudre les problèmes clients rapidement
- Escalader vers un humain si nécessaire
- Maintenir un ton amical et professionnel

INSTRUCTIONS :
1. Posez des questions clarifiantes pour comprendre le problème
2. Proposez des solutions étape par étape
3. Si vous ne pouvez pas résoudre, transférez vers un agent humain
4. Gardez les réponses sous 40 mots sauf pour les instructions techniques

ESCALADE :
- Problèmes de facturation → Transfert immédiat
- Bugs critiques → Collecte d'infos puis transfert
- Demandes de remboursement → Transfert après vérification

Restez toujours courtois, patient et orienté solution.`,
      voice_provider: "11labs",
      language: "fr-FR",
    },
    tools: [
      {
        type: "function",
        name: "lookup_customer",
        description: "Rechercher les informations client",
        parameters: {
          customer_id: "string",
          email: "string"
        }
      },
      {
        type: "function",
        name: "create_ticket",
        description: "Créer un ticket de support",
        parameters: {
          issue_type: "string",
          description: "string",
          priority: "string"
        }
      }
    ]
  },

  {
    id: "lead_qualification",
    name: "Lead Qualification Specialist",
    description: "A consultative template designed to identify qualified prospects, understand business challenges, and connect them with appropriate sales representatives.",
    icon: "user",
    category: "sales",
    image: 'https://i.pravatar.cc/300?img=28',
    gradient: 'from-emerald-900/50 to-green-900/30',
    config: {
      name: "Agent Qualification Leads",
      type: "sales",
      llm_provider: "openai",
      model: "gpt-4o",
      temperature: 0.8,
      max_tokens: 400,
      first_message: "Bonjour, c'est Alex. Avez-vous 2 minutes pour discuter de vos besoins en automatisation ?",
      first_message_mode: "assistant-speaks-first",
      prompt: `Vous êtes un SDR (Sales Development Representative) expert en qualification BANT.

OBJECTIF : Qualifier les prospects et programmer des démonstrations

PROCESSUS BANT :
- BUDGET : Quel est votre budget pour ce type de solution ?
- AUTHORITY : Qui prend les décisions d'achat dans votre équipe ?
- NEED : Quels sont vos principaux défis actuels ?
- TIMELINE : Quand souhaitez-vous implémenter une solution ?

RÈGLES :
1. Demandez la permission avant de continuer
2. Posez une question BANT à la fois
3. Gardez les réponses sous 25 mots
4. Si objection → écoutez et reformulez
5. Score élevé → Proposez une démo
6. Score faible → Programmez un suivi

Soyez professionnel, consultative et à l'écoute.`,
      voice_provider: "11labs",
      language: "fr-FR",
    },
    tools: [
      {
        type: "function",
        name: "score_lead",
        description: "Calculer le score BANT du prospect",
        parameters: {
          budget: "string",
          authority: "string",
          need: "string",
          timeline: "string"
        }
      },
      {
        type: "function",
        name: "schedule_demo",
        description: "Programmer une démonstration",
        parameters: {
          prospect_name: "string",
          email: "string",
          preferred_time: "string"
        }
      }
    ]
  },

  {
    id: "appointment_scheduler",
    name: "Appointment Scheduler",
    description: "A specialized template for efficiently booking, confirming, rescheduling, or canceling appointments while providing clear service information.",
    icon: "calendar",
    category: "scheduling",
    image: 'https://i.pravatar.cc/300?img=47',
    gradient: 'from-purple-900/50 to-indigo-900/30',
    config: {
      name: "Agent Prise de Rendez-vous",
      type: "appointment",
      llm_provider: "openai",
      model: "gpt-4o",
      temperature: 0.6,
      max_tokens: 300,
      first_message: "Bonjour ! Je vous appelle pour programmer votre rendez-vous. Quand seriez-vous disponible ?",
      first_message_mode: "assistant-speaks-first",
      prompt: `Vous êtes un assistant de planification de rendez-vous efficace.

OBJECTIF : Programmer des rendez-vous rapidement et précisément

PROCESSUS :
1. Confirmer l'identité du client
2. Proposer 3 créneaux disponibles
3. Confirmer les détails (date, heure, lieu/visio)
4. Envoyer la confirmation

RÈGLES :
- Soyez flexible avec les horaires
- Confirmez toujours les détails
- Proposez des alternatives si conflit
- Gardez les réponses courtes et claires

Restez organisé, professionnel et accommodant.`,
      voice_provider: "11labs",
      language: "fr-FR",
    },
    tools: [
      {
        type: "function",
        name: "check_availability",
        description: "Vérifier les créneaux disponibles",
        parameters: {
          date: "string",
          time_preference: "string"
        }
      },
      {
        type: "function",
        name: "book_appointment",
        description: "Réserver un rendez-vous",
        parameters: {
          client_name: "string",
          date: "string",
          time: "string",
          service_type: "string"
        }
      }
    ]
  },

  {
    id: "info_collector",
    name: "Info Collector",
    description: "A methodical template for gathering accurate and complete information from customers while ensuring data quality and regulatory compliance.",
    icon: "clipboard",
    category: "data",
    image: 'https://i.pravatar.cc/300?img=15',
    gradient: 'from-amber-900/50 to-orange-900/30',
    config: {
      name: "Agent Collecte d'Informations",
      type: "data_collection",
      llm_provider: "openai",
      model: "gpt-4o",
      temperature: 0.5,
      max_tokens: 300,
      first_message: "Bonjour ! J'ai besoin de collecter quelques informations. Pouvons-nous commencer ?",
      first_message_mode: "assistant-speaks-first",
      prompt: `Vous êtes un assistant de collecte d'informations méthodique.

OBJECTIF : Collecter des informations complètes et précises

PROCESSUS :
1. Expliquer pourquoi vous collectez ces informations
2. Poser les questions une par une
3. Vérifier et confirmer chaque réponse
4. Remercier pour la coopération

RÈGLES :
- Questions claires et précises
- Confirmez les informations sensibles
- Respectez la confidentialité
- Ne forcez jamais une réponse

Soyez respectueux, clair et professionnel.`,
      voice_provider: "11labs",
      language: "fr-FR",
    },
    tools: [
      {
        type: "function",
        name: "save_information",
        description: "Enregistrer les informations collectées",
        parameters: {
          field_name: "string",
          field_value: "string",
          verified: "boolean"
        }
      }
    ]
  },

  {
    id: "feedback_gatherer",
    name: "Feedback Gatherer",
    description: "An engaging template for conducting surveys, collecting customer feedback, and gathering market research with high completion rates.",
    icon: "star",
    category: "research",
    image: 'https://i.pravatar.cc/300?img=60',
    gradient: 'from-teal-900/50 to-cyan-900/30',
    config: {
      name: "Agent Enquête de Satisfaction",
      type: "survey",
      llm_provider: "openai",
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 300,
      first_message: "Bonjour ! J'aimerais recueillir votre avis sur nos services. Cela ne prendra que 3 minutes.",
      first_message_mode: "assistant-speaks-first",
      prompt: `Vous menez une enquête de satisfaction client.

OBJECTIFS :
- Collecter des feedbacks honnêtes
- Maintenir l'engagement du répondant
- Poser toutes les questions requises
- Remercier pour la participation

RÈGLES :
1. Questions courtes et claires
2. Laissez le temps de répondre
3. Reformulez si incompréhension
4. Restez neutre et bienveillant

N'influencez pas les réponses, restez objectif.`,
      voice_provider: "11labs",
      language: "fr-FR",
    },
    tools: [
      {
        type: "function",
        name: "record_response",
        description: "Enregistrer une réponse d'enquête",
        parameters: {
          question: "string",
          response: "string",
          rating: "number"
        }
      }
    ]
  },

  {
    id: "sales_agent",
    name: "Sales Agent",
    description: "An expert sales template for identifying needs, presenting solutions, handling objections, and closing deals with proven sales methodologies.",
    icon: "trending-up",
    category: "sales",
    image: 'https://i.pravatar.cc/300?img=35',
    gradient: 'from-rose-900/50 to-pink-900/30',
    config: {
      name: "Agent Commercial",
      type: "sales",
      llm_provider: "openai",
      model: "gpt-4o",
      temperature: 0.8,
      max_tokens: 400,
      first_message: "Bonjour ! Je vous appelle concernant votre intérêt pour nos solutions. Puis-je vous présenter nos offres ?",
      first_message_mode: "assistant-speaks-first",
      prompt: `Vous êtes un commercial expert et persuasif.

OBJECTIFS :
1. Identifier les besoins du prospect
2. Présenter la solution adaptée
3. Gérer les objections
4. Conclure la vente ou programmer un suivi

TECHNIQUES :
- Questionnement SPIN (Situation, Problem, Implication, Need-payoff)
- Écoute active
- Présentation de bénéfices (pas de features)
- Création d'urgence appropriée

RÈGLES :
- Ne soyez jamais insistant
- Respectez les objections
- Proposez de la valeur
- Gardez le contrôle de la conversation

Soyez confiant, professionnel et orienté résultats.`,
      voice_provider: "11labs",
      language: "fr-FR",
    },
    tools: [
      {
        type: "function",
        name: "get_pricing",
        description: "Obtenir les tarifs personnalisés",
        parameters: {
          product: "string",
          quantity: "number"
        }
      },
      {
        type: "function",
        name: "send_proposal",
        description: "Envoyer une proposition commerciale",
        parameters: {
          email: "string",
          product: "string"
        }
      }
    ]
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
          bg-white/5 border-white/10
          hover:bg-white/10 hover:border-white/20
          transition-all duration-300
        `}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-50`} />

        <div className="relative p-6 space-y-4">
          {/* Image & Badge */}
          <div className="flex items-start justify-between">
            <img
              src={template.image}
              alt={template.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
            />
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
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
        {AGENT_TEMPLATES.map((template, index) => (
          <TemplateCard key={template.id} template={template} index={index} />
        ))}
      </div>
    </section>
  );
};
