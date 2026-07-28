import { Environment, GradientTexture, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function PbrEnviroment({ backgroundScale = 20 }) {
  return (
    <>
      <Background scale={backgroundScale} />
      <Lights />

      <Environment>
        <Lightformer position-z={-5} scale={10} color="#004bff" intensity={2} />
        <Lightformer
          position-z={-5}
          position-x={5}
          position-y={-5}
          scale={10}
          color="#99abff"
          intensity={2}
        />
      </Environment>
    </>
  );
}

// --- CONFIGURACIÓN QUEMADA: LUCES Y SOMBRAS ---
const LIGHTS_CONFIG = {
  intensity: 2,
  position: [6, 10, 8] as [number, number, number],
  shadowBounds: 8,
  near: 0.5,
  far: 20,
  mapSize: 4096 / 2,
  bias: -0.0005,
  ambientLightColor: "#f1f3ff",
  ambientLightIntensity: 0.5,
};

function Lights() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);

  return (
    <>
      <ambientLight
        intensity={LIGHTS_CONFIG.ambientLightIntensity}
        color={LIGHTS_CONFIG.ambientLightColor}
      />

      <directionalLight
        ref={lightRef}
        castShadow
        position={LIGHTS_CONFIG.position}
        intensity={LIGHTS_CONFIG.intensity}
        shadow-mapSize={[LIGHTS_CONFIG.mapSize, LIGHTS_CONFIG.mapSize]}
        shadow-camera-near={LIGHTS_CONFIG.near}
        shadow-camera-far={LIGHTS_CONFIG.far}
        shadow-camera-left={-LIGHTS_CONFIG.shadowBounds}
        shadow-camera-right={LIGHTS_CONFIG.shadowBounds}
        shadow-camera-top={LIGHTS_CONFIG.shadowBounds}
        shadow-camera-bottom={-LIGHTS_CONFIG.shadowBounds}
        shadow-bias={LIGHTS_CONFIG.bias}
      />
    </>
  );
}

// --- CONFIGURACIÓN QUEMADA: GRADIENTE DE FONDO ---
const BACKGROUND_CONFIG = {
  colors: ["#01030a", "#004bff", "#99abff"],
  stops: [0, 0.5, 1],
  rotate: 0.75,
};

interface BackgroundProps {
  fixed?: boolean;
  scale?: number;
}

export function Background({ fixed = true, scale = 20 }: BackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;

    if (fixed) {
      // 1. Alinea el plano con la orientación de la cámara
      meshRef.current.quaternion.copy(camera.quaternion);

      // 2. Aplica la rotación sobre el eje Z local para cambiar la dirección del gradiente
      meshRef.current.rotateZ(BACKGROUND_CONFIG.rotate);
    } else {
      // Si no es fixed, aplica únicamente la rotación Z estática
      meshRef.current.rotation.set(0, 0, BACKGROUND_CONFIG.rotate);
    }
  });

  return (
    <mesh ref={meshRef} scale={scale} renderOrder={-1000}>
      <planeGeometry />
      <meshBasicMaterial depthWrite={false} depthTest={false}>
        <GradientTexture
          stops={BACKGROUND_CONFIG.stops}
          colors={BACKGROUND_CONFIG.colors}
          size={1024}
        />
      </meshBasicMaterial>
    </mesh>
  );
}
