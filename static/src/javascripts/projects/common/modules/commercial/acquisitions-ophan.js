// @flow
import ophan from 'ophan/ng';

const submitComponentEvent = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

export const submitEvent = (
    actionType: OphanAction,
    componentType: OphanComponentType,
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode: string,
    labels: $ReadOnlyArray<string> = [],
    value?: string
) => {
    submitComponentEvent({
        component: {
            componentType,
            labels,
            products,
            campaignCode,
        },
        action: actionType,
        value,
    });
};

export const submitInsertEvent = submitEvent.bind(null, 'INSERT');

export const submitViewEvent = submitEvent.bind(null, 'VIEW');
