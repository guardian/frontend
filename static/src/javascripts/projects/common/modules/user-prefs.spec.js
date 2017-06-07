// @flow
import userPrefs from 'common/modules/user-prefs';
import { local } from 'lib/storage';

class LocalStorageMock {
    store: Object;

    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key];
    }

    setItem(key, value) {
        this.store[key] = value.toString();
    }

    removeItem(key) {
        this.store[key] = null;
    }
}

const localStorage = new LocalStorageMock();

describe('userPrefs - Client-side preferences', () => {
    beforeAll(() => {
        local.storage = localStorage;
        local.available = true;
    });

    beforeEach(() => {
        localStorage.clear();
        userPrefs.set('key', 'value');
    });

    it('should store a user preference under a given key', () => {
        expect(localStorage.getItem('gu.prefs.key')).toBe('{"value":"value"}');
    });

    it('should retrieve a user preference under a given key', () => {
        expect(userPrefs.get('key')).toBe('value');
    });

    it('should remove a user preference under a given key', () => {
        userPrefs.remove('key');
        expect(userPrefs.get('key')).toBeNull();
    });

    it('should allow setting of preferences via the address bar', () => {
        const prefix = 'gu.prefs.';
        const hash = {
            a: 1,
            b: false,
            c: 'str',
            switchOn: 'd',
            switchOff: 'e',
        };
        const hashAsAnchor = Object.keys(hash)
            .map(h => `${prefix + h}=${String(hash[h])}`)
            .join('&');

        // string tests setting of prefs, switches of int, string, booleans
        const qs = { hash: `#${hashAsAnchor}` };

        userPrefs.setPrefs(qs);

        expect(userPrefs.get('a')).toBe(1); // int
        expect(userPrefs.get('b')).toBe(false); // bool
        expect(userPrefs.get('c')).toBe('str'); // string
        expect(userPrefs.isOn('d')).toBeTruthy();
        expect(userPrefs.isOff('e')).toBeTruthy();
    });
});

describe('userPrefs - Switch overrides', () => {
    beforeAll(() => {
        local.storage = localStorage;
        local.available = true;
    });

    beforeEach(() => {
        localStorage.clear();
    });

    it('should store a switch value', () => {
        userPrefs.switchOn('s');
        expect(localStorage.getItem('gu.prefs.switch.s')).toBe(
            '{"value":true}'
        );
        expect(userPrefs.isOn('s')).toBeTruthy();
    });

    it('should retrieve a user preference under a given key', () => {
        userPrefs.switchOff('s');
        expect(localStorage.getItem('gu.prefs.switch.s')).toBe(
            '{"value":false}'
        );
        expect(userPrefs.isOn('s')).toBeFalsy();
        expect(userPrefs.isOff('s')).toBeTruthy();
    });

    it('should remove a user preference under a given key', () => {
        userPrefs.removeSwitch('s');
        expect(userPrefs.get('s')).toBeNull();
    });
});
