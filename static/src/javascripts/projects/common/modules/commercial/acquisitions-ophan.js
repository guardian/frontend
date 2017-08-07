// @flow
import ophan from 'ophan/ng';

const submitComponentEvent = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

// Hmmm, what about where the campaign code is different for each button?
export const submitEpicInsertEvent = (
    products: OphanProduct[],
    campaignCode: string
) => {
    submitComponentEvent({
        component: {
            type: 'AcquisitionsEpic',
            labels: [],
            products,
            campaignCode,
        },
        action: 'Insert',
    });
};

export const submitEpicViewEvent = (
    products: OphanProduct[],
    campaignCode: string
) => {
    submitComponentEvent({
        component: {
            type: 'AcquisitionsEpic',
            labels: [],
            products,
            campaignCode,
        },
        action: 'View',
    });
};
