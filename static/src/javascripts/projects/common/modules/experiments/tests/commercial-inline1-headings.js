// @flow strict
import { isBreakpoint } from 'lib/detect';

export const commercialInline1Headings: ABTest = {
    id: 'CommercialInline1Headings',
    start: '2019-09-13',
    expiry: '2020-07-30',
    author: 'Ioanna Kyprianou',
    description: 'Test inline1 ads to not be placed right after h2 headings',
    audience: 0.01,
    audienceOffset: 0.0,
    successMeasure: 'We can see inline1 ads in desktop between paragraphs',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome:
        'No significant impact to performance as well as higher ad yield',
    showForSensitive: true,
    canRun: () => isBreakpoint({ min: 'desktop' }),
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
