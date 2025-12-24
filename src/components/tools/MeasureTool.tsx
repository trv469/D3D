import React, { useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useStore } from "../../store/useStore";
import { DimensionLine } from "../3d/DimensionLine";
import * as THREE from "three";

export const MeasureTool: React.FC = () => {
  const { measureMode, measurements, measurePendingPoint, removeMeasurement } =
    useStore();
  const { raycaster, scene, camera, pointer } = useThree();
  const [cursorPoint, setCursorPoint] = useState<THREE.Vector3 | null>(null);

  useFrame(() => {
    if (!measureMode || !measurePendingPoint) {
      if (cursorPoint) setCursorPoint(null);
      return;
    }

    raycaster.setFromCamera(pointer, camera);
    // Raycast against everything
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Find first relevant hit (ignoring Lines/Helpers if possible, but parts are Meshes)
    // We want to snap to something.
    if (intersects.length > 0) {
      // Simple hit
      setCursorPoint(intersects[0].point);
    }
  });

  return (
    <group>
      {/* Existing Measurements */}
      {measurements.map((m) => (
        <group
          key={m.id}
          onClick={(e) => {
            if (measureMode) {
              e.stopPropagation();
              // Click on measurement to delete it?
              removeMeasurement(m.id);
            }
          }}
        >
          <DimensionLine
            start={[m.start.x, m.start.y, m.start.z]}
            end={[m.end.x, m.end.y, m.end.z]}
            label={`${Math.round(m.distance)}mm`}
            color="#2563eb"
            offset={[0, 0, 0]}
          />
        </group>
      ))}

      {/* Pending Line */}
      {measureMode && measurePendingPoint && cursorPoint && (
        <DimensionLine
          start={[
            measurePendingPoint.x,
            measurePendingPoint.y,
            measurePendingPoint.z,
          ]}
          end={[cursorPoint.x, cursorPoint.y, cursorPoint.z]}
          label={`${Math.round(
            new THREE.Vector3(
              measurePendingPoint.x,
              measurePendingPoint.y,
              measurePendingPoint.z
            ).distanceTo(cursorPoint)
          )}mm`}
          color="#f59e0b" // Amber/Orange
          offset={[0, 0, 0]}
        />
      )}
    </group>
  );
};
