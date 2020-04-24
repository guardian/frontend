// @flow strict
import once from 'lodash/once';
import { isBreakpoint } from 'lib/detect';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const currentGeoLocation = once((): string => geolocationGetSync());
const isInUkRegion = (): boolean => currentGeoLocation() === 'GB';
const isInUsRegion = (): boolean => ['US', 'CA'].includes(currentGeoLocation());
const isInAuRegion = (): boolean => ['AU', 'NZ'].includes(currentGeoLocation());
const isInRowRegion = (): boolean =>
    !isInUkRegion() && !isInUsRegion() && !isInAuRegion();

export const commercialUkRowMobileSticky: ABTest = {
    id: 'CommercialUkRowMobileSticky',
    start: '2020-04-15',
    expiry: '2020-10-01',
    author: 'George Haberis',
    description: 'Test mobile sticky ad in UK and ROW regions',
    audience: 0.01,
    audienceOffset: 0.8, // To avoid clashes with other tests and the results on this AB test are already very sensitive to outside factors
    successMeasure:
        'No significant impact to performance as well as higher ad yield',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome:
        'No significant impact to performance as well as higher ad yield',
    showForSensitive: true,
    canRun: () =>
        (isInUkRegion() || isInRowRegion()) &&
        isBreakpoint({ min: 'mobile', max: 'mobileLandscape' }),
    variants: [
        {
            id: 'ukControl',
            test: (): void => {},
            canRun: (): boolean => isInUkRegion(),
        },
        {
            id: 'rowControl',
            test: (): void => {},
            canRun: (): boolean => isInRowRegion(),
        },
        {
            id: 'ukVariant',
            test: (): void => {},
            canRun: (): boolean => isInUkRegion(),
        },
        {
            id: 'rowVariant',
            test: (): void => {},
            canRun: (): boolean => isInRowRegion(),
        },
    ],
};
