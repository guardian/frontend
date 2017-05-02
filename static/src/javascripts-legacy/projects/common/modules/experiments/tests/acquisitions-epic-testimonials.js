define([
    'lodash/utilities/template',
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-testimonials-prominent.html',
    'raw-loader!common/views/acquisitions-epic-testimonials-subtle.html',
    'raw-loader!common/views/acquisitions-epic-testimonials-testimonial-only.html',
    'svg-loader!svgs/icon/quote.svg'
], function (
    template,
    contributionsUtilities,
    acquisitionsEpicTestimonialsProminent,
    acquisitionsEpicTestimonialsSubtle,
    acquisitionsEpicTestimonialsOnly,
    quoteSvg
) {

    function createVariantTemplate(epicTemplate) {
        return function(variant) {
            return template(epicTemplate, {
                membershipUrl: variant.membershipURL,
                contributionUrl: variant.contributeURL,
                componentName: variant.componentName,
                quoteSvg: quoteSvg.markup
            })
        }
    }

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicTestimonials',
        campaignId: 'kr1_epic_testimonials',

        start: '2017-05-02',
        expiry: '2017-05-10', // Wednesday

        author: 'Guy Dawson',
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
