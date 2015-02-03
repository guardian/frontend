define([
    'bonzo',
    'fastdom',
    'qwery',
    'common/utils/_',
    'common/utils/$',
    'common/utils/mediator',
    'common/modules/user-prefs'
], function (
    bonzo,
    fastdom,
    qwery,
    _,
    $,
    mediator,
    userPrefs
) {
    var className = 'fc-show-more--hidden',
        textHook = 'js-button-text',
        prefName = 'section-states';

    function setButtonState(button, state) {
        var text = button.text[state];
        $('.' + textHook, button.$el).text(text);
        button.$el.attr('data-link-name', state === 'displayed' ? 'less' : 'more')
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
        fastdom.write(function () {
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
        fastdom.write(function () {
            $container.addClass(className)
                .removeClass('js-container--fc-show-more')
                .toggleClass(className, button.state === 'hidden');
            // Initialise state, as it might be different from what was rendered server side based on localstorage prefs
            setButtonState(button, button.state);
        });
    }

    function makeButton($container) {
        var id,
            state,
            button,
            $el = $('.js-show-more-button', $container);

        if ($el) {
            id = $container.attr('data-id');
            state = readPrefs(id);

            button = {
                $el: $el,
                id: id,
                text: {
                    hidden: $('.js-button-text', $el).text(),
                    displayed: 'Less'
                },
                state: state
            };
            return button;
        }
    }

    return function () {
        fastdom.read(function () {
            var containers = qwery('.js-container--fc-show-more').map(bonzo),
                buttons = _.map(containers, makeButton),
                containersWithButtons = _.filter(_.zip(containers, buttons), function (pair) {
                    return pair[1];
                });

            _.forEach(containersWithButtons, function (pair) {
                renderToDom(pair[0], pair[1]);
            });

            mediator.on('module:clickstream:click', function (clickSpec) {
                console.log(clickSpec.el);
                var pair = _.find(containersWithButtons, function (pair) {
                    return pair[1].$el[0] === clickSpec.el;
                });
                if (pair) {
                    showMore(pair[0], pair[1]);
                }
            });
        });
    };
});
