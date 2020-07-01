// @flow

import { fetchAndRenderEpic } from "common/modules/commercial/contributions-service";
import { getSync as geolocationGetSync } from 'lib/geolocation';
import config from 'lib/config';

const id = 'RemoteEpicVariants';

const remoteVariant: Variant = {
    id: 'remote',
    test: () => fetchAndRenderEpic(id),
    canRun: () => true,
};

export const remoteEpicVariants: Runnable<AcquisitionsABTest> = {
    id,
    start: '2020-05-01',
    expiry: '2020-07-21',
    author: "Nicolas Long",
    description: "Pseudo-test to use remote service for % of contribution epics. Expected to run as highest priority test; the canRun will then narrow the audience.",
    audience: 1,
    audienceOffset: 0,
    successMeasure: "Revenue/impressions equivalent to local variants",
    audienceCriteria: "All",
    variants: [remoteVariant],
    canRun: () => {
        // Delay geolocation due to known race condition
        // https://github.com/guardian/frontend/pull/22322
        const geolocation = geolocationGetSync();
        console.log('geolocation: ', geolocation);
        return config.get("switches.abRemoteEpicVariants") && geolocation !== 'AU' && Math.random() < 0.01// set test % here
    }

    ,

    variantToRun: remoteVariant,
    showForSensitive: true, // there is special targeting logic around this so we don't set to false here

    // required for AcquisitionsABTest interface, so use dummy values
    campaignId: 'remote-epic-variants-fake-campaign-id',
    componentType: 'ACQUISITIONS_EPIC',
    geolocation: undefined,
};
