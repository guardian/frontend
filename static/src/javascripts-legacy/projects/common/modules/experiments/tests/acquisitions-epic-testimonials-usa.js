define([
    'lib/config',
    'lodash/utilities/template',
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-testimonials.html',
    'svgs/icon/quote.svg'
], function (
    config,
    template,
    contributionsUtilities,
    acquisitionsEpicTestimonials,
    quoteSvg
) {
    var defaultIntro = '&hellip; we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And <span class="contributions__highlight">unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can</span>. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';

    function createTestimonialTemplate(testimonialInfo) {
        return function(variant) {
            return template(acquisitionsEpicTestimonials, {
                membershipUrl: variant.options.membershipURL,
                contributionUrl: variant.options.contributeURL,
                componentName: variant.options.componentName,
                p1: testimonialInfo.intro || defaultIntro,
                quoteSvg: quoteSvg.markup,
                testimonialMessage: testimonialInfo.message,
                testimonialName: testimonialInfo.name,
                additionalSentence: testimonialInfo.additionalSentence || '',
                epicClass: 'contributions__epic--testimonial-usa',
                citeImage: testimonialInfo.citeImage
            })
        }
    }

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
                template: createTestimonialTemplate({
                    message: 'Because I appreciate there not being a paywall: it is more democratic for the media to be available for all and not a commodity to be purchased by a few. I’m happy to make a contribution so others with less means still have access to information.',
                    name: 'Thomasine F-R'
                })
            },
            {
                id: 'localised',
                template: createTestimonialTemplate({
                    message: 'I made a contribution to the Guardian today because I believe our country, the US, is in peril and we need quality independent journalism more than ever. Reading news from websites like this helps me keep some sense of sanity and provides a bit of hope in these dangerous, alarming times. Keep up the good work! I appreciate you.',
                    name: 'Charru B'
                })
            },
            {
                id: 'localised_flag',
                template: createTestimonialTemplate({
                    intro: defaultIntro + ' Here’s why other <strong>readers from the US</strong> are supporting us:',
                    message: 'I made a contribution to the Guardian today because I believe our country, the US, is in peril and we need quality independent journalism more than ever. Reading news from websites like this helps me keep some sense of sanity and provides a bit of hope in these dangerous, alarming times. Keep up the good work! I appreciate you.',
                    name: 'Charru B',
                    citeImage: (function() {
                        try { return config.images.acquisitions['usa-flag']; }
                        catch(e) { return; }
                    })()
                })
            }
        ]
    });
});
