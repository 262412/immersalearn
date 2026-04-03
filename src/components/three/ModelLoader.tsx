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

  // Clone once, compute bounding box, normalize scale to fit within target scale
  const { cloned, normalizedScale } = useMemo(() => {
    const c = scene.clone(true);

    // Compute bounding box of the model
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Target size from the scene graph (e.g. [2, 3, 2])
    const targetW = scale[0] || 1;
    const targetH = scale[1] || 1;
    const targetD = scale[2] || 1;

    // Compute uniform scale factor to fit model within target bounds
    const maxModelDim = Math.max(size.x, size.y, size.z, 0.01);
    const maxTargetDim = Math.max(targetW, targetH, targetD);
    const uniformScale = maxTargetDim / maxModelDim;

    // Center the model at origin (so position works correctly)
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.sub(center);
    // Put bottom of model at y=0
    c.position.y += (size.y * uniformScale) / 2;

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
      normalizedScale: [uniformScale, uniformScale, uniformScale] as [number, number, number],
    };
  }, [scene, scale, castShadow, userData]);

  return (
    <primitive
      object={cloned}
      position={position}
      rotation={rotation.map((r) => (r * Math.PI) / 180)}
      scale={normalizedScale}
    />
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
