import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Cake3D } from './Cake3D';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { Cake, Sparkles } from 'lucide-react';

interface CakeCanvasProps {
  isBlowing: boolean;
  candlesBlown: boolean;
  isCut: boolean;
  isCutting: boolean;
  onBlow: () => void;
  onCut: () => void;
  onCutComplete: () => void;
}

export const CakeCanvas: React.FC<CakeCanvasProps> = ({
  isBlowing,
  candlesBlown,
  isCut,
  isCutting,
  onBlow,
  onCut,
  onCutComplete
}) => {
  const cakeFallback = (
    <div
      onClick={!candlesBlown ? onBlow : !isCut ? onCut : undefined}
      className="flex flex-col items-center justify-center h-full cursor-pointer group select-none"
    >
      <div className="relative flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full bg-gradient-to-tr from-pastel-pink via-white to-pastel-peach text-pastel-rose shadow-glow-rose group-hover:scale-105 transition-transform">
        <Cake className="h-16 w-16" />
        {!candlesBlown && (
          <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-amber-500 animate-bounce" />
        )}
      </div>
      <span className="font-anime text-xs text-pastel-rose font-bold mt-2">
        {!candlesBlown
          ? 'Click to Blow Candles 🕯️'
          : !isCut
          ? 'Click to Cut the Cake 🎂🔪'
          : 'Sweet Slice Served 🍰💖'}
      </span>
    </div>
  );

  return (
    <div className="relative h-full w-full mx-auto cursor-pointer select-none">
      <ErrorBoundary fallback={cakeFallback}>
        <Canvas
          camera={{ position: [0, 2.3, 6.4], fov: 38 }}
          dpr={[1, 1.5]}
          className="touch-none w-full h-full"
        >
          <ambientLight intensity={0.95} color="#FFF5FA" />
          <directionalLight position={[4, 6, 4]} intensity={1.3} color="#FFF8F0" castShadow />
          <pointLight position={[-3, 3, -2]} intensity={0.6} color="#F8C8DC" />
          <pointLight position={[3, 2, 3]} intensity={0.6} color="#FFE0CC" />

          <Suspense fallback={null}>
            <Cake3D
              isBlowing={isBlowing}
              candlesBlown={candlesBlown}
              isCut={isCut}
              isCutting={isCutting}
              onBlow={onBlow}
              onCut={onCut}
              onCutComplete={onCutComplete}
            />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2.05}
            minPolarAngle={Math.PI / 4.8}
          />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};
