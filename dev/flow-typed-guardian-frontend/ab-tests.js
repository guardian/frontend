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
};

declare type AcquisitionsABTest = ABTest & {
    campaignId: string,
    componentType: OphanComponentType,
};

declare type EpicABTest = AcquisitionsABTest & {
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

declare type InitEpicABTestVariant = {
    id: string,
    products: OphanProduct[],
    options: Object
};

declare type InitEpicABTest = {
    id: string,
    start: string,
    expiry: string,
    author: string,
    description: string,
    audience: number,
    audienceOffset: number,
    successMeasure: string,
    audienceCriteria: string,
    idealOutcome: string,
    campaignId: string,
    variants: InitEpicABTestVariant[],

    componentType?: OphanComponentType,
    // locations is a filter where empty is taken to mean 'all'
    locations?: string[],
    locationCheck?: () => boolean,
    dataLinkNames?: string,
    campaignPrefix?: string,
    campaignSuffix?: string,
    useLocalViewLog?: boolean,
    overrideCanRun?: boolean,
    useTargetingTool?: boolean,
    showToContributorsAndSupporters?: boolean,
    canRun?: () => boolean,
    pageCheck?: (page: Object) => boolean,
}

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
