import React from "react";
import { useStore } from "../../store/useStore";
import { Settings, Maximize, Cuboid, Box, Download, Check } from "lucide-react";
import { generateProjectJSON } from "../../utils/exporter";
import { useState } from "react";

const FRONT_MATERIALS = [
  { id: "mat_white_18", name: "White", thickness: 18, color: "#e0e0e0" },
  { id: "mat_charcoal_18", name: "Charcoal", thickness: 18, color: "#333333" },
  { id: "mat_oak_18", name: "Oak", thickness: 18, color: "#A0522D" },
];

export const Controls: React.FC = () => {
  const state = useStore();
  const { dimensions, setDimensions } = state;
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const json = generateProjectJSON(state);
    console.log("Project JSON:", json);
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (key: keyof typeof dimensions, value: number) => {
    // Basic validation to prevent breaking
    const newDims = { ...dimensions, [key]: value };
    setDimensions(newDims.width, newDims.height, newDims.depth);
  };

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="flex items-center gap-2 border-b pb-4">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-800">Properties</h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Dimensions (mm)
        </h3>

        {/* Width */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Maximize className="w-4 h-4 rotate-90" />
            Width
          </label>
          <div className="flex gap-2">
            <input
              type="range"
              min={300}
              max={1200}
              value={dimensions.width}
              onChange={(e) => handleChange("width", Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={dimensions.width}
              onChange={(e) => handleChange("width", Number(e.target.value))}
              className="w-20 border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        {/* Height */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Maximize className="w-4 h-4" />
            Height
          </label>
          <div className="flex gap-2">
            <input
              type="range"
              min={300}
              max={2400}
              value={dimensions.height}
              onChange={(e) => handleChange("height", Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={dimensions.height}
              onChange={(e) => handleChange("height", Number(e.target.value))}
              className="w-20 border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        {/* Depth */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Cuboid className="w-4 h-4" />
            Depth
          </label>
          <div className="flex gap-2">
            <input
              type="range"
              min={200}
              max={800}
              value={dimensions.depth}
              onChange={(e) => handleChange("depth", Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={dimensions.depth}
              onChange={(e) => handleChange("depth", Number(e.target.value))}
              className="w-20 border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Configuration
        </h3>

        {/* Back Panel */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Box className="w-4 h-4" />
            Back Panel
          </label>
          <input
            type="checkbox"
            checked={state.backPanel.active}
            onChange={(e) => state.setBackPanel(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Shelves */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <i className="w-4 h-4 border-b-2 border-current pb-1 mb-1 block" />
            Shelves
          </label>
          <div className="flex gap-2">
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={state.shelves.count}
              onChange={(e) => state.setShelves(Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={state.shelves.count}
              onChange={(e) => state.setShelves(Number(e.target.value))}
              className="w-20 border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        {/* Fronts */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Fronts
          </h3>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">Type</label>
            <select
              value={state.fronts.type}
              onChange={(e) => state.setFronts({ type: e.target.value as any })}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="none">None</option>
              <option value="door_single">Single Door</option>
              <option value="door_double">Double Door</option>
              <option value="drawers">Drawers</option>
            </select>
          </div>

          {state.fronts.type !== "none" && (
            <div className="space-y-2">
              <label className="block text-sm text-gray-700">Material</label>
              <div className="flex gap-2">
                {FRONT_MATERIALS.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => state.setFrontMaterial(mat)}
                    className={`flex-1 py-1 text-xs rounded border ${
                      state.frontMaterial?.id === mat.id
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {mat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.fronts.type !== "none" && (
            <>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Inset (Vano)</label>
                <input
                  type="checkbox"
                  checked={state.fronts.inset}
                  onChange={(e) => state.setFronts({ inset: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              {state.fronts.type === "drawers" && (
                <>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="range"
                        min={1}
                        max={8}
                        step={1}
                        value={state.fronts.count || 3}
                        onChange={(e) =>
                          state.setFronts({ count: Number(e.target.value) })
                        }
                        className="flex-1"
                      />
                      <span className="text-sm border rounded px-2 py-1 w-10 text-center">
                        {state.fronts.count || 3}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-dashed">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-xs font-semibold uppercase text-gray-500">
                        Hardware
                      </span>
                    </label>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-600">
                        Glide Clearance
                      </label>
                      <div className="flex bg-gray-100 rounded p-1">
                        <input
                          type="number"
                          className="w-12 bg-transparent text-right text-xs outline-none"
                          value={state.fronts.drawerBox?.glideClearance ?? 13}
                          onChange={(e) =>
                            state.setFronts({
                              drawerBox: {
                                glideClearance: Number(e.target.value),
                              },
                            })
                          }
                        />
                        <span className="text-xs text-gray-500 ml-1">mm</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="pt-4 border-t mt-auto">
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg text-sm">
          <Box className="w-4 h-4" />
          <span>Parametric Logic Active</span>
        </div>

        <button
          onClick={handleExport}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {copied ? "Copied to Clipboard" : "Export JSON"}
        </button>

        <p className="text-xs text-gray-400 mt-2">
          Material Thickness: 18mm fixed. Parts are recalculated automatically.
        </p>
      </div>
    </div>
  );
};
