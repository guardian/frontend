type ListenerFunction = (f: () => void) => void;

export type CtaUrls = {
    supportUrl: string,
};

declare type EpicTemplate = (EpicVariant, AcquisitionsEpicTemplateCopy) => string;

declare type Variant = {
    id: string,
    test: (x: Object) => void,
    campaignCode?: string,
    canRun?: () => boolean,
    impression?: ListenerFunction,
    success?: ListenerFunction,
    engagementBannerParams?: EngagementBannerTestParams,
    deploymentRules?: DeploymentRules,
};

declare type EpicVariant = Variant & {
    // filters, where empty is taken to mean 'all', multiple entries are combined with OR
    locations: string[],
    tagIds: string[],
    sections: string[],
    excludedTagIds: string[],
    excludedSections: string[],

    supportURL: string,
    subscribeURL: string,
    componentName: string,
    template: EpicTemplate,
    classNames: string[],

    buttonTemplate?: CtaUrls => string,
    copy?: AcquisitionsEpicTemplateCopy,
}

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
    userCohort: AcquisitionsComponentUserCohort,
    pageCheck: (page: Object) => boolean,
    useTargetingTool: boolean,
    insertEvent: string,
    viewEvent: string,
};

declare type InitEpicABTestVariant = {
    id: string,
    products: $ReadOnlyArray<OphanProduct>,
    test?: (html: string, abTest: ABTest) => void,
    deploymentRules?: DeploymentRules,
    locations?: string[],
    tagIds?: string[],
    sections?: string[],
    excludedTagIds?: string[],
    excludedSections?: string[],
    buttonTemplate?: CtaUrls => string,
    copy?: AcquisitionsEpicTemplateCopy,
    classNames?: string[],
};

declare type InitBannerABTestVariant = {
    id: string,
    products: $ReadOnlyArray<OphanProduct>,
    engagementBannerParams: () => Promise<?EngagementBannerTemplateParams>
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
    variants: $ReadOnlyArray<InitEpicABTestVariant>,

    campaignPrefix?: string,
    useLocalViewLog?: boolean,
    useTargetingTool?: boolean,
    userCohort?: AcquisitionsComponentUserCohort,
    pageCheck?: (page: Object) => boolean,
    template?: EpicTemplate,
    deploymentRules?: DeploymentRules,
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
