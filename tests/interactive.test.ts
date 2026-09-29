import { describe, expect, it } from 'vitest';
import { isInteractiveTarget } from '../src/UI/isInteractiveTarget';

describe('isInteractiveTarget', () => {
    it('detects nested buttons and links', () => {
        const wrap = document.createElement('div');
        wrap.innerHTML = '<button><span class="label">Next</span></button>';
        const span = wrap.querySelector('.label');

        expect(isInteractiveTarget(span)).toBe(true);
    });

    it('detects form controls and explicit opt-out', () => {
        const input = document.createElement('input');
        const custom = document.createElement('div');
        custom.setAttribute('data-no-flip', '');

        expect(isInteractiveTarget(input)).toBe(true);
        expect(isInteractiveTarget(custom)).toBe(true);
    });

    it('ignores ordinary page content', () => {
        const p = document.createElement('p');
        p.textContent = 'A page of text';

        expect(isInteractiveTarget(p)).toBe(false);
        expect(isInteractiveTarget(null)).toBe(false);
    });
});
