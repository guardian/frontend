// @flow

import config from "lib/config";
import {getMvtNumValues, getMvtValue} from "common/modules/analytics/mvt-cookie";
import {submitClickEvent, submitViewEvent} from "common/modules/commercial/acquisitions-ophan";
import { ARTICLES_VIEWED_OPT_OUT_COOKIE } from "common/modules/commercial/user-features";
import { storageKeyWeeklyArticleCount, storageKeyDailyArticleCount } from "common/modules/onward/history";
import {addCookie} from "lib/cookies";
import { local } from 'lib/storage';
import reportError from "lib/report-error";

const optOutEnabled = () => config.get('switches.showArticlesViewedOptOut');
// Show the opt-out to 50% of the audience. We do not use `mvt % 2` here because then it would align
// with the variants of the underlying A/B tests and distort the results
const userIsInArticlesViewedOptOutTest = () => Number(getMvtValue()) < getMvtNumValues() / 2;

type ArticlesViewedOptOutElements = {
    checkbox: HTMLInputElement,
    labelElement: HTMLElement,
    optOutButton: HTMLElement,
    optInButton: HTMLElement,
    closeButton: HTMLElement,
    buttons: HTMLElement,
    header: HTMLElement,
    body: HTMLElement,
    note: HTMLElement,
}

const getElements = (container: HTMLElement): ?ArticlesViewedOptOutElements => {
    const checkbox = container.querySelector('#epic-article-count__dialog-checkbox');

    const labelElement = container.querySelector('.epic-article-count__prompt-label');
    const optOutButton = container.querySelector('.epic-article-count__button-opt-out');
    const optInButton = container.querySelector('.epic-article-count__button-opt-in');

    const closeButton = container.querySelector('.epic-article-count__dialog-close');
    const buttons = container.querySelector('.epic-article-count__buttons');
    const header = container.querySelector('.epic-article-count__dialog-header');
    const body = container.querySelector('.epic-article-count__dialog-body');
    const note = container.querySelector('.epic-article-count__dialog-note');

    if (
        checkbox instanceof HTMLInputElement &&
        labelElement &&
        optOutButton &&
        optInButton &&
        closeButton &&
        buttons &&
        header &&
        body &&
        note
    ) {
        return {
            checkbox,
            labelElement,
            optOutButton,
            optInButton,
            closeButton,
            buttons,
            header,
            body,
            note
        }
    }
};

const setupHandlers = (elements: ArticlesViewedOptOutElements) => {

    const hideDialog = () => {
        // This is the hidden checkbox that we use to hide/unhide the dialog using css only
        elements.checkbox.checked = false;
    };

    const onArticlesViewedClick = () => {
        // Only need to send the tracking event here, as the dialog is displayed using only css
        submitClickEvent({
            component: {
                componentType: 'ACQUISITIONS_OTHER',
                id: 'articles-viewed-opt-out_open',
            },
        });
    };

    const onOptOutClick = () => {
        submitClickEvent({
            component: {
                componentType: 'ACQUISITIONS_OTHER',
                id: 'articles-viewed-opt-out_out',
            },
        });

        // Stop counting and clear the user's history
        addCookie(ARTICLES_VIEWED_OPT_OUT_COOKIE.name, new Date().getTime().toString(), ARTICLES_VIEWED_OPT_OUT_COOKIE.daysToLive);
        local.remove(storageKeyWeeklyArticleCount);
        local.remove(storageKeyDailyArticleCount);

        // Update the dialog message
        elements.closeButton.classList.remove('is-hidden');
        elements.closeButton.addEventListener('click', () => {
            hideDialog();
        });

        elements.buttons.remove();
        elements.header.innerHTML = `You've opted out`;
        elements.body.innerHTML = `Starting from your next page view, we won't count the articles you read or show you this message for three months.`;
        elements.note.innerHTML = `If you have any questions, please <a target="_blank" href="https://www.theguardian.com/help/contact-us">contact us</a>.`;
    };

    const onOptInClick = () => {
        submitClickEvent({
            component: {
                componentType: 'ACQUISITIONS_OTHER',
                id: 'articles-viewed-opt-out_in',
            },
        });

        hideDialog();
    };

    elements.labelElement.addEventListener('click', () => {
        onArticlesViewedClick();
    });

    elements.optOutButton.addEventListener('click', (event: Event) => {
        event.preventDefault();
        onOptOutClick();
    });

    elements.optInButton.addEventListener('click', (event: Event) => {
        event.preventDefault();
        onOptInClick();
    });
};

const onEpicViewed = () => {
    if (optOutEnabled()) {
        // Send the view event if this is an epic with an articles-viewed count.
        // Send for both the control and the variant, so that we can measure impact on conversions.
        const getArticleCountViewEventId = (): ?string => {
            if (document.querySelector('.epic-article-count')) {
                return 'articles-viewed-opt-out_view-variant';
            } else if (document.querySelector('.epic-article-count__normal')) {
                return 'articles-viewed-opt-out_view-control';
            } 
                return null;    // no articles-viewed count
            
        };

        const viewEventId = getArticleCountViewEventId();
        if (viewEventId) {
            submitViewEvent({
                component: {
                    componentType: 'ACQUISITIONS_OTHER',
                    id: viewEventId,
                },
            });
        }
    }
};

const setupArticlesViewedOptOut = () => {
    if (optOutEnabled()) {
        // If this element exists then they're in the variant
        const articleCountElement = document.querySelector('.epic-article-count');

        if (articleCountElement) {
            const elements: ?ArticlesViewedOptOutElements = getElements(articleCountElement);

            if (elements) {
                setupHandlers(elements);
            } else {
                reportError(
                    new Error(
                        `Error setting up articles viewed opt-out in epic: unable to find all elements.`
                    ),
                    {
                        feature: 'epic',
                    },
                    false
                );
            }
        }
    }
};

export {
    optOutEnabled,
    userIsInArticlesViewedOptOutTest,
    setupArticlesViewedOptOut,
    onEpicViewed,
}
