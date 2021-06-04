import raven from 'lib/raven';
import config_ from '../../lib/config';

// This is really a hacky workaround ⚠️
const config = config_ as {
	get: (s: string, d: boolean) => boolean;
};

/**
 * This function is used to send a logging event to Sentry.
 * Among other things, Sentry tracks the URL of the page where this function
 * is executed, which will allow developers to easily identify pages where
 * obscure commercial code is run.
 * Please note: due to the Raven configuration in frontend, all events generated
 * by this function will be logged in project 35463 (client-side-prod) on Sentry.
 *
 * @param moduleName the name of the JS/TS module (ex: 'article-aside-adverts')
 * @param functionName the name of the function within the module (ex: 'init')
 * @param label an optional value to add function-specific information (ex: 'conditionA=true')
 * @returns void.
 */
export const amIUsed = (
	moduleName: string,
	functionName: string,
	label?: string,
): void => {
	// The function will return early if the sentinelLogger switch is disabled.
	if (!config.get('switches.sentinelLogger', false)) return;

	const functionToCheck = [moduleName, functionName, label]
		.filter(Boolean)
		.join('.');

	raven.captureMessage(functionToCheck, {
		level: 'info',
		tags: { tag: 'commercial-sentinel' },
	});
};
