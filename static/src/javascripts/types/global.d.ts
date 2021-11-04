type ServerSideABTest = `${string}${'Variant' | 'Control'}`;

declare const twttr: {
	widgets?: {
		load?: (arg0: Element | null | undefined) => void;
	};
};

declare type TagAtrribute = {
	name: string;
	value: string;
};

declare type ThirdPartyTag = {
	shouldRun: boolean;
	url?: string;
	name?: string;
	onLoad?: () => void;
	beforeLoad?: () => void;
	useImage?: boolean;
	attrs?: TagAtrribute[];
	async?: boolean;
	loaded?: boolean;
	insertSnippet?: () => void;
};

declare const jsdom: {
	reconfigure: (settings: Record<string, unknown>) => void;
};

declare module '*.svg' {
	const content: { markup: string };
	// eslint-disable-next-line import/no-default-export -- allow svg imports
	export default content;
}

declare module 'ophan/ng' {
	const ophan: Ophan;
	// eslint-disable-next-line import/no-default-export -- that’s the ophan way
	export default ophan;
}

// This comes from Scala:
// https://github.com/guardian/frontend/blob/main/common/app/common/commercial/PrebidIndexSite.scala#L10
// https://github.com/guardian/frontend/blob/main/common/app/views/support/JavaScriptPage.scala#L54
type PrebidBreakpoint = 'D' | 'T' | 'M';
type PrebidIndexSite = {
	bp: PrebidBreakpoint;
	id: number;
};

// This comes from Scala:
// https://github.com/guardian/frontend/blob/main/common/app/model/meta.scala#L349
type AdUnit = string;

interface CommercialPageConfig {
	pbIndexSites: PrebidIndexSite[];
	adUnit: AdUnit;
	appNexusPageTargeting?: string;
	sharedAdTargeting?: Record<string, string | string[]>;
	pageAdTargeting?: Record<string, string | string[]>;
}

interface Config {
	ophan: {
		// somewhat redundant with guardian.ophan
		pageViewId: string;
		browserId?: string;
	};
	page: PageConfig;
	switches: Record<string, boolean | undefined>;
	tests?: Record<ServerSideABTest, 'control' | 'variant'>;
	isDotcomRendering: boolean;
}

type Edition = string; // https://github.com/guardian/frontend/blob/b952f6b9/common/app/views/support/JavaScriptPage.scala#L79

interface PageConfig extends CommercialPageConfig {
	edition: Edition;
	isDev: boolean; // https://github.com/guardian/frontend/blob/33db7bbd/common/app/views/support/JavaScriptPage.scala#L73
	isSensitive: boolean;
	isFront: boolean; // https://github.com/guardian/frontend/blob/201cc764/common/app/model/meta.scala#L352
	ajaxUrl: string; // https://github.com/guardian/frontend/blob/33db7bbd/common/app/views/support/JavaScriptPage.scala#L72
	isHosted: boolean; // https://github.com/guardian/frontend/blob/66afe02e/common/app/common/commercial/hosted/HostedMetadata.scala#L37
	hasPageSkin: boolean; //https://github.com/guardian/frontend/blob/b952f6b9/common/app/views/support/JavaScriptPage.scala#L48
	assetsPath: string;
	frontendAssetsFullURL?: string; // only in DCR
	dfpNonRefreshableLineItemIds?: string[];
	section: string;
	isPaidContent: boolean;
	isSensitive: boolean;
	videoDuration: number;
	source: string;
	pageId: string;
	authorIds: string;
	blogIds: string;
	contentType: string;
	keywordIds: string;
	publication: string;
	seriesId: string;
	sponsorshipType: string;
	tones: string;
}

interface Ophan {
	setEventEmitter: unknown;
	trackComponentAttention: unknown;
	record: (...args: unknown[]) => void;
	viewId: unknown;
	pageViewId: string;
}

interface ImpressionsDfpObject {
	s: string; // Slot element ID
	ad: string; // Advertiser ID
	c: string; // Creative ID
	I: string; // Line item ID
	o: string; // Order ID
	A: string; // Ad unit name
	y: string; // Yield group ID (Exchange Bidder)
	co: string; // DFP Company ID (Exchange Bidder)
}

enum BlockingType {
	Manual = 1, // Deprecated
	Creative, // Creative-based detection
	ProviderSecurity, // Domain-based detection for unsafe domains
	BannedDomain, // Domain-based detection for banned domains
	ProviderIbv, // Domain-based detection for in-banner-video
	UnsafeJS, // JavaScript-based detection for unsafe ads
	Hrap, // Domain-based detection for high risk ad platform domains
}

type ConfiantCallback = (
	blockingType: BlockingType,
	blockingId: string,
	isBlocked: boolean,
	wrapperId: string,
	tagId: string,
	impressionsData?: {
		prebid?: {
			adId?: string | null;
			cpm?: number | null; // IN USD
			s?: string; // slot ID
		};
		dfp?: ImpressionsDfpObject;
	},
) => void;

interface Confiant extends Record<string, unknown> {
	settings: {
		callback: ConfiantCallback;
		[key: string]: unknown;
	};
}

type AdBlockers = {
	active: boolean | undefined;
	onDetect: function[];
};

interface Window {
	// eslint-disable-next-line id-denylist -- this *is* the guardian object
	guardian: {
		ophan: Ophan;
		config: Config;
		queue: Array<() => Promise<void>>;
		mustardCut?: boolean;
		polyfilled?: boolean;
		adBlockers: AdBlockers;
	};

	confiant?: Confiant;
}
