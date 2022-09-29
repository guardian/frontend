import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import type { PageTargeting } from 'common/modules/commercial/build-page-targeting';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';

const buildPageParameters = (consentState: ConsentState): PageTargeting => {
	return getPageTargeting(consentState);
};

export { buildPageParameters };
