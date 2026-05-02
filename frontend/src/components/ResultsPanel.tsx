'use client';

interface ResultItem {
  id: string;
  standards: string[];
  content: string;
}

interface ResultsPanelProps {
  results: ResultItem[];
  latency?: string;
}

export default function ResultsPanel({ results, latency }: ResultsPanelProps) {
  if (results.length === 0) return null;

  return (
    <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-black pb-2 mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest">Audit Results</h2>
        {latency && (
          <span className="text-[10px] font-mono text-zinc-500">
            INFERENCE: {latency}
          </span>
        )}
      </div>

      <div className="space-y-8">
        {results.map((result) => (
          <div key={result.id} className="border border-zinc-200 p-4 bg-white">
            <div className="flex flex-wrap gap-2 mb-3">
              {result.standards.map((std) => (
                <span
                  key={std}
                  className="text-[10px] font-mono font-bold bg-zinc-100 text-black border border-zinc-300 px-2 py-0.5"
                >
                  {std}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-zinc-800 font-medium">
              {result.content}
            </p>
            <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span>REF: {result.id}</span>
              <span>BIS COMPLIANT</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-4 border-t border-zinc-100 flex justify-center">
        <p className="text-[9px] text-zinc-400 uppercase tracking-widest">
          End of Audit Report — Confidential
        </p>
      </div>
    </div>
  );
}
