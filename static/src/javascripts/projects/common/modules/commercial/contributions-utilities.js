import { storage } from '@guardian/libs';
import config from '../../../../lib/config';
import { elementInView } from '../../../../lib/element-inview';
import { submitInsertEvent, submitViewEvent } from './acquisitions-ophan';
import { logView } from './acquisitions-view-log';

const getVisitCount = () => parseInt(storage.local.getRaw('gu.alreadyVisited'), 10) || 0;

const pageShouldHideReaderRevenue = () =>
    config.get('page.shouldHideReaderRevenue') ||
    config.get('page.sponsorshipType') === 'paid-content';

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
    });
};

export {
    pageShouldHideReaderRevenue,
    getVisitCount,
    submitOphanInsert,
    setupOphanView,
};
