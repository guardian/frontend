import fastdom from 'fastdom';
import qwery from 'qwery';
import { getViewport } from 'lib/detect';
import { mediator } from 'lib/mediator';
import throttle from 'lodash/throttle';

const distanceBeforeLoad = getViewport().height;

// Checks whether the element is within one screenful above or below the viewport
const withinRange = (container) => {
    const nextEl = container.nextElementSibling;
    const top = nextEl ? nextEl.getBoundingClientRect().top : 0;
    return -distanceBeforeLoad < top && top < 2 * distanceBeforeLoad;
};

// Removes the fc-container--lazy-load class
const displayContainer = (container) => {
    container.classList.remove('fc-container--lazy-load');
};

export const lazyLoadContainers = () => {
    let containers = qwery('.js-container--lazy-load');
    const lazyLoad = throttle(() => {
        if (containers.length === 0) {
            mediator.off('window:throttledScroll', lazyLoad);
        } else {
            fastdom.measure(() => {
                const containersInRange = containers.reduce(
                    (result, container) => {
                        result[withinRange(container) ? 'in' : 'out'].push(
                            container
                        );
                        return result;
                    },
                    {
                        in: [],
                        out: [],
                    }
                );

                containers = containersInRange.out;

                fastdom.mutate(() => {
                    containersInRange.in.forEach(displayContainer);
                });
            });
        }
    }, 500);

    mediator.on('window:throttledScroll', lazyLoad);
    lazyLoad();
};
