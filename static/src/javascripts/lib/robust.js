/*
    Swallows (and reports) exceptions. Designed to wrap around modules at the "bootstrap" level.
    For example "comments throwing an exception should not stop auto refresh"
 */

import { reportError } from './report-error';

const catchErrors = (fn) => {
	let error;

	try {
		fn();
	} catch (e) {
		error = e;
	}

	return error;
};

const logError = (module, error, tags) => {
	if (window.console && window.console.warn) {
		window.console.warn('Caught error.', error.stack);
	}

	if (tags) {
		reportError(error, Object.assign({ module }, tags), false);
	} else {
		reportError(error, { module }, false);
	}
};

const catchAndLogError = (name, fn, tags) => {
	const error = catchErrors(fn);

	if (error) {
		logError(name, error, tags);
	}
};

const catchErrorsWithContext = (modules, tags) => {
	modules.forEach(([name, fn]) => catchAndLogError(name, fn, tags));
};

export { catchErrorsWithContext, logError };
export const _ = { catchAndLogError };
