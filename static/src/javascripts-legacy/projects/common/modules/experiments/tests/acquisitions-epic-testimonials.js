define([
    'lodash/utilities/template',
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-testimonials-prominent.html',
    'raw-loader!common/views/acquisitions-epic-testimonials-subtle.html',
    'raw-loader!common/views/acquisitions-epic-testimonials-testimonial-only.html'
], function (
    template,
    contributionsUtilities,
    acquisitionsEpicTestimonialsProminent,
    acquisitionsEpicTestimonialsSubtle,
    acquisitionsEpicTestimonialsOnly
) {

    function createVariantTemplate(epicTemplate) {
        return function(variant) {
            return template(epicTemplate, {
                membershipUrl: variant.membershipURL,
                contributionUrl: variant.contributeURL,
                componentName: variant.componentName
            })
        }
    }

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicTestimonials',
        campaignId: 'kr1_epic_testimonials',

        start: '2017-04-27',
        expiry: '2017-05-03',

        author: 'Guy Dawson and Joe Smith',
        description: 'Test placing reader testimonials in the Epic',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We are able to determine which testimonial design is the best',

        audienceCriteria: 'All',
        audience: 0.9,
        audienceOffset: 0,

        variants: [
            {
                id: 'control'
            },
            {
                id: 'prominent',
                template: createVariantTemplate(acquisitionsEpicTestimonialsProminent)
            },
            {
                id: 'subtle',
                template: createVariantTemplate(acquisitionsEpicTestimonialsSubtle)
            },
            {
                id: 'testimonial_only',
                template: createVariantTemplate(acquisitionsEpicTestimonialsOnly)
            }
        ]
    });
});
