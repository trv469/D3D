import { useStore } from "../../store/useStore";
import { Trash2, Copy, RotateCw } from "lucide-react";

export const ContextToolbar = () => {
  const { selectedPartId, parts, removePart, addPart, updatePart } = useStore();

  if (!selectedPartId) return null;

  const selectedPart = parts.find((p) => p.id === selectedPartId);
  if (!selectedPart) return null;

  const handleDelete = () => {
    removePart(selectedPartId);
  };

  const handleDuplicate = () => {
    const newPart = {
      ...selectedPart,
      id: `part_${Date.now()}`,
      name: `${selectedPart.name} (Copia)`,
      position: {
        x: selectedPart.position.x + 50,
        y: selectedPart.position.y,
        z: selectedPart.position.z + 50,
      },
    };
    addPart(newPart);
  };

  const handleRotate = () => {
    const currentY = selectedPart.rotation?.y || 0;
    // Rotate 90 degrees (PI/2)
    const newY = currentY + Math.PI / 2;
    updatePart(selectedPartId, {
      rotation: {
        x: selectedPart.rotation?.x || 0,
        y: newY,
        z: selectedPart.rotation?.z || 0,
      },
    });
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex gap-2 items-center z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className="px-3 py-1 border-r border-gray-100 flex flex-col justify-center">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          Selección
        </span>
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {selectedPart.name}
        </span>
      </div>

      <button
        onClick={handleRotate}
        className="p-3 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-colors group flex flex-col items-center gap-1"
        title="Rotar 90°"
      >
        <RotateCw className="w-5 h-5" />
        <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
          Rotar
        </span>
      </button>

      <button
        onClick={handleDuplicate}
        className="p-3 hover:bg-green-50 text-gray-600 hover:text-green-600 rounded-lg transition-colors group flex flex-col items-center gap-1"
        title="Duplicar"
      >
        <Copy className="w-5 h-5" />
        <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
          Clonar
        </span>
      </button>

      <div className="w-[1px] h-8 bg-gray-100 mx-1"></div>

      <button
        onClick={handleDelete}
        className="p-3 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-lg transition-colors group flex flex-col items-center gap-1"
        title="Eliminar"
      >
        <Trash2 className="w-5 h-5" />
        <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
          Borrar
        </span>
      </button>
    </div>
  );
};
