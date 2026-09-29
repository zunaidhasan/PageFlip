const INTERACTIVE_SELECTOR = [
    'a',
    'button',
    'input',
    'textarea',
    'select',
    'label',
    'summary',
    'audio',
    'video',
    '[contenteditable="true"]',
    '[role="button"]',
    '[role="link"]',
    '[role="textbox"]',
    '[data-no-flip]',
].join(',');

export function isInteractiveTarget(target: EventTarget | null): boolean {
    if (target == null || !(target instanceof Element)) {
        return false;
    }

    return target.closest(INTERACTIVE_SELECTOR) !== null;
}
