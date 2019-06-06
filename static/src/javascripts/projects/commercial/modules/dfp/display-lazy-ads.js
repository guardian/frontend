// @flow
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { loadAdvert } from 'commercial/modules/dfp/load-advert';
import { Advert } from 'commercial/modules/dfp/Advert';
import { enableLazyLoad } from 'commercial/modules/dfp/lazy-load';

const advertsToInstantlyLoad = ['dfp-ad--merchandising-high', 'dfp-ad--im'];

const instantLoad = (): void => {
    const instantLoadAdverts = dfpEnv.advertsToLoad.filter(
        (advert: Advert): boolean => advertsToInstantlyLoad.includes(advert.id)
    );

    dfpEnv.advertsToLoad = dfpEnv.advertsToLoad.filter(
        (advert: Advert): boolean => !advertsToInstantlyLoad.includes(advert.id)
    );

    instantLoadAdverts.forEach(loadAdvert);
};

const displayLazyAds = (): void => {
    window.googletag.pubads().collapseEmptyDivs();
    window.googletag.enableServices();
    instantLoad();

    dfpEnv.advertsToLoad.forEach(
        (advert: Advert): void => {
            enableLazyLoad(advert);
        }
    );
};

export { displayLazyAds };
