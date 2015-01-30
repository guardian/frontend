define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/_',
    'common/utils/$',
    'common/utils/request-animation-frame',
    'common/utils/template',
    'common/modules/user-prefs',
    'text!facia/views/button-show-more.html'
], function (
    bean,
    bonzo,
    qwery,
    _,
    $,
    requestAnimationFrame,
    template,
    userPrefs,
    showMoreBtn
) {
    var className = 'fc-show-more--hidden',
        textHook = 'js-button-text',
        prefName = 'section-states';

    function getButtonTextByState($container) {
        var containerTitle = $container.data('title') || '';

        return {
            'hidden': 'More ' + containerTitle,
            'displayed': 'Less'
        };
    }

    function setButtonState(button, state) {
        var text = button.text[state];
        $('.' + textHook, button.$el).text(text);
        button.$el.attr('data-link-name', text)
            .toggleClass('button--primary', state !== 'displayed')
            .toggleClass('button--tertiary', state === 'displayed');
        $('.i', button.$el).toggleClass('i-plus-white', state !== 'displayed')
            .toggleClass('i-minus-blue', state === 'displayed');
    }

    function updatePref(containerId, state) {
        var prefs = userPrefs.get(prefName, {
            type: 'session'
        }) || {};
        if (state !== 'displayed') {
            delete prefs[containerId];
        } else {
            prefs[containerId] = 'more';
        }
        userPrefs.set(prefName, prefs, {
            type: 'session'
        });
    }

    function readPrefs(containerId) {
        var prefs = userPrefs.get(prefName, {
            type: 'session'
        });
        return (prefs && prefs[containerId]) ? 'displayed' : 'hidden';
    }

    function showMore($container, button) {
        requestAnimationFrame(function () {
            /**
             * Do not remove: it should retain context for the click stream module, which recurses upwards through
             * DOM nodes.
             */
            $container.toggleClass(className, button.state === 'displayed');
            button.state = (button.state === 'hidden') ? 'displayed' : 'hidden';
            setButtonState(button, button.state);
            updatePref(button.id, button.state);
        });
    }

    function renderToDom($container, button) {
        requestAnimationFrame(function () {
            if (button.mobileOnly) {
                $container.addClass('fc-show-more--mobile-only');
            }

            $container.addClass(className)
                .append(button.$el)
                .removeClass('js-container--fc-show-more');
        });
    }

    function makeButton($container) {
        var id = $container.attr('data-id'),
            buttonText = getButtonTextByState($container),
            itemsHiddenOnDesktop = qwery('.js-hide', $container).length > 0,
            itemsHiddenOnMobile  = qwery('.js-hide-on-mobile', $container).length > 0,
            $button = $.create(template(showMoreBtn, {
            type: buttonText[state],
            dataLink: buttonText.displayed
        })), state = readPrefs(id);

        if (itemsHiddenOnDesktop || itemsHiddenOnMobile) {
            var button = {
                $el: $button,
                id: id,
                text: buttonText,
                mobileOnly: !itemsHiddenOnDesktop,
                state: state
            };
            setButtonState(button, state);
            return button;
        }
    }

    return function () {
        var containers = qwery('.js-container--fc-show-more').map(bonzo),
            buttons = _.map(containers, makeButton),
            containersWithButtons = _.filter(_.zip(containers, buttons), function (pair) {
                return pair[1];
            });

        _.forEach(containersWithButtons, function (pair) {
            renderToDom(pair[0], pair[1]);
        });

        bean.on(document.body, 'click', '.button--show-more', function (event) {
            console.log("HI");
            var pair = _.find(containersWithButtons, function (pair) {
                return pair[1].$el[0] === event.currentTarget;
            });
            if (pair)
                showMore(pair[0], pair[1]);
        });
    };
});
