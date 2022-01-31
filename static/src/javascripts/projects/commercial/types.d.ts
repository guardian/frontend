type AdSizes = Record<string, AdSize[]>;
/**
 * Subtype of googletag.SizeMappingArray
 */
type AdSize = AdSizeTuple | 'fluid';
type AdSizeTuple = [width: number, height: number];

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

type GuAdSize = {
	width: number;
	height: number;
	toString: (_: void) => string;
};

type RuleSpacing = {
	minAbove: number;
	minBelow: number;
};

type SpacefinderItem = {
	top: number;
	bottom: number;
	element: HTMLElement;
};

type SpacefinderRules = {
	bodySelector: string;
	body?: Node;
	slotSelector: string;
	// minimum from slot to top of page
	absoluteMinAbove?: number;
	// minimum from para to top of article
	minAbove: number;
	// minimum from (top of) para to bottom of article
	minBelow: number;
	// vertical px to clear the content meta element (byline etc) by. 0 to ignore
	// used for carrot ads
	clearContentMeta?: number;
	// custom rules using selectors.
	selectors: Record<string, RuleSpacing>;
	// will run each slot through this fn to check if it must be counted in
	filter?: (x: SpacefinderItem) => boolean;
	// will remove slots before this one
	startAt?: HTMLElement;
	// will remove slots from this one on
	stopAt?: HTMLElement;
	// will reverse the order of slots (this is useful for lazy loaded content)
	fromBottom?: boolean;
};

type SpacefinderWriter = (paras: HTMLElement[]) => void;

type SpacefinderOptions = {
	waitForLinks?: boolean;
	waitForImages?: boolean;
	waitForInteractives?: boolean;
};
