import { noop } from 'lib/noop';
import type { Callback } from './async-call-merger';
import { mergeCalls } from './async-call-merger';

const RESULT = '[…] to sleep, perchance to dream: […]';

describe('AsyncCallMerger', () => {
	const callbackFn = (callback: Callback<[string]>) => callback(RESULT);

	test('should only call target once', () => {
		const targetFn = jest.fn(callbackFn);
		const targetFnWithMerging = mergeCalls(targetFn);

		targetFnWithMerging(noop);
		targetFnWithMerging(noop);

		expect(targetFn).toHaveBeenCalledTimes(1);
	});

	test('should call both callbacks with result of target callback', () => {
		const targetFn = jest.fn(callbackFn);
		const targetFnWithMerging = mergeCalls(targetFn);

		const callback1 = jest.fn();
		targetFnWithMerging(callback1);

		const callback2 = jest.fn();
		targetFnWithMerging(callback2);

		expect(targetFn).toHaveBeenCalledTimes(1);

		expect(callback1).toBeCalledWith(RESULT);
		expect(callback2).toBeCalledWith(RESULT);
	});
});
