type ListenerFunction = (f: () => void) => void;

declare type Variant = {
    id: string,
    test: (x: Object) => void,
    canRun?: () => boolean,
    impression?: ListenerFunction,
    success?: ListenerFunction,
    options?: Object,
    engagementBannerParams?: () => Promise<EngagementBannerParams>,
    deploymentRules?: DeploymentRules,
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
    variants: $ReadOnlyArray<Variant>,
    canRun: () => boolean,
    notInTest?: () => void,
};

declare type Runnable<T: ABTest> = T & {
    variantToRun: Variant;
};

declare type AcquisitionsABTest = ABTest & {
    campaignId: string,
    componentType: OphanComponentType,
};

declare type MaxViews = {
    days: number,
    count: number,
    minDaysBetweenViews: number,
};

declare type DeploymentRules = 'AlwaysAsk' | MaxViews

declare type EpicABTest = AcquisitionsABTest & {
    campaignPrefix: string,
    useLocalViewLog: boolean,
    overrideCanRun: boolean,
    onlyShowToExistingSupporters: boolean,
    pageCheck: (page: Object) => boolean,
    locations: $ReadOnlyArray<string>,
    useTargetingTool: boolean,
    insertEvent: string,
    viewEvent: string,
};

declare type InitEpicABTestVariant = {
    id: string,
    products: $ReadOnlyArray<OphanProduct>,
    test?: (html: string, abTest: ABTest) => void,
    deploymentRules?: DeploymentRules,
    options?: Object
};

declare type InitBannerABTestVariant = {
    id: string,
    products: $ReadOnlyArray<OphanProduct>,
    engagementBannerParams: () => Promise<?EngagementBannerTemplateParams>
};

declare type EpicTemplate = (Variant, AcquisitionsEpicTemplateCopy) => string;

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
    variants: $ReadOnlyArray<InitEpicABTestVariant>,

    // locations is a filter where empty is taken to mean 'all'
    locations?: string[],
    dataLinkNames?: string,
    campaignPrefix?: string,
    useLocalViewLog?: boolean,
    overrideCanRun?: boolean,
    useTargetingTool?: boolean,
    onlyShowToExistingSupporters?: boolean,
    canRun?: (test: EpicABTest) => boolean,
    pageCheck?: (page: Object) => boolean,
    template?: EpicTemplate,
}

declare type Interaction = {
    component: string,
    value: string,
};

/**
 * the structure stored in localStorage
 */
declare type Participations = {
    [testId: string]: {
        variant: string,
    },
};
