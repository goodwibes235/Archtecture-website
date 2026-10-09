/**
 * ATELIER — Cinematic Scene Component
 * 
 * Individual scroll-driven architectural scene:
 * - Real 24fps WebP frame sequence canvas scrub (240 frames)
 * - Synchronous Frame 0 draw & poster fallback (zero black flashes)
 * - Independent HTML typography layer with subtle parallax
 * - GSAP ScrollTrigger pinning with accurate pinSpacing
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll';
import type { CinematicScene } from '../data/cinematicScenes';
import './CinematicScene.css';

interface CinematicSceneProps {
  scene: CinematicScene;
  /** Scroll span in viewport heights, e.g. 1.6 = 160vh */
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
  scrollSpan = 1.6,
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
  const contentRef = useRef<HTMLDivElement>(null);

  const hasFrames = scene.frameCount > 0 && scene.framePattern !== null;
  const framesCacheRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastDrawnIdx = useRef(-1);

  // Format 6-digit zero-padded frame URL
  const getFrameUrl = useCallback(
    (idx: number): string => {
      if (!scene.framePattern) return scene.poster;
      const padded = String(idx).padStart(6, '0');
      return scene.framePattern.replace('{index}', padded);
    },
    [scene.framePattern, scene.poster]
  );

  // Direct canvas drawing without blank clearing
  const drawFrame = useCallback(
    (progress: number) => {
      if (!hasFrames || !canvasRef.current) return;
      const span = scene.endIndex - scene.startIndex;
      if (span <= 0) return;

      const targetIdx = scene.startIndex + Math.round(progress * span);
      const clampedIdx = Math.max(scene.startIndex, Math.min(scene.endIndex, targetIdx));
      if (clampedIdx === lastDrawnIdx.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cw = canvas.width;
      const ch = canvas.height;
      if (!cw || !ch) return;

      // Check target frame or search nearest loaded frame
      let img = framesCacheRef.current[clampedIdx];
      let actualIdx = clampedIdx;

      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let offset = 1; offset <= 25; offset++) {
          const prev = clampedIdx - offset;
          const next = clampedIdx + offset;
          if (prev >= scene.startIndex && framesCacheRef.current[prev]?.complete) {
            img = framesCacheRef.current[prev];
            actualIdx = prev;
            break;
          }
          if (next <= scene.endIndex && framesCacheRef.current[next]?.complete) {
            img = framesCacheRef.current[next];
            actualIdx = next;
            break;
          }
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

      lastDrawnIdx.current = actualIdx;

      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const dx = (cw - sw) / 2;
      const dy = (ch - sh) / 2;

      ctx.drawImage(img, dx, dy, sw, sh);
    },
    [hasFrames, scene.endIndex, scene.startIndex]
  );

  // Canvas sizing and initial Frame 0 render on mount
  useEffect(() => {
    if (!canvasRef.current || !hasFrames) return;
    const canvas = canvasRef.current;

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      lastDrawnIdx.current = -1;
      drawFrame(0);
    };

    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    return () => window.removeEventListener('resize', sizeCanvas);
  }, [hasFrames, drawFrame]);

  // Progressive Frame Preloader
  useEffect(() => {
    if (!hasFrames) return;
    const count = scene.endIndex - scene.startIndex + 1;
    if (count <= 0) return;

    framesCacheRef.current = new Array(count).fill(null);
    lastDrawnIdx.current = -1;

    let isCancelled = false;

    const loadSingleFrame = (idx: number): Promise<void> =>
      new Promise((resolve) => {
        if (framesCacheRef.current[idx]) {
          resolve();
          return;
        }
        const img = new Image();
        img.onload = () => {
          if (!isCancelled) {
            framesCacheRef.current[idx] = img;
            if (idx === 0) {
              drawFrame(0);
            }
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = getFrameUrl(scene.startIndex + idx);
      });

    const preloadSequence = async () => {
      // 1. Frame 0 priority
      await loadSingleFrame(0);

      // 2. Initial batch (first 30 frames)
      const initialBatch: Promise<void>[] = [];
      for (let i = 1; i < Math.min(30, count); i++) {
        initialBatch.push(loadSingleFrame(i));
      }
      await Promise.all(initialBatch);

      // 3. Background queue for remaining frames
      for (let i = 30; i < count && !isCancelled; i += 4) {
        await Promise.all([
          loadSingleFrame(i),
          i + 1 < count ? loadSingleFrame(i + 1) : Promise.resolve(),
          i + 2 < count ? loadSingleFrame(i + 2) : Promise.resolve(),
          i + 3 < count ? loadSingleFrame(i + 3) : Promise.resolve(),
        ]);
      }
    };

    preloadSequence();

    return () => {
      isCancelled = true;
    };
  }, [scene.id, hasFrames, scene.endIndex, scene.startIndex, getFrameUrl, drawFrame]);

  // GSAP ScrollTrigger
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky = stickyRef.current;
    if (!wrapper || !sticky) return;

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: `+=${scrollSpan * 100}%`,
      pin: sticky,
      pinSpacing: true,
      scrub: 0.4,
      onUpdate: (self) => {
        const p = self.progress;
        onProgress?.(p);

        if (hasFrames) {
          drawFrame(p);
        }

        // Independent subtle typography entrance/exit parallax
        if (contentRef.current) {
          const textOpacity = p < 0.8 ? 1 : Math.max(0, 1 - (p - 0.8) / 0.18);
          gsap.set(contentRef.current, {
            opacity: textOpacity,
            yPercent: -p * 8,
          });
        }
      },
    });

    return () => trigger.kill();
  }, [scene.id, scrollSpan, hasFrames, drawFrame, onProgress]);

  return (
    <div
      ref={wrapperRef}
      className="cinematic-wrapper"
      style={{ '--scroll-span': `${scrollSpan * 100}vh` } as React.CSSProperties}
      data-scene-id={scene.id}
    >
      <div ref={stickyRef} className="cinematic-sticky">
        {/* Layer 1: Visual Media (Poster + Video Canvas) */}
        <div className="cinematic-media-layer">
          <img
            src={scene.poster}
            alt=""
            aria-hidden="true"
            className="cinematic-poster"
            loading="eager"
          />
          {hasFrames && (
            <canvas
              ref={canvasRef}
              className="cinematic-canvas"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Layer 2: Subtle bottom text scrim for high contrast legibility */}
        <div className="cinematic-scrim" />

        {/* Layer 3: Corner Registration Crosshairs */}
        <div className="cinematic-corner cinematic-corner--tl" aria-hidden="true">+</div>
        <div className="cinematic-corner cinematic-corner--tr" aria-hidden="true">+</div>
        <div className="cinematic-corner cinematic-corner--bl" aria-hidden="true">+</div>
        <div className="cinematic-corner cinematic-corner--br" aria-hidden="true">+</div>

        {/* Layer 4: Top HUD Bar */}
        {(chapterNumber || coordinates || statusBadge) && (
          <header className="cinematic-hud" aria-live="polite">
            <div className="cinematic-hud__left">
              {chapterNumber && <span className="hud-chapter text-label">{chapterNumber}</span>}
              {coordinates && <span className="hud-coordinates text-mono">{coordinates}</span>}
            </div>
            {statusBadge && (
              <span className="hud-badge">
                <span className="hud-badge__dot" />
                {statusBadge}
              </span>
            )}
          </header>
        )}

        {/* Layer 5: HTML Content Overlay */}
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
