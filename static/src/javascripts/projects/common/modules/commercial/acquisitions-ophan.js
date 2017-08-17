// @flow
import ophan from 'ophan/ng';

const submitComponentEvent = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

export const submitEpicInsertEvent = (
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode: string,
    componentType: OphanComponentType = 'ACQUISITIONS_EPIC'
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

export const submitEpicViewEvent = (
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode: string,
    componentType: OphanComponentType = 'ACQUISITIONS_EPIC'
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
