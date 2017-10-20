// @flow
import {
    makeABTest,
    defaultButtonTemplate,
    getTestimonialBlock,
} from 'common/modules/commercial/contributions-utilities';
import {
    alternativeHeaderOct2017,
    easeOfPayment,
    multipleTestimonialsCopy,
} from 'common/modules/commercial/acquisitions-copy';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { multiple as multipleTestimonialBlocks } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';

export const acquisitionsEpicVarietyPack = makeABTest({
    id: 'AcquisitionsEpicVarietyPack',
    campaignId: 'epic_variety_pack',

    start: '2017-10-20',
    expiry: '2017-11-20',

    author: 'Sam Desborough',
    description: 'Test some new variations of the Epic',
    successMeasure: 'AV2.0',
    idealOutcome: 'We find a winning variant',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
        },

        {
            id: 'alternative_header',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                copy: alternativeHeaderOct2017,
            },
        },

        {
            id: 'ease_of_payment',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                copy: easeOfPayment,
            },
        },

        {
            id: 'testimonials',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                template: variant =>
                    acquisitionsEpicControlTemplate({
                        copy: multipleTestimonialsCopy,
                        componentName: variant.componentName,
                        buttonTemplate: defaultButtonTemplate({
                            membershipUrl: variant.options.membershipURL,
                            contributeUrl: variant.options.contributeURL,
                            supportUrl: variant.options.supportURL,
                        }),
                        testimonialBlock: multipleTestimonialBlocks
                            .map(getTestimonialBlock)
                            .join(''),
                        epicClass: 'multiple-testimonials',
                    }),
            },
        },
    ],
});
