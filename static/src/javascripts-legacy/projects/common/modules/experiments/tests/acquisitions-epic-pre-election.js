define([
    'lodash/utilities/template',
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-testimonials.html',
    'raw-loader!common/views/acquisitions-epic-equal-buttons.html',
    'svgs/icon/quote.svg'
], function (
    template,
    contributionsUtilities,
    acquisitionsEpicTestimonialsTemplate,
    acquisitionsEpicEqualButtonsTemplate,
    quoteSvg
) {

    function greatBritainLocationCheck() {
        return function(userCountry) {
            return userCountry === 'GB';
        }
    }


    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicPreElection',
        campaignId: 'epic_pre_election',

        start: '2017-05-23',
        expiry: '2017-06-13',

        author: 'Jonathan Rankin',
        description: 'Test 2 variants centered around the upcoming election',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We are able to determine which message has a higher conversion rate',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        variants: [
            {
                id: 'control',
                locationCheck: greatBritainLocationCheck
            },
            {
                id: 'testimonial',
                template: function(variant) {
                    return template(acquisitionsEpicTestimonialsTemplate, {
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName,
                        quoteSvg: quoteSvg.markup,
                        testimonialMessage: 'Some quote.',
                        testimonialName: 'Some quote.'
                    })
                },
                locationCheck: greatBritainLocationCheck
            },
            {
                id: 'election',
                template:  function(variant) {
                    template(acquisitionsEpicEqualButtonsTemplate, {
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName,
                        p1: 'Something',
                        p2: 'Something else',
                        p3: 'More stuff',
                        cta1: 'Become a supporter',
                        cta2: 'Make a contribution'
                    })
                },
                locationCheck: greatBritainLocationCheck
            }
        ]
    });
});
