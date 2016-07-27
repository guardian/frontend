define([
    'common/utils/config',
    'common/utils/fetch'
], function (
    config,
    fetch
) {
    function json (input, init) {
        if (!input.match('^(https?:)?//')) {
            input = (config.page.ajaxUrl || '') + input;
            init = init || {};
            init.mode = 'cors';
        }

        return fetch(input, init)
        .then(function (resp) {
            if (resp.ok) {
                return resp.json();
            } else {
                throw new Error('Fetch error: ' + resp.statusText);
            }
        });
    }

    return json;
});
