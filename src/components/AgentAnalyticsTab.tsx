import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface AgentAnalyticsTabProps {
  agent: any;
}

export const AgentAnalyticsTab: React.FC<AgentAnalyticsTabProps> = ({ agent }) => {
  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analyse</h2>
          <p className="text-sm text-muted-foreground">
            Visualisez les performances de votre agent et les statistiques d'utilisation
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3">
        <Select defaultValue="30days">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 derniers jours</SelectItem>
            <SelectItem value="30days">30 derniers jours</SelectItem>
            <SelectItem value="90days">90 derniers jours</SelectItem>
            <SelectItem value="1year">1 an</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Canaux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les canaux</SelectItem>
            <SelectItem value="voice">Voix</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Score AVM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">9.0<span className="text-lg text-muted-foreground">/10</span></div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +0.5 vs période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +2 vs période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Appels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">14</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +3 vs période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sentiment Utilisateur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">72<span className="text-lg">%</span></div>
            <p className="text-xs text-muted-foreground">positif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Couverture Tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">75.0<span className="text-lg">%</span></div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +5.2% vs période précédente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métriques de performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Métriques de Performance</CardTitle>
          </div>
          <CardDescription>
            Suivi des performances de l'agent et statistiques d'interaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AVM Score Trend */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tendance Score AVM</h4>
              <div className="h-48 bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="avm-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 120 Q 30 100 60 110 T 120 100 T 180 90 T 240 95 T 300 85 L 300 180 L 0 180 Z"
                    fill="url(#avm-gradient)"
                  />
                  <path
                    d="M 0 120 Q 30 100 60 110 T 120 100 T 180 90 T 240 95 T 300 85"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>17</span>
                <span>30</span>
                <span>13</span>
              </div>
            </div>

            {/* Call Performance */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Performance Appels</h4>
              <div className="h-48 flex items-end gap-1 px-2">
                {[65, 45, 70, 55, 80, 60, 75, 50, 85, 65, 70, 55, 60, 75, 80, 70, 65, 90, 75, 85].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-1">
                    <div className="bg-blue-500 rounded-t" style={{ height: `${height}%` }}></div>
                    <div className="bg-purple-400 rounded-b" style={{ height: `${100 - height}%` }}></div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Réussis</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-400 rounded"></div>
                  <span>Échoués</span>
                </div>
              </div>
            </div>

            {/* Text Coverage Trends */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tendances Couverture Texte</h4>
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center relative">
                <svg className="w-full h-full" viewBox="0 0 300 180" preserveAspectRatio="none">
                  <path
                    d="M 0 90 Q 30 85 60 88 T 120 82 T 180 80 T 240 78 T 300 75"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  {[0, 60, 120, 180, 240, 300].map((x, i) => (
                    <circle key={i} cx={x} cy={90 - i * 3} r="3" fill="#10b981" />
                  ))}
                </svg>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Couverture Texte
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Sentiment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse du Sentiment Utilisateur</CardTitle>
          <CardDescription>
            Comment les utilisateurs interagissent avec l'agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stacked Area Chart */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Évolution du Sentiment</h4>
              <div className="h-64 bg-gray-50 rounded-lg relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 250" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="positive-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="neutral-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="negative-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  {/* Positive (bas) */}
                  <path d="M 0 180 L 50 175 L 100 178 L 150 170 L 200 175 L 250 172 L 300 170 L 350 168 L 400 165 L 450 170 L 500 168 L 500 250 L 0 250 Z" fill="url(#positive-gradient)" />
                  {/* Neutral (milieu) */}
                  <path d="M 0 180 L 50 175 L 100 178 L 150 170 L 200 175 L 250 172 L 300 170 L 350 168 L 400 165 L 450 170 L 500 168 L 500 120 L 450 118 L 400 115 L 350 120 L 300 118 L 250 122 L 200 120 L 150 125 L 100 122 L 50 120 L 0 125 Z" fill="url(#neutral-gradient)" />
                  {/* Negative (haut) */}
                  <path d="M 0 125 L 50 120 L 100 122 L 150 125 L 200 120 L 250 122 L 300 118 L 350 120 L 400 115 L 450 118 L 500 120 L 500 0 L 0 0 Z" fill="url(#negative-gradient)" />
                </svg>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Positif</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span>Neutre</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Négatif</span>
                </div>
              </div>
            </div>

            {/* Sentiment Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Répartition du Sentiment</h4>
              <div className="flex items-center justify-center h-64">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Positive: 70% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="176 252" strokeDashoffset="0" />
                    {/* Neutral: 25% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#9ca3af" strokeWidth="20" strokeDasharray="63 252" strokeDashoffset="-176" />
                    {/* Negative: 5% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="13 252" strokeDashoffset="-239" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Sentiment Global</div>
                      <div className="text-2xl font-bold">72% Positif</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm">Positif</span>
                  </div>
                  <span className="text-sm font-medium">70%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                    <span className="text-sm">Neutre</span>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-sm">Négatif</span>
                  </div>
                  <span className="text-sm font-medium">5%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Topics & Conversation Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Sujets Populaires & Insights de Conversation</CardTitle>
          <CardDescription>
            Analysez ce dont les utilisateurs discutent avec votre agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Topic Distribution */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Distribution des Sujets</h4>
              <div className="flex items-center justify-center h-48">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="90 252" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="70 252" strokeDashoffset="-90" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="20" strokeDasharray="50 252" strokeDashoffset="-160" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="42 252" strokeDashoffset="-210" />
                  </svg>
                </div>
              </div>

              <h4 className="text-sm font-medium mt-6">Tendances des Sujets</h4>
              <div className="h-48 bg-gray-50 rounded-lg relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                  {/* Multi-color stacked area */}
                  <path d="M 0 140 Q 50 135 100 138 T 200 130 T 300 125 T 400 120 T 500 118 L 500 180 L 0 180 Z" fill="#3b82f6" opacity="0.6" />
                  <path d="M 0 140 Q 50 135 100 138 T 200 130 T 300 125 T 400 120 T 500 118 L 500 100 L 400 95 L 300 98 L 200 100 L 100 105 L 0 108 Z" fill="#ec4899" opacity="0.6" />
                  <path d="M 0 108 L 100 105 L 200 100 L 300 98 L 400 95 L 500 100 L 500 60 L 400 58 L 300 62 L 200 65 L 100 68 L 0 70 Z" fill="#8b5cf6" opacity="0.6" />
                </svg>
              </div>
              <div className="flex gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Résolution Problème</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-pink-500 rounded"></div>
                  <span>Questions Facturation</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Support Technique</span>
                </div>
              </div>
            </div>

            {/* Common Keywords */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Mots-clés & Phrases Courants</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Paiement</Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">Aide</Badge>
                <Badge variant="secondary" className="bg-pink-100 text-pink-800">Compte</Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Facture</Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Support</Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-800">Problème</Badge>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">Merci</Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">Crédit</Badge>
                <Badge variant="secondary" className="bg-teal-100 text-teal-800">Mise à jour</Badge>
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">Excellent</Badge>
                <Badge variant="secondary" className="bg-lime-100 text-lime-800">Service</Badge>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Question</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par Canal</CardTitle>
          <CardDescription>
            Métriques de performance ventilées par différents canaux de communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution by Channel */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Distribution par Canal</h4>
              <div className="flex items-center justify-center h-48">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="100 252" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="70 252" strokeDashoffset="-100" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="50 252" strokeDashoffset="-170" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="20" strokeDasharray="32 252" strokeDashoffset="-220" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm">Voix</span>
                  </div>
                  <span className="text-sm font-medium">40%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-sm">Chat</span>
                  </div>
                  <span className="text-sm font-medium">28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm">Email</span>
                  </div>
                  <span className="text-sm font-medium">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-500 rounded"></div>
                    <span className="text-sm">Social</span>
                  </div>
                  <span className="text-sm font-medium">12%</span>
                </div>
              </div>

              <h4 className="text-sm font-medium mt-6">Tendances d'Utilisation des Canaux</h4>
              <div className="h-48 bg-gray-50 rounded-lg relative">
                <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                  <path d="M 0 80 Q 50 75 100 78 T 200 70 T 300 65 T 400 60 T 500 58" fill="none" stroke="#3b82f6" strokeWidth="2" />
                  <path d="M 0 100 Q 50 98 100 102 T 200 95 T 300 92 T 400 88 T 500 85" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                  <path d="M 0 120 Q 50 118 100 122 T 200 115 T 300 112 T 400 108 T 500 105" fill="none" stroke="#10b981" strokeWidth="2" />
                  <path d="M 0 140 Q 50 138 100 142 T 200 135 T 300 132 T 400 128 T 500 125" fill="none" stroke="#ec4899" strokeWidth="2" />
                </svg>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Voix</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Chat</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Email</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-pink-500 rounded"></div>
                  <span>Social</span>
                </div>
              </div>
            </div>

            {/* Performance Comparison by Channel */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Comparaison des Performances par Canal</h4>
              <div className="space-y-4">
                {[
                  { channel: 'Voix', values: [90, 85, 88] },
                  { channel: 'Chat', values: [85, 80, 87] },
                  { channel: 'Email', values: [88, 82, 85] },
                  { channel: 'Social', values: [82, 78, 83] }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="text-sm font-medium">{item.channel}</div>
                    <div className="flex gap-2">
                      {item.values.map((value, i) => (
                        <div key={i} className="flex-1">
                          <div className="h-24 bg-gray-100 rounded flex items-end p-1">
                            <div
                              className={`w-full rounded-t ${
                                i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-purple-500' : 'bg-green-500'
                              }`}
                              style={{ height: `${value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 text-xs pt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Temps Réponse</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Taux Succès</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Sentiment Résolution</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
