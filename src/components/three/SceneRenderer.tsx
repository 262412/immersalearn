"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Environment } from "./Environment";
import { SceneObjects } from "./SceneObjects";
import { NPCEntities } from "./NPCEntities";
import { InteractiveObjects } from "./InteractiveObjects";
import type { SceneGraph } from "@/lib/types/scene-graph";

interface SceneRendererProps {
  sceneGraph: SceneGraph;
  onNPCInteract: (npcId: string) => void;
  onObjectInteract: (objectId: string) => void;
}

export function SceneRenderer({
  sceneGraph,
  onNPCInteract,
  onObjectInteract,
}: SceneRendererProps) {
  const { environment, layout, structures, npcs, interactive_objects } = sceneGraph;
  const spawn = layout.player_spawn.position;
  const lookAt = layout.player_spawn.look_at;

  // Camera positioned higher and further back for orbit view
  const cameraPos: [number, number, number] = [spawn[0] + 5, spawn[1] + 8, spawn[2] + 12];

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{
          fov: 55,
          near: 0.1,
          far: 300,
          position: cameraPos,
        }}
        style={{ background: "#87CEEB" }}
      >
        <Suspense fallback={null}>
          <Environment config={environment} />
          <SceneObjects structures={structures} />
          <NPCEntities npcs={npcs} onInteract={onNPCInteract} />
          <InteractiveObjects objects={interactive_objects} onInteract={onObjectInteract} />

          {/* Orbit controls — drag to rotate, scroll to zoom, no pointer lock */}
          <OrbitControls
            target={lookAt}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2.1}
            makeDefault
          />

          {/* Post-processing — subtle stylization */}
          <EffectComposer>
            <Bloom
              intensity={0.3}
              luminanceThreshold={0.8}
              luminanceSmoothing={0.9}
            />
            <Vignette eskil={false} offset={0.1} darkness={0.4} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
