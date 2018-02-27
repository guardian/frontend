// @flow

import { Advert } from 'commercial/modules/dfp/Advert';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { loadAdvert, refreshAdvert } from 'commercial/modules/dfp/load-advert';
import { updateAdvertMetric } from 'commercial/modules/dfp/performance-logging';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { getTestVariantId } from 'common/modules/experiments/utils.js';
import config from 'lib/config';
import { getViewport, getBreakpoint } from 'lib/detect';
import fastdom from 'lib/fastdom-promise';
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

const optimisedRootMargin = (viewport: {
    width: number,
    height: number,
}): Object => ({
    front: {
        mobile: viewport.height * 2,
        tablet: viewport.height * 2,
        desktop: viewport.height * 3 / 2,
        wide: viewport.height * 3 / 2,
    },
    'non-front': {
        mobile: viewport.height * 3 / 2,
        tablet: viewport.height * 3 / 2,
        desktop: viewport.height,
        wide: viewport.height,
    },
});

const calculateLazyLoadingDistance = (viewport: {
    width: number,
    height: number,
}) => {
    const variant = getTestVariantId('CommercialLazyLoading');

    if (variant === '400px') {
        return 400;
    }

    if (variant === '1vh') {
        return viewport.height;
    }

    if (variant === '0.5vh') {
        return viewport.height / 2;
    }

    if (variant === 'richard') {
        const breakpoint = getBreakpoint();
        const front = config.page.isFront ? 'front' : 'non-front';
        return optimisedRootMargin(viewport)[front][breakpoint];
    }

    return 200;
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

const readViewport = (): Promise<{ width: number, height: number }> =>
    fastdom.read(() => getViewport());

const getObserver = once(() =>
    readViewport()
        .then(calculateLazyLoadingDistance)
        .then(
            distance =>
                new window.IntersectionObserver(onIntersect, {
                    rootMargin: `${distance}px 0px`,
                })
        )
);

export const enableLazyLoad = (advert: Advert): void =>
    getObserver().then(observer => observer.observe(advert.node));
