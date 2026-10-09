/**
 * ATELIER — Master Cinematic Frame-Sequence & Parallax Stage Engine
 * 
 * GUARANTEED VISIBILITY & ROBUST INITIALIZATION:
 * 1. Scene 1 is 100% visible on initial mount with zero delay.
 * 2. Canvas is sized synchronously on mount and Frame 0 is drawn immediately.
 * 3. Scenes 2-6 start with opacity: 0 and visibility: hidden so they never occlude Scene 1.
 * 4. As user scrolls, each scene cross-fades smoothly and scrubs its 240 WebP frames.
 * 5. Full-bleed, high-contrast, bright architectural imagery with subtle text contrast scrim.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '../lib/scroll';
import { cinematicScenes } from '../data/cinematicScenes';
import './CinematicStage.css';

interface CinematicStageProps {
  onChapterChange?: (chapterIndex: number) => void;
}

export const CinematicStage: React.FC<CinematicStageProps> = ({ onChapterChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeMaterial, setActiveMaterial] = useState<'travertine' | 'bronze' | 'oak'>('travertine');
  const [activeBeats, setActiveBeats] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const lastBeatsRef = useRef<number[]>([0, 0, 0, 0, 0, 0]);

  // Canvas Refs for the 6 real video frame sequences
  const s1CanvasRef = useRef<HTMLCanvasElement>(null);
  const s2CanvasRef = useRef<HTMLCanvasElement>(null);
  const s3CanvasRef = useRef<HTMLCanvasElement>(null);
  const s4CanvasRef = useRef<HTMLCanvasElement>(null);
  const s5CanvasRef = useRef<HTMLCanvasElement>(null);
  const s6CanvasRef = useRef<HTMLCanvasElement>(null);

  // Scene Container Refs
  const s1WrapRef = useRef<HTMLDivElement>(null);
  const s2WrapRef = useRef<HTMLDivElement>(null);
  const s3WrapRef = useRef<HTMLDivElement>(null);
  const s4WrapRef = useRef<HTMLDivElement>(null);
  const s5WrapRef = useRef<HTMLDivElement>(null);
  const s6WrapRef = useRef<HTMLDivElement>(null);

  // Typography Refs
  const s1TextRef = useRef<HTMLDivElement>(null);
  const s2TextRef = useRef<HTMLDivElement>(null);
  const s3TextRef = useRef<HTMLDivElement>(null);
  const s4TextRef = useRef<HTMLDivElement>(null);
  const s5TextRef = useRef<HTMLDivElement>(null);
  const s6TextRef = useRef<HTMLDivElement>(null);

  // Frame caches: [sceneIdx][frameIdx]
  const framesCacheRef = useRef<(HTMLImageElement | null)[][]>([
    new Array(240).fill(null),
    new Array(240).fill(null),
    new Array(240).fill(null),
    new Array(240).fill(null),
    new Array(240).fill(null),
    new Array(240).fill(null),
  ]);

  const lastDrawnFrameRef = useRef<number[]>([-1, -1, -1, -1, -1, -1]);



  // Helper to construct frame URLs
  const getFrameUrl = useCallback((sceneKey: keyof typeof cinematicScenes, index: number): string => {
    const scene = cinematicScenes[sceneKey];
    if (!scene.framePattern) return scene.poster;
    const padded = String(index).padStart(6, '0');
    return scene.framePattern.replace('{index}', padded);
  }, []);

  // Safe direct canvas drawing without clearing to black
  const drawFrameToCanvas = useCallback((
    canvas: HTMLCanvasElement | null,
    sceneIdx: number,
    frameIdx: number
  ) => {
    if (!canvas) return;
    const targetIdx = Math.max(0, Math.min(239, frameIdx));
    if (lastDrawnFrameRef.current[sceneIdx] === targetIdx) return;

    let img = framesCacheRef.current[sceneIdx][targetIdx];
    let actualIdx = targetIdx;

    if (!img || !img.complete || img.naturalWidth === 0) {
      // 1. Search backward for highest available loaded frame
      for (let i = targetIdx - 1; i >= 0; i--) {
        const candidate = framesCacheRef.current[sceneIdx][i];
        if (candidate && candidate.complete && candidate.naturalWidth > 0) {
          img = candidate;
          actualIdx = i;
          break;
        }
      }
      // 2. If no earlier frame, search forward
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let i = targetIdx + 1; i < 240; i++) {
          const candidate = framesCacheRef.current[sceneIdx][i];
          if (candidate && candidate.complete && candidate.naturalWidth > 0) {
            img = candidate;
            actualIdx = i;
            break;
          }
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    lastDrawnFrameRef.current[sceneIdx] = actualIdx;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    if (!cw || !ch) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const dx = (cw - sw) / 2;
    const dy = (ch - sh) / 2;

    ctx.drawImage(img, dx, dy, sw, sh);
  }, []);

  // Initialize Canvas dimensions and load Frame 0 immediately on mount
  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    const canvases = [
      s1CanvasRef.current,
      s2CanvasRef.current,
      s3CanvasRef.current,
      s4CanvasRef.current,
      s5CanvasRef.current,
      s6CanvasRef.current,
    ];

    canvases.forEach((canvas, idx) => {
      if (!canvas) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      lastDrawnFrameRef.current[idx] = -1;
    });

    // Preload & render Frame 0 of Hero immediately
    const heroImg = new Image();
    heroImg.onload = () => {
      framesCacheRef.current[0][0] = heroImg;
      drawFrameToCanvas(s1CanvasRef.current, 0, 0);
    };
    heroImg.src = getFrameUrl('heroArchitecture', 0);

    const handleResize = () => {
      const curDpr = Math.min(window.devicePixelRatio || 1, 2);
      const curW = window.innerWidth;
      const curH = window.innerHeight;
      canvases.forEach((canvas, idx) => {
        if (!canvas) return;
        canvas.width = curW * curDpr;
        canvas.height = curH * curDpr;
        lastDrawnFrameRef.current[idx] = -1;
      });
      // Re-draw current frames
      drawFrameToCanvas(s1CanvasRef.current, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getFrameUrl, drawFrameToCanvas]);

  // Track current requested target frame per scene for auto-redraw on frame load
  const currentTargetFrameRef = useRef<number[]>([0, 0, 0, 0, 0, 0]);

  // Progressive Preloader for remaining frames
  useEffect(() => {
    const sceneKeys: (keyof typeof cinematicScenes)[] = [
      'heroArchitecture',
      'philosophyLight',
      'featuredResidence',
      'interiorJourney',
      'materialDetails',
      'closingArchitecture',
    ];

    let isCancelled = false;

    const canvases = [
      s1CanvasRef.current,
      s2CanvasRef.current,
      s3CanvasRef.current,
      s4CanvasRef.current,
      s5CanvasRef.current,
      s6CanvasRef.current,
    ];

    const loadSingleFrame = (sIdx: number, fIdx: number): Promise<void> =>
      new Promise((resolve) => {
        if (framesCacheRef.current[sIdx][fIdx]) {
          resolve();
          return;
        }
        const img = new Image();
        img.onload = () => {
          if (!isCancelled) {
            framesCacheRef.current[sIdx][fIdx] = img;
            // If this frame is the one currently requested, immediately redraw
            if (Math.abs(currentTargetFrameRef.current[sIdx] - fIdx) <= 2) {
              drawFrameToCanvas(canvases[sIdx], sIdx, currentTargetFrameRef.current[sIdx]);
            }
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = getFrameUrl(sceneKeys[sIdx], fIdx);
      });

    const preloadAll = async () => {
      // 1. Instantly load Frame 0 of all 6 scenes for immediate poster/canvas parity
      await Promise.all(sceneKeys.map((_, sIdx) => loadSingleFrame(sIdx, 0)));

      if (!isCancelled) {
        canvases.forEach((c, idx) => drawFrameToCanvas(c, idx, 0));
      }

      // 2. High-priority buffer: Hero Scene 1 (frames 1 to 239) in fast parallel chunks
      for (let f = 1; f < 240 && !isCancelled; f += 6) {
        const chunk: Promise<void>[] = [];
        for (let k = 0; k < 6 && f + k < 240; k++) {
          chunk.push(loadSingleFrame(0, f + k));
        }
        await Promise.all(chunk);

        // Also stream Scene 2 concurrently in small batches
        if (f < 120) {
          await Promise.all([
            loadSingleFrame(1, f),
            loadSingleFrame(1, f + 1),
          ]);
        }
      }

      // 3. Progressive queue for remaining scenes (2, 3, 4, 5, 6)
      for (let sIdx = 1; sIdx < 6 && !isCancelled; sIdx++) {
        for (let f = 1; f < 240 && !isCancelled; f += 8) {
          const chunk: Promise<void>[] = [];
          for (let k = 0; k < 8 && f + k < 240; k++) {
            chunk.push(loadSingleFrame(sIdx, f + k));
          }
          await Promise.all(chunk);
        }
      }
    };

    preloadAll();

    return () => {
      isCancelled = true;
    };
  }, [getFrameUrl, drawFrameToCanvas]);



  // Master GSAP ScrollTrigger scrub
  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const updateScene = (p: number) => {
      setScrollProgress(p);

      // Chapter Calculation
      let currentChap = 0;
      if (p < 0.16) currentChap = 0;
      else if (p < 0.33) currentChap = 1;
      else if (p < 0.50) currentChap = 2;
      else if (p < 0.67) currentChap = 3;
      else if (p < 0.84) currentChap = 4;
      else currentChap = 5;

      onChapterChange?.(currentChap);

      /* ================================================================
         1. ZERO-BLACK-SCREEN CROSS-DISSOLVE STACKING ARCHITECTURE
         ================================================================ */
      const s1Opacity = p < 0.20 ? 1 : 0;
      const s2Opacity = p < 0.15 ? 0 : p < 0.20 ? (p - 0.15) / 0.05 : p < 0.38 ? 1 : 0;
      const s3Opacity = p < 0.33 ? 0 : p < 0.38 ? (p - 0.33) / 0.05 : p < 0.54 ? 1 : 0;
      const s4Opacity = p < 0.49 ? 0 : p < 0.54 ? (p - 0.49) / 0.05 : p < 0.70 ? 1 : 0;
      const s5Opacity = p < 0.65 ? 0 : p < 0.70 ? (p - 0.65) / 0.05 : p < 0.86 ? 1 : 0;
      const s6Opacity = p < 0.81 ? 0 : p < 0.86 ? (p - 0.81) / 0.05 : 1;

      if (s1WrapRef.current) gsap.set(s1WrapRef.current, { opacity: s1Opacity, zIndex: 10, visibility: s1Opacity > 0 ? 'visible' : 'hidden' });
      if (s2WrapRef.current) gsap.set(s2WrapRef.current, { opacity: s2Opacity, zIndex: 20, visibility: s2Opacity > 0 ? 'visible' : 'hidden' });
      if (s3WrapRef.current) gsap.set(s3WrapRef.current, { opacity: s3Opacity, zIndex: 30, visibility: s3Opacity > 0 ? 'visible' : 'hidden' });
      if (s4WrapRef.current) gsap.set(s4WrapRef.current, { opacity: s4Opacity, zIndex: 40, visibility: s4Opacity > 0 ? 'visible' : 'hidden' });
      if (s5WrapRef.current) gsap.set(s5WrapRef.current, { opacity: s5Opacity, zIndex: 50, visibility: s5Opacity > 0 ? 'visible' : 'hidden' });
      if (s6WrapRef.current) gsap.set(s6WrapRef.current, { opacity: s6Opacity, zIndex: 60, visibility: s6Opacity > 0 ? 'visible' : 'hidden' });

      /* ================================================================
         2. CONTINUOUS VIDEO FRAME PROGRESS MAPPING (240 Frames)
         ================================================================ */
      const p1 = Math.min(1, Math.max(0, p / 0.18));
      const f1 = Math.round(p1 * 239);
      currentTargetFrameRef.current[0] = f1;
      drawFrameToCanvas(s1CanvasRef.current, 0, f1);

      const p2 = Math.min(1, Math.max(0, (p - 0.16) / 0.18));
      const f2 = Math.round(p2 * 239);
      currentTargetFrameRef.current[1] = f2;
      drawFrameToCanvas(s2CanvasRef.current, 1, f2);

      const p3 = Math.min(1, Math.max(0, (p - 0.34) / 0.16));
      const f3 = Math.round(p3 * 239);
      currentTargetFrameRef.current[2] = f3;
      drawFrameToCanvas(s3CanvasRef.current, 2, f3);

      const p4 = Math.min(1, Math.max(0, (p - 0.50) / 0.16));
      const f4 = Math.round(p4 * 239);
      currentTargetFrameRef.current[3] = f4;
      drawFrameToCanvas(s4CanvasRef.current, 3, f4);

      const p5 = Math.min(1, Math.max(0, (p - 0.66) / 0.16));
      const f5 = Math.round(p5 * 239);
      currentTargetFrameRef.current[4] = f5;
      drawFrameToCanvas(s5CanvasRef.current, 4, f5);

      if (f5 < 85) setActiveMaterial('travertine');
      else if (f5 < 165) setActiveMaterial('bronze');
      else setActiveMaterial('oak');

      const p6 = Math.min(1, Math.max(0, (p - 0.82) / 0.18));
      const f6 = Math.round(p6 * 239);
      currentTargetFrameRef.current[5] = f6;
      drawFrameToCanvas(s6CanvasRef.current, 5, f6);

      // Update sequential beats for each scene
      const b1 = p1 < 0.35 ? 0 : p1 < 0.70 ? 1 : 2;
      const b2 = p2 < 0.35 ? 0 : p2 < 0.70 ? 1 : 2;
      const b3 = p3 < 0.35 ? 0 : p3 < 0.70 ? 1 : 2;
      const b4 = p4 < 0.35 ? 0 : p4 < 0.70 ? 1 : 2;
      const b5 = p5 < 0.35 ? 0 : p5 < 0.70 ? 1 : 2;
      const b6 = p6 < 0.35 ? 0 : p6 < 0.70 ? 1 : 2;

      if (
        b1 !== lastBeatsRef.current[0] ||
        b2 !== lastBeatsRef.current[1] ||
        b3 !== lastBeatsRef.current[2] ||
        b4 !== lastBeatsRef.current[3] ||
        b5 !== lastBeatsRef.current[4] ||
        b6 !== lastBeatsRef.current[5]
      ) {
        lastBeatsRef.current = [b1, b2, b3, b4, b5, b6];
        setActiveBeats([b1, b2, b3, b4, b5, b6]);
      }

      /* ================================================================
         3. INDEPENDENT EDITORIAL TYPOGRAPHY TIMELINES
         ================================================================ */
      if (s1TextRef.current) {
        const t1Opacity = Math.max(0, Math.min(1, 1 - (p - 0.10) / 0.06));
        gsap.set(s1TextRef.current, { opacity: t1Opacity, yPercent: -p1 * 6 });
      }

      if (s2TextRef.current) {
        const t2In = Math.min(1, Math.max(0, (p - 0.17) / 0.05));
        const t2Out = Math.max(0, Math.min(1, (p - 0.29) / 0.05));
        gsap.set(s2TextRef.current, { opacity: t2In * (1 - t2Out), yPercent: 4 - p2 * 6 });
      }

      if (s3TextRef.current) {
        const t3In = Math.min(1, Math.max(0, (p - 0.35) / 0.05));
        const t3Out = Math.max(0, Math.min(1, (p - 0.46) / 0.05));
        gsap.set(s3TextRef.current, { opacity: t3In * (1 - t3Out), yPercent: 4 - p3 * 6 });
      }

      if (s4TextRef.current) {
        const t4In = Math.min(1, Math.max(0, (p - 0.51) / 0.05));
        const t4Out = Math.max(0, Math.min(1, (p - 0.62) / 0.05));
        gsap.set(s4TextRef.current, { opacity: t4In * (1 - t4Out), yPercent: 4 - p4 * 6 });
      }

      if (s5TextRef.current) {
        const t5In = Math.min(1, Math.max(0, (p - 0.67) / 0.05));
        const t5Out = Math.max(0, Math.min(1, (p - 0.78) / 0.05));
        gsap.set(s5TextRef.current, { opacity: t5In * (1 - t5Out), yPercent: 4 - p5 * 6 });
      }

      if (s6TextRef.current) {
        const t6In = Math.min(1, Math.max(0, (p - 0.83) / 0.05));
        gsap.set(s6TextRef.current, { opacity: t6In, yPercent: 4 - p6 * 6 });
      }
    };

    // Run initial update immediately on mount
    updateScene(0);

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      pin: stage,
      pinSpacing: false,
      scrub: 0.5,
      onUpdate: (self) => {
        updateScene(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [onChapterChange, drawFrameToCanvas]);

  return (
    <div ref={containerRef} className="cinematic-container" id="cinematic-experience">
      {/* ── PERSISTENT 100SVH CINEMATIC STAGE ───────────────────────── */}
      <div ref={stageRef} className="cinematic-stage" aria-label="Cinematic Architecture Experience">
        


        {/* ── SCENE 01: HERO — GOLDEN-HOUR VILLA ─────────────────────── */}
        <div
          ref={s1WrapRef}
          className="scene-stack scene-stack--s1"
          data-scene="hero-architecture"
          style={{ opacity: 1, zIndex: 10, visibility: 'visible' }}
        >
          <div className="scene-media-layer">
            <img
              src={cinematicScenes.heroArchitecture.poster}
              alt="Golden-hour limestone villa with reflecting pool"
              className="scene-poster"
              loading="eager"
            />
            <canvas ref={s1CanvasRef} className="scene-canvas" aria-hidden="true" />
          </div>

          <div className="scene-bottom-scrim" />

          <div ref={s1TextRef} className="scene-text-layer scene-text-layer--hero">
            <div className="hero-editorial">
              <span className="editorial-eyebrow text-gold">01 / LIGHT &amp; PROPORTION</span>
              <h1 className="hero-editorial__title text-hero">
                Architecture,<br />
                <em>Felt.</em>
              </h1>
              <p className="hero-editorial__sub text-lead">
                Spaces shaped by light, proportion, and the quiet beauty of their surroundings.
              </p>

              {/* Sequential Editorial Beats */}
              <div className="scene-editorial-beats" aria-label="Scene insights">
                <div className={`editorial-beat-card ${activeBeats[0] === 0 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">01</span>
                  <span className="beat-text">A study in proportion.</span>
                </div>
                <div className={`editorial-beat-card ${activeBeats[0] === 1 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">02</span>
                  <span className="beat-text">Light transforms the everyday.</span>
                </div>
                <div className={`editorial-beat-card ${activeBeats[0] === 2 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">03</span>
                  <span className="beat-text">Designed for moments that matter.</span>
                </div>
              </div>

              <div className="hero-editorial__ctas">
                <Link to="/works" className="btn btn--primary">
                  <span>Explore Selected Works</span>
                  <span className="btn__arrow" aria-hidden="true">→</span>
                </Link>
                <Link to="/studio" className="btn btn--ghost">
                  <span>Studio Manifesto</span>
                </Link>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="scroll-cue" aria-hidden="true">
              <span className="scroll-cue__label">SCROLL TO EXPLORE</span>
              <div className="scroll-cue__line">
                <div className="scroll-cue__indicator" />
              </div>
            </div>
          </div>
        </div>

        {/* ── SCENE 02: PHILOSOPHY — LIGHT AND SPACE ─────────────────── */}
        <div
          ref={s2WrapRef}
          className="scene-stack scene-stack--s2"
          data-scene="philosophy-light"
          style={{ opacity: 0, zIndex: 20, visibility: 'hidden' }}
        >
          <div className="scene-media-layer">
            <img
              src={cinematicScenes.philosophyLight.poster}
              alt="Travertine colonnade and courtyard with light and shadows"
              className="scene-poster"
              loading="eager"
            />
            <canvas ref={s2CanvasRef} className="scene-canvas" aria-hidden="true" />
          </div>

          <div className="scene-bottom-scrim" />

          <div ref={s2TextRef} className="scene-text-layer scene-text-layer--philosophy">
            <div className="philosophy-editorial">
              <span className="editorial-eyebrow text-gold">02 / LIGHT &amp; SPACE</span>
              <h2 className="philosophy-title text-h1">
                Light Defines<br /><em>Space.</em>
              </h2>
              <p className="philosophy-sub text-lead">
                Sunlight, shadow, and material work together to reveal the character of a place.
              </p>

              {/* Sequential Editorial Beats */}
              <div className="scene-editorial-beats" aria-label="Philosophy beats">
                <div className={`editorial-beat-card ${activeBeats[1] === 0 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">01</span>
                  <span className="beat-text">A dialogue between light and form.</span>
                </div>
                <div className={`editorial-beat-card ${activeBeats[1] === 1 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">02</span>
                  <span className="beat-text">Shadows give architecture rhythm.</span>
                </div>
                <div className={`editorial-beat-card ${activeBeats[1] === 2 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">03</span>
                  <span className="beat-text">Simplicity creates depth.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCENE 03: FEATURED RESIDENCE — COASTAL LIMESTONE ───────── */}
        <div
          ref={s3WrapRef}
          className="scene-stack scene-stack--s3"
          data-scene="featured-residence"
          style={{ opacity: 0, zIndex: 30, visibility: 'hidden' }}
        >
          <div className="scene-media-layer">
            <img
              src={cinematicScenes.featuredResidence.poster}
              alt="Coastal limestone residence"
              className="scene-poster"
              loading="eager"
            />
            <canvas ref={s3CanvasRef} className="scene-canvas" aria-hidden="true" />
          </div>

          <div className="scene-bottom-scrim" />

          <div ref={s3TextRef} className="scene-text-layer scene-text-layer--residence">
            <div className="residence-editorial">
              <span className="editorial-eyebrow text-gold">03 / COASTAL ARCHITECTURE</span>

              <h2 className="residence-editorial__title text-h1">
                A Quiet Dialogue<br />
                <em>with Nature.</em>
              </h2>

              <p className="residence-editorial__desc text-lead">
                An architecture that responds to its landscape rather than competing with it.
              </p>

              {/* Sequential Editorial Beats */}
              <div className="scene-editorial-beats" aria-label="Residence beats">
                <div className={`editorial-beat-card ${activeBeats[2] === 0 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">01</span>
                  <span className="beat-text">Rooted in its surroundings.</span>
                </div>
                <div className={`editorial-beat-card ${activeBeats[2] === 1 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">02</span>
                  <span className="beat-text">Framed by the horizon.</span>
                </div>
                <div className={`editorial-beat-card ${activeBeats[2] === 2 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">03</span>
                  <span className="beat-text">Open to the natural world.</span>
                </div>
              </div>

              <div className="residence-editorial__cta">
                <Link to="/works" className="btn btn--primary">
                  <span>View Project Monograph</span>
                  <span className="btn__arrow" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCENE 04: INTERIOR JOURNEY — SPACE TO BREATHE ──────────── */}
        <div
          ref={s4WrapRef}
          className="scene-stack scene-stack--s4"
          data-scene="interior-journey"
          style={{ opacity: 0, zIndex: 40, visibility: 'hidden' }}
        >
          <div className="scene-media-layer">
            <img
              src={cinematicScenes.interiorJourney.poster}
              alt="Minimalist interior with oak, concrete, and staircase"
              className="scene-poster"
              loading="eager"
            />
            <canvas ref={s4CanvasRef} className="scene-canvas" aria-hidden="true" />
          </div>

          <div className="scene-bottom-scrim" />

          <div ref={s4TextRef} className="scene-text-layer scene-text-layer--interior">
            <div className="interior-editorial">
              <span className="editorial-eyebrow text-gold">04 / INTERIOR VOLUMES</span>
              <h2 className="interior-editorial__title text-hero">
                Space to<br /><em>Breathe.</em>
              </h2>
              <p className="interior-editorial__lead text-lead">
                Calm interiors shaped by thoughtful transitions, natural light, and generous space.
              </p>

              {/* Sequential Editorial Beats */}
              <div className="scene-editorial-beats" aria-label="Interior beats">
                <div className={`editorial-beat-card ${activeBeats[3] === 0 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">01</span>
                  <span className="beat-text">Movement through space.</span>
                </div>
                <div className={`editorial-beat-card ${activeBeats[3] === 1 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">02</span>
                  <span className="beat-text">A balance of openness and intimacy.</span>
                </div>
                <div className={`editorial-beat-card ${activeBeats[3] === 2 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">03</span>
                  <span className="beat-text">Every detail has a purpose.</span>
                </div>
              </div>

              <div className="interior-editorial__cta">
                <Link to="/works" className="btn btn--outline">
                  <span>Explore Interior Architecture</span>
                  <span className="btn__arrow" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCENE 05: MATERIAL DETAILS & CRAFT ─────────────────────── */}
        <div
          ref={s5WrapRef}
          className="scene-stack scene-stack--s5"
          data-scene="material-details"
          style={{ opacity: 0, zIndex: 50, visibility: 'hidden' }}
        >
          <div className="scene-media-layer">
            <img
              src={cinematicScenes.materialDetails.poster}
              alt="Macro details of travertine, bronze, and oak"
              className="scene-poster"
              loading="eager"
            />
            <canvas ref={s5CanvasRef} className="scene-canvas" aria-hidden="true" />
          </div>

          <div className="scene-bottom-scrim" />

          <div ref={s5TextRef} className="scene-text-layer scene-text-layer--materials">
            <div className="materials-editorial-wrap">
              <div className="materials-editorial-header">
                <span className="editorial-eyebrow text-gold">05 / MATERIAL RESEARCH</span>
                <h2 className="text-h2">
                  Honest Materials.<br /><em>Timeless Detail.</em>
                </h2>
                <p className="text-lead">
                  Natural textures and considered finishes create depth that reveals itself over time.
                </p>
              </div>

              {/* Dynamic Material Beats synchronized one-by-one with footage */}
              <div className="scene-editorial-beats scene-editorial-beats--materials">
                <div className={`editorial-beat-card ${activeMaterial === 'travertine' ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">01</span>
                  <span className="beat-text">Travertine — quiet permanence.</span>
                </div>
                <div className={`editorial-beat-card ${activeMaterial === 'bronze' ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">02</span>
                  <span className="beat-text">Bronze — subtle warmth.</span>
                </div>
                <div className={`editorial-beat-card ${activeMaterial === 'oak' ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">03</span>
                  <span className="beat-text">Oak — natural character.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCENE 06: CLOSING PAVILION — DESIGNED TO BELONG ────────── */}
        <div
          ref={s6WrapRef}
          className="scene-stack scene-stack--s6"
          data-scene="closing-architecture"
          style={{ opacity: 0, zIndex: 60, visibility: 'hidden' }}
        >
          <div className="scene-media-layer">
            <img
              src={cinematicScenes.closingArchitecture.poster}
              alt="Illuminated pavilion at blue hour with reflecting pool"
              className="scene-poster"
              loading="eager"
            />
            <canvas ref={s6CanvasRef} className="scene-canvas" aria-hidden="true" />
          </div>

          <div className="scene-bottom-scrim" />

          <div ref={s6TextRef} className="scene-text-layer scene-text-layer--closing">
            <div className="closing-editorial">
              <span className="editorial-eyebrow text-gold">06 / ATMOSPHERE &amp; PLACE</span>

              <h2 className="closing-editorial__title text-hero">
                Designed to<br />
                <em>Belong.</em>
              </h2>

              <p className="closing-editorial__lead text-lead">
                Architecture becomes meaningful when the building, its people, and its environment feel connected.
              </p>

              {/* Sequential Editorial Beats */}
              <div className="scene-editorial-beats scene-editorial-beats--center" aria-label="Closing beats">
                <div className={`editorial-beat-card ${activeBeats[5] === 0 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">01</span>
                  <span className="beat-text">Form meets atmosphere.</span>
                </div>
                <div className={`editorial-beat-card ${activeBeats[5] === 1 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">02</span>
                  <span className="beat-text">A lasting sense of place.</span>
                </div>
                <div className={`editorial-beat-card ${activeBeats[5] === 2 ? 'editorial-beat-card--active' : ''}`}>
                  <span className="beat-num text-mono">03</span>
                  <span className="beat-text">Thoughtfully designed. Naturally experienced.</span>
                </div>
              </div>

              <div className="closing-editorial__actions">
                <Link to="/contact" className="btn btn--primary btn--large">
                  <span>Start a Conversation</span>
                  <span className="btn__arrow" aria-hidden="true">→</span>
                </Link>
                <Link to="/works" className="btn btn--ghost btn--large">
                  <span>Explore Selected Works</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SCROLL PROGRESS TRACKER BAR (BOTTOM) */}
        <div className="stage-tracker" aria-hidden="true">
          <div
            className="stage-tracker__fill"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

      </div>
    </div>
  );
};
