import React from "react";
import type { Part } from "../../types";
import { Edges } from "@react-three/drei";

interface Part3DProps {
  part: Part;
}

export const Part3D: React.FC<Part3DProps> = ({ part }) => {
  const { dimensions, position } = part;

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[dimensions.w, dimensions.h, dimensions.d]} />
        <meshStandardMaterial
          color={part.color || "#f0f0f0"}
          roughness={0.8}
          metalness={0.1}
        />
        <Edges threshold={15} color="#cccccc" />
      </mesh>
    </group>
  );
};
