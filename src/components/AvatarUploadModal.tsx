import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

interface AvatarUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string;
  agentName: string;
  agentId: string;
  onAvatarUpdate: (avatarUrl: string) => Promise<void>;
}

const SUGGESTED_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
  "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?w=400",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400",
];

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  open,
  onOpenChange,
  currentAvatar,
  agentName,
  agentId,
  onAvatarUpdate,
}) => {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleUrlChange = (url: string) => {
    setAvatarUrl(url);
    setPreviewUrl(url);
    setSelectedAvatar(null);
  };

  const handleSelectSuggested = (url: string) => {
    setSelectedAvatar(url);
    setPreviewUrl(url);
    setAvatarUrl("");
  };

  const handleSubmit = async () => {
    const finalUrl = selectedAvatar || avatarUrl;

    if (!finalUrl) {
      return;
    }

    setIsLoading(true);
    try {
      await onAvatarUpdate(finalUrl);
      onOpenChange(false);
      setAvatarUrl("");
      setSelectedAvatar(null);
      setPreviewUrl("");
    } catch (error) {
      console.error("Failed to update avatar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Changer la photo de profil</DialogTitle>
          <DialogDescription>
            Choisissez une image pour votre agent {agentName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="suggested" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="suggested">
              <ImageIcon className="h-4 w-4 mr-2" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              URL personnalisée
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggested" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez une image parmi nos suggestions
            </p>
            <div className="grid grid-cols-4 gap-3">
              {SUGGESTED_AVATARS.map((url, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggested(url)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    selectedAvatar === url
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Avatar option ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="avatar-url">URL de l'image</Label>
              <Input
                id="avatar-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={avatarUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Entrez l'URL d'une image (Unsplash, Pexels, etc.)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {previewUrl && (
          <div className="mt-4">
            <Label className="mb-2 block">Aperçu</Label>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-16 w-16 border-2 border-gray-200">
                <AvatarImage src={previewUrl} alt="Preview" />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <Bot className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{agentName}</p>
                <p className="text-sm text-muted-foreground">Nouvel avatar</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || (!selectedAvatar && !avatarUrl)}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
