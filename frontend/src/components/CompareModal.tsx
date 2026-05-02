'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Info, ShieldCheck, Zap, Activity, FileText } from 'lucide-react';
import type { StandardDetail } from '@/components/StandardModal';

interface CompareModalProps {
  items: StandardDetail[];
  open: boolean;
  onClose: () => void;
}

const RANK_COLORS: Record<number, string> = { 1: '#10B981', 2: '#6366F1', 3: '#F59E0B' };

export default function CompareModal({ items, open, onClose }: CompareModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            className="fixed inset-4 md:inset-8 z-[1001] bg-[#0A0A0F] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header Area */}
            <div className="flex items-center justify-between p-8 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-transparent">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Scale size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Technical Comparison Matrix</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Cross-Reference Audit • {items.length} Standards Active
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-all border border-white/5 hover:border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Matrix Content */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="sticky top-0 z-10 bg-[#0A0A0F]">
                    <th className="w-64 p-8 text-left border-r border-b border-white/5 bg-[#0D0D14]">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Comparison Criteria</span>
                    </th>
                    {items.map((item, idx) => {
                      const color = RANK_COLORS[item.rank] || '#6366F1';
                      return (
                        <th key={item.code} className="p-8 text-left border-b border-white/5 min-w-[380px]" style={{ background: `${color}03` }}>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Standard #{idx + 1}</span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter"
                              style={{ background: `${color}15`, borderColor: `${color}30`, color }}>
                              {item.matchScore}% Match
                            </span>
                          </div>
                          <h3 className="text-3xl font-mono font-black mb-2" style={{ color }}>{item.code}</h3>
                          <p className="text-sm font-bold text-slate-200 leading-tight line-clamp-2 min-h-[40px]">
                            {item.title}
                          </p>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  
                  {/* Row: Rationale */}
                  <tr>
                    <td className="p-8 align-top border-r border-white/5 bg-[#0D0D14]">
                      <div className="flex items-center gap-3 text-blue-400 mb-2">
                        <Zap size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Strategic Rationale</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed">AI-generated reasoning for selection and project alignment.</p>
                    </td>
                    {items.map(item => (
                      <td key={item.code + '-rat'} className="p-8 align-top">
                        <div className="p-5 rounded-2xl bg-blue-500/[0.03] border border-blue-500/10 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500/50 transition-colors" />
                          <p className="text-xs text-slate-400 leading-relaxed italic">
                            "{item.rationale}"
                          </p>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Compliance Action */}
                  <tr>
                    <td className="p-8 align-top border-r border-white/5 bg-[#0D0D14]">
                      <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <ShieldCheck size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Regulatory Action</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed">Direct mandatory instruction for compliance verification.</p>
                    </td>
                    {items.map(item => (
                      <td key={item.code + '-action'} className="p-8 align-top">
                        <div className="p-5 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20 group-hover:bg-amber-500/50 transition-colors" />
                          <p className="text-xs text-slate-200 font-bold leading-relaxed">
                            {item.compliance_action || "Standard protocol verification required."}
                          </p>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Technical Parameters */}
                  <tr>
                    <td className="p-8 align-top border-r border-white/5 bg-[#0D0D14]">
                      <div className="flex items-center gap-3 text-emerald-400 mb-2">
                        <Activity size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Technical Params</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed">Extracted specifications from the IS code document.</p>
                    </td>
                    {items.map(item => (
                      <td key={item.code + '-specs'} className="p-8 align-top">
                        <div className="grid grid-cols-1 gap-2">
                          {item.specs.map((spec, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{spec.label}</span>
                              <span className="text-[11px] text-slate-100 font-mono font-black">{spec.value}</span>
                            </div>
                          ))}
                          {item.specs.length === 0 && (
                            <div className="p-4 text-center border border-dashed border-white/5 rounded-xl">
                              <p className="text-[10px] text-slate-600 italic font-bold">No specific parameters extracted</p>
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Reference Data */}
                  <tr>
                    <td className="p-8 align-top border-r border-white/5 bg-[#0D0D14]">
                      <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <FileText size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Reference Data</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed">Document versioning and safety risk classification.</p>
                    </td>
                    {items.map(item => (
                      <td key={item.code + '-ref'} className="p-8 align-top">
                        <div className="flex flex-wrap gap-3">
                          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
                            <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Edition</p>
                            <p className="text-[11px] text-slate-400 font-mono font-bold">{item.edition || 'N/A'}</p>
                          </div>
                          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
                            <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Risk Level</p>
                            <p className={`text-[11px] font-black uppercase ${item.risk_level === 'High' ? 'text-red-500' : 'text-amber-500'}`}>
                              {item.risk_level || 'Medium'}
                            </p>
                          </div>
                          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
                            <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Confidence</p>
                            <p className="text-[11px] text-blue-500 font-mono font-bold">{Math.round((item.confidence_score || 0.85) * 100)}%</p>
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Footer Area */}
            <div className="p-8 border-t border-white/5 bg-[#0D0D14] flex items-center justify-between">
              <div className="flex items-center gap-4 text-slate-500">
                <Info size={16} className="text-blue-500/50" />
                <p className="text-[11px] font-bold uppercase tracking-widest">
                  Audit Protocol: NIRMARK RAG-Hybrid v3.0 • <span className="text-slate-700">Strictly for Technical Review</span>
                </p>
              </div>
              <button 
                onClick={onClose}
                className="px-8 py-3 rounded-2xl bg-blue-500 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              >
                Exit Matrix View
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
