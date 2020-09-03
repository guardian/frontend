// @flow

import { fetchAndRenderEpic } from 'common/modules/commercial/contributions-service';

const id = 'RemoteEpicVariants';

const remoteVariant: Variant = {
    id: 'remote',
    test: (): void => {
        fetchAndRenderEpic(id);
    },
    canRun: () => true,
};

export const remoteEpicVariants: Runnable<AcquisitionsABTest> = {
    id,
    start: '2020-05-01',
    expiry: '2020-09-08',
    author: 'Nicolas Long',
    description:
        'Pseudo-test to use remote service for % of contribution epics. Expected to run as highest priority test; the canRun will then narrow the audience.',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'Revenue/impressions equivalent to local variants',
    audienceCriteria: 'All',
    variants: [remoteVariant],
    canRun: () => Math.random() < 0.2, // set test % here
    variantToRun: remoteVariant,
    showForSensitive: true, // there is special targeting logic around this so we don't set to false here

    // required for AcquisitionsABTest interface, so use dummy values
    campaignId: 'remote-epic-variants-fake-campaign-id',
    componentType: 'ACQUISITIONS_EPIC',
    geolocation: undefined,
};
