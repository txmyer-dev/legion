import { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

const messages = [
  'Optimizing Circadian Rhythm...',
  'Analyzing Sleep Architecture...',
  'Calibrating Hormone Levels...',
  'Adjusting Cortisol Window...',
];

export default function TelemetryTypewriter() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = messages[msgIndex];

    if (!deleting && charIndex < current.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), 45);
      return () => clearTimeout(t);
    }

    if (!deleting && charIndex === current.length) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    }

    if (deleting && charIndex > 0) {
      const t = setTimeout(() => setCharIndex((c) => c - 1), 25);
      return () => clearTimeout(t);
    }

    if (deleting && charIndex === 0) {
      setDeleting(false);
      setMsgIndex((m) => (m + 1) % messages.length);
    }
  }, [charIndex, deleting, msgIndex]);

  const displayed = messages[msgIndex].slice(0, charIndex);

  return (
    <div className="bg-charcoal rounded-[2rem] p-6 shadow-sm h-full flex flex-col text-cream">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-clay" />
          <span className="text-sm font-semibold">Live Feed</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Connected
        </span>
      </div>

      {/* Terminal */}
      <div className="flex-1 flex items-center">
        <p className="font-mono text-sm md:text-base">
          <span className="text-clay mr-1">&gt;</span>
          {displayed}
          <span className="inline-block w-2 h-4 bg-clay ml-0.5 animate-pulse rounded-sm" />
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-xs text-cream/50">
        <span>Active Protocols: 4</span>
        <span>Sync: Real-time</span>
      </div>
    </div>
  );
}
