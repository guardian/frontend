// @flow

import timeout from 'lib/timeout';

import { addSlot } from 'commercial/modules/dfp/add-slot';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import { awaitGoogletagCmd } from 'commercial/modules/dfp/googletag-cmd';
import {
    insertEpic,
    reportEpicError,
} from 'common/modules/commercial/epic-utils';

import type { EpicComponent } from 'common/modules/commercial/epic-utils';

export const epicAdSlotId = 'dfp-ad--epic';

const createDFPEpicSlot = (): HTMLDivElement => {
    const adSlots = createSlots('epic', {});
    return ((adSlots[0]: any): HTMLDivElement);
};

// This function is a WIP.
// Regarding the componentEvent field of the returned EpicComponent,
// currently it is hard coded, since it is only used to render a DFP epic in the AcquisitionsEpicNativeVsDfpV2 test.
// It can be made more generic in a couple of ways; either:
// - delegate the submission of the component events to the iframe (so just remove the component event field); or
// - obtain component event data from iframe via a message between windows
const renderEpicSlot = (epic: HTMLDivElement): Promise<EpicComponent> => {
    addSlot(epic, true);

    // Putting a listener on mediator for modules:commercial:dfp:rendered didn't work (?)
    const renderedEpic = new Promise(resolve => {
        awaitGoogletagCmd.then(() => {
            window.googletag.cmd.push(() => {
                window.googletag
                    .pubads()
                    .addEventListener('slotRenderEnded', event => {
                        if (event.slot.getSlotElementId() === epicAdSlotId) {
                            resolve(epic);
                        }
                    });
            });
        });
    });

    return renderedEpic.then(epic => ({
        html: epic,
        componentEvent: {
            component: {
                componentType: 'ACQUISITIONS_EPIC',
                componentId: 'gdnwb_copts_memco_epic_native_vs_dfp_v2_dfp',
            },
            abTest: {
                name: 'AcquisitionsEpicNativeVsDfpV2',
                variant: 'dfp',
            },
        },
    }));
};

export const displayDFPEpic = (duration: number): Promise<EpicComponent> => {
    const epic = createDFPEpicSlot();
    const isEpicInserted = insertEpic(epic);
    if (isEpicInserted) {
        return timeout(duration, renderEpicSlot(epic)).catch(err => {
            epic.remove();
            const error = new Error(
                `DFP epic slot wasn't rendered within ${duration} milliseconds: ${err}`
            );
            reportEpicError(error);
            return Promise.reject(error);
        });
    }
    const error = new Error('unable to insert DFP epic slot');
    reportEpicError(error);
    return Promise.reject(error);
};
