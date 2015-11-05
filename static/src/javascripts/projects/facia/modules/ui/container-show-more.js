define([
    'bonzo',
    'fastdom',
    'qwery',
    'common/utils/report-error',
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax-promise',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/user-prefs',
    'lodash/collections/groupBy',
    'lodash/collections/filter',
    'lodash/collections/map',
    'lodash/collections/forEach',
    'lodash/collections/find'
], function (
    bonzo,
    fastdom,
    qwery,
    reportError,
    _,
    $,
    ajax,
    config,
    mediator,
    userPrefs,
    groupBy,
    filter,
    map,
    forEach,
    find) {
    var HIDDEN_CLASS_NAME = 'fc-show-more--hidden',
        VISIBLE_CLASS_NAME = 'fc-show-more--visible',
        TEXT_HOOK = 'js-button-text',
        PREF_NAME = 'section-states',
        BUTTON_SPINNER_CLASS = 'collection__show-more--loading',
        ARTICLE_ID_ATTRIBUTE = 'data-id',
        ITEM_SELECTOR = '.js-fc-item',
        STATE_DISPLAYED = 'displayed',
        STATE_HIDDEN = 'hidden',
        STATE_LOADING = 'loading',
        REQUEST_TIMEOUT = 5000;

    function setButtonState(button, state) {
        var text = button.text[state];
        button.$textEl.html(text);
        button.$el.attr('data-link-name', state === STATE_DISPLAYED ? 'less' : 'more')
            .toggleClass('button--primary', state !== STATE_DISPLAYED)
            .toggleClass('button--tertiary', state === STATE_DISPLAYED)
            .toggleClass(BUTTON_SPINNER_CLASS, state === STATE_LOADING);
        button.$container.toggleClass(HIDDEN_CLASS_NAME, state !== STATE_DISPLAYED)
            .toggleClass(VISIBLE_CLASS_NAME, state === STATE_DISPLAYED);
        button.state = state;
    }

    function updatePref(containerId, state) {
        var prefs = userPrefs.get(PREF_NAME, {
            type: 'session'
        }) || {};
        if (state !== STATE_DISPLAYED) {
            delete prefs[containerId];
        } else {
            prefs[containerId] = 'more';
        }
        userPrefs.set(PREF_NAME, prefs, {
            type: 'session'
        });
    }

    function readPrefs(containerId) {
        var prefs = userPrefs.get(PREF_NAME, {
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
            button.$container.addClass(HIDDEN_CLASS_NAME)
                .removeClass('js-container--fc-show-more')
                .toggleClass(HIDDEN_CLASS_NAME, button.state === STATE_HIDDEN);
            // Initialise state, as it might be different from what was rendered server side based on localstorage prefs
            setButtonState(button, button.state);
        });
    }

    function loadShowMore(pageId, containerId) {
        return ajax({
            url: '/' + pageId + '/show-more/' + containerId + '.json',
            crossOrigin: true,
            timeout: REQUEST_TIMEOUT
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
            var dedupedShowMore,
                html = response.html.trim();

            if (html) {
                dedupedShowMore = dedupShowMore(button.$container, html);
            }

            fastdom.write(function () {
                if (dedupedShowMore) {
                    button.$placeholder.replaceWith(dedupedShowMore);
                }
                setButtonState(button, STATE_DISPLAYED);
                updatePref(button.id, button.state);
                mediator.emit('modules:show-more:loaded');
            });
            button.isLoaded = true;
        }).catch(function (err) {
            fastdom.write(function () {
                setButtonState(button, STATE_HIDDEN);
            });

            showErrorMessage(button);
            reportError(new Error('Error retrieving show more (' + err + ')'), false);
        });
    }

    function hideErrorMessage($errorMessage) {
        fastdom.write(function () {
            $errorMessage.addClass('show-more__error-message--invisible');
        });
    }

    function showErrorMessage(button) {
        if (button.$errorMessage) {
            button.$errorMessage.remove();
        }

        button.$errorMessage = bonzo(bonzo.create(
            '<div class="show-more__error-message">' +
                'Sorry, failed to load more stories. Please try again.' +
            '</div>'
        ));

        fastdom.write(function () {
            button.$errorMessage.insertAfter(button.$el);

            setTimeout(function () {
                hideErrorMessage(button.$errorMessage);
            }, 5000);
        });
    }

    function itemsByArticleId($el) {
        return groupBy(qwery(ITEM_SELECTOR, $el), function (el) {
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
            state = readPrefs(id);

            button = {
                $el: $el,
                $container: $container,
                $iconEl: $('.i', $el),
                $placeholder: $('.js-show-more-placeholder', $container),
                $textEl: $('.' + TEXT_HOOK, $el),
                id: id,
                text: {
                    hidden: $('.js-button-text', $el).text(),
                    displayed: 'Less',
                    loading: 'Loading&hellip;'
                },
                state: state,
                isLoaded: false,
                $errorMessage: null
            };

            if (state === STATE_DISPLAYED) {
                loadShowMoreForContainer(button);
            }

            return button;
        }
    }

    return {
        itemsByArticleId: itemsByArticleId,
        dedupShowMore: dedupShowMore,
        init: function () {
            fastdom.read(function () {
                var containers = qwery('.js-container--fc-show-more').map(bonzo),
                    buttons = filter(map(containers, makeButton));

                forEach(buttons, renderToDom);

                mediator.on('module:clickstream:click', function (clickSpec) {
                    var clickedButton = find(buttons, function (button) {
                        return button.$el[0] === clickSpec.target;
                    });
                    if (clickedButton && clickedButton.state !== STATE_LOADING) {
                        if (clickedButton.isLoaded) {
                            showMore(clickedButton);
                        } else {
                            if (clickedButton.$errorMessage) {
                                clickedButton.$errorMessage.hide();
                            }
                            loadShowMoreForContainer(clickedButton);
                        }
                    }
                });
            });
        }
    };
});
