// @flow

import { mergeCalls } from './async-call-merger';

describe('AsyncCallMerger', () => {
    let targetFn;
    let targetFnWithMerging;

    beforeEach(() => {
        targetFn = jest.fn();
        targetFnWithMerging = mergeCalls(targetFn);
    });

    test('should only call target once', () => {
        targetFnWithMerging(() => {});
        targetFnWithMerging(() => {});

        expect(targetFn).toHaveBeenCalledTimes(1);
    });

    test('should call both callbacks with result of target callback', () => {
        const callback1 = jest.fn();
        targetFnWithMerging(callback1);

        const callback2 = jest.fn();
        targetFnWithMerging(callback2);

        targetFn.mock.calls[0][0]('target result');

        expect(callback1).toBeCalledWith('target result');
        expect(callback2).toBeCalledWith('target result');
    });

    test('should call both callbacks with result of target callback when merged function is called after call to target has completed', () => {
        const callback1 = jest.fn();
        targetFnWithMerging(callback1);

        // call callback passed to target fn
        targetFn.mock.calls[0][0]('target result');

        const callback2 = jest.fn();
        targetFnWithMerging(callback2);

        expect(callback1).toBeCalledWith('target result');
        expect(callback2).toBeCalledWith('target result');
    });
});
