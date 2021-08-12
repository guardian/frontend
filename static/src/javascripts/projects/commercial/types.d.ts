type AdSizes = Record<string, AdSize[]>;
type AdSize = SingleSizeArray | NamedSize;

type SingleSizeArray = number[];
type NamedSize = 'fluid';
type MultiSize = AdSize[];
type GeneralSize = AdSize | MultiSize;
type SizeMapping = GeneralSize[];

type ResponseInformation = {
	advertiserId: string;
	campaignId: string;
	creativeId: number | null | undefined;
	labelIds: number[] | null | undefined;
	lineItemId: number | null | undefined;
};

type SafeFrameConfig = {
	allowOverlayExpansion: boolean;
	allowPushExpansion: boolean;
	sandbox: boolean;
};

type AddService = (s: string) => Slot;
type ClearCategoryExclusions = () => Slot;
type ClearTargeting = (s?: string) => Slot;
type DefineSizeMapping = (asm: SizeMapping[]) => Slot;
type Get = (s: string) => string | null | undefined;
type GetString = () => string;
type GetStrings = () => string[];
type GetResponseInformation = () => ResponseInformation | null | undefined;
type GetTargeting = (s: string) => string[];
type Set = (s1: string, s2: string) => Slot;
type SetString = (s: string) => Slot;
type SetCollapseEmptyDiv = (b1: boolean, b2: boolean) => Slot;
type SetForceSafeFrame = (b1: boolean) => Slot;
type SetSafeFrameConfig = (sfc: SafeFrameConfig) => Slot;
type SetTargeting = (s: string, a: string | string[]) => Slot;

type Slot = {
	addService: AddService;
	clearCategoryExclusions: ClearCategoryExclusions;
	clearTargeting: ClearTargeting;
	defineSizeMapping: DefineSizeMapping;
	get: Get;
	getAdUnitPath: GetString;
	getAttributeKeys: GetStrings;
	getCategoryExclusions: GetStrings;
	getOutOfPage: () => boolean;
	getResponseInformation: GetResponseInformation;
	getSlotElementId: GetString;
	getTargeting: GetTargeting;
	getTargetingKeys: GetStrings;
	set: Set;
	setCategoryExclusion: SetString;
	setClickUrl: SetString;
	setCollapseEmptyDiv: SetCollapseEmptyDiv;
	setForceSafeFrame: SetForceSafeFrame;
	setSafeFrameConfig: SetSafeFrameConfig;
	setTargeting: SetTargeting;
};

type SlotOnloadEvent = {
	serviceName: string;
	slot: Slot;
};

type SlotRenderEndedEvent = {
	advertiserId?: number;
	campaignId?: number;
	creativeId?: number;
	isEmpty: boolean;
	lineItemId?: number;
	serviceName: string;
	size: AdSize;
	slot: Slot;
	sourceAgnosticCreativeId?: number;
	sourceAgnosticLineItemId?: number;
};

type ImpressionViewableEvent = {
	serviceName: string;
	slot: Slot;
};

type ImpressionViewableEventCallback = (arg0: ImpressionViewableEvent) => void;

type SlotVisibilityChangedEvent = {
	inViewPercentage: number;
	serviceName: string;
	slot: Slot;
};

/**
 * Strings that represent possible ad sizes
 *
 * Examples: `fluid` `320,50` `728,90`
 */
type GuAdSizeString = 'fluid' | `${number},${number}`;

type GuAdSize = Readonly<{
	width: number;
	height: number;
	toString: () => GuAdSizeString;
}>;
