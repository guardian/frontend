// @flow

import config from "lib/config";
import {getMvtNumValues, getMvtValue} from "common/modules/analytics/mvt-cookie";
import {submitClickEvent, submitViewEvent} from "common/modules/commercial/acquisitions-ophan";
import { ARTICLES_VIEWED_OPT_OUT_COOKIE } from "common/modules/commercial/user-features";
import {addCookie} from "lib/cookies";
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

const getElements = (element: HTMLElement): ?ArticlesViewedOptOutElements => {
    const checkbox = element.querySelector('#epic-article-count__dialog-checkbox');

    const labelElement = element.querySelector('.epic-article-count__prompt-label');
    const optOutButton = element.querySelector('.epic-article-count__button-opt-out');
    const optInButton = element.querySelector('.epic-article-count__button-opt-in');

    const closeButton = element.querySelector('.epic-article-count__dialog-close');
    const buttons = element.querySelector('.epic-article-count__buttons');
    const header = element.querySelector('.epic-article-count__dialog-header');
    const body = element.querySelector('.epic-article-count__dialog-body');
    const note = element.querySelector('.epic-article-count__dialog-note');

    if (
        element &&
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
            element,
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

        addCookie(ARTICLES_VIEWED_OPT_OUT_COOKIE.name, new Date().getTime().toString(), ARTICLES_VIEWED_OPT_OUT_COOKIE.daysToLive);

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

const setupArticlesViewedOptOut = () => {
    if (optOutEnabled()) {
        // If this element exists then they're in the variant
        const element = document.querySelector('.epic-article-count');
        const viewEventId = `articles-viewed-opt-out_view-${element ? 'variant' : 'control'}`;

        submitViewEvent({
            component: {
                componentType: 'ACQUISITIONS_OTHER',
                id: viewEventId,
            },
        });

        if (element) {
            const elements: ?ArticlesViewedOptOutElements = getElements(element);

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
}
