import { forwardRef } from 'react';
import './Scene3DVisual.css';

export interface Scene3DVisualProps {
  sceneId: 1 | 2 | 3 | 4 | 5 | 6;
  activeMaterial?: 'travertine' | 'bronze' | 'oak';
  className?: string;
}

export const Scene3DVisual = forwardRef<HTMLDivElement, Scene3DVisualProps>(
  ({ sceneId, activeMaterial = 'travertine', className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`scene-visual-wrapper scene-visual-wrapper--s${sceneId} ${className}`}
        aria-hidden="true"
      >
        <div className="scene-visual-card">
          {/* Top Architectural Monograph Header */}
          <div className="visual-card__header">
            <span className="visual-card__tag">
              {sceneId === 1 && 'MASSING MONOGRAPH · 01'}
              {sceneId === 2 && 'SOLAR INCIDENCE · 02'}
              {sceneId === 3 && 'TOPOGRAPHY & STRATA · 03'}
              {sceneId === 4 && 'VOLUMETRIC AXIS · 04'}
              {sceneId === 5 && 'MATERIAL COMPOSITION · 05'}
              {sceneId === 6 && 'TWILIGHT ENVELOPE · 06'}
            </span>
            <span className="visual-card__coord">
              {sceneId === 1 && 'AXO 30° / 60° · SCALE 1:200'}
              {sceneId === 2 && 'AZIMUTH 214° · EL 48.5°'}
              {sceneId === 3 && 'DATUM 0.00m · BEDROCK'}
              {sceneId === 4 && 'SECTION AA · 5.4m VOID'}
              {sceneId === 5 && `SPECIMEN · ${activeMaterial.toUpperCase()} 1:1`}
              {sceneId === 6 && 'BLUE HOUR · LUMEN 2700K'}
            </span>
          </div>

          {/* 3D Stage Viewport with Photorealistic Asset & Annotations */}
          <div className="visual-stage-viewport">
            {/* Background Isometric Architectural Grid */}
            <svg className="visual-grid-bg" viewBox="0 0 400 300" fill="none">
              <defs>
                <pattern id={`isoGrid-${sceneId}`} width="40" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 0 12 L 20 0 L 40 12 L 20 24 Z" stroke="rgba(246, 243, 236, 0.05)" strokeWidth="0.7" fill="none" />
                </pattern>
              </defs>
              <rect width="400" height="300" fill={`url(#isoGrid-${sceneId})`} />
            </svg>

            {/* ── SCENE 1: PHOTOREALISTIC LUXURY VILLA MINIATURE ── */}
            {sceneId === 1 && (
              <div className="visual-asset-container">
                <img
                  src="/media/visuals/scene_1.webp"
                  alt="Contemporary luxury villa miniature with concrete, glass, stone, and reflecting pool"
                  className="visual-photorealistic-asset"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />

                {/* Technical Callout 1: Proportion */}
                <div className="visual-annotation" style={{ top: '14%', left: '6%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Proportion</span>
                    <span className="visual-annotation__desc">1 : 1.618 Volumetric Axis</span>
                  </div>
                </div>

                {/* Technical Callout 2: Natural Light */}
                <div className="visual-annotation" style={{ top: '22%', right: '6%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Natural Light</span>
                    <span className="visual-annotation__desc">Clerestory Solar Ingress</span>
                  </div>
                </div>

                {/* Technical Callout 3: Spatial Flow */}
                <div className="visual-annotation" style={{ bottom: '10%', left: '16%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Spatial Flow</span>
                    <span className="visual-annotation__desc">Continuous Terrace Datum</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── SCENE 2: PHOTOREALISTIC COLONNADE LIGHT & CAST SHADOW DETAIL ── */}
            {sceneId === 2 && (
              <div className="visual-asset-container">
                <img
                  src="/media/visuals/scene_2.webp"
                  alt="Architectural travertine colonnade detail interacting with sunlight and raking shadows"
                  className="visual-photorealistic-asset"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />

                {/* Technical Callout 1: Light */}
                <div className="visual-annotation" style={{ top: '12%', right: '8%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Light</span>
                    <span className="visual-annotation__desc">Solar Azimuth 214° · Incident Rays</span>
                  </div>
                </div>

                {/* Technical Callout 2: Shadow */}
                <div className="visual-annotation" style={{ bottom: '14%', right: '12%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Shadow</span>
                    <span className="visual-annotation__desc">Tonal Raking Gradient</span>
                  </div>
                </div>

                {/* Technical Callout 3: Form */}
                <div className="visual-annotation" style={{ top: '32%', left: '8%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Form</span>
                    <span className="visual-annotation__desc">Travertine Colonnade Rhythm</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── SCENE 3: PHOTOREALISTIC COASTAL VILLA MODEL & TOPOGRAPHY ── */}
            {sceneId === 3 && (
              <div className="visual-asset-container">
                <img
                  src="/media/visuals/scene_3.webp"
                  alt="Sophisticated coastal villa model with limestone surfaces, glass windows, and bedrock cliff"
                  className="visual-photorealistic-asset"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />

                {/* Technical Callout 1: Site */}
                <div className="visual-annotation" style={{ bottom: '14%', left: '6%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Site</span>
                    <span className="visual-annotation__desc">Native Bedrock Strata Embedment</span>
                  </div>
                </div>

                {/* Technical Callout 2: Structure */}
                <div className="visual-annotation" style={{ top: '18%', right: '8%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Structure</span>
                    <span className="visual-annotation__desc">Post-Tensioned Limestone Mass</span>
                  </div>
                </div>

                {/* Technical Callout 3: Landscape */}
                <div className="visual-annotation" style={{ top: '36%', left: '6%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Landscape</span>
                    <span className="visual-annotation__desc">Framed Coastal Horizon Datum</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── SCENE 4: PHOTOREALISTIC MODERN STAIRCASE INTERIOR MODEL ── */}
            {sceneId === 4 && (
              <div className="visual-asset-container">
                <img
                  src="/media/visuals/scene_4.webp"
                  alt="Modern floating staircase interior room model with oak wood, concrete wall, and bronze rods"
                  className="visual-photorealistic-asset"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />

                {/* Technical Callout 1: Flow */}
                <div className="visual-annotation" style={{ top: '24%', left: '6%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Flow</span>
                    <span className="visual-annotation__desc">Vertical Staircase Circulation</span>
                  </div>
                </div>

                {/* Technical Callout 2: Openness */}
                <div className="visual-annotation" style={{ top: '12%', right: '8%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Openness</span>
                    <span className="visual-annotation__desc">5.4m Double-Height Volume</span>
                  </div>
                </div>

                {/* Technical Callout 3: Material */}
                <div className="visual-annotation" style={{ bottom: '12%', right: '10%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Material</span>
                    <span className="visual-annotation__desc">Fumed Oak Joinery Plinth</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── SCENE 5: ISOLATED MATERIAL SAMPLES (TRAVERTINE, BRONZE, OAK) ── */}
            {sceneId === 5 && (
              <div className="visual-asset-container">
                <img
                  src={
                    activeMaterial === 'travertine'
                      ? '/media/visuals/material_travertine.webp'
                      : activeMaterial === 'bronze'
                      ? '/media/visuals/material_bronze.webp'
                      : activeMaterial === 'oak'
                      ? '/media/visuals/material_oak.webp'
                      : '/media/visuals/scene_5.webp'
                  }
                  alt={`High-quality isolated architectural specimen: ${activeMaterial}`}
                  className="visual-photorealistic-asset visual-photorealistic-asset--material"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />

                {/* Technical Callout 1: Active Material Identifier */}
                <div className="visual-annotation" style={{ top: '14%', left: '6%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">
                      {activeMaterial === 'travertine' && 'Honed Travertine'}
                      {activeMaterial === 'bronze' && 'Brushed Bronze'}
                      {activeMaterial === 'oak' && 'Rift-Sawn Oak'}
                    </span>
                    <span className="visual-annotation__desc">
                      {activeMaterial === 'travertine' && 'Quiet Permanence · Micro-Porous Honed'}
                      {activeMaterial === 'bronze' && 'Subtle Warmth · Living Surface Patina'}
                      {activeMaterial === 'oak' && 'Natural Character · Straight Grain Rift'}
                    </span>
                  </div>
                </div>

                {/* Technical Callout 2: Tactility */}
                <div className="visual-annotation" style={{ bottom: '14%', right: '8%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Tactile Finish</span>
                    <span className="visual-annotation__desc">Hand-Crafted Architectural Specimen</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── SCENE 6: PHOTOREALISTIC SCULPTURAL PAVILION MODEL ── */}
            {sceneId === 6 && (
              <div className="visual-asset-container">
                <img
                  src="/media/visuals/scene_6.webp"
                  alt="Photorealistic sculptural pavilion model with warm luminous interior lighting and reflecting pool"
                  className="visual-photorealistic-asset"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />

                {/* Technical Callout 1: Form */}
                <div className="visual-annotation" style={{ top: '14%', left: '6%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Form</span>
                    <span className="visual-annotation__desc">Slender Structural Frame</span>
                  </div>
                </div>

                {/* Technical Callout 2: Atmosphere */}
                <div className="visual-annotation" style={{ top: '28%', right: '6%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Atmosphere</span>
                    <span className="visual-annotation__desc">Luminous Core Ambient Radiance</span>
                  </div>
                </div>

                {/* Technical Callout 3: Place */}
                <div className="visual-annotation" style={{ bottom: '10%', left: '16%' }}>
                  <span className="visual-annotation__node" />
                  <div className="visual-annotation__content">
                    <span className="visual-annotation__title">Place</span>
                    <span className="visual-annotation__desc">Reflecting Pool Environmental Bond</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Datum Reference */}
          <div className="visual-card__footer">
            <div className="visual-card__status">
              <span className="visual-card__status-dot" />
              <span>SPATIAL COMPUTATION</span>
            </div>
            <span className="visual-card__axis">COORD [Z: +1.00m · X/Y ORTHO]</span>
          </div>
        </div>
      </div>
    );
  }
);

Scene3DVisual.displayName = 'Scene3DVisual';
