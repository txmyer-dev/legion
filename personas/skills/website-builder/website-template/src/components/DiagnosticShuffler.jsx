import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const cards = [
  { label: 'Epigenetic Age', value: '28.4', unit: 'yrs', trend: 'down', delta: '-3.2' },
  { label: 'Microbiome Score', value: '94.2', unit: '%', trend: 'up', delta: '+6.1' },
  { label: 'Cortisol Optimization', value: '+18', unit: '%', trend: 'up', delta: '+18%' },
];

export default function DiagnosticShuffler() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-clay" />
          <span className="text-sm font-semibold text-charcoal">Diagnostics</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Stacked cards */}
      <div className="relative flex-1 min-h-[180px]">
        {cards.map((card, i) => {
          const offset = (i - active + cards.length) % cards.length;
          return (
            <div
              key={card.label}
              className="absolute inset-x-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              style={{
                top: `${offset * 12}px`,
                zIndex: cards.length - offset,
                transform: `scale(${1 - offset * 0.04})`,
                opacity: offset === 0 ? 1 : 0.6 - offset * 0.15,
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <p className="text-xs text-gray-400 mb-1">{card.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-charcoal">{card.value}</span>
                <span className="text-sm text-gray-400 mb-1">{card.unit}</span>
              </div>
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${card.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {card.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {card.delta}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
