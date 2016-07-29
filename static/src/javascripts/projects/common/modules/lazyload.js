define([
    'common/utils/ajax',
    'common/utils/steady-page',
    'bonzo',
    'lodash/objects/merge'
], function (
    ajax,
    steadyPage,
    bonzo,
    merge
) {
    function identity(x) {
        return x;
    }

    function lazyload(options) {

        /*
            Accepts these options:

            url               - string
            container         - element object
            beforeInsert      - function applied to response html before inserting it into container, optional
            success           - callback function, optional
            error             - callback function, optional
            always            - callback function, optional
            force             - boolean, default false. Reload an already-populated container
        */
        options = merge({
            success: identity,
            error:   identity,
            always:  identity,
            beforeInsert: identity,
            force: false
        }, options);

        if (options.url && options.container) {
            var $container = bonzo(options.container);
            if (options.force || !$container.hasClass('lazyloaded')) {
                return ajax({
                    url: options.url,
                    type: 'json',
                    crossOrigin: true
                })
                .then(function (resp) {
                    return steadyPage.insert($container[0], function(){
                        $container.html(options.beforeInsert(resp.html))
                            .addClass('lazyloaded');
                    }).then(function(){
                        options.success(resp);    
                    });
                })
                .catch(options.error)
                .always(options.always);
            }
        }
    }

    return lazyload;
});
