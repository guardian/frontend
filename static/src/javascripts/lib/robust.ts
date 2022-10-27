/*
    Swallows (and reports) exceptions. Designed to wrap around modules at the "bootstrap" level.
    For example "comments throwing an exception should not stop auto refresh"
 */

import { convertError, reportError } from './report-error';

type ModuleFunction = () => void;
type Module = [string, ModuleFunction]
type Modules = Array<Module>;

const catchErrors = (fn: ModuleFunction): Error | undefined => {
	let error: Error | undefined;

	try {
		fn();
	} catch (e) {
		error = convertError(e);
	}

	return error;
};

const logError = (moduleName: string, error: Error, tags?: Record<string, string>) => {
	if (window.console && window.console.warn) {
		window.console.warn('Caught error.', error.stack);
	}

	if (tags) {
		reportError(error, { module: moduleName, ...tags }, false);
	} else {
		reportError(error, { module: moduleName }, false);
	}
};

const catchAndLogError = (name: string, fn: ModuleFunction, tags?: Record<string, string>) => {
	const error =catchErrors(fn);

	if (error) {
		logError(name, error, tags);
	}
};

const catchErrorsWithContext = (modules: Modules, tags?: Record<string, string>) => {
	modules.forEach(([name, fn]) => catchAndLogError(name, fn, tags));
};

export { catchErrorsWithContext, logError };
export type { Modules }
export const _ = { catchAndLogError};
