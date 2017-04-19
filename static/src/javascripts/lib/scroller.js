// @flow

/*  Auto scrolling with easing

    Usage:
    - scroller.scrollToElement(element, 500, 'easeOutQuad'); // 500ms scroll to element using easeOutQuad easing
    - scroller.scrollTo(1250, 250, 'linear'); // 250ms scroll to 1250px using linear gradient
    - scroller.scrollTo(100, 250, 'linear', document.querySelector('.container')); // 250ms scroll to 100px of scrollable container

    Note: if you pass in an element, you must also specify an easing function.
*/

import { createEasing } from 'lib/easing';
import bonzo from 'bonzo';
import fastdom from 'fastdom';

const scrollTo = (
    offset: number,
    duration: number = 0,
    easeFn?: string = 'easeOutQuad',
    container: ?HTMLElement = document.body
): void => {
    const $container = bonzo(container);
    const from = $container.scrollTop();
    const distance = offset - from;
    const ease = createEasing(easeFn, duration);
    const scrollFn = () => {
        fastdom.write(() => $container.scrollTop(from + ease() * distance));
    };
    const interval = setInterval(scrollFn, 15);

    setTimeout(() => {
        clearInterval(interval);
        fastdom.write(() => $container.scrollTop(offset));
    }, duration);
};

const scrollToElement = (
    element: HTMLElement | string,
    duration?: number = 0,
    easeFn?: string,
    container: ?HTMLElement
): void => {
    const top = bonzo(element).offset().top;
    scrollTo(top, duration, easeFn, container);
};

export { scrollTo, scrollToElement };
