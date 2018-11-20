declare type AcquisitionsEpicTestimonialCopy = {
    text: string,
    name: string
}

declare type AcquisitionsEpicTemplateCopy = {
    heading?: string,
    paragraphs: Array<string>,
    highlightedText: string,
    testimonial?: AcquisitionsEpicTestimonialCopy
};

declare type EngagementBannerTemplateParams = {
    messageText: string,
    ctaText: string,
    buttonCaption: string,
    linkUrl: string,
};

declare type EngagementBannerParams = {
    campaignCode: string,
    buttonCaption: string,
    linkUrl: string,
    messageText: string,
    ctaText: string,
    pageviewId: string,
    products: OphanProduct[],
    paypalClass?: string,
    template?: (templateParams: EngagementBannerTemplateParams) => string,
    bannerModifierClass?: string,
};
