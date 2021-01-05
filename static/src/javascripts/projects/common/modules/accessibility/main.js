import userPrefs from 'common/modules/user-prefs';

const KEY_PREFIX = 'accessibility';

const saveState = (state) => {
    Object.keys(state).forEach(key => {
        userPrefs.set(`${KEY_PREFIX}.${key}`, state[key]);
    });
};

const getStoredValue = (key) =>
    userPrefs.get(`${KEY_PREFIX}.${key}`) !== false;

const isOn = (key) => getStoredValue(key) === true;

export { saveState, isOn };
