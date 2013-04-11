define(['common', 'modules/lazyload'], function (common, lazyLoad) {

    function popular(config, context) {
        var container = context.querySelector('.js-popular');

        lazyLoad({
            url: '/most-read' + (config.page.section ? '/' + config.page.section : '') + '.json',
            container: container,
            success: function () {
                common.mediator.emit('modules:popular:loaded', container);
            }
        });
    }

    return popular;
});
