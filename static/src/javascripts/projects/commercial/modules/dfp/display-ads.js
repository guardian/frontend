import dfpEnv from 'commercial/modules/dfp/dfp-env';
import loadAdvert from 'commercial/modules/dfp/load-advert';
export default displayAds;

function displayAds() {
    window.googletag.pubads().enableSingleRequest();
    window.googletag.pubads().collapseEmptyDivs();
    window.googletag.enableServices();
    // as this is an single request call, only need to make a single display call (to the first ad
    // slot)
    loadAdvert(dfpEnv.dfpEnv.advertsToLoad[0]);
    dfpEnv.dfpEnv.advertsToLoad.length = 0;
}
