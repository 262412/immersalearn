"use client";

import type { Structure } from "@/lib/types/scene-graph";
import { ModelLoader } from "./ModelLoader";

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
  const position = (structure.position || [0, 0, 0]) as [number, number, number];
  const rotation = (structure.rotation || [0, 0, 0]) as [number, number, number];
  const scale = (structure.scale || [1, 1, 1]) as [number, number, number];
  const material = structure.material;
  const label = structure.label;
  const primitive = structure.primitive || "box";

  // If model_url is available, use the ModelLoader
  if (structure.model_url) {
    return (
      <group>
        <ModelLoader
          url={structure.model_url}
          position={position}
          rotation={rotation}
          scale={scale}
          fallbackColor={material?.color || "#888888"}
          fallbackPrimitive={primitive as any}
          fallbackScale={scale}
          castShadow
        />
        {label && <FloatingLabel position={position} text={label} height={scale[1] + 0.5} />}
        {structure.children?.map((child, i) => (
          <StructureObject key={`${child.id}_${i}`} structure={child} />
        ))}
      </group>
    );
  }

  // Fallback: primitive rendering (existing behavior)
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

      {label && <FloatingLabel position={[0, 0, 0]} text={label} height={scale[1] + 0.5} />}

      {structure.children?.map((child, i) => (
        <StructureObject key={`${child.id}_${i}`} structure={child} />
      ))}
    </group>
  );
}

function PrimitiveGeometry({ type, scale }: { type: string; scale: [number, number, number] }) {
  switch (type) {
    case "sphere": return <sphereGeometry args={[scale[0] / 2, 16, 16]} />;
    case "cylinder": return <cylinderGeometry args={[scale[0] / 2, scale[0] / 2, scale[1], 16]} />;
    case "cone": return <coneGeometry args={[scale[0] / 2, scale[1], 16]} />;
    case "box": default: return <boxGeometry args={scale} />;
  }
}

function FloatingLabel({ position, text, height }: { position: [number, number, number]; text: string; height: number }) {
  return (
    <sprite position={[position[0], position[1] + height, position[2]]} scale={[text.length * 0.15, 0.3, 1]}>
      <spriteMaterial color="#ffffff" transparent opacity={0.8} />
    </sprite>
  );
}
