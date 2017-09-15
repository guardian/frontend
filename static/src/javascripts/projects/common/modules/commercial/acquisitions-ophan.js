// @flow
import ophan from 'ophan/ng';

export const submitComponentEvent = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

type ComponentEventWithoutAction = {
    component: OphanComponent,
    value?: string,
    id?: string,
    abTest?: {
        name: string,
        variant: string
    }
};

export const submitInsertEvent = (componentEvent: ComponentEventWithoutAction) =>
    submitComponentEvent({
        ...componentEvent,
        action: 'INSERT'
    });

export const submitViewEvent = (componentEvent: ComponentEventWithoutAction) =>
    submitComponentEvent({
        ...componentEvent,
        action: 'VIEW'
    });
