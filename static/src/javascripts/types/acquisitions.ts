declare type AcquisitionsEpicTestimonialCopy = {
  text: string;
  name: string;
};

declare type AcquisitionsEpicTemplateCopy = {
  heading?: string;
  paragraphs: Array<string>;
  highlightedText?: string;
  testimonial?: AcquisitionsEpicTestimonialCopy;
  footer?: Array<string>;
};

declare type EngagementBannerTemplateParams = {
  titles?: Array<string>;
  leadSentence?: string;
  closingSentence?: string;
  messageText: string;
  mobileMessageText?: string;
  ctaText: string;
  buttonCaption: string;
  linkUrl: string;
  hasTicker: boolean;
  tickerHeader?: string;
  signInUrl?: string;
  secondaryLinkUrl?: string;
  secondaryLinkLabel?: string;
  subsLinkUrl?: string;
};

/**
 * AllExistingSupporters - all recurring, all one-offs in last 3 months
 * AllNonSupporters - no recurring, no one-offs in last 3 months
 * Everyone
 * PostAskPauseSingleContributors - people who made a contribution more than 3 months ago
 *
 * Note - PostAskPauseSingleContributors is a subset of AllNonSupporters, so priority ordering of these tests is important
 */
declare type AcquisitionsComponentUserCohort = "AllExistingSupporters" | "AllNonSupporters" | "Everyone" | "PostAskPauseSingleContributors";

declare type EngagementBannerParams = EngagementBannerTemplateParams & {
  campaignCode: string;
  pageviewId: string;
  products: OphanProduct[];
  isHardcodedFallback: boolean;
  template: (templateParams: EngagementBannerTemplateParams) => string;
  minArticlesBeforeShowingBanner: number;
  userCohort: AcquisitionsComponentUserCohort;
  bannerModifierClass?: string;
  abTest?: {
    name: string;
    variant: string;
  };
  bannerShownCallback?: () => void;
};

declare type EngagementBannerTestParams = {
  titles?: Array<string>;
  leadSentence?: string;
  messageText?: string;
  ctaText?: string;
  buttonCaption?: string;
  linkUrl?: string;
  hasTicker?: boolean;
  tickerHeader?: string;
  products?: OphanProduct[];
  template?: (templateParams: EngagementBannerTemplateParams) => string;
  bannerModifierClass?: string;
  minArticlesBeforeShowingBanner?: number;
  userCohort?: AcquisitionsComponentUserCohort;
  bannerShownCallback?: () => void;
};