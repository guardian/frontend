// @flow

import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
import { elementInView } from 'lib/element-inview';
import reportError from 'lib/report-error';
import mediator from 'lib/mediator';

import { control as epicControlCopy } from 'common/modules/commercial/acquisitions-copy';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import { acquisitionsTestimonialBlockTemplate } from 'common/modules/commercial/templates/acquisitions-epic-testimonial-block';
import { supportContributeURL } from 'common/modules/commercial/support-utilities';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import {
    addTrackingCodesToUrl,
    submitClickEvent,
    submitInsertEvent,
    submitViewEvent,
} from 'common/modules/commercial/acquisitions-ophan';
import { logView } from 'common/modules/commercial/acquisitions-view-log';

import type { ReportedError } from 'lib/report-error';
import type { Spec } from 'common/modules/ui/clickstream';
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
    let testimonialBlock = '';
    if (epicControlCopy.testimonial) {
        testimonialBlock = acquisitionsTestimonialBlockTemplate(
            epicControlCopy.testimonial
        );
    }
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
        testimonialBlock,
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

const insertAtSubmeta = (epic: HTMLDivElement): Promise<void> =>
    fastdom.read(() => document.querySelector('.submeta')).then(element => {
        if (element && element.parentElement) {
            element.parentElement.insertBefore(epic, element);
            return Promise.resolve();
        }
        const error = new Error('unable to insert Epic');
        reportEpicError(error);
        return Promise.reject(error);
    });

const displayControlEpic = (abTest?: ABTestVariant): Promise<EpicComponent> => {
    const epic = controlEpicComponent(abTest);
    return insertAtSubmeta(epic.html).then(() => epic);
};

const awaitEpicViewed = (epic: HTMLDivElement): Promise<void> => {
    const inView = elementInView(epic, window, { top: 18 });
    return new Promise(resolve => inView.on('firstview', () => resolve()));
};

const awaitEpicButtonClicked = (): Promise<void> =>
    new Promise(resolve => {
        mediator.on('module:clickstream:click', (clickSpec: Spec | boolean) => {
            if (clickSpec === true || clickSpec === false) {
                return;
            }
            const isEpicClick = clickSpec.tags.find(tag => tag === 'epic');
            if (isEpicClick) {
                resolve();
            }
        });
    });

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
        awaitEpicButtonClicked().then(() => submitClickEvent(componentEvent));
    }
};

export {
    reportEpicError,
    insertAtSubmeta,
    displayControlEpic,
    trackEpic,
    awaitEpicButtonClicked,
};
