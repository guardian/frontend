export const remoteRRHeaderLinksTest = {
    id: 'RemoteRrHeaderLinksTest',
    start: '2021-04-15',
    expiry: '2021-12-01',
    author: 'Tom Forbes',
    description:
        'Use the dotcom-components service for serving the Reader Revenue header links',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV is not worse',
    audienceCriteria:
        'all pageviews',
    dataLinkNames: 'RRHeaderLinks',
    idealOutcome:
        'AV is not worse',
    showForSensitive: true,
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: () => {},
        },
        {
            id: 'remote',
            test: () => {},
        },
    ],
};
