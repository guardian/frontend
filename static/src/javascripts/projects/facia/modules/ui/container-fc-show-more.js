define([
    'bonzo',
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'text!facia/views/button-show-more.html'
], function (
    bonzo,
    bean,
    qwery,
    $,
    template,
    showMoreBtn
) {
    return function (container) {
        var $container           = bonzo(container),
            self                 = this,
            itemsHiddenOnDesktop = $container.hasClass("js-hide"),
            itemsHiddenOnMobile  = $container.hasClass('js-hide-on-mobile'),
            className            = 'fc-show-more--hidden',
            $button              = null;

        this.addShowMoreButton = function() {
            $button = $.create(template(showMoreBtn, {
                type: self.getContainerType()
            }));

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

        this.getContainerType = function() {
            return $container.parent().parent().data("id").replace("-", " ");
        };

        function showMore() {
            /**
             * Do not remove: it should retain context for the click stream module, which recurses upwards through
             * DOM nodes.
             */
            $button.hide();
            $container.removeClass(className);
        }
    };
});
