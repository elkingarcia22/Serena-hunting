import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, List, ArrowUpDown, Sparkles, Send, MessageSquare, Activity, CheckSquare, ChevronLeft, ChevronRight, ChevronDown, Check, Pencil, Trash2, Save, X as XIcon, ExternalLink, AlertCircle, Mail, MessageCircle, ArrowRight, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { SerenaCopilotCard } from './SerenaCopilotCard';
import { ActivityItem } from './ActivityItem';
import { ToDoItem } from './ToDoItem';
import { ToDoTab } from './ToDoTab';
import { ScorecardScale } from './ScorecardScale';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Tooltip } from './ui/tooltip';
import { cn } from './ui/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Comment } from '../types/comments';
import { Task } from './CandidateDetailDrawer';
import { CandidateData } from '../data/candidatesData';
import { generateActivities, generateSerenaInsights } from '../utils/candidateHelpers';

interface ActivityHubPanelProps {
  comments: Comment[];
  addComment?: (text: string, stageId: string, stageName: string, isPrivate: boolean) => void;
  editComment?: (id: string, text: string) => void;
  deleteComment?: (id: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  selectedStage?: string;
  onStageChange?: (stage: string) => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  isCreatingTask?: boolean;
  onCreatingTaskChange?: (isCreating: boolean) => void;
  focusTaskNameInput?: boolean;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  highlightedTaskId?: string | null;
  setHighlightedTaskId?: React.Dispatch<React.SetStateAction<string | null>>;
  onNavigateToSection?: (section: string) => void;
  setHighlightedStageId?: React.Dispatch<React.SetStateAction<string | null>>;
  candidate?: CandidateData; // Agregar candidato como prop
}

export function ActivityHubPanel({ 
  comments, 
  addComment,
  editComment,
  deleteComment,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  selectedStage: externalSelectedStage,
  onStageChange: externalOnStageChange,
  isCollapsed: externalIsCollapsed,
  onCollapsedChange: externalOnCollapsedChange,
  isCreatingTask: externalIsCreatingTask,
  onCreatingTaskChange: externalOnCreatingTaskChange,
  focusTaskNameInput: externalFocusTaskNameInput,
  tasks,
  setTasks,
  highlightedTaskId,
  setHighlightedTaskId,
  onNavigateToSection,
  setHighlightedStageId,
  candidate,
}: ActivityHubPanelProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ from: 'user' | 'ai', text: string }>>([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [expandedActivityGroups, setExpandedActivityGroups] = useState<Set<string>>(new Set(['Hoy']));
  const [newCommentText, setNewCommentText] = useState('');
  const [isPrivateComment, setIsPrivateComment] = useState(false);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const [activitySortOrder, setActivitySortOrder] = useState('recent');
  const [isActivityFiltersOpen, setIsActivityFiltersOpen] = useState(false);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([]);
  const [selectedActivityStatuses, setSelectedActivityStatuses] = useState<string[]>([]);
  const [selectedActivityActors, setSelectedActivityActors] = useState<string[]>([]);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [successActions, setSuccessActions] = useState<Set<string>>(new Set());
  const [localActivities, setLocalActivities] = useState<any[]>([]);
  
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleActivityGroup = (groupDay: string) => {
    setExpandedActivityGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupDay)) {
        next.delete(groupDay);
      } else {
        next.add(groupDay);
      }
      return next;
    });
  };
  
  // Filtrar y ordenar actividades
  const getFilteredActivityData = () => {
    let filteredData = activityData.map(group => {
      // Filtrar eventos por tipo
      let filteredEvents = group.events.filter(event => {
        // Filtro por tipo (Select dropdown)
        if (activityTypeFilter !== 'all') {
          if (activityTypeFilter === 'communications' && !['email', 'message'].includes(event.eventType)) {
            return false;
          }
          if (activityTypeFilter === 'interviews' && !['interview', 'meeting'].includes(event.eventType)) {
            return false;
          }
          if (activityTypeFilter === 'evaluations' && event.eventType !== 'evaluation') {
            return false;
          }
          if (activityTypeFilter === 'system' && !['system', 'stage', 'trigger'].includes(event.eventType)) {
            return false;
          }
        }
        
        // Filtro por tipos específicos (Panel de filtros)
        if (selectedActivityTypes.length > 0) {
          if (!selectedActivityTypes.includes(event.eventType)) {
            return false;
          }
        }
        
        // Filtro por estado (Panel de filtros)
        if (selectedActivityStatuses.length > 0) {
          if (!selectedActivityStatuses.includes(event.status)) {
            return false;
          }
        }
        
        // Filtro por actor (Panel de filtros)
        if (selectedActivityActors.length > 0) {
          if (!selectedActivityActors.includes(event.actor.type)) {
            return false;
          }
        }
        
        // Filtro por búsqueda
        if (activitySearchQuery.trim()) {
          const query = activitySearchQuery.toLowerCase();
          const searchableText = [
            event.title,
            event.description,
            event.actor.name,
          ].join(' ').toLowerCase();
          
          if (!searchableText.includes(query)) {
            return false;
          }
        }
        
        return true;
      });
      
      return {
        ...group,
        events: filteredEvents,
      };
    }).filter(group => group.events.length > 0); // Solo grupos con eventos
    
    // Ordenar por fecha
    if (activitySortOrder === 'oldest') {
      filteredData = [...filteredData].reverse();
    }
    
    return filteredData;
  };
  
  // Usar estado externo si se proporciona, de lo contrario usar estado interno
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : 'serena';
  const setActiveTab = (tab: string) => {
    if (externalOnTabChange) {
      externalOnTabChange(tab);
    }
  };
  
  const newCommentStage = externalSelectedStage !== undefined ? externalSelectedStage : 'general';
  const setNewCommentStage = (stage: string) => {
    if (externalOnStageChange) {
      externalOnStageChange(stage);
    }
  };

  // Enfocar textarea cuando se abre la pestaña de comentarios
  useEffect(() => {
    if (activeTab === 'comments' && commentTextareaRef.current) {
      // Pequeño delay para asegurar que el contenido del tab esté renderizado
      setTimeout(() => {
        commentTextareaRef.current?.focus();
        // Hacer scroll al textarea si es necesario
        commentTextareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }, [activeTab]);
  
  // También enfocar cuando cambia la etapa mientras ya estamos en el tab de comentarios
  useEffect(() => {
    if (activeTab === 'comments' && commentTextareaRef.current) {
      setTimeout(() => {
        commentTextareaRef.current?.focus();
      }, 100);
    }
  }, [newCommentStage, activeTab]);
  
  const [todos, setTodos] = useState([
    {
      id: '1',
      title: 'Agendar entrevista de caso en julio',
      completed: false,
      owner: { name: 'Sarah Johnson' },
      dueDate: '28 Feb 2026',
    },
    {
      id: '2',
      title: 'Enviar prueba técnica',
      completed: false,
      owner: { name: 'Mike Chen' },
    },
    {
      id: '3',
      title: 'Solicitar referencias',
      completed: true,
      owner: { name: 'Sarah Johnson' },
      dueDate: '20 Feb 2026',
    },
  ]);

  const [scorecardScores, setScorecardScores] = useState<Record<string, number>>({
    technical: 0,
    communication: 0,
    culture: 0,
  });

  const handleTodoToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // Agregar mensaje de usuario
    const userMessage = {
      from: 'user' as const,
      text: chatInput,
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAITyping(true);
    
    // Simular respuesta de IA
    setTimeout(() => {
      const aiResponse = {
        from: 'ai' as const,
        text: getMockAIResponse(chatInput),
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsAITyping(false);
    }, 1500);
  };
  const handleExecuteAction = (actionId: string, label: string) => {
    setExecutingAction(actionId);
    
    // Simular tiempo de ejecución
    setTimeout(() => {
      setExecutingAction(null);
      setSuccessActions(prev => new Set(prev).add(actionId));
      
      // Agregar a actividad local
      const newActivity = {
        id: `local-${Date.now()}`,
        title: label,
        description: `Serena IA ejecutó la acción: ${label}`,
        timestamp: 'Ahora mismo',
        eventType: actionId.includes('email') ? 'email' : actionId.includes('whatsapp') ? 'message' : 'system',
        status: 'success',
        actor: { name: 'Serena IA', type: 'ai' as const, avatar: null }
      };
      
      setLocalActivities(prev => [newActivity, ...prev]);
      
      // Limpiar éxito después de 3 segundos
      setTimeout(() => {
        setSuccessActions(prev => {
          const next = new Set(prev);
          next.delete(actionId);
          return next;
        });
      }, 3000);
    }, 1500);
  };

  const getMockAIResponse = (question: string) => {
    const q = question.toLowerCase();
    if (q.includes('experiencia') || q.includes('experience')) {
      return 'Mateo Sánchez cuenta con 3 años de experiencia en desarrollo backend. Ha trabajado principalmente con Node.js, Express, Python, MongoDB y PostgreSQL. Su perfil es junior-mid con una progresión sólida en roles técnicos.';
    }
    if (q.includes('debilidades') || q.includes('weakness')) {
      return 'Según el análisis del CV, Mateo está en fase de crecimiento como desarrollador. Tiene buena base técnica pero podría fortalecer su experiencia en arquitecturas más complejas y liderazgo técnico. Es un perfil junior-mid con potencial de desarrollo.';
    }
    if (q.includes('salario') || q.includes('salary')) {
      return 'Según el análisis de CV, la expectativa salarial de Mateo está alineada con el presupuesto del rol. Se encuentra en un rango competitivo para un desarrollador backend junior-mid con 3 años de experiencia.';
    }
    if (q.includes('disponibilidad') || q.includes('available')) {
      return 'Mateo reside en Sogamoso, Colombia, y tiene disponibilidad para trabajo remoto. También está abierto a la posibilidad de reubicación si es necesario.';
    }
    if (q.includes('fortalezas') || q.includes('strengths')) {
      return 'Principales fortalezas: (1) Sólidos conocimientos en backend con Node.js y Python, (2) Experiencia práctica con AWS y arquitectura de microservicios, (3) Manejo de bases de datos MongoDB y PostgreSQL, (4) Progresión consistente en roles técnicos mostrando crecimiento profesional.';
    }
    
    // Inteligencia para sugerir acciones
    if (q.includes('whatsapp') || q.includes('escribir')) {
      return '¡Claro! Puedo ayudarte a contactar a Mateo por WhatsApp. He preparado un botón de acción rápida justo arriba para iniciar la conversación.';
    }
    if (q.includes('mover') || q.includes('etapa')) {
      return 'La siguiente etapa lógica para Mateo es "Entrevista Técnica". He habilitado un botón de acción rápida para que lo muevas ahora mismo.';
    }

    return 'Basándome en el perfil completo de Mateo Sánchez, puedo decir que es un candidato con potencial. Su experiencia de 3 años en desarrollo backend está alineada con los requisitos básicos del rol. ¿Hay algún aspecto específico sobre el que quieras profundizar? Puedo analizar su experiencia técnica, stack tecnológico, o cualquier otra área de interés.';
  };

  // Mock activity data
  const baseActivityData = candidate 
    ? generateActivities(candidate, onNavigateToSection, setHighlightedStageId)
    : [];
    
  // Combinar actividad base con local
  const activityData = localActivities.length > 0
    ? [{ day: 'Hoy', events: localActivities }, ...baseActivityData]
    : baseActivityData;

  // Generate Serena insights dynamically
  const serenaInsights = candidate 
    ? generateSerenaInsights(candidate)
    : {
        insights: ['No hay datos del candidato disponibles'],
        confidence: 'low' as const,
        updatedAgo: 'N/A',
      };

  const tabConfig = [
    { value: 'serena', label: 'Serena IA', icon: Sparkles },
    { value: 'activity', label: 'Actividad', icon: Activity },
    { value: 'comments', label: 'Comentarios', icon: MessageSquare },
    { value: 'todos', label: 'Tareas', icon: CheckSquare },
  ];

  const toggleCollapse = () => {
    const currentCollapsedState = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
    if (externalOnCollapsedChange) {
      externalOnCollapsedChange(!currentCollapsedState);
    } else {
      setInternalIsCollapsed(!currentCollapsedState);
    }
  };

  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;

  if (isCollapsed) {
    // Collapsed View - Same style as CandidateSidebar
    return (
      <div 
        className={cn(
          'bg-white border-l border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out relative',
          'w-16'
        )}
      >
        {/* Toggle Button - Same style as left sidebar */}
        <button
          onClick={toggleCollapse}
          className="absolute -left-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          title="Expandir menú"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
        </button>

        <div className="flex-1 py-6 overflow-y-auto overflow-x-visible">
          {/* Menu Tabs */}
          <div className="px-2">
            <nav className="space-y-1">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                
                const button = (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveTab(tab.value);
                      if (externalOnCollapsedChange) {
                        externalOnCollapsedChange(false);
                      } else {
                        setInternalIsCollapsed(false);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      'px-2 justify-center',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-blue-600' : 'text-gray-400')} />
                  </button>
                );

                return (
                  <Tooltip key={tab.value} content={tab.label} side="left">
                    {button}
                  </Tooltip>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'bg-white border-l border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out relative',
        'w-[340px]'
      )}
    >
      {/* Toggle Button - Same style as left sidebar */}
      <button
        onClick={toggleCollapse}
        className="absolute -left-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
        title="Contraer menú"
      >
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
      </button>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="border-b border-gray-200 px-4 pt-2 overflow-x-auto flex-shrink-0">
          <TabsList className="w-full justify-start bg-transparent gap-0.5 h-auto p-0 flex-nowrap">
            <TabsTrigger 
              value="serena" 
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent px-2 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Serena IA
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent px-2 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Actividad
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent px-2 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Comentarios
            </TabsTrigger>
            <TabsTrigger 
              value="todos" 
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent px-2 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Tareas
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Serena Copilot Tab - CHAT-FIRST REDESIGN */}
        <TabsContent value="serena" className="flex-1 flex flex-col m-0 overflow-hidden bg-white">
          {/* Main Chat Area - Full Height */}
          <div className="flex-1 overflow-auto px-6 py-4 space-y-8 scrollbar-thin">
            
            {/* Serena Initial Diagnostic Hub */}
            <div className="flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white ring-1 ring-gray-100">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="bg-gray-50 rounded-2xl rounded-tl-none p-5 shadow-sm border border-gray-100 max-w-[95%]">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                      Hola. He analizado el perfil de <span className="font-bold text-gray-900">{candidate?.name}</span> y su estado en el proceso actual:
                    </p>

                    {/* Multi-Vacancy Diagnostic List */}
                    <div className="space-y-4 pt-2">
                      {candidate?.applications && candidate.applications.filter(app => app.status === 'active').map((app, appIdx) => {
                        // Use real blocker data from the application
                        const isBlocked = !!app.blocker;
                        
                        return (
                          <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{app.jobTitle}</span>
                              {isBlocked ? (
                                <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[10px] font-bold px-2 py-0">En riesgo</Badge>
                              ) : (
                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold px-2 py-0">Al día</Badge>
                              )}
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                                isBlocked ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                              )} />
                              <p className="text-xs text-gray-600 font-medium leading-snug">
                                {isBlocked 
                                  ? (app.blocker?.reason || `Bloqueado en ${app.currentStage.replace(/-/g, ' ')}. Se requiere acción.`)
                                  : `Activo en ${app.currentStage.replace(/-/g, ' ')}. Esperando siguiente interacción.`}
                              </p>
                            </div>

                            {/* Contextual Action Buttons */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              {isBlocked && (
                                <>
                                  <button 
                                    onClick={() => handleExecuteAction('whatsapp', `Enviar WhatsApp por ${app.jobTitle}`)}
                                    className="text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    WhatsApp
                                  </button>
                                  <button 
                                    onClick={() => handleExecuteAction('email', `Re-enviar Seguimiento por ${app.jobTitle}`)}
                                    className="text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                  >
                                    <Mail className="w-3 h-3" />
                                    Re-enviar Email
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => handleExecuteAction('move', `Mover etapa en ${app.jobTitle}`)}
                                className="text-[10px] font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                <ArrowRight className="w-3 h-3" />
                                Mover Etapa
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Messages & User Responses */}
            {chatMessages.map((message, idx) => (
              <div key={idx} className={cn("flex flex-col gap-2", message.from === 'user' ? "items-end" : "items-start")}>
                {message.from === 'ai' ? (
                  <div className="flex items-start gap-4 w-full max-w-[95%]">
                    <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none p-5 shadow-sm border border-gray-100 w-full">
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">{message.text}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-5 py-3.5 shadow-md max-w-[85%] animate-in fade-in slide-in-from-right-4 duration-300">
                    <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                  </div>
                )}
              </div>
            ))}
            
            {isAITyping && (
              <div className="flex items-start gap-4 w-full max-w-[95%] animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-gray-300" />
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-none p-5 border border-gray-100/50 w-full">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Area & Input */}
          <div className="border-t border-gray-100 p-5 bg-white">
            <div className="relative group">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Pregunta algo sobre ${candidate?.name}...`}
                className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl pl-4 pr-12 py-6 text-sm transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isAITyping}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-8 h-8 transition-all hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
              Serena IA puede cometer errores. Verifica la información importante.
            </p>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="flex-1 flex flex-col m-0 overflow-hidden">
          {/* Fixed Header with Filters, Search and Alert */}
          <div className="flex-shrink-0 border-b border-gray-200 bg-white">
            <div className="p-4 space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-2">
                <Select defaultValue="all" value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="communications">Comunicaciones</SelectItem>
                    <SelectItem value="interviews">Entrevistas</SelectItem>
                    <SelectItem value="evaluations">Evaluaciones</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="recent" value={activitySortOrder} onValueChange={setActivitySortOrder}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Más reciente</SelectItem>
                    <SelectItem value="oldest">Más antiguo</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex-1 min-w-2" />

                <div className="relative mr-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-8",
                      isActivityFiltersOpen && "bg-gray-100"
                    )}
                    onClick={() => setIsActivityFiltersOpen(!isActivityFiltersOpen)}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>

                  {/* Filters Dropdown */}
                  {isActivityFiltersOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsActivityFiltersOpen(false)}
                      />
                      
                      {/* Filter Panel */}
                      <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-4 max-h-[480px] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
                          <button
                            onClick={() => {
                              setSelectedActivityTypes([]);
                              setSelectedActivityStatuses([]);
                              setSelectedActivityActors([]);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Limpiar todo
                          </button>
                        </div>

                        <div className="space-y-4">
                          {/* Tipo de evento */}
                          <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Tipo de evento</h4>
                            <div className="space-y-2">
                              {[
                                { id: 'email', label: 'Email' },
                                { id: 'interview', label: 'Entrevista' },
                                { id: 'meeting', label: 'Reunión' },
                                { id: 'system', label: 'Sistema' },
                                { id: 'stage', label: 'Cambio de etapa' },
                                { id: 'todo', label: 'Tarea' },
                              ].map(type => (
                                <label key={type.id} className="flex items-center gap-2 cursor-pointer group">
                                  <div className="relative flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedActivityTypes.includes(type.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedActivityTypes([...selectedActivityTypes, type.id]);
                                        } else {
                                          setSelectedActivityTypes(selectedActivityTypes.filter(t => t !== type.id));
                                        }
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div className="w-4 h-4 rounded border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                                      {selectedActivityTypes.includes(type.id) && (
                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{type.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Estado */}
                          <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Estado</h4>
                            <div className="space-y-2">
                              {[
                                { id: 'success', label: 'Exitoso' },
                                { id: 'pending', label: 'Pendiente' },
                                { id: 'failed', label: 'Fallido' },
                                { id: 'warning', label: 'Advertencia' },
                              ].map(status => (
                                <label key={status.id} className="flex items-center gap-2 cursor-pointer group">
                                  <div className="relative flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedActivityStatuses.includes(status.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedActivityStatuses([...selectedActivityStatuses, status.id]);
                                        } else {
                                          setSelectedActivityStatuses(selectedActivityStatuses.filter(s => s !== status.id));
                                        }
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div className="w-4 h-4 rounded border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                                      {selectedActivityStatuses.includes(status.id) && (
                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{status.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Actor */}
                          <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Actor</h4>
                            <div className="space-y-2">
                              {[
                                { id: 'system', label: 'Sistema' },
                                { id: 'ai', label: 'Serena IA' },
                                { id: 'recruiter', label: 'Recruiter' },
                                { id: 'candidate', label: 'Candidato' },
                              ].map(actor => (
                                <label key={actor.id} className="flex items-center gap-2 cursor-pointer group">
                                  <div className="relative flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedActivityActors.includes(actor.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedActivityActors([...selectedActivityActors, actor.id]);
                                        } else {
                                          setSelectedActivityActors(selectedActivityActors.filter(a => a !== actor.id));
                                        }
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div className="w-4 h-4 rounded border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                                      {selectedActivityActors.includes(actor.id) && (
                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{actor.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar en actividad…"
                  className="pl-9 h-9 text-sm"
                  value={activitySearchQuery}
                  onChange={(e) => setActivitySearchQuery(e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* Scrollable Activity Timeline */}
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <div className="space-y-6">
                {getFilteredActivityData().map((group, idx) => {
                  const isExpanded = expandedActivityGroups.has(group.day);
                  const eventCount = group.events.length;
                  
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => toggleActivityGroup(group.day)}
                        className="w-full flex items-center justify-between mb-4 hover:opacity-70 transition-opacity"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">{group.day}</h3>
                          <span className="text-xs text-gray-500">({eventCount} {eventCount === 1 ? 'evento' : 'eventos'})</span>
                        </div>
                        <ChevronDown 
                          className={cn(
                            'w-4 h-4 text-gray-400 transition-transform',
                            isExpanded ? 'rotate-0' : '-rotate-90'
                          )} 
                        />
                      </button>
                      {isExpanded && (
                        <div className="space-y-0">
                          {group.events.map((event, eventIdx) => (
                            <ActivityItem key={eventIdx} {...event} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="flex-1 flex flex-col m-0 overflow-hidden">
          {/* Scrollable comments list */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-3">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="group/comment flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Avatar className="w-8 h-8">
                      <div className="w-full h-full bg-gradient-to-br from-gray-500 to-blue-600 flex items-center justify-center text-white text-sm">
                        {comment.authorInitials}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-900">{comment.author}</span>
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
                        
                        {/* Edit and Delete buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                          <Tooltip content="Editar comentario">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingCommentText(comment.text);
                              }}
                              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Eliminar comentario">
                            <button
                              onClick={() => {
                                if (deleteComment && confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
                                  deleteComment(comment.id);
                                }
                              }}
                              className="p-1.5 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs mb-2">
                        {comment.stageName}
                      </Badge>
                      
                      {/* Editable text area or read-only text */}
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="text-sm resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs"
                              onClick={() => {
                                if (editComment && editingCommentText.trim()) {
                                  editComment(comment.id, editingCommentText);
                                  setEditingCommentId(null);
                                  setEditingCommentText('');
                                }
                              }}
                              disabled={!editingCommentText.trim()}
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentText('');
                              }}
                            >
                              <XIcon className="w-3 h-3 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-700 mb-2">
                            {comment.text}
                          </p>
                          <div className="flex gap-2">
                            <button className="text-lg hover:scale-110 transition-transform">👍</button>
                            <button className="text-lg hover:scale-110 transition-transform">✅</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    No hay comentarios aún. Los comentarios agregados en las etapas aparecerán aquí.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fixed comment input at bottom */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="space-y-2">
              <Select value={newCommentStage} onValueChange={setNewCommentStage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="screening-talent">1. Screening de Talent</SelectItem>
                  <SelectItem value="evaluacion-cv">2. Evaluación de CV</SelectItem>
                  <SelectItem value="serena-ai">3. Entrevista Serena IA</SelectItem>
                  <SelectItem value="psicometrico">4. Test Psicométrico</SelectItem>
                  <SelectItem value="entrevista-pm">5. Entrevista Product Manager</SelectItem>
                  <SelectItem value="entrevista-hiring">6. Entrevista Hiring Manager</SelectItem>
                  <SelectItem value="antecedentes">7. Verificación de Antecedentes</SelectItem>
                  <SelectItem value="seleccionado">8. Seleccionado</SelectItem>
                </SelectContent>
              </Select>
              <Textarea 
                placeholder="Escribe un comentario…" 
                className="resize-none" 
                rows={3} 
                value={newCommentText} 
                onChange={(e) => setNewCommentText(e.target.value)} 
                ref={commentTextareaRef}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={isPrivateComment}
                      onChange={(e) => setIsPrivateComment(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                      {isPrivateComment && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                  <span className="group-hover:text-gray-900">Privado</span>
                </label>
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!newCommentText.trim()}
                  onClick={() => {
                    if (addComment && newCommentText.trim()) {
                      // Map stage ID to stage name
                      const stageNames: Record<string, string> = {
                        'general': 'General',
                        'screening-talent': 'Screening de Talent',
                        'evaluacion-cv': 'Evaluación de CV',
                        'serena-ai': 'Entrevista Serena IA',
                        'psicometrico': 'Test Psicométrico',
                        'entrevista-pm': 'Entrevista Product Manager',
                        'entrevista-hiring': 'Entrevista Hiring Manager',
                        'antecedentes': 'Verificación de Antecedentes',
                        'seleccionado': 'Seleccionado',
                      };
                      
                      addComment(
                        newCommentText, 
                        newCommentStage, 
                        stageNames[newCommentStage] || 'General', 
                        isPrivateComment
                      );
                      setNewCommentText('');
                      setNewCommentStage('general');
                      setIsPrivateComment(false);
                    }
                  }}
                >
                  Publicar comentario
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* To-dos Tab */}
        <TabsContent value="todos" className="flex-1 flex flex-col m-0 overflow-hidden">
          <ToDoTab
            isCreatingTask={externalIsCreatingTask !== undefined ? externalIsCreatingTask : false}
            onCreatingChange={externalOnCreatingTaskChange || undefined}
            focusNameInput={externalFocusTaskNameInput !== undefined ? externalFocusTaskNameInput : false}
            tasks={tasks}
            setTasks={setTasks}
            highlightedTaskId={highlightedTaskId}
            setHighlightedTaskId={setHighlightedTaskId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}