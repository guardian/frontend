// @flow

export type CurrentABTest = {
    name: string,
    variant: string,
};

export type ComponentEventParams = {
    componentType: string,
    componentId?: string,
    abTestName: string,
    abTestVariant: string,
    viewId?: string,
    browserId?: string,
    visitId?: string,
};
