import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

interface Cake3DProps {
  isBlowing: boolean;
  candlesBlown: boolean;
  isCut: boolean;
  isCutting: boolean;
  onBlow: () => void;
  onCut: () => void;
  onCutComplete: () => void;
}

// ----------------------------------------------------
// Double-Sided Quad Layer Helper (Mathematically Exact)
// Anchored precisely between (x0, z0) and (x1, z1)
// ----------------------------------------------------
function createLayerQuad(
  x0: number, z0: number,
  x1: number, z1: number,
  y0: number, y1: number
): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array([
    // Triangle 1
    x0, y0, z0,
    x1, y0, z1,
    x1, y1, z1,
    // Triangle 2
    x0, y0, z0,
    x1, y1, z1,
    x0, y1, z0,
    // Reverse Triangles (Double-sided normals)
    x1, y0, z1,
    x0, y0, z0,
    x1, y1, z1,
    x1, y1, z1,
    x0, y0, z0,
    x0, y1, z0
  ]);
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.computeVertexNormals();
  return geom;
}

export const Cake3D: React.FC<Cake3DProps> = ({
  isBlowing,
  candlesBlown,
  isCut,
  isCutting,
  onBlow,
  onCut,
  onCutComplete
}) => {
  const cakeGroup = useRef<THREE.Group>(null);
  const sliceGroup = useRef<THREE.Group>(null);
  const knifeGroup = useRef<THREE.Group>(null);
  const flamesRef = useRef<THREE.Group>(null);
  const smokeRef = useRef<THREE.Group>(null);
  const wishHeartsRef = useRef<THREE.Group>(null);
  const windGroup = useRef<THREE.Group>(null);
  const { theme } = useTheme();

  // Animation values
  const flameScale = useRef(1);
  const sliceDistance = useRef(isCut ? 1.15 : 0);
  const cutAnimProgress = useRef(0);

  // Proportional Cake Dimensions
  const radius = 1.55;
  const height = 1.05;
  const sliceAngle = 0.68; // ~39 degrees, elegant front-facing slice

  // Cut Plane Coordinates (Exact boundary endpoints)
  const leftX = -radius * Math.sin(sliceAngle / 2);
  const leftZ = radius * Math.cos(sliceAngle / 2);
  const rightX = radius * Math.sin(sliceAngle / 2);
  const rightZ = radius * Math.cos(sliceAngle / 2);

  const yB = -height / 2; // -0.525
  const yT = height / 2;  // +0.525

  // ----------------------------------------------------
  // Photorealistic Interior Sponge & Cream Layers
  // 100% Flush, Zero Overhang, Mathematically Exact
  // ----------------------------------------------------
  const interiorLayers = useMemo(() => {
    const h1 = yB + 0.32; // Bottom vanilla sponge top
    const h2 = h1 + 0.08; // Strawberry jam compote top
    const h3 = h2 + 0.22; // Vanilla pastry cream top
    const h4 = h3 + 0.30; // Top vanilla sponge top
    const h5 = yT;        // Buttercream frosting top

    return {
      left: [
        { geom: createLayerQuad(0, 0, leftX, leftZ, yB, h1), color: '#FDE68A', rough: 0.8 },
        { geom: createLayerQuad(0, 0, leftX, leftZ, h1, h2), color: '#E11D48', rough: 0.25 },
        { geom: createLayerQuad(0, 0, leftX, leftZ, h2, h3), color: '#FFFDF7', rough: 0.35 },
        { geom: createLayerQuad(0, 0, leftX, leftZ, h3, h4), color: '#FDE68A', rough: 0.8 },
        { geom: createLayerQuad(0, 0, leftX, leftZ, h4, h5), color: '#FFF8F0', rough: 0.3 }
      ],
      right: [
        { geom: createLayerQuad(0, 0, rightX, rightZ, yB, h1), color: '#FDE68A', rough: 0.8 },
        { geom: createLayerQuad(0, 0, rightX, rightZ, h1, h2), color: '#E11D48', rough: 0.25 },
        { geom: createLayerQuad(0, 0, rightX, rightZ, h2, h3), color: '#FFFDF7', rough: 0.35 },
        { geom: createLayerQuad(0, 0, rightX, rightZ, h3, h4), color: '#FDE68A', rough: 0.8 },
        { geom: createLayerQuad(0, 0, rightX, rightZ, h4, h5), color: '#FFF8F0', rough: 0.3 }
      ]
    };
  }, [leftX, leftZ, rightX, rightZ, yB, yT]);

  // ----------------------------------------------------
  // Realistic Teardrop Candle Flame Geometry
  // ----------------------------------------------------
  const flameGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const h = 0.25;
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const r = Math.sin(t * Math.PI) * Math.pow(1 - t * 0.65, 0.75) * 0.085;
      points.push(new THREE.Vector2(r, t * h));
    }
    return new THREE.LatheGeometry(points, 16);
  }, []);

  const innerFlameGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const h = 0.15;
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const r = Math.sin(t * Math.PI) * Math.pow(1 - t * 0.65, 0.75) * 0.05;
      points.push(new THREE.Vector2(r, t * h));
    }
    return new THREE.LatheGeometry(points, 14);
  }, []);

  // ----------------------------------------------------
  // Realistic Bakery Strawberry Geometry (Lathe Curve)
  // ----------------------------------------------------
  const strawberryGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const h = 0.26;
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const r = Math.sin(t * Math.PI) * (1 - t * 0.32) * 0.13;
      points.push(new THREE.Vector2(r, (1 - t) * h));
    }
    return new THREE.LatheGeometry(points, 16);
  }, []);

  // ----------------------------------------------------
  // Cylinder Geometries for Main Cake and Wedge
  // ----------------------------------------------------
  const mainCakeGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      48,
      1,
      false,
      sliceAngle / 2,
      Math.PI * 2 - sliceAngle
    );
  }, [radius, height, sliceAngle]);

  const sliceCakeGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      24,
      1,
      false,
      -sliceAngle / 2,
      sliceAngle
    );
  }, [radius, height, sliceAngle]);

  // Perimeter Rosettes on Main Cake
  const mainRosettes = useMemo(() => {
    const list = [];
    const count = 7;
    const startA = sliceAngle / 2 + 0.28;
    const endA = Math.PI * 2 - sliceAngle / 2 - 0.28;
    const step = (endA - startA) / (count - 1);
    const rPos = radius * 0.78;

    for (let i = 0; i < count; i++) {
      const a = startA + i * step;
      list.push({
        x: rPos * Math.sin(a),
        z: rPos * Math.cos(a)
      });
    }
    return list;
  }, [sliceAngle, radius]);

  // Blueberries on Main Cake
  const blueberries = useMemo(() => {
    const list = [];
    const count = 6;
    const startA = sliceAngle / 2 + 0.46;
    const endA = Math.PI * 2 - sliceAngle / 2 - 0.46;
    const step = (endA - startA) / (count - 1);
    const rPos = radius * 0.88;

    for (let i = 0; i < count; i++) {
      const a = startA + i * step;
      list.push({
        x: rPos * Math.sin(a),
        z: rPos * Math.cos(a)
      });
    }
    return list;
  }, [sliceAngle, radius]);

  // Bottom Buttercream Pearls
  const bottomPearls = useMemo(() => {
    const list = [];
    const count = 28;
    const rPos = radius + 0.035;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      list.push({
        x: rPos * Math.sin(a),
        z: rPos * Math.cos(a)
      });
    }
    return list;
  }, [radius]);

  // Candle Coordinates
  const candleY = height / 2;
  const candleHeight = 0.62;
  const wickTopY = candleY + candleHeight + 0.07;
  const flameBaseY = wickTopY - 0.01;

  const candlePositions = useMemo(() => [
    { x: -0.42, z: -0.32 },
    { x: 0.42, z: -0.32 },
    { x: 0, z: -0.6 }
  ], []);

  // ----------------------------------------------------
  // Gentle, Graceful 3D Wind Breeze Streams (Comes Slower)
  // ----------------------------------------------------
  const windParticles = useMemo(() => {
    const list = [];
    for (let i = 0; i < 40; i++) {
      list.push({
        x: (Math.random() - 0.5) * 2.8,
        y: 0.7 + Math.random() * 0.9,
        z: 0.6 + Math.random() * 3.4,
        speed: 2.4 + Math.random() * 1.2, // Gentle, clearly visible speed!
        swirl: (Math.random() - 0.5) * 0.5,
        len: 0.5 + Math.random() * 0.55
      });
    }
    return list;
  }, []);

  // Floating gentle breeze petals carried by the wind
  const breezePetals = useMemo(() => {
    const list = [];
    for (let i = 0; i < 16; i++) {
      list.push({
        x: (Math.random() - 0.5) * 2.4,
        y: 0.8 + Math.random() * 0.7,
        z: 0.8 + Math.random() * 3.2,
        speed: 2.1 + Math.random() * 1.0,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2.5
      });
    }
    return list;
  }, []);

  // ----------------------------------------------------
  // Animation Frame Loop
  // ----------------------------------------------------
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Rotation Control:
    // When uncut and idle: gentle continuous auto-rotation
    // The moment cutting begins OR when cut: smoothly lock rotation to FRONT (0 rad)
    if (cakeGroup.current) {
      if (isCutting || isCut) {
        cakeGroup.current.rotation.y = THREE.MathUtils.lerp(
          cakeGroup.current.rotation.y,
          0,
          delta * 8.0
        );
      } else {
        cakeGroup.current.rotation.y += delta * 0.22;
      }
    }

    // --------------------------------------------------
    // Gentle 3D Wind Breeze & Flame Reaction (Slower, Visible)
    // --------------------------------------------------
    if (isBlowing) {
      // Wind particles glide in slowly and gracefully
      windParticles.forEach((p) => {
        p.z -= delta * p.speed;
        p.x += Math.sin(time * 5 + p.z * 1.5) * 0.014 + p.swirl * delta;
        p.y += Math.cos(time * 4 + p.z) * 0.008;
        if (p.z < -1.1) {
          p.z = 3.6 + Math.random() * 1.2;
        }
      });

      // Breeze petals drifting in wind
      breezePetals.forEach((bp) => {
        bp.z -= delta * bp.speed;
        bp.x += Math.sin(time * 4 + bp.z) * 0.016;
        bp.rot += delta * bp.rotSpeed;
        if (bp.z < -1.1) {
          bp.z = 3.6 + Math.random() * 1.2;
        }
      });

      // Flames lean backward smoothly in the gentle wind
      if (flamesRef.current) {
        flamesRef.current.rotation.x = THREE.MathUtils.lerp(
          flamesRef.current.rotation.x,
          -0.55,
          delta * 4.5
        );
        const flutter = 0.75 + Math.sin(time * 20) * 0.25;
        flamesRef.current.scale.set(flutter * 1.1, flutter * 0.85, flutter);
      }
    } else {
      if (flamesRef.current) {
        flamesRef.current.rotation.x = THREE.MathUtils.lerp(
          flamesRef.current.rotation.x,
          0,
          delta * 6.0
        );
      }

      // Normal flame flicker & blow-out transition
      const targetScale = candlesBlown ? 0 : 1;
      flameScale.current = THREE.MathUtils.lerp(flameScale.current, targetScale, delta * 9);

      if (flamesRef.current) {
        const flicker = candlesBlown ? 0 : 0.92 + Math.sin(time * 16) * 0.08;
        const flutterX = candlesBlown ? 0 : 0.96 + Math.cos(time * 14) * 0.05;
        flamesRef.current.scale.set(
          flameScale.current * flutterX,
          flameScale.current * flicker,
          flameScale.current * flutterX
        );
      }
    }

    // Smoke effect when blown
    if (smokeRef.current && candlesBlown) {
      smokeRef.current.children.forEach((child, i) => {
        child.position.y += delta * 0.75;
        child.scale.multiplyScalar(1 + delta * 0.35);
        if (child.position.y > 2.4) {
          child.position.y = wickTopY + i * 0.06;
          child.scale.set(0.08, 0.08, 0.08);
        }
      });
    }

    // Floating wish hearts upward when blown
    if (wishHeartsRef.current && candlesBlown) {
      wishHeartsRef.current.children.forEach((heart, i) => {
        heart.position.y += delta * (0.8 + (i % 3) * 0.25);
        heart.rotation.y += delta * 1.6;
        if (heart.position.y > 3.6) {
          heart.position.y = 1.4;
        }
      });
    }

    // --------------------------------------------------
    // Knife Cutting Animation Sequence
    // --------------------------------------------------
    if (isCutting) {
      cutAnimProgress.current += delta / 1.4;

      if (knifeGroup.current) {
        knifeGroup.current.visible = true;
        const p = cutAnimProgress.current;

        if (p < 0.2) {
          knifeGroup.current.position.set(0, 2.2, 0.45);
          knifeGroup.current.rotation.set(-0.2, 0, 0);
        } else if (p < 0.65) {
          const sliceT = (p - 0.2) / 0.45;
          const easeDown = Math.sin((sliceT * Math.PI) / 2);
          knifeGroup.current.position.set(0, 2.2 - easeDown * 1.85, 0.45);
          knifeGroup.current.rotation.set(-0.2 + easeDown * 0.2, 0, 0);
        } else if (p < 0.85) {
          const liftT = (p - 0.65) / 0.2;
          knifeGroup.current.position.set(0, 0.35 + liftT * 2.0, 0.45);
        } else {
          knifeGroup.current.visible = false;
        }
      }

      // Slice smoothly glides directly forward along +Z towards viewer
      if (cutAnimProgress.current >= 0.62) {
        const slideP = Math.min(1, (cutAnimProgress.current - 0.62) / 0.65);
        const easeSlide = 1 - Math.pow(1 - slideP, 3);
        sliceDistance.current = easeSlide * 1.15;
      }

      if (cutAnimProgress.current >= 1.0) {
        cutAnimProgress.current = 0;
        onCutComplete();
      }
    } else {
      if (knifeGroup.current) {
        knifeGroup.current.visible = false;
      }
      const targetDist = isCut ? 1.15 : 0;
      sliceDistance.current = THREE.MathUtils.lerp(sliceDistance.current, targetDist, delta * 6.0);
    }

    // Update slice group translation along +Z (directly towards camera)
    if (sliceGroup.current) {
      sliceGroup.current.position.z = sliceDistance.current;
      sliceGroup.current.position.x = 0;
    }
  });

  const handleClick = () => {
    if (!candlesBlown && !isBlowing) {
      onBlow();
    } else if (!isCut && !isCutting) {
      onCut();
    }
  };

  return (
    <group
      ref={cakeGroup}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
      position={[0, -0.15, 0]}
    >
      {/* ======================================================== */}
      {/* LUXURY PORCELAIN PEDESTAL CAKE STAND                     */}
      {/* ======================================================== */}
      <group position={[0, -height / 2 - 0.06, 0]}>
        {/* Stand Base */}
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[1.35, 1.65, 0.18, 36]} />
          <meshStandardMaterial color="#FFFDF9" roughness={0.25} metalness={0.08} />
        </mesh>
        {/* Stand Stem */}
        <mesh position={[0, -0.13, 0]}>
          <cylinderGeometry args={[0.42, 0.58, 0.24, 28]} />
          <meshStandardMaterial color="#FFFDF9" roughness={0.25} metalness={0.08} />
        </mesh>
        {/* Platter Surface */}
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <cylinderGeometry args={[2.15, 2.2, 0.08, 44]} />
          <meshStandardMaterial color="#FFFDF9" roughness={0.2} metalness={0.08} />
        </mesh>
        {/* Gold Platter Rim */}
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.16, 0.028, 16, 44]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.28} metalness={0.8} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* MAIN CAKE BODY (Whole cake minus front wedge)            */}
      {/* ======================================================== */}
      <group>
        {/* Main Cake Cylinder Shell */}
        <mesh geometry={mainCakeGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={theme.secondary || '#F8C8DC'}
            roughness={0.32}
            metalness={0.04}
          />
        </mesh>

        {/* Top Glaze Disc */}
        <mesh position={[0, height / 2 + 0.012, 0]}>
          <cylinderGeometry
            args={[
              radius * 0.985,
              radius * 0.985,
              0.022,
              36,
              1,
              false,
              sliceAngle / 2,
              Math.PI * 2 - sliceAngle
            ]}
          />
          <meshStandardMaterial color="#FFF8F0" roughness={0.22} />
        </mesh>

        {/* Left & Right Interior Layer Quads (Anchored 100% Flush) */}
        {interiorLayers.left.map((l, i) => (
          <mesh key={`main-l-${i}`} geometry={l.geom}>
            <meshStandardMaterial color={l.color} roughness={l.rough} />
          </mesh>
        ))}
        {interiorLayers.right.map((l, i) => (
          <mesh key={`main-r-${i}`} geometry={l.geom}>
            <meshStandardMaterial color={l.color} roughness={l.rough} />
          </mesh>
        ))}

        {/* Buttercream Piping Pearls around Bottom Base */}
        {bottomPearls.map((p, i) => (
          <mesh key={i} position={[p.x, -height / 2 + 0.05, p.z]}>
            <sphereGeometry args={[0.068, 12, 12]} />
            <meshStandardMaterial color="#FFFDF7" roughness={0.25} />
          </mesh>
        ))}

        {/* Cream Rosettes & Strawberries on Main Cake */}
        {mainRosettes.map((p, i) => (
          <group key={i} position={[p.x, height / 2 + 0.025, p.z]}>
            <mesh position={[0, 0.05, 0]}>
              <sphereGeometry args={[0.15, 14, 14]} />
              <meshStandardMaterial color="#FFFDF7" roughness={0.22} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <coneGeometry args={[0.1, 0.14, 12]} />
              <meshStandardMaterial color="#FFFDF7" roughness={0.22} />
            </mesh>

            {/* Fresh Glistening Strawberry (Pointing UP) */}
            <group position={[0, 0.25, 0]}>
              <mesh geometry={strawberryGeometry} castShadow>
                <meshStandardMaterial color="#D32F2F" roughness={0.2} metalness={0.08} />
              </mesh>
              {/* Star-shaped Green Calyx Crown */}
              {[0, 1, 2, 3, 4].map((leaf) => (
                <mesh
                  key={leaf}
                  position={[0, 0.25, 0]}
                  rotation={[0.35, (leaf / 5) * Math.PI * 2, 0]}
                >
                  <coneGeometry args={[0.032, 0.085, 5]} />
                  <meshStandardMaterial color="#2E7D32" roughness={0.4} />
                </mesh>
              ))}
            </group>
          </group>
        ))}

        {/* Fresh Blueberries nestled on rim */}
        {blueberries.map((b, i) => (
          <mesh key={i} position={[b.x, height / 2 + 0.05, b.z]}>
            <sphereGeometry args={[0.068, 12, 12]} />
            <meshStandardMaterial color="#283593" roughness={0.25} metalness={0.1} />
          </mesh>
        ))}

        {/* Centerpiece Strawberry */}
        <group position={[0, height / 2 + 0.035, -0.15]}>
          <mesh position={[0, 0.07, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#FFFDF7" roughness={0.22} />
          </mesh>
          <group position={[0, 0.29, 0]} scale={[1.15, 1.15, 1.15]}>
            <mesh geometry={strawberryGeometry} castShadow>
              <meshStandardMaterial color="#D32F2F" roughness={0.2} metalness={0.08} />
            </mesh>
            {[0, 1, 2, 3, 4].map((leaf) => (
              <mesh
                key={leaf}
                position={[0, 0.25, 0]}
                rotation={[0.35, (leaf / 5) * Math.PI * 2, 0]}
              >
                <coneGeometry args={[0.035, 0.085, 5]} />
                <meshStandardMaterial color="#2E7D32" roughness={0.4} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 3 CANDLES & PERFECT TEARDROP FLAMES                      */}
      {/* ======================================================== */}
      {candlePositions.map((c, idx) => (
        <group key={idx} position={[c.x, candleY, c.z]}>
          {/* Candle Body */}
          <mesh position={[0, candleHeight / 2, 0]}>
            <cylinderGeometry args={[0.045, 0.045, candleHeight, 20]} />
            <meshStandardMaterial color={theme.primary} roughness={0.25} />
          </mesh>

          {/* White Spiral Candle Stripes */}
          {[0, 1, 2].map((s) => (
            <mesh key={s} position={[0, 0.14 + s * 0.17, 0]} rotation={[0.25, s * 1.6, 0]}>
              <torusGeometry args={[0.047, 0.011, 8, 16]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
            </mesh>
          ))}

          {/* Cotton Wick */}
          <mesh position={[0, candleHeight + 0.035, 0]}>
            <cylinderGeometry args={[0.011, 0.011, 0.07, 8]} />
            <meshStandardMaterial color="#212121" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Glowing Flickering Teardrop Flames */}
      <group ref={flamesRef}>
        {candlePositions.map((c, idx) => (
          <group key={idx} position={[c.x, flameBaseY, c.z]}>
            <mesh geometry={flameGeometry} position={[0, 0, 0]}>
              <meshStandardMaterial
                color="#FF9800"
                emissive="#FF5722"
                emissiveIntensity={2.2}
                transparent
                opacity={0.88}
                roughness={0.1}
              />
            </mesh>
            <mesh geometry={innerFlameGeometry} position={[0, 0.01, 0]}>
              <meshStandardMaterial
                color="#FFFFE0"
                emissive="#FFF59D"
                emissiveIntensity={3.2}
                roughness={0.05}
              />
            </mesh>
            <pointLight
              position={[0, 0.12, 0]}
              distance={2.4}
              intensity={candlesBlown ? 0 : 1.3}
              color="#FFB300"
            />
          </group>
        ))}
      </group>

      {/* Smoke Wisps (When blown out) */}
      <group ref={smokeRef} visible={candlesBlown}>
        {candlePositions.map((c, idx) => (
          <mesh key={idx} position={[c.x, wickTopY, c.z]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#E0E0E0" transparent opacity={0.4} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Floating Wish Hearts (When blown out) */}
      <group ref={wishHeartsRef} visible={candlesBlown}>
        {[...Array(6)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i * 1.3) * 0.7,
              1.5 + i * 0.26,
              Math.cos(i * 1.3) * 0.7
            ]}
          >
            <octahedronGeometry args={[0.11, 0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? theme.primary : '#FFD700'}
              emissive={i % 2 === 0 ? theme.secondary : '#FFA000'}
              emissiveIntensity={0.85}
            />
          </mesh>
        ))}
      </group>

      {/* ======================================================== */}
      {/* 3D GENTLE WIND BREEZE & PETALS (Comes Slower & Visibly)  */}
      {/* ======================================================== */}
      <group ref={windGroup} visible={isBlowing}>
        {/* Soft glowing air stream ribbons */}
        {windParticles.map((wp, i) => (
          <mesh
            key={`wind-${i}`}
            position={[wp.x, wp.y, wp.z]}
            rotation={[Math.PI / 2, 0, wp.swirl]}
          >
            <cylinderGeometry args={[0.016, 0.007, wp.len, 8]} />
            <meshStandardMaterial
              color="#E0F7FA"
              emissive="#B2EBF2"
              emissiveIntensity={1.3}
              transparent
              opacity={0.6}
              roughness={0.1}
            />
          </mesh>
        ))}

        {/* Floating breeze cherry petals drifting in the wind */}
        {breezePetals.map((bp, i) => (
          <mesh
            key={`petal-${i}`}
            position={[bp.x, bp.y, bp.z]}
            rotation={[bp.rot, bp.rot * 0.5, 0]}
          >
            <coneGeometry args={[0.05, 0.12, 5]} />
            <meshStandardMaterial
              color="#FFD1DC"
              emissive="#F8C8DC"
              emissiveIntensity={0.5}
              roughness={0.3}
              transparent
              opacity={0.85}
            />
          </mesh>
        ))}
      </group>

      {/* ======================================================== */}
      {/* THE SLICED CAKE WEDGE (Slides FORWARD directly on +Z)    */}
      {/* 100% Solid, Perfectly Centered, Mouth-Watering Layers    */}
      {/* ======================================================== */}
      <group ref={sliceGroup} position={[0, 0, isCut ? 1.15 : 0]}>
        {/* Slice Outer Cylinder Arc */}
        <mesh geometry={sliceCakeGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={theme.secondary || '#F8C8DC'}
            roughness={0.32}
            metalness={0.04}
          />
        </mesh>

        {/* Slice Top Glaze */}
        <mesh position={[0, height / 2 + 0.012, 0]}>
          <cylinderGeometry
            args={[
              radius * 0.985,
              radius * 0.985,
              0.022,
              20,
              1,
              false,
              -sliceAngle / 2,
              sliceAngle
            ]}
          />
          <meshStandardMaterial color="#FFF8F0" roughness={0.22} />
        </mesh>

        {/* Left & Right Interior Layer Quads on Slice (Anchored 100% Flush) */}
        {interiorLayers.left.map((l, i) => (
          <mesh key={`slice-l-${i}`} geometry={l.geom}>
            <meshStandardMaterial color={l.color} roughness={l.rough} />
          </mesh>
        ))}
        {interiorLayers.right.map((l, i) => (
          <mesh key={`slice-r-${i}`} geometry={l.geom}>
            <meshStandardMaterial color={l.color} roughness={l.rough} />
          </mesh>
        ))}

        {/* Whipped Cream Rosette & Strawberry Centered on Slice */}
        <group position={[0, height / 2 + 0.025, radius * 0.72]}>
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.15, 14, 14]} />
            <meshStandardMaterial color="#FFFDF7" roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <coneGeometry args={[0.1, 0.14, 12]} />
            <meshStandardMaterial color="#FFFDF7" roughness={0.22} />
          </mesh>

          {/* Strawberry on Slice */}
          <group position={[0, 0.25, 0]}>
            <mesh geometry={strawberryGeometry} castShadow>
              <meshStandardMaterial color="#D32F2F" roughness={0.2} metalness={0.08} />
            </mesh>
            {[0, 1, 2, 3, 4].map((leaf) => (
              <mesh
                key={leaf}
                position={[0, 0.25, 0]}
                rotation={[0.35, (leaf / 5) * Math.PI * 2, 0]}
              >
                <coneGeometry args={[0.032, 0.085, 5]} />
                <meshStandardMaterial color="#2E7D32" roughness={0.4} />
              </mesh>
            ))}
          </group>

          {/* Blueberries framing the slice strawberry */}
          <mesh position={[-0.2, -0.01, 0.04]}>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color="#283593" roughness={0.25} metalness={0.1} />
          </mesh>
          <mesh position={[0.2, -0.01, 0.04]}>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color="#283593" roughness={0.25} metalness={0.1} />
          </mesh>
        </group>

        {/* Slice Porcelain Dessert Plate (Served right in front) */}
        {isCut && (
          <group position={[0, -height / 2 - 0.02, radius * 0.5]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.98, 1.05, 0.035, 32]} />
              <meshStandardMaterial color="#FFFDF9" roughness={0.2} metalness={0.08} />
            </mesh>
            <mesh position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.99, 0.018, 12, 32]} />
              <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.75} />
            </mesh>

            {/* Silver Dessert Fork beside plate */}
            <group position={[0.82, 0.025, -0.08]} rotation={[0, 0.25, 0]}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.038, 0.014, 0.75]} />
                <meshStandardMaterial color="#E0E0E0" metalness={0.9} roughness={0.15} />
              </mesh>
              {[-0.018, 0, 0.018].map((tine, idx) => (
                <mesh key={idx} position={[tine, 0, -0.45]}>
                  <boxGeometry args={[0.009, 0.014, 0.15]} />
                  <meshStandardMaterial color="#E0E0E0" metalness={0.9} roughness={0.15} />
                </mesh>
              ))}
            </group>
          </group>
        )}
      </group>

      {/* ======================================================== */}
      {/* 3D PATISSERIE CAKE KNIFE (Appears during cutting)        */}
      {/* ======================================================== */}
      <group ref={knifeGroup} visible={false}>
        <group position={[0, 0, 0.85]} rotation={[0, 0, -Math.PI / 4]}>
          <mesh position={[0, 0.52, 0]}>
            <boxGeometry args={[0.02, 1.1, 0.2]} />
            <meshStandardMaterial color="#F0F0F0" metalness={0.95} roughness={0.12} />
          </mesh>
          <mesh position={[0, 1.12, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.07, 16]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.45, 0]}>
            <cylinderGeometry args={[0.042, 0.048, 0.56, 16]} />
            <meshStandardMaterial color={theme.primary} roughness={0.35} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
