import type { RavenOptions } from 'raven-js';
import raven from 'raven-js';
import { adblockInUse } from './detect-adblock';

const {
	// linter, keep this multi-line
	sentryPublicApiKey,
	sentryHost,
	edition,
	contentType,
	revisionNumber,
	isDev,
} = window.guardian.config.page;
const { enableSentryReporting } = window.guardian.config.switches;
const sentryUrl = `https://${sentryPublicApiKey}@${sentryHost}`;

let adblockBeingUsed = false;

const sentryOptions: RavenOptions = {
	whitelistUrls: [
		// localhost will not log errors, but call `shouldSendCallback`
		/localhost/,
		/assets\.guim\.co\.uk/,
		/ophan\.co\.uk/,
	],

	tags: {
		edition,
		contentType,
		revisionNumber,
	},

	ignoreErrors: [
		"Can't execute code from a freed script",
		/There is no space left matching rules from/gi,
		'Top comments failed to load:',
		'Comments failed to load:',
		/InvalidStateError/gi,
		/Fetch error:/gi,
		'Network request failed',
		'This video is no longer available.',
		'UnknownError',
		'TypeError: Failed to fetch',
		'TypeError: NetworkError when attempting to fetch resource',

		// weatherapi/city.json frequently 404s and lib/fetch-json throws an error
		'Fetch error while requesting https://api.nextgen.guardianapps.co.uk/weatherapi/city.json:',
	],

	dataCallback(data: { tags: { origin?: string }; culprit?: string }) {
		const { culprit } = data;
		const resp = data;
		const culpritMatches = culprit ? /j.ophan.co.uk/.test(culprit) : false;

		if (culprit) {
			resp.culprit = culprit.replace(/\/[a-z\d]{32}(\/[^/]+)$/, '$1');
		}

		resp.tags.origin = culpritMatches ? 'ophan' : 'app';

		return resp;
	},

	shouldSendCallback(data: { tags: { ignored?: unknown } }) {
		const isIgnored = !!data.tags.ignored;

		// Sample at a very small rate.
		const isInSample = Math.random() < 0.008;

		if (isDev && !isIgnored) {
			console.warn('Raven captured event.', data);
		}

		return (
			!!enableSentryReporting &&
			isInSample &&
			!isIgnored &&
			!adblockBeingUsed
		);
	},
};

void adblockInUse.then((isInUse: boolean) => {
	adblockBeingUsed = isInUse;
});

// eslint-disable-next-line import/no-default-export -- Allow this default export
export default raven.config(sentryUrl, sentryOptions).install();
