"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { useDetectGPU } from "@react-three/drei";
import { Suspense, useSyncExternalStore } from "react";
import { ACESFilmicToneMapping } from "three";

// Helpers para detectar el montado en cliente sin usar useState/useEffect en cascada
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}

function SceneContainer() {
  const GPUTier = useDetectGPU();
  const mounted = useIsMounted();

  const targetDpr: [number, number] = GPUTier.tier >= 2 ? [1, 2] : [1, 1];

  const isMobile =
    GPUTier.isMobile ||
    (mounted && typeof window !== "undefined" && window.innerWidth < 768);

  const cameraPosition: [number, number, number] = [0, 0, isMobile ? 20 : 15];

  return (
    <>
      {/* {mounted && (
        <div className="fixed bottom-8 right-8 z-50 text-white bg-black/50 px-3 py-1.5 rounded-md backdrop-blur border border-white/10 font-mono text-xs select-none pointer-events-none">
          GPU Tier: {GPUTier.tier} | DPR: {targetDpr[1]}x |{" "}
          {isMobile ? "Mobile (Z:20)" : "Desktop (Z:15)"}
        </div>
      )} */}

      <Canvas
        shadows
        gl={{
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
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

      <div className="bottom-10 left-6 md:left-16 fixed z-50 pointer-events-none">
        <h2 className="font-not text-[clamp(2rem,6vw,8rem)] leading-tight mb-2">
          Gravity
        </h2>

        <p className="font-urban text-[clamp(0.8rem,1.4vw,2rem)] hidden md:block">
          Enjoy the experience, click to push the balls
        </p>

        <p className="font-urban text-[clamp(0.8rem,1.4vw,2rem)] block md:hidden">
          Enjoy the experience, tap to push the balls
        </p>
      </div>
    </div>
  );
}
