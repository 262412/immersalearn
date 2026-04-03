"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Billboard } from "@react-three/drei";
import * as THREE from "three";
import type { NPCInstance } from "@/lib/types/scene-graph";

interface NPCEntitiesProps {
  npcs: NPCInstance[];
  onInteract: (npcId: string) => void;
}

export function NPCEntities({ npcs, onInteract }: NPCEntitiesProps) {
  return (
    <group>
      {npcs.map((npc, i) => (
        <NPCEntity key={`${npc.id}_${i}`} npc={npc} onInteract={onInteract} />
      ))}
    </group>
  );
}

function NPCEntity({
  npc,
  onInteract,
}: {
  npc: NPCInstance;
  onInteract: (npcId: string) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [isNearby, setIsNearby] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { camera } = useThree();

  // Safe access — AI-generated JSON may omit fields
  const behavior = npc.behavior || {};
  const avatar = npc.avatar || {};
  const position = npc.position || [0, 0, 0];
  const rotation = npc.rotation || [0, 0, 0];
  const indicator = npc.indicator || { type: "speech" };
  const interactionRadius = behavior.interaction_radius || 3;

  // Check proximity to player
  useFrame(() => {
    if (!meshRef.current) return;

    const distance = camera.position.distanceTo(
      new THREE.Vector3(...position)
    );

    const nearby = distance < interactionRadius;
    if (nearby !== isNearby) {
      setIsNearby(nearby);
    }

    // Simple idle animation: gentle sway
    if (meshRef.current) {
      meshRef.current.rotation.y =
        rotation[1] * (Math.PI / 180) +
        Math.sin(Date.now() * 0.001) * 0.05;
    }
  });

  const avatarScale = avatar.scale || 1;
  const bodyColor = getAvatarColor(avatar.model || "");

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]}
    >
      {/* NPC Body — each mesh has userData for raycast detection */}
      <group>
        {/* Body */}
        <mesh castShadow position={[0, 0.75 * avatarScale, 0]} userData={{ interactId: npc.id, interactType: "npc" }}>
          <cylinderGeometry
            args={[0.25 * avatarScale, 0.3 * avatarScale, 1.1 * avatarScale, 8]}
          />
          <meshStandardMaterial color={bodyColor} />
        </mesh>

        {/* Head */}
        <mesh castShadow position={[0, 1.5 * avatarScale, 0]} userData={{ interactId: npc.id, interactType: "npc" }}>
          <sphereGeometry args={[0.2 * avatarScale, 12, 12]} />
          <meshStandardMaterial color="#F5DEB3" />
        </mesh>

        {/* Arms */}
        <mesh castShadow position={[-0.35 * avatarScale, 0.7 * avatarScale, 0]} userData={{ interactId: npc.id, interactType: "npc" }}>
          <cylinderGeometry args={[0.06 * avatarScale, 0.06 * avatarScale, 0.7 * avatarScale, 6]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        <mesh castShadow position={[0.35 * avatarScale, 0.7 * avatarScale, 0]} userData={{ interactId: npc.id, interactType: "npc" }}>
          <cylinderGeometry args={[0.06 * avatarScale, 0.06 * avatarScale, 0.7 * avatarScale, 6]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      </group>

      {/* Name tag + interaction indicator */}
      <Billboard position={[0, 2.0 * avatarScale, 0]}>
        <Html center distanceFactor={8}>
          <div className="flex flex-col items-center pointer-events-none select-none">
            {/* Interaction indicator */}
            {indicator.type && indicator.type !== "none" && (
              <div className="text-2xl mb-1 animate-bounce">
                {getIndicatorEmoji(indicator.type)}
              </div>
            )}
            {/* Name */}
            <div className="bg-black/70 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
              {npc.name}
            </div>
            {/* Interaction hint */}
            {isNearby && behavior.dialogue_enabled !== false && (
              <div className="bg-yellow-500/90 text-black text-xs px-2 py-0.5 rounded mt-1 whitespace-nowrap font-medium">
                Click to talk
              </div>
            )}
          </div>
        </Html>
      </Billboard>

      {/* Proximity glow ring */}
      {isNearby && behavior.dialogue_enabled !== false && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.8, 1.0, 32]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function getAvatarColor(model: string): string {
  const colorMap: Record<string, string> = {
    male_elder_chinese: "#4A3728",
    persian_merchant: "#8B6914",
    character_chinese_male: "#6B4226",
    character_chinese_female: "#9F5F5F",
    character_persian_merchant: "#B8860B",
    character_elder: "#696969",
  };
  return colorMap[model] || "#6B4226";
}

function getIndicatorEmoji(type: string): string {
  switch (type) {
    case "exclamation": return "❗";
    case "question": return "❓";
    case "speech": return "💬";
    default: return "";
  }
}
