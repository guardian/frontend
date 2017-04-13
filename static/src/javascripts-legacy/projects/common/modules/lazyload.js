define([
    'lib/fetch-json',
    'lib/steady-page',
    'bonzo',
    'lodash/objects/merge'
], function (
    fetchJSON,
    steadyPage,
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
                    return steadyPage.insert($container[0], function() {
                        $container.html(options.beforeInsert(resp.html))
                            .addClass('lazyloaded');
                    }).then(function() {
                        return resp;
                    });
                })
                .then(options.finally(resp))
                .catch(options.catch);
            }
        }
    }

    return lazyload;
});
