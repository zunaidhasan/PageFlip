import { describe, expect, it, vi } from 'vitest';
import { EventObject } from '../src/Event/EventObject';
import { PageFlip } from '../src/PageFlip';

class TestEvents extends EventObject {
    public emit(name: string, data: number | string | boolean | object = null): void {
        this.trigger(name, {} as PageFlip, data);
    }
}

describe('EventObject', () => {
    it('notifies subscribers and can remove them', () => {
        const bus = new TestEvents();
        const handler = vi.fn();

        bus.on('flip', handler);
        bus.emit('flip', 3);
        bus.off('flip');
        bus.emit('flip', 4);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].data).toBe(3);
    });
});
