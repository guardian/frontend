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
}

interface Config {
	ophan: {
		// somewhat redundant with guardian.ophan
		pageViewId: string;
		browserId?: string;
	};
	page: PageConfig;
	switches: Record<string, boolean | undefined>;
	tests?: Record<string, 'control' | 'variant'>;
	isDotcomRendering: boolean;
}

interface PageConfig extends CommercialPageConfig {
	isDev: boolean; // https://github.com/guardian/frontend/blob/33db7bbd/common/app/views/support/JavaScriptPage.scala#L73
	isSensitive: boolean;
	isFront: boolean; // https://github.com/guardian/frontend/blob/201cc764/common/app/model/meta.scala#L352
	ajaxUrl: string; // https://github.com/guardian/frontend/blob/33db7bbd/common/app/views/support/JavaScriptPage.scala#L72
	isHosted: boolean; // https://github.com/guardian/frontend/blob/66afe02e/common/app/common/commercial/hosted/HostedMetadata.scala#L37
	assetsPath: string;
	frontendAssetsFullURL?: string; // only in DCR
}

interface Ophan {
	setEventEmitter: unknown;
	trackComponentAttention: unknown;
	record: (...args: unknown[]) => void;
	viewId: unknown;
	pageViewId: string;
}

interface Window {
	// eslint-disable-next-line id-denylist -- this *is* the guardian object
	guardian: {
		ophan: Ophan;
		config: Config;
		queue: Array<() => Promise<void>>;
		mustardCut?: boolean;
		polyfilled?: boolean;
	};
}
