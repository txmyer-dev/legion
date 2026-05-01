import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScanLine, Dna, RefreshCcw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    step: '01',
    title: 'Diagnostic Audit',
    description:
      'A comprehensive baseline assessment spanning 200+ biomarkers, genetic predispositions, and lifestyle factors. We map your biology before we optimize it.',
    icon: ScanLine,
    color: 'bg-clay',
  },
  {
    step: '02',
    title: 'Precision Protocol',
    description:
      'Your personalized optimization plan synthesized from diagnostics, peer-reviewed research, and adaptive AI modeling. No generic programs — only what moves your needle.',
    icon: Dna,
    color: 'bg-emerald-600',
  },
  {
    step: '03',
    title: 'Continuous Calibration',
    description:
      'Ongoing monitoring through wearable integration and quarterly re-assessments. Your protocol evolves as you do — never static, always converging on optimal.',
    icon: RefreshCcw,
    color: 'bg-violet-600',
  },
];

export default function Protocol() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean);

      cards.forEach((card, i) => {
        if (i === cards.length - 1) return; // last card doesn't need pinning effect

        ScrollTrigger.create({
          trigger: card,
          start: 'top 15%',
          end: 'bottom 15%',
          onEnter: () => {
            gsap.to(card, {
              scale: 0.9,
              filter: 'blur(20px)',
              opacity: 0.5,
              duration: 0.6,
              ease: 'power2.out',
            });
          },
          onLeaveBack: () => {
            gsap.to(card, {
              scale: 1,
              filter: 'blur(0px)',
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out',
            });
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="protocol" ref={sectionRef} className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Heading */}
        <div className="max-w-xl mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            The Protocol.
          </h2>
          <p className="mt-4 text-lg text-cream/60">
            Three phases of biological optimization — sequential, compounding, and relentless.
          </p>
        </div>

        {/* Stacking cards */}
        <div className="space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                ref={(el) => (cardsRef.current[i] = el)}
                className="sticky top-[15vh] rounded-[2rem] bg-charcoal border border-white/10 p-8 md:p-12 transition-transform will-change-transform"
                style={{ zIndex: i + 1 }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div
                    className={`${step.color} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0`}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-mono text-cream/40">
                      Step {step.step}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold mt-1 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-cream/60 max-w-xl leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
