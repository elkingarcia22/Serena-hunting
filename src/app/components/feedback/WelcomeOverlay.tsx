import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Heart, Briefcase, ChartBar, Download, MessageCircle, Sparkles } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { router } from '../../routes';

const WelcomeOverlay: React.FC = () => {
  const { isWelcomeOpen, startTour } = useOnboarding();

  const handleStartTour = () => {
    router.navigate('/candidatos');
    setTimeout(() => {
      startTour();
    }, 100);
  };

  if (!isWelcomeOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/40 backdrop-blur-xl p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 400, delay: 0.1 }}
          className="bg-white/90 rounded-[32px] p-8 md:p-12 max-w-[720px] w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] text-center relative border border-white/50 backdrop-blur-md"
        >
          {/* Accent Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-orange-800 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 shadow-sm border border-orange-200/50"
          >
            <Sparkles size={14} className="text-orange-500 animate-pulse" />
            <span>NUEVA EXPERIENCIA V1</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-[900] text-gray-900 mb-6 tracking-tight leading-none">
            Prototipo de Validación <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Detalle del Candidato V1</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
            Esto no es la plataforma real de UBITS. Es un prototipo interactivo para validar el diseño del detalle del candidato previo a su desarrollo, y así asegurarnos de que sea completamente funcional para nuestros clientes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="text-left bg-blue-50/50 hover:bg-blue-50 p-5 rounded-2xl border border-blue-100 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white mb-4 shadow-blue-200 shadow-lg group-hover:scale-110 transition-transform">
                <Heart size={20} />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Estandarización</h4>
              <p className="text-sm text-gray-500">Info coherente y accionable en cada fase del pipeline.</p>
            </div>

            <div className="text-left bg-purple-50/50 hover:bg-purple-50 p-5 rounded-2xl border border-purple-100 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white mb-4 shadow-purple-200 shadow-lg group-hover:scale-110 transition-transform">
                <Briefcase size={20} />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">IA & Profundidad</h4>
              <p className="text-sm text-gray-500">Análisis técnico de CV y pruebas centralizados.</p>
            </div>
          </div>

          <div className="bg-gray-900 text-white rounded-2xl p-6 mb-10 flex items-center gap-5 text-left shadow-xl shadow-gray-200">
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
              <MessageCircle size={28} />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight mb-1">¡Tu opinión es vital!</p>
              <p className="text-gray-400 text-sm">
                Usa el botón flotante (💬) en cualquier momento para dejarnos feedback.
              </p>
            </div>
          </div>

          <button
            onClick={handleStartTour}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-extrabold py-5 rounded-[20px] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 text-xl shadow-2xl shadow-gray-300 group overflow-hidden relative"
          >
            {/* Animated background flash */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <span>PROBAR EXPERIENCIA V1</span>
            <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
          
          <p className="mt-6 text-gray-400 text-sm font-medium tracking-wide flex items-center justify-center gap-2">
            PROTOTIPO DE VALIDACIÓN <span className="w-1 h-1 bg-gray-300 rounded-full" /> UBITS 2026
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeOverlay;
