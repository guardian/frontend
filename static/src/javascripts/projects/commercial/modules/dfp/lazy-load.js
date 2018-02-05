// @flow

/* eslint no-use-before-define: "off" */

import { Advert } from 'commercial/modules/dfp/Advert';
import { getCurrentTime } from 'lib/user-timing';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { loadAdvert } from 'commercial/modules/dfp/load-advert';
import { updateAdvertMetric } from 'commercial/modules/dfp/performance-logging';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import once from 'lodash/functions/once';

const IntersectionObserver = window.IntersectionObserver;
const IntersectionObserverEntry = window.IntersectionObserverEntry;

const displayAd = (advertId: string): void => {
    const advert = getAdvertById(advertId);
    if (advert) {
        updateAdvertMetric(advert, 'lazyWaitComplete', getCurrentTime());
        loadAdvert(advert);
    }
};

// load the ads when the top or bottom of the ad is within 200px of the viewport
const lazyLoadDistancePx = 200;

const getObserver = once(
    () =>
        new window.IntersectionObserver(onIntersect, {
            rootMargin: `${lazyLoadDistancePx}px 0%`,
        })
);

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

export const enableLazyLoad = (advert: Advert): void =>
    getObserver().observe(advert.node);
