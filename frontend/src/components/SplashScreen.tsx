'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
          style={{ background: '#0A0A0F' }}
        >
          {/* Background orbs */}
          <div className="mesh-bg">
            <div className="mesh-orb mesh-orb-1" style={{ opacity: 0.25 }} />
            <div className="mesh-orb mesh-orb-2" style={{ opacity: 0.20 }} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex flex-col items-center gap-4 z-10"
          >
            {/* Logo mark */}
            <motion.div
              animate={{ boxShadow: ['0 0 40px rgba(99,102,241,0.4)', '0 0 80px rgba(236,72,153,0.6)', '0 0 40px rgba(99,102,241,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mb-2"
              style={{ background: 'linear-gradient(135deg,#6366F1,#EC4899)' }}
            >
              N
            </motion.div>

            <h1
              className="text-5xl font-black tracking-tighter"
              style={{
                background: 'linear-gradient(135deg,#F8FAFC 0%,#A78BFA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              NIRMARK
            </h1>

            <p className="text-sm tracking-[0.25em] uppercase" style={{ color: '#94A3B8' }}>
              Standards Intelligence
            </p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-16 w-48"
          >
            <div className="h-px bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
                className="h-full"
                style={{ background: 'linear-gradient(90deg,#6366F1,#EC4899)' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
