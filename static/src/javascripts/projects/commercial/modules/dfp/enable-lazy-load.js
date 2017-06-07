// @flow

import { Advert } from 'commercial/modules/dfp/Advert';
import mediator from 'lib/mediator';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { onIntersect, onScroll } from 'commercial/modules/dfp/lazy-load';

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
            onScroll();
        }
    }
    if (dfpEnv.lazyLoadObserve) {
        observer.observe(advert.node);
    }
};

export { enableLazyLoad };
