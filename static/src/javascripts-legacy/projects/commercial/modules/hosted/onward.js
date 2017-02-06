define([
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/fetch-json',
    'common/utils/fastdom-promise',
    'commercial/modules/hosted/onward-journey-carousel',
    'Promise'
], function (config, mediator, fetchJson, fastdom, HostedCarousel, Promise) {

    return {
        init: loadOnwardComponent,
        whenRendered: new Promise(function (resolve) {
            mediator.on('hosted:onward:done', resolve);
        })
    };

    function loadOnwardComponent(start, stop) {
        start();

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
                            placeholders[i].insertAdjacentHTML('beforeend', json.html);
                        }
                    });
                })
                .then(function () {
                    HostedCarousel.init();
                    mediator.emit('hosted:onward:done');
                })
                .then(stop);
        } else {
            stop();
        }

        return Promise.resolve();
    }
});
