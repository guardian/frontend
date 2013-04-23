define(['common', 'modules/lazyload'], function (common, lazyLoad) {

    function popular(config, context, url) {
        var container = context.querySelector('.js-popular');

        if (container) {
            url = url || '/most-read' + (config.page.section ? '/' + config.page.section : '');
            lazyLoad({
                url: url,
                container: container,
                jsonpCallbackName: 'showMostPopular',
                success: function () {
                    common.mediator.emit('modules:popular:loaded', container);
                }
            });
        }
    }

    return popular;
});
