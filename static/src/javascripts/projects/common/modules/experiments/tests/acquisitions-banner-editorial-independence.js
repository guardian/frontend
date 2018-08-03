// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';

const componentType = 'ACQUISITIONS_ENGAGEMENT_BANNER';
const abTestName = 'AcquisitionsBannerEditorialIndependence';

const engagementBannerCopyTest = (): string =>
    `<strong>The Guardian is editorially independent &ndash; our journalism is free from the influence of billionaire owners or politicians. No one edits our editor. No one steers our opinion.
    </strong> And unlike many others, we haven’t put up a paywall as we want to keep our journalism open and accessible. But the revenue we get from advertising is falling, so we increasingly need our readers to fund our independent, investigative reporting.`;

export const AcquisitionsBannerEditorialIndependence: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    start: '2018-08-06',
    expiry: '2018-09-06',
    author: 'Emma Milner',
    description:
        'Tests a banner message that highlights editorial independence',
    audience: 1,
    audienceOffset: 0,
    audienceCriteria: 'All web traffic.',
    successMeasure: 'AV 2.0',
    idealOutcome: 'Increase in overall AV, and AV from recurring',
    componentType,
    showForSensitive: true,
    canRun: () => true,

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: 'editorial-independence',
            options: {
                engagementBannerParams: {
                    messageText: engagementBannerCopyTest(),
                },
            },
        },
    ]),
};
