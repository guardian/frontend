// @flow
import ophan from 'ophan/ng';

type ComponentEventWithoutAction = {
    component: OphanComponent,
    value?: string,
    id?: string,
    abTest?: {
        name: string,
        variant: string,
    },
};

export const submitComponentEvent = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

export const submitInsertEvent = (
    componentEvent: ComponentEventWithoutAction
) =>
    submitComponentEvent({
        ...componentEvent,
        action: 'INSERT',
    });

export const submitViewEvent = (componentEvent: ComponentEventWithoutAction) =>
    submitComponentEvent({
        ...componentEvent,
        action: 'VIEW',
    });
