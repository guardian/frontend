define([
    'raven',
    'common/utils/mediator',
    'common/modules/lazyload'
], function (
    raven,
    mediator,
    LazyLoad
) {

    function popular(config, isExpandable, url, targetSelector) {
        mediator.emit('register:begin', 'popular-in-section');

        targetSelector = targetSelector || '.js-popular';
        var hasSection, expandable,
            container = document.body.querySelector(targetSelector);

        if (container) {
            // some pages, e.g. profiles, are flagged as 'section: global', a non-existent section - this ignores those
            hasSection = config.page && config.page.section && config.page.section !== 'global';
            expandable = isExpandable ? '/expandable' : '';

            url = url || '/most-read' + expandable + (hasSection ? '/' + config.page.section : '');
            new LazyLoad({
                url: url + '.json',
                container: container,
                success: function () {
                    mediator.emit('modules:popular:loaded', container);
                    mediator.emit('fragment:ready:images', container);
                    mediator.emit('register:end', 'popular-in-section');
                },
                error: function () {
                    mediator.emit('register:error', 'popular-in-section');
                }
            }).load();
        }
    }

    return popular;
});
