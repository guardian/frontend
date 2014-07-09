define([
    'common/modules/lazyload',
    'common/utils/mediator'
], function (
    LazyLoad,
    mediator
) {


    function popular(config, context, isExpandable, url, targetSelector) {
       mediator.emit('register:begin','popular-in-section');

        targetSelector = targetSelector || '.js-popular';
        var container = context.querySelector(targetSelector);

        if (container) {
            // some pages, e.g. profiles, are flagged as 'section: global', a non-existent section - this ignores those
            var hasSection = config.page && config.page.section && config.page.section !== 'global',
                expandable = isExpandable ? '/expandable' : '';

            url = url || '/most-read' + expandable + (hasSection ? '/' + config.page.section : '');
            new LazyLoad({
                url: url + '.json',
                container: container,
                success: function () {
                    mediator.emit('modules:popular:loaded', container);
                    mediator.emit('fragment:ready:images', container);
                    mediator.emit('register:end','popular-in-section');
                },
                error: function(req) {
                    mediator.emit('module:error', 'Failed to load most read: ' + req.statusText, 'common/modules/popular.js');
                    mediator.emit('register:error','popular-in-section');
                }
            }).load();
        }
    }

    return popular;
});

