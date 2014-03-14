define([
    'common/common',
    'common/modules/lazyload',
    'common/modules/analytics/register'
], function (
    common,
    LazyLoad,
    register
) {

    function popular(config, context, isExpandable, url, targetSelector) {
        register.begin('popular-in-section');

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
                    common.mediator.emit('modules:popular:loaded', container);
                    common.mediator.emit('fragment:ready:images', container);
                    register.end('popular-in-section');
                },
                error: function(req) {
                    common.mediator.emit('module:error', 'Failed to load most read: ' + req.statusText, 'common/modules/popular.js');
                    register.error('popular-in-section');
                }
            }).load();
        }
    }

    return popular;
});
