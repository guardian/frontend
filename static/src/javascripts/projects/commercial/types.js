// @flow

/* eslint no-use-before-define: "off" */

export type SingleSizeArray = Array<number>;
export type NamedSize = string;
export type SingleSize = SingleSizeArray | NamedSize;
export type MultiSize = Array<SingleSize>;
export type GeneralSize = SingleSize | MultiSize;
export type SizeMapping = Array<GeneralSize>;

export type ResponseInformation = {
    advertiserId: string,
    campaignId: string,
    creativeId: ?number,
    labelIds: ?Array<number>,
    lineItemId: ?number,
};

export type SafeFrameConfig = {
    allowOverlayExpansion: boolean,
    allowPushExpansion: boolean,
    sandbox: boolean,
};

type AddService = string => Slot;
type ClearCategoryExclusions = () => Slot;
type ClearTargeting = (?string) => Slot;
type DefineSizeMapping = Array<SizeMapping> => Slot;
type Get = string => ?string;
type GetString = () => string;
type GetStrings = () => Array<string>;
type GetResponseInformation = () => ?ResponseInformation;
type GetTargeting = string => Array<string>;
type Set = (string, string) => Slot;
type SetString = string => Slot;
type SetCollapseEmptyDiv = (boolean, boolean) => Slot;
type SetForceSafeFrame = boolean => Slot;
type SetSafeFrameConfig = SafeFrameConfig => Slot;
type SetTargeting = (string, string | Array<string>) => Slot;

export type Slot = {
    addService: AddService,
    clearCategoryExclusions: ClearCategoryExclusions,
    clearTargeting: ClearTargeting,
    defineSizeMapping: DefineSizeMapping,
    get: Get,
    getAdUnitPath: GetString,
    getAttributeKeys: GetStrings,
    getCategoryExclusions: GetStrings,
    getResponseInformation: GetResponseInformation,
    getSlotElementId: GetString,
    getTargeting: GetTargeting,
    getTargetingKeys: GetStrings,
    set: Set,
    setCategoryExclusion: SetString,
    setClickUrl: SetString,
    setCollapseEmptyDiv: SetCollapseEmptyDiv,
    setForceSafeFrame: SetForceSafeFrame,
    setSafeFrameConfig: SetSafeFrameConfig,
    setTargeting: SetTargeting,
};

export type SlotOnloadEvent = {
    serviceName: string,
    slot: Slot,
};
