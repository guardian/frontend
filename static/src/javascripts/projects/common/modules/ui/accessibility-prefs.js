define([
    'common/utils/_',
    'common/utils/$',
    'common/modules/user-prefs',
    'lodash/collections/forEach'
], function (
    _,
    $,
    userPrefs,
    forEach) {
    /* We live in a rainbow of chaos. */
    // ^ U WOT

    function set(mode) {
        var val = mode + '(100%)';
        $('body').css({
            '-webkit-filter': val,
            'filter': val
        });
    }

    return function () {
        forEach(['sepia', 'grayscale', 'invert', 'contrast', 'saturate', 'opacity'], function (filter) {
            if (userPrefs.isOn(filter)) {
                set(filter);
            }
        });
    };
});
