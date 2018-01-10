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

export const control: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage: controlMessage,
    testimonialName: controlName,
};
