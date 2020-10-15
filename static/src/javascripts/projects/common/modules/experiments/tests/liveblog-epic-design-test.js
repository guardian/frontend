// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import config from 'lib/config';
import {setupEpicInLiveblog} from "common/modules/commercial/contributions-liveblog-utilities";
import {
    isCompatibleWithLiveBlogEpic,
    liveBlogTemplate,
    makeEpicABTest,
    buildEpicCopy,
} from "common/modules/commercial/contributions-utilities";

// TODO - correct copy
const copy: AcquisitionsEpicTemplateCopy = {
    paragraphs: [
        'In these extraordinary times, the Guardian’s editorial independence has never been more important. Because no one sets our agenda, or edits our editor, we can keep delivering quality, trustworthy, fact-checked journalism each and every day. Free from commercial or political bias, we can report fearlessly on world events and challenge those in power.',
        'Your support protects the Guardian’s independence. We believe every one of us deserves equal access to accurate news and calm explanation. No matter how unpredictable the future feels, we will remain with you, delivering high quality news so we can all make critical decisions about our lives, health and security – based on fact, not fiction.',
        'Support the Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.'
    ],
};

const geolocation = geolocationGetSync();

export const liveblogEpicDesignTest: EpicABTest = makeEpicABTest({
    id: 'LiveblogEpicDesignTest',
    campaignId: 'liveblog-epic-design-test',

    geolocation,
    highPriority: false,

    start: '2017-01-24',
    expiry: '2021-01-27',

    author: 'TF',
    description: 'Test designs for the liveblog epic',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Acquires many Supporters',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    canRun: () => config.get('page').contentType === 'LiveBlog',
    pageCheck: isCompatibleWithLiveBlogEpic,
    deploymentRules: 'AlwaysAsk',

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            test: setupEpicInLiveblog,
            template: liveBlogTemplate('liveblog-epic-test__control'),
            copy: buildEpicCopy(copy, false, geolocation),
        },
        {
            id: 'v1',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            test: setupEpicInLiveblog,
            template: liveBlogTemplate('liveblog-epic-test__v1'),
            copy: buildEpicCopy(copy, false, geolocation),
        },
        {
            id: 'v2',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            test: setupEpicInLiveblog,
            template: liveBlogTemplate('liveblog-epic-test__v2'),
            copy: buildEpicCopy(copy, false, geolocation),
        },
    ],
});
