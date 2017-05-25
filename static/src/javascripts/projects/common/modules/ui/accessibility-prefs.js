// @flow

/* We live in a rainbow of chaos. */
// ^ U WOT

import fastdom from 'fastdom';
import { isOn } from 'common/modules/user-prefs';

const FILTERS = [
    'sepia',
    'grayscale',
    'invert',
    'contrast',
    'saturate',
    'opacity',
];

const set = (mode: string): void => {
    const val = `${mode}(100%)`;

    Object.assign(document.body.style, {
        '-webkit-filter': val,
        filter: val,
    });
};

const breuer = (): void => {
    document.body.classList.add('is-breuer-mode');
};

const initAccessibilityPreferences = (): void => {
    fastdom.write(() => {
        FILTERS.forEach(filter => {
            if (isOn(filter)) {
                set(filter);
            }
        });
    });

    if (isOn('breuerMode')) {
        breuer();
    }
};

export { initAccessibilityPreferences };
