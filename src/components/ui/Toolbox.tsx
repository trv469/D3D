import React from "react";
import { useStore } from "../../store/useStore";
import { Move, RotateCw, Ruler, Eraser, Trash2 } from "lucide-react";

const ShelfIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="11" width="20" height="2" rx="1" />
  </svg>
);

const DividerIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="11" y="2" width="2" height="20" rx="1" />
  </svg>
);

const PanelIcon = (props: any) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);

const LIBRARY_ITEMS = [
  {
    type: "shelf",
    name: "Repisa",
    icon: ShelfIcon,
    dims: { w: 400, h: 18, d: 300 },
  },
  {
    type: "divider",
    name: "Divisor",
    icon: DividerIcon,
    dims: { w: 18, h: 400, d: 300 },
  },
  {
    type: "panel",
    name: "Panel",
    icon: PanelIcon,
    dims: { w: 400, h: 400, d: 18 },
  },
];

interface ToolButtonProps {
  active?: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  colorClass?: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  active,
  onClick,
  icon: Icon,
  label,
  colorClass,
}) => (
  <button
    onClick={onClick}
    title={label}
    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
      active
        ? colorClass ||
          "bg-blue-100 text-blue-600 shadow-sm ring-1 ring-blue-200"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
    }`}
  >
    <Icon className="w-5 h-5" />
  </button>
);

export const Toolbox = () => {
  const { gizmoMode, setGizmoMode, measureMode, setMeasureMode } = useStore();

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    item: (typeof LIBRARY_ITEMS)[0]
  ) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData("application/json", JSON.stringify(item));
      e.dataTransfer.effectAllowed = "copy";
    }
  };

  return (
    <div className="w-20 bg-white border-r flex flex-col items-center py-4 gap-6 z-30 shadow-xl flex-none relative">
      {/* Tools Section */}
      <div className="flex flex-col gap-2 w-full px-2 items-center">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-1">
          Tools
        </span>
        <ToolButton
          active={gizmoMode === "translate"}
          onClick={() => setGizmoMode("translate")}
          icon={Move}
          label="Mover"
        />
        <ToolButton
          active={gizmoMode === "rotate"}
          onClick={() => setGizmoMode("rotate")}
          icon={RotateCw}
          label="Rotar"
        />
        <ToolButton
          active={measureMode}
          onClick={() => setMeasureMode(!measureMode)}
          icon={Ruler}
          label="Medir (Wincha)"
          colorClass="bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200"
        />

        <div className="w-8 h-px bg-gray-100 my-1" />

        <ToolButton
          onClick={() => useStore.getState().clearMeasurements()}
          icon={Eraser}
          label="Borrar Cotas"
          colorClass="text-red-500 hover:bg-red-50"
        />
        <ToolButton
          onClick={() => {
            if (
              window.confirm(
                "¿Borrar todo el diseño? Esta acción no se puede deshacer."
              )
            ) {
              useStore.getState().resetScene();
            }
          }}
          icon={Trash2}
          label="Borrar Todo"
          colorClass="text-red-600 hover:bg-red-100"
        />
      </div>

      <div className="w-12 h-px bg-gray-200" />

      {/* Library Section */}
      <div className="flex flex-col gap-4 items-center w-full">
        <div className="mb-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest rotate-[-90deg] block origin-center">
            BIB
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
    </div>
  );
};
