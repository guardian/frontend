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
                if (!resp.status) {
                    // IE9 uses XDomainRequest which doesn't set the response status thus failing
                    // even when the response was actually valid
                    return resp.text().then(function (responseText) {
                        try {
                            return JSON.parse(responseText);
                        } catch (ex) {
                            throw new Error('Fetch error: Invalid JSON response');
                        }
                    });
                } else {
                    throw new Error('Fetch error: ' + resp.statusText);
                }
            }
        });
    }

    return json;
});
