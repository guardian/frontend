// @flow strict

import { shouldShow } from '@guardian/consent-management-platform';

export const commercialCmpCopy: ABTest = {
    id: 'CommercialCmpCopy',
    start: '2020-04-20',
    expiry: '2020-05-4',
    author: 'Alex Sanders',
    description: '5% a/b test for new CMP copy',
    audience: 0.05,
    audienceOffset: 0.0,
    successMeasure: 'Consent rates do not drop',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Consent rates do not drop',
    canRun: shouldShow,
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
