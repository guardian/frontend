// @flow
import config from 'lib/config';

export const commercialLazyLoading: ABTest = {
    id: 'CommercialLazyLoading',
    start: '2018-02-16',
    expiry: '2018-03-30',
    author: 'Jon Norman',
    description:
        'This test alters the threshold for when lazy loaded adverts are displayed',
    audience: 0.24,
    audienceOffset: 0.7,
    successMeasure:
        'No negative impact on viewability, positive impact in number of impressions rendered.',
    audienceCriteria: 'All web traffic.',
    dataLinkNames: '',
    idealOutcome:
        'We find an optimised method for determining when ad slots should be rendered',
    canRun: () =>
        !config.get('tests.commercialBaselineControl') &&
        !config.get('tests.commercialBaselineVariant'),
    variants: [
        {
            id: 'control',
            test: () => {},
        },
        {
            id: '400px',
            test: () => {},
        },
        {
            id: '1vh',
            test: () => {},
        },
        {
            id: '0.5vh',
            test: () => {},
        },
        {
            id: 'richard',
            test: () => {},
        },
        {
            id: 'super-richard',
            test: () => {},
        },
    ],
};
