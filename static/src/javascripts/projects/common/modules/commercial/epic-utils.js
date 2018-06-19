// @flow

import $ from 'lib/$';
import { control as epicControlCopy } from 'common/modules/commercial/acquisitions-copy';
import { addTrackingCodesToUrl } from 'common/modules/commercial/acquisitions-ophan';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import { acquisitionsTestimonialBlockTemplate } from 'common/modules/commercial/templates/acquisitions-epic-testimonial-block';
import { control as epicTestimonialControlParameters } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';
import { supportContributeURL } from 'common/modules/commercial/support-utilities';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { elementInView } from 'lib/element-inview';
import { submitInsertEvent, submitViewEvent } from 'common/modules/commercial/acquisitions-ophan';

export type EpicComponent = {
    html: HTMLDivElement,
    component: OphanComponent,
}

export const controlEpicComponent = (): EpicComponent => {
    const epicId = 'epic_control';
    const epicComponentType = 'ACQUISITIONS_EPIC';
    const rawEpic =  acquisitionsEpicControlTemplate({
        copy: epicControlCopy,
        componentName: '', // TODO: confirm data-component not needed
        buttonTemplate: epicButtonsTemplate({
            supportUrl: addTrackingCodesToUrl({
                base: supportContributeURL,
                componentType: epicComponentType,
                componentId: epicId, // TODO: check ok to use this
            })
        }),
        testimonialBlock: acquisitionsTestimonialBlockTemplate(epicTestimonialControlParameters),
        epicClass: '',
        wrapperClass: '',
    });
    const epic = $.create(rawEpic).get(0);
    return {
        html: epic,
        component: {
            componentType: epicComponentType,
            id: epicId,
        },
    };
};

export const insertEpic = (epic: HTMLDivElement): boolean => {
    const element = document.querySelector('.submeta');
    if (element && element.parentElement) {
        element.parentElement.insertBefore(epic, element);
        return true;
    }
    return false;
};

const displayControlEpic = (): Promise<EpicComponent> => {
    const epic = controlEpicComponent();
    const isEpicInserted = insertEpic(epic.html);
    return isEpicInserted ? Promise.resolve(epic) : Promise.reject('unable to insert control Epic');
};

const awaitEpicViewed = (epic: HTMLDivElement): Promise<void> => {
    const inView = elementInView(epic, window, { top: 18 });
    return new Promise(resolve => inView.on('firstview', () => resolve()));
};

const trackEpic = (epic: EpicComponent, abTest?: { name: string, variant: string }): void  => {
    const componentEventWithoutAction = {
        component: epic.component,
        abTest: abTest,
    };
    submitInsertEvent(componentEventWithoutAction);
    awaitEpicViewed(epic.html).then(() => submitViewEvent(componentEventWithoutAction))
};
