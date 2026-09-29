import { describe, expect, it } from 'vitest';
import { Helper } from '../src/Helper';

describe('Helper', () => {
    it('returns Infinity when a point is null', () => {
        expect(Helper.GetDistanceBetweenTwoPoint(null, { x: 0, y: 0 })).toBe(Infinity);
    });

    it('computes distance between two points', () => {
        expect(Helper.GetDistanceBetweenTwoPoint({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    });

    it('interpolates a fixed number of frames between two points', () => {
        const points = Helper.GetInterpolatedPoints({ x: 0, y: 0 }, { x: 10, y: 0 }, 5);

        expect(points).toHaveLength(5);
        expect(points[0]).toEqual({ x: 0, y: 0 });
        expect(points[2]).toEqual({ x: 5, y: 0 });
        expect(points[4]).toEqual({ x: 10, y: 0 });
    });

    it('returns the destination when interpolating a single frame', () => {
        expect(Helper.GetInterpolatedPoints({ x: 1, y: 1 }, { x: 8, y: 9 }, 1)).toEqual([
            { x: 8, y: 9 },
        ]);
    });
});
