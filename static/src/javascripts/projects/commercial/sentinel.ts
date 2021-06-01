import { log } from '@guardian/libs';
import raven from 'lib/raven';
import config_ from '../../lib/config';

const config = config_ as {
	get: (s: string, d?: unknown) => unknown;
};

export const amIUsed = (
	moduleName: string,
	functionName: string,
	label?: string,
): void => {
	if (!config.get('switches.sentinelLogger', false)) return;

	const functionToCheck = [moduleName, functionName, label]
		.filter(Boolean)
		.join('.');

	raven.captureMessage(functionToCheck, {
		level: 'info',
		tags: { tag: 'commercial-sentinel' },
	});
	log('commercial', 'Data sent to Sentry');

	// check switch
	// check optional label
	// check what gets passed to raven.captureMessage
};
