// @flow

export const commercialYoutubePfpAdTargeting: ABTest = {
    id: 'CommercialYoutubePfpAdTargeting',
    start: '2019-07-31',
    expiry: '2019-10-01',
    author: 'Adam Fisher',
    description: '0% (opt-in) test of YouTube PfP ad targeting parameters',
    audience: 0,
    audienceOffset: 0,
    successMeasure: 'Commercial perform manual verification of ad targeting',
    audienceCriteria: 'internal',
    dataLinkNames: '',
    idealOutcome:
        'Validate the work commercial have done to setup PfP ad targeting',
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
