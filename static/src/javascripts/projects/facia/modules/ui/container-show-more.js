define([
    'bean',
    'bonzo',
    'qwery',
    'common/modules/userPrefs',
    'common/utils/$',
    'common/utils/template',
    'text!facia/views/button-show-more.html'
], function (
    bean,
    bonzo,
    qwery,
    userPrefs,
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
            prefName             = 'section-states',
            buttonText           = {},
            self                 = this;

        this.addShowMoreButton = function () {
            var tmpTitle = this.getContainerTitle();

            buttonText = {
                'hidden': 'More ' + tmpTitle,
                'displayed': 'Less'
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

            this.readPrefs($container);
        };

        this.getContainerTitle = function () {
            return $container.data('title') || '';
        };

        this.changeButtonText = function () {
            $('.' + textHook, $button).text(buttonText[state]);
        };

        this.changeButtonState = function () {
            $button.attr('data-link-name', buttonText[state])
                .toggleClass('button--primary', state !== 'displayed')
                .toggleClass('button--tertiary', state === 'displayed');
            $('.i', $button).toggleClass('i-plus-white', state !== 'displayed')
                .toggleClass('i-minus-blue', state === 'displayed');
        };

        this.updatePref = function ($container, state) {
            // update user prefs
            var prefs = userPrefs.get(prefName, 'session'),
                prefValue = $container.attr('data-id');
            if (state !== 'displayed') {
                delete prefs[prefValue];
            } else {
                if (!prefs) {
                    prefs = {};
                }
                prefs[prefValue] = 'more';
            }
            userPrefs.set(prefName, prefs, 'session');
        };

        this.readPrefs = function ($container) {
            // update user prefs
            var prefs = userPrefs.get(prefName, 'session');
            if (prefs && prefs[$container.attr('data-id')]) {
                bean.fire($button[0], 'click');
            }
        };

        function showMore() {
            /**
             * Do not remove: it should retain context for the click stream module, which recurses upwards through
             * DOM nodes.
             */
            $container.toggleClass(className, state === 'displayed');
            state = (state === 'hidden') ? 'displayed' : 'hidden';
            self.changeButtonText();
            self.changeButtonState();

            self.updatePref($container, state);
        }
    };
});
