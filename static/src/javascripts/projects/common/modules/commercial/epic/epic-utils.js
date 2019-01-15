// @flow

import fastdom from 'lib/fastdom-promise';
import { elementInView } from 'lib/element-inview';
import reportError from 'lib/report-error';
import mediator from 'lib/mediator';

import {
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

const insertAtSubmeta = (epic: EpicComponent): Promise<EpicComponent> =>
    fastdom.read(() => document.querySelector('.submeta')).then(element => {
        if (element && element.parentElement) {
            element.parentElement.insertBefore(epic.html, element);
            return Promise.resolve(epic);
        }
        const error = new Error('unable to insert Epic');
        reportEpicError(error);
        return Promise.reject(error);
    });

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
export {
    reportEpicError,
    insertAtSubmeta,
    awaitEpicButtonClicked,
};
