import React, { useState } from "react";
import { useStore } from "../../store/useStore";
import {
  Settings,
  Maximize,
  Box,
  Download,
  Check,
  Layers,
  Palette,
  Ruler,
  ChevronDown,
  MousePointer2,
  Move,
  Plus,
  RotateCw,
  Trash2,
  Wrench,
} from "lucide-react";
import { generateProjectJSON } from "../../utils/exporter";

const FRONT_MATERIALS = [
  {
    id: "mat_white_18",
    name: "White",
    thickness: 18,
    color: "#e0e0e0",
    hex: "#f0f0f0",
  }, // Added hex for UI swatch
  {
    id: "mat_charcoal_18",
    name: "Charcoal",
    thickness: 18,
    color: "#333333",
    hex: "#333333",
  },
  {
    id: "mat_oak_18",
    name: "Oak",
    thickness: 18,
    color: "#A0522D",
    hex: "#8B4513",
  },
];

export const Controls: React.FC = () => {
  const state = useStore();
  const { dimensions, setDimensions } = state;
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "dims" | "config" | "style" | "assembly"
  >("dims");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleExport = () => {
    const json = generateProjectJSON(state);
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (key: keyof typeof dimensions, value: number) => {
    const newDims = { ...dimensions, [key]: value };
    setDimensions(newDims.width, newDims.height, newDims.depth);
  };

  const TabButton = ({
    id,
    icon: Icon,
    label,
  }: {
    id: typeof activeTab;
    icon: any;
    label: string;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex flex-col items-center justify-center p-3 gap-1 transition-colors relative
        ${
          activeTab === id
            ? "text-blue-600 bg-blue-50/50"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium uppercase tracking-wide">
        {label}
      </span>
      {activeTab === id && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
      )}
    </button>
  );

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="absolute top-4 right-4 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all z-50 text-gray-700"
      >
        <Settings className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="absolute right-4 top-4 bottom-4 w-96 flex flex-col z-50 pointer-events-none">
      {/* Floating Panel Container */}
      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl flex flex-col h-full pointer-events-auto border border-gray-100/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg shadow-lg ${
                state.designMode === "manual"
                  ? "bg-purple-600 shadow-purple-200"
                  : "bg-blue-600 shadow-blue-200"
              }`}
            >
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">
                {state.designMode === "manual" ? "Free Design" : "Configurator"}
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Pro Studio v1.0
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="bg-gray-100 p-1 mx-6 mt-4 mb-2 rounded-lg flex items-center relative">
          <button
            onClick={() => state.setDesignMode("parametric")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-semibold transition-all relative z-10 ${
              state.designMode === "parametric"
                ? "bg-white shadow text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Settings className="w-3 h-3" />
            Parametric
          </button>
          <button
            onClick={() => state.setDesignMode("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-semibold transition-all relative z-10 ${
              state.designMode === "manual"
                ? "bg-white shadow text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Move className="w-3 h-3" />
            Manual
          </button>
        </div>

        {/* Tabs - Only in Parametric */}
        {state.designMode === "parametric" && (
          <div className="flex border-b border-gray-100 bg-white">
            <TabButton id="dims" icon={Ruler} label="Size" />
            <TabButton id="config" icon={Layers} label="Config" />
            <TabButton id="style" icon={Palette} label="Style" />
            <TabButton id="assembly" icon={Wrench} label="Assembly" />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30">
          {/* DIMENSIONS TAB */}
          {state.designMode === "parametric" && activeTab === "dims" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Maximize className="w-3 h-3 text-blue-500" />
                  Dimensions
                </h3>

                {/* Width */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      Width
                    </label>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {dimensions.width} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={1200}
                    value={dimensions.width}
                    onChange={(e) =>
                      handleChange("width", Number(e.target.value))
                    }
                    className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Height */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      Height
                    </label>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {dimensions.height} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={2400}
                    value={dimensions.height}
                    onChange={(e) =>
                      handleChange("height", Number(e.target.value))
                    }
                    className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Depth */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      Depth
                    </label>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {dimensions.depth} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={800}
                    value={dimensions.depth}
                    onChange={(e) =>
                      handleChange("depth", Number(e.target.value))
                    }
                    className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CONFIGURATION TAB */}
          {state.designMode === "parametric" && activeTab === "config" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Structure Section */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Structure
                </h3>

                <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 layer-hover">
                  <span className="text-sm text-gray-700 font-medium">
                    Back Panel
                  </span>
                  <input
                    type="checkbox"
                    checked={state.backPanel.active}
                    onChange={(e) => state.setBackPanel(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 font-medium">
                      Shelves
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {state.shelves.count}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={state.shelves.count}
                    onChange={(e) => state.setShelves(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Fronts Section */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Fronts
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {["none", "door_single", "door_double", "drawers"].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => state.setFronts({ type: type as any })}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all
                                ${
                                  state.fronts.type === type
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                }
                            `}
                      >
                        {type
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </button>
                    )
                  )}
                </div>

                {state.fronts.type !== "none" && (
                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        Inset Fronts (Vano)
                      </span>
                      <div
                        className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-300 ease-in-out ${
                          state.fronts.inset ? "bg-blue-600" : ""
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                            state.fronts.inset ? "translate-x-4" : ""
                          }`}
                        />
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={state.fronts.inset}
                        onChange={(e) =>
                          state.setFronts({ inset: e.target.checked })
                        }
                      />
                    </label>

                    {state.fronts.type === "drawers" && (
                      <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-wider font-semibold">
                          Drawer Config
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Count</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                state.setFronts({
                                  count: Math.max(
                                    1,
                                    (state.fronts.count || 3) - 1
                                  ),
                                })
                              }
                              className="w-6 h-6 rounded bg-white border flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="text-sm font-mono w-4 text-center">
                              {state.fronts.count || 3}
                            </span>
                            <button
                              onClick={() =>
                                state.setFronts({
                                  count: Math.min(
                                    8,
                                    (state.fronts.count || 3) + 1
                                  ),
                                })
                              }
                              className="w-6 h-6 rounded bg-white border flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STYLE TAB */}
          {state.designMode === "parametric" && activeTab === "style" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Carcass Material */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Carcass Finish
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[...FRONT_MATERIALS].map(
                    (
                      mat // Using same materials for carcass demo
                    ) => (
                      <button
                        key={mat.id}
                        onClick={() => {
                          /* assuming useStore has setMaterial logic, simplistic for now */
                        }}
                        className="group relative flex flex-col items-center gap-2 p-1"
                      >
                        <div
                          className="w-12 h-12 rounded-full border-2 shadow-inner transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: mat.hex,
                            borderColor:
                              state.material.id === mat.id
                                ? "#2563eb"
                                : "transparent",
                          }}
                        />
                        <span
                          className={`text-[10px] font-medium ${
                            state.material.id === mat.id
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {mat.name}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {state.fronts.type !== "none" && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Fronts Finish
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {FRONT_MATERIALS.map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => state.setFrontMaterial(mat)}
                        className="group relative flex flex-col items-center gap-2 p-1"
                      >
                        <div
                          className="w-12 h-12 rounded-full border-2 shadow-inner transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: mat.hex,
                            borderColor:
                              state.frontMaterial?.id === mat.id
                                ? "#2563eb"
                                : "transparent",
                          }}
                        />
                        <span
                          className={`text-[10px] font-medium ${
                            state.frontMaterial?.id === mat.id
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {mat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ASSEMBLY TAB */}
          {state.designMode === "parametric" && activeTab === "assembly" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Visualization
                </h3>

                {/* Exploded View Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Exploded View
                    </label>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {Math.round(state.viewConfig.explodeFactor * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.1}
                    value={state.viewConfig.explodeFactor}
                    onChange={(e) =>
                      state.setViewConfig({
                        explodeFactor: Number(e.target.value),
                      })
                    }
                    className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Show Labels Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-gray-50 mt-4 pt-4">
                  <span className="text-sm text-gray-700 font-medium">
                    Show Part Labels
                  </span>
                  <input
                    type="checkbox"
                    checked={state.viewConfig.showLabels}
                    onChange={(e) =>
                      state.setViewConfig({ showLabels: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MANUAL MODE PANEL */}
          {state.designMode === "manual" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Actions
                </h3>

                {/* Tool Select */}
                <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                  <button
                    onClick={() => state.setGizmoMode("translate")}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      state.gizmoMode === "translate"
                        ? "bg-white shadow text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Move className="w-3 h-3" /> Move
                  </button>
                  <button
                    onClick={() => state.setGizmoMode("rotate")}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      state.gizmoMode === "rotate"
                        ? "bg-white shadow text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <RotateCw className="w-3 h-3" /> Rotate
                  </button>
                </div>

                <button
                  onClick={() =>
                    state.addPart({
                      id: `custom_part_${Date.now()}`,
                      name: "New Board",
                      type: "shelf",
                      dimensions: { w: 400, h: 18, d: 300 },
                      position: { x: 0, y: 0, z: 0 },
                      grainActive: true,
                      edges: { top: 0, bottom: 0, front: 0, back: 0 },
                      materialId: state.material.id,
                      color: state.material.color,
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 dashed-border shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Board
                </button>
              </div>

              {state.selectedPartId ? (
                (() => {
                  const part = state.parts.find(
                    (p) => p.id === state.selectedPartId
                  );
                  if (!part) return null;
                  return (
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-sm font-bold text-gray-800 truncate pr-2">
                          {part.name}
                        </span>
                        <button
                          onClick={() => state.removePart(part.id)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Position */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                          Position (mm)
                        </label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          {["x", "y", "z"].map((axis) => (
                            <div key={axis} className="flex flex-col">
                              <span className="text-[10px] text-gray-400 uppercase mb-0.5">
                                {axis.toUpperCase()}
                              </span>
                              <input
                                type="number"
                                value={Math.round(
                                  part.position[
                                    axis as keyof typeof part.position
                                  ]
                                )}
                                onChange={(e) =>
                                  state.updatePart(part.id, {
                                    position: {
                                      ...part.position,
                                      [axis]: Number(e.target.value),
                                    },
                                  })
                                }
                                className="px-2 py-1 bg-gray-50 border rounded text-xs font-mono"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rotation */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                          Rotation (deg)
                        </label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          {["x", "y", "z"].map((axis) => {
                            const rad =
                              part.rotation?.[
                                axis as keyof typeof part.rotation
                              ] || 0;
                            const deg = Math.round(rad * (180 / Math.PI));
                            return (
                              <div key={axis} className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase mb-0.5">
                                  {axis.toUpperCase()}
                                </span>
                                <input
                                  type="number"
                                  value={deg}
                                  onChange={(e) => {
                                    const newRad =
                                      Number(e.target.value) * (Math.PI / 180);
                                    state.updatePart(part.id, {
                                      rotation: {
                                        ...(part.rotation || {
                                          x: 0,
                                          y: 0,
                                          z: 0,
                                        }),
                                        [axis]: newRad,
                                      },
                                    });
                                  }}
                                  className="px-2 py-1 bg-gray-50 border rounded text-xs font-mono"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Dimensions */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                          Dimensions
                        </label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          {["w", "h", "d"].map((dim) => (
                            <div key={dim} className="flex flex-col">
                              <span className="text-[10px] text-gray-400 uppercase mb-0.5">
                                {dim.toUpperCase()}
                              </span>
                              <input
                                type="number"
                                value={Math.round(
                                  part.dimensions[
                                    dim as keyof typeof part.dimensions
                                  ]
                                )}
                                onChange={(e) =>
                                  state.updatePart(part.id, {
                                    dimensions: {
                                      ...part.dimensions,
                                      [dim]: Number(e.target.value),
                                    },
                                  })
                                }
                                className="px-2 py-1 bg-gray-50 border rounded text-xs font-mono"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8 text-gray-400 text-xs flex flex-col items-center gap-2">
                  <MousePointer2 className="w-6 h-6 opacity-20" />
                  Select a part to edit properties
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
            <div className="flex items-center gap-1">
              <MousePointer2 className="w-3 h-3" />
              <span>Interact with 3D model</span>
            </div>
            <span>Scale 1:1</span>
          </div>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {copied ? "Exported!" : "Export Production JSON"}
          </button>
        </div>
      </div>
    </div>
  );
};
