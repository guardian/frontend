define([
    'raven',
    'bonzo',
    'common/utils/$',
    'common/utils/ajax',
    'common/modules/discussion/comment-count',
    'common/modules/ui/images',
    'common/modules/ui/relativedates'
], function (
    raven,
    bonzo,
    $,
    ajax,
    commentCount,
    images,
    relativeDates
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
                }
            );
        }

    };

});
