import React, { useState, useEffect } from 'react';
import { MessageSquareText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnboarding } from '../../context/OnboardingContext';

interface FeedbackFABProps {
  onClick: () => void;
}

const FeedbackFAB: React.FC<FeedbackFABProps> = ({ onClick }) => {
  const { isSerenaActive, isTourActive, isWelcomeOpen } = useOnboarding();
  const [isForceExpanded, setIsForceExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Colapsar el botón 3 segundos después de que el onboarding termine
  useEffect(() => {
    // Si el onboarding ya no está activo y la pantalla de bienvenida ya pasó
    if (!isTourActive && !isWelcomeOpen) {
      const timer = setTimeout(() => {
        setIsForceExpanded(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTourActive, isWelcomeOpen]);

  const isExpanded = isForceExpanded || isHovered || isTourActive;
  const positionClasses = isSerenaActive ? 'right-[450px]' : 'right-8';

  return (
    <div className={`fixed bottom-8 ${positionClasses} z-[9999] flex flex-col items-end gap-3 transition-all duration-500`}>
      {/* Premium Label Tooltip - Solo visible cuando está colapsado */}
      {!isExpanded && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10, scale: isHovered ? 1 : 0.8 }}
          className="bg-white/90 backdrop-blur-md border border-white/50 px-4 py-2 rounded-2xl shadow-2xl mr-2 pointer-events-none"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <p className="text-[11px] font-black tracking-tight text-gray-800 whitespace-nowrap uppercase">
              Ayúdanos a mejorar V1
            </p>
          </div>
        </motion.div>
      )}

      {/* Vibrant Pulsing FAB with Dynamic Text */}
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05, rotate: -2 }}
        whileTap={{ scale: 0.95 }}
        layout
        transition={{ 
          layout: { duration: 0.4, type: "spring", bounce: 0.2 },
          duration: 0.3 
        }}
        className={`relative h-14 ${isExpanded ? 'px-6' : 'w-14'} rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-600 text-white flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] overflow-hidden`}
        data-tour="feedback-button"
      >
        {/* Animated Background Pulse */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-white rounded-full blur-2xl"
        />
        
        <motion.div layout className="relative z-10 flex items-center gap-2.5">
          <MessageSquareText size={22} className="drop-shadow-lg shrink-0" />
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0, x: -10 }}
                animate={{ opacity: 1, width: 'auto', x: 0 }}
                exit={{ opacity: 0, width: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="font-black text-sm uppercase tracking-wider drop-shadow-md whitespace-nowrap overflow-hidden"
              >
                Feedback
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Shiny sweep effect */}
        <motion.div 
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      </motion.button>
    </div>
  );
};

export default FeedbackFAB;
