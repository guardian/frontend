// @flow

import timeout from 'lib/timeout';

import { addSlot } from 'commercial/modules/dfp/add-slot';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import {
    insertAtSubmeta,
    reportEpicError,
} from 'common/modules/commercial/epic-utils';

import type { EpicComponent } from 'common/modules/commercial/epic-utils';

const createEpicAdSlot = (): HTMLDivElement => {
    const adSlots = createSlots('epic', {});
    return ((adSlots[0]: any): HTMLDivElement);
};

// This function is a WIP.
// Regarding the componentEvent field of the returned EpicComponent,
// currently it is hard coded, since it is only used to render a DFP epic in the AcquisitionsEpicNativeVsDfpV2 test.
// It can be made more generic in a couple of ways; either:
// - delegate the submission of the component events to the iframe (so just remove the component event field); or
// - obtain component event data from iframe via a message between windows
const renderEpicSlot = (epicSlot: HTMLDivElement): Promise<EpicComponent> => {
    addSlot(epicSlot, true);

    // Putting a listener on mediator for modules:commercial:dfp:rendered didn't work (?)
    const renderedEpic = new Promise(resolve => {
        window.googletag.cmd.push(() => {
            window.googletag
                .pubads()
                .addEventListener('slotRenderEnded', event => {
                    if (event.slot.getSlotElementId() === 'dfp-ad--epic') {
                        resolve(epicSlot);
                    }
                });
        });
    });

    return renderedEpic.then(epic => ({
        html: epic,
        componentEvent: {
            component: {
                componentType: 'ACQUISITIONS_EPIC',
                id: 'gdnwb_copts_memco_epic_native_vs_dfp_v3_dfp',
            },
            abTest: {
                name: 'AcquisitionsEpicNativeVsDfpV3',
                variant: 'dfp',
            },
        },
    }));
};

const renderEpicSlotWithTimeout = (
    epic: HTMLDivElement,
    duration: number
): Promise<EpicComponent> =>
    timeout(duration, renderEpicSlot(epic)).catch(err => {
        epic.remove();
        const error = new Error(
            `DFP epic slot wasn't rendered within ${duration} milliseconds: ${err}`
        );
        reportEpicError(error);
        return Promise.reject(error);
    });

export const displayDFPEpic = (duration: number): Promise<EpicComponent> => {
    const epicAdSlot = createEpicAdSlot();
    return insertAtSubmeta(epicAdSlot).then(() =>
        renderEpicSlotWithTimeout(epicAdSlot, duration)
    );
};
