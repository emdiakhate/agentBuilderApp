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
        <h1 className="text-3xl font-bold tracking-tight text-white">Paramètres</h1>
        <p className="text-gray-400 mt-1">
          Gérez vos préférences et paramètres de l'application
        </p>
      </div>

      {/* Appearance Settings */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">Apparence</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Personnalisez l'apparence de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Thème sombre</Label>
              <p className="text-sm text-gray-400">
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
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-white">Intégrations</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Connectez vos services externes via Vapi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Plug className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-400 text-center mb-4">
              Connectez Google Calendar, Google Sheets et d'autres services
            </p>
            <Button onClick={() => navigate("/integrations")} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Voir les intégrations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-400" />
            <CardTitle className="text-white">Compte</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Gérez les informations de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-400 text-center">
              Les paramètres de compte seront bientôt disponibles
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-400" />
            <CardTitle className="text-white">Notifications</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Configurez vos préférences de notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between opacity-50">
            <div className="space-y-0.5">
              <Label className="text-white">Notifications par email</Label>
              <p className="text-sm text-gray-400">
                Recevoir des emails pour les événements importants
              </p>
            </div>
            <Switch disabled />
          </div>
          <div className="flex items-center justify-between opacity-50">
            <div className="space-y-0.5">
              <Label className="text-white">Notifications push</Label>
              <p className="text-sm text-gray-400">
                Recevoir des notifications dans le navigateur
              </p>
            </div>
            <Switch disabled />
          </div>
          <p className="text-xs text-gray-400">
            * Ces fonctionnalités seront bientôt disponibles
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" />
            <CardTitle className="text-white">Sécurité</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Paramètres de sécurité et confidentialité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-400 text-center">
              Les paramètres de sécurité seront bientôt disponibles
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
