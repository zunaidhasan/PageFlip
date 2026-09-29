import { describe, expect, it } from 'vitest';
import { Settings, SizeType } from '../src/Settings';

describe('Settings', () => {
    it('does not mutate previous results when called again on the same instance', () => {
        const settings = new Settings();
        const first = settings.getSettings({ width: 100, height: 200 });
        const second = settings.getSettings({ width: 50, height: 80 });

        expect(first.width).toBe(100);
        expect(first.height).toBe(200);
        expect(second.width).toBe(50);
        expect(second.height).toBe(80);
        expect(first).not.toBe(second);
    });

    it('does not leak user values into the next Settings instance', () => {
        new Settings().getSettings({ width: 640, height: 480, flippingTime: 50 });
        const next = new Settings().getSettings({ width: 200, height: 300 });

        expect(next.flippingTime).toBe(1000);
        expect(next.width).toBe(200);
    });

    it('throws when width or height is missing', () => {
        expect(() => new Settings().getSettings({})).toThrow('Invalid width or height');
    });

    it('throws on invalid size type', () => {
        expect(() =>
            new Settings().getSettings({ width: 100, height: 100, size: 'fluid' })
        ).toThrow('Invalid size type');
    });

    it('applies stretch thresholds', () => {
        const result = new Settings().getSettings({
            width: 300,
            height: 400,
            size: SizeType.STRETCH,
        });

        expect(result.minWidth).toBe(100);
        expect(result.maxWidth).toBe(2000);
        expect(result.minHeight).toBe(100);
        expect(result.maxHeight).toBe(2000);
    });

    it('defaults new adoption settings without breaking existing configs', () => {
        const result = new Settings().getSettings({ width: 400, height: 600 });

        expect(result.direction).toBe('ltr');
        expect(result.useKeyboardEvents).toBe(true);
        expect(result.respectReducedMotion).toBe(true);
        expect(result.ariaLabel).toBe('Flipbook');
    });
});
