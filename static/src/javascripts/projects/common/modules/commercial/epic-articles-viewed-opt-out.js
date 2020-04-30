// @flow

import config from "lib/config";
import {getMvtValue} from "common/modules/analytics/mvt-cookie";
import {submitClickEvent, submitViewEvent} from "common/modules/commercial/acquisitions-ophan";
import {addCookie} from "lib/cookies";

const OPT_OUT_COOKIE_NAME = 'gu_article_count_opt_out';
const COOKIE_DAYS_TO_LIVE = 90;

const optOutEnabled = () => config.get('switches.showArticlesViewedOptOut');
// Show the opt-out to 50% of the audience
const inArticlesViewedOptOutTest = () => Number(getMvtValue()) % 2;

const hideDialog = () => {
    const checkbox = document.querySelector('#epic-article-count__dialog');
    if (checkbox) {
        checkbox.checked = false;
    }
};

const showDialog = () => {
    const checkbox = document.querySelector('#epic-article-count__dialog');
    if (checkbox) {
        checkbox.checked = true;
    }
};

const onArticlesViewedClick = () => {
    console.log("onArticlesViewedClick")
    submitClickEvent({
        component: {
            componentType: 'ACQUISITIONS_OTHER',
            id: 'articles-viewed-opt-out_open',
        },
    })
    // TODO - also show dialog this way? Or use css-only?
    showDialog();
};

const onOptOutClick = () => {
    console.log("onOptOutClick")
    submitClickEvent({
        component: {
            componentType: 'ACQUISITIONS_OTHER',
            id: 'articles-viewed-opt-out_out',
        },
    });

    addCookie(OPT_OUT_COOKIE_NAME, new Date().getTime().toString(), COOKIE_DAYS_TO_LIVE);

    const closeButton = document.querySelector('.epic-article-count__dialog-close');
    if (closeButton) {
        document.querySelector('.epic-article-count__dialog-close').classList.remove('is-hidden');
        closeButton.addEventListener('click', () => {
            hideDialog();
        });
    }

    document.querySelector('.epic-article-count__buttons').remove();
    document.querySelector('.epic-article-count__dialog-header').innerHTML = `You've opted out`;
    document.querySelector('.epic-article-count__dialog-body').innerHTML = `Starting from your next page view, we won't count the articles you read or show you this message for three months.`;
    // TODO - add url
    document.querySelector('.epic-article-count__dialog-note').innerHTML = `If you have any questions, please <a href="">contact us</a>.`;
};

const onOptInClick = () => {
    console.log("onOptInClick")
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
        console.log("submitted view", viewEventId)

        if (element) {
            const labelElement = element.querySelector('.epic-article-count__dialog');
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
    inArticlesViewedOptOutTest,
    setupArticlesViewedOptOut,
    OPT_OUT_COOKIE_NAME,
}
