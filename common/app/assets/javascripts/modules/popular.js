define(['common', 'modules/lazyload'], function (common, LazyLoad) {

    function popular(config, context, url) {
        var container = context.querySelector('.js-popular');

        if (container) {
            // some pages, e.g. profiles, are flagged as 'section: global', a non-existent section - this ignores those
            var hasSection = config.page && config.page.section && config.page.section !== 'global';
            url = url || '/most-read' + (hasSection ? '/' + config.page.section : '');
            new LazyLoad({
                url: url + '.json',
                container: container,
                success: function () {
                    common.mediator.emit('modules:popular:loaded', container);
                },
                error: function(req) {
                    common.mediator.emit('module:error', 'Failed to load most read: ' + req.statusText, 'modules/popular.js');
                }
            }).load();
        }
    }

    return popular;
});
