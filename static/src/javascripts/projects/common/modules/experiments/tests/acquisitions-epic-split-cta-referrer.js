// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import type { CtaUrls } from 'common/modules/commercial/contributions-utilities';
import { epicButtonsSplitCtaTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons-split-cta';
import { epicButtonsReferrerJustContributeTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons-referrer-just-contribute';
import { epicButtonsReferrerContributeAndDigipackTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons-referrer-contribute-and-digipack';

const referrerContributeAndDigipackTemplate = (urls: CtaUrls): string =>
    epicButtonsReferrerContributeAndDigipackTemplate(urls);

const referrerJustContributeTemplate = (urls: CtaUrls): string =>
    epicButtonsReferrerJustContributeTemplate(urls);

const splitCtaTemplate = (urls: CtaUrls): string =>
    epicButtonsSplitCtaTemplate(urls);

export const acquisitionsEpicSplitCtaReferrer: EpicABTest = makeABTest({
    id: 'AcquisitionsEpicSplitCtaReferrer',
    campaignId: 'epic_split_cta_referrer',

    start: '2017-01-24',
    expiry: '2018-01-10',

    author: 'Jonathan Rankin',
    description:
        'This tests a) showing a different product set to users who visit the support site' +
        'off the epic, and b) Moving the decision between contribute and subscribe to the epic',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Acquires many Supporters',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    locations: ['GB'],

    variants: [
        {
            id: 'control',
            products: [],
        },
        {
            id: 'referrer_contribute_and_digipack',
            products: [],
            options: {
                buttonTemplate: referrerContributeAndDigipackTemplate,
            },
        },
        {
            id: 'referrer_just_contribute',
            products: [],
            options: {
                buttonTemplate: referrerJustContributeTemplate,
            },
        },
        {
            id: 'split_cta',
            products: [],
            options: {
                buttonTemplate: splitCtaTemplate,
            },
        },
    ],
});
