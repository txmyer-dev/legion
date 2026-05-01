import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-text]', {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.15,
        delay: 0.3,
      });
      gsap.from('[data-hero-scroll]', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 1.4,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-[100dvh] w-full overflow-hidden flex items-end"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?w=2000&q=80)',
        }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/70 to-charcoal/20" />

      {/* Content — bottom-left third */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-2xl">
          <h1 data-hero-text className="text-5xl md:text-7xl font-bold font-sans leading-[1.05] tracking-tight">
            Nature is the
          </h1>
          <h1 data-hero-text className="text-6xl md:text-8xl font-serif italic text-clay leading-[1] mt-1">
            Algorithm.
          </h1>
          <p data-hero-text className="mt-6 text-lg md:text-xl text-cream/70 font-light max-w-md">
            Precision wellness, powered by data.
          </p>
          <a
            data-hero-text
            href="#features"
            className="inline-flex mt-8 px-7 py-3 bg-clay text-white rounded-full font-semibold text-sm hover:bg-clay/90 transition-colors active:scale-[0.97]"
          >
            Explore the Protocol
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        data-hero-scroll
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-cream/40"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={18} className="animate-bounce" />
      </div>
    </section>
  );
}
