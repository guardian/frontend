/**
 * This module is used to merge calls to async functions that use callbacks. Ensuring the target function is
 * called once only but the result is passed to all the call backs that require it.
 */

type Status = 'init' | 'waiting' | 'complete';

type Callback = (...args: unknown[]) => void;
type TargetCallback = (f: Callback) => void;
type TargetCallbackWithReset = TargetCallback & {
	reset: () => void;
};

/**
 * Creates a function that will merge calls to the supplied target function
 */
const mergeCalls = (
	targetFunction: TargetCallback,
): TargetCallbackWithReset => {
	let callbacks: Callback[];
	let callbackArguments: unknown[];
	let status: Status;

	const reset = (): void => {
		[callbacks, status, callbackArguments] = [[], 'init', []];
	};

	const targetCallbackHandler: Callback = (...args) => {
		callbackArguments = args;
		status = 'complete';
		callbacks.forEach((callback) => {
			callback(...callbackArguments);
		});
	};

	const callMergingFunction: TargetCallbackWithReset = (callback) => {
		if (status === 'init') {
			status = 'waiting';
			callbacks.push(callback);
			targetFunction(targetCallbackHandler);
		} else if (status === 'waiting') {
			callbacks.push(callback);
		} else {
			callback(...callbackArguments);
		}
	};

	reset();

	callMergingFunction.reset = reset;

	return callMergingFunction;
};

export { mergeCalls };
export type { Callback, TargetCallback };
