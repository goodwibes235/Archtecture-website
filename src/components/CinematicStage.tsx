/**
 * ATELIER — Master Cinematic Frame-Sequence & Parallax Stage Engine
 * 
 * CRITICAL VISUAL ARCHITECTURE & ZERO-BLACK-SCREEN GUARANTEE:
 * 1. Unobstructed, vibrant, high-contrast imagery: Real 24fps WebP Frame Sequences
 *    - Hero: Golden-hour limestone villa with reflection pool (240 frames)
 *    - Philosophy: Travertine colonnade with architectural light & shadow (240 frames)
 *    - Featured Residence: Coastal limestone residence overlooking sea (240 frames)
 *    - Interior: Minimalist oak, concrete & cantilevered staircase (240 frames)
 *    - Materials: Macro travertine, brushed bronze & natural oak (240 frames)
 *    - Closing: Blue-hour illuminated glass & stone pavilion (240 frames)
 * 
 * 2. Mathematical Zero-Black-Screen Cross-Dissolve:
 *    - Each incoming scene ramps from opacity 0 -> 1 directly on top of the previous scene.
 *    - The outgoing scene remains at 100% opacity until the incoming scene is fully 100% opaque.
 *    - At EVERY point in scroll, the viewport is covered by 100% opaque, bright architectural imagery.
 * 
 * 3. Non-Destructive Canvas Rendering:
 *    - Canvas directly overwrites buffer without blank clear intervals.
 *    - Nearest-neighbor fallback retains last rendered frame if buffering.
 *    - Posters are always loaded eagerly underneath canvas as permanent fallback.
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
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeMaterial, setActiveMaterial] = useState<'travertine' | 'bronze' | 'oak'>('travertine');

  // Canvas Refs
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

  // Stored Image frames: [sceneIdx][frameIdx]
  const framesCacheRef = useRef<(HTMLImageElement | null)[][]>([
    new Array(240).fill(null),
    new Array(240).fill(null),
    new Array(240).fill(null),
    new Array(240).fill(null),
    new Array(240).fill(null),
    new Array(240).fill(null),
  ]);

  const lastDrawnFrameRef = useRef<number[]>([-1, -1, -1, -1, -1, -1]);
  const canvasSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  // Telemetry metadata
  const chapters = [
    { num: '01', title: 'The Monolith', code: 'LAT 43.7102° N · LON 7.2620° E', tag: 'HERO ARCHITECTURE' },
    { num: '02', title: 'Light & Space', code: 'RAKING SOLAR AXIS · MIDDAY', tag: 'PHILOSOPHY' },
    { num: '03', title: 'Featured Residence', code: 'COASTAL LIMESTONE · 2024', tag: 'PRIVATE COMMISSION' },
    { num: '04', title: 'Interior Spaces', code: 'DOUBLE-HEIGHT VOLUMETRICS', tag: 'INTERIOR JOURNEY' },
    { num: '05', title: 'Material Study', code: 'TRAVERTINE · BRONZE · OAK', tag: 'CRAFT & DETAIL' },
    { num: '06', title: 'Closing Pavilion', code: 'BLUE HOUR RETREAT · MMXXVI', tag: 'COMMISSION ARCHIVE' },
  ];

  // Construct frame URLs
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
      // Find nearest loaded frame within +/- 20 frame range
      for (let offset = 1; offset <= 20; offset++) {
        const prev = targetIdx - offset;
        const next = targetIdx + offset;
        if (prev >= 0 && framesCacheRef.current[sceneIdx][prev]?.complete) {
          img = framesCacheRef.current[sceneIdx][prev];
          actualIdx = prev;
          break;
        }
        if (next < 240 && framesCacheRef.current[sceneIdx][next]?.complete) {
          img = framesCacheRef.current[sceneIdx][next];
          actualIdx = next;
          break;
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

    // Overwrite canvas buffer directly
    ctx.drawImage(img, dx, dy, sw, sh);
  }, []);

  // Initialize Canvas dimensions immediately on mount
  useEffect(() => {
    const initCanvases = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvasSizeRef.current = { w, h };

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
    };

    initCanvases();
    window.addEventListener('resize', initCanvases);
    return () => window.removeEventListener('resize', initCanvases);
  }, []);

  // Progressive Frame Preloader
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

    const preloadAll = async () => {
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
            }
            resolve();
          };
          img.onerror = () => resolve();
          img.src = getFrameUrl(sceneKeys[sIdx], fIdx);
        });

      // 1. First priority: load Frame 0 of all scenes immediately for instant first-viewport readiness
      await Promise.all(sceneKeys.map((_, sIdx) => loadSingleFrame(sIdx, 0)));

      // Draw initial frame 0 on all canvases
      drawFrameToCanvas(s1CanvasRef.current, 0, 0);
      drawFrameToCanvas(s2CanvasRef.current, 1, 0);
      drawFrameToCanvas(s3CanvasRef.current, 2, 0);
      drawFrameToCanvas(s4CanvasRef.current, 3, 0);
      drawFrameToCanvas(s5CanvasRef.current, 4, 0);
      drawFrameToCanvas(s6CanvasRef.current, 5, 0);

      // 2. Second priority: buffer first 30 frames of Scene 1 and Scene 2
      const initialBatch: Promise<void>[] = [];
      for (let i = 1; i < 30; i++) {
        initialBatch.push(loadSingleFrame(0, i));
        initialBatch.push(loadSingleFrame(1, i));
      }
      await Promise.all(initialBatch);

      // 3. Background priority: progressive queue for remaining frames
      for (let f = 1; f < 240 && !isCancelled; f += 4) {
        for (let s = 0; s < 6 && !isCancelled; s++) {
          await Promise.all([
            loadSingleFrame(s, f),
            f + 1 < 240 ? loadSingleFrame(s, f + 1) : Promise.resolve(),
            f + 2 < 240 ? loadSingleFrame(s, f + 2) : Promise.resolve(),
            f + 3 < 240 ? loadSingleFrame(s, f + 3) : Promise.resolve(),
          ]);
        }
      }
    };

    preloadAll();

    return () => {
      isCancelled = true;
    };
  }, [getFrameUrl, drawFrameToCanvas]);

  // Jump to chapter
  const scrollToChapter = useCallback((index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollHeight = container.offsetHeight - window.innerHeight;
    const chapterProgress = index / (chapters.length - 1);
    const targetScroll = container.offsetTop + chapterProgress * scrollHeight;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, [chapters.length]);

  // Master GSAP ScrollTrigger scrub
  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      pin: stage,
      pinSpacing: false,
      scrub: 0.4,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);

        // Active Chapter Calculation
        let currentChap = 0;
        if (p < 0.16) currentChap = 0;
        else if (p < 0.33) currentChap = 1;
        else if (p < 0.50) currentChap = 2;
        else if (p < 0.67) currentChap = 3;
        else if (p < 0.84) currentChap = 4;
        else currentChap = 5;

        setActiveChapter(currentChap);
        onChapterChange?.(currentChap);

        /* ================================================================
           1. ZERO-BLACK-SCREEN CROSS-DISSOLVE STACKING ARCHITECTURE
           Scene N+1 fades in directly ON TOP of Scene N (which stays at 100% opacity)
           Scene N only turns off AFTER Scene N+1 has reached 100% opacity.
           ================================================================ */

        // Scene 1: Base layer (z: 10). Stays at opacity 1 until Scene 2 is at 100% (p = 0.20)
        const s1Opacity = p < 0.20 ? 1 : 0;
        
        // Scene 2: Layer 2 (z: 20). Fades in from p = 0.15 -> 0.20 over Scene 1. Stays at 1 until Scene 3 is 100% (p = 0.38)
        const s2Opacity = p < 0.15 ? 0 : p < 0.20 ? (p - 0.15) / 0.05 : p < 0.38 ? 1 : 0;

        // Scene 3: Layer 3 (z: 30). Fades in from p = 0.33 -> 0.38 over Scene 2. Stays at 1 until Scene 4 is 100% (p = 0.54)
        const s3Opacity = p < 0.33 ? 0 : p < 0.38 ? (p - 0.33) / 0.05 : p < 0.54 ? 1 : 0;

        // Scene 4: Layer 4 (z: 40). Fades in from p = 0.49 -> 0.54 over Scene 3. Stays at 1 until Scene 5 is 100% (p = 0.70)
        const s4Opacity = p < 0.49 ? 0 : p < 0.54 ? (p - 0.49) / 0.05 : p < 0.70 ? 1 : 0;

        // Scene 5: Layer 5 (z: 50). Fades in from p = 0.65 -> 0.70 over Scene 4. Stays at 1 until Scene 6 is 100% (p = 0.86)
        const s5Opacity = p < 0.65 ? 0 : p < 0.70 ? (p - 0.65) / 0.05 : p < 0.86 ? 1 : 0;

        // Scene 6: Layer 6 (z: 60). Fades in from p = 0.81 -> 0.86 over Scene 5. Stays at 1 through p = 1.00
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
        // Scene 1: p in [0.00, 0.18]
        const p1 = Math.min(1, Math.max(0, p / 0.18));
        const f1 = Math.round(p1 * 239);
        drawFrameToCanvas(s1CanvasRef.current, 0, f1);

        // Scene 2: p in [0.16, 0.36]
        const p2 = Math.min(1, Math.max(0, (p - 0.16) / 0.18));
        const f2 = Math.round(p2 * 239);
        drawFrameToCanvas(s2CanvasRef.current, 1, f2);

        // Scene 3: p in [0.34, 0.52]
        const p3 = Math.min(1, Math.max(0, (p - 0.34) / 0.16));
        const f3 = Math.round(p3 * 239);
        drawFrameToCanvas(s3CanvasRef.current, 2, f3);

        // Scene 4: p in [0.50, 0.68]
        const p4 = Math.min(1, Math.max(0, (p - 0.50) / 0.16));
        const f4 = Math.round(p4 * 239);
        drawFrameToCanvas(s4CanvasRef.current, 3, f4);

        // Scene 5: p in [0.66, 0.84]
        const p5 = Math.min(1, Math.max(0, (p - 0.66) / 0.16));
        const f5 = Math.round(p5 * 239);
        drawFrameToCanvas(s5CanvasRef.current, 4, f5);

        // Material captions highlight in sync with macro pan
        if (f5 < 85) setActiveMaterial('travertine');
        else if (f5 < 165) setActiveMaterial('bronze');
        else setActiveMaterial('oak');

        // Scene 6: p in [0.82, 1.00]
        const p6 = Math.min(1, Math.max(0, (p - 0.82) / 0.18));
        const f6 = Math.round(p6 * 239);
        drawFrameToCanvas(s6CanvasRef.current, 5, f6);

        /* ================================================================
           3. INDEPENDENT EDITORIAL TYPOGRAPHY TIMELINES
           ================================================================ */
        // S1 Hero Text: Starts visible, exits gracefully at p = 0.12 -> 0.18
        if (s1TextRef.current) {
          const t1Opacity = Math.max(0, Math.min(1, 1 - (p - 0.10) / 0.06));
          gsap.set(s1TextRef.current, { opacity: t1Opacity, yPercent: -p1 * 8 });
        }

        // S2 Philosophy Text: Enters p = 0.17 -> 0.22, exits p = 0.29 -> 0.34
        if (s2TextRef.current) {
          const t2In = Math.min(1, Math.max(0, (p - 0.17) / 0.05));
          const t2Out = Math.max(0, Math.min(1, (p - 0.29) / 0.05));
          gsap.set(s2TextRef.current, { opacity: t2In * (1 - t2Out), yPercent: 4 - p2 * 8 });
        }

        // S3 Residence Text: Enters p = 0.35 -> 0.40, exits p = 0.46 -> 0.51
        if (s3TextRef.current) {
          const t3In = Math.min(1, Math.max(0, (p - 0.35) / 0.05));
          const t3Out = Math.max(0, Math.min(1, (p - 0.46) / 0.05));
          gsap.set(s3TextRef.current, { opacity: t3In * (1 - t3Out), yPercent: 4 - p3 * 8 });
        }

        // S4 Interior Text: Enters p = 0.51 -> 0.56, exits p = 0.62 -> 0.67
        if (s4TextRef.current) {
          const t4In = Math.min(1, Math.max(0, (p - 0.51) / 0.05));
          const t4Out = Math.max(0, Math.min(1, (p - 0.62) / 0.05));
          gsap.set(s4TextRef.current, { opacity: t4In * (1 - t4Out), yPercent: 4 - p4 * 8 });
        }

        // S5 Material Text: Enters p = 0.67 -> 0.72, exits p = 0.78 -> 0.83
        if (s5TextRef.current) {
          const t5In = Math.min(1, Math.max(0, (p - 0.67) / 0.05));
          const t5Out = Math.max(0, Math.min(1, (p - 0.78) / 0.05));
          gsap.set(s5TextRef.current, { opacity: t5In * (1 - t5Out), yPercent: 4 - p5 * 8 });
        }

        // S6 Closing Text: Enters p = 0.83 -> 0.88, holds through p = 1.00
        if (s6TextRef.current) {
          const t6In = Math.min(1, Math.max(0, (p - 0.83) / 0.05));
          gsap.set(s6TextRef.current, { opacity: t6In, yPercent: 4 - p6 * 6 });
        }
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
        
        {/* TOP HUD BAR: Coordinates, Active Chapter, Live Telemetry */}
        <header className="stage-hud" aria-live="polite">
          <div className="stage-hud__left">
            <span className="hud-label text-label">ATELIER — CINEMATIC STAGE</span>
            <span className="hud-code text-mono">{chapters[activeChapter]?.code}</span>
          </div>

          <div className="stage-hud__center">
            <div className="chapter-pills" role="tablist" aria-label="Story chapters">
              {chapters.map((chap, idx) => (
                <button
                  key={chap.num}
                  className={`chapter-pill ${activeChapter === idx ? 'chapter-pill--active' : ''}`}
                  onClick={() => scrollToChapter(idx)}
                  role="tab"
                  aria-selected={activeChapter === idx}
                  aria-label={`Chapter ${chap.num}: ${chap.title}`}
                >
                  <span className="chapter-pill__num text-mono">{chap.num}</span>
                  <span className="chapter-pill__name">{chap.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="stage-hud__right">
            <span className="hud-badge">
              <span className="hud-badge__dot" />
              {chapters[activeChapter]?.tag}
            </span>
            <span className="hud-progress text-mono">
              {Math.round(scrollProgress * 100).toString().padStart(2, '0')}%
            </span>
          </div>
        </header>

        {/* CORNER REGISTRATION CROSSHAIRS */}
        <div className="stage-crosshair stage-crosshair--tl" aria-hidden="true">+</div>
        <div className="stage-crosshair stage-crosshair--tr" aria-hidden="true">+</div>
        <div className="stage-crosshair stage-crosshair--bl" aria-hidden="true">+</div>
        <div className="stage-crosshair stage-crosshair--br" aria-hidden="true">+</div>

        {/* ── SCENE 01: HERO — ATELIER ───────────────────────────────── */}
        <div ref={s1WrapRef} className="scene-stack scene-stack--s1" data-scene="hero-architecture">
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
              <span className="text-label text-gold">INDEPENDENT ARCHITECTURE &amp; SPATIAL DESIGN</span>
              <h1 className="hero-editorial__title text-hero">
                Architecture,<br />
                <em>Felt.</em>
              </h1>
              <p className="hero-editorial__sub text-lead">
                Spaces shaped by light, material, and the way we live.
              </p>
              <div className="hero-editorial__ctas">
                <Link to="/works" className="btn btn--primary">
                  <span>Explore Our Work</span>
                  <span className="btn__arrow" aria-hidden="true">→</span>
                </Link>
                <Link to="/studio" className="btn btn--ghost">
                  <span>Studio Manifesto</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCENE 02: PHILOSOPHY — LIGHT AND SPACE ─────────────────── */}
        <div ref={s2WrapRef} className="scene-stack scene-stack--s2" data-scene="philosophy-light">
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
              <span className="text-label text-gold">01 — OUR PHILOSOPHY</span>
              <h2 className="philosophy-title text-h1">
                Light Defines<br /><em>Space.</em>
              </h2>
              <p className="philosophy-sub text-lead">
                We design with restraint, allowing proportion, shadow, and natural materials to speak.
              </p>
            </div>
          </div>
        </div>

        {/* ── SCENE 03: FEATURED RESIDENCE ──────────────────────────── */}
        <div ref={s3WrapRef} className="scene-stack scene-stack--s3" data-scene="featured-residence">
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
              <div className="residence-badge-wrap">
                <span className="hud-badge">
                  <span className="hud-badge__dot" />
                  Residential Architecture · Coastal Living
                </span>
                <span className="text-label text-gold">02 — FEATURED RESIDENCE</span>
              </div>

              <h2 className="residence-editorial__title text-h1">
                A Quiet Dialogue<br />
                <em>with Nature.</em>
              </h2>

              <p className="residence-editorial__desc text-lead">
                A contemporary residence shaped by landscape, natural stone, and the changing light of the coast.
              </p>

              <div className="residence-editorial__cta">
                <Link to="/works" className="btn btn--primary">
                  <span>View Project Details</span>
                  <span className="btn__arrow" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCENE 04: INTERIOR JOURNEY ────────────────────────────── */}
        <div ref={s4WrapRef} className="scene-stack scene-stack--s4" data-scene="interior-journey">
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
              <span className="text-label text-gold">03 — INTERIOR SPACES</span>
              <h2 className="interior-editorial__title text-hero">
                Space to<br /><em>Breathe.</em>
              </h2>
              <p className="interior-editorial__lead text-lead">
                Warm oak, tactile stone, and quiet transitions create an interior designed to be experienced.
              </p>
              <div className="interior-tag-row">
                <span className="hud-badge">Fumed White Oak</span>
                <span className="hud-badge">Tactile Stone</span>
                <span className="hud-badge">Linear Daylight</span>
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
        <div ref={s5WrapRef} className="scene-stack scene-stack--s5" data-scene="material-details">
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
                <span className="text-label text-gold">04 — MATERIAL STUDY</span>
                <h2 className="text-h2">
                  Honest Materials.<br /><em>Timeless Detail.</em>
                </h2>
                <p className="text-lead">
                  Every surface, joint, and texture contributes to the character of a space.
                </p>
              </div>

              {/* Dynamic Material Badges synchronized with footage */}
              <div className="material-sync-badges">
                <div className={`mat-pill ${activeMaterial === 'travertine' ? 'mat-pill--active' : ''}`}>
                  <span className="mat-pill__dot" />
                  <span className="text-mono">TRAVERTINE</span>
                </div>
                <div className={`mat-pill ${activeMaterial === 'bronze' ? 'mat-pill--active' : ''}`}>
                  <span className="mat-pill__dot" />
                  <span className="text-mono">BRUSHED BRONZE</span>
                </div>
                <div className={`mat-pill ${activeMaterial === 'oak' ? 'mat-pill--active' : ''}`}>
                  <span className="mat-pill__dot" />
                  <span className="text-mono">NATURAL OAK</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCENE 06: CLOSING PAVILION ────────────────────────────── */}
        <div ref={s6WrapRef} className="scene-stack scene-stack--s6" data-scene="closing-architecture">
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
              <span className="hud-badge">
                <span className="hud-badge__dot" />
                ATELIER — ARCHITECTURE &amp; SPATIAL DESIGN
              </span>

              <h2 className="closing-editorial__title text-hero">
                Designed to<br />
                <em>Belong.</em>
              </h2>

              <p className="closing-editorial__lead text-lead">
                Architecture that connects people, place, and time.
              </p>

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
            className="stage-tracker__