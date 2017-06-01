define([
    'lodash/utilities/template',
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-testimonials.html',
    'raw-loader!common/views/acquisitions-epic-test-template.html',
    'svgs/icon/quote.svg'
], function (
    template,
    contributionsUtilities,
    acquisitionsEpicTestimonialsTemplate,
    acquisitionsEpicTestTemplate,
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
        audience: 0.5,
        audienceOffset: 0.5,

        variants: [
            {
                id: 'control'
            },
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
            },
            {
                id: 'election',
                template:  function(variant) {
                    return template(acquisitionsEpicTestTemplate, {
                        title: 'Since you’re here &hellip;',
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName,
                        p1: '&hellip; we have a small favour to ask. Whoever wins the UK election, we promise to hold them to account with facts you can trust and opinions you can believe in. But advertising revenues are falling and <span class="contributions__highlight">unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can</span>. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                        p3: '',
                        cta1: 'Become a supporter',
                        cta2: 'Make a contribution'
                    })
                }
            }
        ]
    });
});
