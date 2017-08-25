// @flow
import ophan from 'ophan/ng';

const record = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

export const submitComponentEvent = (
    actionType: OphanAction,
    componentType: OphanComponentType,
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode: string,
    labels: $ReadOnlyArray<string> = [],
    value?: string
) => {
    record({
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

export const submitInsertEvent = submitComponentEvent.bind(null, 'INSERT');

export const submitViewEvent = submitComponentEvent.bind(null, 'VIEW');
