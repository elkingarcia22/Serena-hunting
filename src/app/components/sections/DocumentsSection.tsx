import React, { useRef } from 'react';
import { FileText, Upload, Download, Eye, Trash2, Plus, X, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { cn } from '../ui/utils';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedDate: string;
  uploadedBy: string;
}

interface DocumentsSectionProps {
  documents?: Document[];
  onUploadTrigger?: () => void;
  triggerUpload?: boolean;
  isValentina?: boolean;
}

export function DocumentsSection({ documents: initialDocuments = [], onUploadTrigger, triggerUpload, isValentina }: DocumentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [documents, setDocuments] = React.useState<Document[]>(initialDocuments);
  const [deletingDocumentId, setDeletingDocumentId] = React.useState<string | null>(null);

  const isCV = (doc: Document) => {
    const name = doc.name.toLowerCase();
    return name.includes('cv') || name.includes('hv') || name.includes('curriculum') || name.includes('resume');
  };

  // Sync state with props when candidate changes
  React.useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isValentina) {
      toast.error('Estamos presentando inconvenientes técnicos y no podemos procesar el archivo en este momento. Inténtalo más tarde.');
      return;
    }
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newDocument: Document = {
        id: `${Date.now()}`,
        name: file.name,
        type: 'Documento',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        uploadedBy: 'Usuario actual',
      };
      setDocuments([...documents, newDocument]);
      toast.success(`Documento "${file.name}" cargado exitosamente`);
      // Resetear el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = (doc: Document) => {
    if (isValentina) {
      toast.error('Por el momento no podemos descargar el archivo, inténtalo más tarde.');
      return;
    }
    toast.success(`Descargando ${doc.name}...`);
    console.log('Download document:', doc.id);
  };

  const handleView = (doc: Document) => {
    if (isValentina) {
      toast.error('Estamos presentando inconvenientes para visualizar el documento. Por favor, inténtalo más tarde.');
      return;
    }
    toast.success(`Abriendo ${doc.name}...`);
    console.log('View document:', doc.id);
  };

  const handleDelete = (doc: Document) => {
    if (isValentina) {
      toast.error('No se ha podido procesar la eliminación del documento. Inténtalo de nuevo más tarde.');
      return;
    }
    setDocuments(documents.filter(d => d.id !== doc.id));
    toast.success(`Documento "${doc.name}" eliminado`);
  };

  // Exponer el handleUploadClick al padre
  React.useEffect(() => {
    if (onUploadTrigger) {
      // Guardar la función en un elemento del DOM para acceder desde el padre
      (window as any).__triggerDocumentUpload = handleUploadClick;
    }
    return () => {
      delete (window as any).__triggerDocumentUpload;
    };
  }, [onUploadTrigger]);

  // Manejar el triggerUpload
  React.useEffect(() => {
    if (triggerUpload) {
      handleUploadClick();
    }
  }, [triggerUpload]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            {documents.length}
          </span>
        </div>
        <Button
          onClick={handleUploadClick}
          size="sm"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Agregar documento
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Documentos */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {doc.name}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                  {doc.type}
                </span>
                <span>{doc.size}</span>
                <span>•</span>
                <span>{doc.uploadedDate}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Subido por: <span className="font-medium">{doc.uploadedBy}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {deletingDocumentId === doc.id ? (
                <div className="flex items-center gap-2 px-2 py-1 bg-red-50 rounded-md border border-red-100">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">¿Eliminar?</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(doc);
                      setDeletingDocumentId(null);
                    }}
                    className="px-2 py-0.5 text-[10px] bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors"
                  >
                    Sí
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeletingDocumentId(null);
                    }}
                    className="px-2 py-0.5 text-[10px] bg-white text-gray-600 rounded border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleView(doc)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver documento"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {isCV(doc) ? (
                    <button
                      onClick={handleUploadClick}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Actualizar hoja de vida"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeletingDocumentId(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {documents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            No hay documentos
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            Agrega documentos relacionados con el candidato
          </p>
          <Button
            onClick={handleUploadClick}
            size="sm"
            variant="outline"
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Agregar primer documento
          </Button>
        </div>
      )}
    </div>
  );
}