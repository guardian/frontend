// @flow

import bonzo from 'bonzo';
import debounce from 'lodash/debounce';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';

let items = [];
const scroll = { top: 0, bottom: 0 };

const doProximityLoading = (): void => {
    scroll.top = window.pageYOffset;
    scroll.bottom = scroll.top + bonzo.viewport().height;
    items = items.filter(item => {
        if (item.conditionFn()) {
            item.loadFn();
            return false;
        }

        return true;
    });

    if (items.length === 0) {
        mediator.off('window:throttledScroll', doProximityLoading);
    }
};

const doProximityLoadingDebounced = debounce(doProximityLoading, 2000);

const addItem = (conditionFn: () => boolean, loadFn: () => void): void => {
    // calls `loadFn` when `conditionFn` is true
    const item = { conditionFn, loadFn };

    items.push(item);

    if (items.length === 1) {
        mediator.on('window:throttledScroll', doProximityLoading);
    }

    doProximityLoadingDebounced();
};

const addProximityLoader = (
    el: HTMLElement,
    distanceThreshold: number,
    loadFn: () => void
): void => {
    // calls `loadFn` when screen is within `distanceThreshold` of `el`
    fastdom.read(() => {
        const $el = bonzo(el);
        const conditionFn = () => {
            const elOffset = $el.offset();
            const loadAfter = elOffset.top - distanceThreshold;
            const loadBefore =
                elOffset.top + elOffset.height + distanceThreshold;

            return scroll.top > loadAfter && scroll.bottom < loadBefore;
        };

        addItem(conditionFn, loadFn);
    });
};

export { addProximityLoader };
