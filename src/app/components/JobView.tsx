import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Search,
  ChevronDown,
  MoreVertical,
  MapPin,
  Calendar,
  Sparkles,
  X,
  ExternalLink,
  Pencil,
  Trash2,
  Eye,
  Link as LinkIcon,
  ArrowLeft,
  Upload,
  Users,
  Filter,
  Download,
  Copy,
  MessageCircle,
  Mail,
  Plus,
  ArrowRight,
  Layers,
  FastForward,
  ShieldCheck,
  Phone,
  FileText,
  Printer,
  Check,
  Loader2,
  AlertCircle,
  RotateCw
} from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tooltip } from './ui/tooltip';
import { SerenaIAPanel } from './SerenaIAPanel';
import { candidatesData } from '../data/candidatesData';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Drawer } from './ui/drawer';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

// Configuración de etapas del proceso (8 etapas del proceso + etapa final)
const stages = [
  { id: 'screening-talent', name: 'Screening Talent', order: 1 },
  { id: 'evaluacion-cv', name: 'Evaluación CV', order: 2 },
  { id: 'evaluacion-serena', name: 'Serena AI', order: 3 },
  { id: 'evaluacion-psicometrica', name: 'Test Psicométrico', order: 4 },
  { id: 'entrevista-tecnica', name: 'Entrevista Técnica', order: 5 },
  { id: 'entrevista-pm', name: 'Entrevista Product Manager', order: 6 },
  { id: 'entrevista-hiring', name: 'Entrevista Hiring Manager', order: 7 },
  { id: 'antecedentes', name: 'Verificación Antecedentes', order: 8 },
  { id: 'seleccionado', name: 'Seleccionado', order: 9 }
];

interface Vacancy {
  id: string;
  versionId: string;
  title: string;
  status: 'published' | 'draft';
  createdAt: Date;
}

export function JobView({
  onCandidateClick,
  candidatesList,
  setCandidatesList,
  vacancy,
  onPublish
}: {
  onCandidateClick: (id: string) => void,
  candidatesList: any[],
  setCandidatesList: React.Dispatch<React.SetStateAction<any[]>>,
  vacancy?: Vacancy,
  onPublish?: () => void
}) {
  const activeTab = 'cvs'; // Solo tab de candidatos es accesible
  const [searchQuery, setSearchQuery] = useState('');
  const [isSerenaOpen, setIsSerenaOpen] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filterOrigin, setFilterOrigin] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [serenaMode, setSerenaMode] = useState<'global' | 'search'>('global');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importCount, setImportCount] = useState(0);


  // Debug Refs
  const rootRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);


  React.useEffect(() => {
    console.log('[JobView] State Update - Tab:', activeTab, 'Serena:', isSerenaOpen);
  }, [activeTab, isSerenaOpen]);

  const activeFiltersCount = [
    filterOrigin !== 'all',
    filterStage !== 'all',
    filterStatus !== 'all'
  ].filter(Boolean).length;


  React.useEffect(() => {
    const checkLayout = () => {
      if (rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect();
        console.log('[LayoutDebug] Root:', { width: rect.width, height: rect.height });
      }
      
      const tableContainer = document.querySelector('.overflow-x-auto');
      if (tableContainer) {
        const { scrollWidth, clientWidth, scrollHeight, clientHeight } = tableContainer;
        console.log('[LayoutDebug] Table Container:', { 
          hasHorizontalScroll: scrollWidth > clientWidth,
          hasVerticalScroll: scrollHeight > clientHeight,
          scrollWidth, clientWidth,
          scrollHeight, clientHeight
        });
        
        const style = window.getComputedStyle(tableContainer);
        console.log('[LayoutDebug] Table Container Styles:', {
          border: style.border,
          borderRight: style.borderRight,
          overflowX: style.overflowX,
          overflowY: style.overflowY
        });
      }

      const mainContent = contentRef.current;
      if (mainContent) {
        console.log('[LayoutDebug] Parent Content Width:', mainContent.offsetWidth);
        const innerContent = mainContent.firstElementChild as HTMLElement;
        if (innerContent) {
          console.log('[LayoutDebug] Inner Content (1600px) Width:', innerContent.offsetWidth);
          console.log('[LayoutDebug] Inner Content MaxWidth:', window.getComputedStyle(innerContent).maxWidth);
        }
      }
    };

    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, [activeTab, isSerenaOpen, candidatesList]);

  const filteredCandidates = candidatesList.filter(candidate => {
    // Search query filter
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.identification?.includes(searchQuery) ||
                         candidate.phone?.includes(searchQuery);
    
    // Origin filter
    const matchesOrigin = filterOrigin === 'all' || 
                         (filterOrigin === 'serena' && candidate.origin === 'Serena IA') ||
                         (filterOrigin === 'vacante' && candidate.origin === 'Vacante') ||
                         (filterOrigin === 'cv' && candidate.origin === 'Importado por CV');

    // Stage filter
    const matchesStage = filterStage === 'all' || 
                        candidate.stage === stages.find(s => s.id === filterStage)?.name;

    // Status filter
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && (candidate.status === 'active' || candidate.status === 'hired')) ||
                         (filterStatus === 'action_required' && candidate.status === 'action_required') ||
                         (filterStatus === 'on_hold' && candidate.status === 'on_hold') ||
                         (filterStatus === 'rejected' && candidate.status === 'rejected');

    return matchesSearch && matchesOrigin && matchesStage && matchesStatus;
  });

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  const handleImportCandidate = (candidate: any) => {
    console.log("Importando candidato:", candidate);
    const newId = `cand-sim-${Date.now()}`;
    const newCandidate = { 
      ...candidate, 
      id: newId,
      name: 'Alejandro Martínez Rodríguez',
      firstName: 'Alejandro',
      lastName: 'Martínez Rodríguez',
      email: 'alejandro.martinez@email.com',
      phone: '+57 315 987 6543',
      age: 32,
      identificationNumber: '1.084.567.890',
      identificationType: 'Cédula de Ciudadanía',
      nationality: 'Colombiana',
      linkedin: 'https://www.linkedin.com/in/alejandromartinez',
      birthDate: '12/08/1992',
      location: 'Medellín, Colombia',
      city: 'Medellín',
      country: 'Colombia',
      willingToRelocate: true,
      interestedLocations: ['Bogotá', 'Remote', 'Miami', 'Madrid'],
      yearsExperience: 8,
      expectedSalary: '$14.500.000 COP',
      noticePeriod: '15',
      noticePeriodUnit: 'Días',
      currency: 'Peso colombiano (COP)',
      availability: 'Tiempo completo',
      origin: 'Importado por CV',
      stage: 'Screening Talent',
      status: 'processing' as const,
      avatar: candidate.avatar || 'AM',
      identification: `1.084.567.890`,
      description: 'Senior Software Engineer con más de 8 años de trayectoria especializado en arquitecturas distribuidas y sistemas de alto rendimiento. Experto en Golang y el ecosistema Cloud Native (Docker, Kubernetes). Enfocado en la excelencia técnica, mentoría de equipos y optimización de procesos críticos de negocio con enfoque en escalabilidad y mantenibilidad.',
      applications: [
        {
          id: `app-sim-${Date.now()}`,
          jobTitle: 'Desarrollador Golang',
          jobLocation: 'Remoto',
          currentStage: 'screening-talent',
          status: 'active',
          appliedDate: new Date().toISOString().split('T')[0],
          matchScore: 94,
          confidence: 'high',
          scores: {
            cvScore: 94,
            serenaScore: 88
          },
          cvEvaluation: {
            summary: 'Perfil técnico excepcional con una alineación del 94% respecto a los requisitos de la vacante. Alejandro demuestra una profundidad técnica sobresaliente en el lenguaje Go y una sólida base en ingeniería de software y sistemas distribuidos.',
            score: 94,
            criteria: [
              { label: 'Experiencia Seniority', score: 95, status: 'pass' },
              { label: 'Dominio de Golang', score: 98, status: 'pass' },
              { label: 'Ecosistema Cloud (K8s/Docker)', score: 92, status: 'pass' },
              { label: 'Formación Académica', score: 90, status: 'pass' }
            ],
            evaluations: [
              { category: 'Experiencia Backend', description: 'Posee más de 8 años en desarrollo backend, con una especialización profunda en Go en los últimos 5 años.' },
              { category: 'Diseño de Sistemas', description: 'Experiencia comprobada diseñando microservicios que manejan altos volúmenes de tráfico.' },
              { category: 'Ajuste de Stack', description: 'Su dominio de gRPC, PostgreSQL y Redis encaja perfectamente con nuestra arquitectura.' }
            ]
          },
          serenaInterview: {
            transcript: [
              { role: 'serena', text: 'Hola Alejandro, bienvenido. Veo que tienes mucha experiencia con Go. ¿Podrías explicarme cómo manejas la gestión de memoria y el Garbage Collector en aplicaciones de alto tráfico?', timestamp: '09:00' },
              { role: 'candidate', text: '¡Claro! En Go, es vital minimizar las asignaciones en el heap. Utilizo sync.Pool para reutilizar objetos y trato de preferir stack allocation cuando es posible. También monitoreo el GOGC y uso herramientas de profiling como pprof para identificar cuellos de botella.', timestamp: '09:02' }
            ],
            questionScores: [
              { objective: 'Profundidad Técnica', question: 'Gestión de memoria en Go', score: 96, analysis: 'Respuesta de nivel senior, entiende perfectamente los mecanismos internos del runtime de Go.' }
            ],
            overallFeedback: {
              summary: 'Candidato con perfil de liderazgo técnico y excelente dominio del stack. Comunicación clara y estructurada.',
              strengths: ['Arquitecturas distribuidas', 'Optimización de performance', 'Liderazgo técnico'],
              improvements: ['Puede profundizar en metodologías ágiles a escala']
            }
          }
        }
      ],
      experience: [
        {
          id: `exp-sim-${Date.now()}-1`,
          company: 'TechFlow Solutions',
          position: 'Senior Backend Engineer (Go)',
          duration: 'Nov 2020 - Presente',
          description: 'Liderazgo técnico de la unidad de servicios financieros. Arquitecto principal del sistema de procesamiento de pagos en tiempo real.',
          location: 'Medellín, Colombia',
          startDate: 'Noviembre 2020',
          endDate: null,
          current: true,
          achievements: [
            'Reducción del tiempo de respuesta de la API en un 45% mediante optimización de queries y caché.',
            'Implementación de una arquitectura basada en eventos usando Apache Kafka.',
            'Migración exitosa de 15 microservicios a un cluster de Kubernetes administrado.',
            'Establecimiento de estándares de código y procesos de code review que redujeron bugs en producción en un 30%.'
          ]
        },
        {
          id: `exp-sim-${Date.now()}-2`,
          company: 'DataStream Systems',
          position: 'Senior Backend Developer',
          duration: 'Ene 2018 - Oct 2020',
          description: 'Desarrollo de pipelines de procesamiento de datos masivos. Implementación de servicios RESTful y gRPC.',
          location: 'Bogotá, Colombia',
          startDate: 'Enero 2018',
          endDate: 'Octubre 2020',
          current: false,
          achievements: [
            'Diseño de un motor de búsqueda interno que mejoró la velocidad de indexación en un 60%.',
            'Desarrollo de conectores personalizados para diversas fuentes de datos SQL y NoSQL.',
            'Optimización de procesos de extracción de datos (ETL) reduciendo el tiempo de ejecución en un 40%.'
          ]
        },
        {
          id: `exp-sim-${Date.now()}-3`,
          company: 'SoftInnovate Ltd',
          position: 'Software Engineer',
          duration: 'Jun 2016 - Dic 2017',
          description: 'Desarrollo de aplicaciones web utilizando Java y Spring Boot.',
          location: 'Medellín, Colombia',
          startDate: 'Junio 2016',
          endDate: 'Diciembre 2017',
          current: false,
          achievements: [
            'Participación en el desarrollo del módulo de autenticación centralizada.',
            'Optimización de procesos de integración continua.',
            'Liderazgo de un equipo pequeño de 3 desarrolladores junior.'
          ]
        },
        {
          id: `exp-sim-${Date.now()}-4`,
          company: 'Global Dev Corp',
          position: 'Junior Developer',
          duration: 'Ene 2015 - May 2016',
          description: 'Desarrollo de componentes frontend y mantenimiento de APIs básicas.',
          location: 'Medellín, Colombia',
          startDate: 'Enero 2015',
          endDate: 'Mayo 2016',
          current: false,
          achievements: [
            'Migración exitosa de interfaces legadas a React.',
            'Documentación completa de la API interna del proyecto principal.'
          ]
        }
      ],
      skills: {
        technical: ['Golang', 'Docker', 'Kubernetes', 'gRPC', 'PostgreSQL', 'Redis', 'Kafka', 'AWS', 'Terraform', 'Prometheus', 'Grafana', 'Git', 'CI/CD', 'Microservicios', 'Arquitectura Hexagonal'],
        soft: ['Liderazgo Técnico', 'Resolución de Problemas Complejos', 'Mentoría', 'Comunicación Asertiva', 'Pensamiento Estratégico', 'Trabajo en Equipo', 'Adaptabilidad']
      },
      education: [
        {
          institution: 'Universidad Nacional de Colombia',
          degree: 'Magíster en Ingeniería de Sistemas',
          year: '2020',
          description: 'Tesis enfocada en algoritmos de consenso en sistemas distribuidos y tolerancia a fallos.'
        },
        {
          institution: 'Universidad Nacional de Colombia',
          degree: 'Ingeniería de Sistemas',
          year: '2016',
          description: 'Énfasis en ingeniería de software, bases de datos y algoritmos avanzados.'
        },
        {
          institution: 'Massachusetts Institute of Technology (Online)',
          degree: 'Cloud Computing Architecture',
          year: '2021',
          description: 'Certificación avanzada en diseño de arquitecturas en la nube.'
        },
        {
          institution: 'AWS Certified',
          degree: 'Solutions Architect Professional',
          year: '2023',
          description: 'Nivel profesional de certificación en arquitectura AWS.'
        }
      ],
      portfolio: {
        url: 'https://github.com/alejandromartinez-dev',
        projects: [
          {
            name: 'Go-Micro-Starter',
            description: 'Framework minimalista para microservicios en Go.',
            impact: 'Utilizado por más de 500 desarrolladores en la comunidad.'
          },
          {
            name: 'DistriCache',
            description: 'Sistema de caché distribuida con consistencia eventual.',
            impact: 'Proyecto destacado en la conferencia local de software 2022.'
          }
        ]
      },
      notes: [
        'Candidato con perfil de liderazgo claro y gran capacidad de análisis.',
        'Muy buen dominio de los fundamentales de sistemas distribuidos y performance.',
        'Activo en la comunidad Open Source de Go y conferencias de tecnología.',
        'Potencial para escalar a roles de Staff Engineer en el corto plazo.'
      ],
      documents: [
        {
          id: `doc-sim-${Date.now()}-cv`,
          name: 'CV_Alejandro_Martinez.pdf',
          type: 'PDF',
          size: '2.4 MB',
          uploadedDate: new Date().toISOString().split('T')[0],
          uploadedBy: 'Sistema (Importación Automática)'
        }
      ]
    };

    const newCount = importCount + 1;
    setImportCount(newCount);

    // Siempre agregar a la lista como "En progreso"
    setCandidatesList(prev => [
      {
        ...newCandidate,
        importStatus: 'En progreso',
        importDate: null,
        importId: null
      },
      ...prev
    ]);

    // Simular procesamiento de importación CV - Diferentes errores según el contador
    setTimeout(() => {
      const importId = `IMP-${String(Math.random()).substring(2, 7)}`;

      if (newCount === 1) {
        // Primera importación: éxito
        setCandidatesList(prev =>
          prev.map(c => c.id === newId ? {
            ...c,
            status: 'active',
            importStatus: 'Importado',
            importDate: new Date().toISOString(),
            importId: importId
          } : c)
        );
        toast.success(`${candidate.name} importado correctamente`);
      } else if (newCount === 2) {
        // Segunda importación: Error de sistema - mostrar toast y remover de tabla
        setCandidatesList(prev => prev.filter(c => c.id !== newId));
        toast.error(`Error de sistema al importar ${candidate.name}. Por favor, intenta de nuevo.`);
      } else if (newCount === 3) {
        // Tercera importación: Error de duplicado en la vacante
        setCandidatesList(prev => prev.filter(c => c.id !== newId));
        toast.error(`Este candidato ya existe en la vacante. Por favor, intenta con otro CV.`);
      } else if (newCount === 4) {
        // Cuarta importación: Error - ya existe en la empresa
        setCandidatesList(prev => prev.filter(c => c.id !== newId));
        toast.error(`Este candidato ya existe en la empresa. Solo puedes agregarlo o invitarlo a esta vacante.`);
      } else if (newCount >= 5) {
        // Quinta importación en adelante: Error de extracción de datos
        setCandidatesList(prev => prev.filter(c => c.id !== newId));
        toast.error(`No pudimos extraer datos del candidato. Asegurate de que lo que estás subiendo es un PDF de un CV.`);
      }
    }, 3000);
  };
  const [expandedSections, setExpandedSections] = useState<Record<string, { active: boolean; discarded: boolean }>>({
    'screening-talent': { active: true, discarded: false },
    'evaluacion-cv': { active: true, discarded: false },
    'evaluacion-serena': { active: true, discarded: false },
    'evaluacion-psicometrica': { active: true, discarded: false },
    'entrevista-tecnica': { active: true, discarded: false },
    'entrevista-pm': { active: true, discarded: false },
    'entrevista-hiring': { active: true, discarded: false },
    'antecedentes': { active: true, discarded: false },
    'seleccionado': { active: true, discarded: false }
  });

  // Agrupar candidatos por etapa usando la lista filtrada
  const candidatesByStage = stages.map(stage => {
    const stageCandidates = filteredCandidates.filter(c => c.stage === stage.name);
    const active = stageCandidates.filter(c => c.status !== 'rejected');
    const discarded = stageCandidates.filter(c => c.status === 'rejected');
    
    return {
      ...stage,
      active,
      discarded,
      total: stageCandidates.length
    };
  });
    
  const renderCandidateCard = (candidate: any, isTourTarget?: boolean) => {
    const app = candidate._activeApp || candidate.applications?.[0] || {} as any;
    const daysSinceApplied = app.appliedDate 
      ? Math.floor((new Date().getTime() - new Date(app.appliedDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    return (
      <div 
        key={candidate.id}
        data-tour={isTourTarget ? "candidate-card" : undefined}
        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer mb-2 relative"
        onClick={() => onCandidateClick(candidate.id)}
      >
        <div className="flex items-start gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {candidate.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-xs text-gray-900 truncate">{candidate.name}</h4>
          </div>
          <button className="p-0.5 hover:bg-gray-100 rounded flex-shrink-0">
            <MoreVertical className="w-3 h-3 text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={cn(
             "text-[10px] px-1.5 py-0",
             app.status === 'hired' ? "bg-green-50 text-green-700 border-green-100" :
             app.status === 'rejected' ? "bg-red-50 text-red-700 border-red-100" :
             "bg-blue-50 text-blue-700 border-blue-100"
          )}>
            {app.status === 'hired' ? 'Contratado' : app.status === 'rejected' ? 'Descartado' : 'En proceso'}
          </Badge>
          <span className="text-[9px] text-gray-400 font-medium">Hace {daysSinceApplied}d</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div ref={rootRef} className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      <div ref={headerRef} className="z-10 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-8 pt-6">
          
          {/* Layer 1: Context & Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
              <span className="hover:text-gray-600 cursor-pointer transition-colors">Reclutamiento</span>
              <span className="text-gray-200">/</span>
              <span className="text-blue-600">Vacante</span>
            </div>
          </div>

          {/* Layer 2: Main Title & Hero Actions */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6 min-w-0">
              <Button variant="outline" size="icon" className="h-11 w-11 border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent transition-all rounded-xl flex-shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-4 min-w-0">
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight truncate">
                  {vacancy?.title || 'Desarrollador Golang'}
                </h1>
                <button
                  onClick={onPublish}
                  className={cn(
                    "border-none text-[10px] px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer hover:scale-105",
                    vacancy?.status === 'published'
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                  )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", vacancy?.status === 'published' ? "bg-emerald-500" : "bg-amber-500")} />
                  {vacancy?.status === 'published' ? 'Publicada' : 'Borrador'}
                </button>
                <Badge className="bg-gray-100 text-gray-600 border-none text-[10px] px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 flex-shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  {vacancy?.status === 'published' ? 'Pública' : 'Privada'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
                <Button 
                  onClick={() => {
                    setSerenaMode('global');
                    setIsSerenaOpen(!isSerenaOpen);
                  }}
                  className="h-11 px-6 rounded-full font-semibold text-xs transition-all flex items-center gap-2 shadow-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 text-white hover:scale-105 shadow-indigo-100"
                >
                  <Sparkles className={cn("w-4 h-4", !isSerenaOpen && "animate-pulse")} />
                  Serena IA
                </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="p-[2px] bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 rounded-full group transition-all hover:shadow-lg hover:shadow-indigo-100">
                    <Button variant="ghost" className="bg-white hover:bg-transparent text-gray-600 font-semibold text-[11px] h-[40px] px-6 transition-all rounded-full flex items-center gap-2 relative overflow-hidden w-full">
                      <Sparkles className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
                      <span className="group-hover:text-white transition-colors">Importar candidatos</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-gray-100 bg-white">
                  <DropdownMenuItem 
                    onClick={() => {
                      setSerenaMode('search');
                      setIsSerenaOpen(true);
                      setSearchTrigger(prev => prev + 1);
                    }}
                    className="flex items-start gap-3.5 p-3.5 cursor-pointer rounded-xl hover:bg-gray-50 transition-all group outline-none"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                      <Search className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        Búsqueda Inteligente
                        <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                      </span>
                      <p className="text-xs text-gray-500 leading-snug">Encuentra perfiles ideales automáticamente en tu base de datos.</p>
                    </div>
                  </DropdownMenuItem>

                  <div className="h-px bg-gray-100 my-1 mx-2" />

                  <DropdownMenuItem 
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-start gap-3.5 p-3.5 cursor-pointer rounded-xl hover:bg-gray-50 transition-all group outline-none"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                      <Upload className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">Importar CV</span>
                      <p className="text-xs text-gray-500 leading-snug">Sube hojas de vida en formato PDF o carpetas ZIP.</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip content="Ir a la vacante">
                <Button variant="outline" size="icon" className="h-11 w-11 border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent transition-all rounded-xl">
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </Tooltip>

              <Tooltip content="Editar vacante">
                <Button variant="outline" size="icon" className="h-11 w-11 border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent transition-all rounded-xl">
                  <Pencil className="w-4 h-4" />
                </Button>
              </Tooltip>

              <Tooltip content="Eliminar vacante">
                <Button variant="outline" size="icon" className="h-11 w-11 border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-100 bg-transparent transition-all rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Layer 3: Stats Cards (Bento style) */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500">Candidatos totales</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-semibold text-gray-900">32</span>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500">Nuevos (Semana)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-semibold text-gray-900">0</span>
                <span className="text-[10px] font-semibold text-gray-400">Sin cambios</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-medium text-gray-500">Entrevistas</span>
                <span className="text-[11px] font-semibold text-gray-700">48/80</span>
              </div>
              <div className="h-2 w-full bg-gray-200/50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[60%] shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-medium text-gray-500">Psicométricas</span>
                <span className="text-[11px] font-semibold text-gray-700">28/60</span>
              </div>
              <div className="h-2 w-full bg-gray-200/50 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[47%] shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
              </div>
            </div>
          </div>

          {/* Layer 4: Modern Segmented Navigation Tabs */}
          <div className="flex mb-4 bg-gray-100 p-1 rounded-full w-fit border border-gray-200/40">
            {['Info Vacante', 'Pipeline de Selección', vacancy?.status === 'draft' ? 'Candidatos importados' : 'Candidatos de la vacante'].map((tab) => {
              const candidateTabLabel = vacancy?.status === 'draft' ? 'Candidatos importados' : 'Candidatos de la vacante';
              const isTabActive = tab === candidateTabLabel;
              const isDisabled = tab !== candidateTabLabel;

              return (
                <button
                  key={tab}
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      // No-op, activeTab es siempre 'cvs'
                    }
                  }}
                  className={cn(
                    "relative px-6 py-2 rounded-full text-[11px] font-semibold transition-all duration-300 flex items-center gap-2",
                    isTabActive
                      ? "bg-blue-600 text-white shadow-md"
                      : isDisabled
                      ? "text-gray-300 cursor-not-allowed opacity-50"
                      : "text-gray-400 hover:text-gray-600 cursor-pointer"
                  )}
                >
                  {isTabActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div ref={contentRef} className="flex-1 flex flex-row overflow-hidden justify-center bg-gray-50">
        <div className="w-full max-w-[1600px] flex flex-row overflow-hidden">
        {activeTab === 'cvs' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Table View - Hidden if no candidates */}
            <div className={cn(
              "flex-1 w-full flex flex-col overflow-hidden px-8 py-6 gap-6",
              candidatesList.length === 0 && "hidden"
            )}>
              {/* Table Header / Filters */}
              <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre o rol..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setIsFilterDrawerOpen(true)}
                      variant="outline" 
                      className={cn(
                        "rounded-xl border-gray-200 text-gray-600 gap-2 h-10 transition-all",
                        isFilterDrawerOpen && "bg-gray-100 border-gray-300",
                        (filterOrigin !== 'all' || filterStage !== 'all' || filterStatus !== 'all') && "border-blue-500 text-blue-600 bg-blue-50"
                      )}
                    >
                      <Filter className="w-4 h-4" /> Filtros
                      {activeFiltersCount > 0 && (
                        <span className="ml-2 bg-blue-600 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                    <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 gap-2 h-10">
                      <Download className="w-4 h-4" /> Exportar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-semibold text-gray-500">Candidato</th>
                        {vacancy?.status === 'draft' ? (
                          <>
                            <th className="px-6 py-4 text-[11px] font-semibold text-gray-500">Identificación</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-gray-500">Fecha de Importación</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-gray-500">ID Importación</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-gray-500">Origen</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-gray-500">Estado de Importación</th>
                          </>
                        ) : (
                          <>
                            <th className="px-6 py-4 text-[11px] font-semibold text-gray-500">Origen</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-gray-500">Identificación</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-gray-500">Etapa</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-gray-500">Estado</th>
                          </>
                        )}
                        <th className="px-6 py-4 text-[11px] font-semibold text-gray-500 text-right">Acciones</th>
                      </tr>
                    </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredCandidates.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-24">
                              <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-[24px] flex items-center justify-center mb-4 border border-blue-100">
                                  <Search className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">No se encontraron candidatos</h3>
                                <p className="text-xs text-gray-500 max-w-[280px] leading-relaxed">
                                  No hay resultados para tu búsqueda o filtros actuales. Intenta ajustar los criterios para encontrar lo que necesitas.
                                </p>
                                <Button 
                                  variant="ghost" 
                                  onClick={() => {
                                    setSearchQuery('');
                                    setFilterOrigin('all');
                                    setFilterStage('all');
                                    setFilterStatus('all');
                                  }}
                                  className="mt-6 text-blue-600 hover:text-blue-700 font-bold text-xs bg-blue-50/50 px-6 rounded-xl"
                                >
                                  Limpiar todos los filtros
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          (() => {
                            const tableCandidates = vacancy?.status === 'draft'
                              ? filteredCandidates.filter(c => c.origin === 'Serena IA' || c.origin === 'Importado por CV')
                              : filteredCandidates;
                            return tableCandidates.map((candidate) => (
                              <tr
                                key={candidate.id}
                                onClick={() => {
                                  if (vacancy?.status === 'draft' && candidate.importStatus !== 'Importado') return;
                                  onCandidateClick(candidate.id);
                                }}
                                className="hover:bg-gray-50 transition-colors group cursor-pointer"
                              >
                            <td className="px-6 py-4">
                              {candidate.importStatus === 'Error' ? (
                                <span className="text-xs font-semibold text-gray-400">--</span>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                                    {candidate.name.charAt(0)}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">{candidate.name}</span>
                                </div>
                              )}
                            </td>
                            {vacancy?.status === 'draft' ? (
                              <>
                                <td className="px-6 py-4">
                                  {candidate.importStatus === 'Error' ? (
                                    <span className="text-xs font-semibold text-gray-400">--</span>
                                  ) : (
                                    <div
                                      onClick={(e) => handleCopy(e, candidate.identification, 'Identificación')}
                                      className="group/item flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                      {candidate.identification}
                                      <Copy className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {candidate.importStatus === 'Error' ? (
                                    <span className="text-xs font-semibold text-gray-400">--</span>
                                  ) : (
                                    <span className="text-xs font-semibold text-gray-600">
                                      {candidate.importDate ? new Date(candidate.importDate).toLocaleDateString('es-CO') : 'N/A'}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {candidate.importId ? (
                                    <div
                                      onClick={(e) => handleCopy(e, candidate.importId, 'ID Importación')}
                                      className="group/item flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                      {candidate.importId}
                                      <Copy className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                    </div>
                                  ) : (
                                    <span className="text-xs font-semibold text-gray-400">Procesando...</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {candidate.importStatus === 'Error' ? (
                                    <span className="text-xs font-semibold text-gray-400">--</span>
                                  ) : (
                                    <Badge className={cn(
                                      "text-[10px] px-2 py-0.5 border-none font-semibold rounded-lg",
                                      candidate.origin === 'Serena IA' ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-600"
                                    )}>
                                      {candidate.origin === 'Serena IA' && <Sparkles className="w-3 h-3 mr-1 inline" />}
                                      {candidate.origin}
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <Badge className={cn(
                                    "text-[10px] px-2 py-0.5 border-none font-semibold rounded-lg transition-all duration-300",
                                    candidate.importStatus === 'En progreso' ? "bg-blue-50 text-blue-600 animate-pulse" :
                                    candidate.importStatus === 'Invitación enviada' ? "bg-blue-50 text-blue-600" :
                                    candidate.importStatus === 'Error' ? "bg-red-50 text-red-600" :
                                    "bg-emerald-50 text-emerald-600"
                                  )}>
                                    {candidate.importStatus === 'En progreso' ? (
                                      <span className="flex items-center gap-1.5">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        En progreso
                                      </span>
                                    ) : candidate.importStatus === 'Error' ? (
                                      <span className="flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Error
                                      </span>
                                    ) : (
                                      candidate.importStatus
                                    )}
                                  </Badge>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-4">
                                  <Badge className={cn(
                                    "text-[10px] px-2 py-0.5 border-none font-semibold rounded-lg",
                                    candidate.origin === 'Serena IA' ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-600"
                                  )}>
                                    {candidate.origin === 'Serena IA' && <Sparkles className="w-3 h-3 mr-1 inline" />}
                                    {candidate.origin}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    onClick={(e) => handleCopy(e, candidate.identification, 'Identificación')}
                                    className="group/item flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                                  >
                                    {candidate.identification}
                                    <Copy className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant="outline" className="text-[10px] border-gray-200 text-gray-500 font-semibold px-2 py-0.5 rounded-lg bg-white">
                                    {candidate.stage}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant="outline" className={cn(
                                    "text-[10px] px-2 py-0.5 border-none font-semibold rounded-lg transition-all duration-300",
                                    candidate.status === 'processing' ? "bg-blue-50 text-blue-600 animate-pulse" :
                                    candidate.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                                    candidate.status === 'hired' ? "bg-blue-50 text-blue-600" :
                                    candidate.status === 'action_required' ? "bg-amber-50 text-amber-600" :
                                    "bg-rose-50 text-rose-600"
                                  )}>
                                    {candidate.status === 'processing' ? (
                                      <span className="flex items-center gap-1.5">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        En progreso
                                      </span>
                                    ) : candidate.status === 'active' ? 'Activo' :
                                     candidate.status === 'hired' ? 'Contratado' :
                                     candidate.status === 'action_required' ? 'Acción Requerida' :
                                     'Descartado'}
                                  </Badge>
                                </td>
                              </>
                            )}
                          <td className="px-6 py-4 text-right">
                            <div onClick={(e) => e.stopPropagation()}>
                              {vacancy?.status === 'draft' ? (
                                <>
                                  {candidate.importStatus === 'Importado' && (
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onCandidateClick(candidate.id);
                                      }}
                                      className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 text-xs font-semibold px-2 py-1 rounded-md transition-colors"
                                      size="sm"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 mr-1 inline" />
                                      Ver candidato
                                    </Button>
                                  )}
                                  {candidate.importStatus === 'Invitación enviada' && (
                                    <Button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toast.info('Invitación reenviada a ' + candidate.email);
                                      }}
                                      className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 text-xs font-semibold px-2 py-1 rounded-md transition-colors"
                                      size="sm"
                                    >
                                      <Mail className="w-3.5 h-3.5 mr-1 inline" />
                                      Reenviar invitación
                                    </Button>
                                  )}
                                  {candidate.importStatus === 'Error' && (
                                    <Button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsImportModalOpen(true);
                                      }}
                                      className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 text-xs font-semibold px-2 py-1 rounded-md transition-colors"
                                      size="sm"
                                    >
                                      <RotateCw className="w-3.5 h-3.5 mr-1 inline" />
                                      Volver a cargar
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-gray-100 bg-white/95 backdrop-blur-sm">
                                    {/* Core Actions */}
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onCandidateClick(candidate.id);
                                      }}
                                      className="flex items-center gap-3 p-2.5 cursor-pointer rounded-xl hover:bg-blue-50 transition-colors group"
                                    >
                                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                      <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">Ver perfil completo</span>
                                    </DropdownMenuItem>
                                  
                                  <div className="my-1 h-px bg-gray-100" />
                                  
                                  <DropdownMenuItem 
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-3 p-2.5 cursor-pointer rounded-xl hover:bg-blue-50 transition-colors group"
                                  >
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                    <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">Siguiente etapa</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger 
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-3 p-2.5 cursor-pointer rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                      <Layers className="w-4 h-4 text-gray-400" />
                                      <span className="text-xs font-semibold text-gray-600">Mover a etapa</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent 
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-56 p-2 rounded-2xl shadow-2xl border-gray-100 bg-white ml-1"
                                      >
                                        {[
                                          'Screening con Talent',
                                          'Evaluación CV',
                                          'Serena AI',
                                          'Psicométrico',
                                          'Caso Product Sense',
                                          'Entrevista Hiring',
                                          'Antecedentes',
                                          'Seleccionado'
                                        ].map((stage) => (
                                          <DropdownMenuItem 
                                            key={stage} 
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-2 p-2 cursor-pointer rounded-lg hover:bg-gray-50"
                                          >
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-xs font-medium text-gray-600">{stage}</span>
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>

                                  <DropdownMenuItem 
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-3 p-2.5 cursor-pointer rounded-xl hover:bg-gray-50 transition-colors group"
                                  >
                                    <FastForward className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-600">Omitir etapa</span>
                                  </DropdownMenuItem>

                                  <div className="my-1 h-px bg-gray-100" />

                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger 
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-3 p-2.5 cursor-pointer rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                      <MoreVertical className="w-4 h-4 text-gray-400 rotate-90" />
                                      <span className="text-xs font-semibold text-gray-600">Más opciones</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent 
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-60 p-2 rounded-2xl shadow-2xl border-gray-100 bg-white ml-1"
                                      >
                                        {[
                                          { icon: Users, label: 'Agregar entrevista' },
                                          { icon: ShieldCheck, label: 'Verificación Antecedentes' },
                                          { icon: Copy, label: 'Copiar Application ID' },
                                          { separator: true },
                                          { icon: MessageCircle, label: 'WhatsApp', color: 'text-emerald-500' },
                                          { icon: Mail, label: 'Email', color: 'text-blue-500' },
                                          { icon: Phone, label: 'Llamar' },
                                          { separator: true },
                                          { icon: FileText, label: 'Ver CV' },
                                          { icon: Download, label: 'Descargar CV' },
                                          { icon: Printer, label: 'Imprimir perfil' },
                                        ].map((item, idx) => (
                                          item.separator ? (
                                            <div key={`sep-${idx}`} className="my-1 h-px bg-gray-50" />
                                          ) : (
                                            <DropdownMenuItem 
                                              key={item.label} 
                                              onClick={(e) => e.stopPropagation()}
                                              className="flex items-center gap-3 p-2.5 cursor-pointer rounded-lg hover:bg-gray-50"
                                            >
                                              {item.icon && <item.icon className={cn("w-4 h-4 text-gray-400", item.color)} />}
                                              <span className="text-xs font-medium text-gray-600">{item.label}</span>
                                            </DropdownMenuItem>
                                          )
                                        ))}
                                      </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>

                                  <div className="my-1 h-px bg-gray-100" />

                                  <DropdownMenuItem 
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-3 p-2.5 cursor-pointer rounded-xl hover:bg-rose-50 transition-colors group"
                                  >
                                    <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                                    <span className="text-xs font-semibold text-gray-600 group-hover:text-rose-600">Descartar candidato</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              )}
                            </div>
                          </td>
                            </tr>
                            ));
                          })()
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Empty State - Hidden if candidates exist */}
            <div className={cn(
              "flex-1 flex flex-col items-center justify-center text-gray-500",
              candidatesList.length > 0 && "hidden"
            )}>
              <div className="p-8 border-2 border-dashed border-gray-200 rounded-[32px] max-w-md text-center bg-white shadow-sm">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">{vacancy?.status === 'draft' ? 'Candidatos importados' : 'Candidatos de la vacante'}</h3>
                <p className="text-sm text-gray-500 mb-10 max-w-[280px] mx-auto leading-relaxed">
                  Aún no tienes candidatos. Comienza importando CVs o usando nuestra búsqueda inteligente con IA.
                </p>
                <div className="flex flex-col items-center gap-8">
                  <div className="flex items-center gap-4">
                    <div className="p-[2px] bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 rounded-[20px] group transition-all hover:shadow-xl hover:shadow-indigo-100">
                      <Button 
                        variant="ghost"
                        onClick={() => {
                          setIsSerenaOpen(true);
                          setSearchTrigger(prev => prev + 1);
                        }}
                        className="bg-white border-none text-blue-600 px-10 h-[56px] rounded-[18px] font-semibold text-sm hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-5 h-5 animate-pulse" /> Buscar con Serena IA
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setIsImportModalOpen(true)}
                      className="border-gray-200 text-gray-600 px-10 h-[60px] rounded-[22px] font-semibold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 bg-white"
                    >
                      <Upload className="w-5 h-5" /> Importar por CV
                    </Button>
                  </div>

                  <Button variant="ghost" className="text-gray-400 hover:text-gray-600 font-semibold text-xs flex items-center gap-2 group tracking-wide">
                    Compartir enlace de la vacante <LinkIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {false && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar - Thin */}
            <div className="bg-white border-b border-gray-100 px-6 py-2 flex items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar candidatos..."
                  className="pl-8 h-8 text-[11px] border-gray-200 focus:ring-1"
                />
              </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 w-full overflow-x-auto bg-gray-50/30 px-8 py-4 scrollbar-hide">
                <div className="flex gap-4 h-full min-w-max">
                  {filteredCandidates.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center min-w-full py-20">
                      <div className="w-20 h-20 bg-white rounded-[32px] shadow-xl shadow-gray-100 flex items-center justify-center mb-6 border border-gray-100">
                        <Users className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Tablero vacío</h3>
                      <p className="text-sm text-gray-500 max-w-[320px] leading-relaxed">
                        No hay candidatos que coincidan con tus filtros en ninguna etapa del proceso.
                      </p>
                      <Button 
                        onClick={() => {
                          setSearchQuery('');
                          setFilterOrigin('all');
                          setFilterStage('all');
                          setFilterStatus('all');
                        }}
                        className="mt-8 bg-gray-900 text-white px-8 h-12 rounded-2xl font-bold text-xs hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                      >
                        Restablecer búsqueda
                      </Button>
                    </div>
                  ) : (
                    candidatesByStage.map(stage => (
                      <div key={stage.id} className="w-72 flex flex-col">
                        <div className="bg-white border border-gray-200 p-3 rounded-t-lg shadow-sm">
                          <h3 className="text-xs font-semibold text-gray-900">{stage.order}. {stage.name}</h3>
                          <div className="flex gap-2 text-[9px] text-gray-400 mt-1 font-semibold">
                            <span className="text-green-600">{stage.active.length} activos</span>
                            <span>{stage.total} total</span>
                          </div>
                        </div>
                        <div className="flex-1 bg-gray-100/20 border-x border-b border-gray-200 rounded-b-lg p-2 overflow-y-auto space-y-2">
                          {stage.active.map((c, idx) => renderCandidateCard(c, stage.order === 1 && idx === 0))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={cn(
          "transition-all duration-300 ease-in-out h-full",
          isSerenaOpen ? "w-[452px] py-6 pr-8 opacity-100" : "w-0 overflow-hidden opacity-0"
        )}>
          <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SerenaIAPanel 
              isOpen={isSerenaOpen} 
              onClose={() => setIsSerenaOpen(false)}
              mode={serenaMode}
              allCandidates={candidatesData}
              searchTrigger={searchTrigger}
              onImportCandidate={handleImportCandidate}
            />
          </div>
        </div>
      </div>
    </div>

      {/* Modals & Overlays */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="import-modal-content max-w-2xl p-0 overflow-hidden rounded-[32px] border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-white">
          <div className="relative p-12 bg-gradient-to-b from-blue-50/50 to-white">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white text-blue-600 hover:bg-gray-50 border border-gray-200 transition-all shadow-sm flex items-center justify-center z-10"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100 group">
                <Upload className="w-10 h-10 group-hover:scale-110 transition-transform" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">Importar Candidatos</DialogTitle>
              <p className="text-gray-500 mt-2 text-sm max-w-[360px] mx-auto leading-relaxed">
                Nuestra IA procesará tus archivos PDF o ZIP automáticamente para extraer perfiles completos.
              </p>
            </div>

            {!selectedFile ? (
              <div
                className="relative group cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onClick={() => {
                  setSelectedFile({
                    name: 'CV_Alejandro_Martinez.pdf',
                    size: '2.4 MB'
                  });
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setSelectedFile({
                    name: 'CV_Alejandro_Martinez.pdf',
                    size: '2.4 MB'
                  });
                }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[32px] blur-md opacity-10 group-hover:opacity-20 transition duration-500"></div>
                <div className="relative border-2 border-dashed border-gray-200 rounded-[32px] p-12 bg-white flex flex-col items-center group-hover:border-blue-400 group-hover:bg-blue-50/10 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Selecciona o arrastra tus archivos</h3>
                  <p className="text-sm text-gray-500 font-medium text-center">
                    PDF, DOCX o archivos ZIP comprimidos
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-7 h-7 text-blue-600" />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {selectedFile.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          PDF
                        </span>
                        <span>{selectedFile.size}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        Documento listo para ser procesado. Haz clic en "Comenzar Importación" abajo para extraer el perfil automáticamente.
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Remover documento"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-[24px] border border-gray-100 text-left w-full transition-all hover:shadow-sm">
                <div className="relative flex items-center mt-1">
                  <input 
                    type="checkbox" 
                    id="terms"
                    className="sr-only peer"
                    checked={hasAcceptedTerms}
                    onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-gray-200 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                    {hasAcceptedTerms && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                  </div>
                </div>
                <div className="flex-1">
                  <label htmlFor="terms" className="text-[11px] text-gray-500 leading-relaxed font-medium cursor-pointer block">
                    “Al cargar información en el módulo de reclutamiento, el Cliente declara contar con las autorizaciones necesarias para el tratamiento de los datos suministrados, actuando como Responsable del tratamiento. UBITS actúa como Encargado, tratando dicha información conforme a las instrucciones del Cliente 
                    <span className="text-blue-600 font-bold ml-1 hover:underline underline-offset-2">Política de Tratamiento de Datos y los Términos y Condiciones de UBITS.</span>”
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-12 py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(false)}
              className="h-[52px] px-10 rounded-2xl border-gray-200 text-gray-500 font-bold hover:bg-white hover:text-gray-700 hover:border-gray-300 transition-all bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              disabled={!hasAcceptedTerms || !selectedFile}
              onClick={() => {
                if (!selectedFile) return;
                setIsProcessing(true);
                setIsUploading(true);
                // Simular procesamiento del documento
                setTimeout(() => {
                  handleImportCandidate({ name: 'Alejandro Martínez', avatar: 'AM' });
                  setIsProcessing(false);
                  setIsUploading(false);
                  setSelectedFile(null);
                  setHasAcceptedTerms(false);
                  setIsImportModalOpen(false);
                }, 2000);
              }}
              className={cn(
                "px-14 h-[52px] rounded-2xl font-bold transition-all text-sm shadow-xl flex items-center justify-center gap-2",
                hasAcceptedTerms && selectedFile
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200"
              )}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                'Comenzar Importación'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* Filter Drawer */}
        <Drawer 
          open={isFilterDrawerOpen} 
          onClose={() => setIsFilterDrawerOpen(false)} 
          width="400px"
        >
          <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h2>
                    <p className="text-[10px] font-semibold text-gray-400">Refina tu búsqueda</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Origen */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Origen del candidato
                </label>
                <Select value={filterOrigin} onValueChange={setFilterOrigin}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-all font-semibold text-gray-600">
                    <SelectValue placeholder="Seleccionar origen" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl p-2">
                    <SelectItem value="all" className="rounded-lg font-semibold text-gray-600">Todos los orígenes</SelectItem>
                    <SelectItem value="serena" className="rounded-lg font-semibold text-gray-600">Serena IA</SelectItem>
                    <SelectItem value="vacante" className="rounded-lg font-semibold text-gray-600">Vacante / Web</SelectItem>
                    <SelectItem value="cv" className="rounded-lg font-semibold text-gray-600">Importado por CV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Etapa */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" /> Etapa del proceso
                </label>
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-all font-semibold text-gray-600">
                    <SelectValue placeholder="Seleccionar etapa" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl p-2 max-h-[300px]">
                    <SelectItem value="all" className="rounded-lg font-semibold text-gray-600">Todas las etapas</SelectItem>
                    {stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id} className="rounded-lg font-semibold text-gray-600">
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Estado de la aplicación
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-all font-semibold text-gray-600">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl p-2">
                    <SelectItem value="all" className="rounded-lg font-semibold text-gray-600">Todos los estados</SelectItem>
                    <SelectItem value="active" className="rounded-lg font-semibold text-gray-600">Activo</SelectItem>
                    <SelectItem value="hired" className="rounded-lg font-semibold text-gray-600">Contratado</SelectItem>
                    <SelectItem value="action_required" className="rounded-lg font-semibold text-gray-600">Acción Requerida</SelectItem>
                    <SelectItem value="rejected" className="rounded-lg font-semibold text-gray-600">Descartado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex items-center gap-3">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl border-gray-200 font-semibold text-gray-600 hover:bg-white transition-all"
                onClick={() => {
                  setFilterOrigin('all');
                  setFilterStage('all');
                  setFilterStatus('all');
                }}
              >
                Limpiar
              </Button>
              <Button 
                className="flex-[2] h-12 px-8 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                onClick={() => setIsFilterDrawerOpen(false)}
              >
                Aplicar Filtros
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Drawer>
    </div>
    </>
  );
}
