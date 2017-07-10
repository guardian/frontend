// @flow
import {
    makeABTest,
    getTestimonialBlock,
} from 'common/modules/commercial/contributions-utilities';
import quoteSvg from 'svgs/icon/quote.svg';

const makeTestimonialBlock = (
    quotes: Array<{ message: string, name: string }>
) => {
    const blocks = quotes.map(q =>
        getTestimonialBlock({
            quoteSvg: quoteSvg.markup,
            testimonialMessage: q.message,
            testimonialName: q.name,
        })
    );

    return blocks.join('');
};

export const acquisitionsEpicMultipleTestimonials: ContributionsABTest = makeABTest(
    {
        id: 'AcquisitionsEpicMultipleTestimonials',
        start: '2017-07-10',
        expiry: '2017-08-17',
        author: 'Joseph Smith',

        description:
            'Tests two variants with multiple testimonials against the control epic which has one testimonial',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Acquires many Supporters',

        campaignId: 'epic_multiple_testimonials',

        audienceCriteria: 'All',
        audience: 0.8,
        audienceOffset: 0.1,

        variants: [
            {
                id: 'control',
            },
            {
                id: 'short',
                testimonialBlock: makeTestimonialBlock([
                    {
                        message:
                            'High-quality journalism is essential intellectual nourishment',
                        name: 'Giacomo P, Italy',
                    },
                    {
                        message:
                            'The Guardian is working hard to confront and challenge those in power. I want to support that',
                        name: 'Robb H, Canada',
                    },
                    {
                        message:
                            'I appreciate an alternative to newspapers owned by billionaires. You give me hope',
                        name: 'Fred F, UK',
                    },
                    {
                        message:
                            'I appreciate there not being a paywall: it is more democratic for the media to be available for all',
                        name: 'Thomasine F-R',
                    },
                ]),
            },
            {
                id: 'long',
                testimonialBlock: makeTestimonialBlock([
                    {
                        message:
                            'High quality journalism is essential intellectual nourishment. The generosity of providing such a service without a paywall deserves recognition and support',
                        name: 'Giacomo P, Italy',
                    },
                    {
                        message:
                            'I’ve been enjoying the Guardian’s top-quality journalism for several years now. Today, when so much seems to be going wrong in the world, the Guardian is working hard to confront and challenge those in power. I want to support that',
                        name: 'Robb H, Canada',
                    },
                    {
                        message:
                            'I appreciate there not being a paywall: it is more democratic for the media to be available for all and not a commodity to be purchased by a few. I’m happy to make a contribution so others with less means still have access to information.',
                        name: 'Thomasine F-R',
                    },
                ]),
            },
        ],
    }
);
