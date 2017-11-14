// @flow
import mediator from 'lib/mediator';

let listening = false;
let elementCount = 0;
const elements = Object.create(null);

const onScroll = () => {
    const viewportHeight = window.innerHeight;

    Object.keys(elements).forEach((threshold: string) => {
        elements[threshold].forEach(({ element, callback }) => {
            const rect = element.getBoundingClientRect();
            const isNotHidden =
                rect.top + rect.left + rect.right + rect.bottom !== 0;
            const area = (rect.bottom - rect.top) * (rect.right - rect.left);
            const visibleAreaPrime =
                rect.top >= viewportHeight
                    ? 0
                    : (Math.min(viewportHeight, rect.bottom) -
                          Math.max(0, rect.top)) *
                      (rect.right - rect.left);
            const visibleArea = rect.bottom <= 0 ? 0 : visibleAreaPrime;
            const intersectionRatio = visibleArea / area;
            if (isNotHidden && intersectionRatio >= parseInt(threshold, 10)) {
                setTimeout(callback, 0, visibleArea);
            }
        });
    });
};

const observe = (element: Element, threshold: number, callback: () => void) => {
    if (!listening) {
        mediator.on('window:throttledScroll', onScroll);
        listening = true;
    }

    elements[threshold] = elements[threshold] || [];
    elements[threshold].push({ element, callback });
    elementCount += 1;
};

const unobserve = (
    element: Element,
    threshold: number,
    callback: () => void
) => {
    if (!elements[threshold]) return;

    const lengthBefore = elements[threshold].length;
    elements[threshold] = elements[threshold].filter(
        ({ relement, rcallback }) =>
            relement !== element && rcallback !== callback
    );

    elementCount -= lengthBefore - elements[threshold].length;

    if (elementCount === 0) {
        mediator.off('window:throttledScroll', onScroll);
        listening = false;
    }
};

export { observe, unobserve };
