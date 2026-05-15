import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ChevronDown, UserCheck, FileText, Bot, Brain, Lightbulb, Users, Shield, CheckCircle, MessageSquare, Send, Circle, CheckCircle2, Ban, Target, TrendingUp, BriefcaseBusiness, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { ScreeningSection } from './ScreeningSection';
import { SerenaAIInterviewSection } from './SerenaAIInterviewSection';
import { SerenaAIDetailView } from './SerenaAIDetailView';
import { CVAnalysisSection } from './CVAnalysisSection';
import { PsychometricSection } from './PsychometricSection';
import { BackgroundCheckSection } from './BackgroundCheckSection';
import { EvaluationsSection } from './EvaluationsSection';
import { MeetingsSection } from './MeetingsSection';
import { Comment } from '../../types/comments';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { CandidateData } from '../../data/candidatesData';
import { getStageStatus, getProgress } from '../../utils/candidateHelpers';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

type StageStatus = 'completed' | 'current' | 'pending' | 'rejected' | 'blocked';

interface StageCardProps {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  number: number;
  comments: Comment[];
  openCommentPanel?: (stageId: string) => void;
  hasContent?: boolean;
  status?: StageStatus;
  blockerReason?: string;
}

// Componente simple para etapas que solo tienen comentarios
// Componente StageCard eliminado para usar StageAccordion en todas las etapas

interface StageAccordionProps {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  iconColor?: string;
  number: number;
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
  comments: Comment[];
  addComment: (text: string, stageId: string, stageName: string, isPrivate: boolean) => void;
  editComment: (id: string, newText: string) => void;
  deleteComment: (id: string) => void;
  openCommentPanel: (stageId: string) => void;
  status?: StageStatus;
  blockerReason?: string;
  blockerAction?: {
    type: 'whatsapp' | 'email' | 'document' | 'edit_profile';
    label: string;
    message?: string;
  };
  candidate?: any;
  isValentina?: boolean;
  onEditProfile?: () => void;
}

function StageAccordion({ id, title, category, icon: Icon, iconColor = "text-blue-600", number, isOpen, onToggle, children, comments, addComment, editComment, deleteComment, openCommentPanel, status = 'completed', blockerReason, blockerAction, candidate, isValentina, onEditProfile }: StageAccordionProps) {
  const [commentText, setCommentText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  
  const stageComments = comments.filter(comment => comment.stageId === id);
  const hasContent = !!children || stageComments.length > 0;
  const canExpand = hasContent || showCommentInput;

  // Define colores según el estado
  const statusConfig = {
    completed: {
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      numberBg: 'bg-emerald-50',
      numberBorder: 'border-emerald-200',
      numberText: 'text-emerald-600',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      badge: <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300 bg-emerald-50">Completado</Badge>
    },
    current: {
      bgColor: 'bg-blue-50/30',
      borderColor: 'border-blue-300',
      numberBg: 'bg-gray-100',
      numberBorder: 'border-gray-300',
      numberText: 'text-gray-600',
      icon: <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse"></div>,
      badge: <Badge variant="outline" className="text-xs text-blue-700 border-blue-400 bg-blue-50">En progreso</Badge>
    },
    pending: {
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      numberBg: 'bg-gray-50',
      numberBorder: 'border-gray-200',
      numberText: 'text-gray-400',
      icon: <Circle className="w-4 h-4 text-gray-300" />,
      badge: <Badge variant="outline" className="text-xs text-gray-500">Pendiente</Badge>
    },
    rejected: {
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      numberBg: 'bg-gray-100',
      numberBorder: 'border-gray-200',
      numberText: 'text-gray-500',
      icon: <Ban className="w-4 h-4 text-gray-500" />,
      badge: <Badge variant="outline" className="text-xs text-red-700 border-red-300 bg-red-50">Descartado</Badge>
    },
    blocked: {
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      numberBg: 'bg-gray-100',
      numberBorder: 'border-gray-200',
      numberText: 'text-gray-500',
      icon: <AlertCircle className="w-4 h-4 text-gray-500 animate-pulse" />,
      badge: <Badge variant="outline" className="text-xs text-amber-700 border-amber-400 bg-amber-50">Acción requerida</Badge>
    }
  };

  const config = statusConfig[status];

  const handleAddComment = () => {
    if (isValentina) {
      toast.error('Por el momento no podemos registrar tu comentario o mensaje. Por favor, intenta más tarde.');
      return;
    }
    if (commentText.trim()) {
      addComment(commentText, id, title, isPrivate);
      setCommentText('');
      setIsPrivate(false);
      setShowCommentInput(false);
    }
  };

  return (
    <div className={cn("rounded-xl border overflow-hidden", config.bgColor, config.borderColor)}>
      {/* Accordion Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 p-4 sm:p-5">
        <div
          onClick={canExpand ? onToggle : undefined}
          className={cn(
            "flex-1 flex items-center gap-3 sm:gap-4 transition-opacity min-w-0",
            canExpand ? "hover:opacity-70 cursor-pointer" : "cursor-default"
          )}
        >
          <div className={cn("w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-full border-2 text-sm font-bold", config.numberBg, config.numberBorder, config.numberText)}>
            {(status === 'completed' || status === 'current' || status === 'rejected' || status === 'blocked') ? config.icon : number}
          </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                {title}
              </h3>
              {status === 'blocked' && blockerReason ? (
                <div className="mt-1">
                  <p className="text-xs text-amber-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{blockerReason}</span>
                  </p>
                  {/* Blocker action button — moved here for better responsive layout */}
                  {blockerAction && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isValentina && blockerAction?.type === 'edit_profile') {
                          onEditProfile?.();
                          return;
                        }
                        if (isValentina) {
                          toast.error('No es posible abrir WhatsApp en este momento. Inténtalo de nuevo en unos minutos.');
                          return;
                        }
                        if (blockerAction.type === 'whatsapp' && candidate?.phone) {
                          const phone = candidate.phone.replace(/[^0-9]/g, '');
                          const text = encodeURIComponent(blockerAction.message || '');
                          window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                        }
                      }}
                      className="w-fit h-7 px-2.5 mt-2 text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm border border-gray-200"
                    >
                      {blockerAction.type === 'whatsapp' && <WhatsAppIcon className="w-3 h-3" />}
                      {blockerAction.label}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {category}
                </p>
              )}
            </div>
          </div>
        
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Blocker action button — moved to title area */}
          {config.badge}
          {stageComments.length > 0 && (
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              {stageComments.length} {stageComments.length === 1 ? 'comentario' : 'comentarios'}
            </Badge>
          )}
          
          {/* Comment Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              const willShow = !showCommentInput;
              setShowCommentInput(willShow);
              if (willShow && !isOpen) {
                onToggle();
              }
            }}
            className={cn("flex-shrink-0", showCommentInput && "bg-blue-50 text-blue-600")}
            title="Agregar comentario"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>

          {/* Expand/Collapse Button */}
          {canExpand && (
            <button
              onClick={onToggle}
              className="flex-shrink-0 p-2 hover:opacity-70 transition-opacity"
            >
              <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
          )}
        </div>
      </div>

      {/* Comment Input Area - Shows when button is clicked */}
      {showCommentInput && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 sm:px-5 py-4">
          <div className="space-y-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario sobre esta etapa..."
              className="resize-none text-sm bg-white"
              rows={3}
              autoFocus
            />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                Privado
              </label>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowCommentInput(false);
                    setCommentText('');
                    setIsPrivate(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                  <Send className="w-4 h-4 mr-1" />
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accordion Content */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50">
          {children && (status === 'completed' || status === 'rejected') && (
            <div className="p-4 sm:p-6">
              {children}
            </div>
          )}
          
          
          {/* Existing Comments Display */}
          {stageComments.length > 0 && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4" />
                  Comentarios en esta etapa
                </h4>
                <div className="space-y-3">
                  {stageComments.map((comment) => (
                    <div key={comment.id} className="group/c bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                      {editingCommentId === comment.id ? (
                        // Edit mode
                        <div className="space-y-2">
                          <Textarea
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            className="resize-none text-sm bg-gray-50"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setEditingCommentId(null); setEditingText(''); }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              disabled={!editingText.trim()}
                              onClick={() => {
                                if (isValentina) {
                                  toast.error('Estamos presentando inconvenientes para actualizar la información. Inténtalo más tarde.');
                                  return;
                                }
                                if (editComment && editingText.trim()) {
                                  editComment(comment.id, editingText);
                                  setEditingCommentId(null);
                                  setEditingText('');
                                }
                              }}
                            >
                              Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Read mode
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {comment.authorInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.timestamp).toLocaleDateString('es-ES', { 
                                  day: 'numeric', 
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {comment.isPrivate && (
                                <Badge variant="outline" className="text-xs">Privado</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mt-1 break-words">{comment.text}</p>
                          </div>
                          {/* Edit / Delete actions */}
                          <div className={cn("flex items-center gap-1 transition-opacity flex-shrink-0", deletingCommentId === comment.id ? "opacity-100" : "opacity-0 group-hover/c:opacity-100")}>
                            {deletingCommentId === comment.id ? (
                              <div className="flex items-center gap-2 px-2 py-1 bg-red-50 rounded-md border border-red-100">
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">¿Eliminar?</span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isValentina) {
                                      toast.error('No se ha podido procesar la eliminación del comentario. Inténtalo de nuevo más tarde.');
                                      return;
                                    }
                                    if (deleteComment) deleteComment(comment.id);
                                    setDeletingCommentId(null);
                                  }}
                                  className="px-2 py-0.5 text-[10px] bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors"
                                >
                                  Sí
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDeletingCommentId(null);
                                  }}
                                  className="px-2 py-0.5 text-[10px] bg-white text-gray-600 rounded border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                {editComment && (
                                  <button
                                    onClick={(e) => { 
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setEditingCommentId(comment.id); 
                                      setEditingText(comment.text); 
                                    }}
                                    className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Editar comentario"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {deleteComment && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDeletingCommentId(comment.id);
                                    }}
                                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Eliminar comentario"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface StagesSectionProps {
  comments: Comment[];
  addComment: (text: string, stageId: string, stageName: string, isPrivate: boolean) => void;
  editComment?: (id: string, newText: string) => void;
  deleteComment?: (id: string) => void;
  openCommentPanel?: (stageId: string) => void;
  highlightedStageId?: string | null;
  activeApplication?: any;
  candidate?: any;
  isValentina?: boolean;
  selectedStageDetailId?: string | null;
  onDetailChange?: (id: string | null) => void;
  onEditProfile?: () => void;
}

export function StagesSection({ 
  comments, 
  addComment, 
  editComment, 
  deleteComment, 
  openCommentPanel, 
  highlightedStageId, 
  activeApplication, 
  candidate, 
  isValentina,
  selectedStageDetailId = null,
  onDetailChange,
  onEditProfile
}: StagesSectionProps) {
  const [openStages, setOpenStages] = useState<Set<string>>(new Set(['screening-talent']));
  const stageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Efecto para abrir automáticamente SOLO la etapa resaltada y hacer scroll
  React.useEffect(() => {
    if (highlightedStageId) {
      // Cerrar todas y abrir solo la resaltada
      setOpenStages(new Set([highlightedStageId]));
      
      // Hacer scroll a la etapa después de un pequeño delay para que se renderice
      setTimeout(() => {
        const element = stageRefs.current[highlightedStageId];
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [highlightedStageId]);

  const toggleStage = (stageId: string) => {
    setOpenStages(prev => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  };

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence) {
      case 'high':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceLabel = (confidence?: string) => {
    switch (confidence) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'N/A';
    }
  };

  // Calcular progreso y estados de etapas dinámicamente
  const candidateStatus = activeApplication?.status || 'active';
  const currentStage = candidateStatus === 'hired' ? 'seleccionado' : (activeApplication?.currentStage || 'evaluacion-cv');
  const progress = candidateStatus === 'hired' 
    ? 'Proceso Completado (100%)' 
    : candidateStatus === 'rejected'
      ? 'Proceso Finalizado'
      : getProgress(currentStage);
  
  // Definir estados dinámicos para cada etapa
  const stageStatuses = {
    'screening-talent': getStageStatus('screening-talent', currentStage, candidateStatus, activeApplication),
    'evaluacion-cv': getStageStatus('evaluacion-cv', currentStage, candidateStatus, activeApplication),
    'evaluacion-serena': getStageStatus('evaluacion-serena', currentStage, candidateStatus, activeApplication),
    'evaluacion-psicometrica': getStageStatus('evaluacion-psicometrica', currentStage, candidateStatus, activeApplication),
    'entrevista-tecnica': getStageStatus('entrevista-tecnica', currentStage, candidateStatus, activeApplication),
    'entrevista-pm': getStageStatus('entrevista-pm', currentStage, candidateStatus, activeApplication),
    'entrevista-hiring': getStageStatus('entrevista-hiring', currentStage, candidateStatus, activeApplication),
    'antecedentes': getStageStatus('antecedentes', currentStage, candidateStatus, activeApplication),
    'seleccionado': getStageStatus('seleccionado', currentStage, candidateStatus, activeApplication),
  };

  if (selectedStageDetailId === 'evaluacion-serena') {
    return (
      <SerenaAIDetailView 
        interviewData={activeApplication?.serenaInterview} 
        score={activeApplication?.scores?.serenaScore} 
        onBack={() => onDetailChange?.(null)}
        isValentina={isValentina}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Match Score Card */}
      {activeApplication && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-100">
                <BriefcaseBusiness className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Match con la Vacante</h2>
                <p className="text-sm text-gray-600">Análisis de compatibilidad para: {activeApplication.jobTitle || 'Vacante'}</p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConfidenceColor(
                activeApplication.confidence
              )}`}
            >
              Confianza: {getConfidenceLabel(activeApplication.confidence)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white rounded-full h-4 shadow-inner border border-gray-100">
              <div
                className="bg-gradient-to-r from-gray-600 to-blue-600 h-4 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                style={{ width: `${activeApplication.matchScore || 0}%` }}
              >
                {(activeApplication.matchScore || 0) >= 20 && (
                  <span className="text-[10px] font-bold text-white">{(activeApplication.matchScore || 0)}%</span>
                )}
              </div>
            </div>
            {(activeApplication.matchScore || 0) < 20 && (
              <span className="text-2xl font-bold text-blue-600">{(activeApplication.matchScore || 0)}%</span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>
              Este candidato tiene un <strong>excelente match</strong> con los requisitos de la
              vacante
            </span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Etapas del Proceso</h2>
        <p className="text-sm text-gray-600 mt-1">
          Gestiona todas las etapas del proceso de selección del candidato
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm" data-tour="stages-tracker">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Progreso del Reclutamiento</h3>
          <span className="text-xs text-gray-500">{progress}</span>
        </div>
        
        {/* Visual Progress Bar - Desktop: 1 fila, Mobile: 2 filas */}
        <div className="hidden sm:block">
          <div className="relative flex items-center justify-between gap-1">
            {/* Mapeo dinámico de etapas */}
            {[
              { id: 'screening-talent', label: 'Screening', number: 1 },
              { id: 'evaluacion-cv', label: 'CV', number: 2 },
              { id: 'evaluacion-serena', label: 'Serena IA', number: 3 },
              { id: 'evaluacion-psicometrica', label: 'Psico', number: 4 },
              { id: 'entrevista-tecnica', label: 'Ent. 1', number: 5 },
              { id: 'entrevista-pm', label: 'Ent. 2', number: 6 },
              { id: 'entrevista-hiring', label: 'Hiring', number: 7 },
              { id: 'antecedentes', label: 'Antec.', number: 8 },
              { id: 'seleccionado', label: 'Selecc.', number: 9 },
            ].map((stage, idx, arr) => {
              const status = getStageStatus(stage.id, currentStage, candidateStatus, activeApplication);
              
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              const isPending = status === 'pending';
              const isRejected = status === 'rejected';
              const isBlocked = status === 'blocked';
              
              const lineCompleted = isCompleted || isRejected;
              const lineColor = isRejected ? 'bg-red-300' : isBlocked ? 'bg-amber-300' : lineCompleted ? 'bg-emerald-300' : 'bg-gray-200';
              
              return (
                <div key={stage.id} className="contents">
                  {/* Stage Circle */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center mb-1.5 relative z-10",
                      isCompleted && "bg-emerald-50 border-2 border-emerald-500",
                      isCurrent && "bg-blue-50 border-2 border-blue-500",
                      isPending && "bg-gray-50 border-2 border-gray-200",
                      isRejected && "bg-red-50 border-2 border-red-500",
                      isBlocked && "bg-amber-50 border-2 border-amber-500"
                    )}>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {isCurrent && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>}
                      {isPending && <span className="text-[10px] text-gray-400 font-medium">{stage.number}</span>}
                      {isRejected && <Ban className="w-4 h-4 text-red-600" />}
                      {isBlocked && <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />}
                    </div>
                    <span className={cn(
                      "text-[9px] text-center whitespace-nowrap",
                      isCompleted && "text-emerald-600 font-medium",
                      isCurrent && "text-blue-600 font-medium",
                      isPending && "text-gray-400",
                      isRejected && "text-red-600 font-medium",
                      isBlocked && "text-amber-600 font-medium"
                    )}>
                      {stage.label}
                    </span>
                  </div>
                  
                  {/* Connector Line */}
                  {idx < arr.length - 1 && (
                    <div 
                      className={cn("h-0.5 flex-1 rounded-full self-start", lineColor)}
                      style={{ marginTop: '13.5px' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Progress Bar - Mobile: 2 filas de 4 etapas */}
        <div className="block sm:hidden space-y-4">
          {/* Primera fila: 4 etapas */}
          <div className="relative flex items-center justify-between gap-1">
            {[
              { id: 'screening-talent', label: 'Screening', number: 1 },
              { id: 'evaluacion-cv', label: 'CV', number: 2 },
              { id: 'evaluacion-serena', label: 'Serena', number: 3 },
              { id: 'evaluacion-psicometrica', label: 'Psico', number: 4 },
              { id: 'entrevista-tecnica', label: 'Ent. 1', number: 5 },
            ].map((stage, idx, arr) => {
              const status = getStageStatus(stage.id, currentStage, candidateStatus, activeApplication);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              const isPending = status === 'pending';
              const isRejected = status === 'rejected';
              const isBlocked = status === 'blocked';
              
              const lineCompleted = isCompleted || isRejected;
              const lineColor = isRejected ? 'bg-red-300' : isBlocked ? 'bg-amber-300' : lineCompleted ? 'bg-emerald-300' : 'bg-gray-200';
              
              return (
                <div key={stage.id} className="contents">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center mb-1.5 relative z-10",
                      isCompleted && "bg-emerald-50 border-2 border-emerald-500",
                      isCurrent && "bg-blue-50 border-2 border-blue-500",
                      isPending && "bg-gray-50 border-2 border-gray-200",
                      isRejected && "bg-red-50 border-2 border-red-500",
                      isBlocked && "bg-amber-50 border-2 border-amber-500"
                    )}>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {isCurrent && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>}
                      {isPending && <span className="text-[10px] text-gray-400 font-medium">{stage.number}</span>}
                      {isRejected && <Ban className="w-4 h-4 text-red-600" />}
                      {isBlocked && <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />}
                    </div>
                    <span className={cn(
                      "text-[9px] text-center whitespace-nowrap",
                      isCompleted && "text-emerald-600 font-medium",
                      isCurrent && "text-blue-600 font-medium",
                      isPending && "text-gray-400",
                      isRejected && "text-red-600 font-medium",
                      isBlocked && "text-amber-600 font-medium"
                    )}>
                      {stage.label}
                    </span>
                  </div>
                  
                  {idx < arr.length - 1 && (
                    <div 
                      className={cn("h-0.5 flex-1 rounded-full self-start", lineColor)}
                      style={{ marginTop: '13.5px' }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Segunda fila: 4 etapas */}
          <div className="relative flex items-center justify-between gap-1">
            {[
              { id: 'entrevista-pm', label: 'Ent. 2', number: 6 },
              { id: 'entrevista-hiring', label: 'Hiring', number: 7 },
              { id: 'antecedentes', label: 'Antec.', number: 8 },
              { id: 'seleccionado', label: 'Selecc.', number: 9 },
            ].map((stage, idx, arr) => {
              const status = getStageStatus(stage.id, currentStage, candidateStatus, activeApplication);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              const isPending = status === 'pending';
              const isRejected = status === 'rejected';
              const isBlocked = status === 'blocked';
              
              const lineCompleted = isCompleted || isRejected;
              const lineColor = isRejected ? 'bg-red-300' : isBlocked ? 'bg-amber-300' : lineCompleted ? 'bg-emerald-300' : 'bg-gray-200';
              
              return (
                <div key={stage.id} className="contents">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center mb-1.5 relative z-10",
                      isCompleted && "bg-emerald-50 border-2 border-emerald-500",
                      isCurrent && "bg-blue-50 border-2 border-blue-500",
                      isPending && "bg-gray-50 border-2 border-gray-200",
                      isRejected && "bg-red-50 border-2 border-red-500",
                      isBlocked && "bg-amber-50 border-2 border-amber-500"
                    )}>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {isCurrent && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>}
                      {isPending && <span className="text-[10px] text-gray-400 font-medium">{stage.number}</span>}
                      {isRejected && <Ban className="w-4 h-4 text-red-600" />}
                      {isBlocked && <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />}
                    </div>
                    <span className={cn(
                      "text-[9px] text-center whitespace-nowrap",
                      isCompleted && "text-emerald-600 font-medium",
                      isCurrent && "text-blue-600 font-medium",
                      isPending && "text-gray-400",
                      isRejected && "text-red-600 font-medium",
                      isBlocked && "text-amber-600 font-medium"
                    )}>
                      {stage.label}
                    </span>
                  </div>
                  
                  {idx < arr.length - 1 && (
                    <div 
                      className={cn("h-0.5 flex-1 rounded-full self-start", lineColor)}
                      style={{ marginTop: '13.5px' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {[
        { id: 'screening-talent', title: 'Screening con Talent Acquisition', category: 'Filtro Inicial', icon: UserCheck, iconColor: "text-gray-500", number: 1, children: null },
        { id: 'evaluacion-cv', title: 'Evaluación CV', category: 'Filtro Inicial', icon: FileText, iconColor: "text-gray-500", number: 2, children: <CVAnalysisSection data={activeApplication?.cvEvaluation} candidateName={candidate.name} /> },
        { id: 'evaluacion-serena', title: 'Entrevista Serena IA', category: 'Filtro Inicial', icon: Bot, iconColor: "text-gray-500", number: 3, children: <SerenaAIInterviewSection interviewData={activeApplication?.serenaInterview} score={activeApplication?.scores?.serenaScore} isValentina={isValentina} /> },
        { id: 'evaluacion-psicometrica', title: 'Evaluación Psicométrica', category: 'Evaluación', icon: Brain, iconColor: "text-gray-500", number: 4, children: <PsychometricSection evaluation={activeApplication?.psychometricEvaluation} isValentina={isValentina} /> },
        { id: 'entrevista-tecnica', title: 'Entrevista Técnica', category: 'Entrevista', icon: UserCheck, iconColor: "text-gray-500", number: 5, children: null },
        { id: 'entrevista-pm', title: 'Entrevista con PM', category: 'Entrevista', icon: Lightbulb, iconColor: "text-gray-500", number: 6, children: null },
        { id: 'entrevista-hiring', title: 'Entrevista con Hiring Manager', category: 'Entrevista', icon: Users, iconColor: "text-gray-500", number: 7, children: null },
        { id: 'antecedentes', title: 'Verificación de Antecedentes', category: 'Validación', icon: Shield, iconColor: "text-gray-500", number: 8, children: <BackgroundCheckSection data={activeApplication?.backgroundCheck} isValentina={isValentina} /> },
        { id: 'seleccionado', title: 'Seleccionado', category: 'Final', icon: CheckCircle, iconColor: "text-gray-500", number: 9, children: <div className="bg-white border border-gray-200 rounded-lg p-5"><p className="text-sm text-gray-700">¡Candidato seleccionado para la oferta! El proceso ha finalizado exitosamente.</p></div> }
      ].map((stage) => (
        <div key={stage.id} ref={(el) => (stageRefs.current[stage.id] = el)}>
          <StageAccordion
            id={stage.id}
            title={stage.title}
            category={stage.category}
            icon={stage.icon}
            iconColor={stage.iconColor}
            number={stage.number}
            isOpen={openStages.has(stage.id)}
            onToggle={() => {
              if (stage.id === 'evaluacion-serena') {
                onDetailChange?.('evaluacion-serena');
              } else {
                toggleStage(stage.id);
              }
            }}
            comments={comments}
            addComment={addComment}
            editComment={editComment}
            deleteComment={deleteComment}
            openCommentPanel={openCommentPanel}
            status={stageStatuses[stage.id as keyof typeof stageStatuses]}
            blockerReason={activeApplication?.blocker?.stageId === stage.id ? activeApplication.blocker.reason : undefined}
            blockerAction={activeApplication?.blocker?.stageId === stage.id ? activeApplication.blocker.action : undefined}
            candidate={candidate}
            isValentina={isValentina}
            onEditProfile={onEditProfile}
          >
            {stage.children}
          </StageAccordion>
        </div>
      ))}
    </div>
  );
}