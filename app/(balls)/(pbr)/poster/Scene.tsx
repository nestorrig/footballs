"use client";

import { CameraControls, GradientTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import * as THREE from "three";
import {
  InstancedRigidBodies,
  Physics,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import type { InstancedRigidBodyProps } from "@react-three/rapier";
import FootballDepthShaderCanInstance from "@/components/shaders/footballDepthShaderCanInstance";
import PbrEnviroment from "@/components/common/PbrEnviroment";

const BALLS_COUNT = 20;

/**
 * Función utilitaria fuera del componente.
 * Genera la configuración inicial una sola vez al cargar el módulo.
 */
function generateInitialInstances(count: number): InstancedRigidBodyProps[] {
  const list: InstancedRigidBodyProps[] = [];
  for (let i = 0; i < count; i++) {
    list.push({
      key: "instance_" + i,
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
    });
  }
  return list;
}

// Instancias iniciales estáticas
const INITIAL_INSTANCES = generateInitialInstances(BALLS_COUNT);

interface PlanetaryGravityProps {
  centerRef: React.RefObject<THREE.Vector3>;
}

function PlanetaryGravity({ centerRef }: PlanetaryGravityProps) {
  const rigidBodiesRef = useRef<RapierRigidBody[]>(null);

  // Reutilización de objetos vectoriales en memoria (sin GC overhead)
  const dir = useMemo(() => new THREE.Vector3(), []);
  const bodyPos = useMemo(() => new THREE.Vector3(), []);
  const force = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDelta) => {
    if (!rigidBodiesRef.current || !centerRef.current) return;

    const delta = Math.min(rawDelta, 0.033);
    const gravityStrength = 0.3 * delta * 60;
    const center = centerRef.current;

    const bodies = rigidBodiesRef.current;
    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      if (!body) continue;

      const translation = body.translation();
      bodyPos.set(translation.x, translation.y, translation.z);

      dir.subVectors(center, bodyPos);
      const distanceSq = dir.lengthSq();

      if (distanceSq > 0.05) {
        dir.normalize();
        force.copy(dir).multiplyScalar(gravityStrength * body.mass());
        body.applyImpulse(force, true);
      }
    }
  });

  return (
    <InstancedRigidBodies
      ref={rigidBodiesRef}
      instances={INITIAL_INSTANCES}
      colliders="ball"
      restitution={0}
      linearDamping={0.6}
      angularDamping={0.6}
    >
      <instancedMesh
        receiveShadow
        castShadow
        args={[undefined, undefined, BALLS_COUNT]}
      >
        <sphereGeometry args={[0.8, 24, 24]} />
        <FootballDepthShaderCanInstance />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}

export default function Scene() {
  const camera = useRef<CameraControlsImpl>(null);
  const centerBodyRef = useRef<RapierRigidBody>(null);

  const planetCenter = useRef(new THREE.Vector3(0, 0, 0));
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));

  // Instancias estáticas para Raycasting y cálculo de interacción
  const screenPlane = useMemo(() => new THREE.Plane(), []);
  const cameraDir = useMemo(() => new THREE.Vector3(), []);
  const intersectionPoint = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.033);

    // 1. Proyección del cursor sobre el plano
    state.camera.getWorldDirection(cameraDir);
    screenPlane.setFromNormalAndCoplanarPoint(
      cameraDir.negate(),
      planetCenter.current,
    );

    state.raycaster.setFromCamera(state.pointer, state.camera);
    const hit = state.raycaster.ray.intersectPlane(
      screenPlane,
      intersectionPoint,
    );

    if (hit) {
      targetPosition.current.copy(intersectionPoint);
    }

    // 2. Interpolación suave (Lerp)
    const smoothness = 8;
    const lerpFactor = 1 - Math.exp(-smoothness * delta);
    planetCenter.current.lerp(targetPosition.current, lerpFactor);

    // 3. Mover el cuerpo cinemático principal
    if (centerBodyRef.current) {
      centerBodyRef.current.setNextKinematicTranslation(planetCenter.current);
    }
  });

  return (
    <>
      <CameraControls enabled={false} ref={camera} />
      <color args={["#004bff"]} attach="background" />
      <PbrEnviroment backgroundScale={15} />

      <Physics debug={false} gravity={[0, 0, 0]}>
        <RigidBody
          ref={centerBodyRef}
          type="kinematicPosition"
          colliders="ball"
          restitution={0}
          friction={0.2}
        >
          <mesh>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshPhysicalMaterial
              transmission={0.95}
              roughness={0.05}
              ior={1.2}
              thickness={1.5}
            >
              <GradientTexture
                stops={[0, 0.5, 1]}
                colors={["#99abff", "#fff", "#99abff"]}
                size={1024}
              />
            </meshPhysicalMaterial>
          </mesh>
        </RigidBody>

        {/* Pasamos la Ref completa en lugar de `.current` */}
        <PlanetaryGravity centerRef={planetCenter} />
      </Physics>
    </>
  );
}
