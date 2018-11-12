// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { oneMillionCampaignButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-one-million-campaign-buttons';
import {
    getSync as geolocationGetSync,
    getLocalCurrencySymbol,
} from 'lib/geolocation';

const abTestName = 'AcquisitionsEpicOneMillionCampaignAu';

const australiaCopy = {
    heading: 'We have some news &hellip;',
    paragraphs: [
        '… three years ago we set out to make The Guardian sustainable by deepening our relationship with our readers. The same technologies that connected us with a global audience had also shifted advertising revenues away from news publishers. We decided to seek an approach that would allow us to keep our journalism open and accessible to everyone, regardless of where they live or what they can afford.',
        'And now for the good news. Thanks to the one million readers who have supported our independent, investigative journalism through contributions, membership or subscriptions, The Guardian has overcome a perilous financial situation globally. And Guardian Australia has made its first profit with the help of 89,000 Australian supporters. But we have to maintain and build on that support for every year to come.',
        'Sustained support from our readers enables us to continue pursuing difficult stories in challenging times of political upheaval, when factual reporting has never been more critical. The Guardian is editorially independent – our journalism is free from commercial bias and not influenced by billionaire owners, politicians or shareholders. No one edits our editor. No one steers our opinion. This is important because it enables us to give a voice to the voiceless, challenge the powerful and hold them to account. Readers’ support means we can continue bringing The Guardian’s independent journalism to the world, and to Australia.',
        'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
    ],
    highlightedText: `For as little as ${getLocalCurrencySymbol()}1, you can support The Guardian – and it only takes a minute. Thank you.`,
};

const campaignCode = 'onemillion';

export const acquisitionsEpicOneMillionCampaignAu: EpicABTest = makeABTest({
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

    canRun: () => geolocationGetSync() === 'AU',

    variants: [
        {
            id: 'copy',
            products: [],
            options: {
                copy: australiaCopy,
                buttonTemplate: oneMillionCampaignButtonsTemplate,
                campaignCode,
            },
        },
    ],
});
