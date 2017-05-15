// @flow
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import qwery from 'qwery';
import $ from 'lib/$';
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import mediator from 'lib/mediator';
import reportError from 'lib/report-error';
import timeout from 'lib/timeout';
import userPrefs from 'common/modules/user-prefs';
import groupBy from 'lodash/collections/groupBy';

const HIDDEN_CLASS_NAME = 'fc-show-more--hidden';
const VISIBLE_CLASS_NAME = 'fc-show-more--visible';
const TEXT_HOOK = 'js-button-text';
const PREF_NAME = 'section-states';
const BUTTON_SPINNER_CLASS = 'collection__show-more--loading';
const ARTICLE_ID_ATTRIBUTE = 'data-id';
const ITEM_SELECTOR = '.js-fc-item';
const STATE_DISPLAYED = 'displayed';
const STATE_HIDDEN = 'hidden';
const STATE_LOADING = 'loading';
const REQUEST_TIMEOUT = 5000;

type ButtonState =
    | typeof STATE_DISPLAYED
    | typeof STATE_HIDDEN
    | typeof STATE_LOADING;

const readPrefs = containerId => {
    const prefs = userPrefs.get(PREF_NAME, {
        type: 'session',
    });
    return prefs && prefs[containerId] ? STATE_DISPLAYED : STATE_HIDDEN;
};

const updatePref = (containerId, state: ButtonState) => {
    const prefs = userPrefs.get(PREF_NAME, {
        type: 'session',
    }) || {};
    if (state !== STATE_DISPLAYED) {
        delete prefs[containerId];
    } else {
        prefs[containerId] = 'more';
    }
    userPrefs.set(PREF_NAME, prefs, {
        type: 'session',
    });
};

const loadShowMore = (pageId, containerId) => {
    const url = `/${pageId}/show-more/${containerId}.json`;
    return timeout(
        REQUEST_TIMEOUT,
        fetchJson(url, {
            mode: 'cors',
        })
    );
};

const itemsByArticleId = ($el: bonzo) =>
    groupBy(qwery(ITEM_SELECTOR, $el), el =>
        bonzo(el).attr(ARTICLE_ID_ATTRIBUTE)
    );

const dedupShowMore = ($container: bonzo, html: string) => {
    const seenArticles = itemsByArticleId($container);
    const $html = bonzo.create(html);

    $(ITEM_SELECTOR, $html).each(article => {
        const $article = bonzo(article);
        if ($article.attr(ARTICLE_ID_ATTRIBUTE) in seenArticles) {
            $article.remove();
        }
    });

    return $html;
};

class Button {
    id: string;
    state: ButtonState;
    isLoaded: boolean;
    $el: bonzo;
    $container: bonzo;
    $iconEl: bonzo;
    $placeholder: bonzo;
    $textEl: bonzo;
    $errorMessage: ?bonzo;
    messages: Map<ButtonState, string>;

    constructor(el: bonzo, container: bonzo) {
        this.id = container.attr('data-id');
        this.state = readPrefs(this.id);
        this.$el = el;
        this.$container = container;
        this.isLoaded = false;
        this.$iconEl = $('.i', this.$el);
        this.$placeholder = $('.js-show-more-placeholder', this.$container);
        this.$textEl = $(`.${TEXT_HOOK}`, this.$el);

        if (this.state === STATE_DISPLAYED) {
            this.loadShowMoreForContainer();
        }

        this.messages = new Map([
            [STATE_HIDDEN, $('.js-button-text', this.$el).text()],
            [STATE_DISPLAYED, 'Less'],
            [STATE_LOADING, 'Loading&hellip;'],
        ]);
    }

    setState(state: ButtonState): void {
        this.$textEl.html(this.messages.get(state));
        this.$el
            .attr('data-link-name', state === STATE_DISPLAYED ? 'less' : 'more')
            .toggleClass('button--primary', state !== STATE_DISPLAYED)
            .toggleClass('button--tertiary', state === STATE_DISPLAYED)
            .toggleClass(BUTTON_SPINNER_CLASS, state === STATE_LOADING);
        this.$container
            .toggleClass(HIDDEN_CLASS_NAME, state !== STATE_DISPLAYED)
            .toggleClass(VISIBLE_CLASS_NAME, state === STATE_DISPLAYED);
        this.state = state;
    }

    loadShowMoreForContainer() {
        fastdom.write(() => {
            this.setState(STATE_LOADING);
        });

        loadShowMore(config.page.pageId, this.id)
            .then(response => {
                let dedupedShowMore;
                const html = response.html.trim();

                if (html) {
                    dedupedShowMore = dedupShowMore(this.$container, html);
                }

                fastdom.write(() => {
                    if (dedupedShowMore) {
                        this.$placeholder.replaceWith(dedupedShowMore);
                    }
                    this.setState(STATE_DISPLAYED);
                    updatePref(this.id, this.state);
                    mediator.emit('modules:show-more:loaded');
                });
                this.isLoaded = true;
            })
            .catch(err => {
                fastdom.write(() => {
                    this.setState(STATE_HIDDEN);
                });

                this.showErrorMessage();
                reportError(
                    err,
                    {
                        feature: 'container-show-more',
                    },
                    false
                );
            });
    }

    hideErrorMessage(): void {
        fastdom.write(() => {
            if (this.$errorMessage != null) {
                this.$errorMessage.addClass(
                    'show-more__error-message--invisible'
                );
            }
        });
    }

    showErrorMessage(): void {
        if (this.$errorMessage) {
            this.$errorMessage.remove();
        }

        this.$errorMessage = bonzo(
            bonzo.create(
                '<div class="show-more__error-message">' +
                    'Sorry, failed to load more stories. Please try again.' +
                    '</div>'
            )
        );

        fastdom.write(() => {
            if (this.$errorMessage != null) {
                this.$errorMessage.insertAfter(this.$el);

                setTimeout(() => {
                    this.hideErrorMessage();
                }, 5000);
            }
        });
    }
}

const showMore = (button: Button) => {
    fastdom.write(() => {
        /**
         * Do not remove: it should retain context for the click stream module, which recurses upwards through
         * DOM nodes.
         */
        button.setState(
            button.state === STATE_HIDDEN ? STATE_DISPLAYED : STATE_HIDDEN
        );
        updatePref(button.id, button.state);
    });
};

const renderToDom = (button: Button) => {
    fastdom.write(() => {
        button.$container
            .addClass(HIDDEN_CLASS_NAME)
            .removeClass('js-container--fc-show-more')
            .toggleClass(HIDDEN_CLASS_NAME, button.state === STATE_HIDDEN);
        // Initialise state, as it might be different from what was rendered server side based on localstorage prefs
        button.setState(button.state);
    });
};

export const init = (): void => {
    fastdom.read(() => {
        const containers = qwery('.js-container--fc-show-more').map(bonzo);
        const buttons = containers
            .map(container => {
                const el = $('.js-show-more-button', container);
                return el ? new Button(el, container) : null;
            })
            .filter(button => button != null);

        buttons.forEach(renderToDom);

        mediator.on('module:clickstream:click', clickSpec => {
            const clickedButton = buttons.find(
                button => button.$el[0] === clickSpec.target
            );
            if (clickedButton && clickedButton.state !== STATE_LOADING) {
                if (clickedButton.isLoaded) {
                    showMore(clickedButton);
                } else {
                    if (clickedButton.$errorMessage) {
                        clickedButton.$errorMessage.hide();
                    }
                    clickedButton.loadShowMoreForContainer();
                }
            }
        });
    });
};

export const _ = { itemsByArticleId, dedupShowMore };
