define([
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/fetch-json',
    'common/utils/fastdom-promise',
    'commercial/modules/hosted/onward-journey-carousel',
    'commercial/modules/dfp/performance-logging',
    'Promise'
], function (config, mediator, fetchJson, fastdom, HostedCarousel, performanceLogging, Promise) {

    return {
        init: loadOnwardComponent,
        whenRendered: new Promise(function (resolve) {
            mediator.on('hosted:onward:done', resolve);
        })
    };

    function loadOnwardComponent(moduleName) {
        var placeholders = document.getElementsByClassName('js-onward-placeholder');

        if (placeholders.length) {
            performanceLogging.moduleStart(moduleName);

            fetchJson(config.page.ajaxUrl + '/'
                + config.page.pageId + '/'
                + config.page.contentType.toLowerCase() + '/'
                + 'onward.json', {mode: 'cors'})
                .then(function (json) {
                    return fastdom.write(function () {
                        var i;
                        for (i = 0; i < placeholders.length; i++) {
                            placeholders[i].insertAdjacentHTML('beforeend', json.html);
                        }
                    });
                })
                .then(function () {
                    HostedCarousel.init();
                    mediator.emit('hosted:onward:done');
                })
                .then(performanceLogging.moduleEnd.bind(null, moduleName));
        }

        return Promise.resolve();
    }
});
