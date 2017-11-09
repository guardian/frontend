// @flow
const observers: { [number]: window.IntersectionObserver } = Object.create(
    null
);
const callbacks: { [number]: Array<(number) => void> } = Object.create(null);
const elements: { [number]: Array<Element> } = Object.create(null);

const observe = (
    element: Element,
    threshold: number,
    callback: Thunk
): void => {
    if (!observers[threshold]) {
        callbacks[threshold] = [callback];
        elements[threshold] = [element];
        observers[threshold] = new window.IntersectionObserver(
            (entries: window.IntersectionObserverEntry[]) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        callbacks[threshold].forEach((c, index) => {
                            if (elements[threshold][index] === entry.target) {
                                c(entry.intersectionRatio);
                            }
                        });
                    }
                });
            },
            { threshold }
        );
    } else {
        callbacks[threshold].push(callback);
        elements[threshold].push(element);
    }
    observers[threshold].observe(element);
};

const unobserve = (
    element: Element,
    threshold: number,
    callback: Thunk
): void => {
    if (!observers[threshold]) return;

    observers[threshold].unobserve(element);

    const idx = callbacks[threshold].indexOf(callback);
    if (idx !== -1) {
        callbacks[threshold].splice(idx, 1);
        elements[threshold].splice(idx, 1);
    }

    if (callbacks[threshold].length === 0) {
        observers[threshold] = null;
    }
};

export { observe, unobserve };
