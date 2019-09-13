// @flow strict

export const commercialInline1BeforeHeadings: ABTest = {
    id: 'CommercialInline1BeforeHeadings',
    start: '2019-07-30',
    expiry: '2020-07-30',
    author: 'Ioanna Kyprianou',
    description: 'Test inline1 ads to be placed above h2 headings',
    audience: 0.01,
    audienceOffset: 0.0,
    successMeasure: 'We can see inline1 ads in desktop and top-above-nav in mobiles, before headings',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome:
        'No significant impact to performance as well as higher ad yield',
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
