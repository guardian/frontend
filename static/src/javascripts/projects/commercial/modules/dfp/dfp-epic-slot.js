// @flow

import timeout from 'lib/timeout';

import { addSlot } from 'commercial/modules/dfp/add-slot';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import { awaitGoogletagCmd } from 'commercial/modules/dfp/googletag-cmd';
import { insertEpic } from 'common/modules/commercial/epic-utils';

import type { EpicComponent } from 'common/modules/commercial/epic-utils';

export const epicAdSlotId = 'dfp-ad--epic';

const createDFPEpicSlot = (): HTMLDivElement => {
    const adSlots = createSlots('epic', {});
    return adSlots[0]; // FIXME
};

// TODO
const getDFPEpicComponentId = (): Promise<string> => {
    return Promise.resolve('mock_component_id');
};

const renderEpicSlot = (epic: HTMLDivElement): Promise<EpicComponent> => {
    addSlot(epic, true);
    // Putting a listener on mediator for modules:commercial:dfp:rendered didn't work (?)
    const renderedEpic = new Promise(resolve => {
        awaitGoogletagCmd.then(() => {
            window.googletag.cmd.push(() => {
                window.googletag.pubads().addEventListener('slotRenderEnded', event => {
                    if (event.slot.getSlotElementId() === epicAdSlotId) {
                        resolve(epic);
                    }
                });
            });
        });
    });
    const epicComponentId = getDFPEpicComponentId();
    return Promise.all([renderedEpic, epicComponentId]).then(arr => {
        return {
            html: arr[0],
            component: {
                componentType: 'ACQUISITIONS_EPIC',
                componentId: arr[1],
            }
        }
    });
};

export const displayDFPEpic = (duration: number): Promise<EpicComponent> => {
    const epic = createDFPEpicSlot();
    const isEpicInserted = insertEpic(epic);
    if (isEpicInserted) {
        return timeout(duration, renderEpicSlot(epic)).catch(err => {
            epic.remove();
            return Promise.reject('DFP epic slot wasn\'t rendered within ' + duration + ' milliseconds: ' + err);
        })
    } else {
        return Promise.reject(new Error('unable to insert DFP epic slot'));
    }
};
