import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function SplitWords({ text, className = '' }) {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <span className="inline-block philosophy-word" style={{ transform: 'translateY(100%)' }}>
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

export default function Philosophy() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = sectionRef.current.querySelectorAll('.philosophy-word');
      gsap.to(words, {
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.04,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'bottom 50%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Parallax bg */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=2000&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-charcoal/80" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32">
        <div className="max-w-4xl space-y-16">
          {/* Statement 1 */}
          <div>
            <p className="text-lg md:text-xl text-cream/50 mb-2">
              <SplitWords text="Modern medicine asks:" />
            </p>
            <h2 className="text-4xl md:text-6xl font-serif italic text-cream leading-tight">
              <SplitWords text="What is wrong?" />
            </h2>
          </div>

          {/* Statement 2 */}
          <div>
            <p className="text-lg md:text-xl text-cream/50 mb-2">
              <SplitWords text="We ask:" />
            </p>
            <h2 className="text-4xl md:text-6xl font-serif italic text-clay leading-tight">
              <SplitWords text="What is optimal?" />
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
