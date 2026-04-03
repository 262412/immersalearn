"use client";

import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface ModelLoaderProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  fallbackColor?: string;
  fallbackPrimitive?: "box" | "cylinder" | "sphere" | "cone";
  fallbackScale?: [number, number, number];
  castShadow?: boolean;
  userData?: Record<string, any>;
}

// ---- Error Boundary (must be class component) ----
class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.log("[ModelLoader] Load error:", error.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ---- GLB Model Renderer ----
function GLBModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  castShadow = true,
  userData,
}: ModelLoaderProps) {
  const { scene } = useGLTF(url);

  // Clone once, normalize: scale to fit target size, bottom sits at y=0
  const { cloned, normalizedScale, yOffset } = useMemo(() => {
    const c = scene.clone(true);

    // Compute bounding box of the original model
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Uniform scale: fit the model within the target scale bounds
    const maxModelDim = Math.max(size.x, size.y, size.z, 0.01);
    const maxTargetDim = Math.max(scale[0] || 1, scale[1] || 1, scale[2] || 1);
    const s = maxTargetDim / maxModelDim;

    // Offset to center horizontally and sit bottom on the ground
    // After scaling, the bottom of the model should be at the group's y=0
    const bottomY = box.min.y * s;

    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = true;
        if (userData) {
          child.userData = { ...child.userData, ...userData };
        }
      }
    });

    return {
      cloned: c,
      normalizedScale: [s, s, s] as [number, number, number],
      yOffset: -bottomY, // lift model so bottom is at y=0 of the group
    };
  }, [scene, scale, castShadow, userData]);

  // position from SceneGraph is where the object sits ON the ground
  // The group is placed at the SceneGraph position, model inside is offset to sit on ground
  return (
    <group position={position} rotation={rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]}>
      <primitive
        object={cloned}
        position={[0, yOffset, 0]}
        scale={normalizedScale}
      />
    </group>
  );
}

// ---- Fallback Primitive ----
function FallbackMesh({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  color = "#888888",
  primitive = "box",
  castShadow = true,
  userData,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  primitive?: string;
  castShadow?: boolean;
  userData?: Record<string, any>;
}) {
  return (
    <mesh
      position={position}
      rotation={rotation.map((r) => (r * Math.PI) / 180) as [number, number, number]}
      castShadow={castShadow}
      receiveShadow
      userData={userData}
    >
      {primitive === "sphere" && <sphereGeometry args={[scale[0] / 2, 16, 16]} />}
      {primitive === "cylinder" && <cylinderGeometry args={[scale[0] / 2, scale[0] / 2, scale[1], 16]} />}
      {primitive === "cone" && <coneGeometry args={[scale[0] / 2, scale[1], 16]} />}
      {(primitive === "box" || !["sphere", "cylinder", "cone"].includes(primitive)) && (
        <boxGeometry args={scale} />
      )}
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

// ---- Main Component ----
export function ModelLoader(props: ModelLoaderProps) {
  const {
    url,
    position,
    rotation,
    scale,
    fallbackColor = "#888888",
    fallbackPrimitive = "box",
    fallbackScale,
    castShadow,
    userData,
  } = props;

  const fallback = (
    <FallbackMesh
      position={position}
      rotation={rotation}
      scale={fallbackScale || scale}
      color={fallbackColor}
      primitive={fallbackPrimitive}
      castShadow={castShadow}
      userData={userData}
    />
  );

  // No URL → just render primitive
  if (!url) return fallback;

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GLBModel
          url={url}
          position={position}
          rotation={rotation}
          scale={scale}
          castShadow={castShadow}
          userData={userData}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
}
