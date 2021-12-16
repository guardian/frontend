/**
 * This module is used to merge calls to async functions that use callbacks. Ensuring the target function is
 * called once only but the result is passed to all the call backs that require it.
 */

type Status = 'init' | 'waiting' | 'complete';

type Callback<T extends unknown[]> = (...args: T) => void;
type TargetCallback<T extends unknown[]> = (f: Callback<T>) => void;
type TargetCallbackWithReset<T extends unknown[]> = TargetCallback<T> & {
	reset: () => void;
};

/**
 * Creates a function that will merge calls to the supplied target function
 */
const mergeCalls = <T extends unknown[]>(
	targetFunction: TargetCallback<T>,
): TargetCallbackWithReset<T> => {
	let callbacks: Array<Callback<T>>;
	let callbackArguments: T;
	let status: Status;

	const reset = (): void => {
		[callbacks, status, callbackArguments] = [
			[],
			'init',
			[] as unknown as T, // Asserting the type is necessary
		];
	};

	const targetCallbackHandler: Callback<T> = (...args) => {
		callbackArguments = args;
		status = 'complete';
		callbacks.forEach((callback) => {
			callback(...callbackArguments);
		});
	};

	const callMergingFunction: TargetCallbackWithReset<T> = (callback) => {
		switch (status) {
			case 'init': {
				status = 'waiting';
				callbacks.push(callback);
				targetFunction(targetCallbackHandler);
				break;
			}
			case 'waiting': {
				callbacks.push(callback);
				break;
			}
			case 'complete': {
				callback(...callbackArguments);
				break;
			}
		}
	};

	reset();

	callMergingFunction.reset = reset;

	return callMergingFunction;
};

export { mergeCalls };
export type { Callback };
