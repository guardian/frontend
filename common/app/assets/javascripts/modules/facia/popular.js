define([
    'common/$',
    'common/utils/mediator',
    'common/utils/ajax',
    'bonzo',
    'common/modules/ui/relativedates',
    'common/modules/facia/collection-show-more',
    'common/modules/ui/images'
], function ($, mediator, ajax, bonzo, relativeDates, CollectionShowMore, images) {

    return  {
        render:  function (config, options) {
            var opts = options || {},
                insertAfter = opts.insertAfter || $('.container').last(),
                hasSection = config.page && config.page.section && config.page.section !== 'global';
            return ajax({
                url: '/most-read' + (hasSection ? '/' + config.page.section : '') + '.json',
                type: 'json',
                crossOrigin: true
            }).then(
                function(resp) {
                    var container = bonzo.create(resp.faciaHtml)[0];
                    bonzo(container)
                        .insertAfter(insertAfter);
                    // add show more button
                    new CollectionShowMore($('.collection', container)[0])
                        .addShowMore();
                    // relativise timestamps
                    relativeDates.init(container);
                    // upgrade image
                    images.upgrade(container);
                },
                function(req) {
                    mediator.emit(
                        'module:error', 'Failed to load facia popular: ' + req.statusText
                    );
                }
            );
        }

    };

});
