import ophan from 'ophan/ng';



// ophan helper methods
export const submitComponentEventTracking = (
    componentEvent
) => {
    ophan.record({ componentEvent });
};

export const submitViewEventTracking = (
    componentEvent
) =>
    submitComponentEventTracking({
        ...componentEvent,
        action: 'VIEW',
    });

export const submitClickEventTracking = (
    componentEvent
) =>
    submitComponentEventTracking({
        ...componentEvent,
        action: 'CLICK',
    });
