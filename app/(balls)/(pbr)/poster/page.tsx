"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { useDetectGPU } from "@react-three/drei";
import { Suspense, useSyncExternalStore } from "react";

// Hook puro para verificar que el componente se montó en el cliente
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}

function SceneContainer() {
  const GPUTier = useDetectGPU();
  const mounted = useIsMounted();

  // Determinar el DPR basado en el Tier:
  const targetDpr: [number, number] = GPUTier.tier >= 2 ? [1, 1.8] : [1, 1];

  // Evaluar si es móvil comprobando window de manera segura
  const isMobile =
    GPUTier.isMobile ||
    (mounted && typeof window !== "undefined" && window.innerWidth < 768);

  // Posición de la cámara: 15 unidades por defecto, 25 unidades en mobile
  const cameraPosition: [number, number, number] = [0, 0, isMobile ? 25 : 12];

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

      <div className="bottom-10 left-16 fixed z-50 pointer-events-none w-full">
        <h2 className="font-not  w-full text-[clamp(2rem,7.2vw,12rem)] leading-tight mb-2">
          Footballs in Motion
        </h2>
      </div>
    </div>
  );
}
