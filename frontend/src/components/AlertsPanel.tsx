'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertsPanelProps {
  open: boolean;
  onClose: () => void;
}

const ALERTS = [
  { id: 1, type: 'info',    icon: Info,          title: 'IS 456 : 2000 Reaffirmed',       body: 'Bureau of Indian Standards has reaffirmed IS 456 for 2025.',    time: '2h ago' },
  { id: 2, type: 'success', icon: CheckCircle,   title: 'Audit completed successfully',    body: 'Your last query returned 3 relevant standards with 94% confidence.', time: '4h ago' },
  { id: 3, type: 'warning', icon: AlertTriangle, title: 'IS 269 : 2015 — Draft revision', body: 'A draft revision of IS 269 is under public review until Jun 2026.',  time: '1d ago' },
  { id: 4, type: 'info',    icon: Info,          title: 'New standard published',          body: 'IS 17452 : 2025 — Sustainable Concrete Practice has been published.', time: '3d ago' },
];

const COLORS: Record<string, string> = {
  info:    '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
};

export default function AlertsPanel({ open, onClose }: AlertsPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[600]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-16 right-6 z-[700] w-80 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(14,14,22,0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#F8FAFC' }}>
                <Bell size={15} style={{ color: '#F59E0B' }} /> Notifications
              </div>
              <button onClick={onClose} style={{ color: '#64748B' }}><X size={15} /></button>
            </div>

            <div className="divide-y" style={{ divideColor: 'rgba(255,255,255,0.05)' }}>
              {ALERTS.map((alert) => {
                const IconComp = alert.icon;
                const color = COLORS[alert.type];
                return (
                  <motion.div
                    key={alert.id}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className="flex gap-3 px-4 py-3 cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5" style={{ background: color + '22' }}>
                      <IconComp size={14} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: '#F8FAFC' }}>{alert.title}</p>
                      <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#64748B' }}>{alert.body}</p>
                      <p className="text-[10px] mt-1 font-mono" style={{ color: '#334155' }}>{alert.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-3">
              <button
                onClick={onClose}
                className="w-full text-center text-[11px] py-2 rounded-xl hover:bg-white/5 transition-colors"
                style={{ color: '#6366F1' }}
              >
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
