// @flow

type ListenerFunction = (f: () => void) => void;

declare type Variant = {
    id: string,
    test: (x: Object) => void,
    impression?: ListenerFunction,
    success?: ListenerFunction,
    options?: Object,
};

declare type ABTest = {
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
    idealOutcome?: string,
    dataLinkNames?: string,
    variants: Array<Variant>,
    canRun: () => boolean,
    notInTest?: () => void,
    isEngagementBannerTest?: boolean,
};

/**
 * the structure stored in localStorage
 */
declare type Participations = {
    [testId: string]: {
        variant: string,
    },
};

/**
 * an individual A/B test, structured for Ophan
 */
declare type OphanABEvent = {
    variantName: string,
    complete: string | boolean,
    campaignCodes?: Array<string>,
};

/**
 * the actual payload we send to Ophan: an object of OphanABEvents with test IDs as keys
 */
declare type OphanABPayload = {
    [testId: string]: OphanABEvent,
};
