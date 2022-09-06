import { onConsentChange } from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { once } from 'lodash-es';

let initialConsentState: ConsentState | undefined;

/**
 * If consent has been set, and if consent then changes, reload the page so the correct
 * state is reflected in the rendered page
 */
const _reloadPageOnConsentChange = (): void => {
	onConsentChange((consent) => {
		if (initialConsentState === undefined) {
			initialConsentState = consent;
		}
		if (initialConsentState.canTarget !== consent.canTarget) {
			window.location.reload();
		}
	});
};

const reloadPageOnConsentChange = once(() =>
	Promise.resolve(_reloadPageOnConsentChange()),
);

export { reloadPageOnConsentChange };
