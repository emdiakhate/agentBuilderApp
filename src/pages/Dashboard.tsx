import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bot, Phone, TrendingUp, Users, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAgents } from "@/services/agentService";

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => fetchAgents(),
  });

  const stats = [
    {
      title: "Total Agents",
      value: agents?.length || 0,
      description: "Agents actifs",
      icon: Bot,
      trend: "+12%",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Appels ce mois",
      value: "1,234",
      description: "Appels totaux",
      icon: Phone,
      trend: "+8%",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Taux de réussite",
      value: "94.2%",
      description: "Conversations réussies",
      icon: TrendingUp,
      trend: "+2.4%",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Utilisateurs",
      value: "856",
      description: "Utilisateurs uniques",
      icon: Users,
      trend: "+15%",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
  ];

  const recentAgents = agents?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Vue d'ensemble de votre plateforme d'agents vocaux
          </p>
        </div>
        <Button
          onClick={() => navigate("/agents/create")}
          className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Nouvel Agent
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-gray-400 mt-1">
                {stat.description}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-xs font-medium ${stat.color}`}>
                  {stat.trend}
                </span>
                <span className="text-xs text-gray-400">vs mois dernier</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Agents */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Agents Récents</CardTitle>
              <CardDescription className="text-gray-400">Vos derniers agents créés</CardDescription>
            </div>
            <Button variant="ghost" onClick={() => navigate("/agents")} className="gap-2 text-gray-400 hover:text-white hover:bg-white/10">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px] bg-white/10" />
                    <Skeleton className="h-3 w-[300px] bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentAgents.length > 0 ? (
            <div className="space-y-4">
              {recentAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <Bot className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-400 truncate">
                      {agent.description || "Aucune description"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 text-white">Aucun agent</h3>
              <p className="text-sm text-gray-400 mb-4">
                Créez votre premier agent pour commencer
              </p>
              <Button onClick={() => navigate("/agents/create")} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Plus className="h-4 w-4" />
                Créer un Agent
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 transition-colors" onClick={() => navigate("/agents")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bot className="h-5 w-5 text-purple-400" />
              Gérer les Agents
            </CardTitle>
            <CardDescription className="text-gray-400">
              Consulter et modifier vos agents existants
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 transition-colors" onClick={() => navigate("/analytics")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-pink-400" />
              Voir Analytics
            </CardTitle>
            <CardDescription className="text-gray-400">
              Analyser les performances de vos agents
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
