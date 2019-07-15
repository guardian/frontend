// @flow strict
import { getCookie } from 'lib/cookies';
import { isBreakpoint } from 'lib/detect';

export const prebidUsMobileSticky: ABTest = {
    id: 'PrebidUsMobileSticky',
    start: '2019-06-11',
    expiry: '2019-09-30',
    author: 'Ioanna Kyprianou',
    description: 'This asks prebid for a mobile sticky slot 320x50',
    audience: 0.0,
    audienceOffset: 0.0,
    successMeasure:
        'We can see an ad served by prebid for a mobile sticky slot',
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
