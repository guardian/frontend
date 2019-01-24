// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { setupEpicInLiveblog } from 'common/modules/commercial/contributions-liveblog-utilities';
import { epicLiveBlogTemplate } from 'common/modules/commercial/templates/acquisitions-epic-liveblog';
import { liveblogCopy } from 'common/modules/commercial/acquisitions-copy';

export const acquisitionsEpicLiveblog: EpicABTest = makeABTest({
    id: 'AcquisitionsEpicLiveblog',
    campaignId: 'epic_liveblog',
    start: '2017-04-01',
    expiry: '2020-01-27',

    author: 'Joseph Smith',
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
            page.contentType === 'LiveBlog' &&
            page.section !== 'sport' &&
            page.section !== 'football'
        );
    },

    variants: [
        {
            id: 'million',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: {
                isUnlimited: true,

                template(variant) {
                    return epicLiveBlogTemplate({
                        copy: liveblogCopy,
                        componentName: variant.options.componentName,
                        supportURL: variant.options.supportURL,
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
