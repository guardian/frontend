// @flow
import { getCookie } from 'lib/cookies';

export const commercialConsentGlobalBanner: ABTest = {
    id: 'CommercialConsentGlobalBanner',
    start: '2019-05-01',
    expiry: '2019-06-03',
    author: 'George Haberis',
    description:
        'Test whether changes to Consent Banner increases proportion of non-EU users who interact with it',
    audience: 0.03,
    audienceOffset: 0.1,
    successMeasure: 'Users outside of the EU interact with the consent banner',
    audienceCriteria: 'all users',
    dataLinkNames: '',
    idealOutcome:
        'Fewer non-EEA users ignore the altered banner, which reduces the number of pageviews with unset conset',
    canRun: () =>
        (getCookie('GU_geo_continent') || 'OTHER').toUpperCase() !== 'EU',
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'regularVariant',
            test: (): void => {},
        },
        {
            id: 'noScrollVariant',
            test: (): void => {},
        },
        {
            id: 'tallVariant',
            test: (): void => {},
        },
        {
            id: 'animationVariant',
            test: (): void => {},
        },
        {
            id: 'floatingVariant',
            test: (): void => {},
        },
    ],
};
