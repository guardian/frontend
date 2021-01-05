import Chance from 'chance';

import { mergeCalls } from './async-call-merger';

const chance = new Chance();
const RESULT = chance.string();

describe('AsyncCallMerger', () => {
    let targetFn;
    let targetFnWithMerging;

    beforeEach(() => {
        targetFn = jest.fn(callback => callback(RESULT));
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

        expect(callback1).toBeCalledWith(RESULT);
        expect(callback2).toBeCalledWith(RESULT);
    });
});
