define(['common', 'modules/lazyload', 'modules/ui/expandable'], function (common, LazyLoad, Expandable) {

    function related(config, context, url) {
        var container;

        if (config.page && config.page.hasStoryPackage) {

            new Expandable({
                dom: context.querySelector('.related-trails'),
                expanded: false,
                showCount: false
            }).init();
            common.mediator.emit('modules:related:loaded', config, context);

        } else if (config.switches && config.switches.relatedContent) {

            container = context.querySelector('.js-related');
            if (container) {
                new LazyLoad({
                    url: url || '/related/' + config.page.pageId + '.json',
                    container: container,
                    success: function () {
                        new Expandable({dom: container.querySelector('.related-trails'), expanded: false, showCount: false}).init();
                        common.mediator.emit('modules:related:loaded', config, context);
                    },
                    error: function(req) {
                        common.mediator.emit('module:error', 'Failed to load related: ' + req.statusText, 'modules/related.js');
                    }
                }).load();
            }
        }

    }

    return related;
});
