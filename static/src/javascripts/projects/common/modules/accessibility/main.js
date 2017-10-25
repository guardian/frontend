// @flow

import userPrefs from 'common/modules/user-prefs';

const KEY_PREFIX = 'accessibility';

const saveState = (state: { [key: string]: boolean }): void => {
    Object.keys(state).forEach(key => {
        userPrefs.set(`${KEY_PREFIX}.${key}`, state[key]);
    });
};

const getStoredValue = (key: string): boolean =>
    userPrefs.get(`${KEY_PREFIX}.${key}`) !== false;

const isOn = (key: string): boolean => getStoredValue(key) === true;

export { saveState, isOn };
