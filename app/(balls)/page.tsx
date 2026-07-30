"use client";

import PbrEnviroment from "@/components/common/PbrEnviroment";
import FootballDepthShader from "@/components/shaders/footballDepthShader";
import { PresentationControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";

function Scene() {
  const { size } = useThree();

  const factor = size.width < 768 ? 0.008 : 0.002;
  const backgroundScale = Math.max(8, size.width * factor);
  return (
    <>
      <color args={["#004bff"]} attach="background" />
      <PbrEnviroment backgroundScale={backgroundScale} />
      <PresentationControls
        zoom={1.25}
        global
        damping={0.2}
        snap={0.5}
        rotation={[0, 0.3, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 2]}
      >
        <mesh rotation={[0.5, 1, 0]}>
          <sphereGeometry args={[1, 48, 48]} />
          <FootballDepthShader />
        </mesh>
      </PresentationControls>
    </>
  );
}

function CameraSetup() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    camera.position.set(0, 0, size.width < 768 ? 8.5 : 5);
    camera.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

export default function Home() {
  return (
    <div className="h-screen w-screen bg-black relative">
      <Canvas
        className="touch-none lg:touch-auto"
        camera={{ fov: 35, near: 0.1, far: 100 }}
        dpr={[1, 2]}
      >
        <CameraSetup />
        <Scene />
      </Canvas>

      <div className="bottom-4 md:bottom-8 px-6 md:px-12 fixed z-50 pointer-events-none w-full  flex flex-col lg:flex-row">
        <div className="max-w-3xl">
          <h2 className="font-not text-[clamp(1.8rem,5vw,4rem)] leading-none mb-3">
            Procedural Football PBR Material
          </h2>

          <p className="font-urban text-[clamp(0.85rem,1.1vw,1.4rem)] opacity-90 hidden md:block leading-relaxed">
            Click and drag to inspect the material. Explore the demos above to
            see it in action
          </p>

          <p className="font-urban text-[clamp(0.85rem,1.1vw,1.4rem)] opacity-90 block md:hidden leading-relaxed">
            Touch and drag to inspect. Try the demos above to see different
            setups
          </p>
        </div>
        <div className="lg:grid items-end justify-end w-full mt-2">
          <p className="font-urban text-[clamp(0.65rem,1.1vw,1.3rem)] opacity-90 leading-relaxed max-w-xs lg:text-right">
            Interactive 3D experience with physics, procedural PBR shaders, and
            real-time lighting using Three.js, R3F, Rapier and GSAP
          </p>
        </div>
      </div>
    </div>
  );
}
