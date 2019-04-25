// @flow
import { getCookie } from 'lib/cookies';

export const commercialConsentGlobalTallBanner: ABTest = {
    id: 'CommercialConsentGlobalTallBanner',
    start: '2019-04-24',
    expiry: '2019-05-24',
    author: 'George Haberis',
    description:
        'Test whether increasing the height of the consent banner on non-EEA users increases proportion of users who interact with it',
    audience: 0.02,
    audienceOffset: 0.1,
    successMeasure: 'Users outside of the EU interact with the consent banner',
    audienceCriteria: 'all users',
    dataLinkNames: '',
    idealOutcome:
        'More non-EEA users interact with the consent banner when we increase the height of the banner',
    canRun: () =>
        (getCookie('GU_geo_continent') || 'OTHER').toUpperCase() !== 'EU',
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'shortVariant',
            test: (): void => {},
        },
        {
            id: 'tallVariant',
            test: (): void => {},
        },
    ],
};
