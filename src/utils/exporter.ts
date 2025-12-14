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
                parts: parts.map(part => ({
                    name: part.name,
                    w: part.type === 'top' || part.type === 'bottom' ? part.dimensions.w : part.dimensions.h,
                    // Note: Optimizer usually wants Length x Width.
                    // For a vertical side, Length is Height, Width is Depth?
                    // The prompt example says for "lateral_izq": w: 800, h: 500.
                    // In my store: w: 18, h: 800, d: 500.
                    // So for side: Optimizer W = Store H, Optimizer H = Store D.
                    // Let's deduce "Board Dimensions" (L x W) from the 3D Dimensions.
                    // Largest dimension is usually Length (grain direction).
                    // But strict mapping is better.

                    // Logic based on part rotation/type to determine Cut Size (L x W) and Thickness.
                    /*
                     Mapping:
                     - Side:   Dim(Thick, H, Depth).   Cut: H x Depth.    Thick: Dim.W
                     - Back:   Dim(W, H, Thick).       Cut: W x H.        Thick: Dim.D
                     - Fronts: Dim(W, H, Thick).       Cut: W x H.        Thick: Dim.D
                     - Top/Bot:Dim(W, Thick, Depth).   Cut: W x Depth.    Thick: Dim.H
                     - Shelf:  Dim(W, Thick, Depth).   Cut: W x Depth.    Thick: Dim.H
                    */

                    w_cut: part.type === 'side' ? part.dimensions.h : part.dimensions.w,

                    h_cut: (part.type === 'back' || part.type === 'door' || part.type === 'drawer_front')
                        ? part.dimensions.h : part.dimensions.d,

                    thickness: (part.type === 'back' || part.type === 'door' || part.type === 'drawer_front')
                        ? part.dimensions.d
                        : part.type === 'side' ? part.dimensions.w
                            : part.dimensions.h,

                    grainActive: part.grainActive,
                    edges: part.edges
                }))
            }
        ]
    };
};
