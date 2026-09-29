import { PageFlip } from '../PageFlip';
import { Point } from '../BasicTypes';
import { FlipSetting, SizeType } from '../Settings';
import { FlipCorner, FlippingState } from '../Flip/Flip';
import { Orientation } from '../Render/Render';
import { isInteractiveTarget } from './isInteractiveTarget';

type SwipeData = {
    point: Point;
    time: number;
};

/**
 * UI Class, represents work with DOM
 */
export abstract class UI {
    protected readonly parentElement: HTMLElement;

    protected readonly app: PageFlip;
    protected readonly wrapper: HTMLElement;
    protected distElement: HTMLElement;

    private touchPoint: SwipeData = null;
    private readonly swipeTimeout = 250;
    private readonly swipeDistance: number;
    private readonly pointerSupported: boolean;
    private activePointerId: number = null;

    private onResize = (): void => {
        this.update();
    };

    /**
     * @constructor
     *
     * @param {HTMLElement} inBlock - Root HTML Element
     * @param {PageFlip} app - PageFlip instance
     * @param {FlipSetting} setting - Configuration object
     */
    protected constructor(inBlock: HTMLElement, app: PageFlip, setting: FlipSetting) {
        this.parentElement = inBlock;

        inBlock.classList.add('stf__parent');
        inBlock.insertAdjacentHTML('afterbegin', '<div class="stf__wrapper"></div>');

        this.wrapper = inBlock.querySelector('.stf__wrapper');

        this.app = app;
        this.pointerSupported = typeof window !== 'undefined' && 'PointerEvent' in window;

        const k = this.app.getSettings().usePortrait ? 1 : 2;

        inBlock.style.minWidth = setting.minWidth * k + 'px';
        inBlock.style.minHeight = setting.minHeight + 'px';

        if (setting.size === SizeType.FIXED) {
            inBlock.style.minWidth = setting.width * k + 'px';
            inBlock.style.minHeight = setting.height + 'px';
        }

        if (setting.autoSize) {
            inBlock.style.width = '100%';
            inBlock.style.maxWidth = setting.maxWidth * 2 + 'px';
        }

        inBlock.style.display = 'block';

        window.addEventListener('resize', this.onResize, false);
        this.swipeDistance = setting.swipeDistance;
    }

    /**
     * Destructor. Remove all HTML elements and all event handlers
     */
    public destroy(): void {
        this.removeHandlers();

        this.parentElement.classList.remove('stf__parent');
        if (this.distElement) this.distElement.remove();
        if (this.wrapper) this.wrapper.remove();
    }

    /**
     * Updating child components when resizing
     */
    public abstract update(): void;

    /**
     * Get parent element for book
     *
     * @returns {HTMLElement}
     */
    public getDistElement(): HTMLElement {
        return this.distElement;
    }

    /**
     * Get wrapper element
     *
     * @returns {HTMLElement}
     */
    public getWrapper(): HTMLElement {
        return this.wrapper;
    }

    /**
     * Updates styles and sizes based on book orientation
     *
     * @param {Orientation} orientation - New book orientation
     */
    public setOrientationStyle(orientation: Orientation): void {
        this.wrapper.classList.remove('--portrait', '--landscape');

        if (orientation === Orientation.PORTRAIT) {
            if (this.app.getSettings().autoSize)
                this.wrapper.style.paddingBottom =
                    (this.app.getSettings().height / this.app.getSettings().width) * 100 + '%';

            this.wrapper.classList.add('--portrait');
        } else {
            if (this.app.getSettings().autoSize)
                this.wrapper.style.paddingBottom =
                    (this.app.getSettings().height / (this.app.getSettings().width * 2)) * 100 +
                    '%';

            this.wrapper.classList.add('--landscape');
        }

        this.update();
    }

    protected removeHandlers(): void {
        window.removeEventListener('resize', this.onResize);

        if (!this.distElement) return;

        this.distElement.removeEventListener('pointerdown', this.onPointerDown);
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
        window.removeEventListener('pointercancel', this.onPointerUp);

        this.distElement.removeEventListener('mousedown', this.onMouseDown);
        this.distElement.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('touchend', this.onTouchEnd);

        this.parentElement.removeEventListener('keydown', this.onKeyDown);
    }

    protected setHandlers(): void {
        window.addEventListener('resize', this.onResize, false);

        this.parentElement.addEventListener('keydown', this.onKeyDown);

        if (!this.app.getSettings().useMouseEvents) return;

        if (this.pointerSupported) {
            this.distElement.addEventListener('pointerdown', this.onPointerDown);
            window.addEventListener('pointermove', this.onPointerMove);
            window.addEventListener('pointerup', this.onPointerUp);
            window.addEventListener('pointercancel', this.onPointerUp);
            return;
        }

        this.distElement.addEventListener('mousedown', this.onMouseDown);
        this.distElement.addEventListener('touchstart', this.onTouchStart);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('touchmove', this.onTouchMove, {
            passive: !this.app.getSettings().mobileScrollSupport,
        });
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('touchend', this.onTouchEnd);
    }

    /**
     * Convert global coordinates to relative book coordinates
     *
     * @param x
     * @param y
     */
    private getMousePos(x: number, y: number): Point {
        const rect = this.distElement.getBoundingClientRect();

        return {
            x: x - rect.left,
            y: y - rect.top,
        };
    }

    private checkTarget(target: EventTarget): boolean {
        if (!this.app.getSettings().clickEventForward) return true;

        return !isInteractiveTarget(target);
    }

    private isRtl(): boolean {
        return this.app.getSettings().direction === 'rtl';
    }

    private flipForward(corner: FlipCorner): void {
        if (this.isRtl()) this.app.flipPrev(corner);
        else this.app.flipNext(corner);
    }

    private flipBackward(corner: FlipCorner): void {
        if (this.isRtl()) this.app.flipNext(corner);
        else this.app.flipPrev(corner);
    }

    private cornerFromY(y: number): FlipCorner {
        return y < this.app.getRender().getRect().height / 2 ? FlipCorner.TOP : FlipCorner.BOTTOM;
    }

    private detectSwipe(pos: Point): boolean {
        if (this.touchPoint === null) return false;

        const dx = pos.x - this.touchPoint.point.x;
        const distY = Math.abs(pos.y - this.touchPoint.point.y);
        let isSwipe = false;

        if (
            Math.abs(dx) > this.swipeDistance &&
            distY < this.swipeDistance * 2 &&
            Date.now() - this.touchPoint.time < this.swipeTimeout
        ) {
            const corner = this.cornerFromY(this.touchPoint.point.y);

            if (dx > 0) this.flipBackward(corner);
            else this.flipForward(corner);

            isSwipe = true;
        }

        this.touchPoint = null;
        return isSwipe;
    }

    private onKeyDown = (e: KeyboardEvent): void => {
        if (!this.app.getSettings().useKeyboardEvents) return;
        if (e.target !== this.parentElement) return;

        const rtl = this.isRtl();

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (rtl) this.app.flipPrev();
            else this.app.flipNext();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (rtl) this.app.flipNext();
            else this.app.flipPrev();
        } else if (e.key === 'Home') {
            e.preventDefault();
            this.app.flip(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            this.app.flip(this.app.getPageCount() - 1);
        }
    };

    private onPointerDown = (e: PointerEvent): void => {
        if (this.activePointerId !== null) return;
        if (!this.checkTarget(e.target)) return;

        const pos = this.getMousePos(e.clientX, e.clientY);
        this.activePointerId = e.pointerId;
        this.touchPoint = {
            point: pos,
            time: Date.now(),
        };

        this.app.startUserTouch(pos);

        if (this.distElement.setPointerCapture) {
            this.distElement.setPointerCapture(e.pointerId);
        }

        if (e.pointerType !== 'mouse') {
            if (!this.app.getSettings().mobileScrollSupport) e.preventDefault();
        } else {
            e.preventDefault();
        }
    };

    private onPointerMove = (e: PointerEvent): void => {
        if (this.activePointerId !== e.pointerId) return;

        const pos = this.getMousePos(e.clientX, e.clientY);

        if (e.pointerType === 'mouse') {
            this.app.userMove(pos, false);
            return;
        }

        if (this.app.getSettings().mobileScrollSupport) {
            if (this.touchPoint !== null) {
                if (
                    Math.abs(this.touchPoint.point.x - pos.x) > 10 ||
                    this.app.getState() !== FlippingState.READ
                ) {
                    if (e.cancelable) this.app.userMove(pos, true);
                }
            }

            if (this.app.getState() !== FlippingState.READ) {
                e.preventDefault();
            }
        } else {
            this.app.userMove(pos, true);
        }
    };

    private onPointerUp = (e: PointerEvent): void => {
        if (this.activePointerId !== e.pointerId) return;

        const pos = this.getMousePos(e.clientX, e.clientY);
        const isSwipe = e.pointerType !== 'mouse' ? this.detectSwipe(pos) : false;

        this.activePointerId = null;
        this.touchPoint = null;
        this.app.userStop(pos, isSwipe);
    };

    private onMouseDown = (e: MouseEvent): void => {
        if (this.checkTarget(e.target)) {
            const pos = this.getMousePos(e.clientX, e.clientY);

            this.app.startUserTouch(pos);

            e.preventDefault();
        }
    };

    private onTouchStart = (e: TouchEvent): void => {
        if (this.checkTarget(e.target)) {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];
                const pos = this.getMousePos(t.clientX, t.clientY);

                this.touchPoint = {
                    point: pos,
                    time: Date.now(),
                };

                setTimeout(() => {
                    if (this.touchPoint !== null) {
                        this.app.startUserTouch(pos);
                    }
                }, this.swipeTimeout);

                if (!this.app.getSettings().mobileScrollSupport) e.preventDefault();
            }
        }
    };

    private onMouseUp = (e: MouseEvent): void => {
        const pos = this.getMousePos(e.clientX, e.clientY);

        this.app.userStop(pos);
    };

    private onMouseMove = (e: MouseEvent): void => {
        const pos = this.getMousePos(e.clientX, e.clientY);

        this.app.userMove(pos, false);
    };

    private onTouchMove = (e: TouchEvent): void => {
        if (e.changedTouches.length > 0) {
            const t = e.changedTouches[0];
            const pos = this.getMousePos(t.clientX, t.clientY);

            if (this.app.getSettings().mobileScrollSupport) {
                if (this.touchPoint !== null) {
                    if (
                        Math.abs(this.touchPoint.point.x - pos.x) > 10 ||
                        this.app.getState() !== FlippingState.READ
                    ) {
                        if (e.cancelable) this.app.userMove(pos, true);
                    }
                }

                if (this.app.getState() !== FlippingState.READ) {
                    e.preventDefault();
                }
            } else {
                this.app.userMove(pos, true);
            }
        }
    };

    private onTouchEnd = (e: TouchEvent): void => {
        if (e.changedTouches.length > 0) {
            const t = e.changedTouches[0];
            const pos = this.getMousePos(t.clientX, t.clientY);
            const isSwipe = this.detectSwipe(pos);

            this.app.userStop(pos, isSwipe);
        }
    };
}
