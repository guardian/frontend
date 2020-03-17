// @flow
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { loadAdvert } from 'commercial/modules/dfp/load-advert';
import { Advert } from 'commercial/modules/dfp/Advert';
import { enableLazyLoad } from 'commercial/modules/dfp/lazy-load';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialGptLazyLoad } from 'common/modules/experiments/tests/commercial-gpt-lazy-load';

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
    const renderAtHalfViewport = isInVariantSynchronous(
        commercialGptLazyLoad,
        'halfViewport'
    );
    const renderAtQuarterViewport = isInVariantSynchronous(
        commercialGptLazyLoad,
        'quarterViewport'
    );
    const useGptLazyLoad = renderAtHalfViewport || renderAtQuarterViewport;

    window.addEventListener('scroll', () => {
        console.log('scroll --->', window.pageYOffset);
    });

    console.log('useGptLazyLoad --->', useGptLazyLoad);

    if (useGptLazyLoad) {
        const overrides = {
            fetchMarginPercent: renderAtHalfViewport ? 100 : 50,
            renderMarginPercent: renderAtHalfViewport ? 50 : 25,
        };
        console.log('overrides --->', overrides);
        window.googletag.pubads().enableLazyLoad();
    }

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
