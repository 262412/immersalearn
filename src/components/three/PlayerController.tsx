"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface PlayerControllerProps {
  spawnPosition: [number, number, number];
  spawnLookAt: [number, number, number];
  moveSpeed?: number;
  lookSensitivity?: number;
}

export function PlayerController({
  spawnPosition,
  spawnLookAt,
  moveSpeed = 4,
  lookSensitivity = 0.002,
}: PlayerControllerProps) {
  const { camera, gl, scene } = useThree();
  const isLocked = useRef(false);
  const keysPressed = useRef<Set<string>>(new Set());
  const yaw = useRef(0);   // horizontal rotation
  const pitch = useRef(0);  // vertical rotation
  const initialized = useRef(false);
  const eyeHeight = spawnPosition[1] || 1.7;

  // Initialize camera position and compute initial yaw/pitch
  useEffect(() => {
    camera.position.set(...spawnPosition);
    camera.lookAt(new THREE.Vector3(...spawnLookAt));

    // Extract yaw and pitch from the camera's current look direction
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    yaw.current = Math.atan2(-dir.x, -dir.z);
    pitch.current = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1));
    initialized.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pointer lock
  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerLockChange = () => {
      const wasLocked = isLocked.current;
      isLocked.current = document.pointerLockElement === canvas;

      // Sync yaw/pitch when locking to avoid jumps
      if (isLocked.current && !wasLocked) {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        yaw.current = Math.atan2(-dir.x, -dir.z);
        pitch.current = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1));
      }
    };

    const requestLock = () => {
      if (!isLocked.current) {
        canvas.requestPointerLock();
      }
    };

    canvas.addEventListener("click", requestLock);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    return () => {
      canvas.removeEventListener("click", requestLock);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, [gl, camera]);

  // Mouse look
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked.current || !initialized.current) return;

      // Filter out erratic initial mousemove events
      if (Math.abs(e.movementX) > 200 || Math.abs(e.movementY) > 200) return;

      yaw.current -= e.movementX * lookSensitivity;
      pitch.current -= e.movementY * lookSensitivity;

      // Clamp pitch
      pitch.current = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, pitch.current));

      // Apply rotation via euler (YXZ order avoids gimbal issues)
      const euler = new THREE.Euler(pitch.current, yaw.current, 0, "YXZ");
      camera.quaternion.setFromEuler(euler);
    };

    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [camera, lookSensitivity]);

  // Keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code);
      if (e.code === "Escape") document.exitPointerLock();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Click-to-interact: raycast from screen center
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    raycaster.far = 15; // Only detect objects within 15 units

    const onClick = () => {
      if (!isLocked.current) return;

      // Raycast from screen center
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        // Walk up the parent chain to find userData
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          if (obj.userData && obj.userData.interactId) {
            window.dispatchEvent(
              new CustomEvent("scene-interact", {
                detail: {
                  type: obj.userData.interactType || "object",
                  id: obj.userData.interactId,
                },
              })
            );
            return;
          }
          obj = obj.parent;
        }
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [camera, scene]);

  // Movement loop
  useFrame((_, delta) => {
    if (!isLocked.current) return;

    const keys = keysPressed.current;
    let moveX = 0;
    let moveZ = 0;

    if (keys.has("KeyW") || keys.has("ArrowUp")) moveZ = 1;
    if (keys.has("KeyS") || keys.has("ArrowDown")) moveZ = -1;
    if (keys.has("KeyA") || keys.has("ArrowLeft")) moveX = -1;
    if (keys.has("KeyD") || keys.has("ArrowRight")) moveX = 1;

    if (moveX === 0 && moveZ === 0) return;

    // Forward direction (horizontal, based on yaw only)
    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(-forward.z, 0, forward.x);

    const movement = new THREE.Vector3();
    movement.addScaledVector(forward, moveZ);
    movement.addScaledVector(right, moveX);
    movement.normalize();

    camera.position.addScaledVector(movement, moveSpeed * delta);
    camera.position.y = eyeHeight;
  });

  return null;
}
