import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Sparkles, X, Send, ChevronDown, Plus, Copy, Edit2, MessageCircle, Mail, AlertCircle, MapPin, User, Phone, GraduationCap, Briefcase } from 'lucide-react';
import { cn } from './ui/utils';
import { Badge } from './ui/badge';

interface Message {
  id: string;
  from: 'ai' | 'user';
  text: string;
  timestamp: string;
  isActionable?: boolean;
  candidates?: any[];
}

interface SerenaIAPanelProps {
  isOpen: boolean;
  onClose: () => void;
  candidate?: any;
  mode?: 'candidate' | 'global' | 'search';
  allCandidates?: any[];
  isValentina?: boolean;
  searchTrigger?: number;
  onImportCandidate?: (candidate: any) => void;
}

const generateMockCandidates = (count: number) => {
  const baseCandidates = [
    {
      name: "Carlos Mario Restrepo",
      role: "Senior Product Designer",
      location: "Medellín, Colombia",
      idNumber: "1.020.456.789",
      email: "c.restrepo@uxdesign.com",
      phone: "+57 310 456 7890",
      education: [
        { title: "Maestría en Diseño de Interacción", date: "2018 - 2020" },
        { title: "Diseño Industrial", date: "2012 - 2017" }
      ],
      experience: [
        { title: "Product Lead en Rappi", date: "2021 - Presente" },
        { title: "UX Designer en Globant", date: "2018 - 2021" }
      ]
    },
    {
      name: "Ana María Jiménez",
      role: "UX/UI Designer Specialist",
      location: "Bogotá, Colombia",
      idNumber: "52.789.012",
      email: "ana.jimenez@creative.co",
      phone: "+57 300 789 0123",
      education: [
        { title: "Especialización en UI/UX", date: "2019" },
        { title: "Artes Visuales", date: "2014 - 2018" }
      ],
      experience: [
        { title: "UI Designer en Mercado Libre", date: "2020 - Presente" },
        { title: "Junior Designer en StartUp X", date: "2018 - 2020" }
      ]
    },
    {
      name: "Mateo Holguín",
      role: "Visual Product Designer",
      location: "Cali, Colombia",
      idNumber: "1.144.321.654",
      email: "m.holguin@designstudio.com",
      phone: "+57 315 321 6543",
      education: [
        { title: "Diseño Gráfico", date: "2013 - 2018" }
      ],
      experience: [
        { title: "Senior Designer en Bancolombia", date: "2019 - Presente" }
      ]
    },
    {
      name: "Valentina Correa",
      role: "UX Researcher & Designer",
      location: "Manizales, Colombia",
      idNumber: "1.053.987.654",
      email: "v.correa@researchhub.io",
      phone: "+57 320 987 6543",
      education: [
        { title: "Psicología", date: "2010 - 2015" }
      ],
      experience: [
        { title: "UX Researcher en Uber", date: "2018 - Presente" }
      ]
    },
    {
      name: "Sebastián Quintana",
      role: "Lead Product Designer",
      location: "Barranquilla, Colombia",
      idNumber: "72.456.123",
      email: "s.quintana@techsolutions.com",
      phone: "+57 301 456 1234",
      education: [
        { title: "Ingeniería de Sistemas", date: "2011 - 2016" }
      ],
      experience: [
        { title: "Lead Designer en NuBank", date: "2020 - Presente" }
      ]
    }
  ];

  const results = [];
  for (let i = 0; i < count; i++) {
    const base = baseCandidates[i % baseCandidates.length];
    results.push({
      ...base,
      name: i >= baseCandidates.length ? `${base.name} (${i + 1})` : base.name
    });
  }
  return results;
};

const getMockAIResponse = (question: string, candidateName: string) => {
  const q = question.toLowerCase();
  if (q.includes('experiencia') || q.includes('experience')) {
    return `${candidateName} cuenta con una trayectoria sólida en diseño y desarrollo de productos. He analizado sus roles previos y destaca su capacidad para liderar proyectos técnicos complejos.`;
  }
  if (q.includes('habilidades') || q.includes('skills')) {
    return `Sus habilidades técnicas están en el top 5% de los candidatos. Domina Figma, Design Systems y tiene bases sólidas en desarrollo frontend, lo que lo hace un perfil híbrido muy valioso.`;
  }
  if (q.includes('contactado') || q.includes('whatsapp') || q.includes('mensaje')) {
    return `¡Claro! Estoy enviando el mensaje de seguimiento a ${candidateName} ahora mismo. Te avisaré en cuanto reciba una confirmación de entrega.`;
  }
  return `He analizado ese punto en el perfil de ${candidateName}. Su experiencia sugiere que tiene las competencias necesarias, aunque valdría la pena profundizar en la entrevista técnica sobre sus metodologías específicas.`;
};

export function SerenaIAPanel({ isOpen, onClose, candidate, mode, allCandidates, isValentina, searchTrigger }: SerenaIAPanelProps) {
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTitle, setCurrentTitle] = useState('Serena IA');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const candidateName = candidate?.name || 'el candidato';
  const isGlobal = mode === 'global';
  const isSearch = mode === 'search';

  // Efecto para manejar disparadores externos de búsqueda
  useEffect(() => {
    if (searchTrigger && searchTrigger > 0) {
      setMessages([]); // Limpiar historial al iniciar nueva búsqueda inteligente
      setCurrentTitle('Búsqueda Inteligente');
      setIsTyping(true);
      
      // Mensaje de inicio de búsqueda
      const startMsg: Message = {
        id: `search-start-${searchTrigger}`,
        from: 'ai',
        text: `Hola 👋 Estoy buscando candidatos ideales para proponerte para esta vacante. Dame un momento mientras analizo nuestra base de datos...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isActionable: false
      };
      
      setMessages([startMsg]);

      // Simular búsqueda
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          const mockResults = generateMockCandidates(5);
          const resultsMsg: Message = {
            id: `search-results-${searchTrigger}`,
            from: 'ai',
            text: `¡He encontrado estos 5 candidatos que encajan perfectamente con el perfil buscado! Puedes revisar sus detalles a continuación:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            candidates: mockResults
          };
          setMessages(prev => [...prev, resultsMsg]);
          setIsTyping(false);
        }, 3000);
      }, 1500);
    }
  }, [searchTrigger]);
  
  // Encontrar candidatos bloqueados (solo para modo global)
  const blockedCandidates = isGlobal 
    ? (allCandidates || []).filter(c => {
        const apps = c.applications || [];
        return apps.some((a: any) => a.status === 'active' && a.blocker);
      })
    : [];

  const activeApps = !isGlobal 
    ? (candidate?.applications?.filter((a: any) => a.status === 'active') || [])
    : [];

  // Efecto inicial para saludar y dar contexto (Modos Global y Candidato)
  useEffect(() => {
    if (isOpen && !isSearch) {
      setMessages([]); // Limpiar mensajes al abrir o cambiar modo
      setIsTyping(true);
      setTimeout(() => {
        if (isGlobal) {
          setCurrentTitle('Serena IA');
          setMessages([
            {
              id: 'initial-global',
              from: 'ai',
              text: `Hola 👋 Soy Serena, tu asistente de reclutamiento. He analizado el flujo y he detectado ${blockedCandidates.length} candidatos con bloqueos que requieren tu atención.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isActionable: true
            }
          ]);
        } else if (isValentina) {
          setMessages([
            {
              id: 'initial-error',
              from: 'ai',
              text: `Lo sentimos, no hemos podido cargar la información de Serena IA en este momento. Estamos trabajando para restablecer el servicio.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isActionable: false
            }
          ]);
        } else {
          setMessages([
            {
              id: 'initial',
              from: 'ai',
              text: `Hola 👋 He analizado el estado de ${candidateName}. Actualmente tiene ${activeApps.length} vacantes activas.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isActionable: true
            }
          ]);
        }
        setIsTyping(false);
      }, 800);
    }
  }, [isOpen, mode, isGlobal, isSearch]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      from: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    const input = chatInput.toLowerCase();
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiMsg: Message;
      
      // Detectar si pide investigar algo puntual de un candidato en modo búsqueda
      if (isSearch && (input.includes('investiga') || input.includes('averigua') || input.includes('más sobre') || input.includes('detalle de'))) {
        aiMsg = {
          id: (Date.now() + 1).toString(),
          from: 'ai',
          text: `Por el momento solo puedo generar y proponerte nuevos candidatos afines a la vacante. No tengo la capacidad de investigar más a fondo sobre ellos más allá de la información que te he presentado.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      // Detectar si pide más candidatos en modo búsqueda
      else if (isSearch && (input.includes('otros') || input.includes('más') || input.includes('dame'))) {
        const match = input.match(/\d+/);
        const count = match ? parseInt(match[0]) : 5;
        const cappedCount = Math.min(count, 10); // Limite de seguridad

        aiMsg = {
          id: (Date.now() + 1).toString(),
          from: 'ai',
          text: `¡Claro! He encontrado otros ${cappedCount} candidatos que también se ajustan al perfil. Aquí tienes los resultados:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          candidates: generateMockCandidates(cappedCount)
        };
      } else {
        aiMsg = {
          id: (Date.now() + 1).toString(),
          from: 'ai',
          text: getMockAIResponse(chatInput, candidateName),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleAction = (actionType: string, customName?: string) => {
    const targetName = customName || candidateName;

    if (isValentina && actionType === 'whatsapp') {
      toast.error('No es posible abrir WhatsApp en este momento. Inténtalo de nuevo en unos minutos.');
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        from: 'ai',
        text: actionType === 'whatsapp' 
          ? `¡Claro! Iniciando contacto por WhatsApp con ${targetName}...`
          : `Entendido, enviando correo electrónico de seguimiento a ${targetName}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div 
      className={cn(
        "h-full bg-white flex flex-col transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0",
        isOpen ? "w-[420px] opacity-100" : "w-0 opacity-0"
      )}
    >
      {/* Absolute container to ensure it doesn't push parent height if content overflows */}
      <div className="flex flex-col h-full w-[420px] overflow-hidden">
        {/* Header - Fixed height */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">
              {isSearch ? "Búsqueda Inteligente" : "Serena IA"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area - The only scrollable part */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={cn(
            "flex flex-col",
            msg.from === 'user' ? "items-end" : "items-start"
          )}>
            <div className={cn(
              "flex items-start gap-3",
              msg.from === 'user' ? "max-w-[85%]" : "max-w-[95%]"
            )}>
              {msg.from === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-500 shadow-lg flex-shrink-0 mt-1 animate-pulse border-2 border-white" />
              )}
              <div className="flex-1 space-y-2">
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                  msg.from === 'user' 
                    ? "bg-gray-100/80 text-gray-800 rounded-tr-none" 
                    : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                )}>
                  {msg.text}

                  {/* Candidate Search Results Cards */}
                  {msg.candidates && (
                    <div className="mt-6 space-y-6">
                      {msg.candidates.map((candidate, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                          {/* Card Header */}
                          <div className="p-4 bg-white border-b border-gray-100 flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                              <User className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-gray-800 truncate">{candidate.name}</h4>
                              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">{candidate.role}</p>
                              <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                                <MapPin className="w-3 h-3" />
                                <span className="text-[10px] font-medium">{candidate.location}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Body - Details */}
                          <div className="p-4 space-y-4">
                            {/* Personal Info Grid */}
                            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-200/50">
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Cédula</p>
                                <p className="text-[11px] font-semibold text-gray-700">{candidate.idNumber}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Celular</p>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  <p className="text-[11px] font-semibold text-gray-700">{candidate.phone}</p>
                                </div>
                              </div>
                              <div className="col-span-2 space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Email</p>
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <p className="text-[11px] font-semibold text-gray-700">{candidate.email}</p>
                                </div>
                              </div>
                            </div>

                            {/* Education & Experience */}
                            <div className="space-y-4">
                              {/* Education */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                                  <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Educación</span>
                                </div>
                                <div className="space-y-2 pl-5 border-l-2 border-gray-100">
                                  {candidate.education.map((edu: any, i: number) => (
                                    <div key={i} className="relative">
                                      <div className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-gray-200" />
                                      <p className="text-[11px] font-bold text-gray-700 leading-tight">{edu.title}</p>
                                      <p className="text-[10px] text-gray-400 font-medium">{edu.date}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Experience */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                  <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Experiencia</span>
                                </div>
                                <div className="space-y-2 pl-5 border-l-2 border-gray-100">
                                  {candidate.experience.map((exp: any, i: number) => (
                                    <div key={i} className="relative">
                                      <div className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-gray-200" />
                                      <p className="text-[11px] font-bold text-gray-700 leading-tight">{exp.title}</p>
                                      <p className="text-[10px] text-gray-400 font-medium">{exp.date}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex gap-2">
                            <button className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm">
                              Ver perfil
                            </button>
                            <button 
                              onClick={() => {
                                if (onImportCandidate) {
                                  onImportCandidate(candidate);
                                  toast.success(`${candidate.name} importado correctamente.`);
                                }
                              }}
                              className="flex-1 py-2 bg-blue-600 rounded-xl text-[11px] font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                            >
                              Importar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contextual Action Cards - Candidate Mode */}
                  {msg.isActionable && !isGlobal && activeApps.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {activeApps.map((app: any) => {
                        const isBlocked = !!app.blocker;
                        return (
                          <div key={app.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {app.jobTitle}
                              </span>
                              <Badge className={cn(
                                "text-[9px] px-1.5 py-0 border-none",
                                isBlocked ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                              )}>
                                {isBlocked ? 'BLOQUEADO' : 'EN PROCESO'}
                              </Badge>
                            </div>
                            
                            {isBlocked && (
                              <div className="flex items-start gap-2 py-1">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-gray-600 leading-tight">
                                  {app.blocker?.reason || "Falta completar entrevista técnica."}
                                </p>
                              </div>
                            )}

                            {isBlocked && (
                              <div className="flex gap-2 pt-1 border-t border-gray-200/50">
                                <button 
                                  onClick={() => handleAction('whatsapp')}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-500" /> WhatsApp
                                </button>
                                <button 
                                  onClick={() => handleAction('email')}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                                >
                                  <Mail className="w-3 h-3 text-blue-500" /> Email
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Contextual Action Cards - Global Mode */}
                  {msg.isActionable && isGlobal && blockedCandidates.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-[11px] font-semibold text-gray-500 mb-2 px-1">CANDIDATOS CON BLOQUEOS:</p>
                      {blockedCandidates.map((c: any) => {
                        const blockedApp = c.applications.find((a: any) => a.blocker);
                        return (
                          <div key={c.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                  {c.name.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-gray-800">
                                  {c.name}
                                </span>
                              </div>
                              <Badge className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0 border-none uppercase">
                                Bloqueado
                              </Badge>
                            </div>
                            
                            <div className="flex items-start gap-2 bg-white/50 p-2 rounded-lg border border-gray-100">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                  {blockedApp?.jobTitle}
                                </p>
                                <p className="text-[11px] text-gray-600 leading-tight">
                                  {blockedApp?.blocker?.reason}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button 
                                onClick={() => handleAction('whatsapp', c.name)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-500" /> Ayudar vía WhatsApp
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className={cn(
                  "flex items-center gap-2 text-[11px] text-gray-400 font-medium px-1",
                  msg.from === 'user' ? "justify-end" : "justify-start"
                )}>
                  <span>{msg.timestamp}</span>
                  {msg.from === 'user' && (
                    <div className="flex items-center gap-2 ml-1">
                      <Copy className="w-3.5 h-3.5 cursor-pointer hover:text-gray-600 transition-colors" />
                      <Edit2 className="w-3.5 h-3.5 cursor-pointer hover:text-gray-600 transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-500 shadow-lg flex-shrink-0 mt-1 animate-pulse border-2 border-white" />
            <div className="bg-gray-50 rounded-2xl rounded-tl-none px-5 py-3 border border-gray-100">
              <div className="flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed height */}
      <div className="flex-shrink-0 p-6 bg-white border-t border-gray-100">
        <div className="relative group">
          <div className="bg-white border border-gray-200 rounded-3xl p-4 pl-14 pr-14 shadow-sm group-focus-within:border-blue-300 group-focus-within:ring-4 group-focus-within:ring-blue-50 transition-all min-h-[80px] flex items-center">
            <textarea
              ref={inputRef}
              rows={1}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Responder..."
              className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder:text-gray-400 resize-none text-sm outline-none"
            />
          </div>

          {/* Plus Button */}
          <button className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all">
            <Plus className="w-4 h-4" />
          </button>

          {/* Send Button with Gradient */}
          <button 
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isTyping}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shadow-lg",
              "bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600",
              "hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
            )}
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-center text-gray-400 font-medium mt-4">
          Agentes AI puede cometer errores, verifica las respuestas.
        </p>
      </div>
    </div>
  </div>
  );
}

function ArrowRightIcon(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
