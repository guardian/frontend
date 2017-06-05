define([
    'lodash/utilities/template',
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-testimonials.html',
    'svgs/icon/quote.svg'
], function (
    template,
    contributionsUtilities,
    acquisitionsEpicTestimonialsTemplate,
    quoteSvg
) {



    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicPreElection',
        campaignId: 'epic_pre_election',

        start: '2017-05-23',
        expiry: '2017-06-13',

        author: 'Jonathan Rankin',
        description: 'Test 2 variants centered around the upcoming election',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We are able to determine which message has a higher conversion rate',
        locations: ['GB'],
        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        variants: [
            {
                id: 'testimonial',
                template: function(variant) {
                    return template(acquisitionsEpicTestimonialsTemplate, {
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName,
                        quoteSvg: quoteSvg.markup,
                        p1: '&hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And <span class="contributions__highlight">unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can</span>. So you can see why we need to ask for your help, especially during this UK election.',
                        testimonialMessage: 'I’m a 19 year old student disillusioned by an unequal society with a government that has stopped even pretending to work in my generation’s interests. So for the strength of our democracy, for the voice of the young, for a credible, independent check on the government, this contribution was pretty good value for money.',
                        testimonialName: 'Jack H.'
                    })
                }
            }
        ]
    });
});
