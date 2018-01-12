// @flow
import {
    makeABTest,
    defaultButtonTemplate,
} from 'common/modules/commercial/contributions-utilities';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { control } from 'common/modules/commercial/acquisitions-copy';

export const colourTestEpicHoldback = makeABTest({
    id: 'ColourTestEpicHoldback',
    campaignId: 'colour_test_epic_holdback',

    start: '2018-01-12',
    expiry: '2018-02-15',

    author: 'Ap0c',
    description: 'A holdback for the epic colour changes',
    successMeasure: 'Who knows',
    idealOutcome: 'No drop-off in conversions either way',
    audienceCriteria: 'All',
    audience: 0.5,
    audienceOffset: 0,

    variants: [
        {
            id: 'control',
            products: [],
        },
        {
            id: 'variant',
            products: [],
            options: {
                template: function makeControlTemplate(variant) {
                    return acquisitionsEpicControlTemplate({
                        copy: control,
                        componentName: variant.options.componentName,
                        buttonTemplate: defaultButtonTemplate({
                            contributeUrl: variant.options.contributeURL,
                            supportUrl: variant.options.supportURL,
                        }),
                        testimonialBlock: variant.options.testimonialBlock,
                        epicClass: 'contributions__epic--holdback',
                    });
                },
            },
        },
    ],
});
