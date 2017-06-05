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

const usLocalisedMessage =
    'I made a contribution to the Guardian today because I believe our country, the US, is in peril and we need quality independent journalism more than ever. Reading news from websites like this helps me keep some sense of sanity and provides a bit of hope in these dangerous, alarming times. Keep up the good work! I appreciate you.';
const usLocalisedName = 'Charru B.';

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

export const usLocalised: AcquisitionsEpicTestimonialTemplateParameters = {
    quoteSvg: controlQuoteSvg,
    testimonialMessage: usLocalisedMessage,
    testimonialName: usLocalisedName,
};
