define([
    'common/utils/config',
    'common/utils/fetch-json',
    'common/utils/fastdom-promise',
    'commercial/modules/hosted/onward-journey-popup',
    'commercial/modules/hosted/onward-journey-carousel'
], function (config, fetchJson, fastdom, HostedPopup, HostedCarousel) {

    return {
        init: loadOnwardComponent
    };

    function loadOnwardComponent() {

        var placeholders = document.querySelectorAll('.js-onward-placeholder');

        if (placeholders.length) {
            return fetchJson(config.page.ajaxUrl + '/'
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
                        new HostedPopup.init();
                    });
                });
        }
        return Promise.resolve();
    }
});
