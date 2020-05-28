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

export type SignInGateVariant = {
    show: ({
        abTest: CurrentABTest,
        guUrl: string,
        signInUrl: string,
        ophanComponentId: string,
    }) => boolean,
    canShow: (name?: string) => boolean,
    name: string,
};
