/**
 * ATELIER — Homepage
 * 
 * Rebuilt as a persistent 100svh cinematic camera stage with:
 * - GSAP ScrollTrigger deterministic scrub
 * - Multi-layer parallax (Background, Midground Architecture, Foreground, Atmosphere, Typography)
 * - Horizontal lateral camera tracking across architectural compositions
 * - Seamless continuous transitions between all 6 chapters
 * - Seamless flow into Practice Disciplines & Editorial Sections
 */

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '../lib/scroll';
import { CinematicStage } from '../components/CinematicStage';
import './Home.css';

export const Home: React.FC = () => {
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reveal animation for the Practice Disciplines section after the cinematic stage
    if (servicesRef.current) {
      const elements = servicesRef.current.querySelectorAll('[data-reveal]');
      if (elements.length) {
        ScrollTrigger.create({
          trigger: servicesRef.current,
          start: 'top 75%',
          onEnter: () => {
            gsap.fromTo(
              elements,
              { y: 35, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 1.1,
                stagger: 0.12,
                ease: 'power3.out',
              }
            );
          },
        });
      }
    }

    // Refresh ScrollTrigger after DOM layout stabilizes
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main className="home">
      {/* ── 1. PERSISTENT CINEMATIC PARALLAX STAGE (CHAPTERS 01-06) ── */}
      <CinematicStage />

      {/* ── 2. PRACTICE DISCIPLINES & SPATIAL STRATEGY ─────────────── */}
      <section className="services-editorial" ref={servicesRef} aria-label="Practice Disciplines">
        <div className="page-container">
          <div className="services-editorial__top">
            <div className="services-title-wrap">
              <span className="text-label" data-reveal>PRACTICE DISCIPLINES</span>
              <h2 className="text-h1 services-editorial__heading" data-reveal>
                Architecture &amp;<br />Spatial Strategy
              </h2>
            </div>
            <p className="services-editorial__intro text-lead" data-reveal>
              From the earliest masterplan sketches to the precision of custom millwork details,
              our studio operates across every scale of the built environment.
            </p>
          </div>

          <div className="services-editorial__grid">
            {[
              {
                num: '01',
                title: 'Architecture & Masterplanning',
                tag: 'Residential & Cultural',
                desc: 'Bespoke residential estates, cultural pavilions, and masterplans conceived with environmental rigour and structural clarity.',
                link: '/works',
              },
              {
                num: '02',
                title: 'Interior Spatial Architecture',
                tag: 'Volumes & Atmosphere',
                desc: 'Spatial sequencing, tailored joinery, and material choreography designed in seamless continuity with the exterior form.',
                link: '/works',
              },
              {
                num: '03',
                title: 'Adaptive Heritage Renovation',
                tag: 'Conservation & Reuse',
                desc: 'Sensitive interventions in historic buildings — preserving structural memory while introducing contemporary clarity.',
                link: '/works',
              },
              {
                num: '04',
                title: 'Environmental & Site Strategy',
                tag: 'Microclimate & Solar',
                desc: 'Passive solar optimization, natural thermal mass planning, and harmonious integration with native topography.',
                link: '/studio',
              },
            ].map((s) => (
              <article key={s.num} className="service-card" data-reveal>
                <div className="service-card__top">
                  <span className="service-card__num text-mono">{s.num}</span>
                  <span className="service-card__tag text-label">{s.tag}</span>
                </div>
                <h3 className="service-card__title">{s.title}</h3>
                <p className="service-card__desc">{s.desc}</p>
                <Link to={s.link} className="service-card__link">
                  <span>Learn more</span>
                  <span className="service-card__arrow" aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
