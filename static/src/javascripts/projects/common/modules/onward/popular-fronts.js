define([
    'bonzo',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/modules/discussion/comment-count',
    'common/modules/ui/images',
    'common/modules/ui/relativedates'
], function (
    bonzo,
    $,
    ajax,
    config,
    commentCount,
    images,
    relativeDates
) {

    return {
        render:  function (options) {
            var opts = options || {},
                hasSection = config.page && config.page.section && config.page.section !== 'global';
            return ajax({
                url: '/most-read' + (hasSection ? '/' + config.page.section : '') + '.json',
                type: 'json',
                crossOrigin: true
            }).then(
                function (resp) {
                    if (resp.faciaHtml) {
                        var container = bonzo.create(resp.faciaHtml.replace(/^\s+|\s+$/g, ''))[0];

                        if (container) {
                            bonzo(container)
                                .insertAfter(opts.insertAfter || $('.container, .ad-slot--commercial-component-high').last());

                            commentCount.init(container);
                            // relativise timestamps
                            relativeDates.init(container);
                            // upgrade image
                            images.upgrade(container);
                        }
                    }

                    opts.then && opts.then();
                }
            );
        }

    };

});
