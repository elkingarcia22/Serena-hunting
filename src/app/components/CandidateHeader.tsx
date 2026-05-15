import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Mail, Phone, Calendar, Check, Copy, CreditCard, Linkedin, Sparkles } from 'lucide-react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Tooltip } from './ui/tooltip';
import { toast } from 'sonner';

interface CandidateHeaderProps {
  candidate: {
    name: string;
    location: string;
    email: string;
    phone: string;
    age?: number;
    identificationNumber?: string;
    avatar?: string;
    linkedin?: string;
  };
  currentIndex: number;
  totalCandidates: number;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSerenaClick?: () => void;
  isDisabled?: boolean;
  isValentina?: boolean;
}

export function CandidateHeader({
  candidate,
  currentIndex,
  totalCandidates,
  onBack,
  onPrevious,
  onNext,
  onSerenaClick,
  isDisabled = false,
  isValentina = false
}: CandidateHeaderProps) {
  const hasPrevious = currentIndex > 1;
  const hasNext = currentIndex < totalCandidates;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    if (isValentina) {
      toast.error('Estamos presentando inconvenientes para acceder a la información detallada en este momento. Inténtalo más tarde.');
      return;
    }
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      } else {
        // Fallback for browsers/contexts where clipboard API is blocked
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopiedField(field);
          setTimeout(() => setCopiedField(null), 2000);
        } else {
          console.error('Fallback: No se pudo copiar');
        }
      }
    } catch (err) {
      // If modern API fails, try fallback
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopiedField(field);
          setTimeout(() => setCopiedField(null), 2000);
        } else {
          console.error('No se pudo copiar al portapapeles');
        }
      } catch (fallbackErr) {
        console.error('Error al copiar:', fallbackErr);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
      <div className="px-6 py-4">
        {/* Main Container */}
        <div className="flex items-start gap-6">
          {/* Left Section: Close + Avatar + Main Info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">


            {/* Avatar with Ring */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-16 h-16 ring-4 ring-white shadow-md">
                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                  {candidate.name
                    .split(' ')
                    .map((n) => n.charAt(0))
                    .slice(0, 2)
                    .join('')}
                </div>
              </Avatar>
              {/* Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>

            {/* Main Info Grid */}
            <div className="flex-1 min-w-0 pt-0.5">
              {/* Name + Location Badge */}
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-xl font-semibold text-gray-900">{candidate.name}</h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
                  <MapPin className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-sm text-gray-700">{candidate.location}</span>
                </div>
              </div>

              {/* Contact & Info Grid - 4 Columns */}
              <div className="flex items-center gap-3.5 flex-wrap mb-3">

                {/* Identification Number */}
                {candidate.identificationNumber && (
                  <Tooltip content={copiedField === 'id' ? '¡Copiado!' : 'Click para copiar'}>
                    <button
                      onClick={() => !isDisabled && copyToClipboard(candidate.identificationNumber!, 'id')}
                      disabled={isDisabled}
                      className={cn(
                        "flex items-center gap-1.5 text-sm group hover:bg-white px-1.5 py-1.5 -ml-1.5 rounded-md transition-all min-w-0",
                        isDisabled && "opacity-50 cursor-not-allowed grayscale"
                      )}
                    >
                      <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                        <CreditCard className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Cédula</div>
                        <div className="text-xs text-gray-900 truncate">{candidate.identificationNumber}</div>
                      </div>
                      {copiedField === 'id' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      )}
                    </button>
                  </Tooltip>
                )}

                {/* Phone */}
                <Tooltip content={copiedField === 'phone' ? '¡Copiado!' : 'Click para copiar'}>
                  <button
                    onClick={() => !isDisabled && copyToClipboard(candidate.phone, 'phone')}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center gap-1.5 text-sm group hover:bg-white px-1.5 py-1.5 -ml-1.5 rounded-md transition-all min-w-0",
                      isDisabled && "opacity-50 cursor-not-allowed grayscale"
                    )}
                  >
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                      <Phone className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Celular</div>
                      <div className="text-xs text-gray-900 truncate">{candidate.phone}</div>
                    </div>
                    {copiedField === 'phone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    )}
                  </button>
                </Tooltip>

                {/* Email */}
                <Tooltip content={copiedField === 'email' ? '¡Copiado!' : 'Click para copiar'}>
                  <button
                    onClick={() => !isDisabled && copyToClipboard(candidate.email, 'email')}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center gap-1.5 text-sm group hover:bg-white px-1.5 py-1.5 -ml-1.5 rounded-md transition-all min-w-0",
                      isDisabled && "opacity-50 cursor-not-allowed grayscale"
                    )}
                  >
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                      <Mail className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Correo</div>
                      <div className="text-xs text-gray-900 truncate">{candidate.email}</div>
                    </div>
                    {copiedField === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    )}
                  </button>
                </Tooltip>

                {/* LinkedIn */}
                {candidate.linkedin && (
                  <div className="flex items-center gap-1.5 text-sm px-1.5 py-1.5 -ml-1.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Linkedin className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">LinkedIn</div>
                      <a 
                        href={candidate.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-blue-600 truncate hover:underline block"
                      >
                        Ver perfil
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Navigation */}
          <div className="flex-shrink-0 pt-1 flex items-center gap-4">
            {/* Serena IA Header Button */}
            <Tooltip content="Análisis Serena IA" side="bottom">
              <button 
                onClick={() => onSerenaClick?.()}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 rounded-full transition-all group shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-bold text-white">Serena IA</span>
              </button>
            </Tooltip>

            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-gray-200">
              <Tooltip content="Anterior" side="bottom">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  disabled={isDisabled || !hasPrevious}
                  className="h-7 w-7 p-0 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>

              <div className="text-center px-2">
                <div className="text-xs font-medium text-gray-900 whitespace-nowrap">
                  <span className="text-blue-600">{currentIndex}</span>
                  <span className="text-gray-400 mx-0.5">/</span>
                  <span className="text-gray-600">{totalCandidates}</span>
                </div>
              </div>

              <Tooltip content="Siguiente" side="bottom">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNext}
                  disabled={isDisabled || !hasNext}
                  className="h-7 w-7 p-0 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>
            </div>
            
            {/* Close Button */}
            <Tooltip content={isDisabled ? "Guarda los cambios primero" : "Cerrar"} side="bottom">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                disabled={isDisabled}
                className={cn(
                  "h-8 w-8 p-0 flex-shrink-0 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg transition-all",
                  isDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-50"
                )}
              >
                <X className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}