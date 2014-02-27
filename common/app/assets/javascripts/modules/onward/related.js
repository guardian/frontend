define([
    'common/common',
    'common/modules/lazyload',
    'common/modules/ui/expandable',
    'common/modules/ui/images',
    'common/modules/onward/history',
    'qwery',
    'bonzo',
    'common/$'
], function (
    common,
    LazyLoad,
    Expandable,
    images,
    History,
    qwery,
    bonzo,
    $
) {

    function related(config, context, url, popularInTag) {
        var container;


        function removeSeenTrails(container) {
            // removes seen trails if there are enough unseen trails
            var history = new History({});
            var allTrails = qwery('li.item', container);
            // remove current page
            allTrails.some(function(trail, i) {
                if ($('.item__link', trail).attr('href').slice(1) === config.page.pageId) {
                    bonzo(trail).remove();
                    allTrails.splice(i,1);
                    return true;
                }
                return false;
            });

            var seenTrails = allTrails.filter(function(trail) {
                var url = $('.item__link',trail).attr('href');
                return history.contains(url);
            });
            if (allTrails.length - seenTrails.length >= 4) {
                seenTrails.forEach(function(trail) {
                    bonzo(trail).remove();
                });
            }
        }

        if (config.page && config.page.hasStoryPackage && !popularInTag) {

            new Expandable({
                dom: context.querySelector('.related-trails'),
                expanded: false,
                showCount: false
            }).init();
            common.mediator.emit('modules:related:loaded', config, context);

        } else if (config.switches && config.switches.relatedContent) {

            container = context.querySelector('.js-related');
            if (container) {
                new LazyLoad({
                    url: url || '/related/' + config.page.pageId + '.json',
                    container: container,
                    success: function () {
                        if (popularInTag) {
                            removeSeenTrails(container);
                            if (config.page.hasStoryPackage) {
                                $('.more-on-this-story').addClass('u-h');
                            }
                        }

                        var relatedTrails = container.querySelector('.related-trails');
                        new Expandable({dom: relatedTrails, expanded: false, showCount: false}).init();
                        // upgrade images
                        images.upgrade(relatedTrails);
                        common.mediator.emit('modules:related:loaded', config, context);
                    },
                    error: function(req) {
                        common.mediator.emit('module:error', 'Failed to load related: ' + req.statusText, 'common/modules/related.js');
                    }
                }).load();
            }
        }

    }

    return related;
});
