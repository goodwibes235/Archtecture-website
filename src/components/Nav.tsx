/**
 * ATELIER — Navigation Component
 * Elevated minimal architectural navigation
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from '../lib/scroll';
import './Nav.css';

export const Nav: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Scroll state for nav appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate nav in on mount
  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { y: -15, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  const navLinks = [
    { to: '/works', label: 'Selected Works' },
    { to: '/architecture', label: 'Architecture' },
    { to: '/interiors', label: 'Interiors' },
    { to: '/studio', label: 'Studio' },
    { to: '/contact', label: 'Inquiries' },
  ];

  return (
    <>
      <nav
        ref={navRef}
        className={`nav ${scrolled ? 'nav--scrolled' : ''} ${menuOpen ? 'nav--open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="nav__inner">
          {/* Wordmark */}
          <Link to="/" className="nav__wordmark" aria-label="ATELIER — home">
            <span className="nav__wordmark-main">ATELIER</span>
            <span className="nav__wordmark-sub">ARCHITECTURE &amp; SPATIAL DESIGN</span>
          </Link>

          {/* Desktop links */}
          <ul className="nav__links" role="list">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`nav__link ${location.pathname === to ? 'nav__link--active' : ''}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side status & CTA */}
          <div className="nav__actions">
            <span className="nav__status hud-badge">
              <span className="hud-badge__dot" />
              PARIS · MILAN
            </span>

            <Link to="/contact" className="btn btn--primary nav__cta">
              <span>Commission</span>
              <span className="btn__arrow" aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="nav__hamburger"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="nav__hamburger-line" />
            <span className="nav__hamburger-line" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu__inner">
          <span className="text-label mobile-menu__label">Navigation</span>
          <ul className="mobile-menu__links" role="list">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`mobile-menu__link ${location.pathname === to ? 'mobile-menu__link--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mobile-menu__footer">
            <Link
              to="/contact"
              className="btn btn--primary btn--large"
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
            >
              <span>Initiate a Commission Inquiry</span>
              <span className="btn__arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

