// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import type { AdBlockEpicTemplate } from 'common/modules/commercial/contributions-utilities';
import { createSlots } from 'commercial/modules/dfp/create-slots';

// The adblockInUse boolean in detect.js is (necessarily) a promise.
// This does not interact well with the synchronous canRun() function expected by the AB testing framework.
// To mitigate against this, create a function which returns false <=>
// ad blocker is active or it is unresolved whether it is active.
// Since the test running is predicated on this function returning true,
// readers in the test will have ad blocker off,
// but we might not include all readers who have ad blocker off.
const isAdBlockerOff = (): boolean => {
    const isActive = window.guardian.adBlockers.active;
    if (isActive === null || isActive === undefined) {
        return false;
    }
    return !isActive;
};

const adSlotEpicTemplate: AdBlockEpicTemplate = (): HTMLElement => {
    const adSlots = createSlots('epic', {});
    return adSlots[0];
};

export const acquisitionsEpicNativeVsDfp = makeABTest({
    id: 'AcquisitionsEpicNativeVsDfp',
    campaignId: 'epic_native_vs_dfp',
    start: '2018-05-16', // TODO: update
    expiry: '2018-05-25', // TODO: update
    author: 'Guy Dawson',
    description:
        'See if there is any difference in annualised value between serving the Epic natively vs DFP',
    successMeasure: 'AV2.0',
    idealOutcome:
        'There is no difference between these two methods of serving the Epic',
    audienceCriteria: 'All',
    audience: 1, // TODO: update
    audienceOffset: 0, // TODO: update
    canRun: isAdBlockerOff,
    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION'],
            options: {
                isUnlimited: true, // TODO: remove
            },
        },
        {
            id: 'dfp',
            products: ['CONTRIBUTION'],
            options: {
                isUnlimited: true, // TODO: remove
                adSlotEpicTemplate,
            },
        },
    ],
});
