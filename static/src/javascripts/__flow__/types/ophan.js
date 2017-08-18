// @flow

/**
 * an individual A/B test, structured for Ophan
 */
declare type OphanABEvent = {
    variantName: string,
    complete: string | boolean,
    campaignCodes?: $ReadOnlyArray<string>,
};

/**
 * the actual payload we send to Ophan: an object of OphanABEvents with test IDs as keys
 */
declare type OphanABPayload = {
    [testId: string]: OphanABEvent,
};

declare type OphanProduct =
    | 'ONE_OFF_CONTRIBUTION'
    | 'RECURRING_CONTRIBUTION'
    | 'MEMBERSHIP_SUPPORTER'
    | 'DIGITAL_SUBSCRIPTION'
    | 'PAPER_SUBSCRIPTION';

declare type OphanAction =
    | 'INSERT'
    | 'VIEW'
    | 'EXPAND'
    | 'LIKE'
    | 'DISLIKE'
    | 'SUBSCRIBE'
    | 'ANSWER'
    | 'VOTE'
    | 'CLICK';

declare type OphanComponentType =
    | 'READERS_QUESTIONS_ATOM'
    | 'QANDA_ATOM'
    | 'PROFILE_ATOM'
    | 'GUIDE_ATOM'
    | 'TIMELINE_ATOM'
    | 'NEWSLETTER_SUBSCRIPTION'
    | 'SURVEYS_QUESTIONS'
    | 'ACQUISITIONS_EPIC'
    | 'ACQUISITIONS_ENGAGEMENT_BANNER'
    | 'ACQUISITIONS_THANK_YOU_EPIC'
    | 'ACQUISITIONS_HEADER'
    | 'ACQUISITIONS_FOOTER'
    | 'ACQUISITIONS_INTERACTIVE_SLICE'
    | 'ACQUISITIONS_NUGGET'
    | 'ACQUISITIONS_STANDFIRST'
    | 'ACQUISITIONS_THRASHER'
    | 'ACQUISITIONS_EDITORIAL_LINK';

declare type OphanComponent = {|
    type: OphanComponentType,
    id?: string,
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode?: string,
    labels: $ReadOnlyArray<string>
|};

declare type OphanComponentEvent = {|
    component: OphanComponent,
    action: OphanAction,
    value?: string
|};
