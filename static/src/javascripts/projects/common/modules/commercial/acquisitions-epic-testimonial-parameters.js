// @flow
import quoteSvg from 'svgs/icon/quote.svg';

// @flow

export type AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: string,
    testimonialMessage: string,
    testimonialName: string,
};

// control
const controlQuoteSvg = quoteSvg.markup;

const controlMessage =
    'I appreciate there not being a paywall: it is more democratic for the media to be available for all and not a commodity to be purchased by a few. I’m happy to make a contribution so others with less means still have access to information.';
const controlName = 'Thomasine F-R.';

const usLocalisedMessage =
    'I made a contribution to the Guardian today because I believe our country, the US, is in peril and we need quality independent journalism more than ever. Reading news from websites like this helps me keep some sense of sanity and provides a bit of hope in these dangerous, alarming times. Keep up the good work! I appreciate you.';
const usLocalisedName = 'Charru B.';

const cycle1: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage:
        'It is a paper I trust. It provides reasoned argument. It keeps alive the imperative of a social conscience. It ‘makes my day’.',
    testimonialName: 'Robert C, Kosovo',
};

const cycle2: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage:
        'I’ve been enjoying the Guardian’s top-quality journalism for several years now. Today, when so much seems to be going wrong in the world, the Guardian is working hard to confront and challenge those in power. I want to support that.',
    testimonialName: 'Robb H, Canada',
};

const cycle3: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage:
        'The Guardian kept me informed on the 2017 UK general election night (as on so many occasions). We are at such a significant, uncertain time, worldwide. I want the Guardian to continue to reflect that, respond to and question it.',
    testimonialName: 'Susan A, UK',
};

const cycle4: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage:
        'High-quality journalism is essential intellectual nourishment. The generosity of providing such a service without a paywall deserves recognition and support.',
    testimonialName: 'Giacomo P, Italy',
};

const cycle5: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage:
        'In these times, it is imperative to have an independent newspaper that allows us to understand what is going on around us. The Guardian is an absolute necessity.',
    testimonialName: 'Delphine M, Mexico',
};

const cycle6: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage:
        'I benefit from the Guardian’s high-quality website every day and would like its investigative and trustworthy journalism to remain available to everyone freely.',
    testimonialName: 'Alice S-L, Netherlands',
};

const cycle7: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage:
        'Unrivalled, in-depth journalism that has become essential to me. Incredible coverage of my homeland news with an eye I hardly find in the local media. Time has come for me to support.',
    testimonialName: 'Roland P, France',
};

const cycle8: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage:
        'I’m a 19 year old student disillusioned by an unequal society with a government that has stopped even pretending to work in my generation’s interests. So for the strength of our democracy, for the voice of the young, for a credible independent check on the government, this donation was pretty good value for money.',
    testimonialName: 'Jack H, UK',
};

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

export const testimonialCycleGroup: AcquisitionsEpicTestimonialTemplateParameters[] = [
    cycle1,
    cycle2,
    cycle3,
    cycle4,
    cycle5,
    cycle6,
    cycle7,
    cycle8,
];
