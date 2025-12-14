export interface Dimensions {
    width: number;
    height: number;
    depth: number;
}

export interface Material {
    id: string;
    name: string;
    thickness: number;
    color?: string;
    texture?: string;
}

export interface Edges {
    top: 0 | 1 | 2; // 0=none, 1=thin, 2=thick
    bottom: 0 | 1 | 2;
    front: 0 | 1 | 2;
    back: 0 | 1 | 2;
}


export interface FrontConfig {
    type: 'none' | 'door_single' | 'door_double' | 'drawers';
    count?: number; // for drawers
    inset: boolean; // true = embedded/vano, false = overlay/parche
    gap: number; // default 1.5mm
    drawerBox?: {
        glideClearance: number; // side clearance, default 13mm
    };
}

export interface Part {
    id: string;
    name: string;
    type: 'side' | 'top' | 'bottom' | 'back' | 'shelf' | 'divider' | 'door' | 'drawer_front';
    dimensions: {
        w: number;
        h: number;
        d: number;
    };
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation?: {
        x: number;
        y: number;
        z: number;
    };
    grainActive: boolean;
    edges: Edges;
    materialId: string;
    color?: string;
}

export interface CabinetState {
    dimensions: Dimensions;
    material: Material;
    backPanel: {
        active: boolean;
        thickness: number;
        inset: number; // distance from back
    };
    shelves: {
        count: number;
        offset: number; // For future usage, maybe varying heights
    };
    fronts: FrontConfig;
    frontMaterial?: Material; // Optional separate material for fronts
    parts: Part[];
    setDimensions: (w: number, h: number, d: number) => void;
    setBackPanel: (active: boolean, thickness?: number, inset?: number) => void;
    setShelves: (count: number) => void;
    setFronts: (config: Partial<FrontConfig>) => void;
    setFrontMaterial: (material: Material) => void;

    // Free Design Mode
    designMode: 'parametric' | 'manual';
    gizmoMode: 'translate' | 'rotate' | 'scale';
    selectedPartId: string | null;
    setDesignMode: (mode: 'parametric' | 'manual') => void;
    setGizmoMode: (mode: 'translate' | 'rotate' | 'scale') => void;
    selectPart: (id: string | null) => void;
    updatePart: (id: string, updates: Partial<Part>) => void;
    addPart: (part: Part) => void; // New part from scratch
    removePart: (id: string) => void;
}
