'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export interface StandardDetail {
  code: string;
  title: string;
  rationale: string;
  keywords: string[];
  matchScore: number;
  relatedStandards: string[];
  specs: { label: string; value: string }[];
  rank: number;
  clauses?: { id: string; text: string; score: number }[];
  edition?: string;
  scope?: string;
  critical_clauses?: string[];
  compliance_action?: string;
  confidence_score?: number;
  risk_level?: string;
}

interface StandardModalProps {
  standard: StandardDetail | null;
  onClose: () => void;
  onRelatedClick: (code: string) => void;
}

const RANK_COLORS: Record<number, string> = {
  1: '#10B981',
  2: '#6366F1',
  3: '#F59E0B',
};



export default function StandardModal({ standard, onClose, onRelatedClick }: StandardModalProps) {
  const [copied, setCopied] = useState(false);
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({ specs: true, clauses: false });

  if (!standard) return null;

  const accentColor = RANK_COLORS[standard.rank] ?? '#6366F1';

  const handleCopy = () => {
    navigator.clipboard.writeText(standard.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (key: string) =>
    setSectionOpen(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <AnimatePresence>
      {standard && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[800]"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-4 top-16 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-[900] rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Modal header */}
            <div
              className="flex items-start justify-between p-6 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: `linear-gradient(135deg, ${accentColor}18 0%, transparent 100%)` }}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 font-mono text-2xl font-bold hover:opacity-80 transition-opacity"
                    style={{ color: accentColor }}
                  >
                    {standard.code}
                    {copied ? <Check size={16} /> : <Copy size={14} className="opacity-50" />}
                  </button>
                </div>
                <p className="text-base font-semibold" style={{ color: '#CBD5E1' }}>{standard.title}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: accentColor + '22', color: accentColor, border: `1px solid ${accentColor}44` }}
                  >
                    {standard.matchScore}% match
                  </span>
                  {standard.edition && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {standard.edition}
                    </span>
                  )}
                  <span className="text-[10px] font-mono" style={{ color: '#334155' }}>BIS Standard</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                style={{ color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Rationale */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#6366F1' }}>🧠 AI Rationale</p>
                <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{standard.rationale}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {standard.keywords.map(kw => (
                    <span key={kw} className="keyword-chip">{kw}</span>
                  ))}
                </div>
              </div>

              {/* Official Scope */}
              {standard.scope && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#F59E0B' }}>📋 Official Scope</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{standard.scope}</p>
                </div>
              )}

              {/* Key Specs Accordion */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => toggleSection('specs')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>📊 Key Specifications</span>
                  <motion.span animate={{ rotate: sectionOpen.specs ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown size={16} style={{ color: '#64748B' }} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {sectionOpen.specs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-1">
                        {standard.specs.map((s, i) => (
                          <div key={i} className="flex justify-between text-sm py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ color: '#64748B' }}>{s.label}</span>
                            <span className="font-mono font-semibold" style={{ color: '#F8FAFC' }}>{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>



              {/* Related standards */}
              {standard.relatedStandards.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>🔗 Related Standards</p>
                  <div className="flex flex-wrap gap-2">
                    {standard.relatedStandards.map(std => (
                      <button
                        key={std}
                        onClick={() => { onRelatedClick(std); onClose(); }}
                        className="std-badge"
                      >
                        {std}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <motion.a
                href={`https://www.bis.gov.in/index.php?option=com_bisbuy&view=product&format=json&task=buynow&ctype=IS&number=${standard.code.replace(/\s/g,'')}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${accentColor}, #EC4899)` }}
              >
                <ExternalLink size={13} /> View on BIS Portal
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
