import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

interface GiftBox3DProps {
  isOpen: boolean;
  onOpen: () => void;
}

export const GiftBox3D: React.FC<GiftBox3DProps> = ({ isOpen, onOpen }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const heartsGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { theme } = useTheme();

  // Animation values
  const lidOpenProgress = useRef(0);

  useFrame((state, delta) => {
    // Gentle idle floating when closed
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.12;
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.25;

      // Slight tilt on hover
      if (hovered && !isOpen) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.15, 0.1);
      } else {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      }
    }

    // Animate lid opening smoothly
    if (lidRef.current) {
      const target = isOpen ? 1 : 0;
      lidOpenProgress.current = THREE.MathUtils.lerp(lidOpenProgress.current, target, delta * 4);

      lidRef.current.position.y = 1.05 + lidOpenProgress.current * 1.4;
      lidRef.current.position.z = -lidOpenProgress.current * 0.8;
      lidRef.current.rotation.x = -lidOpenProgress.current * 0.9;
    }

    // Animate bursting hearts when opened
    if (heartsGroupRef.current && isOpen) {
      heartsGroupRef.current.children.forEach((child, i) => {
        child.position.y += delta * (1.2 + (i % 3) * 0.4);
        child.rotation.y += delta * 2;
        child.rotation.z += delta * 1.5;
        if (child.position.y > 4) {
          child.position.y = 0.5;
        }
      });
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={onOpen}
      onPointerOver={() => {
        setHovered(true);
        if (!isOpen) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* --- GIFT BOX BASE --- */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 1.8, 2]} />
        <meshStandardMaterial
          color={theme.secondary}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>

      {/* Vertical Ribbon (X) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.02, 1.82, 0.35]} />
        <meshStandardMaterial
          color={theme.primary}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Horizontal Ribbon (Z) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.35, 1.82, 2.02]} />
        <meshStandardMaterial
          color={theme.primary}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* --- GIFT BOX LID --- */}
      <group ref={lidRef} position={[0, 1.05, 0]}>
        {/* Lid cover */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.4, 2.2]} />
          <meshStandardMaterial
            color={theme.secondary}
            roughness={0.2}
            metalness={0.15}
          />
        </mesh>

        {/* Lid Ribbon Cross */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[2.22, 0.42, 0.36]} />
          <meshStandardMaterial color={theme.primary} roughness={0.2} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.36, 0.42, 2.22]} />
          <meshStandardMaterial color={theme.primary} roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Cute Bow Loops */}
        <group position={[0, 0.35, 0]}>
          {/* Central golden bead */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.2} />
          </mesh>

          {/* Left Bow Loop */}
          <mesh position={[-0.32, 0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.26, 0.09, 12, 24]} />
            <meshStandardMaterial color={theme.primary} metalness={0.3} roughness={0.25} />
          </mesh>

          {/* Right Bow Loop */}
          <mesh position={[0.32, 0.15, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <torusGeometry args={[0.26, 0.09, 12, 24]} />
            <meshStandardMaterial color={theme.primary} metalness={0.3} roughness={0.25} />
          </mesh>
        </group>
      </group>

      {/* --- BURSTING HEARTS (When opened) --- */}
      <group ref={heartsGroupRef} visible={isOpen}>
        {[...Array(8)].map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.sin(i * 1.2) * 0.8),
              0.5 + (i * 0.3),
              (Math.cos(i * 1.2) * 0.8)
            ]}
          >
            <octahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? theme.accent : '#FFD700'}
              emissive={i % 2 === 0 ? theme.primary : '#FFA500'}
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
