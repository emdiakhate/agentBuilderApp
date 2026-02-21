import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Bot, Sparkles, ArrowUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/Sidebar';

const SUGGESTIONS = [
  "Créer un agent support client",
  "Analyser les performances de mon agent",
  "Configurer un agent de prise de rendez-vous",
  "Ajouter Google Calendar à mon agent",
  "Créer un agent de qualification de leads",
  "Modifier la voix de mon agent",
  "Consulter les analytics d'appels",
  "Configurer un bruit de fond pour mon agent",
  "Créer un agent multilingue",
  "Ajouter une base de connaissances à mon agent",
  "Optimiser le prompt de mon agent",
  "Tester mon agent en mode vocal",
];

// Component showing rotating suggestion pills
const RotatingSuggestions: React.FC<{ onSelect: (suggestion: string) => void }> = ({ onSelect }) => {
  const [visibleSuggestions, setVisibleSuggestions] = useState<{ id: number; text: string; opacity: number }[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    // Initialize with first batch
    const initial = SUGGESTIONS.slice(0, 4).map((text, i) => ({
      id: i,
      text,
      opacity: 1,
    }));
    setVisibleSuggestions(initial);
    counterRef.current = 4;

    const interval = setInterval(() => {
      setVisibleSuggestions(prev => {
        const newList = [...prev];
        // Replace the oldest suggestion
        const replaceIndex = counterRef.current % newList.length;
        const nextSuggestionIndex = counterRef.current % SUGGESTIONS.length;
        newList[replaceIndex] = {
          id: counterRef.current,
          text: SUGGESTIONS[nextSuggestionIndex],
          opacity: 1,
        };
        counterRef.current++;
        return newList;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
      {visibleSuggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          className="px-4 py-2.5 rounded-full text-sm font-medium
            bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10
            text-gray-700 dark:text-gray-300
            hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10
            hover:text-emerald-700 dark:hover:text-emerald-300
            transition-all duration-500 animate-fade-in cursor-pointer"
          onClick={() => onSelect(suggestion.text)}
        >
          {suggestion.text}
        </button>
      ))}
    </div>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userName = localStorage.getItem('user_name') || 'Malik';

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim()) return;

    // Navigate based on intent
    const lower = message.toLowerCase();
    if (lower.includes('créer') && lower.includes('agent')) {
      navigate('/agents/create');
    } else if (lower.includes('analytics') || lower.includes('performance') || lower.includes('analyser')) {
      navigate('/analytics');
    } else if (lower.includes('voix') || lower.includes('voice') || lower.includes('vocal')) {
      navigate('/voice-library');
    } else if (lower.includes('calendar') || lower.includes('google') || lower.includes('intégration')) {
      navigate('/integrations');
    } else if (lower.includes('paramètre') || lower.includes('configur') || lower.includes('setting')) {
      navigate('/settings');
    } else if (lower.includes('conversation') || lower.includes('appel')) {
      navigate('/conversations');
    } else {
      navigate('/agents');
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setMessage(suggestion);
    // Auto-focus the textarea
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0f1923]">
      <Sidebar />

      <main className="flex-1 lg:ml-[240px] transition-all duration-300">
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
          {/* Logo / Brand */}
          <div className="mb-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white text-center">
              Bonjour, <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{userName}</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-center text-lg">
              Comment puis-je vous aider aujourd'hui ?
            </p>
          </div>

          {/* Chat Input */}
          <div className="w-full max-w-2xl mb-8">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative bg-white dark:bg-[#111c2e] rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none overflow-hidden focus-within:border-emerald-500/50 dark:focus-within:border-emerald-500/30 transition-colors">
                <Textarea
                  ref={textareaRef}
                  placeholder="Demandez-moi n'importe quoi..."
                  className="min-h-[56px] max-h-[160px] resize-none border-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 px-5 py-4 pr-14 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute bottom-3 right-3 h-9 w-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md disabled:opacity-40"
                  disabled={!message.trim()}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Rotating Suggestions */}
          <RotatingSuggestions onSelect={handleSuggestionSelect} />

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Button
              onClick={() => navigate('/agents/create')}
              variant="outline"
              className="rounded-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-500/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Agent
            </Button>
            <Button
              onClick={() => navigate('/agents')}
              variant="outline"
              className="rounded-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-500/30"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Mes Agents
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
