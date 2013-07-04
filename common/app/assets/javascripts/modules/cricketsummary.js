define(['common', 'modules/lazyload'], function (common, LazyLoad) {

    function cricketsummary(config, context, url) {
        var container = context.querySelector('.after-headline');

        if (container) {

            new LazyLoad({
                url: url,
                container: container,
                success: function () {
                    common.mediator.emit('modules:cricketsummary:loaded', config, context);
                },
                error: function(req) {
                    common.mediator.emit('module:error', 'Failed to load cricketsummary: ' + req.statusText, 'modules/cricketsummary.js');
                }
            }).load();

            common.mediator.emit('modules:cricketsummary:loaded', config, context);
        }
    }

    return cricketsummary;
});
