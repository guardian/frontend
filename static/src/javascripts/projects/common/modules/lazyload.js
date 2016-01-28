define([
    'common/utils/ajax',
    'bonzo',
    'lodash/objects/assign'
], function (
    ajax,
    bonzo,
    assign
) {

    var LazyLoad = function (options) {

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

        var into,
            defaultOpts = {
                success: function () {},
                error:   function () {},
                always:  function () {},
                beforeInsert: function (html) { return html; },
                force: false
            },
            opts = assign(defaultOpts, options || {});

        this.load = function () {

            if (opts.url && opts.container) {
                into = bonzo(opts.container);
                if (opts.force || !into.hasClass('lazyloaded')) {
                    return ajax({
                        url: opts.url,
                        type: 'json',
                        crossOrigin: true
                    }).then(
                        function (resp) {
                            into.html(opts.beforeInsert(resp.html));
                            into.addClass('lazyloaded');
                            opts.success(resp);
                        },
                        function (req) {
                            opts.error(req);
                        }
                    ).always(
                        function (resp) {
                            opts.always(resp);
                        }
                    );
                }
            }
        };

    };

    return LazyLoad;
});
