// @flow
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

export type Slot = {
    addService: string => Slot,
    clearCategoryExclusions: () => Slot,
    clearTargeting: (?string) => Slot,
    defineSizeMapping: Array<SizeMapping> => Slot,
    get: string => ?string,
    getAdUnitPath: () => string,
    getAttributeKeys: () => Array<string>,
    getCategoryExclusions: () => Array<string>,
    getResponseInformation: () => ?ResponseInformation,
    getSlotElementId: () => string,
    getTargeting: string => Array<string>,
    getTargetingKeys: () => Array<string>,
    set: (string, string) => Slot,
    setCategoryExclusion: string => Slot,
    setClickUrl: string => Slot,
    setCollapseEmptyDiv: (boolean, boolean) => Slot,
    setForceSafeFrame: boolean => Slot,
    setSafeFrameConfig: SafeFrameConfig => Slot,
    setTargeting: (string, string | Array<string>) => Slot,
};

export type SlotOnloadEvent = {
    serviceName: string,
    slot: Slot,
};
