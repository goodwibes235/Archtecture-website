/**
 * ATELIER — Cinematic Scene Manifest
 * Source of truth: Real 24fps WebP Frame Sequences (240 frames each)
 * 
 * Frame filename format: frame_000000.webp -> frame_000239.webp (6-digit zero-padded)
 */

export interface CinematicScene {
  id: string;
  label: string;
  poster: string;
  /** Frame pattern — replace {index} with 6-digit zero-padded frame number */
  framePattern: string | null;
  /** Total frame count: 240 frames per sequence */
  frameCount: number;
  startIndex: number;
  endIndex: number;
  aspectRatio: string;
  fallbackGradient: string;
  mobileFallback: string;
}

export const cinematicScenes: Record<string, CinematicScene> = {
  heroArchitecture: {
    id: 'hero-architecture',
    label: 'Hero — Architecture',
    poster: '/media/atelier/hero-architecture/poster.webp',
    framePattern: '/media/atelier/hero-architecture/frame_{index}.webp',
    frameCount: 240,
    startIndex: 0,
    endIndex: 239,
    aspectRatio: '16/9',
    fallbackGradient: 'linear-gradient(160deg, #1a1812 0%, #2a2419 40%, #1e1a10 100%)',
    mobileFallback: '/media/atelier/hero-architecture/poster.webp',
  },

  philosophyLight: {
    id: 'philosophy-light',
    label: 'Philosophy — Light & Space',
    poster: '/media/atelier/philosophy-light/poster.webp',
    framePattern: '/media/atelier/philosophy-light/frame_{index}.webp',
    frameCount: 240,
    startIndex: 0,
    endIndex: 239,
    aspectRatio: '16/9',
    fallbackGradient: 'linear-gradient(135deg, #16140f 0%, #2b2720 60%, #1a1712 100%)',
    mobileFallback: '/media/atelier/philosophy-light/poster.webp',
  },

  featuredResidence: {
    id: 'featured-residence',
    label: 'Featured Residence',
    poster: '/media/atelier/featured-residence/poster.webp',
    framePattern: '/media/atelier/featured-residence/frame_{index}.webp',
    frameCount: 240,
    startIndex: 0,
    endIndex: 239,
    aspectRatio: '16/9',
    fallbackGradient: 'linear-gradient(150deg, #1c1a10 0%, #28230e 50%, #14120c 100%)',
    mobileFallback: '/media/atelier/featured-residence/poster.webp',
  },

  interiorJourney: {
    id: 'interior-journey',
    label: 'Interior Journey',
    poster: '/media/atelier/interior-journey/poster.webp',
    framePattern: '/media/atelier/interior-journey/frame_{index}.webp',
    frameCount: 240,
    startIndex: 0,
    endIndex: 239,
    aspectRatio: '16/9',
    fallbackGradient: 'linear-gradient(120deg, #1e1b14 0%, #2d2820 50%, #181410 100%)',
    mobileFallback: '/media/atelier/interior-journey/poster.webp',
  },

  materialDetails: {
    id: 'material-details',
    label: 'Material Details & Craft',
    poster: '/media/atelier/material-details/poster.webp',
    framePattern: '/media/atelier/material-details/frame_{index}.webp',
    frameCount: 240,
    startIndex: 0,
    endIndex: 239,
    aspectRatio: '16/9',
    fallbackGradient: 'linear-gradient(140deg, #211e17 0%, #30291c 50%, #1a1712 100%)',
    mobileFallback: '/media/atelier/material-details/poster.webp',
  },

  closingArchitecture: {
    id: 'closing-architecture',
    label: 'Closing — Project Inquiry',
    poster: '/media/atelier/closing-architecture/poster.webp',
    framePattern: '/media/atelier/closing-architecture/frame_{index}.webp',
    frameCount: 240,
    startIndex: 0,
    endIndex: 239,
    aspectRatio: '16/9',
    fallbackGradient: 'linear-gradient(170deg, #0e0f10 0%, #151618 50%, #0a0c0e 100%)',
    mobileFallback: '/media/atelier/closing-architecture/poster.webp',
  },
};
