/**
 * ATELIER — Lenis + GSAP ScrollTrigger singleton
 * One instance, one RAF loop, as per theme.md § 14
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let tickerAdded = false;

function rafCallback(time: number) {
  lenisInstance?.raf(time * 1000);
}

export function initLenis(): Lenis {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }

  lenisInstance = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });

  // Add ticker once — the callback always calls the current lenisInstance
  if (!tickerAdded) {
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);
    tickerAdded = true;
  }

  // Keep ScrollTrigger in sync
  lenisInstance.on('scroll', ScrollTrigger.update);

  return lenisInstance;
}

export function destroyLenis(): void {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export { gsap, ScrollTrigger };
