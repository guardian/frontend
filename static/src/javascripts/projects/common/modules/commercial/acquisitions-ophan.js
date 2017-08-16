// @flow
import ophan from 'ophan/ng';

const submitComponentEvent = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

export const submitInsertEvent = (
    type: OphanComponentType,
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode: string
) => {
    submitComponentEvent({
        component: {
            type,
            labels: [],
            products,
            campaignCode,
        },
        action: 'INSERT',
    });
};

export const submitViewEvent = (
    type: OphanComponentType,
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode: string
) => {
    submitComponentEvent({
        component: {
            type,
            labels: [],
            products,
            campaignCode,
        },
        action: 'VIEW',
    });
};
