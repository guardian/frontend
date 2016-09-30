define([
    'common/utils/config',
    'common/utils/fetch-json',
    'common/utils/fastdom-promise'
], function (config, fetchJson, fastdom) {

    return {
        init: loadOnwardComponent()
    };

    function loadOnwardComponent() {

        // todo: why is this necessary?  if it's not here get 404s all over the site
        if (config.page.isHosted) {

            var placeholder = document.querySelector('.js-onward-placeholder');

            return fetchJson(config.page.ajaxUrl + '/'
                + config.page.pageId + '/'
                + config.page.contentType.toLowerCase() + '/'
                + 'onward.json')
                .then(function (json) {
                    return fastdom.write(function () {
                        placeholder.innerHTML = json.html;
                    });
                });
        }
    }
});
