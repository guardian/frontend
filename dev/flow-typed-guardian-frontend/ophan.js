// @flow

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

declare type OphanProduct =
    | 'OneOffContribution'
    | 'RecurringContribution'
    | 'MembershipSupporter'
    | 'DigitalSubscription'
    | 'PaperSubscription';

declare type OphanAction =
    | 'Insert'
    | 'View'
    | 'Expand'
    | 'Like'
    | 'Dislike'
    | 'Subscribe'
    | 'Answer'
    | 'Vote'
    | 'Click';

declare type OphanComponentType =
    | 'ReadersQuestionsAtom'
    | 'QandaAtom'
    | 'ProfileAtom'
    | 'GuideAtom'
    | 'TimelineAtom'
    | 'NewsletterSubscription'
    | 'SurveysQuestions'
    | 'AcquisitionsEpic'
    | 'AcquisitionsEngagementBanner';

declare type OphanComponent = {|
    type: OphanComponentType,
    id?: string,
    products: OphanProduct[],
    campaignCode?: string,
    labels: string[]
|};

declare type OphanComponentEvent = {|
    component: OphanComponent,
    action: OphanAction,
    value?: string
|};
