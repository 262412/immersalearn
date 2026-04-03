"use client";

import * as THREE from "three";
import type { Structure } from "@/lib/types/scene-graph";

interface SceneObjectsProps {
  structures: Structure[];
}

export function SceneObjects({ structures }: SceneObjectsProps) {
  return (
    <group>
      {structures.map((structure, i) => (
        <StructureObject key={`${structure.id}_${i}`} structure={structure} />
      ))}
    </group>
  );
}

function StructureObject({ structure }: { structure: Structure }) {
  const position = structure.position || [0, 0, 0];
  const rotation = structure.rotation || [0, 0, 0];
  const scale = structure.scale || [1, 1, 1];
  const material = structure.material;
  const label = structure.label;

  const primitive = structure.primitive || "box";

  const matProps = {
    color: material?.color || "#888888",
    metalness: material?.metalness ?? 0.1,
    roughness: material?.roughness ?? 0.8,
    transparent: (material?.opacity ?? 1) < 1,
    opacity: material?.opacity ?? 1,
  };

  return (
    <group
      position={position}
      rotation={rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]}
    >
      <mesh castShadow receiveShadow>
        <PrimitiveGeometry type={primitive} scale={scale} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Label floating above object */}
      {label && (
        <FloatingLabel text={label} height={scale[1] + 0.5} />
      )}

      {/* Render children */}
      {structure.children?.map((child) => (
        <StructureObject key={child.id} structure={child} />
      ))}
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
      return <cylinderGeometry args={[scale[0] / 2, scale[0] / 2, scale[1], 16]} />;
    case "cone":
      return <coneGeometry args={[scale[0] / 2, scale[1], 16]} />;
    case "box":
    default:
      return <boxGeometry args={scale} />;
  }
}

function FloatingLabel({ text, height }: { text: string; height: number }) {
  // Simple sprite-based label
  return (
    <sprite position={[0, height, 0]} scale={[text.length * 0.15, 0.3, 1]}>
      <spriteMaterial
        color="#ffffff"
        transparent
        opacity={0.8}
      />
    </sprite>
  );
}
