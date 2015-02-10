define([
    'bonzo',
    'fastdom',
    'qwery',
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/user-prefs'
], function (
    bonzo,
    fastdom,
    qwery,
    _,
    $,
    ajax,
    config,
    mediator,
    userPrefs
) {
    var className = 'fc-show-more--hidden',
        textHook = 'js-button-text',
        prefName = 'section-states',
        buttonSpinnerClass = 'collection__show-more--loading',
        ARTICLE_ID_ATTRIBUTE = 'data-id',
        ITEM_SELECTOR = '.js-fc-item',
        STATE_DISPLAYED = 'displayed',
        STATE_HIDDEN = 'hidden',
        STATE_LOADING = 'loading';

    function setButtonState(button, state) {
        var text = button.text[state];
        button.$textEl.html(text);
        button.$el.attr('data-link-name', state === STATE_DISPLAYED ? 'less' : 'more')
            .toggleClass('button--primary', state !== STATE_DISPLAYED)
            .toggleClass('button--tertiary', state === STATE_DISPLAYED)
            .toggleClass(buttonSpinnerClass, state === STATE_LOADING);
        button.$iconEl.toggleClass('i-plus-white', state !== STATE_DISPLAYED)
            .toggleClass('i-minus-blue', state === STATE_DISPLAYED);
        button.$container.toggleClass(className, state !== STATE_DISPLAYED);
        button.state = state;
    }

    function updatePref(containerId, state) {
        var prefs = userPrefs.get(prefName, {
            type: 'session'
        }) || {};
        if (state !== STATE_DISPLAYED) {
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
        return (prefs && prefs[containerId]) ? STATE_DISPLAYED : STATE_HIDDEN;
    }

    function showMore(button) {
        fastdom.write(function () {
            /**
             * Do not remove: it should retain context for the click stream module, which recurses upwards through
             * DOM nodes.
             */
            setButtonState(button, (button.state === STATE_HIDDEN) ? STATE_DISPLAYED : STATE_HIDDEN);
            updatePref(button.id, button.state);
        });
    }

    function renderToDom(button) {
        fastdom.write(function () {
            button.$container.addClass(className)
                .removeClass('js-container--fc-show-more')
                .toggleClass(className, button.state === STATE_HIDDEN);
            // Initialise state, as it might be different from what was rendered server side based on localstorage prefs
            setButtonState(button, button.state);
        });
    }

    function loadShowMore(pageId, containerId) {
        return ajax({
            url: '/' + pageId + '/show-more/' + containerId + '.json',
            crossOrigin: true
        });
    }

    function dedupShowMore($container, html) {
        var seenArticles = itemsByArticleId($container),
            $html = bonzo.create(html);

        $(ITEM_SELECTOR, $html).each(function (article) {
            var $article = bonzo(article);
            if ($article.attr(ARTICLE_ID_ATTRIBUTE) in seenArticles) {
                $article.remove();
            }
        });

        return $html;
    }

    function loadShowMoreForContainer(button) {
        fastdom.write(function () {
            setButtonState(button, STATE_LOADING);
        });

        loadShowMore(config.page.pageId, button.id).then(function (response) {
            var dedupedShowMore = dedupShowMore(button.$container, response.html);
            fastdom.write(function () {
                button.$placeholder.replaceWith(dedupedShowMore);
                setButtonState(button, STATE_DISPLAYED);
            });
            button.isLoaded = true;
        }).fail(function (error, msg) {
            fastdom.write(function () {
                setButtonState(button, STATE_HIDDEN);
            });

            // TODO flash error message here

            console.log(error);
        });
    }

    function itemsByArticleId($el) {
        return _.groupBy(qwery(ITEM_SELECTOR, $el), function (el) {
            return bonzo(el).attr(ARTICLE_ID_ATTRIBUTE);
        });
    }

    function makeButton($container) {
        var id,
            state,
            button,
            $el = $('.js-show-more-button', $container);

        if ($el) {
            id = $container.attr('data-id');
            //state = readPrefs(id);
            state = STATE_HIDDEN;

            button = {
                $el: $el,
                $container: $container,
                $iconEl: $('.i', $el),
                $placeholder: $('.js-show-more-placeholder', $container),
                $textEl: $('.' + textHook, $el),
                id: id,
                text: {
                    hidden: $('.js-button-text', $el).text(),
                    displayed: 'Less',
                    loading: 'Loading&hellip;'
                },
                state: state,
                isLoaded: false
            };
            return button;
        }
    }

    return function () {
        fastdom.read(function () {
            var containers = qwery('.js-container--fc-show-more').map(bonzo),
                buttons = _.filter(_.map(containers, makeButton));

            _.forEach(buttons, renderToDom);

            mediator.on('module:clickstream:click', function (clickSpec) {
                var clickedButton = _.find(buttons, function (button) {
                    return button.$el[0] === clickSpec.target;
                });
                if (clickedButton && clickedButton.state !== STATE_LOADING) {
                    if (clickedButton.isLoaded) {
                        showMore(clickedButton);
                    } else {
                        loadShowMoreForContainer(clickedButton);
                    }
                }
            });
        });
    };
});
