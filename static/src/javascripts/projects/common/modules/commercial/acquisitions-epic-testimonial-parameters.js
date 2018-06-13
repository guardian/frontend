// @flow

export type AcquisitionsEpicTestimonialTemplateParameters = {
    testimonialMessage: string,
    testimonialName: string,
};

const controlMessage =
    'I appreciate there not being a paywall: it is more democratic for the media to be available for all and not a commodity to be purchased by a few. I’m happy to make a contribution so others with less means still have access to information.';
const controlName = 'Thomasine, Sweden';

export const control: AcquisitionsEpicTestimonialTemplateParameters = {
    testimonialMessage: controlMessage,
    testimonialName: controlName,
};
