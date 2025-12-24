import React from "react";
import type { Part } from "../../types";
import { Edges, Outlines } from "@react-three/drei";

import { useRef } from "react";
import { motion } from "framer-motion-3d";
import { useState } from "react";
import { useStore } from "../../store/useStore";
import { TransformControls, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { calculateSnap } from "../../utils/snapping";

interface Part3DProps {
  part: Part;
}

export const Part3D: React.FC<Part3DProps> = ({ part }) => {
  const { dimensions, position, rotation } = part;
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const {
    designMode,
    gizmoMode,
    viewConfig,
    selectPart,
    selectedPartId,
    updatePart,
  } = useStore();
  const isSelected = selectedPartId === part.id;

  // Explosion Logic
  const explodeScale =
    designMode === "parametric" ? 1 + viewConfig.explodeFactor : 1;
  const explodedPos = [
    position.x * explodeScale,
    position.y * explodeScale,
    position.z * explodeScale,
  ] as [number, number, number];

  const Label = () =>
    viewConfig.showLabels && designMode === "parametric" ? (
      <Billboard position={[0, 0, dimensions.d / 2 + 10]}>
        <Text
          fontSize={40}
          color="black"
          outlineWidth={2}
          outlineColor="white"
          anchorX="center"
          anchorY="middle"
        >
          {part.name}
        </Text>
      </Billboard>
    ) : null;

  const groupRef = useRef<THREE.Group>(null);

  const handleSelect = (e: any) => {
    e.stopPropagation();

    // Measurement Mode
    if (useStore.getState().measureMode) {
      useStore.getState().addMeasurementPoint(e.point);
      return;
    }

    if (designMode === "manual") {
      selectPart(part.id);
    } else {
      // Toggle animation in parametric mode
      if (isDoor || isDrawer) {
        setIsOpen(!isOpen);
      }
    }
  };

  const handleTransformEnd = () => {
    if (groupRef.current) {
      const { x, y, z } = groupRef.current.position;
      const { x: rx, y: ry, z: rz } = groupRef.current.rotation;

      // SNAP LOGIC
      const allParts = useStore.getState().parts;
      const otherParts = allParts.filter((p) => p.id !== part.id);
      const snappedPos = calculateSnap(part, { x, y, z }, otherParts);

      updatePart(part.id, {
        position: snappedPos,
        rotation: { x: rx, y: ry, z: rz },
      });
    }
  };

  const isDoor = part.type === "door";
  const isDrawer = part.type === "drawer_front";

  // Adjust pivot for doors?
  // Standard mesh rotates around center. Doors need to rotate around hinge (edge).
  // Ideally we wrap in a group that is positioned at the Hinge, and rotate that group.
  // But our parts system calculates Center Position.
  // To rotate around hinge without changing pivot logic in store, we offset the mesh inside a group.

  // Let's keep it simple for now: Drawers slide Z. Doors rotate (may look weird if center-pivoted).
  // Fix: If door, we need to know which side is hinged.

  // Simple Drawer Slide Implementation first as it's center-based usually.

  // Removed old handleClick, using handleSelect

  if (isDoor) {
    // For doors, we really need a pivot group.
    // Left Door: Hinge is at Left Edge.
    // Right Door: Hinge is at Right Edge.
    // Center Position passed in `part`.

    // Pivot Offset:
    // Left Door: -width/2
    // Right Door: +width/2

    const isLeft = part.id.includes("left") || part.id === "door_single"; // Single usually left hinged? Or user choice.
    const pivotOffset = isLeft ? -dimensions.w / 2 : dimensions.w / 2;

    // The Group is at position.x + pivotOffset.
    // The Mesh inside is at -pivotOffset.

    // Wait, if we move the group, we need to adjust the animation variant to rotate around local Y.

    return (
      <group>
        {isSelected && designMode === "manual" && (
          <TransformControls
            object={groupRef as any}
            mode={gizmoMode}
            onMouseUp={handleTransformEnd}
            translationSnap={10} // Snap to 10mm
            rotationSnap={Math.PI / 12} // Snap to 15deg
          />
        )}
        <group
          ref={groupRef}
          position={[
            explodedPos[0] + pivotOffset * explodeScale,
            explodedPos[1],
            explodedPos[2],
          ]}
          rotation={rotation ? [rotation.x, rotation.y, rotation.z] : [0, 0, 0]}
          onClick={handleSelect}
        >
          <group>
            <Label />
            <motion.group
              animate={{
                rotateY: isOpen ? (isLeft ? -Math.PI / 2.5 : Math.PI / 2.5) : 0,
              }}
              transition={{ type: "spring", stiffness: 40 }}
              // onClick assigned to parent group for selection logic
            >
              <mesh
                position={[-pivotOffset, 0, 0]}
                castShadow
                receiveShadow
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHovered(true);
                }}
                onPointerOut={() => setHovered(false)}
              >
                <boxGeometry
                  args={[dimensions.w, dimensions.h, dimensions.d]}
                />
                <meshStandardMaterial
                  color={part.color || "#f0f0f0"}
                  roughness={0.8}
                  metalness={0.1}
                />
                <Edges threshold={15} color="#cccccc" />
                {hovered && !isSelected && (
                  <Outlines thickness={4} color="orange" />
                )}
                {isSelected && <Outlines thickness={4} color="#3b82f6" />}
              </mesh>
            </motion.group>
          </group>
        </group>
      </group>
    );
  }

  // Standard or Drawer (Slide)
  return (
    <>
      {isSelected && designMode === "manual" && (
        <TransformControls
          object={groupRef as any}
          mode={gizmoMode}
          onMouseUp={handleTransformEnd}
          translationSnap={10}
        />
      )}
      <motion.group
        ref={groupRef as any}
        position={explodedPos}
        rotation={rotation ? [rotation.x, rotation.y, rotation.z] : [0, 0, 0]}
        animate={
          isDrawer ? { z: isOpen ? position.z + 300 : position.z } : undefined
        }
        transition={{ type: "spring", stiffness: 50 }}
        onClick={handleSelect}
      >
        <Label />
        <mesh
          castShadow
          receiveShadow
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[dimensions.w, dimensions.h, dimensions.d]} />
          <meshStandardMaterial
            color={part.color || "#f0f0f0"}
            roughness={0.8}
            metalness={0.1}
          />
          <Edges threshold={15} color="#cccccc" />
          {hovered && !isSelected && <Outlines thickness={4} color="orange" />}
          {isSelected && <Outlines thickness={4} color="#3b82f6" />}
        </mesh>
      </motion.group>
    </>
  );
};
