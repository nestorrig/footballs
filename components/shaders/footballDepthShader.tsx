"use client";

import CustomShaderMaterial from "three-custom-shader-material";

import * as THREE from "three";
import { useMemo } from "react";

const materialOptions = {
  MeshBasicMaterial: THREE.MeshBasicMaterial,
  MeshStandardMaterial: THREE.MeshStandardMaterial,
  MeshToonMaterial: THREE.MeshToonMaterial,
} as const;

type MaterialOption = keyof typeof materialOptions;

function buildSoccerBallSeeds(baseGeometry: THREE.IcosahedronGeometry) {
  const points: THREE.Vector3[] = [];
  const pointTypes: number[] = [];
  const positionAttribute = baseGeometry.attributes.position;
  const uniqueVertices = new Map<string, boolean>();

  for (let i = 0; i < positionAttribute.count; i += 1) {
    const vertex = new THREE.Vector3().fromBufferAttribute(
      positionAttribute,
      i,
    );
    const normalized = vertex.clone().normalize();
    const key = normalized
      .toArray()
      .map((value) => value.toFixed(5))
      .join(",");

    if (!uniqueVertices.has(key)) {
      uniqueVertices.set(key, true);
      points.push(normalized);
      pointTypes.push(0);
    }
  }

  const triangleCount = positionAttribute.count / 3;
  for (let i = 0; i < triangleCount; i += 1) {
    const a = new THREE.Vector3().fromBufferAttribute(positionAttribute, i * 3);
    const b = new THREE.Vector3().fromBufferAttribute(
      positionAttribute,
      i * 3 + 1,
    );
    const c = new THREE.Vector3().fromBufferAttribute(
      positionAttribute,
      i * 3 + 2,
    );

    const center = new THREE.Vector3();
    center.add(a).add(b).add(c).divideScalar(3).normalize();
    points.push(center);
    pointTypes.push(1);
  }

  return { points, pointTypes };
}

const shaderChunk = (pointCount: number) => /* glsl */ `
  #define POINT_COUNT ${pointCount}

  uniform vec3 uPoints[POINT_COUNT];
  uniform float uPointTypes[POINT_COUNT];
  uniform float uEdgeThreshold;
  uniform float uPanelBulge;
  uniform float uEdgeInset;

  void nearestPanel(vec3 samplePosition, out float nearestDist, out float secondDist, out float nearestType) {
    vec3 sp = normalize(samplePosition);
    float nearestScore = -1.0;
    float secondScore = -1.0;
    nearestType = 0.0;

    for (int i = 0; i < POINT_COUNT; i++) {
      float score = dot(sp, uPoints[i]);

      if (score > nearestScore) {
        secondScore = nearestScore;
        nearestScore = score;
        nearestType = uPointTypes[i];
      } else if (score > secondScore) {
        secondScore = score;
      }
    }

    nearestDist = sqrt(max(0.0001, 2.0 - 2.0 * nearestScore));
    secondDist = sqrt(max(0.0001, 2.0 - 2.0 * secondScore));
  }

  float panelMaskFromDist(float nearestDist, float secondDist) {
    float gap = secondDist - nearestDist;
    float t = smoothstep(uEdgeThreshold * 0.35, uEdgeThreshold * 2.2, gap);
    return t * t * (3.0 - 2.0 * t);
  }

  float panelHeightFromDist(float nearestDist, float secondDist) {
    float mask = panelMaskFromDist(nearestDist, secondDist);
    return mask * uPanelBulge - (1.0 - mask) * uEdgeInset;
  }
`;

const vertexShader = (pointCount: number) => /* glsl */ `
  varying vec3 vBallPosition;
  varying vec2 vUv;
  varying vec3 vBallNormal;

  ${shaderChunk(pointCount)}

  void main() {
    float nearestDist;
    float secondDist;
    float nearestType;

    nearestPanel(position, nearestDist, secondDist, nearestType);

    float height = panelHeightFromDist(nearestDist, secondDist);
    vec3 displacedPosition = position + normalize(position) * height;

    vBallPosition = displacedPosition;
    vUv = uv;
    vBallNormal = csm_Normal;
  }
`;

const fragmentShader = (pointCount: number) => /* glsl */ `
  varying vec3 vBallPosition;
  varying vec2 vUv;
  varying vec3 vBallNormal;

  ${shaderChunk(pointCount)}

  uniform vec3 uPentagonColor;
  uniform vec3 uHexagonColor;
  uniform vec3 uEdgeColor;
  uniform vec3 uEdgesColor;
  uniform vec3 uBaseColor;
  uniform float uPanelMix;
  uniform float uRimThreshold;
  uniform float uBumpStrength;
  uniform mat4 modelMatrix;

  float aastep(float threshold, float value) {
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
  }

  vec3 bumpNormal(vec3 spherePosition, vec3 baseNormal, float nearestDist, float secondDist) {
    if (uBumpStrength <= 0.001) {
      return normalize(mat3(csm_internal_vModelViewMatrix) * normalize(baseNormal));
    }

    vec3 normal = normalize(baseNormal);
    vec3 helperAxis = abs(normal.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 tangent = normalize(cross(helperAxis, normal));
    vec3 bitangent = normalize(cross(normal, tangent));

    float sampleOffset = 0.01;
    float nearestDistLeft;
    float secondDistLeft;
    float typeLeft;
    float nearestDistRight;
    float secondDistRight;
    float typeRight;
    float nearestDistDown;
    float secondDistDown;
    float typeDown;
    float nearestDistUp;
    float secondDistUp;
    float typeUp;

    nearestPanel(spherePosition - tangent * sampleOffset, nearestDistLeft, secondDistLeft, typeLeft);
    nearestPanel(spherePosition + tangent * sampleOffset, nearestDistRight, secondDistRight, typeRight);
    nearestPanel(spherePosition - bitangent * sampleOffset, nearestDistDown, secondDistDown, typeDown);
    nearestPanel(spherePosition + bitangent * sampleOffset, nearestDistUp, secondDistUp, typeUp);

    float edgeHeight = panelHeightFromDist(nearestDist, secondDist);
    float tangentSlope = panelHeightFromDist(nearestDistRight, secondDistRight)
      - panelHeightFromDist(nearestDistLeft, secondDistLeft);
    float bitangentSlope = panelHeightFromDist(nearestDistUp, secondDistUp)
      - panelHeightFromDist(nearestDistDown, secondDistDown);

    vec3 perturbedNormal = normal
      - edgeHeight * normal
      - tangentSlope * uBumpStrength * 0.5 * tangent
      - bitangentSlope * uBumpStrength * 0.5 * bitangent;

    return normalize(mat3(csm_internal_vModelViewMatrix) * normalize(perturbedNormal));
  }

  float sphereRim(vec3 spherePosition) {
    vec3 normal = normalize(spherePosition);
    vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
    vec3 worldPosition = (modelMatrix * vec4(spherePosition, 1.0)).xyz;
    vec3 viewDir = normalize(cameraPosition - worldPosition);
    float rim = 1.0 - max(dot(viewDir, worldNormal), 0.0);
    return pow(smoothstep(0.0, 1.0, rim), 0.5);
  }

  void main() {
    vec3 samplePosition = normalize(vBallPosition);
    float nearestDist;
    float secondDist;
    float nearestType;

    nearestPanel(samplePosition, nearestDist, secondDist, nearestType);

    float edge = 1.0 - aastep(uEdgeThreshold, secondDist - nearestDist);
    vec3 panelColor = mix(uPentagonColor, uHexagonColor, nearestType);
    vec3 color = mix(uBaseColor, panelColor, uPanelMix);

    float rim = sphereRim(vBallPosition);
    float stroke = aastep(uRimThreshold, rim);

    color = mix(color, uEdgesColor, edge);
    color = mix(color, uEdgeColor, stroke);

    csm_FragNormal = bumpNormal(vBallPosition, vBallNormal, nearestDist, secondDist);
    csm_DiffuseColor = vec4(color, 1.0);
  }
`;

// --- CONFIGURACIÓN QUEMADA: PELOTA DE FÚTBOL ---
const FOOTBALL_CONFIG = {
  pentagonColor: "#004bff",
  hexagonColor: "#f3f2ed",
  edgeColor: "#000000",
  edgesColor: "#ffffff",
  baseColor: "#ffffff",
  baseMaterial: "MeshStandardMaterial" as MaterialOption,
  panelMix: 0.99,
  edgeThreshold: 0.03,
  rimThreshold: 1,
  bumpStrength: 30,
  panelBulge: 0.01,
};

export default function FootballDepthShader() {
  const seedData = useMemo(() => {
    const baseGeometry = new THREE.IcosahedronGeometry(1, 0);
    const seeds = buildSoccerBallSeeds(baseGeometry);
    baseGeometry.dispose();
    return seeds;
  }, []);

  const uniforms = useMemo(
    () => ({
      uPoints: { value: seedData.points },
      uPointTypes: { value: seedData.pointTypes },
      uPentagonColor: { value: new THREE.Color(FOOTBALL_CONFIG.pentagonColor) },
      uHexagonColor: { value: new THREE.Color(FOOTBALL_CONFIG.hexagonColor) },
      uEdgeColor: { value: new THREE.Color(FOOTBALL_CONFIG.edgeColor) },
      uEdgesColor: { value: new THREE.Color(FOOTBALL_CONFIG.edgesColor) },
      uBaseColor: { value: new THREE.Color(FOOTBALL_CONFIG.baseColor) },
      uPanelMix: { value: FOOTBALL_CONFIG.panelMix },
      uEdgeThreshold: { value: FOOTBALL_CONFIG.edgeThreshold },
      uRimThreshold: { value: FOOTBALL_CONFIG.rimThreshold },
      uBumpStrength: { value: FOOTBALL_CONFIG.bumpStrength },
      uPanelBulge: { value: FOOTBALL_CONFIG.panelBulge },
    }),
    [seedData],
  );

  return (
    <CustomShaderMaterial
      baseMaterial={materialOptions[FOOTBALL_CONFIG.baseMaterial]}
      vertexShader={vertexShader(seedData.points.length)}
      fragmentShader={fragmentShader(seedData.points.length)}
      uniforms={uniforms}
      roughness={0.4}
      metalness={0.1}
      color="#ffffff"
    />
  );
}
