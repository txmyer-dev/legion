import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CalendarDays } from 'lucide-react';

const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const autoSequence = [1, 3, 5]; // Mon, Wed, Fri

export default function AdaptiveRegimen() {
  const [selected, setSelected] = useState(new Set());
  const cursorRef = useRef(null);
  const gridRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const ctx = gsap.context(() => {
      const cursor = cursorRef.current;
      if (!cursor || !gridRef.current) return;

      const cells = gridRef.current.querySelectorAll('[data-day]');

      const tl = gsap.timeline({ delay: 1 });

      // Show cursor
      tl.fromTo(cursor, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.4 });

      autoSequence.forEach((dayIdx, i) => {
        const cell = cells[dayIdx];
        if (!cell) return;
        const rect = cell.getBoundingClientRect();
        const parentRect = gridRef.current.getBoundingClientRect();
        const x = rect.left - parentRect.left + rect.width / 2;
        const y = rect.top - parentRect.top + rect.height / 2;

        tl.to(cursor, {
          x,
          y,
          duration: 0.5,
          ease: 'power2.inOut',
        });

        // Click effect
        tl.to(cursor, { scale: 0.7, duration: 0.1 });
        tl.to(cursor, { scale: 1, duration: 0.2 });
        tl.call(() => {
          setSelected((prev) => new Set([...prev, dayIdx]));
        });
      });

      // Hide cursor
      tl.to(cursor, { opacity: 0, duration: 0.4, delay: 0.5 });
    });

    return () => ctx.revert();
  }, []);

  const toggle = (i) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays size={16} className="text-clay" />
        <span className="text-sm font-semibold text-charcoal">Adaptive Regimen</span>
      </div>

      {/* Calendar grid */}
      <div ref={gridRef} className="relative flex-1">
        {/* SVG cursor */}
        <svg
          ref={cursorRef}
          className="absolute top-0 left-0 z-10 pointer-events-none"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          style={{ opacity: 0, transform: 'translate(-12px, -12px)' }}
        >
          <path
            d="M5 2l14 10-7 2-4 8L5 2z"
            fill="#0026FF"
            stroke="#fff"
            strokeWidth="1"
          />
        </svg>

        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <button
              key={i}
              data-day={i}
              onClick={() => toggle(i)}
              className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 active:scale-[0.92] ${
                selected.has(i)
                  ? 'bg-clay text-white shadow-md shadow-clay/30'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button className="mt-6 w-full py-2.5 bg-charcoal text-cream rounded-full text-sm font-semibold hover:bg-charcoal/90 transition-colors active:scale-[0.97]">
        Save Protocol
      </button>
    </div>
  );
}
