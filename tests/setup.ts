Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
        return 800;
    },
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get() {
        return 600;
    },
});

if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
        return window.setTimeout(() => cb(Date.now()), 16) as unknown as number;
    };
}

if (typeof window !== 'undefined' && !window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id: number): void => {
        window.clearTimeout(id);
    };
}
