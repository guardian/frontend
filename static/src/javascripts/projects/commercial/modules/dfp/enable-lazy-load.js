// @flow

import mediator from 'lib/mediator';
import dfpEnv from 'commercial/modules/dfp/dfp-env';
import { onIntersect, onScroll } from 'commercial/modules/dfp/lazy-load';

/* observer: IntersectionObserver?. The observer used to detect when ad slots enter the viewport */
let observer: window.IntersectionObserver = null;

const enableLazyLoad = (advert?: Object): void => {
    if (!dfpEnv.lazyLoadEnabled) {
        dfpEnv.lazyLoadEnabled = true;
        if (dfpEnv.lazyLoadObserve) {
            observer = new window.IntersectionObserver(onIntersect, {
                rootMargin: '200px 0%',
            });
            dfpEnv.advertsToLoad.forEach((ad: Object): void => {
                observer.observe(ad.node);
            });
        } else {
            mediator.on('window:throttledScroll', onScroll);
            onScroll();
        }
    } else if (dfpEnv.lazyLoadObserve && advert) {
        observer.observe(advert.node);
    }
};

export { enableLazyLoad };
