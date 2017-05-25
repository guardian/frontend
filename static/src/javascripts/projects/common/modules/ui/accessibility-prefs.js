// @flow

/* We live in a rainbow of chaos. */
// ^ U WOT

import $ from 'lib/$';
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

    $('body').css({
        '-webkit-filter': val,
        filter: val,
    });
};

const breuer = (): void => {
    $('body').addClass('is-breuer-mode');
};

const initAccessibilityPreferences = (): void => {
    FILTERS.forEach(filter => {
        if (isOn(filter)) {
            set(filter);
        }
    });

    if (isOn('breuerMode')) {
        breuer();
    }
};

export { initAccessibilityPreferences };
