import type { BrazeMessagesInterface } from '@guardian/braze-components';
import {
	BrazeMessages,
	LocalMessageCache,
	NullBrazeMessages,
} from '@guardian/braze-components/logic';
import { log } from '@guardian/libs';
import ophan from 'ophan/ng';
import { reportError } from '../../../../../lib/report-error';
import { measureTiming } from '../../../../commercial/modules/measure-timing';
import { checkBrazeDependencies } from './checkBrazeDependencies';
import {
	clearHasCurrentBrazeUser,
	hasCurrentBrazeUser,
	setHasCurrentBrazeUser,
} from './hasCurrentBrazeUser';

const SDK_OPTIONS = {
	enableLogging: false,
	noCookies: true,
	baseUrl: 'https://sdk.fra-01.braze.eu/api/v3',
	sessionTimeoutInSeconds: 1,
	minimumIntervalBetweenTriggerActionsInSeconds: 0,
	devicePropertyAllowlist: [],
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
			const { default: importedAppboy } = await import(
				/* webpackChunkName: "braze-web-sdk-core" */ '@braze/web-sdk-core'
			);
			if (apiKey) {
				importedAppboy.initialize(apiKey, SDK_OPTIONS);
				importedAppboy.wipeData();
			}

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
		// New check dependencies
		const dependenciesResult = await checkBrazeDependencies();

		if (!dependenciesResult.isSuccessful) {
			const { failure, data } = dependenciesResult;

			log(
				'tx',
				`Not attempting to show Braze messages. Dependency ${
					failure.field
				} failed with ${String(failure.data)}.`,
			);

			await maybeWipeUserData(
				data.apiKey as string | undefined,
				data.brazeUuid as string | undefined,
				data.consent as boolean,
			);

			return new NullBrazeMessages();
		}

		const sdkLoadTiming = measureTiming('braze-sdk-load');
		sdkLoadTiming.start();

		const { default: importedAppboy } = await import(
			/* webpackChunkName: "braze-web-sdk-core" */ '@braze/web-sdk-core'
		);

		const sdkLoadTimeTaken = sdkLoadTiming.end();
		ophan.record({
			component: 'braze-sdk-load-timing',
			value: sdkLoadTimeTaken,
		});

		importedAppboy.initialize(
			dependenciesResult.data.apiKey as string,
			SDK_OPTIONS,
		);

		const errorHandler = (error: Error) => {
			reportError(error, {}, false);
		};
		const brazeMessages = new BrazeMessages(
			importedAppboy,
			LocalMessageCache,
			errorHandler,
		);

		setHasCurrentBrazeUser();
		importedAppboy.changeUser(dependenciesResult.data.brazeUuid as string);
		importedAppboy.openSession();

		return brazeMessages;
	};
