// @flow
const noop = () => {};

export const SnippetFourVariants = {
    id: 'SnippetFourVariants',
    start: '2017-09-05',
    expiry: '2018-10-06',
    author: 'Regis Kuckaertz',
    description: 'Measure open rate based on snippet design',
    audience: 0.4,
    audienceOffset: 0,
    successMeasure: 'We measure open rates across the four variants',
    audienceCriteria: '',
    showForSensitive: true,
    canRun() {
        return !!document.querySelector('.explainer-snippet--new');
    },

    variants: [
        {
            id: 'control',
            test: noop,
        },
        {
            id: 'b',
            test: noop,
        },
        {
            id: 'a1',
            test: noop,
        },
        {
            id: 'b1',
            test: noop,
        },
    ],
};
