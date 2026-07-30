"use client";

import FootballDepthShaderCanInstance from "@/components/shaders/footballDepthShaderCanInstance";
import { CameraControls } from "@react-three/drei";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CuboidCollider,
  InstancedRigidBodies,
  Physics,
  RigidBody,
} from "@react-three/rapier";
import type {
  InstancedRigidBodyProps,
  RapierRigidBody,
} from "@react-three/rapier";
import PbrEnviroment from "@/components/common/PbrEnviroment";

const BALL_COUNT = 30;
const BOX_SIZE = 10;

function BoundingBox() {
  const half = BOX_SIZE / 2;
  const thickness = 0.5;

  return (
    <RigidBody type="fixed" restitution={0.8} friction={0.1}>
      <CuboidCollider
        args={[half, thickness, half]}
        position={[0, -half - thickness, 0]}
      />
      <CuboidCollider
        args={[half, thickness, half]}
        position={[0, half + thickness, 0]}
      />
      <CuboidCollider
        args={[thickness, half, half]}
        position={[-half - thickness, 0, 0]}
      />
      <CuboidCollider
        args={[thickness, half, half]}
        position={[half + thickness, 0, 0]}
      />
      <CuboidCollider
        args={[half, half, thickness]}
        position={[0, 0, -half - thickness]}
      />
      <CuboidCollider
        args={[half, half, thickness]}
        position={[0, 0, half + thickness]}
      />
    </RigidBody>
  );
}

function InteractiveBallsInBox() {
  const rigidBodiesRef = useRef<RapierRigidBody[]>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  const instances = useMemo(() => {
    const list: InstancedRigidBodyProps[] = [];
    const spawnRadius = BOX_SIZE / 2 - 1.5;

    for (let i = 0; i < BALL_COUNT; i++) {
      list.push({
        key: "instance_" + i,
        position: [
          (Math.random() - 0.5) * spawnRadius * 2,
          (Math.random() - 0.5) * spawnRadius * 2,
          (Math.random() - 0.5) * spawnRadius * 2,
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      });
    }
    return list;
  }, []);

  const applyRandomImpulseAndTorque = (body: RapierRigidBody) => {
    const impulseStrength = 25;
    const impulse = {
      x: (Math.random() - 0.5) * impulseStrength,
      y: (Math.random() - 0.5) * impulseStrength,
      z: (Math.random() - 0.5) * impulseStrength,
    };

    const torqueStrength = 8;
    const torque = {
      x: (Math.random() - 0.5) * torqueStrength,
      y: (Math.random() - 0.5) * torqueStrength,
      z: (Math.random() - 0.5) * torqueStrength,
    };

    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

    body.applyImpulse(impulse, true);
    body.applyTorqueImpulse(torque, true);
    body.wakeUp();
  };

  const handleBallClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    const index = e.instanceId;
    if (index === undefined || !rigidBodiesRef.current) return;

    const body = rigidBodiesRef.current[index];
    if (!body) return;

    const center = body.translation();
    const r = new THREE.Vector3(
      e.point.x - center.x,
      e.point.y - center.y,
      e.point.z - center.z,
    );

    const impulse = e.ray.direction.clone().multiplyScalar(40);
    const torque = new THREE.Vector3()
      .crossVectors(r, impulse)
      .multiplyScalar(0.005);

    body.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);
    body.applyTorqueImpulse({ x: torque.x, y: torque.y, z: torque.z }, true);
  };

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.computeBoundingSphere();
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    const timer = setTimeout(() => {
      if (rigidBodiesRef.current) {
        rigidBodiesRef.current.forEach((body) => {
          if (body) applyRandomImpulseAndTorque(body);
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <InstancedRigidBodies
      ref={rigidBodiesRef}
      instances={instances}
      colliders="ball"
      restitution={0.85}
      linearDamping={0.05}
      angularDamping={0.05}
    >
      <instancedMesh
        ref={meshRef}
        castShadow
        receiveShadow
        args={[undefined, undefined, BALL_COUNT]}
        onPointerDown={handleBallClick}
        onPointerEnter={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.8, 32, 32]} />
        <FootballDepthShaderCanInstance />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}

export default function Scene() {
  const camera = useRef<CameraControlsImpl>(null);

  return (
    <>
      <CameraControls enabled={false} ref={camera} />
      <color args={["#004bff"]} attach="background" />
      <PbrEnviroment />
      <Physics debug={false} gravity={[0, 0, 0]}>
        <BoundingBox />
        <InteractiveBallsInBox />
      </Physics>
    </>
  );
}
