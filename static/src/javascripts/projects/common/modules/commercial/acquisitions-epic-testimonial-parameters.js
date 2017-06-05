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
    'Because I appreciate there not being a paywall: it is more democratic for the media to be available for all and not a commodity to be purchased by a few. I’m happy to make a contribution so others with less means still have access to information.';
const controlName = 'Thomasine F-R.';

const gbControlMessage =
    'I’m a 19 year old student disillusioned by an unequal society with a government that has stopped even pretending to work in my generation’s interests. So for the strength of our democracy, for the voice of the young, for a credible, independent check on the government, this contribution was pretty good value for money.';
const gbControlName = 'Jack H.';

export const control: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage: controlMessage,
    testimonialName: controlName,
};

export const controlGB: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage: gbControlMessage,
    testimonialName: gbControlName,
};
