"use client";
import PbrEnviroment from "@/components/common/PbrEnviroment";
import FootballDepthShader from "@/components/shaders/footballDepthShader";
import { PresentationControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function Home() {
  return (
    <div className="h-screen w-screen bg-black">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 35, near: 0.1, far: 100 }}
        dpr={[1, 2]}
      >
        <color args={["#004bff"]} attach="background" />
        <PbrEnviroment backgroundScale={14} />
        <PresentationControls>
          <mesh>
            <sphereGeometry args={[1, 96, 48]} />
            <FootballDepthShader />
          </mesh>
        </PresentationControls>
      </Canvas>
    </div>
  );
}
