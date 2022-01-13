import type {
	ConsentState,
	Framework,
} from '@guardian/consent-management-platform/dist/types';

type ConsentStateEnhanced = ConsentState & {
	canTarget: boolean;
	framework: Framework | null;
};

export { ConsentStateEnhanced };
