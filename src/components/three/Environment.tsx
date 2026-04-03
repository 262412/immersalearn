"use client";

import { useRef } from "react";
import { Sky, Stars, Cloud } from "@react-three/drei";
import * as THREE from "three";
import type { EnvironmentConfig } from "@/lib/types/scene-graph";

interface EnvironmentProps {
  config: EnvironmentConfig;
}

export function Environment({ config }: EnvironmentProps) {
  const skybox = config.skybox || { type: "preset" as const, value: "noon", time_of_day: "noon" as const };
  const terrain = config.terrain || { type: "flat" as const, material: "grass", size: [60, 60] as [number, number] };
  const lighting = config.lighting || {};
  const sun = lighting.sun || { direction: [-1, -2, -1] as [number, number, number], color: "#FFFFFF", intensity: 1, castShadow: true };
  const ambient = lighting.ambient || { color: "#FFFFFF", intensity: 0.4 };
  const fog = config.fog;
  const particles = config.particles;

  return (
    <>
      {/* Sky */}
      <SkyRenderer skybox={skybox} />

      {/* Lighting */}
      <ambientLight
        color={ambient.color || "#FFFFFF"}
        intensity={ambient.intensity ?? 0.4}
      />
      <directionalLight
        position={sun.direction || [-1, -2, -1]}
        color={sun.color || "#FFFFFF"}
        intensity={sun.intensity ?? 1}
        castShadow={sun.castShadow !== false}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      {(lighting.point_lights || []).map((pl, i) => (
        <pointLight
          key={i}
          position={pl.position || [0, 3, 0]}
          color={pl.color || "#FFFFFF"}
          intensity={pl.intensity ?? 0.5}
          distance={pl.distance || 20}
        />
      ))}

      {/* Fog */}
      {fog && <fog attach="fog" args={[fog.color, fog.near, fog.far]} />}

      {/* Terrain / Ground */}
      <TerrainRenderer terrain={terrain} />

      {/* Particles */}
      {Array.isArray(particles) && particles.map((p, i) => (
        <ParticleSystem key={i} config={p} />
      ))}
    </>
  );
}

// ---- Sky Renderer ----
function SkyRenderer({
  skybox,
}: {
  skybox: EnvironmentConfig["skybox"];
}) {
  const timePresets: Record<string, { sunPosition: [number, number, number]; turbidity: number; rayleigh: number }> = {
    dawn: { sunPosition: [1, 0.1, 0], turbidity: 8, rayleigh: 4 },
    morning: { sunPosition: [5, 2, 1], turbidity: 6, rayleigh: 2 },
    noon: { sunPosition: [0, 10, 0], turbidity: 4, rayleigh: 1 },
    afternoon: { sunPosition: [-3, 4, -1], turbidity: 5, rayleigh: 1.5 },
    dusk: { sunPosition: [-1, 0.2, 0], turbidity: 10, rayleigh: 4 },
    night: { sunPosition: [0, -1, 0], turbidity: 0, rayleigh: 0 },
  };

  const preset = timePresets[skybox.time_of_day] || timePresets.noon;

  if (skybox.time_of_day === "night") {
    return (
      <>
        <color attach="background" args={["#0a0a2e"]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </>
    );
  }

  return (
    <Sky
      sunPosition={preset.sunPosition}
      turbidity={preset.turbidity}
      rayleigh={preset.rayleigh}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
    />
  );
}

// ---- Terrain Renderer ----
function TerrainRenderer({
  terrain,
}: {
  terrain: EnvironmentConfig["terrain"];
}) {
  const color = terrain.color || getTerrainColor(terrain.material);

  return (
    <mesh
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
    >
      <planeGeometry args={[terrain.size[0], terrain.size[1]]} />
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}

function getTerrainColor(material: string): string {
  const colors: Record<string, string> = {
    grass: "#4a7c3f",
    stone: "#8B8682",
    sand: "#C2B280",
    dirt: "#8B6914",
    stone_tiles: "#9E9E9E",
    cobblestone: "#7B7B7B",
    cobblestone_ancient: "#8B8378",
    snow: "#FFFAFA",
    water: "#4682B4",
    wood: "#8B6914",
    flat: "#6B8E6B",
    flat_stone: "#8B8682",
  };
  return colors[material] || "#6B8E6B";
}

// ---- Particle System ----
function ParticleSystem({
  config,
}: {
  config: NonNullable<EnvironmentConfig["particles"]>[number];
}) {
  const count =
    config.density === "low" ? 50 : config.density === "medium" ? 150 : 300;

  const particleRef = useRef<THREE.Points>(null);

  const positions = new Float32Array(count * 3);
  const area = config.area || [40, 10, 40];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * area[0];
    positions[i * 3 + 1] = Math.random() * area[1];
    positions[i * 3 + 2] = (Math.random() - 0.5) * area[2];
  }

  const particleColor = getParticleColor(config.type);
  const particleSize = getParticleSize(config.type);

  return (
    <points ref={particleRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={particleColor}
        size={particleSize}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function getParticleColor(type: string): string {
  const colors: Record<string, string> = {
    dust: "#C4A882",
    snow: "#FFFFFF",
    rain: "#87CEEB",
    fireflies: "#FFFF00",
    petals: "#FFB7C5",
    smoke: "#808080",
  };
  return colors[type] || "#FFFFFF";
}

function getParticleSize(type: string): number {
  const sizes: Record<string, number> = {
    dust: 0.05,
    snow: 0.08,
    rain: 0.03,
    fireflies: 0.12,
    petals: 0.1,
    smoke: 0.15,
  };
  return sizes[type] || 0.05;
}
