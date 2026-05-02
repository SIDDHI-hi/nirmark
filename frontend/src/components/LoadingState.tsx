'use client';

import { motion } from 'framer-motion';

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative mb-8">
        {/* Simple Professional Loader */}
        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-2 mb-12">
        <h3 className="text-xl font-bold text-white">Analyzing Standards Corpus</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Querying BIS database and generating AI relevance rationales...
        </p>
      </div>

      {/* Shimmer Skeletons for the results appearing soon */}
      <div className="w-full max-w-2xl space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="nirmark-card p-6 opacity-40">
            <div className="flex justify-between mb-4">
              <div className="space-y-2">
                <div className="h-4 w-24 skeleton" />
                <div className="h-6 w-48 skeleton" />
              </div>
              <div className="h-12 w-12 rounded-full skeleton" />
            </div>
            <div className="h-20 w-full skeleton mb-4" />
            <div className="flex gap-3">
              <div className="h-8 w-32 skeleton" />
              <div className="h-8 w-24 skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
