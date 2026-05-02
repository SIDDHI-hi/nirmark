'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Search, Hash, Zap, ArrowRight, X } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const QUICK_SEARCHES = [
  { icon: '🏗️', label: 'Cement standards for structural use',       query: 'What cement standards apply for structural concrete?' },
  { icon: '🔩', label: 'Steel reinforcement bar specifications',      query: 'BIS standards for TMT steel reinforcement bars' },
  { icon: '🪨', label: 'Concrete mix design for bridges',            query: 'M40 grade concrete standards for bridge construction' },
  { icon: '⚙️', label: 'Aggregate quality for high-strength concrete', query: 'Aggregate specifications for high-strength concrete IS standards' },
  { icon: '🧱', label: 'Masonry unit strength requirements',          query: 'BIS standards for masonry units and mortar strength' },
];

export default function CommandPalette({ open, onClose, onSearch }: CommandPaletteProps) {
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!open) { setInput(''); return; }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSubmit = (query: string) => {
    const q = query || input;
    if (!q.trim()) return;
    onSearch(q);
    onClose();
  };

  const filtered = input.length > 1
    ? QUICK_SEARCHES.filter(s => s.label.toLowerCase().includes(input.toLowerCase()))
    : QUICK_SEARCHES;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[800]"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[900] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(14,14,22,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Search bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <Search size={18} style={{ color: '#6366F1', flexShrink: 0 }} />
              <input
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit(input)}
                placeholder="Search BIS standards or type a query…"
                className="flex-1 bg-transparent text-base outline-none"
                style={{ color: '#F8FAFC', caretColor: '#6366F1' }}
              />
              {input && (
                <button onClick={() => setInput('')} style={{ color: '#64748B' }}>
                  <X size={16} />
                </button>
              )}
              <kbd className="text-[10px] px-2 py-1 rounded font-mono" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#64748B' }}>ESC</kbd>
            </div>

            {/* Quick searches */}
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-widest font-bold px-2 mb-2" style={{ color: '#334155' }}>
                {input.length > 1 ? 'Results' : 'Quick Launches'}
              </p>
              <div className="flex flex-col gap-1">
                {filtered.map((item) => (
                  <motion.button
                    key={item.label}
                    whileHover={{ backgroundColor: 'rgba(99,102,241,0.1)' }}
                    onClick={() => handleSubmit(item.query)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm transition-colors"
                    style={{ color: '#94A3B8' }}
                  >
                    <span className="text-base w-6 text-center flex-shrink-0">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    <ArrowRight size={14} style={{ color: '#334155' }} />
                  </motion.button>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-6 text-sm" style={{ color: '#334155' }}>
                    No results — press Enter to search directly
                  </div>
                )}
              </div>
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-4 px-5 py-3 border-t text-[11px]" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#334155' }}>
              <span className="flex items-center gap-1.5"><Zap size={11} style={{ color: '#6366F1' }} /> Enter to run audit</span>
              <span>↑↓ Navigate</span>
              <span>ESC Close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
