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
const REQUEST_TIMEOUT = 5000;
const DISPLAY_STATE = Object.freeze({
    displayed: 'displayed',
    loading: 'loading',
    hidden: 'hidden',
});

type DisplayState = $Keys<typeof DISPLAY_STATE>;

const readDisplayPrefForContainer = (containerId: string): DisplayState => {
    const prefs = userPrefs.get(PREF_NAME, {
        type: 'session',
    });
    return prefs && prefs[containerId]
        ? DISPLAY_STATE.displayed
        : DISPLAY_STATE.hidden;
};

const updateDisplayPrefForContainer = (
    containerId: string,
    state: DisplayState
): void => {
    const prefs = userPrefs.get(PREF_NAME, {
        type: 'session',
    }) || {};
    if (state !== DISPLAY_STATE.displayed) {
        delete prefs[containerId];
    } else {
        prefs[containerId] = 'more';
    }
    userPrefs.set(PREF_NAME, prefs, {
        type: 'session',
    });
};

const loadShowMore = (pageId: string, containerId: string): Promise<any> => {
    const url = `/${pageId}/show-more/${containerId}.json`;
    return timeout(
        REQUEST_TIMEOUT,
        fetchJson(url, {
            mode: 'cors',
        })
    );
};

const itemsByArticleId = ($el: bonzo): Object =>
    groupBy(qwery(ITEM_SELECTOR, $el), el =>
        bonzo(el).attr(ARTICLE_ID_ATTRIBUTE)
    );

const dedupShowMore = ($container: bonzo, html: string): bonzo => {
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
    state: DisplayState;
    isLoaded: boolean;
    $el: bonzo;
    $container: bonzo;
    $iconEl: bonzo;
    $placeholder: bonzo;
    $textEl: bonzo;
    $errorMessage: ?bonzo;
    messages: Map<DisplayState, string>;

    constructor(el: bonzo, container: bonzo) {
        this.id = container.attr('data-id');
        this.state = readDisplayPrefForContainer(this.id);
        this.$el = el;
        this.$container = container;
        this.isLoaded = false;
        this.$iconEl = $('.i', this.$el);
        this.$placeholder = $('.js-show-more-placeholder', this.$container);
        this.$textEl = $(`.${TEXT_HOOK}`, this.$el);

        if (this.state === DISPLAY_STATE.displayed) {
            this.loadShowMoreForContainer();
        }

        this.messages = new Map([
            [DISPLAY_STATE.hidden, $('.js-button-text', this.$el).text()],
            [DISPLAY_STATE.displayed, 'Less'],
            [DISPLAY_STATE.loading, 'Loading&hellip;'],
        ]);
    }

    setState(state: DisplayState): void {
        this.$textEl.html(this.messages.get(state));
        this.$el
            .attr(
                'data-link-name',
                state === DISPLAY_STATE.displayed ? 'less' : 'more'
            )
            .toggleClass('button--primary', state !== DISPLAY_STATE.displayed)
            .toggleClass('button--tertiary', state === DISPLAY_STATE.displayed)
            .toggleClass(BUTTON_SPINNER_CLASS, state === DISPLAY_STATE.loading);
        this.$container
            .toggleClass(HIDDEN_CLASS_NAME, state !== DISPLAY_STATE.displayed)
            .toggleClass(VISIBLE_CLASS_NAME, state === DISPLAY_STATE.displayed);
        this.state = state;
    }

    loadShowMoreForContainer(): void {
        fastdom.write(() => {
            this.setState(DISPLAY_STATE.loading);
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
                    this.setState(DISPLAY_STATE.displayed);
                    updateDisplayPrefForContainer(this.id, this.state);
                    mediator.emit('modules:show-more:loaded');
                });
                this.isLoaded = true;
            })
            .catch(err => {
                fastdom.write(() => {
                    this.setState(DISPLAY_STATE.hidden);
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

const showMore = (button: Button): void => {
    fastdom.write(() => {
        /**
         * Do not remove: it should retain context for the click stream module, which recurses upwards through
         * DOM nodes.
         */
        button.setState(
            button.state === DISPLAY_STATE.hidden
                ? DISPLAY_STATE.displayed
                : DISPLAY_STATE.hidden
        );
        updateDisplayPrefForContainer(button.id, button.state);
    });
};

const renderToDom = (button: Button): void => {
    fastdom.write(() => {
        button.$container
            .addClass(HIDDEN_CLASS_NAME)
            .removeClass('js-container--fc-show-more')
            .toggleClass(
                HIDDEN_CLASS_NAME,
                button.state === DISPLAY_STATE.hidden
            );
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
            if (
                clickedButton &&
                clickedButton.state !== DISPLAY_STATE.loading
            ) {
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
