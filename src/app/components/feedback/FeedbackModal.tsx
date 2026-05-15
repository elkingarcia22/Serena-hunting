import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, Heart, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useOnboarding } from '../../context/OnboardingContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTIONS = [
  { id: 'generalInfo', label: 'Información General' },
  { id: 'generalInfoEdit', label: 'Información General (Edición)' },
  { id: 'experience', label: 'Experiencia Laboral' },
  { id: 'experienceEdit', label: 'Experiencia Laboral (Edición)' },
  { id: 'education', label: 'Educación' },
  { id: 'educationEdit', label: 'Educación (Edición)' },
  { id: 'vacancies', label: 'Vacantes' },
  { id: 'vacanciesDetail', label: 'Vacantes (Detalle)' },
  { id: 'documents', label: 'Documentos' },
  { id: 'serenaIA', label: 'Serena IA' },
  { id: 'application', label: 'Estado de Aplicación' }
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { activeSection, isFeedbackAutoOpened, isSerenaActive, isEditMode, isInsideVacancy } = useOnboarding();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSection, setSelectedSection] = useState('generalInfo');

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const mountedTime = React.useRef(0);

  useEffect(() => {
    if (isOpen) {
      if (isSerenaActive) {
        setSelectedSection('serenaIA');
      } else if (activeSection) {
        let mappedSection = activeSection;
        
        // Detección automática de modos de edición y detalle de vacantes
        if (isEditMode) {
          if (activeSection === 'generalInfo') mappedSection = 'generalInfoEdit';
          else if (activeSection === 'experience') mappedSection = 'experienceEdit';
          else if (activeSection === 'education') mappedSection = 'educationEdit';
        } else if (activeSection === 'vacancies' && isInsideVacancy) {
          mappedSection = 'vacanciesDetail';
        }
        
        // Verificar si la sección existe en nuestra lista
        if (SECTIONS.some(s => s.id === mappedSection)) {
          setSelectedSection(mappedSection);
        } else {
          // Fallback a la sección activa base o generalInfo
          if (SECTIONS.some(s => s.id === activeSection)) {
            setSelectedSection(activeSection);
          } else {
            setSelectedSection('generalInfo');
          }
        }
      }
    }
    
    if (isOpen && isFeedbackAutoOpened) {
      mountedTime.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, activeSection, isFeedbackAutoOpened, isSerenaActive, isEditMode, isInsideVacancy, onClose]);

  const handleInteraction = () => {
    if (timeoutRef.current && Date.now() - mountedTime.current > 500) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('https://egarcia.app.n8n.cloud/webhook/a519263a-021f-4faf-a621-1ab6ce1bed11', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment,
          section: selectedSection,
          source: 'Candidate V1 Dashboard',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast.success('¡Gracias por tu feedback!', {
          description: 'Tus comentarios nos ayudan a evolucionar la plataforma.',
          icon: <Heart className="w-4 h-4 text-pink-500" />
        });
        setComment('');
        onClose();
      } else {
        throw new Error('Error al enviar');
      }
    } catch (error) {
      toast.error('No se pudo enviar el feedback. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };



  if (!isOpen) return null;

  const positionClasses = isSerenaActive ? 'right-[450px]' : 'right-6';

  return (
    <AnimatePresence>
      <div className={`fixed bottom-6 ${positionClasses} z-[10005] flex items-end justify-end pointer-events-none transition-all duration-300`}>
        {/* Premium Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onMouseEnter={handleInteraction}
          onFocus={handleInteraction}
          onClick={handleInteraction}
          className="relative bg-white/95 rounded-[20px] w-[320px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-200 overflow-hidden backdrop-blur-xl pointer-events-auto"
        >
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 text-white relative">
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <Sparkles className="w-16 h-16 rotate-12" />
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-black tracking-tight mb-1 pr-6">Tu opinión importa</h2>
            <p className="text-white/80 font-medium text-xs">Ayúdanos a mejorar.</p>
          </div>

          <div className="p-5">
            <div className="mb-5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sección a evaluar</label>
              <div className="relative">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-xl p-3 pr-10 text-sm text-gray-700 font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all cursor-pointer"
                >
                  {SECTIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>



            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Compártenos tus comentarios</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué mejorarías?..."
                className="w-full h-24 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none resize-none font-medium leading-relaxed"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-black text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest text-[10px]"
              >
                Cerrar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !comment.trim()}
                className="flex-[2] bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-gray-900 text-white font-black py-3 rounded-xl transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enviar Feedback</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FeedbackModal;
