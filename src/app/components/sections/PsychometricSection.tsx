import React from 'react';
import { 
  Brain, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  Target,
  TrendingUp,
  Activity,
  User,
  Zap,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface PsychometricSectionProps {
  evaluation?: {
    iq: number;
    learningQuotient: number;
    factors: Array<{ label: string; description: string; status: 'pass' | 'fail' | 'warning' }>;
    brainDominance: string;
    observation: string;
    recommendation: string;
    reports?: Array<{ name: string; date: string; type: string }>;
    minimumThreshold?: number;
    obtainedScore?: number;
    decision?: string;
  };
  isValentina?: boolean;
}

export function PsychometricSection({ evaluation, isValentina }: PsychometricSectionProps) {
  const reports = evaluation?.reports ?? [
    { name: 'Prueba de Aptitud Lógica', date: '12 Abr 2026', type: 'PDF' },
    { name: 'Test de Personalidad (Big Five)', date: '12 Abr 2026', type: 'PDF' },
  ];

  const handleDownload = (reportName: string) => {
    if (isValentina) {
      toast.error('Estamos presentando inconvenientes para generar el reporte de pruebas. Por favor, intenta más tarde.');
      return;
    }
    toast.success(`Descargando ${reportName}...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'fail': return 'bg-red-50 text-red-700 border-red-100';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'fail': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'warning': return <Clock className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  if (!evaluation) {
    return (
      <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No hay datos disponibles</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          La evaluación psicométrica aún no se ha completado o los resultados no han sido procesados.
        </p>
      </div>
    );
  }

  const obtainedScore = evaluation.obtainedScore ?? 88;
  const minThreshold = evaluation.minimumThreshold ?? 70;
  const decision = evaluation.decision ?? 'Candidato Apto';

  return (
    <div className="bg-white border border-gray-200/60 rounded-3xl p-10 space-y-8 text-left shadow-sm">
      
      {/* Header — Patrón Serena IA */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100/80">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 shadow-sm">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-lg font-black text-gray-900 tracking-tight">Evaluación Psicométrica</h4>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Evaluado por Serena IA</p>
        </div>
      </div>

      {/* Notificación/Recomendación — Highlight Box */}
      <div className="flex items-start gap-4 p-5 bg-[#F0FDF4] rounded-2xl border border-[#DCFCE7] shadow-sm shadow-emerald-50/50">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <p className="text-[13px] font-bold text-[#166534] leading-relaxed py-1">
          {evaluation.recommendation || "Candidata altamente recomendada. Sus habilidades cognitivas superan el percentil 90 para el cargo."}
        </p>
      </div>

      {/* Detalle de métricas y factores — lista vertical */}
      <ul className="space-y-6 pt-2">
        {/* CI y CA integrados en la lista */}
        <li className="flex items-start gap-3">
          <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 shadow-sm shadow-blue-100" />
          <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
            <strong className="text-gray-900 font-bold">{evaluation.iq}.</strong> Capacidad cognitiva destacada para resolver problemas complejos.
          </p>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-2 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 shadow-sm shadow-purple-100" />
          <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
            <strong className="text-gray-900 font-bold">{evaluation.learningQuotient}.</strong> Alta velocidad y efectividad en la adquisición de nuevos conocimientos.
          </p>
        </li>

        <li className="pt-4">
          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Factores destacados</h5>
          <ul className="space-y-5">
            {/* Factores Detallados */}
            {evaluation.factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className={cn("mt-2 w-2 h-2 rounded-full flex-shrink-0 shadow-sm", 
                  factor.status === 'pass' ? 'bg-emerald-500 shadow-emerald-100' : 
                  factor.status === 'warning' ? 'bg-amber-500 shadow-amber-100' : 'bg-rose-500 shadow-rose-100'
                )} />
                <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                  <strong className="text-gray-900 font-bold">{factor.label}:</strong>{' '}
                  {factor.description}
                </p>
              </li>
            ))}

            {/* Dominancia Cerebral */}
            <li className="flex items-start gap-3">
              <span className="mt-2 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 shadow-sm shadow-amber-100" />
              <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                <strong className="text-gray-900 font-bold">Dominancia Cerebral:</strong>{' '}
                {evaluation.brainDominance}
              </p>
            </li>
          </ul>
        </li>
      </ul>

      {/* Observación de Especialista */}
      <div className="space-y-4 pt-6 border-t border-gray-50">
        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Info className="w-3.5 h-3.5" /> OBSERVACIÓN GENERAL
        </h5>
        <p className="text-[15px] text-gray-700 leading-relaxed italic font-medium">
          "{evaluation.observation}"
        </p>
      </div>

      {/* Reportes Generados — Vertical */}
      <div className="space-y-4 pt-6">
        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Descargas Disponibles</h5>
        <div className="grid grid-cols-1 gap-3">
          {reports.map((report) => (
            <button 
              key={report.name}
              onClick={() => handleDownload(report.name)}
              className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-900">{report.name}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{report.type} • {report.date}</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer / Decisión */}
      <div className="pt-8 border-t border-gray-50">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50/50 border border-emerald-100 rounded-full text-[11px] text-emerald-700 font-black uppercase tracking-widest shadow-sm">
          {decision}
        </span>
      </div>
    </div>
  );
}
