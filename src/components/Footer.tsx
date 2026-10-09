/**
 * ATELIER — Footer Component
 * Architectural studio directory and colophon
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__inner page-container">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__wordmark">ATELIER</span>
            <p className="footer__tagline">
              Spaces shaped by light,<br />material, and mathematical proportion.
            </p>
            <div className="footer__location-tags">
              <span className="hud-badge">PARIS STUDIO</span>
              <span className="hud-badge">MILAN STUDIO</span>
            </div>
          </div>

          <nav className="footer__nav" aria-label="Footer navigation">
            <div className="footer__nav-col">
              <span className="text-label footer__nav-heading">Selected Work</span>
              <ul role="list">
                <li><Link to="/works">All Projects</Link></li>
                <li><Link to="/works">Residential Villas</Link></li>
                <li><Link to="/works">Cultural Pavilions</Link></li>
                <li><Link to="/works">Heritage Renovations</Link></li>
              </ul>
            </div>
            <div className="footer__nav-col">
              <span className="text-label footer__nav-heading">Disciplines</span>
              <ul role="list">
                <li><Link to="/architecture">Architecture &amp; Masterplanning</Link></li>
                <li><Link to="/interiors">Interior Architecture</Link></li>
                <li><Link to="/studio">Material Research</Link></li>
              </ul>
            </div>
            <div className="footer__nav-col">
              <span className="text-label footer__nav-heading">Practice</span>
              <ul role="list">
                <li><Link to="/studio">Studio Manifesto</Link></li>
                <li><Link to="/contact">Commission Inquiries</Link></li>
                <li><Link to="/contact">Press &amp; Publications</Link></li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="divider" />

        <div className="footer__bottom">
          <p className="footer__copy">
            &copy; {CURRENT_YEAR} ATELIER Architecture &amp; Spatial Design.
            <span className="footer__disclaimer">
              {' '}All rights reserved. Monograph &amp; architectural portfolio demo.
            </span>
          </p>
          <div className="footer__bottom-links">
            <Link to="/contact">Initiate a Commission Inquiry →</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

