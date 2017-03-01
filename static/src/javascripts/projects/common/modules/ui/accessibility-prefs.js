import $ from 'common/utils/$';
import userPrefs from 'common/modules/user-prefs';

function set(mode) {
    $('body').css({ filter: `${mode}(100%)` });
}

function breuer() {
    $('body').addClass('is-breuer-mode');
}

export default () => {
    [
        'sepia',
        'grayscale',
        'invert',
        'contrast',
        'saturate',
        'opacity',
    ].forEach(filter => {
        if (userPrefs.isOn(filter)) {
            set(filter);
        }

        if (userPrefs.isOn('breuerMode')) {
            breuer();
        }
    });
};
