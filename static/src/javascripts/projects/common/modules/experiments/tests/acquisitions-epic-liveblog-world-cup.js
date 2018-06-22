// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';

import { epicLiveBlogTemplate } from 'common/modules/commercial/templates/acquisitions-epic-liveblog';
import {
    setupEpicInLiveblog,
    pageId,
} from 'common/modules/commercial/contributions-liveblog-utilities';
import {
    liveblogCopy,
    liveblogWorldCupPlayfulCopy,
    liveblogWorldCupDepthCopy,
} from 'common/modules/commercial/acquisitions-copy';

import { keywordExists } from 'lib/page';

const options = variantCopy => ({
    isUnlimited: true,
    template(variant) {
        return epicLiveBlogTemplate({
            copy: variantCopy(
                variant.options.supportURL,
                variant.options.contributeURL
            ),
            componentName: variant.options.componentName,
        });
    },
    test(renderFn, variant, test) {
        const epicHtml = variant.options.template(variant);
        setupEpicInLiveblog(epicHtml, test);
    },
});

export const acquisitionsEpicLiveblogWorldCup: EpicABTest = makeABTest({
    id: 'AcquisitionsEpicLiveblogWorldCup',
    campaignId: 'epic_liveblog_world_cup',
    campaignSuffix: pageId.replace(/-/g, '_').replace(/\//g, '__'),

    start: '2018-06-21',
    expiry: '2019-01-24',

    author: 'Jonathan Rankin',
    description:
        'This places the epic underneath liveblog blocks which the author has specified in Composer should have an epic against them',
    successMeasure: 'Member acquisition and contributions',
    idealOutcome:
        'Our wonderful readers will support The Guardian in this time of need!',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    pageCheck(page) {
        return (
            page.contentType === 'LiveBlog' && keywordExists(['World Cup 2018'])
        );
    },

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: options(liveblogCopy),
        },
        {
            id: 'depth',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: options(liveblogWorldCupDepthCopy),
        },
        {
            id: 'playful',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: options(liveblogWorldCupPlayfulCopy),
        },
    ],
});
