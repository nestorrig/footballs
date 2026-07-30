"use client";

import { useGSAP } from "@gsap/react";
import { CameraControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { CustomEase } from "gsap/all";
import {
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import * as THREE from "three";
import PbrEnviroment from "@/components/common/PbrEnviroment";
import FootballDepthShader from "@/components/shaders/footballDepthShader";

gsap.registerPlugin(CustomEase);

const { DEG2RAD } = THREE.MathUtils;
const sphereGeometry = new THREE.SphereGeometry(1, 48, 24);

interface SceneProps {
  ballsCount: number;
}

const Scene = forwardRef<{ restartAnimation: () => void }, SceneProps>(
  ({ ballsCount }, ref) => {
    const balls = useRef<(THREE.Mesh | null)[]>([]);
    const groupRef = useRef<THREE.Group>(null);
    const camera = useRef<CameraControlsImpl>(null);
    const timeline = useRef<GSAPTimeline>(null);

    const progress = useRef({
      increment: 0,
      rotationY: 0,
      radius: 0,
      groupPosition: { x: 0, y: -5, z: 0 },
      groupRotation: { x: 0, y: 0, z: 0 },
      endedAnim: false,
    });

    const { size } = useThree();

    const restartAnim = useCallback(() => {
      camera.current?.reset(false);
      timeline.current?.restart();
    }, []);

    useImperativeHandle(ref, () => ({
      restartAnimation: restartAnim,
    }));

    const backgroundScale = Math.max(18, 18 + ballsCount);

    useEffect(() => {
      camera.current?.saveState();
    }, []);

    useGSAP(
      () => {
        camera.current?.reset(false);
        timeline.current = gsap.timeline({ delay: 0.2 });
        const tl = timeline.current;
        const controls = camera.current;
        const anim = progress.current;

        tl.eventCallback("onComplete", () => {
          anim.endedAnim = true;
        });

        tl.to(anim.groupPosition, {
          y: 0,
          duration: 1.2,
          ease: CustomEase.create("custom", "M0,0 C0.328,0.231 0.142,1 1,1 "),
        });
        tl.to(
          anim.groupRotation,
          {
            y: Math.PI * 2 * 4,
            duration: 6,
            ease: CustomEase.create("custom", "M0,0 C0.328,0.231 0.142,1 1,1 "),
          },
          "<",
        );
        tl.to(
          anim,
          {
            rotationY: Math.PI * 2 * 2,
            duration: 3.4,
            ease: CustomEase.create(
              "custom",
              "M0,0 C0.251,0 -0.028,0.988 1,1 ",
            ),
          },
          "<2",
        );
        tl.to(
          anim,
          {
            increment: 1,
            radius: Math.max(3, ballsCount * 0.5),
            duration: 2,
            ease: CustomEase.create(
              "custom",
              "M0,0 C0.19,0.753 -0.181,0.943 1,1 ",
            ),
          },
          "<0.4",
        );
        tl.to(
          anim.groupPosition,
          {
            y: 0 + ballsCount * 0.12,
            duration: 1.2,
            ease: CustomEase.create("custom", "M0,0 C0.328,0.231 0.142,1 1,1 "),
          },
          "<",
        );
        tl.call(
          () => {
            const referenceWidth = 1200;
            const responsiveExtra = Math.max(
              0,
              (referenceWidth - size.width) * 0.02,
            );

            controls?.dolly(-1 * ballsCount - responsiveExtra, true);
            controls?.rotate(
              0,
              Math.max(-50 * DEG2RAD, -40 * DEG2RAD * ballsCount * 0.1),
              true,
            );
          },
          [],
          "<",
        );
      },
      {
        scope: groupRef,
        dependencies: [ballsCount, size],
        revertOnUpdate: true,
      },
    );

    useFrame(({ clock }) => {
      const items = ballsCount;
      const elapsedTime = clock.getElapsedTime();

      const { increment, rotationY, radius, groupPosition } = progress.current;

      for (let i = 0; i < items; i++) {
        const mesh = balls.current[i];
        if (!mesh) continue;

        const angle = Math.PI / 2 + ((Math.PI * 2) / items) * i * increment;
        mesh.position.set(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        );
        mesh.rotation.y = rotationY + elapsedTime * 0.75;
      }

      if (groupRef.current) {
        groupRef.current.position.set(
          groupPosition.x,
          groupPosition.y,
          groupPosition.z,
        );
        groupRef.current.rotation.y = -elapsedTime * 0.24;
      }
    });

    return (
      <>
        <CameraControls enabled={false} ref={camera} />
        <PbrEnviroment backgroundScale={backgroundScale} />
        <color args={["#004bff"]} attach="background" />

        <group ref={groupRef}>
          {Array.from({ length: ballsCount }, (_, index) => (
            <mesh
              key={index}
              ref={(element) => {
                balls.current[index] = element;
              }}
              geometry={sphereGeometry}
            >
              <FootballDepthShader />
            </mesh>
          ))}
        </group>
      </>
    );
  },
);

Scene.displayName = "Scene";
export default Scene;
