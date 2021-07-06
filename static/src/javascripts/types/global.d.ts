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
	const ophan: {
		setEventEmitter: unkown;
		trackComponentAttention: unkown;
		record: (...args: unkown[]) => void;
		viewId: unkown;
		pageViewId: string;
	};
	// eslint-disable-next-line import/no-default-export -- that’s the ophan way
	export default ophan;
}

// This comes from Scala:
// https://github.com/guardian/frontend/tree/main/common/app/common/commercial/PrebidIndexSite.scala#L10
// https://github.com/guardian/frontend/tree/main/common/app/views/support/JavaScriptPage.scala#L54
type PrebidBreakpoint = 'D' | 'T' | 'M';
type PrebidIndexSite = {
	bp: PrebidBreakpoint;
	id: number;
};

interface Window {
	// eslint-disable-next-line id-denylist -- this *is* the guardian object
	guardian: {
		ophan?: {
			viewId: string;
			pageViewId: string;
		};
		config: {
			page: {
				pbIndexSites: PrebidIndexSite[];
			};
			switches: Record<string, boolean | undefined>;
		};
	};
}
