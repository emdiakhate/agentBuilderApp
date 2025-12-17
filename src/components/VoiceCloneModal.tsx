import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface VoiceCloneModalProps {
  open: boolean;
  onClose: () => void;
  onCloneComplete?: (voice: any) => void;
}

type CloneStep = 'upload' | 'processing' | 'complete' | 'error';

export const VoiceCloneModal: React.FC<VoiceCloneModalProps> = ({
  open,
  onClose,
  onCloneComplete
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<CloneStep>('upload');
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clonedVoice, setClonedVoice] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file count
    if (files.length + audioFiles.length > 25) {
      toast({
        title: "Trop de fichiers",
        description: "Vous pouvez uploader maximum 25 fichiers audio.",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes
    const maxSize = 25 * 1024 * 1024; // 25MB
    const invalidFiles = files.filter(f => f.size > maxSize);

    if (invalidFiles.length > 0) {
      toast({
        title: "Fichiers trop volumineux",
        description: `${invalidFiles.length} fichier(s) dépassent 25MB.`,
        variant: "destructive",
      });
      return;
    }

    setAudioFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalDuration = () => {
    // Estimation based on file sizes (rough estimate)
    const totalSize = audioFiles.reduce((sum, file) => sum + file.size, 0);
    const estimatedSeconds = (totalSize / 1024 / 1024) * 60; // Rough estimate
    return Math.floor(estimatedSeconds / 60);
  };

  const startCloning = async () => {
    if (!voiceName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer un nom pour la voix.",
        variant: "destructive",
      });
      return;
    }

    if (audioFiles.length === 0) {
      toast({
        title: "Fichiers requis",
        description: "Veuillez uploader au moins un fichier audio.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', voiceName);
      if (voiceDescription) {
        formData.append('description', voiceDescription);
      }

      audioFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:8000/api/voice-library/voices/clone', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Erreur lors du clonage');
      }

      setClonedVoice(result.voice);
      setStep('complete');

      toast({
        title: "Voix clonée avec succès!",
        description: `La voix "${voiceName}" a été créée.`,
      });

      if (onCloneComplete) {
        onCloneComplete(result.voice);
      }
    } catch (err: any) {
      console.error('Cloning error:', err);
      setError(err.message || 'Erreur lors du clonage de la voix');
      setStep('error');

      toast({
        title: "Erreur de clonage",
        description: err.message || 'Une erreur est survenue lors du clonage.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setStep('upload');
    setVoiceName('');
    setVoiceDescription('');
    setAudioFiles([]);
    setClonedVoice(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cloner une Voix</DialogTitle>
          <DialogDescription>
            Clone a voice to your library and use it for any assistant.
          </DialogDescription>
        </DialogHeader>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="voice-name">
                Nom de la Voix <span className="text-red-500">*</span>
              </Label>
              <Input
                id="voice-name"
                placeholder="Ex: Ma voix personnalisée"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-description">Description de la Voix</Label>
              <Textarea
                id="voice-description"
                placeholder="Describe the voice to be cloned here..."
                value={voiceDescription}
                onChange={(e) => setVoiceDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>
                Fichiers Audio <span className="text-red-500">*</span>
              </Label>

              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag and drop audio files here or click to select files locally.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    (Max 10MB per file)
                  </p>
                </label>
              </div>

              {audioFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Fichiers sélectionnés ({audioFiles.length}) - Durée estimée: ~{getTotalDuration()} min
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {audioFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm">🎵</span>
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">Exigences pour un clonage optimal :</h4>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Au moins 1 minute d'audio total</li>
                  <li>• Qualité audio claire (pas de bruit de fond)</li>
                  <li>• Voix naturelle et expressive</li>
                  <li>• Formats supportés : MP3, WAV, M4A</li>
                  <li>• Taille max par fichier : 25MB</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={startCloning}
                disabled={!voiceName.trim() || audioFiles.length === 0}
              >
                Cloner la Voix
              </Button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="space-y-6 py-8 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Clonage en cours...</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cela peut prendre quelques minutes. Veuillez patienter.
              </p>
            </div>

            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm">Upload des fichiers</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm">Analyse de la voix</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded opacity-50">
                <div className="h-5 w-5 rounded-full border-2" />
                <span className="text-sm">Génération du modèle</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded opacity-50">
                <div className="h-5 w-5 rounded-full border-2" />
                <span className="text-sm">Finalisation</span>
              </div>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="space-y-6 py-8 text-center">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Voix clonée avec succès !</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Votre voix personnalisée est maintenant disponible dans votre bibliothèque.
              </p>
            </div>

            {clonedVoice && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left max-w-md mx-auto">
                <h4 className="font-semibold mb-2">{clonedVoice.name || voiceName}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  ID: {clonedVoice.id}
                </p>
                {voiceDescription && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {voiceDescription}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" onClick={resetForm}>
                Cloner une autre voix
              </Button>
              <Button onClick={handleClose}>
                Terminé
              </Button>
            </div>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <div className="space-y-6 py-8 text-center">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Erreur de clonage</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {error || 'Une erreur est survenue lors du clonage de la voix.'}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={() => setStep('upload')}>
                Réessayer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
