// @flow
import {
    isRecentContributor,
    isPayingMember,
} from 'commercial/modules/user-features';
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { addTrackingCodesToUrl } from 'common/modules/commercial/acquisitions-ophan';
import config from 'lib/config';
import { acquisitionsEpicThankYouTemplate } from 'common/modules/commercial/templates/acquisitions-epic-thank-you';

const isTargetReader = () => isPayingMember() || isRecentContributor();

const worksWellWithPageTemplate = () =>
    config.page.contentType === 'Article' &&
    !config.page.isMinuteArticle &&
    !(config.page.isImmersive === true);

const isTargetPage = () =>
    worksWellWithPageTemplate() && !config.page.shouldHideReaderRevenue;

export const acquisitionsEpicThankYou = makeABTest({
    id: 'AcquisitionsEpicThankYou',
    campaignId: 'epic_thank_you',
    componentType: 'ACQUISITIONS_THANK_YOU_EPIC',

    start: '2017-06-01',
    expiry: '2018-09-05',

    author: 'Guy Dawson',
    description:
        'Bootstrap the AB test framework to use the Epic to thank readers who have already supported the Guardian',
    successMeasure: 'N/A',
    idealOutcome: 'N/A',
    audienceCriteria: 'Readers who have supported the Guardian',
    audience: 1,
    audienceOffset: 0,

    overrideCanRun: true,

    canRun() {
        return isTargetReader() && isTargetPage();
    },

    useLocalViewLog: true,

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: {
                maxViews: {
                    days: 365, // Arbitrarily high number - reader should only see the thank-you for one 'cycle'.
                    count: 1,
                    minDaysBetweenViews: 0,
                },

                template(variant) {
                    return acquisitionsEpicThankYouTemplate({
                        componentName: variant.options.componentName,
                        membershipUrl: addTrackingCodesToUrl({
                            base: 'https://www.theguardian.com/membership',
                            componentType: 'ACQUISITIONS_EPIC',
                            componentId: variant.options.campaignCode,
                            campaignCode: variant.options.campaignCode,
                            abTest: {
                                name: 'AcquisitionsEpicThankYou',
                                variant: variant.id,
                            },
                        }),
                    });
                },
            },
        },
    ],
});
