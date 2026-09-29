import { describe, expect, it } from 'vitest';
import { FlipDirection } from '../src/Flip/Flip';
import { getFlipDirectionByPoint } from '../src/Flip/direction';
import { getCanvasPixelRatio, scaleCanvasSize } from '../src/UI/canvasSize';
import { shouldReduceMotion } from '../src/UI/reducedMotion';

describe('RTL direction mapping', () => {
    it('treats the left side as previous in LTR landscape', () => {
        expect(getFlipDirectionByPoint(10, 400, false)).toBe(FlipDirection.BACK);
        expect(getFlipDirectionByPoint(300, 400, false)).toBe(FlipDirection.FORWARD);
    });

    it('treats the left side as next in RTL landscape', () => {
        expect(getFlipDirectionByPoint(10, 400, true)).toBe(FlipDirection.FORWARD);
        expect(getFlipDirectionByPoint(300, 400, true)).toBe(FlipDirection.BACK);
    });
});

describe('canvas pixel ratio', () => {
    it('falls back to 1 when devicePixelRatio is missing', () => {
        expect(getCanvasPixelRatio(undefined)).toBe(1);
        expect(getCanvasPixelRatio(0)).toBe(1);
        expect(getCanvasPixelRatio(2)).toBe(2);
    });

    it('scales backing store by device pixel ratio', () => {
        expect(scaleCanvasSize(400, 300, 2)).toEqual({ width: 800, height: 600, ratio: 2 });
    });
});

describe('reduced motion', () => {
    it('is true when the setting is on and the media query matches', () => {
        expect(
            shouldReduceMotion(true, { matches: true } as MediaQueryList)
        ).toBe(true);
        expect(
            shouldReduceMotion(true, { matches: false } as MediaQueryList)
        ).toBe(false);
        expect(
            shouldReduceMotion(false, { matches: true } as MediaQueryList)
        ).toBe(false);
    });
});
