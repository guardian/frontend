define([
    'bean',
    'fastdom',
    'common/modules/analytics/beacon'
], function (
    bean,
    fastdom,
    beacon
) {

    return {
        init: function () {
            if (window.matchMedia) {
                var mql = window.matchMedia('print');
                mql.addListener(function () {
                    if (mql.matches) {
                        beacon.fire('/count/print.gif');
                    }
                });
            }
        }
    };
});
