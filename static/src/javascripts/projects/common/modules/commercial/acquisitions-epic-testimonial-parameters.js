// @flow
import config from 'lib/config';
import quoteSvg from 'svgs/icon/quote.svg';

// @flow

export type AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: string,
    testimonialMessage: string,
    testimonialName: string,
    citeImageUrl?: ?string,
};

const flagURL = (name: string): ?string => {
    try {
        return config.images.acquisitions.flags[name];
    } catch (e) {
        return null;
    }
};

// control
const controlQuoteSvg = quoteSvg.markup;

const controlMessage =
    'I appreciate there not being a paywall: it is more democratic for the media to be available for all and not a commodity to be purchased by a few. I’m happy to make a contribution so others with less means still have access to information.';
const controlName = 'Thomasine F-R.';

const usLocalisedMessage =
    'I made a contribution to the Guardian today because I believe our country, the US, is in peril and we need quality independent journalism more than ever. Reading news from websites like this helps me keep some sense of sanity and provides a bit of hope in these dangerous, alarming times. Keep up the good work! I appreciate you.';
const usLocalisedName = 'Charru B.';

// Multiple testimonials (Oct 2017 test)
export const multiple: Array<AcquisitionsEpicTestimonialTemplateParameters> = [
    {
        quoteSvg: controlQuoteSvg,
        testimonialMessage:
            'I want to support free, independent journalism and to help you keep it open to everyone, without a paywall. Universal access to quality news is so important.',
        testimonialName: 'Justin P',
        citeImageUrl: flagURL('uk'),
    },

    {
        quoteSvg: controlQuoteSvg,
        testimonialMessage:
            'The Guardian provides honest journalism, with integrity and passion. That’s rare and needs to be cherished and protected. It’s worth every penny spent, now more than ever. Independent journalism seems to be, sadly, a rare thing.',
        testimonialName: 'Mark H',
        citeImageUrl: flagURL('nz'),
    },

    {
        quoteSvg: controlQuoteSvg,
        testimonialMessage:
            'I benefit from the high-quality website everyday and would like its investigative and trustworthy journalism to remain available to everyone freely.',
        testimonialName: 'Alice S-L',
        citeImageUrl: flagURL('nl'),
    },

    {
        quoteSvg: controlQuoteSvg,
        testimonialMessage:
            'A contribution was long overdue since I am a very regular reader of your newspaper. Quality is a scarce commodity in the media these days and I thought I should finally honour yours.',
        testimonialName: 'Patrick',
        citeImageUrl: flagURL('be'),
    },
];

export const control: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage: controlMessage,
    testimonialName: controlName,
};

export const usLocalised: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage: usLocalisedMessage,
    testimonialName: usLocalisedName,
};
