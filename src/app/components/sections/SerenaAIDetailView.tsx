import React, { useState } from 'react';
import { 
  Bot, 
  Download, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  MessageSquare, 
  Star, 
  ArrowRight, 
  ChevronLeft,
  Play,
  Volume2,
  Trophy,
  Target,
  BarChart3,
  Sparkles,
  Plus,
  Lock,
  X,
  Pencil,
  Trash2,
  Pause,
  Brain,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';

interface SerenaAIDetailViewProps {
  interviewData?: {
    transcript: Array<{
      role: 'serena' | 'candidate';
      text: string;
      timestamp?: string;
      audioUrl?: string;
    }>;
    questionScores: Array<{
      objective: string;
      question: string;
      score: number;
      feedback?: string;
      analysis?: string;
    }>;
    overallFeedback: {
      summary?: string;
      strengths?: string[];
      improvements?: string[];
      // Real Serena IA feedback structure
      evaluations?: Array<{ category: string; description: string }>;
      minimumThreshold?: number;
      obtainedScore?: number;
      decision?: string;
      recommendation?: string;
      cvScore?: number;
    };
  };
  score?: number;
  onBack: () => void;
  isValentina?: boolean;
}

export function SerenaAIDetailView({ interviewData, score = 88, onBack, isValentina }: SerenaAIDetailViewProps) {
  const [activeTab, setActiveTab] = useState('analysis');
  const [comments, setComments] = useState([
    { id: 1, user: 'Ana Martínez', role: 'Senior Recruiter', date: '29 Abr, 2024', text: 'Excelente manejo de conceptos técnicos. Muy prometedor para el equipo de arquitectura.', avatar: 'AM', isPrivate: false },
    { id: 2, user: 'Carlos Ruiz', role: 'Tech Lead', date: '28 Abr, 2024', text: 'Me gustaría validar más su experiencia con Kubernetes en la siguiente fase.', avatar: 'CR', isPrivate: false }
  ]);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    if (isValentina) {
      toast.error('Estamos presentando inconvenientes para publicar tu comentario. Inténtalo más tarde.');
      return;
    }

    const comment = {
      id: Date.now(),
      user: 'Usuario Actual',
      role: 'Reclutador',
      date: 'Hoy',
      text: newComment,
      avatar: 'UA',
      isPrivate: isPrivate
    };
    setComments([comment, ...comments]);
    setNewComment('');
    setIsAddingComment(false);
    setIsPrivate(false);
    toast.success('Comentario añadido correctamente');
  };

  if (!interviewData) {
    return (
      <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No hay datos disponibles</h3>
        <p className="text-gray-500 mb-6 text-sm">No se encontraron registros de la entrevista con Serena IA para este candidato.</p>
        <Button onClick={onBack} variant="outline" className="gap-2 border-gray-200">
          <ChevronLeft className="w-4 h-4" />
          Volver a las etapas de la vacante
        </Button>
      </div>
    );
  }

  const { transcript, questionScores, overallFeedback } = interviewData;

  const evaluations = overallFeedback?.evaluations || [
    { category: 'Experiencia', description: 'Luisa Abello cuenta con más de 13 años de experiencia en gestión de producto, incluyendo roles de liderazgo en empresas como Twilio y Nokia, lo cual es altamente relevante para el puesto de Head de Producto de IA. Ha trabajado en entornos SaaS y tiene experiencia con componentes de IA y machine learning.' },
    { category: 'Estabilidad laboral', description: 'Ha mantenido roles de larga duración, generalmente de 1 a 3 años, lo cual indica estabilidad y compromiso.' },
    { category: 'Relevancia', description: 'Su experiencia en gestión de producto digital y liderazgo de equipos multidisciplinarios se alinea perfectamente con los requisitos del puesto.' },
    { category: 'Ubicación', description: 'Reside en Ciudad de México y está dispuesta a reubicarse, lo cual es favorable para la modalidad de trabajo remoto.' },
    { category: 'Requisitos deseables', description: 'Cumple con la mayoría de los requisitos técnicos y habilidades blandas, incluyendo metodologías ágiles y habilidades analíticas. Sin embargo, no se menciona explícitamente el uso de SQL o Posthog, lo cual podría tener un impacto leve.' }
  ];

  const minThreshold = overallFeedback?.minimumThreshold || 70;
  const obtainedScore = overallFeedback?.obtainedScore || 85;
  const decision = overallFeedback?.decision || "Válida (supera el umbral)";
  const recommendation = overallFeedback?.recommendation || "Luisa Abello es una candidata altamente calificada para el puesto de Head de Producto de IA. Se recomienda avanzar en el proceso de selección.";
  const cvScore = overallFeedback?.cvScore || 85;

  const handlePlayAudio = (idx: number, role: 'serena' | 'candidate') => {
    if (isValentina && role === 'candidate') {
      toast.error('Inténtalo más tarde');
      return;
    }

    if (isValentina && role === 'serena') {
      toast.error('¡Ups! No logramos reproducir el audio. Inténtalo más tarde.');
      return;
    }

    if (playingAudioIndex === idx) {
      setPlayingAudioIndex(null);
    } else {
      setPlayingAudioIndex(idx);
    }
  };

  const handleDownloadReport = () => {
    if (isValentina) {
      toast.error('Error al descargar el PDF. Inténtalo más tarde.');
      return;
    }
    toast.success('Descargando reporte completo de Serena IA...');
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-xl font-bold text-gray-900">Entrevista Serena IA</h2>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                Completada
              </Badge>
            </div>

          </div>
        </div>
        

      </div>

      <Tabs defaultValue="analysis" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-gray-200/50 p-1.5 rounded-2xl mb-8 w-full sm:w-auto flex justify-start h-auto border border-gray-200/30">
          <TabsTrigger 
            value="analysis" 
            className="rounded-xl px-6 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Puntajes
          </TabsTrigger>
          <TabsTrigger 
            value="transcript" 
            className="rounded-xl px-6 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Transcripción
          </TabsTrigger>
          <TabsTrigger 
            value="feedback" 
            className="rounded-xl px-6 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Feedback Serena
          </TabsTrigger>
          <TabsTrigger 
            value="comments" 
            className="rounded-xl px-6 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Comentarios
          </TabsTrigger>
        </TabsList>

        {/* 1. Analysis Tab */}
        <TabsContent value="analysis" className="mt-0 animate-in fade-in duration-300 space-y-8">
          {/* 1. Resumen de Evaluación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-5 border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</p>
                  <p className="text-2xl font-black text-gray-900">{obtainedScore}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-medium mt-2">Puntaje obtenido en entrevista</p>
            </Card>

            <Card className="p-5 border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preguntas</p>
                  <p className="text-2xl font-black text-gray-900">{questionScores.length}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-medium mt-2">Respondidas exitosamente</p>
            </Card>

            <Card className="p-5 border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duración</p>
                  <p className="text-2xl font-black text-gray-900">12:45</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-medium mt-2">Minutos totales</p>
            </Card>
          </div>



          {/* 2. Desglose por Pregunta */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <h4 className="text-[11px] font-black tracking-widest text-gray-500 uppercase">Desglose por Pregunta</h4>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                {questionScores.length} TOTALES
              </span>
            </div>
            
            <div className="grid gap-4">
              {questionScores.map((item, idx) => (
                <Card key={idx} className="p-0 border-gray-100 bg-white shadow-sm overflow-hidden group hover:border-blue-200 transition-all">
                  <div className="flex flex-col">
                    {/* Header Row */}
                    <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex-1 flex items-center gap-5">
                        <span className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border shrink-0 shadow-sm group-hover:scale-105 transition-transform",
                          "bg-blue-50 text-blue-600 border-blue-100"
                        )}>
                          {idx + 1}
                        </span>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block leading-none">
                            {item.objective}
                          </span>
                          <p className="text-sm font-bold text-gray-900 leading-tight">
                            {item.question}
                          </p>
                          {item.analysis && (
                            <div className="mt-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100/50 relative group/analysis">
                              <div className="absolute -left-px top-3 bottom-3 w-0.5 bg-blue-500/30 rounded-full" />
                              <p className="text-[12px] text-gray-600 leading-relaxed font-medium italic pl-1">
                                "{item.analysis}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                          <span className="text-sm font-black text-blue-700">{item.score}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </Card>
              ))}
            </div>
          </div>

        </TabsContent>

        {/* 2. Transcript Tab */}
        <TabsContent value="transcript" className="mt-0 animate-in fade-in duration-300">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Registro de la Conversación</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{transcript.length} Mensajes</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs font-bold gap-2 border-gray-200" onClick={handleDownloadReport}>
                <Download className="w-4 h-4" />
                Descargar PDF
              </Button>
            </div>
            
            <div className="p-6 space-y-8 bg-gray-50">
              {transcript.map((msg, idx) => (
                <div key={idx} className={cn(
                  "flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === 'candidate' ? "flex-row-reverse" : "flex-row"
                )} style={{ animationDelay: `${idx * 50}ms` }}>
                  {/* Avatar */}
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                    msg.role === 'serena' ? "bg-white border border-gray-100 text-blue-600" : "bg-gray-900 text-white"
                  )}>
                    {msg.role === 'serena' ? <Bot className="w-6 h-6" /> : <span className="font-black text-xs">CP</span>}
                  </div>
                  
                  {/* Bubble Container */}
                  <div className={cn(
                    "flex flex-col gap-1.5 max-w-[75%]",
                    msg.role === 'candidate' ? "items-end" : "items-start"
                  )}>
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {msg.role === 'serena' ? 'Serena IA' : 'Candidato'}
                      </span>
                      {msg.timestamp && <span className="text-[10px] text-gray-300 font-bold">{msg.timestamp}</span>}
                    </div>
                    
                    <div className={cn(
                      "relative p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all group-hover:shadow-md",
                      msg.role === 'candidate' 
                        ? "bg-white text-gray-800 border-2 border-gray-100 rounded-tr-none" 
                        : "bg-gray-100 text-gray-700 border border-gray-200 rounded-tl-none"
                    )}>
                        {msg.text}
                        
                        {/* Audio Player */}
                        <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center gap-4">
                          <button 
                            onClick={() => handlePlayAudio(idx, msg.role)}
                            className={cn(
                              "w-10 h-10 rounded-full text-white flex items-center justify-center transition-all shadow-lg shadow-gray-200 shrink-0 group/play",
                              playingAudioIndex === idx ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-900 hover:bg-gray-800"
                            )}
                          >
                            {playingAudioIndex === idx ? (
                              <Pause className="w-4 h-4 fill-current group-hover/play:scale-110 transition-transform" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5 group-hover/play:scale-110 transition-transform" />
                            )}
                          </button>
                          
                          <div className="flex-1 h-8 flex items-center gap-[3px] px-2">
                            {[
                              0.3, 0.5, 0.8, 0.4, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 
                              0.6, 0.3, 0.5, 0.9, 0.4, 0.7, 0.5, 0.8, 0.4, 0.6,
                              0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.3, 0.5, 0.9, 0.4
                            ].map((h, i) => (
                              <div 
                                key={i} 
                                className={cn(
                                  "flex-1 rounded-full transition-all duration-300",
                                  playingAudioIndex === idx 
                                    ? "bg-blue-500" 
                                    : msg.role === 'serena' ? "bg-gray-300" : "bg-gray-200"
                                )} 
                                style={{ 
                                  height: `${h * 100}%`,
                                  opacity: playingAudioIndex === idx ? 1 : (i > 12 ? 0.4 : 1), // Simulate partial progress
                                  animation: playingAudioIndex === idx ? `pulse 1s infinite alternate ${i * 0.05}s` : 'none'
                                }} 
                              />
                            ))}
                          </div>
                          
                          <div className="text-[10px] font-black text-gray-400 tabular-nums uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md border border-gray-200/60">
                            0:45
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              ))}
            </div>
            

          </Card>
        </TabsContent>

        {/* 3. Feedback Tab — Refactor to match Psychometric Style */}
        <TabsContent value="feedback" className="mt-0 animate-in fade-in duration-300">
          <Card className="p-10 border-gray-200/60 shadow-sm relative overflow-hidden bg-white rounded-[32px]">
            <div className="space-y-6">
              {/* Header — Patrón Serena IA (Consistent with Psychometric) */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-100/80">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 shadow-sm">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900 tracking-tight">Análisis de la Entrevista</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Evaluado por Serena IA</p>
                </div>
              </div>

              {/* Highlight Box — Conclusión General (Moved to top for high visibility) */}
              <div className="flex items-start gap-4 p-5 bg-[#F0FDF4] rounded-2xl border border-[#DCFCE7] shadow-sm shadow-emerald-50/50">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-[13px] font-bold text-[#166534] leading-relaxed py-1">
                  "Luisa demuestra una sólida base técnica y estratégica en la gestión de productos digitales con componentes de IA. Su habilidad para comunicarse efectivamente con diferentes stakeholders es notable, aunque podría beneficiarse de una mayor claridad en la descripción de experiencias específicas."
                </p>
              </div>

              <div className="space-y-6">
                {/* 1. Áreas de Mejora */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Áreas de Mejora</h4>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 shadow-sm shadow-amber-100" />
                      <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                        Podría mejorar en la claridad al describir experiencias pasadas, especialmente en el ámbito de edtech.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 shadow-sm shadow-amber-100" />
                      <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                        Sería beneficioso profundizar en ejemplos específicos de integración de IA en productos para demostrar un conocimiento más detallado.
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="h-px bg-gray-50 w-full" />

                {/* 2. Habilidades Identificadas */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Habilidades Identificadas</h4>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 shadow-sm shadow-blue-100" />
                      <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                        Experiencia en el desarrollo de módulos de reclutamiento con inteligencia artificial.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 shadow-sm shadow-blue-100" />
                      <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                        Conocimiento en la integración de modelos de IA mediante API Keys y en servidores locales.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 shadow-sm shadow-blue-100" />
                      <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                        Capacidad para definir estrategias y roadmaps equilibrando prioridades urgentes e importantes.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 shadow-sm shadow-blue-100" />
                      <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                        Habilidad para comunicarse efectivamente con stakeholders técnicos y de negocio, adaptando el lenguaje según la audiencia.
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="h-px bg-gray-50 w-full" />

                {/* 3. Seguridad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Intentos de Trampa</h4>
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-2 px-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Ninguno identificado
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Prompt Injection</h4>
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-2 px-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Ninguno identificado
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* 4. Comments Tab */}
        <TabsContent value="comments" className="mt-0 animate-in fade-in duration-300">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <h4 className="text-[11px] font-black tracking-widest text-gray-500 uppercase">Lista de comentarios</h4>
                <Badge variant="outline" className="text-[10px] border-gray-200 bg-white">{comments.length}</Badge>
              </div>
              <Button 
                variant="secondary"
                onClick={() => setIsAddingComment(!isAddingComment)}
                className="rounded-xl font-bold text-xs px-4 py-2 flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Añadir comentario
              </Button>
            </div>

            {/* Inline Comment Form */}
            {isAddingComment && (
              <Card className="p-6 border-gray-200 shadow-md bg-white animate-in slide-in-from-top-4 duration-300 rounded-3xl">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario sobre el desempeño del candidato..."
                  className="w-full h-32 p-4 text-sm bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-gray-500/20 resize-none mb-4 placeholder:text-gray-400 font-medium"
                  autoFocus
                />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div 
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => setIsPrivate(!isPrivate)}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                      isPrivate ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 group-hover:border-gray-300"
                    )}>
                      {isPrivate && <Lock className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-bold text-gray-600">Privado</span>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        setIsAddingComment(false);
                        setNewComment('');
                        setIsPrivate(false);
                      }}
                      className="flex-1 sm:flex-none rounded-xl text-gray-500 font-bold text-xs px-6 hover:bg-gray-100 transition-all"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="flex-1 sm:flex-none rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-8 py-2.5 shadow-lg shadow-gray-200 transition-all disabled:opacity-50"
                    >
                      Publicar
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            
            {comments.length === 0 ? (
              <div className="p-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-400 font-medium">No hay comentarios aún.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="group/c bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                    {editingCommentId === comment.id ? (
                      // Edit mode
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={e => setEditingText(e.target.value)}
                          className="w-full resize-none text-sm bg-gray-50 p-2 rounded-md border border-gray-200"
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
                              setComments(comments.map(c => c.id === comment.id ? { ...c, text: editingText } : c));
                              setEditingCommentId(null);
                              setEditingText('');
                              toast.success('Comentario actualizado');
                            }}
                          >
                            Guardar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Read mode
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {comment.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900">{comment.user}</span>
                            <span className="text-xs text-gray-500">
                              {comment.date}
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
                                  setComments(comments.filter(c => c.id !== comment.id));
                                  setDeletingCommentId(null);
                                  toast.success('Comentario eliminado');
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
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingCommentId(comment.id);
                                  setEditingText(comment.text);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Editar comentario"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeletingCommentId(comment.id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Eliminar comentario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
