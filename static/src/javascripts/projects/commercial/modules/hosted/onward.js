define([
    'common/utils/config',
    'common/utils/fetch-json',
    'common/utils/fastdom-promise',
    'commercial/modules/hosted/onward-journey-carousel'
], function (config, fetchJson, fastdom, HostedCarousel) {

    return {
        init: loadOnwardComponent
    };

    function loadOnwardComponent() {

        var placeholders = document.querySelectorAll('.js-onward-placeholder');

        if (placeholders.length) {
            var contentType = config.page.contentType.toLowerCase();
            var query = contentType === 'article' ? '?items=12' : '';
            return fetchJson(config.page.ajaxUrl + '/'
                + config.page.pageId + '/'
                + contentType + '/'
                + 'onward.json' + query, {mode: 'cors'})
                .then(function (json) {
                    return fastdom.write(function () {
                        var i;
                        for (i = 0; i < placeholders.length; i++) {
                            placeholders[i].innerHTML = json.html;
                        }
                        new HostedCarousel.init();
                    });
                });
        }
        return Promise.resolve();
    }
});
