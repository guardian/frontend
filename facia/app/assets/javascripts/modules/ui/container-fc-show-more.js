define([
    'common/utils/$',
    'bonzo',
    'bean',
    'qwery',
    'common/utils/mediator'
], function (
    $,
    bonzo,
    bean,
    qwery,
    mediator
    ) {
    return function(container) {
        var $container = bonzo(container),
            className ='fc-show-more--hidden',
            $button = bonzo(
                '<button class="collection__show-more tone-background tone-news" data-link-name="Show more | 1">' +
                '<span class="collection__show-more__icon">' +
                '<span class="i i-plus-white-mask"></span>' +
                '<span class="i i-plus-white"></span>' +
                '</span>' +
                '<span class="u-h">Show more</span>' +
                '</button>'
        );

        function removeButton() {
            // listen to the clickstream, as happens later, before removing
            mediator.on('module:clickstream:click', function(clickSpec) {
                if (qwery(clickSpec.target)[0] === $button[0]) {
                    $button.remove();
                }
            });
        }

        function showMore() {
            removeButton();
            $container.removeClass(className);
        }

        $container.addClass(className);
        $button.appendTo($container);
        bean.on($button[0], 'click', showMore);
        $container.removeClass('js-container--fc-show-more');
    };
});
