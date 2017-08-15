// @flow
import ophan from 'ophan/ng';

const submitComponentEvent = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

export const submitEpicInsertEvent = (
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode: string,
    type: OphanComponentType = 'ACQUISITIONS_EPIC'
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

export const submitEpicViewEvent = (
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode: string,
    type: OphanComponentType = 'ACQUISITIONS_EPIC'
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
