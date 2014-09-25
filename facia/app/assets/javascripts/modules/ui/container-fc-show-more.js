define([
    'common/utils/$',
    'bonzo',
    'bean',
    'qwery'
], function (
    $,
    bonzo,
    bean,
    qwery
) {
    return function (container) {
        var $container = bonzo(container),
            className = 'fc-show-more--hidden',
            itemsHiddenOnDesktop = qwery('.js-hide', $container).length > 0,
            itemsHiddenOnMobile = qwery('.js-hide-on-mobile', $container).length > 0,
            $button = $.create(
            '<button class="collection__show-more tone-background tone-news" data-test-id="show-more" data-link-name="Show more | 1">' +
            '<span class="collection__show-more__icon">' +
            '<span class="i i-plus-white-mask"></span>' +
            '<span class="i i-plus-white"></span>' +
            '</span>' +
            '<span class="u-h">Show more</span>' +
            '</button>'
        );

        function showMore() {
            /**
             * Do not remove: it should retain context for the click stream module, which recurses upwards through
             * DOM nodes.
             */
            $button.hide();
            $container.removeClass(className);
        }

        if (itemsHiddenOnMobile || itemsHiddenOnDesktop) {
            if (!itemsHiddenOnDesktop) {
                $container.addClass('fc-show-more--mobile-only');
            }

            $container.addClass(className)
                .append($button)
                .removeClass('js-container--fc-show-more');
            bean.on($button[0], 'click', showMore);
        }
    };
});
