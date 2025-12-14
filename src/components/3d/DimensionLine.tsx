import React from "react";
import { Line, Text, Billboard } from "@react-three/drei";
import { Vector3 } from "three";

interface DimensionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  label?: string;
  offset?: [number, number, number];
  color?: string;
}

export const DimensionLine: React.FC<DimensionLineProps> = ({
  start,
  end,
  label,
  offset = [0, 0, 0],
  color = "black",
}) => {
  const s = new Vector3(...start).add(new Vector3(...offset));
  const e = new Vector3(...end).add(new Vector3(...offset));

  const mid = new Vector3().addVectors(s, e).multiplyScalar(0.5);

  return (
    <group>
      {/* Main Line */}
      <Line points={[s, e]} color={color} lineWidth={1} dashed={false} />

      {/* End Caps (Ticks) */}
      {/* We could add small perpendicular lines here if we wanted to be fancy */}

      {/* Label */}
      {label && (
        <Billboard position={mid}>
          <Text
            fontSize={40}
            color={color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={2}
            outlineColor="white"
          >
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  );
};
