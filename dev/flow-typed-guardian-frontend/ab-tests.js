// @flow

type ListenerFunction = (f: () => void) => void;

declare type Variant = {
    id: string,
    test: (x: Object) => void,
    impression?: ListenerFunction,
    success?: ListenerFunction,
    options?: Object,
    engagementBannerParams?: EngagementBannerParams,
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

declare type ContributionsABTest = ABTest & {
    epic: boolean,
    campaignId: string,
    campaignPrefix: string,
    campaignSuffix: string,
    useLocalViewLog: boolean,
    overrideCanRun: boolean,
    showToContributorsAndSupporters: boolean,
    pageCheck: (page: Object) => boolean,
    locations: Array<string>,
    locationCheck: (location: string) => boolean,
    useTargetingTool: boolean,
    insertEvent: string,
    viewEvent: string,
};

declare type Interaction = {
    component: string,
    value: string,
};

declare type EngagementBannerParams = {
    minArticles: number,
    campaignCode: string,
    buttonCaption: string,
    linkUrl: string,
    messageText: string,
    pageviewId: string,
    interactionOnMessageShow: Interaction,
    colourStrategy: () => string,
    offering?: string,
    paypalClass?: string,
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
