define([
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/ajax',
    'bonzo',
    'common/modules/ui/relativedates',
    'common/modules/ui/images',
    'common/modules/discussion/comment-count'
], function (
    $,
    mediator,
    ajax,
    bonzo,
    relativeDates,
    images,
    commentCount
) {

    return  {
        render:  function (config, options) {
            var opts = options || {},
                hasSection = config.page && config.page.section && config.page.section !== 'global';
            return ajax({
                url: '/most-read' + (hasSection ? '/' + config.page.section : '') + '.json',
                type: 'json',
                crossOrigin: true
            }).then(
                function(resp) {
                    var container = bonzo.create(resp.faciaHtml.replace(/^\s+|\s+$/g, ''))[0];
                    if (!container) {
                        return false;
                    }
                    bonzo(container)
                        .insertAfter(opts.insertAfter || $('.container, .ad-slot--commercial-component-high').last());

                    commentCount.init(container);
                    // relativise timestamps
                    relativeDates.init(container);
                    // upgrade image
                    images.upgrade(container);
                },
                function(req) {
                    throw new Error('Failed to load facia popular: ' + req.statusText);
                }
            );
        }

    };

});
