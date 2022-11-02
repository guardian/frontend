import type { BrazeMessage } from '@guardian/braze-components';
import {
	BrazeMessages,
	LocalMessageCache,
} from '@guardian/braze-components/logic';
import { onConsentChange } from '@guardian/consent-management-platform';
import ophan from 'ophan/ng';
import React from 'react';
import { getUserIdentifiersFromApi } from 'common/modules/identity/api';
import config from '../../../../../lib/config';
import { reportError } from '../../../../../lib/report-error';
import { measureTiming } from '../../../../commercial/modules/measure-timing';
import { submitComponentEvent, submitViewEvent } from '../acquisitions-ophan';
import {
	clearHasCurrentBrazeUser,
	hasCurrentBrazeUser,
	setHasCurrentBrazeUser,
} from './hasCurrentBrazeUser';

const brazeVendorId = '5ed8c49c4b8ce4571c7ad801';

const getBrazeUuid = (): Promise<string | undefined> =>
	new Promise((resolve) => {
		getUserIdentifiersFromApi((userIdentifiers) => {
			if (userIdentifiers?.brazeUuid) {
				resolve(userIdentifiers.brazeUuid);
			} else {
				resolve(undefined);
			}
		});
	});

const hasRequiredConsents = (): Promise<boolean> =>
	new Promise((resolve) => {
		onConsentChange(({ tcfv2, ccpa, aus }) => {
			if (tcfv2) {
				resolve(tcfv2.vendorConsents[brazeVendorId]);
			} else if (ccpa) {
				resolve(!ccpa.doNotSell);
			} else if (aus) {
				resolve(aus.personalisedAdvertising);
			} else {
				resolve(false);
			}
		});
	});

// Note on BrazeMessageInterface vs BrazeMessage:
// BrazeMessage is the actual class which we wrap messages in returned from the
// Braze SDK (in @guardian/braze-components). BrazeMessageInterface represents
// the public interface supplied by instances of that class. In the message
// forcing logic it's hard to create and return a BrazeMessage from the forced
// json. A better approach would probably be to change the code in
// @guardian/braze-components to return a BrazeMessageInterface (which an
// instance of BrazeMessage would conform to) and at least the type definitions
// would all live in one centralised place.
interface BrazeMessageInterface {
	extras: Record<string, string> | undefined;
	logImpression: () => void;
	logButtonClick: (internalButtonId: number) => void;
}

let message: BrazeMessageInterface | undefined;

const FORCE_BRAZE_ALLOWLIST = [
	'preview.gutools.co.uk',
	'preview.code.dev-gutools.co.uk',
	'localhost',
	'm.thegulocal.com',
];

const isExtrasData = (data: unknown): data is Record<string, string> => {
	if (typeof data === 'object' && data != null) {
		return Object.values(data).every((value) => typeof value === 'string');
	}
	return false;
};

const getMessageFromUrlFragment = (): BrazeMessageInterface | undefined => {
	if (window.location.hash) {
		// This is intended for use on development domains for preview purposes.
		// It won't run in PROD.

		const key = 'force-braze-message';

		const hashString = window.location.hash;

		if (hashString.includes(key)) {
			if (!FORCE_BRAZE_ALLOWLIST.includes(window.location.hostname)) {
				console.log(`${key} is not supported on this domain`);
				return;
			}

			const forcedMessage = hashString.slice(
				hashString.indexOf(`${key}=`) + key.length + 1,
				hashString.length,
			);

			try {
				const dataFromBraze = JSON.parse(
					decodeURIComponent(forcedMessage),
				) as unknown;

				if (isExtrasData(dataFromBraze)) {
					return {
						extras: dataFromBraze,
						logImpression: () => {
							return;
						},
						logButtonClick: () => {
							return;
						},
					};
				}
			} catch (e) {
				// Parsing failed. Log a message and fall through.
				if (e instanceof Error) {
					console.log(`There was an error with ${key}:`, e.message);
				}
			}
		}
	}

	return;
};

const SDK_OPTIONS = {
	enableLogging: false,
	noCookies: true,
	baseUrl: 'https://sdk.fra-01.braze.eu/api/v3',
	sessionTimeoutInSeconds: 1,
	minimumIntervalBetweenTriggerActionsInSeconds: 0,
	devicePropertyAllowlist: [],
};

const getMessageFromBraze = async (
	apiKey: string,
	brazeUuid: string,
): Promise<BrazeMessage> => {
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

	const appboyTiming = measureTiming('braze-appboy');
	appboyTiming.start();

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

	const section = config.get('page.section');
	const brazeArticleContext =
		typeof section === 'string' ? { section } : undefined;

	const canShowPromise =
		brazeMessages.getMessageForBanner(brazeArticleContext);

	canShowPromise
		.then(() => {
			const appboyTimeTaken = appboyTiming.end();

			ophan.record({
				component: 'braze-appboy-timing',
				value: appboyTimeTaken,
			});
		})
		.catch(() => {
			appboyTiming.clear();
			console.log('Appboy Timing failed.');
		});

	return canShowPromise;
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
		} catch (error) {
			reportError(error, {}, false);
		}
	}
};

const canShow = async (): Promise<boolean> => {
	const bannerTiming = measureTiming('braze-banner');
	bannerTiming.start();

	const forcedBrazeMessage = getMessageFromUrlFragment();
	if (forcedBrazeMessage) {
		message = forcedBrazeMessage;
		return true;
	}

	const brazeSwitch: string | undefined = config.get('switches.brazeSwitch');
	const apiKey: string | undefined = config.get('page.brazeApiKey');
	const isBrazeConfigured = brazeSwitch && apiKey;
	if (!isBrazeConfigured) {
		return false;
	}

	const [brazeUuid, hasGivenConsent] = await Promise.all([
		getBrazeUuid(),
		hasRequiredConsents(),
	]);

	await maybeWipeUserData(apiKey, brazeUuid, hasGivenConsent);

	if (!(brazeUuid && hasGivenConsent)) {
		return false;
	}

	// Don't load Braze SDK for paid content
	if (config.get('page.isPaidContent')) {
		return false;
	}

	try {
		message = await getMessageFromBraze(apiKey, brazeUuid);

		const timeTaken = bannerTiming.end();
		if (timeTaken) {
			ophan.record({
				component: 'braze-banner-timing',
				value: timeTaken,
			});
		}

		return true;
	} catch (e) {
		bannerTiming.clear();
		return false;
	}
};

const renderBanner = (
	extras: Record<string, string>,
	message: BrazeMessageInterface,
) => {
	Promise.all([
		import('react-dom'),
		import('@emotion/react'),
		import('@emotion/cache'),
		import(
			/* webpackChunkName: "guardian-braze-components-banner" */ '@guardian/braze-components/banner'
		),
	])
		.then((props) => {
			const [
				{ render },
				{ CacheProvider },
				{ default: createCache },
				brazeModule,
			] = props;
			const container = document.createElement('div');
			container.classList.add('site-message--banner');

			document.body.appendChild(container);

			const Component = brazeModule.BrazeBannerComponent;

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- IE does not support shadow DOM, so instead we just render
			if (!container.attachShadow) {
				render(
					<Component
						componentName={extras.componentName}
						logButtonClickWithBraze={(buttonId) => {
							message.logButtonClick(buttonId);
						}}
						submitComponentEvent={submitComponentEvent}
						brazeMessageProps={extras}
					/>,
					container,
				);
			} else {
				const shadowRoot = container.attachShadow({ mode: 'open' });
				const inner = shadowRoot.appendChild(
					document.createElement('div'),
				);
				const renderContainer = inner.appendChild(
					document.createElement('div'),
				);

				const emotionCache = createCache({
					key: 'site-message',
					container: inner,
				});

				const cached = (
					<CacheProvider value={emotionCache}>
						<Component
							componentName={extras.componentName}
							logButtonClickWithBraze={(buttonId) => {
								message.logButtonClick(buttonId);
							}}
							submitComponentEvent={submitComponentEvent}
							brazeMessageProps={extras}
						/>
					</CacheProvider>
				);

				render(cached, renderContainer);
			}

			// Log the impression with Braze
			message.logImpression();

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- in general the Braze extras data should include the ophanComponentId, but it's not guaranteed
			const componentId = extras.ophanComponentId ?? extras.componentName;
			// Log the impression with Ophan
			submitViewEvent({
				component: {
					componentType: 'RETENTION_ENGAGEMENT_BANNER',
					id: componentId,
				},
			});

			return true;
		})
		.catch((error) => {
			if (error instanceof Error) {
				const msg = `Error with remote Braze component: ${error.message}`;
				reportError(new Error(msg), {}, false);
			}

			return false;
		});
};

const show = (): void => {
	if (message?.extras) {
		renderBanner(message.extras, message);
	}
};

const brazeBanner = {
	id: 'brazeBanner',
	show,
	canShow,
};

export { brazeBanner, brazeVendorId, hasRequiredConsents };
