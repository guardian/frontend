// @flow
import { getCookie } from 'lib/cookies';

export const commercialConsentModalBanner: ABTest = {
    id: 'CommercialConsentModalBanner',
    start: '2019-05-28',
    expiry: '2019-06-28',
    author: 'George Haberis',
    description:
        'Test whether presenting a modal Consent Banner increases proportion of US users who interact with it',
    audience: 0.03,
    audienceOffset: 0.1,
    successMeasure: 'US Users interact with the consent banner',
    audienceCriteria: 'all users',
    dataLinkNames: '',
    idealOutcome:
        'Fewer US users ignore the modal banner, which reduces the number of pageviews with unset conset',
    // canRun: () => (getCookie('GU_geo_continent') || '').toUpperCase() === 'US',
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'dismissableVariant',
            test: (): void => {},
        },
        {
            id: 'nonDismissableVariant',
            test: (): void => {},
        },
    ],
};
