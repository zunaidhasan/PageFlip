export function shouldReduceMotion(
    enabled: boolean,
    mediaQuery: MediaQueryList | null | undefined
): boolean {
    return Boolean(enabled && mediaQuery && mediaQuery.matches);
}

export function getReducedMotionQuery(): MediaQueryList | null {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return null;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)');
}
