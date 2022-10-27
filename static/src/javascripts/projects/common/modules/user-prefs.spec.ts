import { storage } from '@guardian/libs';
import userPrefs from 'common/modules/user-prefs';

describe('userPrefs - Client-side preferences', () => {
	beforeEach(() => {
		storage.local.clear();
		userPrefs.set('key', 'value');
	});

	it('should store a user preference under a given key', () => {
		expect(storage.local.get('gu.prefs.key')).toBe('value');
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
		const hash = [
			['a', 1],
			['b', false],
			['c', 'str'],
			['switchOn', 'd'],
			['switchOff', 'e'],
		] as const;
		const hashAsAnchor = hash
			.map(([key, value]) => `${prefix + key}=${String(value)}`)
			.join('&');

		// string tests setting of prefs, switches of int, string, booleans
		const qs = { hash: `#${hashAsAnchor}` } as Location;

		Number.isNaN = window.isNaN;

		userPrefs.setPrefs(qs);

		expect(userPrefs.get('a')).toBe(1); // int
		expect(userPrefs.get('b')).toBe(false); // bool
		expect(userPrefs.get('c')).toBe('str'); // string
		expect(userPrefs.isOn('d')).toBeTruthy();
		expect(userPrefs.isOff('e')).toBeTruthy();
	});
});

describe('userPrefs - Switch overrides', () => {
	beforeEach(() => {
		storage.local.clear();
	});

	it('should store a switch value', () => {
		userPrefs.switchOn('s');
		expect(storage.local.get('gu.prefs.switch.s')).toBe(true);
		expect(userPrefs.isOn('s')).toBeTruthy();
	});

	it('should retrieve a user preference under a given key', () => {
		userPrefs.switchOff('s');
		expect(storage.local.get('gu.prefs.switch.s')).toBe(false);
		expect(userPrefs.isOn('s')).toBeFalsy();
		expect(userPrefs.isOff('s')).toBeTruthy();
	});

	it('should remove a user preference under a given key', () => {
		userPrefs.removeSwitch('s');
		expect(userPrefs.get('s')).toBeNull();
	});
});
