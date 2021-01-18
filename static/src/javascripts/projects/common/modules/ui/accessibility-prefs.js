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

const setFilter = (mode) => {
    const body = document.body;
    const value = `${mode}(100%)`;

    if (body) {
        
        Object.assign(body.style, {
            '-webkit-filter': value,
            filter: value,
        });
    }
};

const breuer = () => {
    if (document.body) {
        document.body.classList.add('is-breuer-mode');
    }
};

const initAccessibilityPreferences = () => {
    fastdom.mutate(() => {
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
