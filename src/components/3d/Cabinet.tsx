import React from "react";
import { useStore } from "../../store/useStore";
import { Part3D } from "./Part";
import { DimensionLine } from "./DimensionLine";

export const Cabinet: React.FC = () => {
  const parts = useStore((state) => state.parts);
  const dimensions = useStore((state) => state.dimensions);

  const { width, height } = dimensions;

  // Calculate extents for dimensions
  const halfW = width / 2;
  const halfH = height / 2;
  // const halfD = depth / 2;

  // We place dimensions slightly outside the bounding box

  return (
    <group>
      {parts.map((part) => (
        <Part3D key={part.id} part={part} />
      ))}

      {/* Width Dimension (Bottom) */}
      <DimensionLine
        start={[-halfW, -halfH, 0]}
        end={[halfW, -halfH, 0]}
        offset={[0, -100, 0]}
        label={`${width}mm`}
        color="#333"
      />

      {/* Height Dimension (Left) */}
      <DimensionLine
        start={[-halfW, -halfH, 0]}
        end={[-halfW, halfH, 0]}
        offset={[-100, 0, 0]}
        label={`${height}mm`}
        color="#333"
      />
    </group>
  );
};
