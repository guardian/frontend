import config_ from '../../lib/config';

// This is really a hacky workaround ⚠️
const config = config_ as {
	get: (s: string, d: boolean) => boolean;
};

export type SentinelLoggingEvent = {
	received_timestamp: Date;
	received_date: string;
	label: string;
	properties?: Property[];
};

type Property = {
	name: string;
	value: string;
};

/**
 * This function is used to send a logging event to BigQuery, which is
 * logged into the `fastly_logging` table within the `logging` dataset.
 * @param moduleName the name of the JS/TS module (e.g. `article-body-adverts`)
 * @param functionName the name of the function within the module (e.g. `init`)
 * @param parameters an optional object to add function-specific information (e.g. `{ conditionA: true, conditionB: false }`)
 * @returns void.
 */
export const amIUsed = (
	moduleName: string,
	functionName: string,
	parameters?: Record<string, unknown>,
): void => {
	// The function will return early if the sentinelLogger switch is disabled.
	if (!config.get('switches.sentinelLogger', false)) return;

	const endpoint = config.get('page.isDev', false)
		? '//logs.code.dev-guardianapis.com/log'
		: '//logs.guardianapis.com/log';

	const receivedTimestamp = new Date();
	const receivedDate = receivedTimestamp.toISOString().slice(0, 10);

	const properties: Property[] = [
		{ name: 'module_name', value: moduleName },
		{ name: 'function_name', value: functionName },
		{ name: 'URL', value: window.location.href },
	];
	const event: SentinelLoggingEvent = {
		received_timestamp: receivedTimestamp,
		received_date: receivedDate,
		label: 'commercial.sentinel',
		properties: parameters
			? properties.concat(
					Object.entries(parameters).map(([name, value]) => ({
						name,
						value: String(value),
					})),
			  )
			: properties,
	};

	window.navigator.sendBeacon(endpoint, JSON.stringify(event));
};
