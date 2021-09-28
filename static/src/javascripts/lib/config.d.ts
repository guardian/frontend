declare function get<T>(path: string): T | undefined;
declare function get<T>(path: string, defaultValue: T): T;
declare const set: (path: string, defaultValue?: unknown) => void;
declare const hasTone: (s: string) => boolean;
declare const hasSeries: (s: string) => boolean;
declare const referenceOfType: (name: string) => string;
declare const referencesOfType: (name: string) => string[];
declare const webPublicationDateAsUrlPart: () => string | null;
declare const dateFromSlug: () => string | null;

// eslint-disable-next-line import/no-default-export -- it’s a declaration
export default {
	get,
	set,
	hasTone,
	hasSeries,
	referenceOfType,
	referencesOfType,
	webPublicationDateAsUrlPart,
	dateFromSlug,
};
