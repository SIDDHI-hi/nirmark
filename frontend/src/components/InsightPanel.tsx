'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as ReTooltip } from 'recharts';
import { Download, Share2, Info } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface InsightPanelProps {
  standardCount?: number;
  latency?: string;
  query?: string;
  onExport?: () => void;
  onInfoClick?: () => void;
  metrics?: {
    confidence: number;
    coverage: number;
    risk: string;
  };
}

export default function InsightPanel({ 
  standardCount = 3, 
  latency = '—', 
  query = '', 
  onExport,
  onInfoClick,
  metrics = { confidence: 92, coverage: 85, risk: 'Medium' }
}: InsightPanelProps) {
  const { toast } = useToast();

  const data = [
    { metric: 'CONF', value: metrics.confidence, color: '#3B82F6' },
    { metric: 'COVG', value: metrics.coverage, color: '#10B981' },
    { metric: 'RISK', value: metrics.risk === 'High' ? 100 : 50, color: metrics.risk === 'High' ? '#EF4444' : '#F59E0B' }
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast('Link copied', 'success');
  };

  return (
    <div className="space-y-6 sticky top-24">
      {/* Metrics Chart */}
      <div className="nirmark-card p-5">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance Analytics</h4>
          <button 
            onClick={onInfoClick}
            className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-600 hover:text-blue-500"
          >
            <Info size={14} />
          </button>
        </div>
        
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis 
                dataKey="metric" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} 
                width={40}
              />
              <ReTooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ background: '#151923', border: '1px solid #1E293B', borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RAG Insights */}
      <div className="nirmark-card p-5 bg-slate-900/30">
        <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4">Search Insights</h4>
        <div className="space-y-3">
          {[
            { label: 'Embedding Model', val: 'text-embedding-3-small' },
            { label: 'Re-ranker', val: 'BGE-Reranker-v2' },
            { label: 'Context Windows', val: '8,192 tokens' },
            { label: 'Retrieval Latency', val: latency }
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center text-[11px] pb-2 border-b border-slate-800/50">
              <span className="text-slate-500 font-medium">{row.label}</span>
              <span className="text-slate-300 font-mono">{row.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onExport}
          className="nirmark-btn text-[11px] font-bold py-3"
        >
          <Download size={14} /> PDF REPORT
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 text-[11px] font-bold hover:bg-slate-800 transition-all"
        >
          <Share2 size={14} /> SHARE LINK
        </button>
      </div>
    </div>
  );
}
