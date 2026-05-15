import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Sparkles, MousePointer2 } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

interface TourStep {
  target: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'bottom-left';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'center',
    title: 'Bienvenido al Detalle del Candidato',
    content: 'Vamos a guiarte por esta nueva experiencia. A lo largo del recorrido, podrás usar el botón de feedback para dejarnos comentarios sobre elementos a cambiar, añadir u optimizar.',
    icon: <Sparkles size={24} />,
    position: 'center'
  },
  {
    target: '[data-tour="candidate-card-andres"]',
    title: 'Selecciona al Candidato',
    content: 'Haz clic en la tarjeta de Andrés Parra Gómez para abrir el detalle completo.',
    icon: <MousePointer2 size={24} />,
    position: 'right'
  },
  {
    target: '#candidate-detail-drawer',
    title: 'Navega y Explora',
    content: 'En este panel principal puedes revisar el currículum, evaluaciones y notas de IA. Navega por todas las secciones para explorar las funcionalidades.',
    icon: <div className="text-xl">🧭</div>,
    position: 'bottom-left'
  },
  {
    target: '[data-tour="feedback-button"]',
    title: '¡Queremos tu Feedback!',
    content: 'Tu feedback es invaluable. Sugiere elementos que faltan, datos que cambiarías o nuevas funcionalidades. ¡Haz clic aquí para compartir tus ideas!',
    icon: <div className="text-xl">💬</div>,
    position: 'left'
  }
];

const OnboardingTour: React.FC = () => {
  const { isTourActive, currentStep, nextStep, prevStep, finishTour } = useOnboarding();
  const [spotlightStyles, setSpotlightStyles] = useState<React.CSSProperties>({});
  const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isTourActive) {
      updateSpotlight();
      const timer = setInterval(updateSpotlight, 500); // Poll for layout changes (like drawer opening)
      return () => clearInterval(timer);
    }
  }, [isTourActive, currentStep, windowSize]);

  const updateSpotlight = () => {
    const step = TOUR_STEPS[currentStep];
    console.log('[OnboardingTour] currentStep:', currentStep, 'target:', step.target);

    if (step.target === 'center') {
      console.log('[OnboardingTour] Target is center. Hiding spotlight.');
      setSpotlightStyles({ display: 'none' });
      setTooltipStyles({
        top: '50%',
        left: '50%',
        marginLeft: '-190px',
        marginTop: '-150px',
        position: 'fixed'
      });
      return;
    }

    let element = document.querySelector(step.target);
    console.log('[OnboardingTour] Initial querySelector result:', !!element);
    
    // Robust fallback just in case the data-tour attribute is missing
    if (!element && step.target === '[data-tour="candidate-card-andres"]') {
      console.log('[OnboardingTour] Using fallback search for Andrés Parra Gómez');
      const allCards = document.querySelectorAll('.bg-white.rounded-lg.border.p-4');
      for (const card of Array.from(allCards)) {
        if (card.textContent?.includes('Andrés Parra Gómez')) {
          element = card;
          console.log('[OnboardingTour] Fallback found element');
          break;
        }
      }
    }

    if (!element) {
      console.warn('[OnboardingTour] ELEMENT NOT FOUND FOR STEP', currentStep);
      setSpotlightStyles({ display: 'none' });
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = 12;
    console.log('[OnboardingTour] Element rect:', rect.top, rect.left, rect.width, rect.height);
    
    setSpotlightStyles({
      top: `${rect.top - padding}px`,
      left: `${rect.left - padding}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`,
      display: 'block',
      borderRadius: '16px'
    });

    const tooltipWidth = 380;
    const tooltipHeight = 320; // Increased to ensure long text doesn't cut off
    const margin = 24;
    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + margin;
        left = Math.max(margin, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - margin));
        break;
      case 'top':
        top = rect.top - margin - tooltipHeight;
        left = Math.max(margin, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - margin));
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2 - 160;
        left = rect.left - margin - tooltipWidth;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + margin;
        break;
      case 'bottom-left':
        top = rect.bottom - tooltipHeight - margin;
        left = rect.left + margin;
        break;
    }

    if (left + tooltipWidth > window.innerWidth - margin) left = window.innerWidth - tooltipWidth - margin;
    if (left < margin) left = margin;
    if (top + tooltipHeight > window.innerHeight - margin) top = window.innerHeight - tooltipHeight - margin;
    if (top < margin) top = margin;

    setTooltipStyles({
      top: `${top}px`,
      left: `${left}px`,
      marginLeft: '0px',
      marginTop: '0px',
      position: 'fixed'
    });
  };

  if (!isTourActive) return null;

  const step = TOUR_STEPS[currentStep];
  const isCenter = step.target === 'center';

  return (
    <div className="fixed inset-0 z-[10001] pointer-events-none">
      {/* Full Backdrop for Center Step */}
      <div 
        className={`absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] transition-opacity duration-300 ${isCenter ? 'opacity-100 z-[10002] pointer-events-auto' : 'opacity-0 -z-10 pointer-events-none'}`}
      />

      {/* Spotlight Mask using box-shadow similar to NOM 035 */}
      <div className={`absolute inset-0 z-[10002] pointer-events-none transition-opacity duration-300 ${!isCenter && spotlightStyles.display !== 'none' ? 'opacity-100' : 'opacity-0'}`}>
        <motion.div
          layout
          style={{
            ...spotlightStyles,
            position: 'absolute',
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.7)'
          }}
          className="border-[3px] border-blue-500 rounded-[12px] pointer-events-none"
          animate={{
            borderColor: ['#3b82f6', '#60a5fa', '#3b82f6'],
            boxShadow: [
              '0 0 0 9999px rgba(15, 23, 42, 0.7), 0 0 0 0px rgba(59, 130, 246, 0)',
              '0 0 0 9999px rgba(15, 23, 42, 0.7), 0 0 0 15px rgba(59, 130, 246, 0.2)',
              '0 0 0 9999px rgba(15, 23, 42, 0.7), 0 0 0 0px rgba(59, 130, 246, 0)'
            ]
          }}
          transition={{
            layout: { type: "spring", stiffness: 300, damping: 30 },
            borderColor: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Tooltip Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={tooltipStyles}
          className="absolute z-[10003] w-[380px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto border border-white/50 overflow-hidden"
        >
          {/* Progress Bar Header */}
          <div className="h-1.5 w-full bg-gray-100 flex">
            {TOUR_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 h-full transition-all duration-500 ${i <= currentStep ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-transparent'}`}
              />
            ))}
          </div>

          <div className="p-7">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                {step.icon}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-tighter text-blue-600/60 block -mb-1">Paso {currentStep + 1} de {TOUR_STEPS.length}</span>
                <h3 className="font-black text-xl text-gray-800 tracking-tight">{step.title}</h3>
              </div>
              <button 
                onClick={finishTour}
                className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all border border-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <p 
              className="text-gray-600 leading-relaxed mb-8 font-medium"
              dangerouslySetInnerHTML={{ __html: step.content }}
            />

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 font-bold px-3 py-2 rounded-xl transition-all ${currentStep === 0 ? 'opacity-0' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                <ChevronLeft size={20} />
                <span>Atrás</span>
              </button>

              {/* Botón de continuación - Oculto en el paso 2 para forzar la interacción con el candidato */}
              {currentStep !== 1 && (
                <button
                  onClick={currentStep === TOUR_STEPS.length - 1 ? finishTour : nextStep}
                  className="flex items-center gap-3 bg-gray-900 group text-white pl-6 pr-4 py-3 rounded-2xl font-black shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95"
                >
                  <span>{currentStep === TOUR_STEPS.length - 1 ? 'Finalizar' : 'Continuar'}</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingTour;
