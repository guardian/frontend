// @flow

/* We live in a rainbow of chaos. */
// ^ U WOT

import fastdom from 'fastdom';
import userPrefs from 'common/modules/user-prefs';

const FILTERS = [
    'sepia',
    'grayscale',
    'invert',
    'contrast',
    'saturate',
    'opacity',
];

const setFilter = (mode: string): void => {
    const body = document.body;
    const value: string = `${mode}(100%)`;

    if (body) {
        // $FlowFixMe -webkit-filter is not recognised
        Object.assign(body.style, {
            '-webkit-filter': value,
            filter: value,
        });
    }
};

const breuer = (): void => {
    if (document.body) {
        document.body.classList.add('is-breuer-mode');
    }
};

const initAccessibilityPreferences = (): void => {
    fastdom.write(() => {
        FILTERS.forEach(filter => {
            if (userPrefs.isOn(filter)) {
                setFilter(filter);
            }
        });
    });

    if (userPrefs.isOn('breuerMode')) {
        breuer();
    }
};

export { initAccessibilityPreferences };
