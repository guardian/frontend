// @flow
import { makeEpicABTest } from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { epicLiveBlogTemplate } from 'common/modules/commercial/templates/acquisitions-epic-liveblog';

export const contributionsEpicLiveblogDesignTestR1: EpicABTest = makeEpicABTest({
    id: 'ContributionsEpicLiveblogDesignTestR1',
    campaignId: 'contributions-epic-liveblog-design-test-r1',

    geolocation: geolocationGetSync(),
    highPriority: true,

    start: '2020-03-26',
    expiry: '2020-06-01',

    author: 'Tom Forbes',
    description:
        'Test new designs for the liveblog',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Acquires many Supporters',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    canRun: () => {
        debugger
        return true
    },

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            template: epicLiveBlogTemplate,
        },
        //TODO - add variants for different designs
    ],
});
