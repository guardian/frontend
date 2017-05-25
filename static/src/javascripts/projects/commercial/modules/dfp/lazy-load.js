// @flow

/* eslint no-use-before-define: "off" */

import detect from 'lib/detect';
import { getCurrentTime } from 'lib/user-timing';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import loadAdvert from 'commercial/modules/dfp/load-advert';
import { updateAdvertMetric } from 'commercial/modules/dfp/performance-logging';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';

const IntersectionObserver = window.IntersectionObserver;
const IntersectionObserverEntry = window.IntersectionObserverEntry;

/* depthOfScreen: double. Top and bottom margin of the visual viewport to check for the presence of an advert */
const depthOfScreen = 1.5;

const displayAd = (advertId: string): void => {
    const advert = getAdvertById(advertId);
    if (advert) {
        updateAdvertMetric(advert, 'lazyWaitComplete', getCurrentTime());
        loadAdvert(advert);
    }
};

const onScroll = (): void => {
    const viewportHeight: number = detect.getViewport().height;

    const lazyLoadAds: Array<string> = dfpEnv.advertsToLoad
        .filter(advert => {
            const rect: window.DOMRect = advert.node.getBoundingClientRect();
            const isNotHidden: boolean =
                rect.top + rect.left + rect.right + rect.bottom !== 0;
            const isNotTooFarFromTop: boolean =
                (1 - depthOfScreen) * viewportHeight < rect.bottom;
            const isNotTooFarFromBottom: boolean =
                rect.top < viewportHeight * depthOfScreen;
            // load the ad only if it's setting within an acceptable range
            return isNotHidden && isNotTooFarFromTop && isNotTooFarFromBottom;
        })
        .map(advert => advert.id);

    dfpEnv.advertsToLoad = dfpEnv.advertsToLoad.filter(
        advert => !lazyLoadAds.includes(advert.id)
    );

    lazyLoadAds.forEach(displayAd);
};

const onIntersect = (
    entries: Array<IntersectionObserverEntry>,
    observer: IntersectionObserver
): void => {
    const advertIds: Array<string> = [];

    entries
        .filter(entry => !('isIntersecting' in entry) || entry.isIntersecting)
        .forEach(entry => {
            observer.unobserve(entry.target);
            displayAd(entry.target.id);
            advertIds.push(entry.target.id);
        });

    dfpEnv.advertsToLoad = dfpEnv.advertsToLoad.filter(
        advert => advertIds.indexOf(advert.id) < 0
    );
};

export { onIntersect, onScroll };
