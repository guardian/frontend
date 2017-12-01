// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { testimonialCycleGroup } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';
import { getMvtValue } from 'common/modules/analytics/mvt-cookie';
import { overallNumberOfViews } from 'common/modules/commercial/acquisitions-view-log';
import { acquisitionsTestimonialBlockTemplate } from 'common/modules/commercial/templates/acquisitions-epic-testimonial-block';

const getTestimonialText = () => {
    const mvtId = getMvtValue();
    const numberOfViews = overallNumberOfViews();
    return testimonialCycleGroup[mvtId % 8 + numberOfViews % 8];
};

export const acquisitionsEpicTestimonialsGroup = makeABTest({
    id: 'AcquisitionsEpicTestimonialsGroup',
    campaignId: 'epic_testimonials_group',

    start: '2017-11-30',
    expiry: '2018-01-11',

    author: 'Jonathan Rankin',
    description:
        'A test to try out cycling through various testimonials vs just one testimonial',
    successMeasure: 'Conversion rate',
    idealOutcome:
        'We prove that looping through testimonials has a stronger impact than showing just one testimonial',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    variants: [
        {
            id: 'control',
            products: [],
        },
        {
            id: 'cycle',
            products: [],
            options: {
                testimonialBlock: acquisitionsTestimonialBlockTemplate(
                    getTestimonialText()
                ),
            },
        },
    ],
});
