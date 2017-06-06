define([
    'lib/config',
    'lodash/utilities/template',
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-control.html',
    'common/modules/commercial/acquisitions-epic-testimonial-parameters',
    'common/modules/commercial/acquisitions-copy'

], function (
    config,
    template,
    contributionsUtilities,
    acquisitionsEpicControlTemplate,
    acquisitionsTestimonialParameters,
    acquisitionsCopy

) {
    function createTestimonialTestTemplate(testimonialBlock, copy) {
        return function(variant) {
            return template(acquisitionsEpicControlTemplate, {
                copy: copy,
                membershipUrl: variant.options.membershipURL,
                contributionUrl: variant.options.contributeURL,
                componentName: variant.options.componentName,
                testimonialBlock: testimonialBlock,
                epicClass: 'contributions__epic--testimonial-usa'
            })
        }
    }

    var citeImage = (function() {
        try { return config.images.acquisitions['usa-flag']; }
        catch(e) { return; }
    })();

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicTestimonialsUsa',
        campaignId: 'kr1_epic_testimonials_usa',

        start: '2017-05-24',
        expiry: '2017-06-26',

        author: 'Sam Desborough',
        description: 'Test localisation of testimonials in the Epic',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We are able to determine the influence of localisation on testimonials',

        locations: ['US'],

        audienceCriteria: 'US',
        audience: 0.5,
        audienceOffset: 0.5,

        variants: [
            {
                id: 'control',
                template: createTestimonialTestTemplate(contributionsUtilities.getTestimonialBlock(acquisitionsTestimonialParameters.control), acquisitionsCopy.control)
            },
            {
                id: 'localised',
                template: createTestimonialTestTemplate(contributionsUtilities.getTestimonialBlock(acquisitionsTestimonialParameters.usLocalised), acquisitionsCopy.control)
            },
            {
                id: 'localised_flag',
                template: createTestimonialTestTemplate(contributionsUtilities.getTestimonialBlock(acquisitionsTestimonialParameters.usLocalised, citeImage), acquisitionsCopy.usLocalisedFlag, citeImage)
            }
        ]
    });
});
