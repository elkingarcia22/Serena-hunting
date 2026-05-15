import React, { useState } from 'react';
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
  Users
} from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tooltip } from './ui/tooltip';
import { SerenaIAPanel } from './SerenaIAPanel';
import { candidatesData } from '../data/candidatesData';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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

export function JobView({ onCandidateClick }: { onCandidateClick: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState<'info' | 'candidates' | 'cvs'>('cvs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSerenaOpen, setIsSerenaOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
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

  // Agrupar candidatos por etapa usando sus aplicaciones
  const candidatesByStage = stages.map(stage => {
    const stageCandidates = candidatesData.map(c => {
      const appInStage = c.applications?.find(app => app.currentStage === stage.id);
      if (appInStage) {
        return { ...c, _activeApp: appInStage };
      }
      return null;
    }).filter(Boolean) as (any)[];

    const active = stageCandidates.filter(c => c._activeApp.status === 'active' || c._activeApp.status === 'hired');
    const discarded = stageCandidates.filter(c => c._activeApp.status === 'rejected');
    
    return { ...stage, active, discarded, total: stageCandidates.length };
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
          <span className="text-[10px] text-gray-400 uppercase font-bold">Hace {daysSinceApplied}d</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50/50 overflow-hidden font-sans">
      {/* Premium Command Hub Header */}
      <div className="bg-white border-b border-slate-200/60 shadow-sm z-10">
        <div className="max-w-[1600px] mx-auto px-8 pt-6">
          
          {/* Layer 1: Context & Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Reclutamiento</span>
                <span className="text-slate-300">/</span>
                <span className="text-blue-600">Vacantes</span>
              </div>
            </div>
          </div>

          {/* Layer 2: Main Title & Hero Actions */}
          <div className="flex items-end justify-between mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  Desarrollador Golang
                </h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Publicada
                  </Badge>
                  <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3 h-3" /> Pública
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tooltip content={isSerenaOpen ? "Cerrar Asistente" : "Abrir Serena IA"}>
                <button 
                  onClick={() => setIsSerenaOpen(!isSerenaOpen)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 rounded-xl transition-all shadow-lg group active:scale-95",
                    isSerenaOpen 
                      ? "bg-slate-900 text-white shadow-slate-200" 
                      : "bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 text-white hover:scale-105 shadow-md shadow-indigo-100"
                  )}
                >
                  <Sparkles className={cn("w-4 h-4", !isSerenaOpen && "animate-pulse")} />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {isSerenaOpen ? 'Cerrar Serena' : 'Consultar Serena IA'}
                  </span>
                </button>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="p-[2px] bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 rounded-xl group transition-all hover:shadow-lg hover:shadow-indigo-100">
                    <Button variant="ghost" className="bg-white hover:bg-slate-50/50 text-slate-600 font-bold text-[11px] uppercase tracking-wider h-[40px] px-6 transition-all rounded-[10px] flex items-center gap-2 relative overflow-hidden w-full">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span>Importar candidatos</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl shadow-2xl border-slate-100 bg-white/95 backdrop-blur-sm">
                  <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer rounded-xl hover:bg-blue-50 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-blue-100/50 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-blue-600">Búsqueda Inteligente</span>
                      <p className="text-[10px] text-blue-400 font-medium leading-tight">Encuentra perfiles ideales automáticamente.</p>
                    </div>
                  </DropdownMenuItem>

                  <div className="h-px bg-slate-100 my-1 mx-2" />

                  <DropdownMenuItem 
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-start gap-3 p-3 cursor-pointer rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Upload className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-700">Cargar archivos</span>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">Sube archivos en formato PDF o ZIP.</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="icon" className="h-11 w-11 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all rounded-xl">
                <LinkIcon className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="icon" className="h-11 w-11 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all rounded-xl">
                <Pencil className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="icon" className="h-11 w-11 border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-100 transition-all rounded-xl">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Layer 3: Stats Cards (Bento style) */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidatos Totales</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-900">32</span>
              </div>
            </div>
            
            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nuevos (Semana)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-900">0</span>
                <span className="text-[10px] font-bold text-slate-400">Sin cambios</span>
              </div>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entrevistas</span>
                <span className="text-[11px] font-black text-slate-700">48/80</span>
              </div>
              <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[60%] shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              </div>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Psicométricas</span>
                <span className="text-[11px] font-black text-slate-700">28/60</span>
              </div>
              <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[47%] shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
              </div>
            </div>
          </div>

          {/* Layer 4: Navigation Tabs */}
          <div className="flex gap-1">
            {['Info Vacante', 'Pipeline de Selección', 'Candidatos de la vacante'].map((tab) => {
              const isTabActive = (tab === 'Info Vacante' && activeTab === 'info') || 
                                 (tab === 'Pipeline de Selección' && activeTab === 'candidates') ||
                                 (tab === 'Candidatos de la vacante' && activeTab === 'cvs');
              const tabKey = tab === 'Info Vacante' ? 'info' : tab === 'Pipeline de Selección' ? 'candidates' : 'cvs';
              const isDisabled = tab === 'Info Vacante' || tab === 'Pipeline de Selección';
              
              return (
                <button
                  key={tab}
                  onClick={() => !isDisabled && setActiveTab(tabKey as any)}
                  disabled={isDisabled}
                  className={cn(
                    "pb-4 pt-2 text-[11px] font-bold transition-all px-6 relative group",
                    isTabActive 
                      ? "text-blue-600" 
                      : isDisabled 
                        ? "text-slate-300 cursor-not-allowed" 
                        : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <span className={cn(
                    "relative z-10 transition-transform duration-200",
                    isTabActive ? "scale-105" : !isDisabled && "group-hover:translate-y-[-1px]"
                  )}>
                    {tab}
                  </span>
                  {isTabActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.3)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[32px] border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-white">
          <DialogHeader className="px-10 pt-10 pb-0 flex flex-row items-center justify-between border-none">
            <DialogTitle className="text-[22px] font-black text-slate-900 tracking-tight">Importar CVs</DialogTitle>
          </DialogHeader>
          
          <div className="px-10 py-12 flex flex-col items-center">
            {/* Upload Zone Proposal */}
            <div className="w-full border-2 border-dashed border-slate-100 rounded-[24px] bg-slate-50/30 p-10 mb-8 flex flex-col items-center group cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Puedes subir archivos en formato PDF o ZIP.</h3>
              <p className="text-sm text-slate-400 font-medium">
                Si el archivo es ZIP, solo se tendrán en cuenta los PDF incluidos.
              </p>
            </div>

            {/* Legal Terms Card */}
            <div className="flex items-start gap-5 p-7 bg-[#F8FAFC] rounded-[24px] border border-[#F1F5F9] text-left w-full transition-all hover:shadow-sm">
              <Checkbox 
                id="terms" 
                checked={hasAcceptedTerms}
                onCheckedChange={(checked) => setHasAcceptedTerms(checked as boolean)}
                className="mt-1 h-6 w-6 rounded-lg border-slate-200 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all shadow-sm"
              />
              <div className="flex-1">
                <Label htmlFor="terms" className="text-[11px] text-slate-500 leading-[1.6] font-semibold cursor-pointer block">
                  “Al cargar información en el módulo de reclutamiento, el Cliente declara contar con las autorizaciones necesarias para el tratamiento de los datos suministrados, actuando como Responsable del tratamiento. UBITS actúa como Encargado, tratando dicha información conforme a las instrucciones del Cliente 
                  <span className="text-blue-600 font-bold ml-1 hover:underline">Política de Tratamiento de Datos y los Términos y Condiciones de UBITS.</span>”
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="px-10 pb-10 pt-0 bg-transparent gap-4 flex items-center justify-center sm:justify-center">
            <Button 
              variant="outline" 
              onClick={() => setIsImportModalOpen(false)}
              className="px-12 h-[52px] rounded-2xl font-bold text-slate-500 border-slate-200 hover:bg-slate-50 transition-all text-sm"
            >
              Cancelar
            </Button>
            <Button 
              disabled={!hasAcceptedTerms}
              className={cn(
                "px-14 h-[52px] rounded-2xl font-bold transition-all text-sm shadow-xl",
                hasAcceptedTerms 
                  ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200" 
                  : "bg-[#E2E8F0] text-white cursor-not-allowed shadow-none"
              )}
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'cvs' && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-white">
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl max-w-md text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Candidatos de la vacante</h3>
              <p className="text-sm text-slate-500 mb-8 max-w-[280px] mx-auto leading-relaxed">
                Aún no tienes candidatos. Comienza importando CVs o usando nuestra búsqueda inteligente con IA.
              </p>
              <div className="flex flex-col gap-3">
                <div className="p-[2px] bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 rounded-2xl group transition-all hover:shadow-lg hover:shadow-indigo-100">
                  <Button 
                    variant="ghost"
                    className="bg-white border-none text-blue-600 px-8 h-[44px] rounded-[14px] font-bold text-sm hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 w-full"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" /> Buscar con Serena IA
                  </Button>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={() => setIsImportModalOpen(true)}
                  className="border-slate-200 text-slate-500 px-8 h-12 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Importar por CV
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'candidates' && (
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
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-x-auto bg-slate-50/30 p-4 scrollbar-hide">
                <div className="flex gap-4 h-full min-w-max">
                  {candidatesByStage.map(stage => (
                    <div key={stage.id} className="w-72 flex flex-col">
                      <div className="bg-white border border-slate-200 p-3 rounded-t-lg shadow-sm">
                        <h3 className="text-xs font-bold text-slate-800">{stage.order}. {stage.name}</h3>
                        <div className="flex gap-2 text-[9px] text-slate-400 mt-1 font-bold uppercase">
                          <span className="text-green-600">{stage.active.length} activos</span>
                          <span>{stage.total} total</span>
                        </div>
                      </div>
                      <div className="flex-1 bg-slate-100/20 border-x border-b border-slate-200 rounded-b-lg p-2 overflow-y-auto space-y-2">
                        {stage.active.map((c, idx) => renderCandidateCard(c, stage.order === 1 && idx === 0))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <SerenaIAPanel 
                isOpen={isSerenaOpen} 
                onClose={() => setIsSerenaOpen(false)}
                mode="global"
                allCandidates={candidatesData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
