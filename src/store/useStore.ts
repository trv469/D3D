import { create } from 'zustand';
import type { CabinetState, Part, Dimensions, Material } from '../types';

const DEFAULT_MATERIAL: Material = {
    id: 'mat_white_18',
    name: 'White Melamine',
    thickness: 18,
    color: '#e0e0e0',
};

const INITIAL_DIMENSIONS: Dimensions = {
    width: 600,
    height: 800,
    depth: 500,
};

const INITIAL_BACK_PANEL = {
    active: true,
    thickness: 3,
    inset: 18 // Default 18mm inset for groove
};

const INITIAL_SHELVES = {
    count: 0,
    offset: 0
};

const INITIAL_FRONTS: CabinetState['fronts'] = {
    type: 'none',
    inset: false, // Default Overlay (Parche)
    gap: 1.5,
    count: 2,
    drawerBox: {
        glideClearance: 13
    }
};

const DRAWER_BOX_MATERIAL: Material = {
    id: 'mat_white_15',
    name: 'White Internal',
    thickness: 15,
    color: '#ffffff'
};

const calculateParts = (
    dims: Dimensions,
    mat: Material,
    backPanel: CabinetState['backPanel'] = INITIAL_BACK_PANEL,
    shelves: CabinetState['shelves'] = INITIAL_SHELVES,
    fronts: CabinetState['fronts'] = INITIAL_FRONTS,
    frontMaterial?: Material
): Part[] => {
    const { width, height, depth } = dims;
    const { thickness } = mat;
    const parts: Part[] = [];

    const halfW = width / 2;
    const halfH = height / 2;
    // const halfD = depth / 2;

    // Front Z Base Position
    // If Overlay: Front sits on top of carcass front edge (+halfD + thickness/2 + gap?).
    // Usually Overlay means the front is OUTSIDE the box.
    // Box Front Edge Z = depth/2.
    // Front Center Z = depth/2 + frontThickness/2 (+ gap? usually gap is between door and box? or bumpers).

    // If Inset: Front sits INSIDE the carcass.
    // Box Front Edge Z = depth/2.
    // Front Center Z = depth/2 - frontThickness/2 - insetGap(2mm?).

    const frontThickness = 18; // Standard 18mm front
    let zFrontCenter = 0;

    if (fronts.inset) {
        zFrontCenter = (depth / 2) - (frontThickness / 2) - 2; // 2mm inset from edge
    } else {
        // Overlay
        zFrontCenter = (depth / 2) + (frontThickness / 2) + 1.5; // 1.5mm bumper gap
    }

    // 0. Back Panel
    if (backPanel.active) {
        parts.push({
            id: 'back_panel',
            name: 'Fondo',
            type: 'back',
            dimensions: {
                w: width - (thickness * 2) + 10,
                h: height - (thickness * 2) + 10,
                d: backPanel.thickness
            },
            position: {
                x: 0,
                y: 0,
                z: (-depth / 2) + backPanel.inset + (backPanel.thickness / 2)
            },
            grainActive: true,
            edges: { top: 0, bottom: 0, front: 0, back: 0 },
            materialId: 'mat_back_3mm',
            color: '#f5f5f5' // Back panel color
        });
    }

    // 1. Sides
    parts.push({
        id: 'side_left',
        name: 'Lateral Izquierdo',
        type: 'side',
        dimensions: { w: thickness, h: height, d: depth },
        position: { x: -halfW + thickness / 2, y: 0, z: 0 },
        grainActive: true,
        edges: { top: 0, bottom: 0, front: 1, back: 0 },
        materialId: mat.id,
        color: mat.color
    });

    parts.push({
        id: 'side_right',
        name: 'Lateral Derecho',
        type: 'side',
        dimensions: { w: thickness, h: height, d: depth },
        position: { x: halfW - thickness / 2, y: 0, z: 0 },
        grainActive: true,
        edges: { top: 0, bottom: 0, front: 1, back: 0 },
        materialId: mat.id,
        color: mat.color
    });

    // 2. Top/Bottom
    const innerWidth = width - (thickness * 2);
    parts.push({
        id: 'top',
        name: 'Techo',
        type: 'top',
        dimensions: { w: innerWidth, h: thickness, d: depth },
        position: { x: 0, y: halfH - thickness / 2, z: 0 },
        grainActive: true,
        edges: { top: 0, bottom: 0, front: 1, back: 0 },
        materialId: mat.id,
        color: mat.color
    });

    parts.push({
        id: 'bottom',
        name: 'Piso',
        type: 'bottom',
        dimensions: { w: innerWidth, h: thickness, d: depth },
        position: { x: 0, y: -halfH + thickness / 2, z: 0 },
        grainActive: true,
        edges: { top: 0, bottom: 0, front: 1, back: 0 },
        materialId: mat.id,
        color: mat.color
    });

    // 3. Shelves
    if (shelves.count > 0) {
        // Shelf Depth Adjustment for Door Inset
        // If Inset Door, shelf must recede?
        // Usually shelf is 20-30mm setback regardless.
        // If Inset Door, frontSetback must be > (frontThickness + gap).

        let frontSetback = 20;
        if (fronts.inset && (fronts.type !== 'none')) {
            frontSetback = Math.max(frontSetback, frontThickness + 5);
        }

        const backObstruction = backPanel.active ? (backPanel.inset + backPanel.thickness) : 0;
        const zFront = (depth / 2) - frontSetback;
        const zBack = (-depth / 2) + backObstruction;
        const sDepth = zFront - zBack;
        const sZ = (zFront + zBack) / 2;

        const innerHeight = height - (thickness * 2);
        const spacePerSection = innerHeight / (shelves.count + 1);

        for (let i = 0; i < shelves.count; i++) {
            const yPos = (-halfH + thickness) + ((i + 1) * spacePerSection);
            parts.push({
                id: `shelf_${i}`,
                name: `Repisa ${i + 1}`,
                type: 'shelf',
                dimensions: { w: innerWidth, h: thickness, d: sDepth },
                position: { x: 0, y: yPos, z: sZ },
                grainActive: true,
                edges: { top: 1, bottom: 1, front: 2, back: 0 },
                materialId: mat.id,
                color: mat.color
            });
        }
    }

    // 5. Fronts
    if (fronts.type !== 'none') {
        const gap = fronts.gap;

        // Dimensions Base
        // Overlay: Covers box W and H (minus gap/reveal?)
        // Inset: Fits inside Inner W and H (minus gap)

        let availableW = 0;
        let availableH = 0;

        if (fronts.inset) {
            availableW = innerWidth;
            availableH = height - (thickness * 2);
        } else {
            // Overlay: Full Width/Height minus 1.5mm gap all around? (typical 3mm total reveal)
            // Let's say Full Width - 3mm. Full Height - 3mm.
            availableW = width - (gap * 2);
            availableH = height - (gap * 2); // usually top/bottom reveal?
        }

        if (fronts.type === 'door_single') {
            parts.push({
                id: 'door_single',
                name: 'Puerta',
                type: 'door',
                dimensions: { w: availableW - gap, h: availableH - gap, d: frontThickness },
                position: { x: 0, y: 0, z: zFrontCenter },
                grainActive: true,
                edges: { top: 2, bottom: 2, front: 0, back: 0 },
                materialId: frontMaterial?.id || mat.id,
                color: frontMaterial?.color || mat.color
            });
        } else if (fronts.type === 'door_double') {
            const doorW = (availableW - gap) / 2; // Gap in middle
            parts.push({
                id: 'door_left',
                name: 'Puerta Izquierda',
                type: 'door',
                dimensions: { w: doorW, h: availableH - gap, d: frontThickness },
                position: { x: -doorW / 2 - gap / 2, y: 0, z: zFrontCenter },
                grainActive: true,
                edges: { top: 2, bottom: 2, front: 0, back: 0 },
                materialId: frontMaterial?.id || mat.id,
                color: frontMaterial?.color || mat.color
            });
            parts.push({
                id: 'door_right',
                name: 'Puerta Derecha',
                type: 'door',
                dimensions: { w: doorW, h: availableH - gap, d: frontThickness },
                position: { x: doorW / 2 + gap / 2, y: 0, z: zFrontCenter },
                grainActive: true,
                edges: { top: 2, bottom: 2, front: 0, back: 0 },
                materialId: frontMaterial?.id || mat.id,
                color: frontMaterial?.color || mat.color
            });
        } else if (fronts.type === 'drawers') {
            // Drawers Vertical Stack
            // Count = fronts.count? default 3
            const count = fronts.count || 3;
            // Height per drawer = availableH / count - gaps
            const totalGaps = (count - 1) * gap; // gaps between drawers
            const drawerH = (availableH - totalGaps) / count;
            // Start form Top? or Bottom? Bottom usually.

            // Y Start (Bottom Edge of available area)
            // If Inset: -halfH + thickness.
            // If Overlay: -halfH + gap.

            const startY = fronts.inset ? (-halfH + thickness) : (-halfH + gap);

            for (let i = 0; i < count; i++) {
                // Center Y of this drawer
                // Bottom of drawer i = startY + i*(drawerH + gap)
                // Center = Bottom + drawerH/2
                const bottomY = startY + (i * (drawerH + gap));
                const centerY = bottomY + (drawerH / 2);

                parts.push({
                    id: `drawer_front_${i}`,
                    name: `Frente Cajón ${i + 1}`,
                    type: 'drawer_front',
                    dimensions: { w: availableW - gap, h: drawerH - gap, d: frontThickness },
                    position: { x: 0, y: centerY, z: zFrontCenter },
                    grainActive: true,
                    edges: { top: 2, bottom: 2, front: 0, back: 0 },
                    materialId: frontMaterial?.id || mat.id,
                    color: frontMaterial?.color || mat.color
                });

                // DRAWER BOX PARTS
                const boxGapSide = fronts.drawerBox?.glideClearance || 13;
                const boxW = (availableW - gap) - (boxGapSide * 2);
                const cleaningBottom = 20; // Space below drawer
                const boxH = Math.max(50, drawerH - gap - cleaningBottom); // Height of the box
                const boxD = depth - 50; // 50mm space at back

                // Box positioned behind the front.
                // Z Position:
                // Front is at zFrontCenter.
                // If Overlay: Front is OUTSIDE. Box starts at Depth/2 (front edge of carcass)
                // If Inset: Front is INSIDE. Box starts behind front.
                // Let's assume Box Front Face is flush with Carcass Front Edge (approx) or attached to Front.
                // Simplified: Box center Z = Box Start Z - boxD/2
                // Box Start Z = (depth / 2) - (fronts.inset ? (frontThickness + gap) : 0);

                const boxStartZ = (depth / 2) - (fronts.inset ? (frontThickness + 2) : 0);
                const boxZ = boxStartZ - (boxD / 2);

                const boxMat = DRAWER_BOX_MATERIAL; // Use internal material

                // 1. Box Sides (Left/Right) - Run full depth of box
                // Position X relative to drawer center (0)
                const distToSide = (boxW / 2) - (boxMat.thickness / 2);

                parts.push({
                    id: `drawer_box_side_L_${i}`,
                    name: `Cajón ${i + 1} Lat. Izq`,
                    type: 'side', // internal side
                    dimensions: { w: boxMat.thickness, h: boxH, d: boxD },
                    position: { x: -distToSide, y: centerY, z: boxZ },
                    grainActive: false,
                    edges: { top: 1, bottom: 0, front: 0, back: 0 },
                    materialId: boxMat.id,
                    color: boxMat.color
                });

                parts.push({
                    id: `drawer_box_side_R_${i}`,
                    name: `Cajón ${i + 1} Lat. Der`,
                    type: 'side',
                    dimensions: { w: boxMat.thickness, h: boxH, d: boxD },
                    position: { x: distToSide, y: centerY, z: boxZ },
                    grainActive: false,
                    edges: { top: 1, bottom: 0, front: 0, back: 0 },
                    materialId: boxMat.id,
                    color: boxMat.color
                });

                // 2. Box Front/Back (Between sides)
                const boxInnerW = boxW - (boxMat.thickness * 2);
                const distToFrontBack = (boxD / 2) - (boxMat.thickness / 2);

                parts.push({
                    id: `drawer_box_front_${i}`,
                    name: `Cajón ${i + 1} Frente Int`,
                    type: 'back', // visually similar
                    dimensions: { w: boxInnerW, h: boxH, d: boxMat.thickness },
                    position: { x: 0, y: centerY, z: boxZ + distToFrontBack },
                    grainActive: false,
                    edges: { top: 1, bottom: 0, front: 0, back: 0 },
                    materialId: boxMat.id,
                    color: boxMat.color
                });

                parts.push({
                    id: `drawer_box_back_${i}`,
                    name: `Cajón ${i + 1} Trasera`,
                    type: 'back',
                    dimensions: { w: boxInnerW, h: boxH, d: boxMat.thickness },
                    position: { x: 0, y: centerY, z: boxZ - distToFrontBack },
                    grainActive: false,
                    edges: { top: 1, bottom: 0, front: 0, back: 0 },
                    materialId: boxMat.id,
                    color: boxMat.color
                });

                // 3. Box Bottom (Grooved/Nailed) - Simplified: Nailed to bottom for now
                // Located at bottom of box parts.
                const bottomThickness = 3;
                parts.push({
                    id: `drawer_box_bottom_${i}`,
                    name: `Cajón ${i + 1} Fondo`,
                    type: 'bottom',
                    dimensions: { w: boxW, h: bottomThickness, d: boxD },
                    position: { x: 0, y: centerY - (boxH / 2) - (bottomThickness / 2), z: boxZ },
                    grainActive: false,
                    edges: { top: 0, bottom: 0, front: 0, back: 0 },
                    materialId: 'mat_back_3mm'
                });
            }
        }
    }

    return parts;
};

export const useStore = create<CabinetState>((set, get) => ({
    dimensions: INITIAL_DIMENSIONS,
    material: DEFAULT_MATERIAL,
    backPanel: INITIAL_BACK_PANEL,
    shelves: INITIAL_SHELVES,
    fronts: INITIAL_FRONTS,
    frontMaterial: undefined,
    parts: calculateParts(INITIAL_DIMENSIONS, DEFAULT_MATERIAL, INITIAL_BACK_PANEL, INITIAL_SHELVES, INITIAL_FRONTS),

    // Free Design Mode
    designMode: 'parametric',
    gizmoMode: 'translate',
    viewConfig: { explodeFactor: 0, showLabels: false },
    selectedPartId: null,

    setDesignMode: (mode) => set({ designMode: mode }),
    setGizmoMode: (mode) => set({ gizmoMode: mode }),
    setViewConfig: (config) => set((state) => ({ viewConfig: { ...state.viewConfig, ...config } })),
    selectPart: (id) => set({ selectedPartId: id }),

    updatePart: (id, updates) => {
        set((state) => ({
            parts: state.parts.map((p) =>
                p.id === id ? { ...p, ...updates } : p
            )
        }));
    },

    addPart: (part) => {
        set((state) => ({ parts: [...state.parts, part] }));
    },

    removePart: (id) => {
        set((state) => ({
            parts: state.parts.filter((p) => p.id !== id),
            selectedPartId: state.selectedPartId === id ? null : state.selectedPartId
        }));
    },

    setDimensions: (w, h, d) => {
        const { material, backPanel, shelves, fronts, designMode } = get();
        const newDims = { width: w, height: h, depth: d };
        // Only recalc in Parametric Mode
        if (designMode === 'parametric') {
            set({
                dimensions: newDims,
                parts: calculateParts(newDims, material, backPanel, shelves, fronts, get().frontMaterial),
            });
        } else {
            // In Manual mode, just update dimensions state (for reference) but NOT parts
            set({ dimensions: newDims });
        }
    },
    setBackPanel: (active, thickness, inset) => {
        const { dimensions, material, backPanel: currentBP, shelves, fronts, designMode } = get();
        const newBP = {
            active,
            thickness: thickness ?? currentBP.thickness,
            inset: inset ?? currentBP.inset
        };

        if (designMode === 'parametric') {
            set({
                backPanel: newBP,
                parts: calculateParts(dimensions, material, newBP, shelves, fronts, get().frontMaterial)
            });
        } else {
            set({ backPanel: newBP });
        }
    },
    setShelves: (count) => {
        const { dimensions, material, backPanel, shelves: currentShelves, fronts, designMode } = get();
        const newShelves = { ...currentShelves, count };
        if (designMode === 'parametric') {
            set({
                shelves: newShelves,
                parts: calculateParts(dimensions, material, backPanel, newShelves, fronts, get().frontMaterial)
            });
        } else {
            set({ shelves: newShelves });
        }
    },
    setFronts: (config) => {
        const { dimensions, material, backPanel, shelves, fronts: currentFronts, designMode } = get();
        const newFronts = { ...currentFronts, ...config };
        if (designMode === 'parametric') {
            set({
                fronts: newFronts,
                parts: calculateParts(dimensions, material, backPanel, shelves, newFronts, get().frontMaterial)
            });
        } else {
            set({ fronts: newFronts });
        }
    },
    setFrontMaterial: (mat) => {
        const { dimensions, material, backPanel, shelves, fronts, designMode } = get();
        if (designMode === 'parametric') {
            set({
                frontMaterial: mat,
                parts: calculateParts(dimensions, material, backPanel, shelves, fronts, mat)
            });
        } else {
            set({ frontMaterial: mat });
        }
    }
}));
