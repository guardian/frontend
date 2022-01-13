import type { ConsentState } from '@guardian/consent-management-platform/dist/types';

type ConsentStateEnhanced = ConsentState & { canTarget: boolean };

export { ConsentStateEnhanced };
