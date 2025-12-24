import React from "react";
import { useStore } from "../../store/useStore";
import { Part3D } from "./Part";

export const Cabinet: React.FC = () => {
  const parts = useStore((state) => state.parts);

  return (
    <group>
      {parts.map((part) => (
        <Part3D key={part.id} part={part} />
      ))}
    </group>
  );
};
