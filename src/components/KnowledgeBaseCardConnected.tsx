import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen, Upload, CircleDashed, ArrowRight, File, Database,
  Eye, Download, Trash2, ChevronUp, CheckCircle2, BarChart, FileText,
  Globe, Type, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { uploadDocument, fetchAgentDocuments, deleteDocument } from "@/services/agentService";

interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  status: string;
  uploaded_at: string;
  num_chunks?: number;
}

interface KnowledgeBaseCardConnectedProps {
  agentId: string;
}

export const KnowledgeBaseCardConnected: React.FC<KnowledgeBaseCardConnectedProps> = ({ agentId }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [agentId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await fetchAgentDocuments(agentId);
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        toast({
          title: "Upload en cours...",
          description: `Envoi de ${file.name}`,
        });

        await uploadDocument(agentId, file);
      }

      toast({
        title: "✅ Upload réussi !",
        description: `${files.length} document(s) uploadé(s) avec succès`,
      });

      // Reload documents
      await loadDocuments();
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader certains fichiers",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      return;
    }

    try {
      await deleteDocument(agentId, documentId);

      toast({
        title: "✅ Document supprimé",
        description: "Le document a été supprimé avec succès",
      });

      // Reload documents
      await loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const status = documents.length === 0 ? "not-started" : "in-progress";
  const progress = documents.length > 0 ? 100 : 0;

  return (
    <div className="rounded-lg overflow-hidden mb-6 border border-gray-200 dark:border-gray-800">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 w-8 h-8 text-gray-900 dark:text-white">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Knowledge Base</h3>
            <Badge variant="outline" className={
              documents.length === 0
                ? "bg-gray-500/20 text-gray-500 dark:text-gray-400 border-gray-500/30"
                : "bg-green-500/20 text-green-500 dark:text-green-400 border-green-500/30"
            }>
              {documents.length === 0 ? "Not Started" : `${documents.length} document(s)`}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {documents.length > 0 && <span className="text-sm text-gray-500 dark:text-gray-400">100%</span>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              <ChevronUp className={`h-5 w-5 ${!isExpanded ? 'transform rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Ajoutez des documents pour enrichir les connaissances de votre agent
        </p>

        {documents.length > 0 && (
          <Progress
            value={progress}
            className="h-1.5 mb-6 [&>div]:bg-green-500"
          />
        )}

        {isExpanded && (
          <>
            {isLoading ? (
              <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800 rounded-lg p-8 mb-8 text-center">
                <Loader2 className="h-12 w-12 text-gray-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">Chargement des documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800 rounded-lg p-8 mb-8 text-center">
                <Database className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Aucun document encore
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Uploadez des documents (PDF, DOCX, TXT) pour créer la base de connaissances de votre agent.
                </p>
                <Button
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white gap-2"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Documents
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-800/30 p-6 rounded-lg border border-gray-200 dark:border-gray-800/50 flex flex-col">
                    <div className="flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400">
                      <File className="h-4 w-4" />
                      <span className="text-xs font-medium">Documents</span>
                    </div>
                    <div className="flex items-end justify-between mt-auto">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">{documents.length}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Fichiers</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/30 p-6 rounded-lg border border-gray-200 dark:border-gray-800/50 flex flex-col">
                    <div className="flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-medium">Status</span>
                    </div>
                    <div className="flex items-end justify-between mt-auto">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">Prêt</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Traité</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/30 p-6 rounded-lg border border-gray-200 dark:border-gray-800/50 flex flex-col">
                    <div className="flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400">
                      <BarChart className="h-4 w-4" />
                      <span className="text-xs font-medium">Chunks</span>
                    </div>
                    <div className="flex items-end justify-between mt-auto">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {documents.reduce((sum, doc) => sum + (doc.num_chunks || 0), 0)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Total</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Documents</h4>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">{doc.original_filename}</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {doc.file_type.toUpperCase()} • {formatFileSize(doc.file_size)} • {formatDate(doc.uploaded_at)}
                              {doc.num_chunks && ` • ${doc.num_chunks} chunks`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            doc.status === "completed"
                              ? "bg-green-500/20 text-green-600"
                              : doc.status === "processing"
                              ? "bg-yellow-500/20 text-yellow-600"
                              : "bg-gray-500/20 text-gray-600"
                          }>
                            {doc.status === "completed" ? "✓ Traité" : doc.status === "processing" ? "En cours..." : "En attente"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/30 p-6 rounded-lg mb-6 border border-gray-200 dark:border-gray-800">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Ajouter plus de documents</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Enrichissez la base de connaissances en ajoutant plus de fichiers
                  </p>

                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Documents
                      </>
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
