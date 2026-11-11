import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { GiftBox3D } from './GiftBox3D';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { Gift } from 'lucide-react';

interface GiftBoxCanvasProps {
  isOpen: boolean;
  onOpen: () => void;
}

export const GiftBoxCanvas: React.FC<GiftBoxCanvasProps> = ({ isOpen, onOpen }) => {
  const giftFallback = (
    <div
      onClick={onOpen}
      className="flex flex-col items-center justify-center h-full cursor-pointer group"
    >
      <div className="flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-3xl bg-gradient-to-tr from-pastel-pink to-pastel-rose text-white shadow-glow-rose group-hover:scale-105 transition-transform animate-float-medium">
        <Gift className="h-16 w-16" />
      </div>
      <span className="font-anime text-xs text-pastel-rose font-bold mt-2">
        {isOpen ? 'Surprise Unlocked ♡' : 'Click to Open Gift Box 🎁'}
      </span>
    </div>
  );

  return (
    <div className="relative h-full w-full max-w-[320px] sm:max-w-[360px] max-h-[320px] sm:max-h-[360px] mx-auto cursor-pointer select-none">
      <ErrorBoundary fallback={giftFallback}>
        <Canvas
          camera={{ position: [0, 1.4, 4.6], fov: 45 }}
          dpr={[1, 1.5]}
          className="touch-none"
        >
          <ambientLight intensity={0.9} color="#FFF1F7" />
          <directionalLight position={[5, 6, 4]} intensity={1.2} color="#FFF8F0" />
          <pointLight position={[-4, 2, -2]} intensity={0.6} color="#F8C8DC" />
          <pointLight position={[0, -2, 2]} intensity={0.4} color="#DCCBFF" />

          <Suspense fallback={null}>
            <GiftBox3D isOpen={isOpen} onOpen={onOpen} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};
