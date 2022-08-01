import config from '../../lib/config';

export type AmIUsedLoggingEvent = {
	label: string;
	properties?: Property[];
};

type Property = {
	name: string;
	value: string;
};

type RestrictedProperty = Property & {
	name: RestrictedKeys;
};

type RestrictedKeys = 'module_name' | 'function_name' | 'URL';

/**
 * This function is used to send a logging event to BigQuery, which is
 * logged into the `fastly_logging` table within the `logging` dataset.
 * @param moduleName the name of the JS/TS module (e.g. `article-body-adverts`)
 * @param functionName the name of the function within the module (e.g. `init`)
 * @param parameters an optional object to add function-specific information (e.g. `{ conditionA: 'true', conditionB: 'false' }`)
 * @returns void.
 */
export const amIUsed = (
	moduleName: string,
	functionName: string,
	parameters?: Partial<
		Record<string, string> & Record<RestrictedKeys, never>
	>,
): void => {
	// The function will return early if the sentinelLogger switch is disabled.
	if (!config.get<boolean>('switches.sentinelLogger', false)) return;

	const endpoint = config.get<boolean>('page.isDev', false)
		? '//logs.code.dev-guardianapis.com/log'
		: '//logs.guardianapis.com/log';

	const properties: RestrictedProperty[] = [
		{ name: 'module_name', value: moduleName },
		{ name: 'function_name', value: functionName },
		{ name: 'URL', value: window.location.href },
	];
	const event: AmIUsedLoggingEvent = {
		label: 'commercial.sentinel',
		properties: parameters
			? [
					...properties,
					...Object.entries(parameters).map(([name, value]) => ({
						name,
						value: String(value),
					})),
			  ]
			: properties,
	};

	window.navigator.sendBeacon(endpoint, JSON.stringify(event));
};
