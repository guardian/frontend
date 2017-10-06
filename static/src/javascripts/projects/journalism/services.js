// @flow

import fastdom from 'lib/fastdom-promise';
import ophan from 'ophan/ng';

const dom = fastdom;

const viewport = {
    observe: (
        element: HTMLElement,
        threshold: number,
        callback: Function
    ): void => {
        const observer = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]) => {
                entries.forEach((entry: IntersectionObserverEntry) => {
                    callback(entry.intersectionRatio);
                });
            },
            { threshold }
        );
        observer.observe(element);
    },
    unobserve: () => {
        console.log('Unobserving element...');
    },
};

export { dom, ophan, viewport };
