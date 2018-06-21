// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';

import config from 'lib/config';
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

const keyWordId = 'football/world-cup-2018';

const tagsMatch = () =>
    config
        .get('page.keywordIds', '')
        .split(',')
        .includes(keyWordId);

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
        return page.contentType === 'LiveBlog' && tagsMatch();
    },

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: {
                isUnlimited: true,

                template(variant) {
                    return epicLiveBlogTemplate({
                        copy: liveblogCopy(
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
            },
        },
        {
            id: 'depth',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: {
                isUnlimited: true,

                template(variant) {
                    return epicLiveBlogTemplate({
                        copy: liveblogWorldCupDepthCopy(
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
            },
        },
        {
            id: 'playful',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: {
                isUnlimited: true,

                template(variant) {
                    return epicLiveBlogTemplate({
                        copy: liveblogWorldCupPlayfulCopy(
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
            },
        },
    ],
});
