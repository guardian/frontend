// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { useSupportDomain } from 'common/modules/commercial/support-utilities';
import {
    highlightLastSentence,
    mentionAverageAmount,
    control,
} from 'common/modules/commercial/acquisitions-copy';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { acquisitionsTestimonialBlockTemplate } from 'common/modules/commercial/templates/acquisitions-epic-testimonial-block';
import { control as acquisitionsTestimonialParametersControl } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';

export const acquisitionsEpicLogosHighlightAverage = makeABTest({
    id: 'AcquisitionsEpicLogosHighlightAverage',
    campaignId: 'epic_logos_highlight_average',

    start: '2017-11-02',
    expiry: '2017-12-03',

    author: 'Joseph Smith',
    description: 'Test some more variations of the epic',
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
            id: 'paypal_logo',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                template: variant =>
                    acquisitionsEpicControlTemplate({
                        copy: control,
                        componentName: variant.componentName,
                        buttonTemplate: epicButtonsTemplate(
                            {
                                membershipUrl: variant.options.membershipURL,
                                contributeUrl: variant.options.contributeURL,
                                supportUrl: variant.options.supportURL,
                            },
                            useSupportDomain(),
                            '',
                            true
                        ),
                        testimonialBlock: acquisitionsTestimonialBlockTemplate(
                            acquisitionsTestimonialParametersControl
                        ),
                        epicClass: 'paypal-logo',
                    }),
            },
        },

        {
            id: 'highlight_last_sentence',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                copy: highlightLastSentence,
            },
        },

        {
            id: 'mention_average_amount',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                copy: mentionAverageAmount,
            },
        },
    ],
});
