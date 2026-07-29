"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { useState, useRef } from "react";

export default function Home() {
  const [ballsCount, setBallsCount] = useState(6);

  // Ref para invocar el reseteo de animación directamente en Scene
  const sceneRef = useRef<{ restartAnimation: () => void }>(null);

  return (
    <div className="h-screen w-screen bg-black select-none overflow-hidden relative">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 35, near: 0.1, far: 100 }}
        dpr={[1, 2]}
      >
        <Scene ref={sceneRef} ballsCount={ballsCount} />
      </Canvas>

      <div className="bottom-5 md:bottom-10 right-6 fixed z-50 w-[calc(100%-24px*2)] md:w-64 px-2 rounded-2xl text-white flex flex-row gap-8 font-urban transition-all">
        <div className="w-full">
          <div className="flex justify-between items-center">
            <label
              htmlFor="ballsCount"
              className="text-xs uppercase tracking-wider text-white/80 font-medium"
            >
              Balls Count
            </label>
            <span className="text-sm ">{ballsCount}</span>
          </div>

          {/* Range Slider personalizado */}
          <input
            id="ballsCount"
            type="range"
            min={3}
            max={12}
            step={1}
            value={ballsCount}
            onChange={(e) => setBallsCount(Number(e.target.value))}
            className="w-full accent-white cursor-pointer bg-white/20 h-1.5 rounded-lg appearance-none"
          />
        </div>

        <button
          onClick={() => sceneRef.current?.restartAnimation()}
          className="p-2.5 text-white hover:scale-[1.05] active:scale-[0.95] rounded-xl transition-all cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-8"
            viewBox="0 0 21 21"
          >
            <g
              fill="none"
              fillRule="evenodd"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3.578 6.487A8 8 0 1 1 2.5 10.5"></path>
              <path d="M7.5 6.5h-4v-4"></path>
            </g>
          </svg>
        </button>
      </div>

      <div className="bottom-24 md:bottom-10 left-6 md:left-16 fixed z-50 pointer-events-none">
        <h2 className="font-not text-[clamp(2rem,6vw,8rem)] leading-tight mb-2 text-white">
          Tween
        </h2>

        <p className="font-urban text-[clamp(0.8rem,1.4vw,2rem)] max-w-xs lg:max-w-none text-white/90">
          No interaction required, just enjoy the motion, adjust the ball count
          to experiment with the scene
        </p>
      </div>
    </div>
  );
}
