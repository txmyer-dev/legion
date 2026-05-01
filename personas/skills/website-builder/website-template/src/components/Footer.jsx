export default function Footer() {
  return (
    <footer className="bg-charcoal rounded-t-[4rem] relative z-10 -mt-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold tracking-tight mb-3">NURA</h3>
            <p className="text-cream/50 max-w-sm text-sm leading-relaxed">
              Precision wellness, powered by data. We decode your biology so you
              can operate at your theoretical best.
            </p>
          </div>

          {/* Protocol links */}
          <div>
            <h4 className="text-sm font-semibold text-cream/40 uppercase tracking-wider mb-4">
              Protocol
            </h4>
            <ul className="space-y-2.5 text-sm">
              {['Diagnostics', 'Optimization', 'Calibration', 'Research'].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-cream/60 hover:text-cream transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-sm font-semibold text-cream/40 uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              {['About', 'Careers', 'Press', 'Privacy', 'Terms'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-cream/60 hover:text-cream transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/30">
            &copy; {new Date().getFullYear()} NURA. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-cream/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
