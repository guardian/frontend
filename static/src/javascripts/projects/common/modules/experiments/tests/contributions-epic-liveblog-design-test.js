// @flow
import {
    makeEpicABTest,
    isCompatibleWithLiveBlogEpic,
    buildEpicCopy,
} from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { setupEpicInLiveblog } from 'common/modules/commercial/contributions-liveblog-utilities';
import {
    epicLiveBlogTemplate,
    lastSentenceTemplateButtonAndSubscribe,
    lastSentenceTemplateControl,
} from 'common/modules/commercial/templates/acquisitions-epic-liveblog';
import type { LiveblogEpicLastSentenceTemplate } from 'common/modules/commercial/templates/acquisitions-epic-liveblog';

const geolocation = geolocationGetSync();

const epicCopy = {
    paragraphs: [
        `In these extraordinary times, the Guardian’s editorial independence has never been more important. Because no one sets our agenda, or edits our editor, we can keep delivering quality, trustworthy, fact-checked journalism each and every day. Free from commercial or political bias, we can report fearlessly on world events and challenge those in power.`,
        `Your support protects the Guardian’s independence. We believe every one of us deserves equal access to accurate news and calm explanation. No matter how unpredictable the future feels, we will remain with you, delivering high quality news so we can all make critical decisions about our lives, health and security – based on fact, not fiction.`,
    ],
    highlightedText:
        'For as little as %%CURRENCY_SYMBOL%%1, you can support us, and it only takes a minute. Thank you.',
};

const liveBlogTemplate = (
    lastSentenceTemplate: LiveblogEpicLastSentenceTemplate
): EpicTemplate => (variant: EpicVariant, copy: AcquisitionsEpicTemplateCopy) =>
    epicLiveBlogTemplate({
        copy,
        componentName: variant.componentName,
        supportURL: variant.supportURL,
        lastSentenceTemplate,
    });

export const contributionsEpicLiveblogDesignTestR2: EpicABTest = makeEpicABTest(
    {
        id: 'ContributionsEpicLiveblogDesignTestR2',
        campaignId: 'contributions-epic-liveblog-design-test-r2',

        geolocation,
        highPriority: true,

        start: '2020-03-26',
        expiry: '2020-06-01',

        author: 'Tom Forbes',
        description: 'Test new designs for the liveblog',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Acquires many Supporters',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,
        deploymentRules: 'AlwaysAsk',

        pageCheck: isCompatibleWithLiveBlogEpic,
        canRun: () => geolocation === 'GB',

        variants: [
            {
                id: 'control',
                products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
                copy: buildEpicCopy(epicCopy, false, geolocation),
                template: liveBlogTemplate(lastSentenceTemplateControl),
                test: setupEpicInLiveblog,
            },
        ],
    }
);
