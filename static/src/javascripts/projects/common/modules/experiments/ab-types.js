// @flow

type ListenerFunction = (f: () => void) => void;

export type Variant = {
    id: string,
    test: () => void,
    impression?: ListenerFunction,
    success?: ListenerFunction,
    options?: Object,
};

export type ABTest = {
    id: string,
    start: string,
    expiry: string,
    author: string,
    description: string,
    audience: number,
    audienceOffset: number,
    successMeasure: string,
    audienceCriteria: string,
    showForSensitive?: boolean,
    dataLinkNames?: string,
    idealOutcome?: string,
    variants: Array<Variant>,
    dataLinkNames?: string,
    idealOutcome?: string,
    variants: Array<Variant>,
    canRun: () => boolean,
    notInTest?: () => void,
};

/**
 * the structure stored in localStorage
 */
export type Participations = {
    [testId: string]: {
        variant: string,
    },
};

/**
 * an individual A/B test, structured for Ophan
 */
export type OphanABEvent = {
    variantName: string,
    complete: string | boolean,
    campaignCodes?: Array<string>,
};

/**
 * the actual payload we send to Ophan: an object of OphanABEvents with test IDs as keys
 */
export type OphanABPayload = {
    [testId: string]: OphanABEvent,
};
