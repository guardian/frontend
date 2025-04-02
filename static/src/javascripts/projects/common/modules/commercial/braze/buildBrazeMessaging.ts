import { log, storage } from '@guardian/libs';
import { reportError } from 'lib/report-error';
import { checkBrazeDependencies } from './checkBrazeDependencies';
import {
	clearHasCurrentBrazeUser,
	hasCurrentBrazeUser,
} from './hasCurrentBrazeUser';

const SDK_OPTIONS = {
	enableLogging: false,
	noCookies: true,
	baseUrl: 'https://sdk.fra-01.braze.eu/api/v3',
	sessionTimeoutInSeconds: 1,
	minimumIntervalBetweenTriggerActionsInSeconds: 0,
	devicePropertyAllowlist: [],
};

const localStorageKeyBase = 'gu.brazeMessageCache';
const clearLocalMessageCache = (): void => {
	const slotNames = ['Banner', 'EndOfArticle'];
	slotNames.forEach((slotName) => {
		const key = `${localStorageKeyBase}.${slotName}`;
		storage.local.remove(key);
	});
};

const maybeWipeUserData = async (
	apiKey: string | undefined,
	brazeUuid: string | undefined,
	consent: boolean,
) => {
	const userHasLoggedOut = !brazeUuid && hasCurrentBrazeUser();
	const userHasRemovedConsent = !consent && hasCurrentBrazeUser();

	if (userHasLoggedOut || userHasRemovedConsent) {
		try {
			const { default: importedBraze } = await import(
				/* webpackChunkName: "braze-web-sdk" */ '@braze/web-sdk'
			);
			if (apiKey) {
				importedBraze.initialize(apiKey, SDK_OPTIONS);
				importedBraze.wipeData();
			}

			clearLocalMessageCache();

			clearHasCurrentBrazeUser();

			log('tx', 'Cleared local Braze data');
		} catch (error) {
			reportError(error, {}, false);
		}
	}
};

export const handleBraze = async (): Promise<void> => {
	const dependenciesResult = await checkBrazeDependencies();

	if (!dependenciesResult.isSuccessful) {
		const { data } = dependenciesResult;

		await maybeWipeUserData(
			data.apiKey as string | undefined,
			data.brazeUuid as string | undefined,
			data.consent as boolean,
		);
	}
};
