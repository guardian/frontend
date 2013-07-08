define(['common', 'bonzo', 'modules/lazyload'], function (common, bonzo, LazyLoad) {

    function cricketsummary(config, context, url) {
        var container = document.createElement("div"); //context.querySelector('.after-headline');
        container.className = "after-headline";

        if (container) {

            new LazyLoad({
                url: url,
                container: container,
                success: function () {
                    bonzo(context.querySelector('.article-headline')).after(container);
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
