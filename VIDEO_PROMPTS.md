# ATELIER — Google Flow Video Prompts & Asset Pipeline

This document provides production-ready prompts and technical specifications for generating the six continuous cinematic camera sequences for **ATELIER Architecture & Spatial Design** using **Google Flow**, along with the conversion pipeline for WebP frame sequences.

---

## 1. Technical & Compositional Rules for All Shots

To ensure all generated clips scrub smoothly both forward and backward under scroll control:

1. **Continuous Single Take**: Each prompt describes a single continuous camera movement without cuts, zooms, rapid pans, or scene changes.
2. **Reversible Motion**: The beginning and ending compositions are equally strong and balanced so that scrubbing in reverse feels natural.
3. **Clean Frame**: No visible text, watermarks, 3D UI, subtitles, or artificial HUD overlays in the video render.
4. **Architectural Stability**: Stable structural geometry, straight vertical perspective lines (two-point perspective), and constant, realistic sunlight/shadow angles.
5. **Negative Space**: Compositions leave deliberate negative space (open sky, monolithic stone walls, soft shadows) in the lower third or left/right thirds to ensure HTML website typography remains legible.
6. **Consistent Material Palette**: Warm honed travertine, fair-faced concrete, white oak timber, blackened bronze, water reflections, and floor-to-ceiling glass.

---

## 2. Production-Ready Google Flow Prompts

---

### Scene 01: `hero-architecture`
* **Scene ID**: `hero-architecture`
* **Target Folder**: `public/media/atelier/hero-architecture/`
* **Role**: Opening Hero — Architectural Monolith & Arrival

#### Prompt
```text
Cinematic architectural film shot in 8k, photorealistic 35mm lens. A continuous, slow, deliberate camera dolly forward moving smoothly across a tranquil shallow reflection pool toward a monumental minimalist modernist residence constructed from warm honed beige limestone and dark bronze window mullions. The architecture features clean horizontal cantilevers and floor-to-ceiling glass pavilions. Golden hour Mediterranean morning sunlight casts long, sharp geometric architectural shadows across the smooth stone terrace. The water surface has ultra-subtle natural ripples reflecting the warm sky and building facade. In the background, three sculptural Mediterranean cypress trees sway gently against a warm warm-ivory horizon. The camera starts in a wide establishing perspective and glides smoothly forward at a constant, steady speed, finishing in a balanced medium-wide architectural composition emphasizing the grand entrance portal. Pristine architectural realism, stable two-point perspective, perfectly straight vertical lines, zero distortion, zero camera shake, no people, no watermarks, no text.
```

#### Direction & Scroll Narrative
* **Camera Movement**: Slow, steady forward dolly at eye level (1.6m) along the central axis of the reflection pool.
* **Start Composition**: Wide panoramic view with the residence framed centrally, ample sky above and reflection pool in the lower third.
* **End Composition**: Medium-wide architectural elevation focused on the cantilevered entrance and stone textures.
* **Scroll Behavior**:
  * *Scrolling Down*: The viewer glides smoothly across the water toward the residence, drawing them into the space.
  * *Scrolling Up*: The camera glides back into the wide landscape panorama.

---

### Scene 02: `philosophy-light`
* **Scene ID**: `philosophy-light`
* **Target Folder**: `public/media/atelier/philosophy-light/`
* **Role**: Studio Philosophy — The Choreography of Natural Light & Shadow

#### Prompt
```text
Slow, elegant architectural tracking shot in 8k resolution, cinematic architectural documentary style. A continuous horizontal camera slide from left to right along a grand minimalist colonnade of textured cast-in-place concrete and warm travertine pillars. Raking midday sunlight streams between the tall columns, casting crisp, rhythmic diagonal shadow stripes across a polished light-grey terrazzo floor. Through the open colonnade, an enclosed Zen courtyard garden is visible with raked gravel, monolithic volcanic boulders, and a single sculptural Japanese maple tree with deep green leaves. The camera maintains a stable, slow, horizontal panning trajectory at a constant speed, transitioning from the first column shadow across the sunlit corridor to reveal the full courtyard vista on the right. Subtle atmospheric dust motes catch the light beams. Architectural purity, razor-sharp textures, perfectly stable geometry, no flicker, no warping, pristine natural lighting, no text, no logos.
```

#### Direction & Scroll Narrative
* **Camera Movement**: Smooth lateral tracking shot (left-to-right) parallel to the colonnade axis.
* **Start Composition**: Colonnade shadows filling the left frame with the light corridor opening up to the right.
* **End Composition**: Full view of the sun-drenched internal courtyard framed by the final monolithic column.
* **Scroll Behavior**:
  * *Scrolling Down*: Reveals the courtyard as columns pass by like frames of a film.
  * *Scrolling Up*: Reverses back through the rhythmic light and shadow colonnade.

---

### Scene 03: `featured-residence`
* **Scene ID**: `featured-residence`
* **Target Folder**: `public/media/atelier/featured-residence/`
* **Role**: Featured Project — Limestone Courtyard Villa (Casa di Calcare)

#### Prompt
```text
Ultra-smooth architectural cinematic crane shot in 8k, shot on Arri Alexa with 50mm anamorphic prime lens. A continuous, slow descending crane and push-in movement revealing a secluded luxury coastal courtyard villa built into rugged limestone cliffs. The villa features monolithic pale stone walls, low-profile horizontal planes, floor-to-ceiling recessed glass sliders, and a minimalist interior courtyard paved in large-format limestone slabs. The warm late afternoon sunlight glints across the glass facade, revealing the warm timber-lined living interior within. In the foreground, wild coastal rosemary and drought-tolerant grasses softly border the stone path. The camera begins elevated looking down at the sculptural roofline and courtyard geometry, then gently lowers and glides forward to settle at eye-level looking into the main living pavilion. Flawless architectural proportions, photorealistic materials, zero warping, stable lines, no people, no camera jitter, no text.
```

#### Direction & Scroll Narrative
* **Camera Movement**: Compound crane descent combined with a slow forward push-in.
* **Start Composition**: Elevated 3/4 aerial view showcasing the geometric courtyard layout and surrounding landscape.
* **End Composition**: Eye-level perspective framing the living pavilion through natural limestone walls.
* **Scroll Behavior**:
  * *Scrolling Down*: Descends from the sky into the intimate heart of the villa.
  * *Scrolling Up*: Rises back up into an expansive aerial survey of the architectural form.

---

### Scene 04: `interior-journey`
* **Scene ID**: `interior-journey`
* **Target Folder**: `public/media/atelier/interior-journey/`
* **Role**: Spatial Journey — Connected Interior Volumes & Fluid Space

#### Prompt
```text
Cinematic interior architectural tracking shot in 8k photorealistic quality, 28mm wide-angle architectural lens. A continuous, slow forward glide through an expansive double-height minimalist living space. The interior features smooth micro-cement floors, floor-to-ceiling brushed white oak wall paneling, a monolithic floating black granite kitchen island, and recessed warm architectural linear lighting. Soft diffused daylight floods through floor-to-ceiling minimalist glass walls on the left, looking out onto a private bamboo garden. The camera glides steadily forward along the central circulation axis, moving past a sculptural low-slung linen sofa and minimalist travertine coffee table, gently approaching a floating cantilevered steel-and-oak staircase in the background. Natural atmospheric depth, accurate light bouncing, stable textures, zero warping of straight lines, pristine photorealism, no artifacts, no text.
```

#### Direction & Scroll Narrative
* **Camera Movement**: Low-speed central push-in tracking shot through the double-height living pavilion.
* **Start Composition**: Wide view of the living room with soft light entering from the left glazing.
* **End Composition**: Intimate perspective framing the floating staircase and minimalist dining area beyond.
* **Scroll Behavior**:
  * *Scrolling Down*: Draws the user into the living space, revealing the depth of the interior plan.
  * *Scrolling Up*: Glides back out to the open entry zone.

---

### Scene 05: `material-details`
* **Scene ID**: `material-details`
* **Target Folder**: `public/media/atelier/material-details/`
* **Role**: Materiality & Craft — Tactile Close-Up of Honest Materials

#### Prompt
```text
Macro cinematic architectural shot in 8k resolution, 90mm macro lens with shallow depth of field. A continuous, slow, micro-pan and gentle rack focus across the tactile junction of three authentic architectural materials: raw porous Roman travertine stone with fine natural fissures, hand-brushed matte patinated dark bronze with subtle grain, and end-grain solid white oak timber. Soft, raking warm side light highlights the micro-textures, chisel marks, and authentic imperfections of the stone surface. The camera glides diagonally across the material seam, smoothly shifting focus from the textured stone in the foreground to the fine metallic grain of the bronze and timber joinery in the background. Ultra-crisp tactile detail, zero digital noise, stable lighting, smooth rack focus, no flicker, no deformation, no text.
```

#### Direction & Scroll Narrative
* **Camera Movement**: Diagonal micro-glide across material seams with smooth rack focus.
* **Start Composition**: Close-up focus on the raw texture of the travertine block.
* **End Composition**: Focus shifts to the precision joinery between the patinated bronze blade and solid oak panel.
* **Scroll Behavior**:
  * *Scrolling Down*: Explores the craftsmanship and textural interplay from stone to metal.
  * *Scrolling Up*: Reverses focus back to the tactile stone surface.

---

### Scene 06: `closing-architecture`
* **Scene ID**: `closing-architecture`
* **Target Folder**: `public/media/atelier/closing-architecture/`
* **Role**: Closing Commission Invitation — Twilight Silhouette & Evening Atmosphere

#### Prompt
```text
Cinematic twilight architectural shot in 8k resolution, 35mm lens. A continuous, slow, majestic camera pull-back moving away from a modern pavilion villa at blue hour dusk. The interior is softly illuminated by warm 2700K incandescent ambient light, casting a warm golden glow through large glass panes onto a dark stone terrace and infinity edge pool. The exterior structure features dark volcanic stone walls and a thin cantilevered roof silhouette standing against a deep indigo and dusky violet evening sky. The calm pool water mirrors the warm interior light and twilight sky. The camera slowly and smoothly glides backward in a straight line at a constant speed, expanding the frame to reveal the quiet architectural sanctuary nestled into the dark natural landscape. Serene mood, crisp reflections, perfectly stable geometry, no camera shake, no noise, no people, no text.
```

#### Direction & Scroll Narrative
* **Camera Movement**: Slow, steady pull-back dolly away from the glowing pavilion into the dusk landscape.
* **Start Composition**: Intimate medium shot of the warm glowing interior pavilion.
* **End Composition**: Wide panoramic establishing shot of the entire illuminated retreat in the twilight landscape.
* **Scroll Behavior**:
  * *Scrolling Down*: Expands into a panoramic view, creating a sense of completion and reflection.
  * *Scrolling Up*: Moves closer into the intimate, warm interior light.

---

## 3. Google Flow Generation & Export Settings

When generating each clip in Google Flow / Veo:
1. **Aspect Ratio**: Select `16:9` (1.77:1).
2. **Duration**: 5 to 8 seconds (yields 120 to 180 frames at 24fps).
3. **Motion / Camera Control**: Set camera motion to **Smooth / Linear** (avoid high acceleration or random camera shake).
4. **Resolution**: Choose `1080p` or `4K` if available.
5. **Export Format**: Download the raw `.mp4` file for each scene.

---

## 4. Video-to-Frame Conversion Pipeline

To convert the exported `.mp4` video files into high-performance, scroll-scrubbable WebP sequences for ATELIER:

### Step 1: Install FFmpeg
Ensure `ffmpeg` is available on your command line (available via `winget install Gyan.FFmpeg`, Homebrew `brew install ffmpeg`, or precompiled binary).

### Step 2: Extract Frames to WebP
Run the following command for each exported clip. Replace `<scene-name>` with the appropriate scene ID (`hero-architecture`, `philosophy-light`, etc.):

```bash
# Example for hero-architecture (extracting at 24fps in 1080p WebP format)
ffmpeg -i hero-architecture.mp4 -vf "fps=24,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -c:v libwebp -quality 78 -compression_level 6 public/media/atelier/hero-architecture/frame-%04d.webp
```

### Step 3: Generate the Poster Image
Extract the first frame as the fallback poster:

```bash
ffmpeg -i hero-architecture.mp4 -vframes 1 -q:v 2 public/media/atelier/hero-architecture/poster.jpg
```

---

## 5. Folder Structure & Verification Checklist

Ensure the generated files match the exact path layout below:

```text
public/media/atelier/
├── hero-architecture/
│   ├── poster.jpg
│   ├── frame-0001.webp
│   ├── frame-0002.webp
│   └── ... (up to e.g. frame-0120.webp)
├── philosophy-light/
│   ├── poster.jpg
│   └── frame-0001.webp ... frame-0120.webp
├── featured-residence/
│   ├── poster.jpg
│   └── frame-0001.webp ... frame-0120.webp
├── interior-journey/
│   ├── poster.jpg
│   └── frame-0001.webp ... frame-0120.webp
├── material-details/
│   ├── poster.jpg
│   └── frame-0001.webp ... frame-0120.webp
└── closing-architecture/
    ├── poster.jpg
    └── frame-0001.webp ... frame-0120.webp
```

---

## 6. Activating the Sequence in Code

Once frames are placed in the folder, open [`src/data/cinematicScenes.ts`](file:///c:/Users/Abdul%20Rehman/OneDrive/Desktop/Archtecture-website/src/data/cinematicScenes.ts) and set `frameCount` and `endIndex` to your actual frame count (e.g. `120`):

```typescript
export const cinematicScenes: Record<string, CinematicScene> = {
  heroArchitecture: {
    id: 'hero-architecture',
    label: 'Hero — Architecture',
    poster: '/media/atelier/hero-architecture/poster.jpg',
    framePattern: '/media/atelier/hero-architecture/frame-{index}.webp',
    frameCount: 120, // Set to actual count
    startIndex: 1,
    endIndex: 120,   // Set to last frame index
    aspectRatio: '16/9',
    fallbackGradient: 'linear-gradient(160deg, #1a1812 0%, #2a2419 40%, #1e1a10 100%)',
    mobileFallback: '/media/atelier/hero-architecture/poster.jpg',
  },
  // ... repeat for other scenes
};
```

---

## 7. Memory & Performance Best Practices

1. **Resolution vs. File Size**: A 1080p WebP frame at quality 75–80 is typically ~40–70 KB. A 120-frame sequence is only ~6 MB total.
2. **Batch Preloading**: The ATELIER engine automatically preloads the first 30 frames for instantaneous response before progressively streaming the remainder in the background.
3. **Canvas DPI Scaling**: Canvas buffers are scaled to `Math.min(window.devicePixelRatio, 2)` to deliver razor-sharp rendering on Retina displays without excessive VRAM overhead.
