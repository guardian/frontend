// @flow

import robust from './robust';

describe('robust', () => {
    function noError() {
        return true;
    }

    function throwError() {
        throw new Error('Something broke.');
    }

    test('catchErrorsAndLog', () => {
        expect(() => {
            robust.catchErrorsAndLog('test', noError);
        }).not.toThrowError();

        expect(() => {
            robust.catchErrorsAndLog('test', throwError);
        }).toThrowError();
    });

    test('catchErrorsAndLog - custom reporter', () => {
        robust.catchErrorsAndLog('test', throwError, (err, meta) => {
            expect(err.message).toBe('Something broke.');
            expect(meta.module).toBe('test');
        });
    });
});
