import type { CabinetState } from '../types';

export const generateProjectJSON = (state: CabinetState) => {
    const { dimensions, parts, material } = state;

    return {
        projectId: "uuid-placeholder-001", // In real app, generate or store this
        globalSettings: {
            materialThickness: material.thickness,
            defaultMaterial: material.name
        },
        modules: [
            {
                id: "module_1", // In real app, support multiple modules
                type: "cabinet_base",
                dimensions: {
                    w: dimensions.width,
                    h: dimensions.height,
                    d: dimensions.depth
                },
                parts: parts.map(part => {
                    // Smart Dimension Logic:
                    const sortedDims = [part.dimensions.w, part.dimensions.h, part.dimensions.d].sort((a, b) => a - b);
                    const thickness = sortedDims[0];
                    const width = sortedDims[1];
                    const length = sortedDims[2];

                    return {
                        name: part.name,
                        // Legacy w for reference
                        w: part.type === 'top' || part.type === 'bottom' ? part.dimensions.w : part.dimensions.h,

                        w_cut: length,
                        h_cut: width,
                        thickness: thickness,

                        grainActive: part.grainActive,
                        edges: part.edges
                    };
                })
            }
        ]
    };
};
