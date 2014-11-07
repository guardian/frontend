define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'text!facia/views/button-show-more.html'
], function (
    bean,
    bonzo,
    qwery,
    $,
    template,
    showMoreBtn
) {
    return function (container) {
        var $container           = bonzo(container),
            itemsHiddenOnDesktop = qwery('.js-hide', $container).length > 0,
            itemsHiddenOnMobile  = qwery('.js-hide-on-mobile', $container).length > 0,
            className            = 'fc-show-more--hidden',
            textHook             = 'js-button-text',
            $button              = null,
            state                = 'hidden',
            buttonText           = {},
            self                 = this;

        this.addShowMoreButton = function () {
            var tmpTitle = this.getContainerTitle();

            buttonText = {
                'hidden'   : 'More ' + tmpTitle,
                'displayed': 'Less ' + tmpTitle
            };

            $button = $.create(template(showMoreBtn, {
                type: buttonText[state]
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

        this.getContainerTitle = function () {
            return $container.data('title') || '';
        };

        this.changeButtonText = function() {
            $('.' + textHook, $button).text(buttonText[state]);
        };

        function showMore() {
            /**
             * Do not remove: it should retain context for the click stream module, which recurses upwards through
             * DOM nodes.
             */
            $container.toggleClass(className, state === 'displayed');
            state = (state === 'hidden') ? 'displayed' : 'hidden';
            self.changeButtonText();
        }
    };
});
