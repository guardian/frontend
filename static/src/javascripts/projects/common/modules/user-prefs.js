import { storage } from '@guardian/libs';

const storagePrefix = 'gu.prefs.';
const defaultOptions = {
	type: 'local',
};

const set = (name, value, { type } = defaultOptions) => {
	storage[type].set(storagePrefix + name, value);
};

const get = (name, { type } = defaultOptions) =>
	storage[type].get(storagePrefix + name);

const remove = (name, { type } = defaultOptions) => {
	storage[type].remove(storagePrefix + name);
};

const switchOn = (name, { type } = defaultOptions) => {
	storage[type].set(`${storagePrefix}switch.${name}`, true);
};

const switchOff = (name, { type } = defaultOptions) => {
	storage[type].set(`${storagePrefix}switch.${name}`, false);
};

const removeSwitch = (name, { type } = defaultOptions) => {
	storage[type].remove(`${storagePrefix}switch.${name}`);
};

const isOn = (name, { type } = defaultOptions) =>
	storage[type].get(`${storagePrefix}switch.${name}`) === true;

const isOff = (name, { type } = defaultOptions) =>
	storage[type].get(`${storagePrefix}switch.${name}`) === false;

// Note 'false' !== Number.isNaN so we have to type coerce
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
const isNumeric = (str) => !Number.isNaN(Number(str));

const isBoolean = (str) => str === 'true' || str === 'false';

const setPrefs = (loc) => {
	const qs = loc.hash.substr(1).split('&');
	let i;
	let j;
	for (i = 0, j = qs.length; i < j; i += 1) {
		const m = qs[i].match(/^gu\.prefs\.(.*)=(.*)$/);
		if (m) {
			const key = m[1];
			const val = m[2];
			let v;
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
