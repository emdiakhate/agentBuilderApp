
import { AgentType } from '@/types/agent';

const mockAgents: AgentType[] = [
  {
    id: '1',
    name: 'Ami',
    status: 'active',
    description: 'Un assistant IA polyvalent spécialisé dans le support client et les requêtes générales',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ami',
    type: 'Customer Service',
    createdAt: '2024-03-15T10:30:00Z',
    totalCalls: 1247,
    averageRating: 4.8,
    language: 'Français',
    timezone: 'Europe/Paris',
    capabilities: ['Support client', 'FAQ', 'Transfert d\'appels'],
    isOnline: true,
    responseTime: '< 2s'
  },
  {
    id: '2',
    name: 'Omar',
    status: 'active',
    description: 'Assistant commercial expert en ventes et génération de leads',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=omar',
    type: 'Sales & Marketing',
    createdAt: '2024-03-15T09:15:00Z',
    totalCalls: 892,
    averageRating: 4.9,
    language: 'Français',
    timezone: 'Europe/Paris',
    capabilities: ['Génération de leads', 'Qualification des prospects', 'Présentation produit'],
    isOnline: true,
    responseTime: '< 1s'
  },
  {
    id: '3',
    name: 'Awa',
    status: 'inactive',
    description: 'Spécialiste en support technique et résolution de problèmes complexes',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=awa',
    type: 'Technical Support',
    createdAt: '2024-03-14T16:45:00Z',
    totalCalls: 623,
    averageRating: 4.7,
    language: 'Français',
    timezone: 'Europe/Paris',
    capabilities: ['Support technique', 'Dépannage', 'Documentation'],
    isOnline: false,
    responseTime: '< 3s'
  },
  {
    id: '4',
    name: 'Adja',
    status: 'active',
    description: 'Expert en onboarding client et formation produit',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=adja',
    type: 'Customer Onboarding',
    createdAt: '2024-03-15T11:20:00Z',
    totalCalls: 445,
    averageRating: 4.6,
    language: 'Français',
    timezone: 'Europe/Paris',
    capabilities: ['Formation client', 'Onboarding', 'Tutoriels'],
    isOnline: true,
    responseTime: '< 2s'
  },
  {
    id: '5',
    name: 'Moussa',
    status: 'active',
    description: 'Analyste de données et génération de rapports intelligents',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=moussa',
    type: 'Other Function',
    createdAt: '2024-03-15T08:30:00Z',
    totalCalls: 278,
    averageRating: 4.5,
    language: 'Français',
    timezone: 'Europe/Paris',
    capabilities: ['Analyse de données', 'Rapports', 'Insights'],
    isOnline: true,
    responseTime: '< 4s'
  },
  {
    id: '6',
    name: 'Astou',
    status: 'draft',
    description: 'Assistant multilingue pour support international',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=astou',
    type: 'Customer Service',
    createdAt: '2024-03-13T14:10:00Z',
    totalCalls: 567,
    averageRating: 4.4,
    language: 'Français, Anglais, Espagnol',
    timezone: 'Europe/Paris',
    capabilities: ['Support multilingue', 'Traduction', 'Support international'],
    isOnline: false,
    responseTime: '< 5s'
  }
];

export const fetchAgents = async (filter: string = 'all-agents'): Promise<AgentType[]> => {
  // Simuler un délai d'API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredAgents = mockAgents;
  
  switch (filter) {
    case 'active-agents':
      filteredAgents = mockAgents.filter(agent => agent.status === 'active');
      break;
    case 'inactive-agents':
      filteredAgents = mockAgents.filter(agent => agent.status === 'inactive');
      break;
    case 'maintenance-agents':
      filteredAgents = mockAgents.filter(agent => agent.status === 'draft');
      break;
    default:
      filteredAgents = mockAgents;
  }
  
  return filteredAgents;
};

export const fetchAgentById = async (id: string): Promise<AgentType> => {
  // Simuler un délai d'API
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const agent = mockAgents.find(agent => agent.id === id);
  
  if (!agent) {
    throw new Error(`Agent avec l'id ${id} non trouvé`);
  }
  
  return agent;
};

export const updateAgent = async (id: string, updatedData: Partial<AgentType>): Promise<AgentType> => {
  // Simuler un délai d'API
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const agentIndex = mockAgents.findIndex(agent => agent.id === id);
  
  if (agentIndex === -1) {
    throw new Error(`Agent avec l'id ${id} non trouvé`);
  }
  
  const updatedAgent = {
    ...mockAgents[agentIndex],
    ...updatedData,
    updatedAt: new Date().toISOString()
  };
  
  mockAgents[agentIndex] = updatedAgent;
  
  return updatedAgent;
};
