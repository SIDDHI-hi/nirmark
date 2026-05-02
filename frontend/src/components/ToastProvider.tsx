'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────── */
export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

/* ─── Context ─────────────────────────────────────────────────── */
const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

/* ─── Provider ────────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl"
              style={{
                background: 'rgba(20,20,27,0.97)',
                border: `1px solid ${t.type === 'success' ? 'rgba(16,185,129,0.35)' : t.type === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(99,102,241,0.35)'}`,
                color: '#F8FAFC',
                backdropFilter: 'blur(12px)',
                minWidth: '240px',
              }}
            >
              {t.type === 'success' && <CheckCircle size={16} style={{ color: '#10B981', flexShrink: 0 }} />}
              {t.type === 'error'   && <AlertCircle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />}
              {t.type === 'info'    && <Info         size={16} style={{ color: '#6366F1', flexShrink: 0 }} />}
              <span style={{ flex: 1 }}>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
