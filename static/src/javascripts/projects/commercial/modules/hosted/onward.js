define([
    'common/utils/config',
    'common/utils/fetch-json',
    'common/utils/fastdom-promise'
], function (config, fetchJson, fastdom) {

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
                    });
                });
        }
        return Promise.resolve();
    }
});
