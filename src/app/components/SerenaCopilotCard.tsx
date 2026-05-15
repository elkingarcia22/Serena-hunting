import React from 'react';
import { Sparkles, ExternalLink, AlertCircle } from 'lucide-react';

interface SerenaCopilotCardProps {
  confidence?: 'high' | 'medium' | 'low';
  updatedAgo?: string;
  insights?: string[];
  evidence?: Array<{ label: string; link: string }>;
}

const confidenceConfig = {
  high: { label: 'Alta', className: 'bg-emerald-50 text-emerald-700' },
  medium: { label: 'Media', className: 'bg-amber-50 text-amber-700' },
  low: { label: 'Baja', className: 'bg-red-50 text-red-700' },
};

export function SerenaCopilotCard({
  confidence = 'high',
  updatedAgo = '2 horas',
  insights = [
    'Candidato con 3 años de experiencia en desarrollo backend (Node.js, Python)',
    'Perfil junior-mid con conocimientos sólidos en AWS y microservicios',
    'Buena progresión técnica en sus empleos anteriores',
    'Expectativa salarial alineada con el rango del rol'
  ],
  evidence = [
    { label: 'Análisis de CV', link: '#cv' },
    { label: 'Ver perfil completo', link: '#profile' }
  ],
}: SerenaCopilotCardProps = {}) {
  const confidenceStyle = confidenceConfig[confidence] || confidenceConfig.high;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-blue-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">Serena Copilot</h3>
            <p className="text-xs text-gray-500">Actualizado hace {updatedAgo}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${confidenceStyle.className}`}>
          Confianza: {confidenceStyle.label}
        </span>
      </div>

      {/* Insights */}
      <div className="space-y-2">
        <ul className="space-y-1.5">
          {insights.map((insight, idx) => (
            <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Evidence */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-700">Evidencia</h4>
        <div className="space-y-1">
          {evidence.map((item, idx) => (
            <button
              key={idx}
              onClick={() => console.log(item.link)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guardrails */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-200">
        <button className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          ¿Por qué esto?
        </button>
        <button className="text-xs text-gray-600 hover:text-gray-900">
          Reportar error
        </button>
      </div>
    </div>
  );
}