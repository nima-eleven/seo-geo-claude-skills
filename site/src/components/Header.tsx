'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@/content/site';
import type { PageSections } from '@/lib/sections';
import { CtaLink } from './CtaLink';

export function Header({ sections }: { sections?: PageSections }) {
  // On the article and privacy routes the landing page's optional sections are
  // not in scope; defaulting to true keeps those anchors, which resolve
  // against `/` regardless.
  const { watch = true, insights = true } = sections ?? {};

  const NAV = [
    { href: '/#services', label: 'Services' },
    { href: '/#about', label: 'About' },
    ...(watch ? [{ href: '/#watch', label: 'Watch' }] : []),
    ...(insights ? [{ href: '/insights', label: 'Insights' }] : []),
  ];

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // The bottom hairline appears only once the page has moved, so the header
  // sits flush with the hero at rest.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu: lock the page, trap focus, close on Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ) ?? [],
      );

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;

      const items = focusables();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      id="top"
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-150 ${
        scrolled ? 'border-sage-mist' : 'border-transparent'
      }`}
      style={{ backgroundColor: 'rgba(245, 246, 243, 0.88)' }}
    >
      <div className="shell flex items-center justify-between gap-6 py-4">
        <a
          href="/#top"
          className="group flex flex-col leading-none no-underline"
          aria-label={`${site.name} — home`}
        >
          <span
            className="text-xl md:text-2xl"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            {site.name}
          </span>
          <span className="mono mt-1 hidden text-graphite sm:block">
            {site.role}
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="mono text-graphite no-underline transition-colors duration-150 hover:text-evergreen"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <CtaLink href="/#contact-form" location="header" label="start_conversation">
            {site.hero.primaryCta}
          </CtaLink>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="mono flex items-center gap-2 rounded-[4px] border border-sage-mist px-3 py-2 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {menuOpen ? (
        <div
          id="mobile-menu"
          ref={panelRef}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-porcelain px-5 pb-10 lg:hidden"
        >
          <div className="flex items-center justify-between py-4">
            <span className="mono text-graphite">{site.role}</span>
            <button
              type="button"
              className="mono rounded-[4px] border border-sage-mist px-3 py-2"
              onClick={() => {
                setMenuOpen(false);
                toggleRef.current?.focus();
              }}
            >
              Close
            </button>
          </div>

          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-sage-mist py-4 text-2xl no-underline"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {item.label}
            </a>
          ))}

          <div className="pt-6">
            <CtaLink
              href="/#contact-form"
              location="mobile_menu"
              label="start_conversation"
              className="w-full"
              onNavigate={() => setMenuOpen(false)}
            >
              {site.hero.primaryCta}
            </CtaLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
