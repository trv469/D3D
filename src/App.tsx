import { Canvas } from "@react-three/fiber";
import { useRef, Suspense } from "react";
import {
  OrbitControls,
  Grid,
  ContactShadows,
  Environment,
  Loader,
  GizmoHelper,
  GizmoViewcube,
} from "@react-three/drei";
import { Cabinet } from "./components/3d/Cabinet";
import { Controls } from "./components/ui/Controls";
import { MeasureTool } from "./components/tools/MeasureTool";
import { Toolbox } from "./components/ui/Toolbox";
import { ContextToolbar } from "./components/ui/ContextToolbar";
import * as THREE from "three";
import { useStore } from "./store/useStore";

function App() {
  const cameraRef = useRef<THREE.Camera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      {/* Left Panel - Toolbox (Tools + Library) */}
      <Toolbox />

      {/* Main 3D Area */}
      {/* Main 3D Area */}
      <div
        ref={containerRef}
        className="flex-1 relative min-w-0 overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Canvas
          className="w-full h-full"
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

          <MeasureTool />

          <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
            <GizmoViewcube
              faces={["Der", "Izq", "Arr", "Aba", "Frente", "Atrás"]}
              color="#f3f4f6"
              strokeColor="#d1d5db"
              textColor="#374151"
              hoverColor="#3b82f6"
            />
          </GizmoHelper>
        </Canvas>

        <ContextToolbar />
        <Loader />
      </div>

      {/* Right Panel - Properties (Controls) */}
      <div className="w-80 h-full z-30 shadow-xl relative border-l bg-white flex-none">
        <Controls fixed />
      </div>
    </div>
  );
}

export default App;
