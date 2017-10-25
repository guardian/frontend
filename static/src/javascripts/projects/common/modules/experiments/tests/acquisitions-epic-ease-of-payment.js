// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { useSupportDomain } from 'common/modules/commercial/support-utilities';
import {
    oldControl,
    justAMinute,
    justOnePound,
} from 'common/modules/commercial/acquisitions-copy';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { acquisitionsTestimonialBlockTemplate } from 'common/modules/commercial/templates/acquisitions-epic-testimonial-block';
import { control as acquisitionsTestimonialParametersControl } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';

import { getLocalCurrencySymbol } from 'lib/geolocation';

export const acquisitionsEpicEaseOfPayment = makeABTest({
    id: 'AcquisitionsEpicEaseOfPayment',
    campaignId: 'epic_ease_of_payment',

    start: '2017-10-20',
    expiry: '2017-11-20',

    author: 'Joseph Smith',
    description: 'Test some new variations of the Epic which mention price',
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
            id: 'currency_symbol_in_cta',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                template: variant =>
                    acquisitionsEpicControlTemplate({
                        copy: oldControl,
                        componentName: variant.componentName,
                        buttonTemplate: epicButtonsTemplate(
                            {
                                membershipUrl: variant.options.membershipURL,
                                contributeUrl: variant.options.contributeURL,
                                supportUrl: variant.options.supportURL,
                            },
                            useSupportDomain(),
                            `(${getLocalCurrencySymbol()})`
                        ),
                        testimonialBlock: acquisitionsTestimonialBlockTemplate(
                            acquisitionsTestimonialParametersControl
                        ),
                        epicClass: 'currency-symbol-in-cta',
                    }),
            },
        },

        {
            id: 'just_a_minute',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                copy: justAMinute,
            },
        },

        {
            id: 'just_one_pound',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                copy: justOnePound,
            },
        },
    ],
});
