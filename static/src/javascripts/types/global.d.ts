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
