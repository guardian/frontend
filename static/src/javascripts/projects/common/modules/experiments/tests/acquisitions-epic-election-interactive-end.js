// @flow
import {
    makeABTest,
    defaultButtonTemplate,
} from 'common/modules/commercial/contributions-utilities';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { control } from 'common/modules/commercial/acquisitions-copy';

export const acquisitionsEpicElectionInteractiveEnd = makeABTest({
    id: 'AcquisitionsInteractiveEnd',
    campaignId: 'epic_interactive_end',

    start: '2017-05-22',
    expiry: '2018-07-03',

    author: 'Sam Desborough',
    description: 'This places the epic underneath certain interactives',
    successMeasure: 'Member acquisition and contributions',
    idealOutcome:
        'Our wonderful readers will support The Guardian in this time of need!',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    pageCheck(page) {
        const isElection =
            page.keywordIds &&
            page.keywordIds.includes('general-election-2017') &&
            page.contentType === 'Interactive';

        const isFootball =
            page.pageId.indexOf(
                'transfer-window-2017-every-deal-in-europes-top-five-leagues'
            ) > -1;

        return isElection || isFootball;
    },

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: {
                isUnlimited: true,

                insertAtSelector: '.content-footer',
                successOnView: true,

                template: function makeControlTemplate(variant) {
                    return acquisitionsEpicControlTemplate({
                        copy: control,
                        componentName: variant.options.componentName,
                        buttonTemplate: defaultButtonTemplate({
                            contributeUrl: variant.options.contributeURL,
                        }),
                        testimonialBlock: variant.options.testimonialBlock,
                        epicClass:
                            'contributions__epic--interactive gs-container',
                        wrapperClass: 'contributions__epic-interactive-wrapper',
                    });
                },
            },
        },
    ],
});
