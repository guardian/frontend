define([
    'common/utils/$',
    'common/modules/user-prefs',
    'lodash/collections/forEach'
], function (
    $,
    userPrefs,
    forEach
) {
    /* We live in a rainbow of chaos. */
    // ^ U WOT

    function set(mode) {
        var val = mode + '(100%)';
        $('body').css({
            '-webkit-filter': val,
            'filter': val
        });
    }

    function breuer() {
        $('body').addClass('is-breuer-mode');
    }

    return function () {
        forEach(['sepia', 'grayscale', 'invert', 'contrast', 'saturate', 'opacity'], function (filter) {
            if (userPrefs.isOn(filter)) {
                set(filter);
            }

            if (userPrefs.isOn('breuerMode')) {
                breuer();
            }
        });
    };
});
