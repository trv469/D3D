import type { Part } from '../types';

export const SNAP_THRESHOLD = 30; // mm

interface AxisBounds {
    min: number;
    max: number;
    center: number;
}

const getBounds = (part: Part, positionOverride?: { x: number, y: number, z: number }): { x: AxisBounds, y: AxisBounds, z: AxisBounds } => {
    const { w, h, d } = part.dimensions;
    const pos = positionOverride || part.position;

    // Assuming Center-Based Position (standard in our parametric Part definitions?)
    // Need to verify if 'position' is center or corner.
    // In Part.tsx: <mesh position={[position.x, position.y, position.z]}> <boxGeometry args={[w, h, d]} />
    // Three.js BoxGeometry defaults to centered. So position is CENTER.

    return {
        x: { min: pos.x - w / 2, max: pos.x + w / 2, center: pos.x },
        y: { min: pos.y - h / 2, max: pos.y + h / 2, center: pos.y },
        z: { min: pos.z - d / 2, max: pos.z + d / 2, center: pos.z },
    };
};

export const calculateSnap = (
    activePart: Part,
    newPosition: { x: number, y: number, z: number },
    otherParts: Part[]
): { x: number, y: number, z: number } => {

    let snappedX = newPosition.x;
    let snappedY = newPosition.y;
    let snappedZ = newPosition.z;

    const activeBounds = getBounds(activePart, newPosition);

    // For each axis, find if any edge of Active is close to any edge of any Other.
    // We prioritize "Face to Face" or "Edge to Edge".

    // --- X AXIS ---
    let bestXDiff = SNAP_THRESHOLD;
    for (const other of otherParts) {
        const otherBounds = getBounds(other);
        // Snap Left to Right, Right to Left, Left to Left, Right to Right, Center to Center
        const checks = [
            { source: activeBounds.x.min, target: otherBounds.x.max, offset: activePart.dimensions.w / 2 },
            { source: activeBounds.x.max, target: otherBounds.x.min, offset: -activePart.dimensions.w / 2 },
            { source: activeBounds.x.min, target: otherBounds.x.min, offset: activePart.dimensions.w / 2 },
            { source: activeBounds.x.max, target: otherBounds.x.max, offset: -activePart.dimensions.w / 2 },
            { source: activeBounds.x.center, target: otherBounds.x.center, offset: 0 },
        ];

        for (const check of checks) {
            const diff = Math.abs(check.source - check.target);
            if (diff < bestXDiff) {
                bestXDiff = diff;
                snappedX = check.target + check.offset;
            }
        }
    }

    // --- Y AXIS ---
    let bestYDiff = SNAP_THRESHOLD;
    for (const other of otherParts) {
        const otherBounds = getBounds(other);
        const checks = [
            { source: activeBounds.y.min, target: otherBounds.y.max, offset: activePart.dimensions.h / 2 },
            { source: activeBounds.y.max, target: otherBounds.y.min, offset: -activePart.dimensions.h / 2 },
            { source: activeBounds.y.min, target: otherBounds.y.min, offset: activePart.dimensions.h / 2 },
            { source: activeBounds.y.max, target: otherBounds.y.max, offset: -activePart.dimensions.h / 2 },
            { source: activeBounds.y.center, target: otherBounds.y.center, offset: 0 },

        ];
        for (const check of checks) {
            const diff = Math.abs(check.source - check.target);
            if (diff < bestYDiff) {
                bestYDiff = diff;
                snappedY = check.target + check.offset;
            }
        }
    }

    // --- Z AXIS ---
    let bestZDiff = SNAP_THRESHOLD;
    for (const other of otherParts) {
        const otherBounds = getBounds(other);
        const checks = [
            { source: activeBounds.z.min, target: otherBounds.z.max, offset: activePart.dimensions.d / 2 },
            { source: activeBounds.z.max, target: otherBounds.z.min, offset: -activePart.dimensions.d / 2 },
            { source: activeBounds.z.min, target: otherBounds.z.min, offset: activePart.dimensions.d / 2 },
            { source: activeBounds.z.max, target: otherBounds.z.max, offset: -activePart.dimensions.d / 2 },
            { source: activeBounds.z.center, target: otherBounds.z.center, offset: 0 },
        ];
        for (const check of checks) {
            const diff = Math.abs(check.source - check.target);
            if (diff < bestZDiff) {
                bestZDiff = diff;
                snappedZ = check.target + check.offset;
            }
        }
    }

    return { x: snappedX, y: snappedY, z: snappedZ };
};
