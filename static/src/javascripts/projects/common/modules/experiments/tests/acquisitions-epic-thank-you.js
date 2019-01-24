// @flow
import {
    isRecentOneOffContributor,
    isPayingMember,
} from 'common/modules/commercial/user-features';
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { addTrackingCodesToUrl } from 'common/modules/commercial/acquisitions-ophan';
import { acquisitionsEpicThankYouTemplate } from 'common/modules/commercial/templates/acquisitions-epic-thank-you';

export const acquisitionsEpicThankYou = makeABTest({
    id: 'AcquisitionsEpicThankYou',
    campaignId: 'epic_thank_you',
    componentType: 'ACQUISITIONS_THANK_YOU_EPIC',

    start: '2017-06-01',
    expiry: '2020-01-27',

    author: 'Guy Dawson',
    description:
        'Bootstrap the AB test framework to use the Epic to thank readers who have already supported the Guardian',
    successMeasure: 'N/A',
    idealOutcome: 'N/A',
    audienceCriteria: 'Readers who have supported the Guardian',
    audience: 1,
    audienceOffset: 0,

    showToContributorsAndSupporters: true,

    canRun: () => isPayingMember() || isRecentOneOffContributor(),

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
