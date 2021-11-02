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
