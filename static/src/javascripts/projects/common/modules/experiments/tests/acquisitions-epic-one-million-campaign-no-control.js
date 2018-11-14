// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { acquisitionsEpicOneMillionCampaignTemplate } from 'common/modules/commercial/templates/acquisitions-epic-one-million-campaign';
import type { EpicTemplate } from 'common/modules/commercial/contributions-utilities';
import {
    getSync as geolocationGetSync,
    getLocalCurrencySymbol,
} from 'lib/geolocation';

const abTestName = 'AcquisitionsEpicOneMillionCampaignNoControl';

const everywhereExceptAustraliaCopy = {
    heading: 'We have some news &hellip;',
    paragraphs: [
        '… three years ago, we knew we had to try to make The Guardian sustainable by deepening our relationship with our readers. The revenues from our newspaper had diminished and the technologies that connected us with a global audience had moved advertising money away from news organisations. We knew we needed to find a way to keep our journalism open and accessible to everyone, regardless of where they live or what they can afford.',
        'And so, we have an update for you on some good news. Thanks to all the readers who have supported our independent, investigative journalism through contributions, membership or subscriptions, we are starting to overcome the urgent financial situation we were faced with. Today we have been supported by more than a million readers around the world. Our future is starting to look brighter. But we have to maintain and build on that level of support for every year to come, which means we still need to ask for your help.',
        'Ongoing financial support from our readers means we can continue pursuing difficult stories in the challenging times we are living through, when factual reporting has never been more critical. The Guardian is editorially independent – our journalism is free from commercial bias and not influenced by billionaire owners, politicians or shareholders. This is important because it enables us to challenge the powerful and hold them to account. With your support, we can continue bringing The Guardian’s independent journalism to the world.',
        'If everyone who reads our reporting, who likes it, enjoys it, helps to support it, our future would be so much more secure.',
    ],
    highlightedText: `For as little as ${getLocalCurrencySymbol()}1, you can support The Guardian – and it only takes a minute. Thank you.`,
};

const oneMillionCampaignTemplate: EpicTemplate = (
    { options = {} },
    copy: AcquisitionsEpicTemplateCopy
) =>
    acquisitionsEpicOneMillionCampaignTemplate({
        copy,
        componentName: options.componentName,
        buttonTemplate: options.buttonTemplate({
            supportUrl: options.supportURL,
            subscribeUrl: options.subscribeURL,
        }),
    });

const campaignCode = 'onemillion';

export const acquisitionsEpicOneMillionCampaignNoControl: EpicABTest = makeABTest(
    {
        id: abTestName,
        campaignId: abTestName,

        useLocalViewLog: true,

        start: '2018-04-17',
        expiry: '2019-06-05',

        author: 'Joseph Smith',
        description: 'Test copy fetched from a Google Doc',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Alternative copy makes more money than the control',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        canRun: () => geolocationGetSync() !== 'AU',

        variants: [
            {
                id: 'just_copy',
                products: [],
                options: {
                    copy: everywhereExceptAustraliaCopy,
                    campaignCode,
                },
            },
            {
                id: 'copy_and_design',
                products: [],
                options: {
                    template: oneMillionCampaignTemplate,
                    copy: everywhereExceptAustraliaCopy,
                    campaignCode,
                },
            },
        ],
    }
);
