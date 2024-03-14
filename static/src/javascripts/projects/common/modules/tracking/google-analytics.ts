import {
	getConsentFor,
	onConsentChange,
} from '@guardian/libs';
import { mediator } from 'lib/mediator';

export const init = (): void => {
	onConsentChange((state) => {
		const gaHasConsent = getConsentFor('google-analytics', state);
		mediator.emit('ga:gaConsentChange', gaHasConsent);
	});
};
