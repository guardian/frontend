import React from 'react';

import { onConsentChange } from '@guardian/consent-management-platform';
import { storage } from '@guardian/libs';
import { shouldNotBeShownSupportMessaging } from 'common/modules/commercial/user-features';
import ophan from 'ophan/ng';
import config from '../../../../../lib/config';
import reportError from '../../../../../lib/report-error';
import { getUrlVars } from '../../../../../lib/url';
import { submitComponentEvent, submitViewEvent } from '../acquisitions-ophan';
import { getUserFromApi } from '../../identity/api';
import {
	clearHasCurrentBrazeUser,
	hasCurrentBrazeUser,
	setHasCurrentBrazeUser,
} from './hasCurrentBrazeUser';
import { measureTiming } from '../../../../commercial/modules/measure-timing';
import {
	BrazeMessages,
	LocalMessageCache,
} from '@guardian/braze-components/logic';
import { getUserIdentifiersFromApi } from 'common/modules/identity/api';

const brazeVendorId = '5ed8c49c4b8ce4571c7ad801';

const getBrazeUuid = () =>
	new Promise((resolve) => {
		getUserIdentifiersFromApi((userIdentifiers) => {
			if (userIdentifiers?.brazeUuid) {
				resolve(userIdentifiers.brazeUuid);
			} else {
				resolve();
			}
		});
	});

const hasRequiredConsents = () =>
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

let message;

const FORCE_BRAZE_ALLOWLIST = [
	'preview.gutools.co.uk',
	'preview.code.dev-gutools.co.uk',
	'localhost',
	'm.thegulocal.com',
];

const getMessageFromUrlFragment = () => {
	if (window.location.hash) {
		// This is intended for use on development domains for preview purposes.
		// It won't run in PROD.

		const key = 'force-braze-message';

		const hashString = window.location.hash;

		if (hashString.includes(key)) {
			if (!FORCE_BRAZE_ALLOWLIST.includes(window.location.hostname)) {
				console.log(`${key} is not supported on this domain`);
				return null;
			}

			const forcedMessage = hashString.slice(
				hashString.indexOf(`${key}=`) + key.length + 1,
				hashString.length,
			);

			try {
				const dataFromBraze = JSON.parse(
					decodeURIComponent(forcedMessage),
				);
				return {
					extras: dataFromBraze,
					logImpression: () => {},
					logButtonClick: () => {},
				};
			} catch (e) {
				// Parsing failed. Log a message and fall through.
				console.log(`There was an error with ${key}:`, e.message);
			}
		}
	}

	return null;
};

const SDK_OPTIONS = {
	enableLogging: false,
	noCookies: true,
	baseUrl: 'https://sdk.fra-01.braze.eu/api/v3',
	sessionTimeoutInSeconds: 1,
	minimumIntervalBetweenTriggerActionsInSeconds: 0,
	devicePropertyAllowlist: [],
};

const getMessageFromBraze = async (apiKey, brazeUuid) => {
	const sdkLoadTiming = measureTiming('braze-sdk-load');
	sdkLoadTiming.start();

	const appboy = await import(
		/* webpackChunkName: "braze-web-sdk-core" */ '@braze/web-sdk-core'
	);

	const sdkLoadTimeTaken = sdkLoadTiming.end();
	ophan.record({
		component: 'braze-sdk-load-timing',
		value: sdkLoadTimeTaken,
	});

	const appboyTiming = measureTiming('braze-appboy');
	appboyTiming.start();

	appboy.initialize(apiKey, SDK_OPTIONS);

	const errorHandler = (error) => {
		reportError(error, {}, false);
	};
	const brazeMessages = new BrazeMessages(
		appboy,
		LocalMessageCache,
		errorHandler,
	);

	setHasCurrentBrazeUser();
	appboy.changeUser(brazeUuid);
	appboy.openSession();

	const brazeArticleContext = {
		section: config.get('page.section'),
	};

	const canShowPromise = brazeMessages
		.getMessageForBanner(brazeArticleContext)
		.then((m) => {
			message = m;
			return true;
		});

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

const maybeWipeUserData = async (apiKey, brazeUuid, consent) => {
	const userHasLoggedOut = !brazeUuid && hasCurrentBrazeUser();
	const userHasRemovedConsent = !consent && hasCurrentBrazeUser();

	if (userHasLoggedOut || userHasRemovedConsent) {
		try {
			const appboy = await import(
				/* webpackChunkName: "braze-web-sdk-core" */ '@braze/web-sdk-core'
			);
			appboy.initialize(apiKey, SDK_OPTIONS);
			appboy.wipeData();

			LocalMessageCache.clear();

			clearHasCurrentBrazeUser();
		} catch (error) {
			reportError(error, {}, false);
		}
	}
};

const canShow = async () => {
	const bannerTiming = measureTiming('braze-banner');
	bannerTiming.start();

	const forcedBrazeMessage = getMessageFromUrlFragment();
	if (forcedBrazeMessage) {
		message = forcedBrazeMessage;
		return true;
	}

	const brazeSwitch = config.get('switches.brazeSwitch');
	const apiKey = config.get('page.brazeApiKey');
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
	if (config.get('page').isPaidContent) {
		return false;
	}

	try {
		const result = await getMessageFromBraze(apiKey, brazeUuid);
		const timeTaken = bannerTiming.end();

		if (timeTaken) {
			ophan.record({
				component: 'braze-banner-timing',
				value: timeTaken,
			});
		}

		return result;
	} catch (e) {
		bannerTiming.clear();
		return false;
	}
};

const show = () =>
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

			// The condition here is to keep flow happy
			if (document.body) {
				document.body.appendChild(container);
			}

			const Component = brazeModule.BrazeBannerComponent;

			// IE does not support shadow DOM, so instead we just render
			if (!container.attachShadow) {
				render(
					<Component
						componentName={message.extras.componentName}
						logButtonClickWithBraze={(buttonId) => {
							message.logButtonClick(buttonId);
						}}
						submitComponentEvent={submitComponentEvent}
						brazeMessageProps={message.extras}
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
							componentName={message.extras.componentName}
							logButtonClickWithBraze={(buttonId) => {
								message.logButtonClick(buttonId);
							}}
							submitComponentEvent={submitComponentEvent}
							brazeMessageProps={message.extras}
						/>
					</CacheProvider>
				);

				render(cached, renderContainer);
			}

			// Log the impression with Braze
			message.logImpression();

			// Log the impression with Ophan
			submitViewEvent({
				component: {
					componentType: 'RETENTION_ENGAGEMENT_BANNER',
					id:
						message.extras.ophanComponentId ??
						message.extras.componentName,
				},
			});

			return true;
		})
		.catch((error) => {
			const msg = `Error with remote Braze component: ${error}`;
			reportError(new Error(msg), {}, false);

			return false;
		});

const brazeBanner = {
	id: 'brazeBanner',
	show,
	canShow,
};

export { brazeBanner, brazeVendorId, hasRequiredConsents };
