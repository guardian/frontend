import {
    logView,
} from 'common/modules/commercial/acquisitions-view-log';
import {
    submitClickEvent,
    submitInsertEvent,
    submitViewEvent,
} from 'common/modules/commercial/acquisitions-ophan';
import config from 'lib/config';
import { storage } from '@guardian/libs';
import { elementInView } from 'lib/element-inview';
import mediator from 'lib/mediator';
import { onEpicViewed } from 'common/modules/commercial/epic-articles-viewed-opt-out';
import { awaitEpicButtonClicked } from 'common/modules/commercial/epic/epic-utils';
import {
    bannerMultipleTestsGoogleDocUrl,
    getGoogleDoc,
} from 'common/modules/commercial/contributions-google-docs';
import { initTicker } from 'common/modules/commercial/ticker';
import {
    epicReminderEmailSignup,
    getFields,
} from 'common/modules/commercial/epic-reminder-email-signup';

const getVisitCount = () => parseInt(storage.local.getRaw('gu.alreadyVisited'), 10) || 0;

const pageShouldHideReaderRevenue = () =>
    config.get('page.shouldHideReaderRevenue') ||
    config.get('page.sponsorshipType') === 'paid-content';


const emitBeginEvent = (trackingCampaignId) => {
    mediator.emit('register:begin', trackingCampaignId);
};

const submitOphanInsert = (
    testId,
    variantId,
    componentType,
    products,
    campaignCode
) => {
    submitInsertEvent({
        component: {
            componentType,
            products,
            campaignCode,
            id: campaignCode,
        },
        abTest: {
            name: testId,
            variant: variantId,
        },
    });
};

const setupOphanView = (
    element,
    testId,
    variantId,
    campaignCode,
    trackingCampaignId,
    componentType,
    products,
    showTicker = false,
    tickerSettings,
) => {
    const inView = elementInView(element, window, {
        top: 18,
    });

    inView.on('firstview', () => {
        logView(testId);

        submitViewEvent({
                component: {
                    componentType,
                    products,
                    campaignCode,
                    id: campaignCode,
                },
                abTest: {
                    name: testId,
                    variant: variantId,
                }
            }
        );

        mediator.emit('register:end', trackingCampaignId);

        if (showTicker || !!tickerSettings) {
            initTicker('.js-epic-ticker', tickerSettings);
        }

        if (config.get('switches.showContributionReminder')) {
            const htmlElements = getFields();
            if (htmlElements) {
                epicReminderEmailSignup(htmlElements);
            }
        }

        onEpicViewed();
    });
};

const setupClickHandling = (
    testId,
    variantId,
    componentType,
    campaignCode,
    products,
) => {
    awaitEpicButtonClicked().then(() =>
        submitClickEvent({
            component: {
                componentType,
                products,
                campaignCode: campaignCode || '',
                id: campaignCode || '',
            },
            abTest: {
                name: testId,
                variant: variantId,
            },
        })
    );
};


export {
    pageShouldHideReaderRevenue,
    getVisitCount,
    emitBeginEvent,
    submitOphanInsert,
    setupOphanView,
    setupClickHandling,
};
