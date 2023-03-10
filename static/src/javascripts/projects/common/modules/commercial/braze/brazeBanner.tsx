import type { BrazeMessagesInterface } from '@guardian/braze-components';
import React from 'react';
import config from '../../../../../lib/config';
import { reportError } from '../../../../../lib/report-error';
import { submitComponentEvent, submitViewEvent } from '../acquisitions-ophan';
import type { BrazeMessageInterface } from './brazeMessageInterface';
import { getMessageFromUrlFragment } from './getMessageFromUrlFragment';

let message: BrazeMessageInterface | undefined;

export const taylorReportIsLive = (now: Date): boolean => {
	const start = Date.parse('2023-03-24');
	const end = Date.parse('2023-04-05');
	return now.valueOf() >= start && now.valueOf() < end;
};

const buildCanShow = (
	brazeMessagesPromise: Promise<BrazeMessagesInterface>,
) => {
	return async (): Promise<boolean> => {
		const forcedBrazeMessage = getMessageFromUrlFragment();
		if (forcedBrazeMessage) {
			message = forcedBrazeMessage;
			return true;
		}

		// Suppress all braze banners during this period
		if (taylorReportIsLive(new Date())) {
			return false;
		}

		try {
			const section = config.get('page.section');
			const brazeArticleContext =
				typeof section === 'string' ? { section } : undefined;

			const brazeMessages = await brazeMessagesPromise;
			message = await brazeMessages.getMessageForBanner(
				brazeArticleContext,
			);

			return true;
		} catch (e) {
			return false;
		}
	};
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

interface BannerCandidate {
	id: string;
	show: () => void;
	canShow: () => Promise<boolean>;
}

const buildBrazeBanner = (
	brazeMessagesPromise: Promise<BrazeMessagesInterface>,
): BannerCandidate => ({
	id: 'brazeBanner',
	show,
	canShow: buildCanShow(brazeMessagesPromise),
});

export { buildBrazeBanner };
