// @flow

import userPrefs from 'projects/common/modules/user-prefs';

const IO = {};
const defaultKey = 'key';
const defaultPrefix = 'gu.prefs';
const defaultKeyPrefixed = `${defaultPrefix}.${defaultKey}`;
const defaultValue = 'value';

describe('userPrefs - Client-side preferences', () => {
    beforeEach(() => {
        // jsdom doesn't support localStorage/ sessionStorage
        window.localStorage = {
            getItem: jest.fn(key => IO[key]),
            setItem: jest.fn((key, value) => {
                IO[key] = value;
            }),
            removeItem: jest.fn(),
        };

        window.localStorage.getItem.mockClear();
        window.localStorage.setItem.mockClear();
        userPrefs.set('key', 'value');
    });

    test('should store a user preference under a given key', () => {
        expect(window.localStorage.setItem).toBeCalledWith(
            defaultKeyPrefixed,
            defaultValue
        );
    });

    test('should retrieve a user preference under a given key', () => {
        expect(window.localStorage.getItem).toBeCalledWith(defaultKeyPrefixed);
    });

    test('should remove a user preference under a given key', () => {
        userPrefs.remove(defaultKey);
        expect(userPrefs.get(defaultKey)).toBe(null);
    });

    test('should allow setting of preferences via the address bar', () => {
        const hash = {
            a: 1,
            b: false,
            c: 'str',
            switchOn: 'd',
            switchOff: 'e',
        };

        const hashAsAnchor = Object.keys(hash)
            .map(key => `${defaultPrefix}.${key}=${String(hash[key])}`)
            .join('&');

        // string tests setting of prefs, switches of int, string, booleans
        userPrefs.setPrefs({ hash: `#${hashAsAnchor}` });

        expect(userPrefs.get('a')).toBe(1);
        expect(userPrefs.get('b')).toBe(false);
        expect(userPrefs.get('c')).toBe('str');
        expect(userPrefs.isOn('d')).toBeTruthy();
        expect(userPrefs.isOff('e')).toBeTruthy();
    });

    test('should store a switch value', () => {
        userPrefs.switchOn('s');

        expect(window.localStorage.getItem('gu.prefs.switch.s')).toBe(
            '{"value":true}'
        );
        expect(userPrefs.isOn('s')).toBeTruthy();
    });

    test('should retrieve a user preference under a given key', () => {
        userPrefs.switchOff('s');

        expect(window.localStorage.getItem('gu.prefs.switch.s')).toBe(
            '{"value":false}'
        );
        expect(userPrefs.isOn('s')).toBeFalsy();
        expect(userPrefs.isOff('s')).toBeTruthy();
    });

    test('should remove a user preference under a given key', () => {
        userPrefs.removeSwitch('s');
        expect(userPrefs.get('s')).toBeNull();
    });
});
