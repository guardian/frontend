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

const geolocation = geolocationGetSync();

const copyGlobal: AcquisitionsEpicTemplateCopy = {
    paragraphs: [
        'In these extraordinary times, the Guardian’s editorial independence has never been more important. Because no one sets our agenda, or edits our editor, we can keep delivering quality, trustworthy, fact-checked journalism each and every day. Free from commercial or political bias, we can report fearlessly on world events and challenge those in power.',
        'Your support protects the Guardian’s independence. We believe every one of us deserves equal access to accurate news and calm explanation. No matter how unpredictable the future feels, we will remain with you, delivering high quality news so we can all make critical decisions about our lives, health and security – based on fact, not fiction.',
        'Support the Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.'
    ],
};

const copyElectionNonUS: AcquisitionsEpicTemplateCopy = {
    paragraphs: [
        'Four more years of Donald Trump is a real possibility. America faces an epic choice in November and the result of the presidential election will have global repercussions for democracy, progress and solidarity for generations. Transatlantic ties, superpower relations and the climate emergency are all in the balance.',
        'In these chaotic, perilous times, an independent, truth-seeking news organisation like the Guardian is essential. Free from commercial or political bias, we can report fearlessly on critical events like this, bringing you a clear, international perspective.',
        'Support from readers funds our work, motivating us to do better, investigate deeper, challenge more. It means we can keep our quality reporting open for everyone to read, and protects our independence for the long term. Every contribution, however big or small, makes a difference.',
        'Support the Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.',
    ],
};

const copyUS: AcquisitionsEpicTemplateCopy = {
    paragraphs: [
        '<b>America faces an epic choice … </b>',
        '… and the results will define the country for a generation. These are perilous times. In recent years, much of what the Guardian holds dear has been threatened – democracy, civility, truth.',
        'At a time like this, an independent news organization that fights for truth and holds power to account is not just optional. It is essential. We believe every one of us deserves equal access to fact-based news and analysis. That’s why we’ve decided to keep Guardian journalism free for all readers, regardless of where they live or what they can afford to pay.',
        'If you can, support the Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.'
    ],
};

const USElectionTags = ['us-news/us-elections-2020', 'us-news/series/us-politics-live'];

const getCopy = (): AcquisitionsEpicTemplateCopy => {
    console.log("tags",config.get('page.keywordIds'))
    if (geolocation === 'US') {
        return copyUS;
    }
    if (USElectionTags.some(tag => config.get('page.keywordIds').includes(tag))) {
        return copyElectionNonUS;
    }
    return copyGlobal;
};

export const liveblogEpicDesignTest: EpicABTest = makeEpicABTest({
    id: 'LiveblogEpicDesignTestR1',
    campaignId: 'liveblog-epic-design-test-r1',

    geolocation,
    highPriority: false,

    start: '2020-10-15',
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
            copy: buildEpicCopy(getCopy(), false, geolocation),
        },
        {
            id: 'v1',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            test: setupEpicInLiveblog,
            template: liveBlogTemplate('liveblog-epic-test__v1'),
            copy: buildEpicCopy(getCopy(), false, geolocation),
        },
        {
            id: 'v2',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            test: setupEpicInLiveblog,
            template: liveBlogTemplate('liveblog-epic-test__v2'),
            copy: buildEpicCopy(getCopy(), false, geolocation),
        },
    ],
});
