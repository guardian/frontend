// @flow
import { getCookie } from 'lib/cookies';

export const commercialConsentGlobalNoScroll: ABTest = {
    id: 'CommercialConsentGlobalNoScroll',
    start: '2019-04-24',
    expiry: '2019-05-24',
    author: 'George Haberis',
    description:
        'Test the consent banner on non-EEA users with & without the ability to scroll underlying content through the banner on mobile',
    audience: 0.02,
    audienceOffset: 0.1,
    successMeasure: 'Users outside of the EU interact with the consent banner',
    audienceCriteria: 'all users',
    dataLinkNames: '',
    idealOutcome:
        'More non-EEA users interact with the consent banner when we prevent the ability to scroll underlying content through the banner on mobile',
    canRun: () =>
        (getCookie('GU_geo_continent') || 'OTHER').toUpperCase() !== 'EU',
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'scrollVariant',
            test: (): void => {},
        },
        {
            id: 'noScrollVariant',
            test: (): void => {},
        },
    ],
};
