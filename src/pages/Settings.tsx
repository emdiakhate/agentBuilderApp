import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, Shield, Palette, Plug } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

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
            <Plug className="h-5 w-5" />
            <CardTitle>Intégrations</CardTitle>
          </div>
          <CardDescription>
            Connectez vos services externes via Vapi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Plug className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center mb-4">
              Connectez Google Calendar, Google Sheets et d'autres services
            </p>
            <Button onClick={() => navigate("/integrations")}>
              Voir les intégrations
            </Button>
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
