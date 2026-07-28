"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { useDetectGPU } from "@react-three/drei";
import { Suspense, useSyncExternalStore } from "react";

// Hook puro para detectar hidratación/montaje en cliente (sin useState + useEffect)
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}

function SceneContainer() {
  const GPUTier = useDetectGPU();
  const mounted = useIsMounted();

  // Determinar el DPR basado en el Tier de GPU
  const targetDpr: [number, number] = GPUTier.tier >= 2 ? [1, 1.8] : [1, 1.3];

  // Verificación segura de viewport en cliente
  const isMobile =
    GPUTier.isMobile ||
    (mounted && typeof window !== "undefined" && window.innerWidth < 768);

  // Ajuste de posición de cámara según viewport
  const cameraPosition: [number, number, number] = [0, 0, isMobile ? 25 : 15];

  return (
    <>
      {/* Indicador visual de GPU */}
      {/* {mounted && (
        <div className="fixed bottom-8 right-8 z-50 text-white bg-black/50 px-3 py-1.5 rounded-md backdrop-blur border border-white/10 font-mono text-xs select-none pointer-events-none">
          GPU Tier: {GPUTier.tier} | DPR: {targetDpr[1]}x |{" "}
          {isMobile ? "Mobile (Z:25)" : "Desktop (Z:15)"}
        </div>
      )} */}

      {/* Escenario 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: cameraPosition, fov: 35, near: 0.1, far: 200 }}
        dpr={targetDpr}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </>
  );
}

export default function Home() {
  return (
    <div className="h-screen w-screen bg-black relative">
      <Suspense fallback={null}>
        <SceneContainer />
      </Suspense>

      <div className="bottom-10 left-6 md:left-16 fixed z-50 pointer-events-none select-none">
        <h2 className="font-not text-[clamp(2rem,6vw,8rem)] leading-tight mb-2">
          Bubble
        </h2>

        {/* Texto para mouse / escritorio */}
        <p className="font-urban text-[clamp(0.8rem,1.4vw,2rem)] max-w-3xs md:max-w-none hidden md:block">
          Enjoy the experience, move your cursor to drag the sphere
        </p>

        {/* Texto para pantalla táctil / móvil */}
        <p className="font-urban text-[clamp(0.8rem,1.4vw,2rem)] max-w-3xs md:max-w-none block md:hidden">
          Enjoy the experience, touch and drag to move the sphere
        </p>
      </div>
    </div>
  );
}
