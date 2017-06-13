// @flow
import quoteSvg from 'svgs/icon/quote.svg';

// @flow

type AcquisitionsEpicTestimonialTemplateParameters = {
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
