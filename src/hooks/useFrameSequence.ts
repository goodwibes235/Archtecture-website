/**
 * ATELIER — Frame Sequence Hook
 * Manages scroll-controlled image frame rendering on a canvas.
 * Per theme.md § 9, 13: maps scroll progress [0,1] → frame index.
 * Reverse scrolling naturally reverses the sequence.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { CinematicScene } from '../data/cinematicScenes';

interface UseFrameSequenceOptions {
  scene: CinematicScene;
  /** 0–1 normalized scroll progress for this scene */
  progress: number;
  enabled: boolean;
}

interface UseFrameSequenceResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
  loadedCount: number;
}

export function useFrameSequence({
  scene,
  progress,
  enabled,
}: UseFrameSequenceOptions): UseFrameSequenceResult {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastFrameRef = useRef(-1);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const hasFrames = scene.frameCount > 0 && scene.framePattern !== null;

  // Build frame URL from pattern
  const getFrameUrl = useCallback(
    (index: number): string => {
      if (!scene.framePattern) return scene.poster;
      const padded = String(index).padStart(4, '0');
      return scene.framePattern.replace('{index}', padded);
    },
    [scene.framePattern, scene.poster]
  );

  // Draw the given frame index to canvas
  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const img = framesRef.current[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      if (lastFrameRef.current === index) return; // avoid redundant draws
      lastFrameRef.current = index;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Cover crop — preserve aspect, fill canvas
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const dx = (cw - sw) / 2;
      const dy = (ch - sh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, sw, sh);
    },
    []
  );

  // Load frames progressively (poster first, then initial batch, then rest)
  useEffect(() => {
    if (!enabled || !hasFrames) return;

    const count = scene.frameCount;
    framesRef.current = new Array(count + 1).fill(null);
    lastFrameRef.current = -1;

    const INITIAL_BATCH = Math.min(30, count);

    const loadFrame = (idx: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          framesRef.current[idx] = img;
          setLoadedCount((prev) => {
            const next = prev + 1;
            if (next >= INITIAL_BATCH) {
              setIsReady(true);
            }
            return next;
          });
          resolve();
        };
        img.onerror = () => resolve(); // continue despite failure
        img.src = getFrameUrl(idx);
      });

    // Load initial batch synchronously-ish, then rest progressively
    const loadAll = async () => {
      const initialBatch: Promise<void>[] = [];
      for (let i = scene.startIndex; i < scene.startIndex + INITIAL_BATCH; i++) {
        initialBatch.push(loadFrame(i));
      }
      await Promise.all(initialBatch);

      // Rest of frames — non-blocking
      for (let i = scene.startIndex + INITIAL_BATCH; i <= scene.endIndex; i++) {
        await loadFrame(i);
      }
    };

    loadAll();
  }, [enabled, hasFrames, scene, getFrameUrl]);

  // Map progress → frame index and draw
  useEffect(() => {
    if (!hasFrames) return;
    const count = scene.endIndex - scene.startIndex;
    const rawIdx = scene.startIndex + Math.round(progress * count);
    const clampedIdx = Math.max(scene.startIndex, Math.min(scene.endIndex, rawIdx));
    drawFrame(clampedIdx);
  }, [progress, hasFrames, scene, drawFrame]);

  return {
    canvasRef,
    isReady,
    loadedCount,
  };
}
