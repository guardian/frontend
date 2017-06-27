define([
    'lib/fetch-json',
    'lib/fastdom-promise',
    'bonzo',
    'lodash/objects/merge'
], function (
    fetchJSON,
    fastdom,
    bonzo,
    merge
) {
    function identity(x) {
        return x;
    }

    function lazyload(url, options) {
        /*
            Accepts these options:

            url               - string
            container         - element object
            beforeInsert      - function applied to response html before inserting it into container, optional
            success           - callback function, optional
            error             - callback function, optional
            force             - boolean, default false. Reload an already-populated container
        */

        options = merge({
            beforeInsert: identity,
            force: false,
            finally: identity,
            catch: identity,
        }, options);

        if (url && options.container) {
            var $container = bonzo(options.container);

            if (options.force || !$container.hasClass('lazyloaded')) {
                return fetchJSON(url, {
                    mode: 'cors',
                })
                .then(function (resp) {
                    return fastdom.mutate(function() {
                        $container
                            .html(options.beforeInsert(resp.html))
                            .addClass('lazyloaded');

                        return resp;
                    });
                })
                .then(options.finally)
                .catch(options.catch);
            }
        }
    }

    return lazyload;
});
