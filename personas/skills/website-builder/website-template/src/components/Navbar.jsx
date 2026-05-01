import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Philosophy', href: '#philosophy' },
    { label: 'Protocol', href: '#protocol' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl transition-all duration-500 rounded-full px-6 py-3 flex items-center justify-between ${
        scrolled
          ? 'bg-white/60 backdrop-blur-xl shadow-lg text-charcoal'
          : 'bg-transparent text-cream'
      }`}
    >
      {/* Brand */}
      <a href="#" className="text-lg font-bold tracking-tight">
        NURA
      </a>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="hover:opacity-70 transition-opacity"
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* CTA */}
      <a
        href="#pricing"
        className={`hidden md:inline-flex text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300 active:scale-[0.97] ${
          scrolled
            ? 'bg-clay text-white hover:bg-clay/90'
            : 'bg-white text-charcoal hover:bg-cream'
        }`}
      >
        Get Started
      </a>

      {/* Mobile toggle */}
      <button
        className="md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-3xl p-6 flex flex-col gap-4 text-charcoal shadow-xl md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-base font-medium hover:text-clay transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#pricing"
            className="bg-clay text-white text-center py-2.5 rounded-full font-semibold active:scale-[0.97] transition-transform"
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </a>
        </div>
      )}
    </nav>
  );
}
