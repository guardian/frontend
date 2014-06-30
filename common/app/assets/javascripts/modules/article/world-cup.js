define([
    'common/utils/$',
    'qwery',
    'common/modules/lazyload',
    'common/utils/mediator'
], function(
    $,
    qwery,
    LazyLoad,
    mediator
) {
    function worldCupContainer() {
        // The id for the 'you may have missed' container under the world-cup-2014 collection.
        var url = '/container/1be1-17a5-c04b-b002.json';
        new LazyLoad({
            url: url,
            container: qwery('.js-world-cup')[0],
            error: function(req) {
                mediator.emit('module:error', 'Failed to load world cup container: ' + req.statusText,
                              'common/modules/article/world-cup.js');
            },
            success: function() {
                mediator.emit('ui:images:upgrade');
                $('.js-world-cup .js-container--show-more').addClass('u-h');
            }
        }).load();
    }

    return worldCupContainer;

}); // define
