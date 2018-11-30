import {
    addTrackingCodesToUrl,
    submitInsertEvent,
    submitViewEvent
} from 'common/modules/commercial/acquisitions-ophan';
import { supportContributeURL } from 'common/modules/commercial/support-utilities';
import { noop } from '../../lib/noop';
import mediator from '../../lib/mediator';
import { defaultButtonTemplate, defaultMaxViews } from 'common/modules/commercial/contributions-utilities';
import type { EpicTemplate } from 'common/modules/commercial/contributions-utilities';

type ListenerFunction = (f: () => void) => void;

declare type Variant = {
    id: string,
    test: (x: Object) => void,
    impression?: ListenerFunction,
    success?: ListenerFunction,
    options?: Object,
    engagementBannerParams?: () => Promise<EngagementBannerParams>,
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

declare type AcquisitionsABTest = ABTest & {
    campaignId: string,
    componentType: OphanComponentType,
};

declare type EpicABTest = AcquisitionsABTest & {
    campaignPrefix: string,
    useLocalViewLog: boolean,
    overrideCanRun: boolean,
    showToContributorsAndSupporters: boolean,
    pageCheck: (page: Object) => boolean,
    locations: $ReadOnlyArray<string>,
    locationCheck: (location: string) => boolean,
    useTargetingTool: boolean,
    insertEvent: string,
    viewEvent: string,
};

// declare type EpicABTestOptions = {|
//     maxViews?: {
//         count: number,
//         days: number,
//         minDaysBetweenViews: number,
//     } ,
//     isUnlimited?: boolean,
//     campaignCode?: string,
//     supportURL?: stirng,
//     subscribeURL?: string,
//     // TODO ?
//     template?: EpicTemplate,
//     // TODO ?
//     buttonTemplate?: ButtonTemplate,
//     blockEngagementBanner?: boolean,
//     // TODO?
//     engagementBannerParams?: Object,
//     isOutbrainCompliant?: boolean,
//     usesIframe?: boolean,
//     onInsert?: () => void,
//     onView?: () => void,
//     insertAtSelector?: string,
//     insertMultiple?: false,
//     insertAfter?: false,
//     test?: () => void,
//     impression?: () => void,
//     success?: () => void,
// |};

declare type InitEpicABTestVariant = {
    id: string,
    products: $ReadOnlyArray<OphanProduct>,
    options?: Object
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

    // locations is a filter where empty is taken to mean 'all'
    locations?: string[],
    locationCheck?: () => boolean,
    dataLinkNames?: string,
    campaignPrefix?: string,
    useLocalViewLog?: boolean,
    overrideCanRun?: boolean,
    useTargetingTool?: boolean,
    showToContributorsAndSupporters?: boolean,
    canRun?: (test: EpicABTest) => boolean,
    pageCheck?: (page: Object) => boolean,
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
