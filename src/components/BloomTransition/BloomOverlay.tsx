import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface BloomOverlayProps {
  isBlooming: boolean;
  onBloomComplete: () => void;
}

type FlowerType = 'peony_rose' | 'sakura' | 'lotus' | 'camellia' | 'floret';

interface FlowerParticle {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  flightArc: number;
  flightAngle: number;
  flightDelay: number;
  bloomDelay: number;
  bloomDuration: number;
  type: FlowerType;
  maxRadius: number;
  rotation: number;
  rotationSpeed: number;
  petalCount: number;
  baseColor: string;
  bodyColor: string;
  tipColor: string;
  veinColor: string;
  sepalColor: string;
  stamenColor: string;
  antherColor: string;
  centerColor: string;
  dropSpeed: number;
  swingAngle: number;
  swingSpeed: number;
  breathePhase: number;
  driftPhase: number;
  tilt: number;
  hasSpawnedPollen: boolean;
}

interface PollenParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  glowColor: string;
}

interface LoosePetal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  length: number;
  width: number;
  color: string;
  tipColor: string;
  swingAngle: number;
  swingSpeed: number;
}

interface TrailSpark {
  x: number;
  y: number;
  size: number;
  alpha: number;
  color: string;
}

// ----------------------------------------------------
// Color & Math Utilities for Botanical Shading
// ----------------------------------------------------
function parseHex(hex: string): [number, number, number] {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return [245, 160, 185];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function adjustColor(hex: string, percent: number): string {
  const [r, g, b] = parseHex(hex);
  const factor = percent / 100;
  const adj = (v: number) => {
    if (factor > 0) return Math.min(255, Math.round(v + (255 - v) * factor));
    return Math.max(0, Math.round(v + v * factor));
  };
  return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
}

function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

function blendColors(hexA: string, hexB: string, weight: number): string {
  const [r1, g1, b1] = parseHex(hexA);
  const [r2, g2, b2] = parseHex(hexB);
  const w = Math.max(0, Math.min(1, weight));
  const r = Math.round(r1 * (1 - w) + r2 * w);
  const g = Math.round(g1 * (1 - w) + g2 * w);
  const b = Math.round(b1 * (1 - w) + b2 * w);
  return `rgb(${r}, ${g}, ${b})`;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Botanical spring easing for natural petal unfolding
function easeBloom(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(1 - t, 2.7);
}

// ----------------------------------------------------
// Specialized Botanical Petal Renderers
// ----------------------------------------------------

/**
 * Draws a multi-curved Peony/Rose petal with romantic ruffled cupped contour
 */
function drawRosePetal(
  ctx: CanvasRenderingContext2D,
  len: number,
  wid: number,
  curl: number,
  baseColor: string,
  bodyColor: string,
  tipColor: string,
  veinColor: string
) {
  if (len < 1.5 || wid < 1.5) return;

  ctx.save();
  const grad = ctx.createLinearGradient(0, 0, 0, len);
  grad.addColorStop(0, baseColor);
  grad.addColorStop(0.38, bodyColor);
  grad.addColorStop(0.85, tipColor);
  grad.addColorStop(1, '#FFFDF8');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);

  // Left curve with natural shoulder
  ctx.bezierCurveTo(
    -wid * 0.55, len * 0.22,
    -wid * 1.05, len * 0.62,
    -wid * 0.62, len * 0.94
  );

  // Gentle wavy heart crest with curl reflex
  ctx.bezierCurveTo(
    -wid * 0.28, len * (1.02 + curl * 0.04),
    -wid * 0.08, len * (0.97 - curl * 0.03),
    0, len * (0.98 - curl * 0.02)
  );
  ctx.bezierCurveTo(
    wid * 0.08, len * (0.97 - curl * 0.03),
    wid * 0.28, len * (1.02 + curl * 0.04),
    wid * 0.62, len * 0.94
  );

  // Right curve
  ctx.bezierCurveTo(
    wid * 1.05, len * 0.62,
    wid * 0.55, len * 0.22,
    0, 0
  );
  ctx.closePath();
  ctx.fill();

  // Subtle central petal vein
  ctx.beginPath();
  ctx.moveTo(0, len * 0.12);
  ctx.quadraticCurveTo(0, len * 0.5, 0, len * 0.84);
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = Math.max(0.6, len * 0.015);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a Sakura (Cherry Blossom) petal with the iconic cleft/notch
 */
function drawSakuraPetal(
  ctx: CanvasRenderingContext2D,
  len: number,
  wid: number,
  baseColor: string,
  bodyColor: string,
  tipColor: string,
  veinColor: string
) {
  if (len < 1.5 || wid < 1.5) return;

  ctx.save();
  const grad = ctx.createLinearGradient(0, 0, 0, len);
  grad.addColorStop(0, baseColor);
  grad.addColorStop(0.48, bodyColor);
  grad.addColorStop(0.88, tipColor);
  grad.addColorStop(1, '#FFFFFF');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);

  // Left contour
  ctx.bezierCurveTo(
    -wid * 0.52, len * 0.28,
    -wid * 0.94, len * 0.68,
    -wid * 0.44, len * 0.97
  );

  // Iconic Sakura V-notch at apex
  ctx.bezierCurveTo(
    -wid * 0.24, len * 1.04,
    -wid * 0.07, len * 0.90,
    0, len * 0.92
  );
  ctx.bezierCurveTo(
    wid * 0.07, len * 0.90,
    wid * 0.24, len * 1.04,
    wid * 0.44, len * 0.97
  );

  // Right contour
  ctx.bezierCurveTo(
    wid * 0.94, len * 0.68,
    wid * 0.52, len * 0.28,
    0, 0
  );
  ctx.closePath();
  ctx.fill();

  // 3 Delicate radiating veins
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = Math.max(0.6, len * 0.014);

  // Center spine
  ctx.beginPath();
  ctx.moveTo(0, len * 0.14);
  ctx.quadraticCurveTo(0, len * 0.52, 0, len * 0.85);
  ctx.stroke();

  // Left & right delicate branches
  ctx.beginPath();
  ctx.moveTo(0, len * 0.24);
  ctx.quadraticCurveTo(-wid * 0.2, len * 0.5, -wid * 0.22, len * 0.76);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, len * 0.24);
  ctx.quadraticCurveTo(wid * 0.2, len * 0.5, wid * 0.22, len * 0.76);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a Lotus / Water Lily petal with tapered pointed elegance
 */
function drawLotusPetal(
  ctx: CanvasRenderingContext2D,
  len: number,
  wid: number,
  baseColor: string,
  bodyColor: string,
  tipColor: string,
  veinColor: string
) {
  if (len < 1.5 || wid < 1.5) return;

  ctx.save();
  const grad = ctx.createLinearGradient(0, 0, 0, len);
  grad.addColorStop(0, baseColor);
  grad.addColorStop(0.55, bodyColor);
  grad.addColorStop(0.92, tipColor);
  grad.addColorStop(1, '#FFF');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-wid * 0.68, len * 0.32, -wid * 0.82, len * 0.72, 0, len * 1.05);
  ctx.bezierCurveTo(wid * 0.82, len * 0.72, wid * 0.68, len * 0.32, 0, 0);
  ctx.closePath();
  ctx.fill();

  // Central spine
  ctx.beginPath();
  ctx.moveTo(0, len * 0.12);
  ctx.lineTo(0, len * 0.94);
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = Math.max(0.6, len * 0.015);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a Camellia / Ranunculus petal with silky rounded cupped shell
 */
function drawCamelliaPetal(
  ctx: CanvasRenderingContext2D,
  len: number,
  wid: number,
  baseColor: string,
  bodyColor: string,
  tipColor: string,
  veinColor: string
) {
  if (len < 1.5 || wid < 1.5) return;

  ctx.save();
  const grad = ctx.createLinearGradient(0, 0, 0, len);
  grad.addColorStop(0, baseColor);
  grad.addColorStop(0.42, bodyColor);
  grad.addColorStop(0.86, tipColor);
  grad.addColorStop(1, '#FFFFFF');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-wid * 0.65, len * 0.22, -wid * 1.0, len * 0.58, -wid * 0.48, len * 0.98);
  ctx.bezierCurveTo(-wid * 0.2, len * 1.03, wid * 0.2, len * 1.03, wid * 0.48, len * 0.98);
  ctx.bezierCurveTo(wid * 1.0, len * 0.58, wid * 0.65, len * 0.22, 0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, len * 0.15);
  ctx.quadraticCurveTo(0, len * 0.5, 0, len * 0.86);
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = Math.max(0.6, len * 0.015);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws the closed botanical bud during flight before blooming begins
 */
function drawBud(
  ctx: CanvasRenderingContext2D,
  radius: number,
  petalColor: string,
  sepalColor: string
) {
  ctx.save();

  // Tender petal tip peeking from the top of the calyx
  ctx.beginPath();
  ctx.ellipse(0, -radius * 0.38, radius * 0.26, radius * 0.42, 0, 0, Math.PI * 2);
  ctx.fillStyle = petalColor;
  ctx.fill();

  // 4 Calyx sepals hugging the closed bud tightly
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-radius * 0.22, -radius * 0.34, 0, -radius * 0.62);
    ctx.quadraticCurveTo(radius * 0.22, -radius * 0.34, 0, 0);
    ctx.fillStyle = sepalColor;
    ctx.fill();
    ctx.restore();
  }

  // Round stem base / receptacle
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = sepalColor;
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the backing sepals (calyx leaves) that peel backward as the flower blooms
 */
function drawSepals(
  ctx: CanvasRenderingContext2D,
  radius: number,
  sepalProgress: number,
  sepalColor: string
) {
  if (sepalProgress <= 0.05) return;

  const count = 5;
  const sepLen = radius * 0.45 * sepalProgress;
  const sepWid = radius * 0.16 * sepalProgress;

  ctx.save();
  for (let s = 0; s < count; s++) {
    const angle = (s / count) * Math.PI * 2 + 0.35;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-sepWid, sepLen * 0.5, 0, sepLen);
    ctx.quadraticCurveTo(sepWid, sepLen * 0.5, 0, 0);
    ctx.fillStyle = sepalColor;
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Draws the central pistil disc and sprouting golden stamen filaments with pollen heads
 */
function drawStamens(
  ctx: CanvasRenderingContext2D,
  radius: number,
  stamenProgress: number,
  stamenCount: number,
  stamenColor: string,
  antherColor: string,
  centerColor: string
) {
  if (stamenProgress <= 0.05) return;

  ctx.save();

  // Radiating delicate stamen filaments
  const filLenBase = radius * 0.34 * stamenProgress;
  const antherR = Math.max(1.2, radius * 0.045 * stamenProgress);

  for (let s = 0; s < stamenCount; s++) {
    const angle = (s / stamenCount) * Math.PI * 2;
    // Slight organic length variation per stamen
    const filLen = filLenBase * (0.85 + Math.sin(s * 4.3) * 0.15);
    const tipX = Math.cos(angle) * filLen;
    const tipY = Math.sin(angle) * filLen;
    const midAngle = angle + (s % 2 === 0 ? 0.15 : -0.15);
    const midX = Math.cos(midAngle) * (filLen * 0.55);
    const midY = Math.sin(midAngle) * (filLen * 0.55);

    // Stamen stalk
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.strokeStyle = stamenColor;
    ctx.lineWidth = Math.max(0.7, radius * 0.016);
    ctx.stroke();

    // Golden glowing anther (pollen head)
    ctx.beginPath();
    ctx.arc(tipX, tipY, antherR, 0, Math.PI * 2);
    ctx.fillStyle = antherColor;
    ctx.fill();

    // Tiny specular pollen highlight
    ctx.beginPath();
    ctx.arc(tipX - antherR * 0.3, tipY - antherR * 0.3, antherR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }

  // Central seedpod / pistil button
  const coreR = radius * 0.18 * stamenProgress;
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
  coreGrad.addColorStop(0, '#FFF9E6');
  coreGrad.addColorStop(0.6, centerColor);
  coreGrad.addColorStop(1, adjustColor(centerColor, -25));

  ctx.beginPath();
  ctx.arc(0, 0, coreR, 0, Math.PI * 2);
  ctx.fillStyle = coreGrad;
  ctx.fill();

  ctx.restore();
}

// ----------------------------------------------------
// Main BloomOverlay Component
// ----------------------------------------------------
export const BloomOverlay: React.FC<BloomOverlayProps> = ({ isBlooming, onBloomComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!isBlooming) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // Retina / High-DPI support for crystal-sharp botanical petals
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height * 0.48; // Near gift box position

    const isMobile = width < 768;
    const flowerCount = isMobile ? 75 : 135;

    const rawPetalColors =
      theme.petalColors.length > 0
        ? theme.petalColors
        : ['#FFD1DC', '#F8C8DC', '#FFAEC9', '#FFB7C5', '#FFE4E1'];

    // Pre-calculate natural botanic foliage calyx green
    const naturalSepalGreen = blendColors(theme.foliageColor || '#88D49E', '#6B9058', 0.65);

    const flowerSpecies: FlowerType[] = [
      'peony_rose',
      'peony_rose',
      'sakura',
      'sakura',
      'camellia',
      'lotus',
      'floret'
    ];

    const flowers: FlowerParticle[] = [];
    const pollenList: PollenParticle[] = [];
    const loosePetals: LoosePetal[] = [];
    const trailSparks: TrailSpark[] = [];

    // Distribute flowers across the screen using jittered-grid for complete coverage
    const gridCols = Math.ceil(Math.sqrt(flowerCount * (width / height)));
    const gridRows = Math.ceil(flowerCount / gridCols);
    const cellW = width / gridCols;
    const cellH = height / gridRows;

    for (let i = 0; i < flowerCount; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);

      const targetX = (col + 0.5) * cellW + (Math.random() - 0.5) * cellW * 0.85;
      const targetY = (row + 0.5) * cellH + (Math.random() - 0.5) * cellH * 0.85;

      const fType = flowerSpecies[i % flowerSpecies.length];

      // Tier sizes: Large hero flowers, medium blossoms, and accent florets
      let maxRadius: number;
      if (fType === 'floret') {
        maxRadius = Math.random() * 8 + (isMobile ? 18 : 24);
      } else if (i % 3 === 0) {
        maxRadius = Math.random() * 14 + (isMobile ? 38 : 52); // Hero flower
      } else {
        maxRadius = Math.random() * 12 + (isMobile ? 28 : 38); // Medium flower
      }

      const mainColor = rawPetalColors[i % rawPetalColors.length];
      const baseCol = adjustColor(mainColor, -32); // Deep rich shadow at petal claw
      const bodyCol = mainColor;
      const tipCol = adjustColor(mainColor, 35); // Luminous pastel highlight at rim
      const veinCol = hexToRgba(adjustColor(mainColor, -25), 0.28);
      const stamenCol = '#FFF7D6';
      const antherCol = '#FFB800';

      const flightAngle = Math.atan2(targetY - centerY, targetX - centerX);
      const dist = Math.hypot(targetX - centerX, targetY - centerY);

      flowers.push({
        x: centerX,
        y: centerY,
        startX: centerX + (Math.random() - 0.5) * 30,
        startY: centerY + (Math.random() - 0.5) * 30,
        targetX,
        targetY,
        flightArc: (Math.random() - 0.5) * Math.min(120, dist * 0.35),
        flightAngle: flightAngle + Math.PI / 2,
        flightDelay: Math.random() * 220,
        // Bloom delay creates a magical cascading wave of blooming across the screen
        bloomDelay: Math.random() * 380,
        bloomDuration: Math.random() * 400 + 1400,
        type: fType,
        maxRadius,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.035,
        petalCount: fType === 'sakura' ? 5 : fType === 'lotus' ? 8 : Math.random() > 0.5 ? 6 : 7,
        baseColor: baseCol,
        bodyColor: bodyCol,
        tipColor: tipCol,
        veinColor: veinCol,
        sepalColor: naturalSepalGreen,
        stamenColor: stamenCol,
        antherColor: antherCol,
        centerColor: theme.primary,
        dropSpeed: Math.random() * 5 + 8,
        swingAngle: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.05 + 0.025,
        breathePhase: Math.random() * Math.PI * 2,
        driftPhase: Math.random() * Math.PI * 2,
        tilt: 0,
        hasSpawnedPollen: false
      });
    }

    // ----------------------------------------------------
    // Animation Timeline Landmarks (Enhanced Real Bloom)
    // ----------------------------------------------------
    const startTime = performance.now();
    const SPREAD_DURATION = 1050; // Flight of closed buds from center across screen
    const BLOOM_START = 800; // Blooming begins as buds arrive at their coordinates
    const BLOOM_DURATION = 2100; // Real botanical layer-by-layer unfolding
    const GLORY_DURATION = 1200; // Screen-wide living blooming garden, breathing & pollen
    const DROP_START = SPREAD_DURATION + BLOOM_DURATION + GLORY_DURATION; // ~4350ms
    const DROP_DURATION = 1650; // Waterfall cascade downward off screen
    const TOTAL_DURATION = DROP_START + DROP_DURATION; // ~6000ms

    let loosePetalsSpawned = false;

    // ----------------------------------------------------
    // Individual Flower Rendering with Botanical Blooming
    // ----------------------------------------------------
    const renderFlower = (
      f: FlowerParticle,
      flightProgress: number,
      bloomProgress: number,
      alpha: number,
      currentTime: number
    ) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      // Living garden subtle breathing wave
      const breathe = bloomProgress >= 0.95
        ? 1 + Math.sin(currentTime * 0.003 + f.breathePhase) * 0.035
        : 1;

      // STAGE 1: Closed Bud during flight
      if (bloomProgress < 0.06) {
        const budRadius = f.maxRadius * (0.24 + 0.12 * flightProgress);
        drawBud(ctx, budRadius, f.bodyColor, f.sepalColor);
        ctx.restore();
        return;
      }

      // STAGE 2 & 3: REAL BOTANICAL BLOOMING (Layers unfurl sequentially)
      const bEased = easeBloom(bloomProgress);
      const curRadius = f.maxRadius * (0.35 + 0.65 * bEased) * breathe;

      // 1. Backing Calyx Sepals (peel backward and tuck under petals)
      const sepalProg = clamp((bloomProgress - 0.04) / 0.45, 0, 1);
      drawSepals(ctx, curRadius, sepalProg, f.sepalColor);

      // 2. Petal Layers by Species
      if (f.type === 'peony_rose') {
        // TIER 1: Large outer guard petals (open first, 0.05 -> 0.68)
        const outerP = clamp((bloomProgress - 0.05) / 0.65, 0, 1);
        if (outerP > 0) {
          const eOuter = easeBloom(outerP);
          const outerLen = curRadius * (0.4 + 0.6 * eOuter);
          const outerWid = curRadius * 0.52 * (0.35 + 0.65 * eOuter);
          const curl = 1 - eOuter;

          for (let p = 0; p < f.petalCount; p++) {
            const angle = (p / f.petalCount) * Math.PI * 2;
            ctx.save();
            ctx.rotate(angle);
            drawRosePetal(ctx, outerLen, outerWid, curl, f.baseColor, f.bodyColor, f.tipColor, f.veinColor);
            ctx.restore();
          }
        }

        // TIER 2: Middle petals (interleaved offset, open 0.22 -> 0.82)
        const midP = clamp((bloomProgress - 0.22) / 0.62, 0, 1);
        if (midP > 0) {
          const eMid = easeBloom(midP);
          const midLen = curRadius * 0.82 * (0.35 + 0.65 * eMid);
          const midWid = curRadius * 0.46 * (0.35 + 0.65 * eMid);
          const curl = 1 - eMid;
          const offsetAngle = Math.PI / f.petalCount;

          for (let p = 0; p < f.petalCount; p++) {
            const angle = (p / f.petalCount) * Math.PI * 2 + offsetAngle;
            ctx.save();
            ctx.rotate(angle);
            drawRosePetal(ctx, midLen, midWid, curl, f.baseColor, f.bodyColor, f.tipColor, f.veinColor);
            ctx.restore();
          }
        }

        // TIER 3: Inner spiraling ruffled core (open 0.38 -> 0.96)
        const innerP = clamp((bloomProgress - 0.38) / 0.58, 0, 1);
        if (innerP > 0) {
          const eInner = easeBloom(innerP);
          const innerLen = curRadius * 0.58 * (0.3 + 0.7 * eInner);
          const innerWid = curRadius * 0.38 * (0.3 + 0.7 * eInner);
          const twist = (1 - eInner) * 0.55; // Untwisting spiral motion

          for (let p = 0; p < 5; p++) {
            const angle = (p / 5) * Math.PI * 2 + twist;
            ctx.save();
            ctx.rotate(angle);
            drawRosePetal(ctx, innerLen, innerWid, 0.4, f.baseColor, f.bodyColor, f.tipColor, f.veinColor);
            ctx.restore();
          }
        }

        // 3. Golden Stamen Crown & Pistil (sprouts 0.55 -> 1.0)
        const stamenP = clamp((bloomProgress - 0.55) / 0.45, 0, 1);
        drawStamens(ctx, curRadius, stamenP, 14, f.stamenColor, f.antherColor, f.centerColor);

      } else if (f.type === 'sakura') {
        // TIER 1: 5 Main Notched Sakura Petals (open 0.06 -> 0.75)
        const sakuraP = clamp((bloomProgress - 0.06) / 0.72, 0, 1);
        if (sakuraP > 0) {
          const eSakura = easeBloom(sakuraP);
          const sLen = curRadius * (0.35 + 0.65 * eSakura);
          const sWid = curRadius * 0.48 * (0.35 + 0.65 * eSakura);

          for (let p = 0; p < 5; p++) {
            const angle = (p / 5) * Math.PI * 2;
            ctx.save();
            ctx.rotate(angle);
            drawSakuraPetal(ctx, sLen, sWid, f.baseColor, f.bodyColor, f.tipColor, f.veinColor);
            ctx.restore();
          }
        }

        // TIER 2: 5 Miniature inner accent petals (open 0.28 -> 0.85)
        const innerP = clamp((bloomProgress - 0.28) / 0.6, 0, 1);
        if (innerP > 0) {
          const eIn = easeBloom(innerP);
          const inLen = curRadius * 0.48 * (0.3 + 0.7 * eIn);
          const inWid = curRadius * 0.28 * (0.3 + 0.7 * eIn);
          for (let p = 0; p < 5; p++) {
            const angle = (p / 5) * Math.PI * 2 + Math.PI / 5;
            ctx.save();
            ctx.rotate(angle);
            drawSakuraPetal(ctx, inLen, inWid, f.baseColor, f.bodyColor, f.tipColor, f.veinColor);
            ctx.restore();
          }
        }

        // Center crimson/magenta star pistil & 16 long radiant stamens
        const stamenP = clamp((bloomProgress - 0.5) / 0.5, 0, 1);
        drawStamens(ctx, curRadius * 1.1, stamenP, 16, f.stamenColor, f.antherColor, '#E0407B');

      } else if (f.type === 'lotus') {
        // TIER 1: Outer Star Ring (8 pointed boat petals, open 0.05 -> 0.72)
        const starP = clamp((bloomProgress - 0.05) / 0.68, 0, 1);
        if (starP > 0) {
          const eStar = easeBloom(starP);
          const starLen = curRadius * (0.38 + 0.62 * eStar);
          const starWid = curRadius * 0.38 * (0.3 + 0.7 * eStar);

          for (let p = 0; p < 8; p++) {
            const angle = (p / 8) * Math.PI * 2;
            ctx.save();
            ctx.rotate(angle);
            drawLotusPetal(ctx, starLen, starWid, f.baseColor, f.bodyColor, f.tipColor, f.veinColor);
            ctx.restore();
          }
        }

        // TIER 2: Inner Star Ring (8 pointed petals offset, open 0.24 -> 0.88)
        const inStarP = clamp((bloomProgress - 0.24) / 0.66, 0, 1);
        if (inStarP > 0) {
          const eInStar = easeBloom(inStarP);
          const inStarLen = curRadius * 0.75 * (0.32 + 0.68 * eInStar);
          const inStarWid = curRadius * 0.32 * (0.3 + 0.7 * eInStar);

          for (let p = 0; p < 8; p++) {
            const angle = (p / 8) * Math.PI * 2 + Math.PI / 8;
            ctx.save();
            ctx.rotate(angle);
            drawLotusPetal(ctx, inStarLen, inStarWid, f.baseColor, f.bodyColor, f.tipColor, f.veinColor);
            ctx.restore();
          }
        }

        // Sun-seedpod disk center
        const stamenP = clamp((bloomProgress - 0.52) / 0.48, 0, 1);
        drawStamens(ctx, curRadius, stamenP, 18, f.stamenColor, '#FFA000', '#FFD700');

      } else if (f.type === 'camellia') {
        // 3 Nested Spiral Whorls (6 + 6 + 6 cupped rounded petals)
        for (let whorl = 0; whorl < 3; whorl++) {
          const wStart = 0.08 + whorl * 0.18;
          const wProg = clamp((bloomProgress - wStart) / 0.65, 0, 1);
          if (wProg > 0) {
            const eW = easeBloom(wProg);
            const wScale = 1 - whorl * 0.22;
            const wLen = curRadius * wScale * (0.35 + 0.65 * eW);
            const wWid = curRadius * 0.48 * wScale * (0.35 + 0.65 * eW);
            const wOffset = (whorl * Math.PI) / 6;

            for (let p = 0; p < 6; p++) {
              const angle = (p / 6) * Math.PI * 2 + wOffset;
              ctx.save();
              ctx.rotate(angle);
              drawCamelliaPetal(ctx, wLen, wWid, f.baseColor, f.bodyColor, f.tipColor, f.veinColor);
              ctx.restore();
            }
          }
        }

        const stamenP = clamp((bloomProgress - 0.55) / 0.45, 0, 1);
        drawStamens(ctx, curRadius, stamenP, 15, f.stamenColor, f.antherColor, f.centerColor);

      } else {
        // Meadow Floret (5 delicate petals, opens smoothly)
        const floretP = clamp((bloomProgress - 0.08) / 0.75, 0, 1);
        if (floretP > 0) {
          const eF = easeBloom(floretP);
          const fLen = curRadius * (0.35 + 0.65 * eF);
          const fWid = curRadius * 0.44 * (0.35 + 0.65 * eF);

          for (let p = 0; p < 5; p++) {
            const angle = (p / 5) * Math.PI * 2;
            ctx.save();
            ctx.rotate(angle);
            drawCamelliaPetal(ctx, fLen, fWid, f.baseColor, f.bodyColor, f.tipColor, f.veinColor);
            ctx.restore();
          }
        }

        const stamenP = clamp((bloomProgress - 0.5) / 0.5, 0, 1);
        drawStamens(ctx, curRadius * 0.8, stamenP, 8, f.stamenColor, f.antherColor, f.centerColor);
      }

      ctx.restore();

      // Pollen Burst: Spawn floating golden pollen particles when flower reaches full bloom
      if (bloomProgress >= 0.72 && !f.hasSpawnedPollen && pollenList.length < 180) {
        f.hasSpawnedPollen = true;
        const particleCount = isMobile ? 3 : 5;
        for (let k = 0; k < particleCount; k++) {
          const pAngle = Math.random() * Math.PI * 2;
          const pSpeed = Math.random() * 0.8 + 0.3;
          pollenList.push({
            x: f.x + (Math.random() - 0.5) * 8,
            y: f.y + (Math.random() - 0.5) * 8,
            vx: Math.cos(pAngle) * pSpeed,
            vy: Math.sin(pAngle) * pSpeed - 0.4, // Slight upward thermal float
            size: Math.random() * 2 + 1.2,
            alpha: 0.9,
            maxLife: 2200,
            life: 0,
            color: '#FFF2B2',
            glowColor: '#FFD700'
          });
        }
      }
    };

    // ----------------------------------------------------
    // Main Animation Loop
    // ----------------------------------------------------
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      ctx.clearRect(0, 0, width, height);

      // Dreamy atmospheric background glow that peaks as flowers bloom
      if (elapsed < DROP_START + 800) {
        const bgAlpha = elapsed < SPREAD_DURATION
          ? (elapsed / SPREAD_DURATION) * 0.65
          : elapsed < DROP_START
            ? 0.65
            : Math.max(0, 0.65 - ((elapsed - DROP_START) / DROP_DURATION) * 0.65);

        // Radiant soft radial background glow centered on the blooming epicenter
        const bgGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, Math.max(width, height) * 0.85);
        bgGrad.addColorStop(0, hexToRgba('#FFF9ED', bgAlpha * 0.8));
        bgGrad.addColorStop(0.5, hexToRgba(theme.bgGradientFrom, bgAlpha * 0.75));
        bgGrad.addColorStop(1, hexToRgba(theme.bgGradientTo, bgAlpha * 0.6));

        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Render Trail Sparks from flying buds
      for (let sIdx = trailSparks.length - 1; sIdx >= 0; sIdx--) {
        const spark = trailSparks[sIdx];
        spark.alpha -= 0.035;
        if (spark.alpha <= 0) {
          trailSparks.splice(sIdx, 1);
        } else {
          ctx.beginPath();
          ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
          ctx.fillStyle = spark.color;
          ctx.globalAlpha = spark.alpha;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Update & Draw Flowers
      flowers.forEach((f) => {
        f.rotation += f.rotationSpeed;

        if (elapsed < SPREAD_DURATION) {
          // ==========================================
          // PHASE 1: Flight of the closed buds
          // ==========================================
          const flightT = Math.min(1, Math.max(0, (elapsed - f.flightDelay) / (SPREAD_DURATION - 150)));
          const flightEase = 1 - Math.pow(1 - flightT, 3);

          // Flight trajectory with gentle natural curved arc
          const arc = f.flightArc * Math.sin(flightEase * Math.PI);
          f.x = f.startX + (f.targetX - f.startX) * flightEase + Math.cos(f.flightAngle) * arc;
          f.y = f.startY + (f.targetY - f.startY) * flightEase + Math.sin(f.flightAngle) * arc;

          // Tiny sparkling trail behind flying buds
          if (Math.random() < 0.28 && trailSparks.length < 90) {
            trailSparks.push({
              x: f.x + (Math.random() - 0.5) * 6,
              y: f.y + (Math.random() - 0.5) * 6,
              size: Math.random() * 2 + 1,
              alpha: 0.85,
              color: '#FFEAA7'
            });
          }

          // Buds start blooming as they decelerate into place (after 800ms)
          const bloomTime = elapsed - (BLOOM_START + f.bloomDelay);
          const bloomProg = bloomTime > 0 ? clamp(bloomTime / f.bloomDuration, 0, 1) : 0;

          renderFlower(f, flightEase, bloomProg, flightEase, currentTime);

        } else if (elapsed < DROP_START) {
          // ==========================================
          // PHASE 2 & 3: REAL FLOWER BLOOMING & LIVING GLORY
          // ==========================================
          const bloomTime = elapsed - (BLOOM_START + f.bloomDelay);
          const bloomProg = clamp(bloomTime / f.bloomDuration, 0, 1);

          // Gentle ambient wind drift
          f.x = f.targetX + Math.sin(currentTime * 0.002 + f.driftPhase) * 6;
          f.y = f.targetY + Math.cos(currentTime * 0.0025 + f.driftPhase) * 6;

          renderFlower(f, 1, bloomProg, 1, currentTime);

        } else {
          // ==========================================
          // PHASE 4: Cascading Floral Waterfall Descent
          // ==========================================
          const dropElapsed = elapsed - DROP_START;
          const dropProgress = clamp(dropElapsed / DROP_DURATION, 0, 1);

          f.swingAngle += f.swingSpeed;
          f.x += Math.sin(f.swingAngle) * (2.8 + dropProgress * 3.5);
          f.y += f.dropSpeed * (1 + dropProgress * 2.2);

          const fadeAlpha = Math.max(0, 1 - Math.pow(dropProgress, 1.8));
          renderFlower(f, 1, 1, fadeAlpha, currentTime);
        }
      });

      // Spawn Loose Petals once waterfall drop starts
      if (elapsed >= DROP_START && !loosePetalsSpawned) {
        loosePetalsSpawned = true;
        const looseCount = isMobile ? 35 : 65;
        for (let lp = 0; lp < looseCount; lp++) {
          const col = rawPetalColors[lp % rawPetalColors.length];
          loosePetals.push({
            x: Math.random() * width,
            y: Math.random() * height * 0.8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 4 + 6,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            length: Math.random() * 12 + 14,
            width: Math.random() * 7 + 8,
            color: col,
            tipColor: adjustColor(col, 35),
            swingAngle: Math.random() * Math.PI * 2,
            swingSpeed: Math.random() * 0.06 + 0.03
          });
        }
      }

      // Update & Draw Loose Waterfall Petals
      if (loosePetals.length > 0) {
        const dropElapsed = elapsed - DROP_START;
        const dropProgress = clamp(dropElapsed / DROP_DURATION, 0, 1);
        const petalAlpha = Math.max(0, 1 - dropProgress);

        ctx.save();
        ctx.globalAlpha = petalAlpha;

        loosePetals.forEach((p) => {
          p.swingAngle += p.swingSpeed;
          p.x += Math.sin(p.swingAngle) * 3 + p.vx;
          p.y += p.vy * (1 + dropProgress * 1.5);
          p.rotation += p.rotationSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          const grad = ctx.createLinearGradient(0, 0, 0, p.length);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, p.tipColor);
          ctx.fillStyle = grad;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-p.width * 0.7, p.length * 0.35, -p.width * 0.8, p.length * 0.75, 0, p.length);
          ctx.bezierCurveTo(p.width * 0.8, p.length * 0.75, p.width * 0.7, p.length * 0.35, 0, 0);
          ctx.fill();

          ctx.restore();
        });
        ctx.restore();
      }

      // Update & Draw Floating Golden Pollen Particles
      for (let pIdx = pollenList.length - 1; pIdx >= 0; pIdx--) {
        const pollen = pollenList[pIdx];
        pollen.life += 16.6;
        if (pollen.life >= pollen.maxLife) {
          pollenList.splice(pIdx, 1);
          continue;
        }

        const pLifeRatio = pollen.life / pollen.maxLife;
        const curAlpha = pLifeRatio < 0.2
          ? (pLifeRatio / 0.2) * 0.85
          : Math.max(0, (1 - pLifeRatio) * 0.85);

        pollen.x += pollen.vx + Math.sin(currentTime * 0.003 + pollen.x) * 0.35;
        pollen.y += pollen.vy;

        ctx.save();
        ctx.globalAlpha = curAlpha;
        ctx.beginPath();
        ctx.arc(pollen.x, pollen.y, pollen.size, 0, Math.PI * 2);
        ctx.fillStyle = pollen.color;
        ctx.shadowColor = pollen.glowColor;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      // Next frame or finish
      if (elapsed < TOTAL_DURATION) {
        animId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
        onBloomComplete();
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isBlooming, onBloomComplete, theme]);

  if (!isBlooming) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none h-full w-full"
      style={{ touchAction: 'none' }}
    />
  );
};
