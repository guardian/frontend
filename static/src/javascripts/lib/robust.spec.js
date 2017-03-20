// @flow

import robust from './robust';

describe('robust', () => {
    function noError() {
        return true;
    }

    function throwError() {
        return null.toString();
    }

    test('catchErrorsAndLog', () => {
        expect(() => {
            robust.catchErrorsAndLog('test', noError);
        }).not.toThrowError();

        expect(() => {
            robust.catchErrorsAndLog('test', throwError);
        }).toThrowError();
    });
});
