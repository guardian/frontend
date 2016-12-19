define([
    'common/utils/config',
    'common/utils/fetch-json',
    'common/utils/fastdom-promise',
    'commercial/modules/hosted/onward-journey-carousel',
    'commercial/modules/dfp/performance-logging',
    'Promise'
], function (config, fetchJson, fastdom, HostedCarousel, performanceLogging, Promise) {

    return {
        init: loadOnwardComponent,
        customTiming: true
    };

    function loadOnwardComponent(moduleName) {
        performanceLogging.moduleStart(moduleName);

        var placeholders = document.getElementsByClassName('js-onward-placeholder');

        if (placeholders.length) {
            fetchJson(config.page.ajaxUrl + '/'
                + config.page.pageId + '/'
                + config.page.contentType.toLowerCase() + '/'
                + 'onward.json', {mode: 'cors'})
                .then(function (json) {
                    return fastdom.write(function () {
                        var i;
                        for (i = 0; i < placeholders.length; i++) {
                            placeholders[i].innerHTML = json.html;
                        }
                        new HostedCarousel.init();
                    });
                })
                .then(function () {
                    performanceLogging.moduleEnd(moduleName);
                });
        }
        return Promise.resolve();
    }
});
