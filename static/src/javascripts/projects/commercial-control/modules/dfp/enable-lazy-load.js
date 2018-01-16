// @flow

import { Advert } from 'commercial-control/modules/dfp/Advert';
import mediator from 'lib/mediator';
import { dfpEnv } from 'commercial-control/modules/dfp/dfp-env';
import { onIntersect, onScroll } from 'commercial-control/modules/dfp/lazy-load';

/* observer: IntersectionObserver?. The observer used to detect when ad slots enter the viewport */
let observer: window.IntersectionObserver = null;

const enableLazyLoad = (advert: Advert): void => {
    if (!dfpEnv.lazyLoadEnabled) {
        dfpEnv.lazyLoadEnabled = true;
        if (dfpEnv.lazyLoadObserve) {
            observer = new window.IntersectionObserver(onIntersect, {
                rootMargin: '200px 0%',
            });
        } else {
            mediator.on('window:throttledScroll', onScroll);
        }
    }
    if (dfpEnv.lazyLoadObserve) {
        observer.observe(advert.node);
    } else {
        onScroll();
    }
};

export { enableLazyLoad };
