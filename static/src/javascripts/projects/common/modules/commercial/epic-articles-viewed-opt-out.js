// @flow

import config from "lib/config";
import {getMvtValue} from "common/modules/analytics/mvt-cookie";
import {submitClickEvent, submitViewEvent} from "common/modules/commercial/acquisitions-ophan";
import {addCookie} from "lib/cookies";

const OPT_OUT_COOKIE_NAME = 'gu_article_count_opt_out';
const COOKIE_DAYS_TO_LIVE = 90;

const optOutEnabled = () => config.get('switches.showArticlesViewedOptOut');
// Show the opt-out to 50% of the audience
const userIsInArticlesViewedOptOutTest = () => Number(getMvtValue()) % 2;

const hideDialog = () => {
    const checkbox = document.querySelector('#epic-article-count__dialog-checkbox');
    if (checkbox instanceof HTMLInputElement) {
        checkbox.checked = false;
    }
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

    addCookie(OPT_OUT_COOKIE_NAME, new Date().getTime().toString(), COOKIE_DAYS_TO_LIVE);

    // Update the dialog message
    const closeButton = document.querySelector('.epic-article-count__dialog-close');
    const buttons = document.querySelector('.epic-article-count__buttons');
    const header = document.querySelector('.epic-article-count__dialog-header');
    const body = document.querySelector('.epic-article-count__dialog-body');
    const note = document.querySelector('.epic-article-count__dialog-note');

    if (closeButton && buttons && header && body && note) {
        closeButton.classList.remove('is-hidden');
        closeButton.addEventListener('click', () => {
            hideDialog();
        });

        buttons.remove();
        header.innerHTML = `You've opted out`;
        body.innerHTML = `Starting from your next page view, we won't count the articles you read or show you this message for three months.`;
        note.innerHTML = `If you have any questions, please <a target="_blank" href="https://www.theguardian.com/help/contact-us">contact us</a>.`;
    }
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
            const labelElement = element.querySelector('.epic-article-count__prompt-label');
            const optOutButton = element.querySelector('.epic-article-count__button-opt-out');
            const optInButton = element.querySelector('.epic-article-count__button-opt-in');
            

            if (labelElement && optOutButton && optInButton) {
                labelElement.addEventListener('click', () => {
                    onArticlesViewedClick();
                });

                optOutButton.addEventListener('click', (event: Event) => {
                    event.preventDefault();
                    onOptOutClick();
                });

                optInButton.addEventListener('click', (event: Event) => {
                    event.preventDefault();
                    onOptInClick();
                });
            }
        }
    }
};

export {
    optOutEnabled,
    userIsInArticlesViewedOptOutTest,
    setupArticlesViewedOptOut,
    OPT_OUT_COOKIE_NAME,
}
