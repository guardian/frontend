define([
    'qwery',
    'common/utils/config',
    'common/utils/proximity-loader',
    'common/modules/onward/onward-content',
    'common/utils/mediator',
    './thumbnails'
], function (
    qwery,
    config,
    proximityLoader,
    Series,
    mediator,
    thumbnails
) {
    return function () {

        var el = qwery('.js-onward')[0];

        if (el) {
            proximityLoader.add(el, 1500, function () {
                if (config.page.seriesId && config.page.showRelatedContent) {
                    new Series(qwery('.js-onward'));
                }
            });
            mediator.once('modules:onward:loaded', function () {
                thumbnails.init();
            });
        }
    };
});
