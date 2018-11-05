// @flow
import {
    isRecentOneOffContributor,
    isPayingMember,
} from 'common/modules/commercial/user-features';
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { addTrackingCodesToUrl } from 'common/modules/commercial/acquisitions-ophan';
import { acquisitionsEpicOneMillionTemplate } from 'common/modules/commercial/templates/acquisitions-epic-one-million';
import { epicButtonsOneMillionTemplate} from 'common/modules/commercial/templates/acquisitions-epic-one-million-buttons';

export const acquisitionsEpicThankYou = makeABTest({
    id: 'AcquisitionsEpicThankYou',
    campaignId: 'epic_one_million',
    componentType: 'ACQUISITIONS_ONE_MILLION_EPIC',

    start: '2018-11-06',
    expiry: '2019-01-24',

    author: '',
    description:
        '',
    successMeasure: 'N/A',
    idealOutcome: 'N/A',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    showToContributorsAndSupporters: true,

    useLocalViewLog: true,

    variants: [
        {
            id: 'control',
            products: [],
        },
        {
            //new hook & new design
            id: 'variant1',
            products: [],

            options: {

                template: variant => acquisitionsEpicOneMillionTemplate({
                    copy: {
                        heading: 'NEW HOOK HERE'
                    },
                    //designAddition: ???,
                    buttonTemplate: acquisitionsEpicOneMillionButtonTemplate,
                    membershipUrl: addTrackingCodesToUrl({
                        base: 'https://www.theguardian.com/membership',
                        componentType: 'ACQUISITIONS_EPIC',
                        componentId: variant.options.campaignCode,
                        campaignCode: variant.options.campaignCode,
                        abTest: {
                            name: 'AcquisitionsEpicOneMillion',
                            variant: variant.id,
                        },
                    }),
                })
            },
        },
        {
            //new hook only
            id: 'variant2',
            products: [],

            options: {
                template: variant => acquisitionsEpicOneMillionTemplate({
                    copy: {
                        heading: 'NEW HOOK HERE'
                    },
                    buttonTemplate: acquisitionsEpicOneMillionButtonTemplate(),
                    membershipUrl: addTrackingCodesToUrl({
                        base: 'https://www.theguardian.com/membership',
                        componentType: 'ACQUISITIONS_EPIC',
                        componentId: variant.options.campaignCode,
                        campaignCode: variant.options.campaignCode,
                        abTest: {
                            name: 'AcquisitionsEpicOneMillion',
                            variant: variant.id,
                        },
                    }),
                })
            },
        },
    ],
});
