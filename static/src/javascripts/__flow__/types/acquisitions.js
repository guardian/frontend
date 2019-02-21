declare type AcquisitionsEpicTestimonialCopy = {
    text: string,
    name: string
}

declare type AcquisitionsEpicTemplateCopy = {
    heading?: string,
    paragraphs: Array<string>,
    highlightedText?: string,
    testimonial?: AcquisitionsEpicTestimonialCopy,
    footer?: Array<string>,
};

declare type EngagementBannerTemplateParams = {
    titles?: Array<string>,
    leadSentence?: string,
    messageText: string,
    ctaText: string,
    buttonCaption: string,
    linkUrl: string,
    hasTicker: boolean,
};

declare type AcquisitionsComponentUserCohort = 'OnlyExistingSupporters' | 'OnlyNonSupporters' | 'Everyone';

declare type EngagementBannerParams = EngagementBannerTemplateParams & {
    campaignCode: string,
    pageviewId: string,
    products: OphanProduct[],
    isHardcodedFallback: boolean,
    template: (templateParams: EngagementBannerTemplateParams) => string,
    minArticlesBeforeShowingBanner: number,
    userCohort: AcquisitionsComponentUserCohort,
    bannerModifierClass?: string,
    abTest?: {
        name: string,
        variant: string
    },
    bannerShownCallback?: () => void,
};

declare type EngagementBannerTestParams = {
    titles?: Array<string>,
    leadSentence?: string,
    messageText?: string,
    ctaText?: string,
    buttonCaption?: string,
    linkUrl?: string,
    hasTicker?: boolean,
    products?: OphanProduct[],
    template?: (templateParams: EngagementBannerTemplateParams) => string,
    bannerModifierClass?: string,
    minArticlesBeforeShowingBanner?: number,
    userCohort?: AcquisitionsComponentUserCohort,
    bannerShownCallback?: () => void,
}
