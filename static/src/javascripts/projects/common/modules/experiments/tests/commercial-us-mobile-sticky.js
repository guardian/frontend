// @flow strict
import { getCookie } from 'lib/cookies';
import { isBreakpoint } from 'lib/detect';

export const commercialUsMobileSticky: ABTest = {
    id: 'CommercialUsMobileSticky',
    start: '2019-06-11',
    expiry: '2019-09-30',
    author: 'Ricardo Costa',
    description: 'This test runs the new US mobile sticky ad slot',
    audience: 0.2,
    audienceOffset: 0.8, // To avoid clashes with other tests and the results on this AB test are already very sensitive to outside factors
    successMeasure: 'How good it runs and looks to the user.',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome:
        'No significant impact to performance as well as higher ad yield',
    canRun: () =>
        (getCookie('GU_geo_continent') || 'OTHER').toUpperCase() === 'NA' &&
        isBreakpoint({ min: 'mobile', max: 'mobileLandscape' }),
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
