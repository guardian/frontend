// @flow
import ophan from 'ophan/ng';

const submitComponentEvent = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

export const submitInsertEvent = (
    componentType: OphanComponentType,
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode: string
) => {
    submitComponentEvent({
        component: {
            componentType,
            labels: [],
            products,
            campaignCode,
        },
        action: 'INSERT',
    });
};

export const submitViewEvent = (
    componentType: OphanComponentType,
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode: string
) => {
    submitComponentEvent({
        component: {
            componentType,
            labels: [],
            products,
            campaignCode,
        },
        action: 'VIEW',
    });
};
