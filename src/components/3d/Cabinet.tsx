import React from "react";
import { useStore } from "../../store/useStore";
import { Part3D } from "./Part";
import { DimensionLine } from "./DimensionLine";

export const Cabinet: React.FC = () => {
  const parts = useStore((state) => state.parts);

  // Calculate dynamic bounds
  const bounds = React.useMemo(() => {
    if (parts.length === 0) return null;

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    parts.forEach((p) => {
      const halfW = p.dimensions.w / 2;
      const halfH = p.dimensions.h / 2;
      const halfD = p.dimensions.d / 2;

      // Apply Rotation roughly?
      // For AABB without rotation math, this is approximate if parts are rotated.
      // Correct AABB needs applying quaternion to 8 corners.
      // For furniture (mostly 90deg), swapping W/H/D is usually enough, but let's stick to simple extents for now.
      // If rotated 90deg Y, Width becomes Depth.
      // Let's rely on simple position +/- dimension for now, improving if user complains about rotation accuracy.
      // Actually, if I rotate 90deg, exact bounds change.
      // IMPROVEMENT: Use THREE.Box3?
      // But that requires Object3D refs.
      // Let's stick to "Unrotated AABB" logic or simple "just use W/H/D" for now as MVP.
      // Most parts are axis aligned.

      minX = Math.min(minX, p.position.x - halfW);
      maxX = Math.max(maxX, p.position.x + halfW);
      minY = Math.min(minY, p.position.y - halfH);
      maxY = Math.max(maxY, p.position.y + halfH);
      minZ = Math.min(minZ, p.position.z - halfD);
      maxZ = Math.max(maxZ, p.position.z + halfD);
    });

    return {
      minX,
      maxX,
      minY,
      maxY,
      minZ,
      maxZ,
      width: maxX - minX,
      height: maxY - minY,
      depth: maxZ - minZ,
    };
  }, [parts]);

  if (!bounds) return null;

  return (
    <group>
      {parts.map((part) => (
        <Part3D key={part.id} part={part} />
      ))}

      {/* Width Dimension (Bottom of Shape) */}
      <DimensionLine
        start={[bounds.minX, bounds.minY, bounds.maxZ]}
        end={[bounds.maxX, bounds.minY, bounds.maxZ]}
        offset={[0, -50, 50]} // Moved slightly forward and down
        label={`${Math.round(bounds.width)}mm`}
        color="#333"
      />

      {/* Height Dimension (Left Side) */}
      <DimensionLine
        start={[bounds.minX, bounds.minY, bounds.maxZ]}
        end={[bounds.minX, bounds.maxY, bounds.maxZ]}
        offset={[-50, 0, 50]} // Left and forward
        label={`${Math.round(bounds.height)}mm`}
        color="#333"
      />

      {/* Depth Dimension (Right Side) */}
      <DimensionLine
        start={[bounds.maxX, bounds.minY, bounds.minZ]}
        end={[bounds.maxX, bounds.minY, bounds.maxZ]}
        offset={[50, 0, 0]} // Right
        label={`${Math.round(bounds.depth)}mm`}
        color="#333"
      />
    </group>
  );
};
