import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ARTIFACT_DIR = 'C:/Users/Abdul Rehman/.gemini/antigravity-ide/brain/952e2d24-1f5e-434c-9d91-261e3d4d3515';
const OUTPUT_DIR = 'public/media/visuals';

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * High-precision background removal for studio renders.
 * Isolates model, keeps soft contact shadow directly under the plinth,
 * defringes boundary pixels, and ensures 100% alpha transparency outside.
 */
async function processStudioRender(inputPath, outputPath, options = {}) {
  const {
    threshold = 230,
    shadowMaxAlpha = 130,
    shadowThreshold = 215,
    cropMargin = 25
  } = options;

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const total = w * h;

  // 1. Edge-connected BFS to mark background
  const isBg = new Uint8Array(total);
  const queue = [];

  function isWhiteLike(idx) {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return r >= threshold && g >= threshold && b >= threshold;
  }

  // Seed outer borders
  for (let x = 0; x < w; x++) {
    const top = x;
    if (isWhiteLike(top * 3)) { isBg[top] = 1; queue.push(top); }
    const bot = (h - 1) * w + x;
    if (isWhiteLike(bot * 3)) { isBg[bot] = 1; queue.push(bot); }
  }
  for (let y = 0; y < h; y++) {
    const left = y * w + 0;
    if (isWhiteLike(left * 3) && !isBg[left]) { isBg[left] = 1; queue.push(left); }
    const right = y * w + (w - 1);
    if (isWhiteLike(right * 3) && !isBg[right]) { isBg[right] = 1; queue.push(right); }
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % w;
    const cy = Math.floor(curr / w);

    const neighbors = [
      cy > 0 ? (cy - 1) * w + cx : -1,
      cy < h - 1 ? (cy + 1) * w + cx : -1,
      cx > 0 ? cy * w + (cx - 1) : -1,
      cx < w - 1 ? cy * w + (cx + 1) : -1,
    ];

    for (const n of neighbors) {
      if (n !== -1 && !isBg[n]) {
        if (isWhiteLike(n * 3)) {
          isBg[n] = 1;
          queue.push(n);
        }
      }
    }
  }

  // 2. Identify boundary pixels of model for defringing
  const isBoundary = new Uint8Array(total);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (!isBg[idx]) {
        if (isBg[idx - 1] || isBg[idx + 1] || isBg[idx - w] || isBg[idx + w]) {
          isBoundary[idx] = 1;
        }
      }
    }
  }

  // 3. Mark contact shadow regions near model bottom
  // A contact shadow only exists within 60px of the model bottom
  const out = Buffer.alloc(total * 4);
  let minX = w, maxX = 0, minY = h, maxY = 0;

  for (let i = 0; i < total; i++) {
    const s = i * 3;
    const d = i * 4;
    const r = data[s];
    const g = data[s + 1];
    const b = data[s + 2];
    const x = i % w;
    const y = Math.floor(i / w);

    if (isBg[i]) {
      const minVal = Math.min(r, g, b);
      // Only keep shadow if it's noticeably darker than background
      if (minVal < shadowThreshold) {
        const darkness = shadowThreshold - minVal;
        const alpha = Math.min(shadowMaxAlpha, Math.round(darkness * 1.8));
        out[d] = 10;
        out[d + 1] = 12;
        out[d + 2] = 15;
        out[d + 3] = alpha;

        if (alpha > 20) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      } else {
        out[d] = 0; out[d + 1] = 0; out[d + 2] = 0; out[d + 3] = 0;
      }
    } else {
      // Model pixel
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      if (isBoundary[i]) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 220) {
          const factor = 0.90;
          out[d] = Math.round(r * factor);
          out[d + 1] = Math.round(g * factor);
          out[d + 2] = Math.round(b * factor);
          out[d + 3] = 235;
        } else {
          out[d] = r; out[d + 1] = g; out[d + 2] = b; out[d + 3] = 255;
        }
      } else {
        out[d] = r; out[d + 1] = g; out[d + 2] = b; out[d + 3] = 255;
      }
    }
  }

  const cropLeft = Math.max(0, minX - cropMargin);
  const cropTop = Math.max(0, minY - cropMargin);
  const cropWidth = Math.min(w - cropLeft, (maxX - minX) + cropMargin * 2);
  const cropHeight = Math.min(h - cropTop, (maxY - minY) + cropMargin * 2);

  console.log(`[${path.basename(outputPath)}] Bounds: [${minX}, ${minY}, ${maxX}, ${maxY}] -> Crop: [${cropLeft}, ${cropTop}, ${cropWidth}x${cropHeight}]`);

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .resize(800, 600, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  console.log(`✓ ${path.basename(outputPath)} created: ${meta.width}x${meta.height}, channels=${meta.channels}, alpha=${meta.hasAlpha}`);
}

/**
 * Generate Scene 4: Architectural Modern Staircase Model (Maquette)
 * Uses genuine photographic textures from interior-journey and material-details.
 */
async function generateScene4Interior() {
  const outputPath = path.join(OUTPUT_DIR, 'scene_4.webp');
  console.log('Generating Scene 4 (Interior Staircase Model)...');

  // Extract real photographic textures
  const oakImg = await sharp('public/media/atelier/material-details/frame_000200.webp')
    .extract({ left: 300, top: 150, width: 400, height: 400 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const concreteImg = await sharp('public/media/atelier/interior-journey/frame_000080.webp')
    .extract({ left: 400, top: 100, width: 400, height: 400 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bronzeImg = await sharp('public/media/atelier/material-details/frame_000120.webp')
    .extract({ left: 300, top: 150, width: 400, height: 400 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Render on 800x600 transparent canvas
  const w = 800;
  const h = 600;
  const out = Buffer.alloc(w * h * 4); // all 0 (transparent)

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = (y * w + x) * 4;
    // Alpha compositing
    const srcA = a / 255;
    const dstA = out[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA > 0) {
      out[idx] = Math.round((r * srcA + out[idx] * dstA * (1 - srcA)) / outA);
      out[idx + 1] = Math.round((g * srcA + out[idx + 1] * dstA * (1 - srcA)) / outA);
      out[idx + 2] = Math.round((b * srcA + out[idx + 2] * dstA * (1 - srcA)) / outA);
      out[idx + 3] = Math.round(outA * 255);
    }
  }

  // 1. Draw architectural display plinth (stone base)
  const plinthY = 460;
  const _plinthPoints = [
    { x: 120, y: plinthY },
    { x: 400, y: plinthY + 80 },
    { x: 680, y: plinthY },
    { x: 400, y: plinthY - 80 }
  ];

  // Plinth shadow on transparent ground
  for (let y = plinthY - 40; y < plinthY + 110; y++) {
    for (let x = 80; x < 720; x++) {
      const dx = (x - 400) / 280;
      const dy = (y - (plinthY + 30)) / 60;
      const d = dx * dx + dy * dy;
      if (d < 1.0) {
        const falloff = Math.pow(1.0 - d, 1.5);
        setPixel(x, y, 10, 12, 14, Math.round(falloff * 110));
      }
    }
  }

  // Draw top surface of display plinth
  for (let y = plinthY - 75; y <= plinthY + 75; y++) {
    for (let x = 125; x <= 675; x++) {
      const nx = (x - 400) / 280;
      const ny = (y - plinthY) / 75;
      if (Math.abs(nx) + Math.abs(ny) <= 1.0) {
        // Base stone texture
        const tx = ((x * 2) % 400 + 400) % 400;
        const ty = ((y * 2) % 400 + 400) % 400;
        const tIdx = (ty * 400 + tx) * 3;
        const r = Math.round(concreteImg.data[tIdx] * 0.45 + 15);
        const g = Math.round(concreteImg.data[tIdx + 1] * 0.45 + 17);
        const b = Math.round(concreteImg.data[tIdx + 2] * 0.45 + 18);
        setPixel(x, y, r, g, b, 255);
      }
    }
  }

  // Plinth chamfered edge lines
  for (let t = 0; t <= 1; t += 0.002) {
    const x1 = Math.round(120 + t * 280);
    const y1 = Math.round(plinthY + t * 80);
    setPixel(x1, y1, 160, 150, 135, 200);
    const x2 = Math.round(400 + t * 280);
    const y2 = Math.round(plinthY + 80 - t * 80);
    setPixel(x2, y2, 160, 150, 135, 200);
  }

  // 2. Concrete Architectural Shear Wall (Left vertical monolith)
  const wallLeft = 190;
  const wallRight = 370;
  const wallTop = 110;
  const wallBottom = 430;

  for (let y = wallTop; y < wallBottom; y++) {
    for (let x = wallLeft; x < wallRight; x++) {
      const u = (x - wallLeft) / (wallRight - wallLeft);
      const v = (y - wallTop) / (wallBottom - wallTop);
      // Perspective transform on wall
      const tx = Math.floor(u * 380) % 400;
      const ty = Math.floor(v * 380) % 400;
      const tIdx = (ty * 400 + tx) * 3;
      // Concrete tone with smooth natural light gradient
      const lightGrad = 0.85 + (1 - v) * 0.35 - u * 0.2;
      const r = Math.min(255, Math.round(concreteImg.data[tIdx] * lightGrad * 1.1));
      const g = Math.min(255, Math.round(concreteImg.data[tIdx + 1] * lightGrad * 1.05));
      const b = Math.min(255, Math.round(concreteImg.data[tIdx + 2] * lightGrad * 0.95));
      setPixel(x, y, r, g, b, 255);
    }
  }

  // Board-formed concrete horizontal tie holes / joints
  for (let gy = wallTop + 60; gy < wallBottom; gy += 70) {
    for (let x = wallLeft; x < wallRight; x++) {
      setPixel(x, gy, 60, 55, 48, 120);
      setPixel(x, gy + 1, 190, 185, 175, 80);
    }
    // Form tie dots
    for (let gx = wallLeft + 45; gx < wallRight; gx += 65) {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx * dx + dy * dy <= 4) {
            setPixel(gx + dx, gy + dy, 40, 38, 35, 220);
          }
        }
      }
    }
  }

  // 3. Floating Cantilevered Oak Steps (Treads ascending from right to left)
  const numSteps = 9;
  for (let i = 0; i < numSteps; i++) {
    const stepProgress = i / (numSteps - 1);
    const startX = Math.round(280 + stepProgress * 170);
    const endX = startX + 90;
    const stepY = Math.round(410 - stepProgress * 230);
    const treadDepth = 22;
    const treadThickness = 12;

    // Contact shadow of tread on concrete wall & lower tread
    for (let sy = stepY + 8; sy < stepY + 32; sy++) {
      for (let sx = startX - 25; sx < endX - 10; sx++) {
        setPixel(sx, sy, 15, 12, 10, 85);
      }
    }

    // Top surface of oak tread (isometric)
    for (let dy = 0; dy < treadDepth; dy++) {
      for (let dx = 0; dx < (endX - startX); dx++) {
        const px = startX + dx - Math.round(dy * 0.7);
        const py = stepY + Math.round(dy * 0.4);

        const tx = (dx * 3) % 400;
        const ty = (dy * 15) % 400;
        const tIdx = (ty * 400 + tx) * 3;

        // Wood grain with warm illumination highlight on front edge
        const highlight = dy === 0 ? 1.3 : 1.05;
        const r = Math.min(255, Math.round(oakImg.data[tIdx] * highlight));
        const g = Math.min(255, Math.round(oakImg.data[tIdx + 1] * highlight));
        const b = Math.min(255, Math.round(oakImg.data[tIdx + 2] * highlight));
        setPixel(px, py, r, g, b, 255);
      }
    }

    // Front edge of oak tread
    for (let th = 1; th <= treadThickness; th++) {
      for (let dx = 0; dx < (endX - startX); dx++) {
        const px = startX + dx;
        const py = stepY + th;

        const tx = (dx * 3) % 400;
        const ty = (th * 20) % 400;
        const tIdx = (ty * 400 + tx) * 3;

        // Shaded side face
        const r = Math.round(oakImg.data[tIdx] * 0.75);
        const g = Math.round(oakImg.data[tIdx + 1] * 0.75);
        const b = Math.round(oakImg.data[tIdx + 2] * 0.75);
        setPixel(px, py, r, g, b, 255);
      }
    }

    // Bronze balustrade vertical rod
    const rodX = endX - 5;
    for (let ry = stepY - 65; ry <= stepY; ry++) {
      const bIdx = ((ry % 380) * 400 + (rodX % 380)) * 3;
      const brR = Math.min(255, Math.round(bronzeImg.data[bIdx] * 1.3));
      const brG = Math.min(255, Math.round(bronzeImg.data[bIdx + 1] * 1.2));
      const brB = Math.min(255, Math.round(bronzeImg.data[bIdx + 2] * 1.1));
      setPixel(rodX, ry, brR, brG, brB, 255);
      setPixel(rodX + 1, ry, Math.round(brR * 0.7), Math.round(brG * 0.7), Math.round(brB * 0.7), 255);
    }
  }

  // 4. Bronze Continuous Handrail
  for (let i = 0; i < numSteps - 1; i++) {
    const x1 = Math.round(280 + (i / (numSteps - 1)) * 170 + 85);
    const y1 = Math.round(410 - (i / (numSteps - 1)) * 230 - 65);
    const x2 = Math.round(280 + ((i + 1) / (numSteps - 1)) * 170 + 85);
    const y2 = Math.round(410 - ((i + 1) / (numSteps - 1)) * 230 - 65);

    for (let t = 0; t <= 1; t += 0.01) {
      const rx = Math.round(x1 + (x2 - x1) * t);
      const ry = Math.round(y1 + (y2 - y1) * t);
      setPixel(rx, ry, 215, 175, 110, 255);
      setPixel(rx, ry + 1, 150, 115, 65, 255);
    }
  }

  // 5. Diagonal Clerestory Light Shaft
  for (let y = 100; y < 450; y++) {
    for (let x = 200; x < 550; x++) {
      const u = (x - 200) / 350;
      const v = (y - 100) / 350;
      const beamDist = Math.abs(u - v * 0.7);
      if (beamDist < 0.22) {
        const beamIntensity = Math.pow(1 - beamDist / 0.22, 2) * (1 - v * 0.6) * 35;
        setPixel(x, y, 255, 245, 220, Math.round(beamIntensity));
      }
    }
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  console.log(`✓ scene_4.webp created: ${meta.width}x${meta.height}, channels=${meta.channels}, alpha=${meta.hasAlpha}`);
}

/**
 * Generate Scene 5: High-Quality Isolated Material Samples
 * Travertine, Brushed Bronze, and Natural Oak specimen blocks.
 */
async function generateScene5Materials() {
  const outputPath = path.join(OUTPUT_DIR, 'scene_5.webp');
  console.log('Generating Scene 5 (Material Samples: Travertine, Bronze, Oak)...');

  // Load real macro textures
  const travImg = await sharp('public/media/atelier/material-details/frame_000000.webp')
    .extract({ left: 350, top: 150, width: 450, height: 450 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bronzeImg = await sharp('public/media/atelier/material-details/frame_000120.webp')
    .extract({ left: 350, top: 150, width: 450, height: 450 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const oakImg = await sharp('public/media/atelier/material-details/frame_000200.webp')
    .extract({ left: 350, top: 150, width: 450, height: 450 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = 800;
  const h = 600;
  const out = Buffer.alloc(w * h * 4);

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = (y * w + x) * 4;
    const srcA = a / 255;
    const dstA = out[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA > 0) {
      out[idx] = Math.round((r * srcA + out[idx] * dstA * (1 - srcA)) / outA);
      out[idx + 1] = Math.round((g * srcA + out[idx + 1] * dstA * (1 - srcA)) / outA);
      out[idx + 2] = Math.round((b * srcA + out[idx + 2] * dstA * (1 - srcA)) / outA);
      out[idx + 3] = Math.round(outA * 255);
    }
  }

  // Helper to render an isometric 3D material specimen block
  function renderIsometricBlock(centerX, centerY, blockW, blockH, blockD, texture, options = {}) {
    const {
      topBrightness = 1.05,
      leftBrightness = 0.72,
      rightBrightness = 0.88,
      specular = null,
      shadowAlpha = 110,
      shadowScale = 1.0
    } = options;

    const hw = blockW / 2;
    const isoY = blockD / 2;

    // Contact Shadow on transparent ground
    const shadowCenterY = centerY + blockH + isoY * 0.4;
    for (let y = Math.round(shadowCenterY - isoY); y < Math.round(shadowCenterY + isoY * 1.5); y++) {
      for (let x = Math.round(centerX - hw * 1.6); x < Math.round(centerX + hw * 1.6); x++) {
        const dx = (x - centerX) / (hw * 1.3 * shadowScale);
        const dy = (y - shadowCenterY) / (isoY * 0.9 * shadowScale);
        const dist = dx * dx + dy * dy;
        if (dist < 1.0) {
          const falloff = Math.pow(1.0 - dist, 1.8);
          setPixel(x, y, 12, 14, 16, Math.round(falloff * shadowAlpha));
        }
      }
    }

    // 1. Left Vertical Face
    for (let y = 0; y < blockH; y++) {
      for (let x = 0; x < hw; x++) {
        const px = Math.round(centerX - hw + x);
        const py = Math.round(centerY + (x * isoY / hw) + y);

        const tx = Math.floor((x / hw) * 440) % 450;
        const ty = Math.floor((y / blockH) * 440) % 450;
        const tIdx = (ty * 450 + tx) * 3;

        const r = Math.min(255, Math.round(texture.data[tIdx] * leftBrightness));
        const g = Math.min(255, Math.round(texture.data[tIdx + 1] * leftBrightness));
        const b = Math.min(255, Math.round(texture.data[tIdx + 2] * leftBrightness));
        setPixel(px, py, r, g, b, 255);
      }
    }

    // 2. Right Vertical Face
    for (let y = 0; y < blockH; y++) {
      for (let x = 0; x < hw; x++) {
        const px = Math.round(centerX + x);
        const py = Math.round(centerY + isoY - (x * isoY / hw) + y);

        const tx = Math.floor((x / hw) * 440) % 450;
        const ty = Math.floor((y / blockH) * 440) % 450;
        const tIdx = (ty * 450 + tx) * 3;

        const r = Math.min(255, Math.round(texture.data[tIdx] * rightBrightness));
        const g = Math.min(255, Math.round(texture.data[tIdx + 1] * rightBrightness));
        const b = Math.min(255, Math.round(texture.data[tIdx + 2] * rightBrightness));
        setPixel(px, py, r, g, b, 255);
      }
    }

    // 3. Top Face (Rhombus)
    for (let ty = -isoY; ty <= isoY; ty++) {
      for (let tx = -hw; tx <= hw; tx++) {
        const nx = tx / hw;
        const ny = ty / isoY;
        if (Math.abs(nx) + Math.abs(ny) <= 1.0) {
          const px = Math.round(centerX + tx);
          const py = Math.round(centerY + ty);

          const texX = Math.floor(((tx + hw) / (hw * 2)) * 440) % 450;
          const texY = Math.floor(((ty + isoY) / (isoY * 2)) * 440) % 450;
          const tIdx = (texY * 450 + texX) * 3;

          let mult = topBrightness;
          if (specular) {
            // Add metallic anisotropic brush reflection
            const specDist = Math.abs(nx * 0.8 + ny * 0.6);
            if (specDist < 0.25) {
              mult += Math.pow(1 - specDist / 0.25, 2) * specular;
            }
          }

          const r = Math.min(255, Math.round(texture.data[tIdx] * mult));
          const g = Math.min(255, Math.round(texture.data[tIdx + 1] * mult));
          const b = Math.min(255, Math.round(texture.data[tIdx + 2] * mult));
          setPixel(px, py, r, g, b, 255);
        }
      }
    }

    // Bevel highlights on top edges
    for (let t = 0; t <= 1; t += 0.005) {
      // Top left-front edge
      const ex1 = Math.round(centerX - hw * (1 - t));
      const ey1 = Math.round(centerY + isoY * t);
      setPixel(ex1, ey1, 240, 230, 210, 160);

      // Top right-front edge
      const ex2 = Math.round(centerX + hw * t);
      const ey2 = Math.round(centerY + isoY * (1 - t));
      setPixel(ex2, ey2, 240, 230, 210, 160);
    }
  }

  // Specimen 1: Honed Travertine Block (Left, resting flat)
  renderIsometricBlock(200, 310, 170, 75, 95, travImg, {
    topBrightness: 1.10,
    leftBrightness: 0.76,
    rightBrightness: 0.90,
    shadowAlpha: 110
  });

  // Specimen 2: Brushed Bronze Ingot (Center, elevated/floating)
  renderIsometricBlock(400, 185, 175, 80, 100, bronzeImg, {
    topBrightness: 1.25,
    leftBrightness: 0.70,
    rightBrightness: 0.95,
    specular: 0.55,
    shadowAlpha: 85,
    shadowScale: 1.3
  });

  // Specimen 3: Rift-Sawn Natural Oak Block (Right, resting flat)
  renderIsometricBlock(600, 310, 170, 75, 95, oakImg, {
    topBrightness: 1.08,
    leftBrightness: 0.72,
    rightBrightness: 0.88,
    shadowAlpha: 110
  });

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  console.log(`✓ scene_5.webp created: ${meta.width}x${meta.height}, channels=${meta.channels}, alpha=${meta.hasAlpha}`);

  // Also create isolated individual specimen assets for travertine, bronze, oak
  async function generateSingleSpecimen(name, texture, options) {
    const sOut = Buffer.alloc(800 * 600 * 4);
    function sSet(x, y, r, g, b, a = 255) {
      if (x < 0 || x >= 800 || y < 0 || y >= 600) return;
      const idx = (y * 800 + x) * 4;
      const srcA = a / 255;
      const dstA = sOut[idx + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA > 0) {
        sOut[idx] = Math.round((r * srcA + sOut[idx] * dstA * (1 - srcA)) / outA);
        sOut[idx + 1] = Math.round((g * srcA + sOut[idx + 1] * dstA * (1 - srcA)) / outA);
        sOut[idx + 2] = Math.round((b * srcA + sOut[idx + 2] * dstA * (1 - srcA)) / outA);
        sOut[idx + 3] = Math.round(outA * 255);
      }
    }
    // Render larger, heroic single specimen
    const hw = 135;
    const isoY = 80;
    const bH = 100;
    const cX = 400;
    const cY = 240;

    // Shadow
    const shadowY = cY + bH + isoY * 0.4;
    for (let y = Math.round(shadowY - isoY); y < Math.round(shadowY + isoY * 1.6); y++) {
      for (let x = Math.round(cX - hw * 1.6); x < Math.round(cX + hw * 1.6); x++) {
        const dx = (x - cX) / (hw * 1.4);
        const dy = (y - shadowY) / (isoY * 0.9);
        const dist = dx * dx + dy * dy;
        if (dist < 1.0) {
          const falloff = Math.pow(1.0 - dist, 1.8);
          sSet(x, y, 12, 14, 16, Math.round(falloff * 115));
        }
      }
    }

    // Left vertical
    for (let y = 0; y < bH; y++) {
      for (let x = 0; x < hw; x++) {
        const px = Math.round(cX - hw + x);
        const py = Math.round(cY + (x * isoY / hw) + y);
        const tx = Math.floor((x / hw) * 440) % 450;
        const ty = Math.floor((y / bH) * 440) % 450;
        const tIdx = (ty * 450 + tx) * 3;
        sSet(px, py,
          Math.min(255, Math.round(texture.data[tIdx] * options.leftBrightness)),
          Math.min(255, Math.round(texture.data[tIdx + 1] * options.leftBrightness)),
          Math.min(255, Math.round(texture.data[tIdx + 2] * options.leftBrightness))
        );
      }
    }
    // Right vertical
    for (let y = 0; y < bH; y++) {
      for (let x = 0; x < hw; x++) {
        const px = Math.round(cX + x);
        const py = Math.round(cY + isoY - (x * isoY / hw) + y);
        const tx = Math.floor((x / hw) * 440) % 450;
        const ty = Math.floor((y / bH) * 440) % 450;
        const tIdx = (ty * 450 + tx) * 3;
        sSet(px, py,
          Math.min(255, Math.round(texture.data[tIdx] * options.rightBrightness)),
          Math.min(255, Math.round(texture.data[tIdx + 1] * options.rightBrightness)),
          Math.min(255, Math.round(texture.data[tIdx + 2] * options.rightBrightness))
        );
      }
    }
    // Top
    for (let ty = -isoY; ty <= isoY; ty++) {
      for (let tx = -hw; tx <= hw; tx++) {
        if (Math.abs(tx / hw) + Math.abs(ty / isoY) <= 1.0) {
          const px = Math.round(cX + tx);
          const py = Math.round(cY + ty);
          const texX = Math.floor(((tx + hw) / (hw * 2)) * 440) % 450;
          const texY = Math.floor(((ty + isoY) / (isoY * 2)) * 440) % 450;
          const tIdx = (texY * 450 + texX) * 3;
          let m = options.topBrightness;
          if (options.specular) {
            const sd = Math.abs((tx / hw) * 0.8 + (ty / isoY) * 0.6);
            if (sd < 0.25) m += Math.pow(1 - sd / 0.25, 2) * options.specular;
          }
          sSet(px, py,
            Math.min(255, Math.round(texture.data[tIdx] * m)),
            Math.min(255, Math.round(texture.data[tIdx + 1] * m)),
            Math.min(255, Math.round(texture.data[tIdx + 2] * m))
          );
        }
      }
    }
    const singleOut = path.join(OUTPUT_DIR, `material_${name}.webp`);
    await sharp(sOut, { raw: { width: 800, height: 600, channels: 4 } })
      .webp({ quality: 95, effort: 6 })
      .toFile(singleOut);
    console.log(`✓ material_${name}.webp created`);
  }

  await generateSingleSpecimen('travertine', travImg, { topBrightness: 1.12, leftBrightness: 0.76, rightBrightness: 0.90 });
  await generateSingleSpecimen('bronze', bronzeImg, { topBrightness: 1.25, leftBrightness: 0.70, rightBrightness: 0.95, specular: 0.6 });
  await generateSingleSpecimen('oak', oakImg, { topBrightness: 1.10, leftBrightness: 0.72, rightBrightness: 0.88 });
}

/**
 * Generate Scene 6: Photorealistic Sculptural Pavilion Model
 * Cleanly isolates the architectural pavilion, canopy, lantern core, and reflecting pool base on transparent alpha.
 */
async function generateScene6Pavilion() {
  const outputPath = path.join(OUTPUT_DIR, 'scene_6.webp');
  console.log('Generating Scene 6 (Sculptural Pavilion Model)...');

  const { data, info } = await sharp('public/media/atelier/closing-architecture/poster.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const out = Buffer.alloc(w * h * 4);

  // In closing-architecture poster (1280x720):
  // Sky is dusk blue in top half: B > R + 25, B > 140, G > 110
  // Pavilion is central structure with warm golden interior lighting, concrete roof, thin columns, and reflecting pool
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3;
      const dIdx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Sky detection:
      // High blue, low red in the upper sky region
      const isSky = (y < 460) && (b > r + 22 && b > 135 && g > 105);

      // Vignette outer edges so the pavilion model is cleanly contained
      const dx = (x - 640) / 480;
      const dy = (y - 380) / 300;
      const radialDist = dx * dx + dy * dy;

      if (isSky || radialDist > 1.0) {
        if (radialDist <= 1.1 && !isSky) {
          // Soft outer edge falloff
          const fade = Math.pow((1.1 - radialDist) / 0.1, 1.5);
          out[dIdx] = r; out[dIdx + 1] = g; out[dIdx + 2] = b;
          out[dIdx + 3] = Math.round(fade * 255);
        } else {
          out[dIdx] = 0; out[dIdx + 1] = 0; out[dIdx + 2] = 0; out[dIdx + 3] = 0;
        }
      } else {
        out[dIdx] = r;
        out[dIdx + 1] = g;
        out[dIdx + 2] = b;
        out[dIdx + 3] = 255;
      }
    }
  }

  // Crop around pavilion model and resize to 800x600 contain
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: 160, top: 100, width: 960, height: 560 })
    .resize(800, 600, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  console.log(`✓ scene_6.webp created: ${meta.width}x${meta.height}, channels=${meta.channels}, alpha=${meta.hasAlpha}`);
}

async function main() {
  console.log('=== ATELIER: GENERATING PHOTOREALISTIC TRANSPARENT ASSETS ===');

  console.log('1. Scene 1 (Hero Contemporary Luxury Villa)...');
  await processStudioRender(
    path.join(ARTIFACT_DIR, 'villa_model_hero_1791555963724.jpg'),
    path.join(OUTPUT_DIR, 'scene_1.webp'),
    { threshold: 232, shadowThreshold: 215, shadowMaxAlpha: 130 }
  );

  console.log('2. Scene 2 (Philosophy Colonnade Detail)...');
  await processStudioRender(
    path.join(ARTIFACT_DIR, 'colonnade_light_shadow_1791555988369.jpg'),
    path.join(OUTPUT_DIR, 'scene_2.webp'),
    { threshold: 235, shadowThreshold: 220, shadowMaxAlpha: 140 }
  );

  console.log('3. Scene 3 (Featured Coastal Residence)...');
  await processStudioRender(
    path.join(ARTIFACT_DIR, 'coastal_villa_model_1791556016941.jpg'),
    path.join(OUTPUT_DIR, 'scene_3.webp'),
    { threshold: 228, shadowThreshold: 210, shadowMaxAlpha: 130 }
  );

  await generateScene4Interior();
  await generateScene5Materials();
  await generateScene6Pavilion();

  console.log('=== ALL 6 PHOTOREALISTIC ASSETS SUCCESSFULLY GENERATED ===');
}

main().catch(console.error);
