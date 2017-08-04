// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import template from 'lodash/utilities/template';
import epicSlice from 'raw-loader!common/views/acquisitions-epic-slice.html';

export const acquisitionsEpicElectionInteractiveSlice = makeABTest({
    id: 'AcquisitionsElectionInteractiveSlice',
    campaignId: 'epic_ge2017_interactive_slice',

    start: '2017-05-22',
    expiry: '2017-07-03',

    author: 'Sam Desborough',
    description:
        'This places the epic (slice design) in the middle of UK election-related interactives',
    successMeasure: 'Member acquisition and contributions',
    idealOutcome:
        'Our wonderful readers will support The Guardian in this time of need!',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    pageCheck(page) {
        return (
            page.keywordIds &&
            page.keywordIds.includes('general-election-2017') &&
            page.contentType === 'Interactive'
        );
    },

    variants: [
        {
            id: 'control',
            isUnlimited: true,

            insertAtSelector: '#js-interactive-epic',
            successOnView: true,

            test(render) {
                const article = document.getElementById('article');
                if (article) article.style['overflow-x'] = 'hidden';
                render();
            },

            template: function makeSliceTemplate(variant) {
                return template(epicSlice, {
                    membershipUrl: variant.options.membershipURL,
                    contributionUrl: variant.options.contributeURL,
                    componentName: variant.options.componentName,
                });
            },
        },
    ],
});
