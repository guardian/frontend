import Chance from 'chance';
import { noop } from 'lib/noop';
import type { TargetCallback } from './async-call-merger';
import { mergeCalls } from './async-call-merger';

const chance = new Chance();
const RESULT = chance.string();

describe('AsyncCallMerger', () => {
	let targetFn: TargetCallback;
	let targetFnWithMerging: TargetCallback;

	beforeEach(() => {
		targetFn = jest.fn((callback) => callback(RESULT));
		targetFnWithMerging = mergeCalls(targetFn);
	});

	test('should only call target once', () => {
		targetFnWithMerging(noop);
		targetFnWithMerging(noop);

		expect(targetFn).toHaveBeenCalledTimes(1);
	});

	test('should call both callbacks with result of target callback', () => {
		const callback1 = jest.fn();
		targetFnWithMerging(callback1);

		const callback2 = jest.fn();
		targetFnWithMerging(callback2);

		expect(callback1).toBeCalledWith(RESULT);
		expect(callback2).toBeCalledWith(RESULT);
	});
});
