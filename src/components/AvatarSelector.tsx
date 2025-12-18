import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface AvatarSelectorProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  agentName: string;
}

// Collection d'avatars africains suggérés (pravatar.cc)
// Indices sélectionnés pour représenter la diversité africaine
const AFRICAN_AVATAR_SUGGESTIONS = [
  1, 5, 8, 12, 15, 18, 21, 24, 28, 31,
  34, 38, 41, 44, 47, 51, 54, 57, 60, 63,
  66, 69
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatar,
  onAvatarChange,
  agentName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'upload'>('suggestions');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (index: number) => {
    const avatarUrl = `https://i.pravatar.cc/300?img=${index}`;
    setSelectedAvatar(avatarUrl);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (selectedAvatar) {
      onAvatarChange(selectedAvatar);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setSelectedAvatar(currentAvatar || '');
    setUploadedImage(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="group relative">
          <Avatar className="h-24 w-24 border-4 border-white/20 group-hover:border-purple-500 transition-all cursor-pointer">
            <AvatarImage src={currentAvatar} alt={agentName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
              {agentName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="text-white" size={24} />
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Choisir un avatar
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'suggestions' | 'upload')}>
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            <TabsTrigger
              value="suggestions"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400"
            >
              Avatars suggérés
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400"
            >
              Importer une photo
            </TabsTrigger>
          </TabsList>

          {/* Avatars Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <p className="text-sm text-gray-400">
              Sélectionnez un avatar parmi notre collection d'avatars africains diversifiés
            </p>

            <div className="grid grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {AFRICAN_AVATAR_SUGGESTIONS.map((index) => {
                const avatarUrl = `https://i.pravatar.cc/300?img=${index}`;
                const isSelected = selectedAvatar === avatarUrl;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAvatarSelect(index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    <div className={`
                      relative rounded-full overflow-hidden border-4 transition-all
                      ${isSelected ? 'border-purple-500' : 'border-white/20 group-hover:border-white/40'}
                    `}>
                      <img
                        src={avatarUrl}
                        alt={`Avatar ${index}`}
                        className="w-full h-full object-cover aspect-square"
                      />

                      {/* Selection Indicator */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 bg-purple-500/50 flex items-center justify-center"
                          >
                            <Check className="text-white" size={24} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {uploadedImage ? (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded avatar"
                    className="w-48 h-48 rounded-full object-cover border-4 border-purple-500"
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setSelectedAvatar(currentAvatar || '');
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2 hover:bg-red-600 transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-48 h-48 rounded-full border-4 border-dashed border-white/20 hover:border-purple-500 transition-all flex flex-col items-center justify-center space-y-2 group"
                >
                  <Upload size={48} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                  <span className="text-gray-400 group-hover:text-white transition-colors text-sm">
                    Cliquez pour importer
                  </span>
                </button>
              )}

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-400">
                  Formats acceptés : JPG, PNG, WEBP
                </p>
                <p className="text-xs text-gray-500">
                  Taille maximale : 5MB
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedAvatar}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
