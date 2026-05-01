import DiagnosticShuffler from './DiagnosticShuffler';
import TelemetryTypewriter from './TelemetryTypewriter';
import AdaptiveRegimen from './AdaptiveRegimen';

export default function Features() {
  return (
    <section id="features" className="relative bg-cream rounded-t-[3rem] -mt-6 z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        {/* Heading */}
        <div className="max-w-xl mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal tracking-tight">
            Precision Instruments
          </h2>
          <p className="mt-4 text-lg text-charcoal/60">
            Three pillars of continuous optimization, working in concert to decode
            your biology.
          </p>
        </div>

        {/* 3-column grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <DiagnosticShuffler />
          <TelemetryTypewriter />
          <AdaptiveRegimen />
        </div>
      </div>
    </section>
  );
}
