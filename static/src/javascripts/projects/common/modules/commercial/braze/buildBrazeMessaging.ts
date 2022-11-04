import type { BrazeMessagesInterface } from '@guardian/braze-components';
import {
	BrazeMessages,
	LocalMessageCache,
	NullBrazeMessages,
} from '@guardian/braze-components/logic';
import { log } from '@guardian/libs';
import ophan from 'ophan/ng';
import config from '../../../../../lib/config';
import { reportError } from '../../../../../lib/report-error';
import { measureTiming } from '../../../../commercial/modules/measure-timing';
import { getBrazeUuid } from './getBrazeUuid';
import {
	clearHasCurrentBrazeUser,
	hasCurrentBrazeUser,
	setHasCurrentBrazeUser,
} from './hasCurrentBrazeUser';
import { hasRequiredConsents } from './hasRequiredConsents';

const SDK_OPTIONS = {
	enableLogging: false,
	noCookies: true,
	baseUrl: 'https://sdk.fra-01.braze.eu/api/v3',
	sessionTimeoutInSeconds: 1,
	minimumIntervalBetweenTriggerActionsInSeconds: 0,
	devicePropertyAllowlist: [],
};

const maybeWipeUserData = async (
	apiKey: string,
	brazeUuid: string | undefined,
	consent: boolean,
) => {
	const userHasLoggedOut = !brazeUuid && hasCurrentBrazeUser();
	const userHasRemovedConsent = !consent && hasCurrentBrazeUser();

	if (userHasLoggedOut || userHasRemovedConsent) {
		try {
			const { default: importedAppboy } = await import(
				/* webpackChunkName: "braze-web-sdk-core" */ '@braze/web-sdk-core'
			);
			importedAppboy.initialize(apiKey, SDK_OPTIONS);
			importedAppboy.wipeData();

			LocalMessageCache.clear();

			clearHasCurrentBrazeUser();

			log('tx', 'Cleared local Braze data');
		} catch (error) {
			reportError(error, {}, false);
		}
	}
};

export const buildBrazeMessaging =
	async (): Promise<BrazeMessagesInterface> => {
		// Check dependencies
		const brazeSwitch: string | undefined = config.get(
			'switches.brazeSwitch',
		);
		const apiKey: string | undefined = config.get('page.brazeApiKey');
		const isBrazeConfigured = brazeSwitch && apiKey;
		if (!isBrazeConfigured) {
			log('tx', 'Braze is not configured, not loading Braze SDK');
			return new NullBrazeMessages();
		}

		const [brazeUuid, hasGivenConsent] = await Promise.all([
			getBrazeUuid(),
			hasRequiredConsents(),
		]);

		await maybeWipeUserData(apiKey, brazeUuid, hasGivenConsent);

		if (!(brazeUuid && hasGivenConsent)) {
			log(
				'tx',
				"User is not logged in or hasn't given consent, not loading Braze SDK",
			);
			return new NullBrazeMessages();
		}

		// Don't load Braze SDK for paid content
		if (config.get('page.isPaidContent')) {
			log('tx', 'Page isPaidContent, not loading Braze SDK');
			return new NullBrazeMessages();
		}
		// End check dependencies

		const sdkLoadTiming = measureTiming('braze-sdk-load');
		sdkLoadTiming.start();

		// Load and initialize SDK
		const { default: importedAppboy } = await import(
			/* webpackChunkName: "braze-web-sdk-core" */ '@braze/web-sdk-core'
		);

		const sdkLoadTimeTaken = sdkLoadTiming.end();
		ophan.record({
			component: 'braze-sdk-load-timing',
			value: sdkLoadTimeTaken,
		});

		importedAppboy.initialize(apiKey, SDK_OPTIONS);

		const errorHandler = (error: Error) => {
			reportError(error, {}, false);
		};
		const brazeMessages = new BrazeMessages(
			importedAppboy,
			LocalMessageCache,
			errorHandler,
		);

		setHasCurrentBrazeUser();
		importedAppboy.changeUser(brazeUuid);
		importedAppboy.openSession();
		// End Load and initialize SDK

		return brazeMessages;
	};
