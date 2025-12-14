import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  ContactShadows,
  Environment,
  Loader,
} from "@react-three/drei";
import { Cabinet } from "./components/3d/Cabinet";
import { Controls } from "./components/ui/Controls";
import { useRef, Suspense } from "react";
import * as THREE from "three";
import { useStore } from "./store/useStore";
import { Box } from "lucide-react";

const LIBRARY_ITEMS = [
  { type: "shelf", name: "Repisa", icon: Box, dims: { w: 400, h: 18, d: 300 } },
  {
    type: "divider",
    name: "Divisor",
    icon: Box,
    dims: { w: 18, h: 400, d: 300 },
  },
  { type: "panel", name: "Panel", icon: Box, dims: { w: 400, h: 400, d: 18 } },
];

// ...

function App() {
  const cameraRef = useRef<THREE.Camera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (
    e: React.DragEvent,
    item: (typeof LIBRARY_ITEMS)[0]
  ) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (
      !data ||
      !cameraRef.current ||
      !sceneRef.current ||
      !containerRef.current
    )
      return;

    const item = JSON.parse(data);
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    // Raycast against scene children
    const intersects = raycaster.intersectObjects(
      sceneRef.current.children,
      true
    );

    let position = { x: 0, y: 0, z: 0 };

    if (intersects.length > 0) {
      // Hit something!
      const hit = intersects[0];

      // Check if we hit the floor (Grid/Shadows usually at y ~ 0)
      if (Math.abs(hit.point.y) < 1) {
        // Snap to floor
        position = { x: hit.point.x, y: item.dims.h / 2, z: hit.point.z };
      } else {
        // Hit another part.
        // For now, place at hit point.
        // TODO: Snap to Face center or stack?
        position = { x: hit.point.x, y: hit.point.y, z: hit.point.z };
      }
    } else {
      // Hit nothing (e.g. sky), project to Ground Plane (Y=0)
      const ray = raycaster.ray;
      const targetY = 0;
      // t = (targetY - origin.y) / direction.y
      const t = (targetY - ray.origin.y) / ray.direction.y;
      if (t > 0) {
        const point = ray.at(t, new THREE.Vector3());
        position = { x: point.x, y: item.dims.h / 2, z: point.z };
      }
    }

    useStore.getState().addPart({
      id: `part_${Date.now()}`,
      name: item.name,
      type: item.type as any,
      dimensions: item.dims,
      position: position,
      grainActive: true,
      edges: { top: 0, bottom: 0, front: 0, back: 0 },
      materialId: useStore.getState().material.id,
      color: useStore.getState().material.color,
    });
    // Also switch to Manual Mode to avoid confusion?
    useStore.getState().setDesignMode("manual");
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - Modules */}
      <div className="w-20 bg-white border-r flex flex-col items-center py-6 gap-4 z-10 shadow-sm">
        <div className="mb-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest rotate-[-90deg]">
            LIB
          </span>
        </div>
        {LIBRARY_ITEMS.map((item) => (
          <div
            key={item.name}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center cursor-grab hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title={item.name}
          >
            <item.icon className="w-6 h-6" />
          </div>
        ))}
      </div>

      {/* Main 3D Area */}
      <div
        ref={containerRef}
        className="flex-1 relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Canvas
          camera={{ position: [2000, 2000, 2000], fov: 45, far: 50000 }}
          onPointerMissed={() => useStore.getState().selectPart(null)}
          onCreated={({ camera, scene }) => {
            cameraRef.current = camera;
            sceneRef.current = scene;
          }}
          shadows
        >
          <color attach="background" args={["#f5f5f7"]} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[1000, 1000, 500]}
            intensity={1}
            castShadow
          />

          <Suspense fallback={null}>
            <Environment preset="city" />
            <group position={[0, 0, 0]}>
              <Cabinet />
            </group>
          </Suspense>

          <OrbitControls
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
          />

          {/* Visualization Aids */}
          <axesHelper args={[500]} />

          {/* Premium Ground Shadows */}
          <ContactShadows
            position={[0, 0.1, 0]}
            opacity={0.4}
            scale={40}
            blur={2.5}
            far={4.5}
            color="#000000"
          />

          {/* Grid */}
          <Grid
            renderOrder={-1}
            position={[0, 0, 0]}
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

      <div className="relative z-10">
        <Controls />
      </div>
      <Loader />
    </div>
  );
}

export default App;
