import { log } from '@guardian/libs';
import type { BrazeMessageInterface } from './brazeMessageInterface';

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

export const getMessageFromUrlFragment = ():
	| BrazeMessageInterface
	| undefined => {
	if (window.location.hash) {
		// This is intended for use on development domains for preview purposes.
		// It won't run in PROD.
		const key = 'force-braze-message';

		const hashString = window.location.hash;

		if (hashString.includes(key)) {
			if (!FORCE_BRAZE_ALLOWLIST.includes(window.location.hostname)) {
				log('tx', `${key} is not supported on this domain`);
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
					log('tx', `There was an error with ${key}:`, e.message);
				}
			}
		}
	}

	return;
};
