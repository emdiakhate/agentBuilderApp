import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, User, Calendar, Clipboard, Star, TrendingUp, Bot, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchTemplates, fetchTemplateCategories, AgentTemplate, getCategoryDisplayName } from "@/services/templateService";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: AgentTemplate) => void;
}

const iconMap: Record<string, any> = {
  'heart': Heart,
  'user': User,
  'calendar': Calendar,
  'clipboard': Clipboard,
  'star': Star,
  'trending-up': TrendingUp,
};

export function TemplateSelector({ open, onClose, onSelectTemplate }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => fetchTemplates(),
    enabled: open,
  });

  const { data: categories } = useQuery({
    queryKey: ["template-categories"],
    queryFn: fetchTemplateCategories,
    enabled: open,
  });

  const filteredTemplates = templates?.filter(
    (t) => selectedCategory === "all" || t.category === selectedCategory
  );

  const handleSelectTemplate = (template: AgentTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Bot;
    return Icon;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Choisir un template
          </DialogTitle>
          <DialogDescription>
            Démarrez rapidement avec un template pré-configuré, ou créez votre propre agent personnalisé.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">Tous</TabsTrigger>
            {categories?.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {getCategoryDisplayName(cat)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {templatesLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-12 w-12 rounded-lg mb-2" />
                      <Skeleton className="h-6 w-[200px]" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : filteredTemplates && filteredTemplates.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTemplates.map((template) => {
                  const Icon = getIcon(template.icon);
                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Utiliser ce template
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun template disponible dans cette catégorie</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t">
          <Card
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => {
              onSelectTemplate({
                id: "blank",
                name: "Template Vierge",
                description: "Commencer avec un agent vierge et le configurer entièrement vous-même",
                icon: "bot",
                category: "custom",
              });
              onClose();
            }}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-muted w-fit">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Template Vierge</CardTitle>
                  <CardDescription>
                    Créez un agent personnalisé depuis zéro avec vos propres configurations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
