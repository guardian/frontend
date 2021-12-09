import { onConsentChange } from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';

export const getInitialConsentState = (): Promise<ConsentState> => {
	let resolveInitialState: (state: ConsentState) => void;
	let rejectInitialState: (reason: 'Unknown framework') => void;
	const promise = new Promise<ConsentState>((resolve, reject) => {
		resolveInitialState = resolve;
		rejectInitialState = reject;
	});

	onConsentChange((state) => {
		if (state.tcfv2) {
			// For tcfv2 only, the first onConsentChange is fired before the user has
			// interacted this the consent banner. We want to ignore this.
			if (state.tcfv2.eventStatus !== 'cmpuishown')
				resolveInitialState({ tcfv2: state.tcfv2 });
			else return;
		}
		if (state.ccpa) {
			resolveInitialState({ ccpa: state.ccpa });
		}
		if (state.aus) {
			resolveInitialState({ aus: state.aus });
		}

		rejectInitialState('Unknown framework');
	});

	return promise;
};
