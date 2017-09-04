// @flow
import template from 'lodash/utilities/template';
import {
    isRecentContributor,
    isPayingMember,
} from 'commercial/modules/user-features';
import {
    makeABTest,
    addTrackingCodesToUrl,
} from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';
import acquisitionsEpicThankYouTemplate from 'raw-loader!common/views/acquisitions-epic-thank-you.html';

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
                    return template(acquisitionsEpicThankYouTemplate, {
                        componentName: variant.options.componentName,
                        membershipUrl: addTrackingCodesToUrl(
                            'https://www.theguardian.com/membership',
                            variant.options.campaignCode
                        ),
                    });
                },
            },
        },
    ],
});
