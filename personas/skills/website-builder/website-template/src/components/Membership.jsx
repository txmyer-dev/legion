import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Essential',
    price: '$199',
    period: '/mo',
    description: 'Foundation-level optimization for the health-conscious individual.',
    featured: false,
    features: [
      'Quarterly biomarker panel (80+ markers)',
      'Personalized supplement protocol',
      'Monthly optimization report',
      'Community access',
      'Mobile app tracking',
    ],
  },
  {
    name: 'Performance',
    price: '$399',
    period: '/mo',
    description: 'Full-spectrum biological optimization with hands-on guidance.',
    featured: true,
    features: [
      'Monthly biomarker panel (200+ markers)',
      'Dedicated wellness strategist',
      'Custom nutrition & training protocols',
      'Wearable data integration',
      'Bi-weekly check-in calls',
      'Priority protocol adjustments',
    ],
  },
  {
    name: 'Concierge',
    price: 'Custom',
    period: '',
    description: 'White-glove precision wellness for uncompromising optimization.',
    featured: false,
    features: [
      'Unlimited biomarker access',
      'On-call medical team',
      'Genetic & epigenetic deep-dive',
      'In-home testing & consultations',
      'Executive health retreats',
      'Family protocol extension',
    ],
  },
];

export default function Membership() {
  return (
    <section id="pricing" className="bg-cream rounded-t-[3rem] relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        {/* Heading */}
        <div className="max-w-xl mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal tracking-tight">
            Membership
          </h2>
          <p className="mt-4 text-lg text-charcoal/60">
            Choose the depth of optimization that matches your ambition.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-[2rem] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                tier.featured
                  ? 'bg-clay text-white shadow-xl shadow-clay/20'
                  : 'bg-white text-charcoal shadow-sm'
              }`}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-8 bg-white text-clay text-xs font-bold px-4 py-1 rounded-full shadow">
                  Popular
                </span>
              )}

              <h3 className="text-xl font-bold">{tier.name}</h3>
              <p
                className={`mt-2 text-sm ${
                  tier.featured ? 'text-white/70' : 'text-charcoal/50'
                }`}
              >
                {tier.description}
              </p>

              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span
                  className={`text-sm ${
                    tier.featured ? 'text-white/60' : 'text-charcoal/40'
                  }`}
                >
                  {tier.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        tier.featured ? 'text-white/80' : 'text-clay'
                      }`}
                    />
                    <span className={tier.featured ? 'text-white/90' : 'text-charcoal/70'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-full font-semibold text-sm transition-all duration-300 active:scale-[0.97] ${
                  tier.featured
                    ? 'bg-white text-clay hover:bg-cream'
                    : 'bg-charcoal text-cream hover:bg-charcoal/90'
                }`}
              >
                {tier.price === 'Custom' ? 'Contact Us' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
