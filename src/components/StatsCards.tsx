import React from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Phone, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface StatsCardsProps {
  totalAgents: number;
  activeAgents: number;
  callsToday: number;
  avgSatisfaction: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalAgents,
  activeAgents,
  callsToday,
  avgSatisfaction,
}) => {
  const stats: Stat[] = [
    {
      label: 'Total Agents',
      value: totalAgents,
      icon: <Users className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Agents Actifs',
      value: activeAgents,
      icon: <Activity className="h-5 w-5" />,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: "Appels Aujourd'hui",
      value: callsToday.toLocaleString(),
      icon: <Phone className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Satisfaction',
      value: `${avgSatisfaction.toFixed(1)}/5`,
      icon: <Star className="h-5 w-5" />,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-border/50 hover:border-border transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`
                    h-12 w-12 rounded-xl flex items-center justify-center
                    bg-gradient-to-br ${stat.color}
                    text-white shadow-lg
                  `}
                >
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
