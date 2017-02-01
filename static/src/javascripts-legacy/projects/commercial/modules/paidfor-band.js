define([
    'Promise',
    'common/utils/config',
    'common/modules/ui/sticky',
    'common/modules/commercial/commercial-features',
    'commercial/modules/dfp/performance-logging',
], function (Promise, config, Sticky, commercialFeatures, performanceLogging) {
    function init(moduleName) {
        if (!commercialFeatures.paidforBand) {
            return Promise.resolve(false);
        }

        performanceLogging.moduleStart(moduleName);

        var elem = document.querySelector('.paidfor-band');
        if (elem) {
            new Sticky(elem).init();
        }

        performanceLogging.moduleEnd(moduleName);

        return Promise.resolve();
    }

    return {
        init: init
    };
});
