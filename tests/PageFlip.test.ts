import { describe, expect, it, vi } from 'vitest';
import { PageFlip } from '../src/PageFlip';

function createPages(count: number): HTMLElement[] {
    return Array.from({ length: count }, (_, index) => {
        const page = document.createElement('div');
        page.className = 'page';
        page.textContent = `Page ${index + 1}`;
        return page;
    });
}

describe('PageFlip lifecycle', () => {
    it('destroy before load does not throw', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);
        const book = new PageFlip(root, { width: 300, height: 400 });

        expect(() => book.destroy()).not.toThrow();
    });

    it('destroy cancels the render loop and keeps the root element', () => {
        const cancel = vi.spyOn(window, 'cancelAnimationFrame');
        const root = document.createElement('div');
        document.body.appendChild(root);
        const book = new PageFlip(root, { width: 300, height: 400 });
        book.loadFromHTML(createPages(4));

        book.destroy();

        expect(document.body.contains(root)).toBe(true);
        expect(cancel).toHaveBeenCalled();
        cancel.mockRestore();
    });

    it('turnToNextPage on the last spread does not throw', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);
        const book = new PageFlip(root, { width: 300, height: 400, usePortrait: false });
        book.loadFromHTML(createPages(4));

        book.turnToPage(3);
        expect(() => book.turnToNextPage()).not.toThrow();
        expect(book.getCurrentPageIndex()).toBeLessThan(4);

        book.destroy();
    });

    it('marks the root as an accessible widget', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);
        const book = new PageFlip(root, {
            width: 300,
            height: 400,
            ariaLabel: 'Demo book',
        });
        book.loadFromHTML(createPages(2));

        expect(root.getAttribute('role')).toBe('region');
        expect(root.getAttribute('aria-label')).toContain('Demo book');
        expect(root.tabIndex).toBe(0);

        book.destroy();
    });
});
