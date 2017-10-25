// @flow

import { saveState, isOn } from 'common/modules/accessibility/main';

jest.mock('common/modules/user-prefs', () => {
    const storage = {};

    return {
        get(key) {
            return storage[key];
        },
        set(key, value) {
            storage[key] = value;
        },
    };
});

describe('Accessibility', () => {
    it('saves the state', () => {
        saveState({
            'flashing-elements': true,
        });

        expect(isOn('flashing-elements')).toBe(true);
    });
});
