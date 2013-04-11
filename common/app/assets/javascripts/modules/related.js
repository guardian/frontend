define(['common', 'modules/lazyload', 'modules/expandable'], function (common, lazyLoad, Expandable) {

    function related(config, context, url) {
        var container;

        if (config.page.hasStoryPackage) {

            new Expandable({dom: context.querySelector('.related-trails'), expanded: false}).init();
            common.mediator.emit('modules:related:loaded', config, context);

        } else if (config.switches.relatedContent) {

            container = context.querySelector('.js-related');

            lazyLoad({
                url: url,
                container: container,
                jsonpCallbackName: 'showRelated',
                success: function () {
                    new Expandable({dom: container.querySelector('.related-trails'), expanded: false}).init();
                    common.mediator.emit('modules:related:loaded', config, context);
                }
            });
        }

    }
    
    return related;
});
