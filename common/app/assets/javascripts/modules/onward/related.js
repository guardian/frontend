define([
    'common/common',
    'common/modules/lazyload',
    'common/modules/ui/expandable',
    'common/modules/ui/images',
    'common/modules/onward/history',
    'qwery',
    'bonzo',
    'common/$',
    'common/modules/analytics/register'
], function (
    common,
    LazyLoad,
    Expandable,
    images,
    History,
    qwery,
    bonzo,
    $,
    register
) {

    function Related() {
    }

    Related.overrideUrl = '';

    Related.setOverrideUrl = function(url) {
        Related.overrideUrl = url;
    };

    Related.prototype.renderRelatedComponent = function(config, context) {

        var container;

        if (config.page && config.page.hasStoryPackage && !Related.overrideUrl) {

            new Expandable({
                dom: context.querySelector('.related-trails'),
                expanded: false,
                showCount: false
            }).init();
            common.mediator.emit('modules:related:loaded', config, context);

        } else if (config.switches && config.switches.relatedContent) {
            register.begin('related-content');

            container = context.querySelector('.js-related');
            if (container) {
                new LazyLoad({
                    url: Related.overrideUrl || '/related/' + config.page.pageId + '.json',
                    container: container,
                    success: function () {
                        if (Related.overrideUrl) {
                            if (config.page.hasStoryPackage) {
                                $('.more-on-this-story').addClass('u-h');
                            }
                        }

                        var relatedTrails = container.querySelector('.related-trails');
                        new Expandable({dom: relatedTrails, expanded: false, showCount: false}).init();
                        // upgrade images
                        images.upgrade(relatedTrails);
                        common.mediator.emit('modules:related:loaded', config, context);
                        register.end('related-content');
                    },
                    error: function(req) {
                        common.mediator.emit('module:error', 'Failed to load related: ' + req.statusText, 'common/modules/related.js');
                        register.error('related-content');
                    }
                }).load();
            }
        }
    };

    return Related;
});
