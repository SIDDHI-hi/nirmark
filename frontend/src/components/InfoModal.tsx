'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, BarChart3, Scale, Sparkles } from 'lucide-react';

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InfoModal({ open, onClose }: InfoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg"
          >
            <div className="nirmark-card p-8 bg-[#0F172A] border border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Compliance Analytics</h2>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Methodology Documentation</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Confidence */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Confidence Score (CONF)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Calculated using the underlying vector distance from the LanceDB search engine and normalized against the reranker output. It represents the mathematical certainty that the retrieved standards match your project's technical requirements.
                    </p>
                  </div>
                </div>

                {/* Coverage */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Clause Coverage (COVG)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Measures the completeness of regulatory extraction. It represents the ratio of identified actionable clauses vs. the total sections present in the retrieved technical documentation. A higher score indicates a more exhaustive compliance audit.
                    </p>
                  </div>
                </div>

                {/* Risk */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Regulatory Risk Level (RISK)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Intelligent impact assessment mapped to BIS standard types. Standards governing life-safety (like IS 456 or IS 1893) are automatically flagged as High Risk, while procedural standards are categorized as Medium or Low.
                    </p>
                  </div>
                </div>

                {/* Innovation */}
                <div className="flex gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-tighter">Engine Innovation</h4>
                    <p className="text-xs text-blue-500/70 mt-1 font-bold italic leading-relaxed">
                      "Deterministically mapped international BS EN to IS equivalents using multi-stage RAG reranking."
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/50">
                <button 
                  onClick={onClose}
                  className="w-full py-3 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                >
                  ACKNOWLEDGE AUDIT METHODOLOGY
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
