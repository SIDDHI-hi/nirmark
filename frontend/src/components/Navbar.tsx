'use client';

import { motion } from 'framer-motion';
import { Search, Info } from 'lucide-react';
import { useState } from 'react';
import InfoModal from '@/components/InfoModal';

interface NavbarProps {
  onCmdK: () => void;
  onInfoClick: () => void;
}

export default function Navbar({ onCmdK, onInfoClick }: NavbarProps) {
  return (
    <>
      <nav 
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: '#0A0E17', borderBottom: '1px solid #1E293B' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 select-none">
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-lg"
            style={{ background: '#3B82F6' }}
          >
            N
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-tight text-white">NIRMARK</span>
            <span className="text-[10px] tracking-widest uppercase text-slate-500 font-bold">BIS Intelligence</span>
          </div>
        </div>

        {/* Search Hint (Center) */}
        <button
          onClick={onCmdK}
          className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg text-sm border border-slate-800 bg-slate-900/50 text-slate-500 hover:border-blue-500/50 transition-all"
        >
          <Search size={14} />
          <span>Search standards...</span>
          <kbd className="text-[10px] px-2 py-0.5 rounded ml-4 bg-slate-800 text-slate-400 border border-slate-700">⌘K</kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onInfoClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Analytics Methodology"
          >
            <Info size={16} className="text-blue-500" />
            METHODOLOGY
          </button>
        </div>
      </nav>
    </>
  );
}
