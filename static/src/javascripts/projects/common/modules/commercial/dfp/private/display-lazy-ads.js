define([
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/load-advert',
    'common/modules/commercial/dfp/private/lazy-load'
], function (dfpEnv, loadAdvert, lazyLoad) {
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
        lazyLoad.enableLazyLoad();
    }

    function instantLoad() {
        dfpEnv.advertsToLoad
            .filter(function (_) {
                return advertsToInstantlyLoad.indexOf(_.id) > -1;
            })
            .forEach(loadAdvert);
    }
});
