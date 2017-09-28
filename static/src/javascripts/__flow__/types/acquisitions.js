declare type AcquisitionsEpicTemplateCopy = {
    heading?: string,
    p1: string,
    p2: string,
};

declare type EngagementBannerParams = {
    minArticles: number,
    campaignCode: string,
    buttonCaption: string,
    linkUrl: string,
    messageText: string,
    pageviewId: string,
    colourStrategy: () => string,
    products: OphanProduct[],
    paypalClass?: string,
};
