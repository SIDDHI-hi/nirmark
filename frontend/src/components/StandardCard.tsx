'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Copy, Check, ExternalLink, Plus, Scale } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import type { StandardDetail } from '@/components/StandardModal';

interface StandardCardProps extends StandardDetail {
  delay?: number;
  onViewFull: (standard: StandardDetail) => void;
  onAddToProject: (code: string) => void;
  onCompare: (item: { code: string; title: string; matchScore: number; rank: number }) => void;
  onRelatedClick: (code: string) => void;
  inCompare?: boolean;
}

const SCORE_COLORS = {
  high: '#10B981',
  medium: '#F59E0B',
  low: '#64748B',
};

export default function StandardCard({
  rank, code, title, rationale, keywords, matchScore,
  relatedStandards = [], specs = [], delay = 0,
  onViewFull, onAddToProject, onCompare, onRelatedClick, inCompare = false,
  clauses = [], edition, scope,
  critical_clauses = [], compliance_action, confidence_score, risk_level
}: StandardCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [hoveredClause, setHoveredClause] = useState<string | null>(null);

  const getScoreType = (score: number) => {
    if (score >= 85) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const scoreType = getScoreType(matchScore);
  const color = SCORE_COLORS[scoreType];
  const riskColor = risk_level === 'High' ? '#EF4444' : '#F59E0B';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast(`${code} copied`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="nirmark-card p-6 transition-all hover:shadow-xl hover:-translate-y-1"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Result #{rank}</span>
            <div 
              className="nirmark-badge"
              style={{ background: `${color}15`, color: color, border: `1px solid ${color}30` }}
            >
              {matchScore}% Match
            </div>
            {confidence_score && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                <Scale size={10} className="text-blue-500" /> Conf: {Math.round(confidence_score * 100)}%
              </div>
            )}
            {risk_level && (
              <div 
                className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-tighter"
                style={{ background: `${riskColor}10`, borderColor: `${riskColor}30`, color: riskColor }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: riskColor }} />
                Risk: {risk_level}
              </div>
            )}
          </div>
          <h3 className="text-xl font-mono font-bold text-blue-500 flex items-center gap-2">
            {code}
            <button onClick={handleCopy} className="text-slate-600 hover:text-slate-400">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </h3>
          <p className="text-slate-200 font-semibold mt-1">{title}</p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-800">
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">🧠 AI Rationale</p>
        <p className="text-sm text-slate-400 leading-relaxed italic">"{rationale}"</p>
        
        {compliance_action && (
          <div className="mt-4 p-3 rounded-md bg-blue-500/5 border border-blue-500/20">
            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-1">Mandatory Compliance Action</p>
            <p className="text-xs text-slate-200 font-semibold">{compliance_action}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {keywords.map(kw => (
            <span key={kw} className="px-2 py-1 bg-slate-800 text-slate-500 text-[10px] font-bold rounded uppercase border border-slate-700">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Clause Hunter Section */}
      {clauses.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Clause Hunter
            </p>
            <span className="text-[9px] text-slate-600 font-bold uppercase">Legal-Grade Precision</span>
          </div>
          <div className="space-y-2">
            {clauses.map((clause) => (
              <motion.div
                key={clause.id}
                onMouseEnter={() => setHoveredClause(clause.id)}
                onMouseLeave={() => setHoveredClause(null)}
                className="group relative cursor-pointer"
              >
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 transition-all"
                  style={{ 
                    background: hoveredClause === clause.id ? 'rgba(245, 158, 11, 0.05)' : 'rgba(0,0,0,0.2)',
                    borderColor: hoveredClause === clause.id ? 'rgba(245, 158, 11, 0.3)' : 'rgba(30, 41, 59, 0.5)'
                  }}
                >
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-amber-500 transition-colors">
                      {clause.id}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors whitespace-normal break-words overflow-hidden">
                      {clause.text}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-[10px] font-bold text-slate-700 group-hover:text-amber-500 transition-colors">
                      {Math.round(clause.score * 100)}%
                    </div>
                  </div>
                </div>
                {hoveredClause === clause.id && (
                  <motion.div 
                    layoutId="clause-glow"
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)' }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
        <button
          onClick={() => onViewFull({ 
            rank, code, title, rationale, keywords, matchScore, relatedStandards, specs, 
            clauses, edition, scope, critical_clauses, compliance_action, confidence_score, risk_level 
          })}
          className="nirmark-btn text-xs py-2 px-4"
        >
          <ExternalLink size={14} /> View Details
        </button>

        <button
          onClick={() => onCompare({ 
            rank, code, title, rationale, keywords, matchScore, relatedStandards, specs, 
            clauses, edition, scope, critical_clauses, compliance_action, confidence_score, risk_level 
          })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 transition-all"
          style={inCompare ? { borderColor: '#3B82F6', color: '#3B82F6', background: '#3B82F610' } : {}}
        >
          <Scale size={14} /> {inCompare ? 'Compared' : 'Compare'}
        </button>
      </div>
    </motion.div>
  );
}
