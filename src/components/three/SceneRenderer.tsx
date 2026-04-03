"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Environment } from "./Environment";
import { PlayerController } from "./PlayerController";
import { SceneObjects } from "./SceneObjects";
import { NPCEntities } from "./NPCEntities";
import { InteractiveObjects } from "./InteractiveObjects";
import type { SceneGraph } from "@/lib/types/scene-graph";

interface SceneRendererProps {
  sceneGraph: SceneGraph;
  onNPCInteract: (npcId: string) => void;
  onObjectInteract: (objectId: string) => void;
  onTriggerActivated: (triggerId: string) => void;
}

export function SceneRenderer({
  sceneGraph,
  onNPCInteract,
  onObjectInteract,
}: SceneRendererProps) {
  // SceneGraph is pre-normalized by the API — all fields guaranteed to exist
  const { environment, layout, structures, npcs, interactive_objects } = sceneGraph;

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{
          fov: 70,
          near: 0.1,
          far: 200,
          position: layout.player_spawn.position,
        }}
        style={{ background: "#000" }}
      >
        <Suspense fallback={null}>
          <Environment config={environment} />
          <SceneObjects structures={structures} />
          <NPCEntities npcs={npcs} onInteract={onNPCInteract} />
          <InteractiveObjects objects={interactive_objects} onInteract={onObjectInteract} />
          <PlayerController
            spawnPosition={layout.player_spawn.position}
            spawnLookAt={layout.player_spawn.look_at}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
