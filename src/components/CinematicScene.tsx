/**
 * ATELIER — Cinematic Scene Component
 * A scroll-controlled scene: canvas frame sequence OR poster fallback.
 * HTML text and parallax layers are kept separate from the video layer.
 * Per theme.md § 9, 13, 15.
 */

import React, { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll';
import type { CinematicScene } from '../data/cinematicScenes';
import './CinematicScene.css';

interface CinematicSceneProps {
  scene: CinematicScene;
  /** Scroll span in viewport heights, e.g. 2 = 200vh pinned */
  scrollSpan?: number;
  chapterNumber?: string;
  coordinates?: string;
  statusBadge?: string;
  alignment?: 'bottom-left' | 'center' | 'split' | 'fullscreen';
  children?: React.ReactNode;
  onProgress?: (progress: number) => void;
}

export const CinematicSceneComponent: React.FC<CinematicSceneProps> = ({
  scene,
  scrollSpan = 2,
  chapterNumber,
  coordinates,
  statusBadge,
  alignment = 'bottom-left',
  children,
  onProgress,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const hasFrames = scene.frameCount > 0 && scene.framePattern !== null;

  // Stored CSS width/height for drawing (not raw pixel dimensions)
  const cssSizeRef = useRef({ w: 0, h: 0 });
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastDrawnIdx = useRef(-1);
  const currentProgressRef = useRef(0);

  const getFrameUrl = (idx: number): string => {
    if (!scene.framePattern) return scene.poster;
    return scene.framePattern.replace('{index}', String(idx).padStart(4, '0'));
  };

  const drawFrame = (progress: number) => {
    if (!hasFrames || !canvasRef.current) return;
    const span = scene.endIndex - scene.startIndex;
    if (span < 0) return;

    const rawIdx = span > 0 ? scene.startIndex + Math.round(progress * span) : scene.startIndex;
    const idx = Math.max(scene.startIndex, Math.min(scene.endIndex, rawIdx));
    if (idx === lastDrawnIdx.current) return;

    const img = framesRef.current[idx - scene.startIndex];
    if (!img?.complete || !img.naturalWidth) return;
    lastDrawnIdx.current = idx;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Use CSS dimensions for drawing (DPR scaling is applied via ctx.scale / setTransform)
    const { w: cw, h: ch } = cssSizeRef.current;
    if (!cw || !ch) return;

    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
  };

  // Load frames progressively
  useEffect(() => {
    if (!hasFrames) return;
    const count = scene.endIndex - scene.startIndex + 1;
    if (count <= 0) return;

    framesRef.current = new Array(count).fill(null);
    lastDrawnIdx.current = -1;

    const BATCH = Math.min(30, count);

    const loadOne = (relIdx: number): Promise<void> =>
      new Promise((res) => {
        const img = new Image();
        img.onload = () => {
          framesRef.current[relIdx] = img;
          const span = scene.endIndex - scene.startIndex;
          const targetRelIdx = span > 0
            ? Math.max(0, Math.min(span, Math.round(currentProgressRef.current * span)))
            : 0;
          if (relIdx === targetRelIdx) {
            drawFrame(currentProgressRef.current);
          }
          res();
        };
        img.onerror = () => res();
        img.src = getFrameUrl(scene.startIndex + relIdx);
      });

    let cancelled = false;
    const loadAll = async () => {
      await Promise.all(Array.from({ length: BATCH }, (_, i) => loadOne(i)));
      for (let i = BATCH; i < count && !cancelled; i++) {
        await loadOne(i);
      }
    };
    loadAll();

    return () => {
      cancelled = true;
    };
  }, [scene.id, hasFrames]); // eslint-disable-line

  // Canvas sizing with correct DPR scaling
  useEffect(() => {
    if (!canvasRef.current || !hasFrames) return;

    const canvas = canvasRef.current;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || window.innerWidth;
      const cssH = canvas.clientHeight || window.innerHeight;

      cssSizeRef.current = { w: cssW, h: cssH };

      // Set actual pixel buffer
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;

      // Scale context so drawing in CSS px coordinates
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      lastDrawnIdx.current = -1;
      drawFrame(currentProgressRef.current);
    };

    // Wait for layout
    requestAnimationFrame(resize);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [hasFrames]); // eslint-disable-line react-hooks/exhaustive-deps

  // GSAP ScrollTrigger
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: `+=${scrollSpan * 100}%`,
      pin: stickyRef.current,
      pinSpacing: true,
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        currentProgressRef.current = p;
        onProgress?.(p);

        if (hasFrames) drawFrame(p);

        // Content parallax — subtle upward drift
        if (contentRef.current) {
          gsap.set(contentRef.current, { y: p * -30 });
        }

        // Overlay: slight atmospheric depth variation
        if (overlayRef.current) {
          const edgeFade = Math.min(p * 5, (1 - p) * 5, 1);
          gsap.set(overlayRef.current, { opacity: 0.6 + edgeFade * 0.2 });
        }
      },
    });

    return () => trigger.kill();
  }, [scene.id, scrollSpan]); // eslint-disable-line

  return (
    <div
      ref={wrapperRef}
      className="cinematic-wrapper"
      style={{ '--scroll-span': `${scrollSpan * 100}vh` } as React.CSSProperties}
      data-scene-id={scene.id}
    >
      <div ref={stickyRef} className="cinematic-sticky">
        {/* Layer 1: Background Visual */}
        <div
          className="cinematic-bg"
          style={{ background: scene.fallbackGradient }}
        >
          {/* Poster — shown when no frames; hidden behind canvas when frames load */}
          <img
            src={scene.poster}
            alt=""
            aria-hidden="true"
            className={`cinematic-poster ${hasFrames ? 'cinematic-poster--with-canvas' : ''}`}
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Canvas — rendered on top of poster once frames start loading */}
          {hasFrames && (
            <canvas
              ref={canvasRef}
              className="cinematic-canvas"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Layer 2: Subtle architectural corner registration crosshairs */}
        <div className="cinematic-corner cinematic-corner--tl" aria-hidden="true">+</div>
        <div className="cinematic-corner cinematic-corner--tr" aria-hidden="true">+</div>
        <div className="cinematic-corner cinematic-corner--bl" aria-hidden="true">+</div>
        <div className="cinematic-corner cinematic-corner--br" aria-hidden="true">+</div>

        {/* Top HUD Bar (if metadata provided) */}
        {(chapterNumber || coordinates || statusBadge) && (
          <div className="cinematic-hud">
            {chapterNumber && (
              <span className="hud-chapter text-label">{chapterNumber}</span>
            )}
            {coordinates && (
              <span className="hud-coordinates">{coordinates}</span>
            )}
            {statusBadge && (
              <span className="hud-badge">
                <span className="hud-badge__dot" />
                {statusBadge}
              </span>
            )}
          </div>
        )}

        {/* Layer 3: Gradient overlay for text legibility */}
        <div ref={overlayRef} className="cinematic-overlay" />

        {/* Layer 4: HTML content — text stays crisp, selectable */}
        <div
          ref={contentRef}
          className={`cinematic-content cinematic-content--${alignment}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
