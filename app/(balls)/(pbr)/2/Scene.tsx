"use client";

import { CameraControls, GradientTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import * as THREE from "three";
import { InstancedRigidBodies, Physics } from "@react-three/rapier";
import type {
  InstancedRigidBodyProps,
  RapierRigidBody,
} from "@react-three/rapier";
import FootballDepthShaderCanInstance from "@/components/shaders/footballDepthShaderCanInstance";
import PbrEnviroment from "@/components/common/PbrEnviroment";

const SPHERE_RADIUS = 3.5;
const BALL_RADIUS = 0.75;
const BALLS_COUNT = 25;

// --- VECTORES AUXILIARES REUTILIZABLES (Evita instanciar en cada frame) ---
const _sphereVel = new THREE.Vector3();

/**
 * Genera las instancias iniciales una sola vez cuando se evalúa el módulo.
 * Previene llamadas a Math.random() durante la fase de render.
 */
function generateInitialInstances(count: number): InstancedRigidBodyProps[] {
  const list: InstancedRigidBodyProps[] = [];
  const maxRadius = SPHERE_RADIUS - BALL_RADIUS - 0.5;

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random()) * maxRadius;

    list.push({
      key: "instance_" + i,
      position: [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ],
    });
  }

  return list;
}

// Instancias iniciales estáticas
const INITIAL_INSTANCES = generateInitialInstances(BALLS_COUNT);

export default function Scene() {
  const camera = useRef<CameraControlsImpl>(null);
  const rigidBodiesRef = useRef<RapierRigidBody[]>(null);

  const sphereCenter = useRef(new THREE.Vector3(0, 0, 0));
  const prevSphereCenter = useRef(new THREE.Vector3(0, 0, 0));
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));

  const screenPlane = useMemo(() => new THREE.Plane(), []);
  const cameraDir = useMemo(() => new THREE.Vector3(), []);
  const intersectionPoint = useMemo(() => new THREE.Vector3(), []);

  const sphereMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.033);

    // 1. Raycaster & Suavizado
    state.camera.getWorldDirection(cameraDir);
    screenPlane.setFromNormalAndCoplanarPoint(
      cameraDir.negate(),
      sphereCenter.current,
    );

    state.raycaster.setFromCamera(state.pointer, state.camera);
    const hit = state.raycaster.ray.intersectPlane(
      screenPlane,
      intersectionPoint,
    );

    if (hit) {
      targetPosition.current.copy(intersectionPoint);
    }

    const smoothness = 5;
    sphereCenter.current.x = THREE.MathUtils.damp(
      sphereCenter.current.x,
      targetPosition.current.x,
      smoothness,
      delta,
    );
    sphereCenter.current.y = THREE.MathUtils.damp(
      sphereCenter.current.y,
      targetPosition.current.y,
      smoothness,
      delta,
    );
    sphereCenter.current.z = THREE.MathUtils.damp(
      sphereCenter.current.z,
      targetPosition.current.z,
      smoothness,
      delta,
    );

    if (sphereMeshRef.current) {
      sphereMeshRef.current.position.copy(sphereCenter.current);
    }

    // 2. Velocidad de la esfera (Reutilizando vector sin declarar 'new')
    _sphereVel
      .subVectors(sphereCenter.current, prevSphereCenter.current)
      .divideScalar(Math.max(delta, 0.001));

    prevSphereCenter.current.copy(sphereCenter.current);

    // 3. Confinamiento matemático
    if (rigidBodiesRef.current) {
      const maxDist = SPHERE_RADIUS - BALL_RADIUS - 0.2;
      const center = sphereCenter.current;
      const bodies = rigidBodiesRef.current;

      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        if (!body) continue;

        const pos = body.translation();
        const vel = body.linvel();

        const dx = pos.x - center.x;
        const dy = pos.y - center.y;
        const dz = pos.z - center.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        // Optimización: Comparar primero distSq para evitar Math.sqrt innecesarios
        if (distSq > maxDist * maxDist) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;

          body.setTranslation(
            {
              x: center.x + nx * maxDist,
              y: center.y + ny * maxDist,
              z: center.z + nz * maxDist,
            },
            true,
          );

          const relVx = vel.x - _sphereVel.x;
          const relVy = vel.y - _sphereVel.y;
          const relVz = vel.z - _sphereVel.z;
          const relDot = relVx * nx + relVy * ny + relVz * nz;

          if (relDot > 0) {
            const restitution = 0.5;
            const impulse = (1 + restitution) * relDot;

            body.setLinvel(
              {
                x: vel.x - impulse * nx + _sphereVel.x * 0.2,
                y: vel.y - impulse * ny + _sphereVel.y * 0.2,
                z: vel.z - impulse * nz + _sphereVel.z * 0.2,
              },
              true,
            );
          }
        }
      }
    }
  });

  return (
    <>
      <CameraControls enabled={false} ref={camera} />
      <color args={["#004bff"]} attach="background" />
      <PbrEnviroment />

      {/* Esfera contenedora optimizada */}
      <mesh ref={sphereMeshRef} visible={true}>
        <sphereGeometry args={[SPHERE_RADIUS, 32, 32]} />

        <meshPhysicalMaterial
          transmission={0.95}
          roughness={0.05}
          ior={1.2}
          thickness={0.5}
        >
          <GradientTexture
            stops={[0, 0.5, 1]}
            colors={["#99abff", "#fff", "#99abff"]}
            size={1024}
          />
        </meshPhysicalMaterial>
      </mesh>

      <Physics debug={false}>
        <InstancedRigidBodies
          ref={rigidBodiesRef}
          instances={INITIAL_INSTANCES}
          colliders="ball"
          restitution={0.2}
          linearDamping={1.6}
          angularDamping={1.6}
        >
          <instancedMesh
            castShadow
            receiveShadow
            args={[undefined, undefined, BALLS_COUNT]}
          >
            <sphereGeometry args={[BALL_RADIUS, 24, 24]} />
            <FootballDepthShaderCanInstance />
          </instancedMesh>
        </InstancedRigidBodies>
      </Physics>
    </>
  );
}
