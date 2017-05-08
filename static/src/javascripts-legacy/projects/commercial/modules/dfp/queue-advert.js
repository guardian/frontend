define([
    'commercial/modules/dfp/dfp-env'
], function (dfpEnv) {
    return queueAdvert;

    function queueAdvert(advert) {
        dfpEnv.advertsToLoad.push(advert);
        // Add to the array of ads to be refreshed (when the breakpoint changes)
        // only if its `data-refresh` attribute isn't set to false.
        if (advert.node.getAttribute('data-refresh') !== 'false') {
            dfpEnv.advertsToRefresh.push(advert);
        }
    }

});
