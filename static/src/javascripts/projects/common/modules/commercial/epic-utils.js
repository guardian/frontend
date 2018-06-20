// @flow

import $ from 'lib/$';
import { elementInView } from 'lib/element-inview';
import reportError from 'lib/report-error';

import { control as epicControlCopy } from 'common/modules/commercial/acquisitions-copy';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import { acquisitionsTestimonialBlockTemplate } from 'common/modules/commercial/templates/acquisitions-epic-testimonial-block';
import { control as epicTestimonialControlParameters } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';
import { supportContributeURL } from 'common/modules/commercial/support-utilities';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import {
    addTrackingCodesToUrl,
    submitInsertEvent,
    submitViewEvent,
} from 'common/modules/commercial/acquisitions-ophan';
import { logView } from 'common/modules/commercial/acquisitions-view-log';

import type { ReportedError } from 'lib/report-error';
import type {
    ABTestVariant,
    ComponentEventWithoutAction,
} from 'common/modules/commercial/acquisitions-ophan';

export type EpicComponent = {
    html: HTMLDivElement,
    componentEvent?: ComponentEventWithoutAction,
};

const reportEpicError = (error: ReportedError): void => {
    reportError(error, { feature: 'epic' }, false);
};

const controlEpicComponent = (abTest?: ABTestVariant): EpicComponent => {
    const epicId = 'epic_control'; // TODO: check ok to use this
    const epicComponentType = 'ACQUISITIONS_EPIC';
    const rawEpic = acquisitionsEpicControlTemplate({
        copy: epicControlCopy,
        componentName: '', // TODO: confirm data-component not needed
        buttonTemplate: epicButtonsTemplate({
            supportUrl: addTrackingCodesToUrl({
                base: supportContributeURL,
                componentType: epicComponentType,
                componentId: epicId,
                campaignCode: epicId,
                abTest,
            }),
        }),
        testimonialBlock: acquisitionsTestimonialBlockTemplate(
            epicTestimonialControlParameters
        ),
        epicClass: '',
        wrapperClass: '',
    });
    const epic = $.create(rawEpic).get(0);
    return {
        html: epic,
        componentEvent: {
            component: {
                componentType: epicComponentType,
                id: epicId,
            },
            abTest,
        },
    };
};

const insertEpic = (epic: HTMLDivElement): boolean => {
    const element = document.querySelector('.submeta');
    if (element && element.parentElement) {
        element.parentElement.insertBefore(epic, element);
        return true;
    }
    return false;
};

const displayControlEpic = (abTest?: ABTestVariant): Promise<EpicComponent> => {
    const epic = controlEpicComponent(abTest);
    const isEpicInserted = insertEpic(epic.html);
    if (isEpicInserted) {
        return Promise.resolve(epic);
    }
    const error = new Error('unable to insert control Epic');
    reportEpicError(error);
    return Promise.reject(error);
};

const awaitEpicViewed = (epic: HTMLDivElement): Promise<void> => {
    const inView = elementInView(epic, window, { top: 18 });
    return new Promise(resolve => inView.on('firstview', () => resolve()));
};

const trackEpic = (epic: EpicComponent): void => {
    const componentEvent = epic.componentEvent;
    if (componentEvent) {
        submitInsertEvent(componentEvent);
        awaitEpicViewed(epic.html).then(() => {
            submitViewEvent(componentEvent);
            // At the moment id is always derived from test name,
            // but something more general will be required if an Epic isn't part of an AB test.
            if (componentEvent.abTest) {
                logView(componentEvent.abTest.name);
            }
        });
    }
};

export { reportEpicError, insertEpic, displayControlEpic, trackEpic };
