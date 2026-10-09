/**
 * ATELIER — Selected Works / Architectural Portfolio
 * Elevated editorial project archive
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Works.css';

const FILTERS = ['All', 'Architecture', 'Residential', 'Interiors', 'Hospitality', 'Renovation'];

const PROJECTS = [
  {
    id: 'casa-di-calcare',
    title: 'Casa di Calcare',
    subtitle: 'Limestone Courtyard Villa',
    location: 'Mediterranean Coast',
    year: '2024',
    category: 'Residential',
    area: '840 m²',
    materials: 'Travertine & Bronze',
    tags: ['Architecture', 'Residential'],
    poster: '/media/atelier/featured-residence/poster.jpg',
    gradient: 'linear-gradient(150deg, #1c1a10 0%, #28230e 100%)',
  },
  {
    id: 'light-and-proportion-house',
    title: 'Light & Proportion Pavilion',
    subtitle: 'Colonnade Residence & Courtyard',
    location: 'Southern Europe',
    year: '2023',
    category: 'Architecture',
    area: '620 m²',
    materials: 'Cast Concrete & Terrazzo',
    tags: ['Architecture', 'Residential'],
    poster: '/media/atelier/philosophy-light/poster.jpg',
    gradient: 'linear-gradient(135deg, #16140f 0%, #2b2720 100%)',
  },
  {
    id: 'urban-interior-sanctuary',
    title: 'Urban Interior Sanctuary',
    subtitle: 'Double-Height Spatial Sequence',
    location: 'Milan, Italy',
    year: '2024',
    category: 'Interiors',
    area: '340 m²',
    materials: 'Fumed Oak & Micro-Cement',
    tags: ['Interiors'],
    poster: '/media/atelier/interior-journey/poster.jpg',
    gradient: 'linear-gradient(120deg, #1e1b14 0%, #2d2820 100%)',
  },
  {
    id: 'travertine-monolith-pavilion',
    title: 'Travertine Monolith Pavilion',
    subtitle: 'Private Cultural Gallery',
    location: 'Provence, France',
    year: '2022',
    category: 'Architecture',
    area: '1,120 m²',
    materials: 'Roman Travertine & Glass',
    tags: ['Architecture', 'Residential'],
    poster: '/media/atelier/hero-architecture/poster.jpg',
    gradient: 'linear-gradient(160deg, #1a1812 0%, #2a2419 100%)',
  },
  {
    id: 'oak-and-concrete-loft',
    title: 'Oak & Concrete Loft',
    subtitle: 'Historic Warehouse Transformation',
    location: 'Historic Quarter',
    year: '2023',
    category: 'Renovation',
    area: '290 m²',
    materials: 'End-Grain Timber & Steel',
    tags: ['Renovation', 'Interiors'],
    poster: '/media/atelier/material-details/poster.jpg',
    gradient: 'linear-gradient(140deg, #211e17 0%, #30291c 100%)',
  },
  {
    id: 'coastal-stone-retreat',
    title: 'Coastal Stone Retreat',
    subtitle: 'Cliffside Hospitality Sanctuary',
    location: 'Adriatic Coast',
    year: '2024',
    category: 'Hospitality',
    area: '1,450 m²',
    materials: 'Volcanic Stone & Glass',
    tags: ['Hospitality', 'Architecture'],
    poster: '/media/atelier/closing-architecture/poster.jpg',
    gradient: 'linear-gradient(170deg, #0e0f10 0%, #151618 100%)',
  },
];

export const Works: React.FC = () => {
  const [active, setActive] = useState('All');

  const visible = active === 'All'
    ? PROJECTS
    : PROJECTS.filter((p) => p.tags.includes(active));

  return (
    <div className="works-page">
      <div className="works-hero page-container">
        <span className="hud-badge">
          <span className="hud-badge__dot" />
          Monograph Archive
        </span>
        <h1 className="text-hero works-hero__title">
          Selected<br /><em>Commissions.</em>
        </h1>
        <p className="text-lead works-hero__sub">
          A curated survey of residential sanctuaries, cultural pavilions, and spatial
          interventions crafted through light, volume, and authentic materiality.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="works-filters page-container" role="group" aria-label="Project typology filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn ${active === f ? 'filter-btn--active' : ''}`}
            onClick={() => setActive(f)}
            aria-pressed={active === f}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Editorial Project Grid */}
      <div className="works-grid page-container">
        {visible.map((project, idx) => (
          <article key={project.id} className="project-card">
            <Link
              to={`/works/${project.id}`}
              className="project-card__link"
              aria-label={`View ${project.title}`}
            >
              <div
                className="project-card__image-box"
                style={{ background: project.gradient }}
              >
                <div className="project-card__badge-top">
                  <span className="text-mono">0{idx + 1}</span>
                  <span className="text-label">{project.year}</span>
                </div>

                <img
                  src={project.poster}
                  alt={project.title}
                  loading="lazy"
                  className="project-card__img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="project-card__overlay" />
              </div>

              <div className="project-card__info">
                <div className="project-card__meta">
                  <span className="text-label">{project.category}</span>
                  <span className="project-card__meta-divider" aria-hidden="true">·</span>
                  <span className="text-label">{project.location}</span>
                </div>

                <h2 className="project-card__title text-h2">{project.title}</h2>
                <p className="project-card__subtitle">{project.subtitle}</p>

                <div className="project-card__specs">
                  <span className="text-mono">{project.area}</span>
                  <span className="project-card__specs-dot">·</span>
                  <span className="text-mono">{project.materials}</span>
                </div>

                <span className="project-card__cta" aria-hidden="true">
                  <span>View Project Monograph</span>
                  <span className="project-card__arrow">→</span>
                </span>
              </div>
            </Link>
          </article>
        ))}

        {visible.length === 0 && (
          <div className="works-empty">
            <p>No projects found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

