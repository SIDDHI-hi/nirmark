'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Trash2 } from 'lucide-react';
import type { StandardDetail } from '@/components/StandardModal';

const RANK_COLORS: Record<number, string> = { 1: '#10B981', 2: '#6366F1', 3: '#F59E0B' };

interface ComparePanelProps {
  items: StandardDetail[];
  onRemove: (code: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

export default function ComparePanel({ items, onRemove, onClear, onCompare }: ComparePanelProps) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[700] rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: 'rgba(14,14,22,0.97)',
        border: '1px solid rgba(99,102,241,0.3)',
        backdropFilter: 'blur(20px)',
        minWidth: '420px',
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#F8FAFC' }}>
          <Scale size={15} style={{ color: '#6366F1' }} />
          Compare Standards ({items.length}/3)
        </div>
        <button onClick={onClear} className="text-xs flex items-center gap-1.5 hover:opacity-80" style={{ color: '#64748B' }}>
          <Trash2 size={12} /> Clear all
        </button>
      </div>

      <div className="flex items-stretch gap-px p-3">
        {items.map((item) => (
          <div
            key={item.code}
            className="flex-1 rounded-xl p-3 relative"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${RANK_COLORS[item.rank] ?? '#6366F1'}33` }}
          >
            <button
              onClick={() => onRemove(item.code)}
              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              style={{ color: '#64748B' }}
            >
              <X size={11} />
            </button>
            <p className="font-mono text-sm font-bold mb-1" style={{ color: RANK_COLORS[item.rank] ?? '#6366F1' }}>
              {item.code}
            </p>
            <p className="text-[11px] leading-tight mb-2" style={{ color: '#64748B' }}>{item.title}</p>
            <div
              className="text-[10px] font-bold px-2 py-0.5 rounded-full w-fit"
              style={{ background: (RANK_COLORS[item.rank] ?? '#6366F1') + '22', color: RANK_COLORS[item.rank] ?? '#6366F1' }}
            >
              {item.matchScore}% match
            </div>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 3 - items.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex-1 rounded-xl flex items-center justify-center text-xs"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', color: '#1E293B', minHeight: 80 }}
          >
            + Add standard
          </div>
        ))}
      </div>

      {items.length >= 2 && (
        <div className="px-3 pb-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#6366F1,#EC4899)' }}
            onClick={onCompare}
          >
            View Side-by-Side Comparison →
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
