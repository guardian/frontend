// @flow

import { Advert } from 'commercial/modules/dfp/Advert';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { loadAdvert, refreshAdvert } from 'commercial/modules/dfp/load-advert';
import { updateAdvertMetric } from 'commercial/modules/dfp/performance-logging';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { getCurrentTime } from 'lib/user-timing';
import once from 'lodash/functions/once';

const IntersectionObserver = window.IntersectionObserver;
const IntersectionObserverEntry = window.IntersectionObserverEntry;

const displayAd = (advertId: string): void => {
    const advert = getAdvertById(advertId);
    if (advert) {
        if (advert.isRendered) {
            refreshAdvert(advert);
        } else {
            updateAdvertMetric(advert, 'lazyWaitComplete', getCurrentTime());
            loadAdvert(advert);
        }
    }
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

const getObserver = once(() =>
    Promise.resolve(
        new window.IntersectionObserver(onIntersect, {
            rootMargin: '200px 0px',
        })
    )
);

export const enableLazyLoad = (advert: Advert): void =>
    getObserver().then(observer => observer.observe(advert.node));
