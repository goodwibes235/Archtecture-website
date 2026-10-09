/**
 * ATELIER — Studio Manifesto & Practice
 * Elevated architectural editorial layout
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './Studio.css';

export const Studio: React.FC = () => (
  <div className="studio-page">
    {/* Hero */}
    <div className="studio-hero page-container">
      <span className="hud-badge">
        <span className="hud-badge__dot" />
        Studio Manifesto
      </span>
      <h1 className="text-hero studio-hero__title">
        An architecture practice<br />
        built on <em>careful observation.</em>
      </h1>
      <p className="text-lead studio-hero__lead">
        We shape enduring environments through natural daylight, structural honesty,
        and mathematical proportion.
      </p>
    </div>

    {/* Philosophy Split */}
    <div className="studio-body page-container">
      <div className="studio-philosophy">
        <div className="studio-philosophy__badge">
          <span className="text-label">Doctrine</span>
        </div>
        <div className="studio-philosophy__text">
          <p className="text-lead studio-philosophy__lead">
            ATELIER is an international architecture and spatial design practice operating
            between Paris and Milan. We believe that the greatest spaces begin with rigorous
            listening — to site topography, solar azimuth trajectories, and the human rituals
            that will inhabit the volume.
          </p>
          <p>
            Architecture is not surface decoration. It is the sculpting of daily experience
            through tactile stone, fair-faced concrete, honest joinery, and the discipline
            of restraint. We design at every scale — from regional masterplans to custom
            patinated bronze hardware.
          </p>
        </div>
      </div>

      {/* Principles Monograph */}
      <div className="studio-principles">
        <div className="studio-principles__header">
          <span className="text-label">Core Principles</span>
          <h2 className="text-h2">The Five Tenets</h2>
        </div>

        <div className="principles-grid">
          {[
            {
              roman: 'I',
              title: 'Light & Shadow',
              desc: 'Every project begins by modeling how solar angles sweep across the site over four seasons. Daylight is our primary building material.',
            },
            {
              roman: 'II',
              title: 'Material Authenticity',
              desc: 'We specify natural limestone, fumed timber, and cast concrete for how they age, weather, and gain emotional depth over decades.',
            },
            {
              roman: 'III',
              title: 'Proportion & Geometry',
              desc: 'Spatial serenity is inseparable from mathematical precision. We align every axis, portal, and horizon with dimensional discipline.',
            },
            {
              roman: 'IV',
              title: 'Contextual Topography',
              desc: 'Architecture belongs to its bedrock. We study bedrock strata, prevailing coastal winds, and indigenous flora before drawing the first line.',
            },
            {
              roman: 'V',
              title: 'Quiet Restraint',
              desc: 'The deliberate elimination of the superfluous is not minimalism for its own sake — it is unwavering clarity and confidence.',
            },
          ].map((item) => (
            <article key={item.roman} className="principle-card">
              <span className="principle-card__roman text-mono">{item.roman}</span>
              <h3 className="principle-card__title">{item.title}</h3>
              <p className="principle-card__desc">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </div>

    {/* Studio Call to Action */}
    <div className="studio-cta page-container">
      <div className="studio-cta__card">
        <span className="hud-badge">
          <span className="hud-badge__dot" />
          Collaborations
        </span>
        <h2 className="text-h1 studio-cta__title">
          Commission an architectural<br />
          <em>work.</em>
        </h2>
        <p className="text-lead studio-cta__desc">
          We welcome dialogue on residential sanctuaries, cultural institutions, and
          heritage transformations worldwide.
        </p>
        <Link to="/contact" className="btn btn--primary btn--large">
          <span>Initiate a Conversation</span>
          <span className="btn__arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  </div>
);

