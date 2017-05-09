define([
    'lib/config',
    'lib/fetch-json',
    'lib/fastdom-promise'
], function (config, fetchJson, fastdom) {

    return {
        init: loadNextVideo,
        load: loadNextVideo
    };

    function loadNextVideo() {

        var placeholders = document.querySelectorAll('.js-autoplay-placeholder');

        if (placeholders.length) {
            return fetchJson(config.page.ajaxUrl + '/'
                + config.page.pageId + '/'
                + 'autoplay.json', {mode: 'cors'})
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
