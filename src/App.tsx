import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Stage, ContactShadows } from "@react-three/drei";
import { Cabinet } from "./components/3d/Cabinet";
import { Controls } from "./components/ui/Controls";
import { Box } from "lucide-react";

function App() {
  return (
    <div className="w-full h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - Modules (Placeholder) */}
      <div className="w-20 bg-white border-r flex flex-col items-center py-6 gap-4 z-10">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
          <Box className="w-6 h-6 text-white" />
        </div>
        <div className="text-xs text-gray-400 font-medium rotate-[-90deg] mt-10 whitespace-nowrap">
          LIBRARY
        </div>
      </div>

      {/* Main 3D Area */}
      <div className="flex-1 relative">
        <Canvas camera={{ position: [2000, 2000, 2000], fov: 45 }}>
          <color attach="background" args={["#f5f5f7"]} />
          <OrbitControls
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 1.75}
          />

          <Stage
            environment="city"
            intensity={0.5}
            shadows={false} // Disable Stage's default shadow to use custom ContactShadows
            adjustCamera={1.2}
          >
            <Cabinet />
          </Stage>

          {/* Premium Ground Shadows */}
          <ContactShadows
            position={[0, -0.1, 0]}
            opacity={0.4}
            scale={40}
            blur={2.5}
            far={4.5}
            color="#000000"
          />

          {/* Subtle Grid for Context */}
          <Grid
            renderOrder={-1}
            position={[0, -0.1, 0]}
            infiniteGrid
            cellSize={100}
            sectionSize={1000}
            fadeDistance={2500}
            sectionThickness={1}
            cellThickness={0.5}
            sectionColor="#e5e7eb"
            cellColor="#f3f4f6"
          />
        </Canvas>

        {/* Overlay Info (Top Left) */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <h1 className="text-2xl font-bold text-gray-800">D3D Designer</h1>
          <p className="text-sm text-gray-500">Parametric Core v0.1</p>
        </div>
      </div>

      {/* Right Properties Panel */}
      <div className="relative z-10">
        <Controls />
      </div>
    </div>
  );
}

export default App;
