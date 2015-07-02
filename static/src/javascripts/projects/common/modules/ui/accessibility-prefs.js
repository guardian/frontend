define([
    'common/utils/_',
    'common/utils/$',
    'common/modules/user-prefs'
], function (
    _,
    $,
    userPrefs
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

    return function () {
        _.forEach(['sepia', 'grayscale', 'invert', 'contrast', 'saturate', 'opacity'], function (filter) {
            if (userPrefs.isOn(filter)) {
                set(filter);
            }
        });
    };
});
