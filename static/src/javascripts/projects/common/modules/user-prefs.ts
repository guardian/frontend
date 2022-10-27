import { storage } from '@guardian/libs';

const storagePrefix = 'gu.prefs.';
const defaultOptions = {
	type: 'local',
} as const;

interface StorageOptions {
	type: 'local' | 'session';
}

const set = (
	name: string,
	value: unknown,
	{ type }: StorageOptions = defaultOptions,
): void => {
	storage[type].set(storagePrefix + name, value);
};

const get = (
	name: string,
	{ type }: StorageOptions = defaultOptions,
): unknown => storage[type].get(storagePrefix + name);

const remove = (
	name: string,
	{ type }: StorageOptions = defaultOptions,
): void => {
	storage[type].remove(storagePrefix + name);
};

const switchOn = (
	name: string,
	{ type }: StorageOptions = defaultOptions,
): void => {
	storage[type].set(`${storagePrefix}switch.${name}`, true);
};

const switchOff = (name: string, { type } = defaultOptions): void => {
	storage[type].set(`${storagePrefix}switch.${name}`, false);
};

const removeSwitch = (
	name: string,
	{ type }: StorageOptions = defaultOptions,
): void => {
	storage[type].remove(`${storagePrefix}switch.${name}`);
};

const isOn = (
	name: string,
	{ type }: StorageOptions = defaultOptions,
): boolean => storage[type].get(`${storagePrefix}switch.${name}`) === true;

const isOff = (
	name: string,
	{ type }: StorageOptions = defaultOptions,
): boolean => storage[type].get(`${storagePrefix}switch.${name}`) === false;

// Note 'false' !== Number.isNaN so we have to type coerce
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
const isNumeric = (str: string) => !Number.isNaN(Number(str));

const isBoolean = (str: string) => str === 'true' || str === 'false';

const setPrefs = (loc: Location): void => {
	const qs = loc.hash.substring(1).split('&');
	let i: number;
	let j: number;
	for (i = 0, j = qs.length; i < j; i += 1) {
		const m = /^gu\.prefs\.(.*)=(.*)$/.exec(qs[i]);
		if (m) {
			const key = m[1];
			const val = m[2];
			let v: string | boolean | number;
			switch (key) {
				case 'switchOn':
					switchOn(val);
					break;
				case 'switchOff':
					switchOff(val);
					break;
				default:
					if (isNumeric(val)) {
						// +val casts any number (int, float) from a string
						v = +val;
					} else if (isBoolean(val)) {
						// String(val) === "true" converts a string to bool
						v = String(val).toLowerCase() === 'true';
					} else {
						v = val;
					}
					set(key, v);
			}
		}
	}
};

setPrefs(window.location);

// eslint-disable-next-line import/no-default-export -- Allow a default export here
export default {
	set,
	get,
	remove,
	switchOn,
	switchOff,
	removeSwitch,
	isOn,
	isOff,
	setPrefs,
};
