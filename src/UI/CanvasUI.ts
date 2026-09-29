import { UI } from './UI';
import { PageFlip } from '../PageFlip';
import { FlipSetting } from '../Settings';
import { scaleCanvasSize } from './canvasSize';

/**
 * UI for canvas mode
 */
export class CanvasUI extends UI {
    private readonly canvas: HTMLCanvasElement;

    constructor(inBlock: HTMLElement, app: PageFlip, setting: FlipSetting) {
        super(inBlock, app, setting);

        this.wrapper.innerHTML = '<canvas class="stf__canvas"></canvas>';

        this.canvas = inBlock.querySelectorAll('canvas')[0];

        this.distElement = this.canvas;

        this.resizeCanvas();
        this.setHandlers();
    }

    private resizeCanvas(): void {
        const cs = getComputedStyle(this.canvas);
        const width = parseInt(cs.getPropertyValue('width'), 10) || this.canvas.clientWidth;
        const height = parseInt(cs.getPropertyValue('height'), 10) || this.canvas.clientHeight;
        const ratio =
            typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1;
        const size = scaleCanvasSize(width, height, ratio);

        this.canvas.width = size.width;
        this.canvas.height = size.height;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
        }
    }

    /**
     * Get canvas element
     */
    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public update(): void {
        this.resizeCanvas();
        this.app.getRender().update();
    }
}
