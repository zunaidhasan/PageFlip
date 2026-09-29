import { describe, expect, it } from 'vitest';
import { canAdvanceSpread, canRewindSpread } from '../src/Collection/spreadBounds';

describe('spread bounds', () => {
    it('does not advance past the last spread', () => {
        expect(canAdvanceSpread(2, 3)).toBe(false);
        expect(canAdvanceSpread(1, 3)).toBe(true);
        expect(canAdvanceSpread(0, 1)).toBe(false);
    });

    it('does not rewind before the first spread', () => {
        expect(canRewindSpread(0)).toBe(false);
        expect(canRewindSpread(1)).toBe(true);
    });
});
