define([
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/load-advert',
    'common/modules/commercial/dfp/private/enable-lazy-load'
], function (dfpEnv, loadAdvert, enableLazyLoad) {
    var advertsToInstantlyLoad = [
        'dfp-ad--pageskin-inread',
        'dfp-ad--merchandising-high',
        'dfp-ad--im'
    ];

    return displayLazyAds;

    function displayLazyAds() {
        window.googletag.pubads().collapseEmptyDivs();
        window.googletag.enableServices();
        instantLoad();
        enableLazyLoad();
    }

    function instantLoad() {
        dfpEnv.advertsToLoad
            .filter(function (_) {
                return advertsToInstantlyLoad.indexOf(_.id) > -1;
            })
            .forEach(loadAdvert);
    }
});
