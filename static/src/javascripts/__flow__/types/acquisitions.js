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
    messageText: string,
    ctaText: string,
    buttonCaption: string,
    linkUrl: string,
    hasTicker: boolean,
};

declare type EngagementBannerParams = EngagementBannerTemplateParams & {
    campaignCode: string,
    pageviewId: string,
    products: OphanProduct[],
    isHardcodedFallback: boolean,
    template: (templateParams: EngagementBannerTemplateParams) => string,
    minArticlesBeforeShowingBanner: number,
    bannerModifierClass?: string,
    abTest?: {
        name: string,
        variant: string
    },
};

declare type EngagementBannerTestParams = {
    messageText?: string,
    ctaText?: string,
    buttonCaption?: string,
    linkUrl?: string,
    hasTicker?: boolean,
    products?: OphanProduct[],
    template?: (templateParams: EngagementBannerTemplateParams) => string,
    bannerModifierClass?: string,
    minArticlesBeforeShowingBanner?: number,
}
