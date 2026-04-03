"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Billboard } from "@react-three/drei";
import * as THREE from "three";
import type { InteractiveObject } from "@/lib/types/scene-graph";
import { ModelLoader } from "./ModelLoader";

interface InteractiveObjectsProps {
  objects: InteractiveObject[];
  onInteract: (objectId: string) => void;
}

export function InteractiveObjects({
  objects,
  onInteract,
}: InteractiveObjectsProps) {
  return (
    <group>
      {objects.map((obj, i) => (
        <InteractiveObjectEntity
          key={`${obj.id}_${i}`}
          object={obj}
          onInteract={onInteract}
        />
      ))}
    </group>
  );
}

function InteractiveObjectEntity({
  object: obj,
  onInteract,
}: {
  object: InteractiveObject;
  onInteract: (objectId: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isNearby, setIsNearby] = useState(false);
  const { camera } = useThree();

  // Safe access
  const position = obj.position || [0, 0.5, 0];
  const rotation = obj.rotation || [0, 0, 0];
  const scale = obj.scale || [0.5, 0.5, 0.5];
  const interaction = obj.interaction || { type: "examine", highlight_on_hover: true };
  const material = obj.material || {};

  // Proximity check + hover glow animation
  useFrame(() => {
    if (!meshRef.current) return;

    const distance = camera.position.distanceTo(
      new THREE.Vector3(...position)
    );
    const nearby = distance < 4;
    if (nearby !== isNearby) setIsNearby(nearby);

    // Gentle floating animation for interactive items
    if (interaction.highlight_on_hover) {
      meshRef.current.position.y =
        position[1] + Math.sin(Date.now() * 0.002) * 0.1;
    }
  });

  const primitive = obj.primitive || "box";
  const color = material.color || "#FFD700";
  const emissiveColor = material.emissive || (isHovered ? "#443300" : "#000000");
  const emissiveIntensity = material.emissiveIntensity || (isHovered ? 0.5 : 0);

  return (
    <group>
      {obj.model_url ? (
        <ModelLoader
          url={obj.model_url}
          position={position}
          rotation={rotation}
          scale={scale}
          fallbackColor={color}
          fallbackPrimitive={primitive as any}
          fallbackScale={scale}
          castShadow
          userData={{ interactId: obj.id, interactType: "object" }}
        />
      ) : (
        <mesh
          ref={meshRef}
          position={position}
          rotation={rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]}
          castShadow
          userData={{ interactId: obj.id, interactType: "object" }}
        >
          <PrimitiveGeometry type={primitive} scale={scale} />
          <meshStandardMaterial
            color={color}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            roughness={0.5}
          />
        </mesh>
      )}

      {/* Label on hover when nearby */}
      {isNearby && (
        <Billboard position={[position[0], position[1] + scale[1] + 0.3, position[2]]}>
          <Html center distanceFactor={6}>
            <div className="flex flex-col items-center pointer-events-none select-none">
              <div className="bg-black/80 text-yellow-300 text-xs px-2 py-1 rounded whitespace-nowrap">
                🔍 {obj.name || "Object"}
              </div>
              {isHovered && (
                <div className="bg-yellow-500/90 text-black text-xs px-2 py-0.5 rounded mt-0.5 whitespace-nowrap font-medium">
                  Click to examine
                </div>
              )}
            </div>
          </Html>
        </Billboard>
      )}

      {/* Glow ring on ground */}
      {isNearby && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[position[0], 0.02, position[2]]}
        >
          <ringGeometry args={[0.3, 0.5, 32]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.3 + Math.sin(Date.now() * 0.003) * 0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function PrimitiveGeometry({
  type,
  scale,
}: {
  type: string;
  scale: [number, number, number];
}) {
  switch (type) {
    case "sphere":
      return <sphereGeometry args={[scale[0] / 2, 16, 16]} />;
    case "cylinder":
      return (
        <cylinderGeometry
          args={[scale[0] / 2, scale[0] / 2, scale[1], 16]}
        />
      );
    case "cone":
      return <coneGeometry args={[scale[0] / 2, scale[1], 16]} />;
    case "box":
    default:
      return <boxGeometry args={scale} />;
  }
}
