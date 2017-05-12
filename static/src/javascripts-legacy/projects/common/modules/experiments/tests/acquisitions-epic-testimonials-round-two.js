define([
    'lodash/utilities/template',
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-testimonials.html',
    'svg-loader!svgs/icon/quote.svg'
], function (
    template,
    contributionsUtilities,
    acquisitionsEpicTestimonials,
    quoteSvg
) {

    function createTestimonialTemplate(epicTemplate, testimonialInfo) {
        return function(variant) {
            return template(epicTemplate, {
                membershipUrl: variant.membershipURL,
                contributionUrl: variant.contributeURL,
                componentName: variant.componentName,
                quoteSvg: quoteSvg.markup,
                testimonialMessage: testimonialInfo.message,
                testimonialName: testimonialInfo.name
            })
        }
    }

    var testimonialsInfo = {
        control: {
            message: 'I read it fairly often and enjoy the variety of news and entertainment content. It never occurred to me that you wanted contributions, but I’d like you to stick around. Sometimes you actually have to pay for stuff you like. Go figure.',
            name: 'Mike L'
        },
        paywall: {
            message: 'Because I appreciate there not being a paywall: it is more democratic for the media to be available for all and not a commodity to be purchased by a few. I’m happy to make a contribution so others with less means still have access to information.',
            name: 'Thomasine F-R'
        },
        vanilla: {
            message: 'I respect and appreciate the quality of your reportage: the in-depth research it represents, its absence of ideology, and its broad view. It is excellent journalism. We need truth in our news today.',
            name: 'Winifred L'
        }
    };

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicTestimonialsRoundTwo',
        campaignId: 'kr1_epic_testimonials_round_two',

        start: '2017-05-12',
        expiry: '2017-06-13',

        author: 'Jonathan Rankin',
        description: 'Test placing reader testimonials in the Epic (round 2)',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We are able to determine which testimonial design is the best',

        audienceCriteria: 'All',
        audience: 0.5,
        audienceOffset: 0,

        variants: [
            {
                id: 'control',
                template: createTestimonialTemplate(acquisitionsEpicTestimonials, testimonialsInfo.control)
            },
            {
                id: 'paywall',
                template: createTestimonialTemplate(acquisitionsEpicTestimonials, testimonialsInfo.paywall)
            },
            {
                id: 'vanilla',
                template: createTestimonialTemplate(acquisitionsEpicTestimonials, testimonialsInfo.vanilla)
            }
        ]
    });
});
