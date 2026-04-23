import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelUpAnimationProps {
  level: number;
  currentQuestions: number;
  targetQuestions: number;
  onComplete: () => void;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({ level, currentQuestions, targetQuestions, onComplete }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-center"
          >
            <h2 className="text-6xl font-black italic text-amber-400 uppercase tracking-tighter">SEVİYE ATLANDI!</h2>
            <p className="text-4xl font-black text-white mt-4">{level}. SEVİYEYE ULAŞTIN!</p>
            <p className="text-xl text-slate-300 mt-2">
              Toplam {currentQuestions} soru çözerek {targetQuestions} soru hedefine ulaştın!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
