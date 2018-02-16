// @flow

/* eslint no-use-before-define: "off" */

import { Advert } from 'commercial/modules/dfp/Advert';
import { getCurrentTime } from 'lib/user-timing';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { loadAdvert, refreshAdvert } from 'commercial/modules/dfp/load-advert';
import { updateAdvertMetric } from 'commercial/modules/dfp/performance-logging';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { getTestVariantId } from 'common/modules/experiments/utils.js';
import once from 'lodash/functions/once';
import fastdom from 'lib/fastdom-promise';

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

const calculateLazyLoadingDistance = () => {
    const variant = getTestVariantId('CommercialLazyLoading');

    if (variant === '400') {
        return 400;
    }

    if (variant === '1vh') {
        return window.innerHeight;
    }

    if (variant === '0.5vh') {
        return window.innerHeight / 2;
    }

    return 200;
};

const getObserver = once(
    () =>
        new window.IntersectionObserver(onIntersect, {
            rootMargin: `${calculateLazyLoadingDistance()}px 0%`,
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
