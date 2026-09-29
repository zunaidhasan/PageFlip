export function getCanvasPixelRatio(devicePixelRatio?: number): number {
    if (!devicePixelRatio || devicePixelRatio < 1) {
        return 1;
    }

    return devicePixelRatio;
}

export function scaleCanvasSize(
    width: number,
    height: number,
    devicePixelRatio?: number
): { width: number; height: number; ratio: number } {
    const ratio = getCanvasPixelRatio(devicePixelRatio);

    return {
        width: Math.max(1, Math.round(width * ratio)),
        height: Math.max(1, Math.round(height * ratio)),
        ratio,
    };
}
