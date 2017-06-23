// @flow

import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import loadAdvert from 'commercial/modules/dfp/load-advert';
import { pageSkin } from 'commercial/modules/creatives/page-skin';

const displayAds = (): void => {
    window.googletag.pubads().enableSingleRequest();
    window.googletag.pubads().collapseEmptyDivs();
    window.googletag.enableServices();
    // as this is an single request call, only need to make a single display call (to the first ad
    // slot)
    loadAdvert(dfpEnv.advertsToLoad[0]);
    dfpEnv.advertsToLoad.length = 0;
    pageSkin();
};

export { displayAds };
