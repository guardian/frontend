// @flow

/* eslint no-use-before-define: "off" */

export type AdSizes = { [k: string]: Array<AdSize> };
export type AdSize = SingleSizeArray | NamedSize;

export type SingleSizeArray = Array<number>;
export type NamedSize = 'fluid';
export type MultiSize = Array<AdSize>;
export type GeneralSize = AdSize | MultiSize;
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

type AddService = (s: string) => Slot;
type ClearCategoryExclusions = () => Slot;
type ClearTargeting = (s?: string) => Slot;
type DefineSizeMapping = (asm: Array<SizeMapping>) => Slot;
type Get = (s: string) => ?string;
type GetString = () => string;
type GetStrings = () => Array<string>;
type GetResponseInformation = () => ?ResponseInformation;
type GetTargeting = (s: string) => Array<string>;
type Set = (s1: string, s2: string) => Slot;
type SetString = (s: string) => Slot;
type SetCollapseEmptyDiv = (b1: boolean, b2: boolean) => Slot;
type SetForceSafeFrame = (b1: boolean) => Slot;
type SetSafeFrameConfig = (sfc: SafeFrameConfig) => Slot;
type SetTargeting = (s: string, a: string | Array<string>) => Slot;

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

export type SlotRenderEndedEvent = {
    advertiserId?: number,
    campaignId?: number,
    creativeId?: number,
    isEmpty: boolean,
    lineItemId?: number,
    serviceName: string,
    size: AdSize,
    slot: Slot,
    sourceAgnosticCreativeId?: number,
    sourceAgnosticLineItemId?: number,
};

type MPUUnitId = 228;
type LeaderboardUnitId = 229;
type BillboardUnitId = 229;

export type SwitchUnitId = MPUUnitId | LeaderboardUnitId | BillboardUnitId;

export type GuAdSize = {
    width: number,
    height: number,
    switchUnitId: ?SwitchUnitId,
    toString: (_: void) => string,
};

export const mpuUnitId: MPUUnitId = 228;
export const leaderboardUnitId: LeaderboardUnitId = 229;
export const billboardUnitId: BillboardUnitId = 229;
