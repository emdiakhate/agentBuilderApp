import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Calendar, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { checkGoogleCalendarStatus, connectGoogleCalendar, disconnectGoogleCalendar } from "@/services/toolService";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for OAuth callback success/error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthSuccess = params.get("oauth_success");
    const oauthError = params.get("oauth_error");

    if (oauthSuccess === "google_calendar") {
      toast({
        title: "Connexion réussie",
        description: "Google Calendar a été connecté avec succès.",
      });
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
      // Refresh status
      queryClient.invalidateQueries({ queryKey: ["googleCalendarStatus"] });
    } else if (oauthError) {
      toast({
        title: "Erreur de connexion",
        description: `Erreur lors de la connexion à Google Calendar: ${oauthError}`,
        variant: "destructive",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast, queryClient]);

  // Fetch Google Calendar connection status
  const { data: calendarStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["googleCalendarStatus"],
    queryFn: checkGoogleCalendarStatus,
    retry: false,
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: disconnectGoogleCalendar,
    onSuccess: () => {
      toast({
        title: "Déconnexion réussie",
        description: "Google Calendar a été déconnecté.",
      });
      queryClient.invalidateQueries({ queryKey: ["googleCalendarStatus"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la déconnexion",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos préférences et paramètres de l'application
        </p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Apparence</CardTitle>
          </div>
          <CardDescription>
            Personnalisez l'apparence de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thème sombre</Label>
              <p className="text-sm text-muted-foreground">
                Activer le mode sombre pour l'interface
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            <CardTitle>Intégrations</CardTitle>
          </div>
          <CardDescription>
            Connectez vos services externes pour enrichir vos agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Calendar Integration */}
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Google Calendar</h3>
                  {statusLoading ? (
                    <span className="text-xs text-muted-foreground">Chargement...</span>
                  ) : calendarStatus?.connected ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                      Connecté
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      Non connecté
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Permettez à vos agents de gérer les rendez-vous et vérifier les disponibilités
                </p>
                {calendarStatus?.connected && calendarStatus?.expires_at && (
                  <p className="text-xs text-muted-foreground">
                    {calendarStatus.is_expired ? (
                      <span className="text-orange-600 dark:text-orange-400">Token expiré - Reconnexion requise</span>
                    ) : (
                      <span>Expire le {new Date(calendarStatus.expires_at).toLocaleDateString()}</span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div>
              {calendarStatus?.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                >
                  {disconnectMutation.isPending ? "Déconnexion..." : "Déconnecter"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={connectGoogleCalendar}
                >
                  Connecter
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Compte</CardTitle>
          </div>
          <CardDescription>
            Gérez les informations de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Les paramètres de compte seront bientôt disponibles
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configurez vos préférences de notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between opacity-50">
            <div className="space-y-0.5">
              <Label>Notifications par email</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des emails pour les événements importants
              </p>
            </div>
            <Switch disabled />
          </div>
          <div className="flex items-center justify-between opacity-50">
            <div className="space-y-0.5">
              <Label>Notifications push</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications dans le navigateur
              </p>
            </div>
            <Switch disabled />
          </div>
          <p className="text-xs text-muted-foreground">
            * Ces fonctionnalités seront bientôt disponibles
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Sécurité</CardTitle>
          </div>
          <CardDescription>
            Paramètres de sécurité et confidentialité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Les paramètres de sécurité seront bientôt disponibles
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
