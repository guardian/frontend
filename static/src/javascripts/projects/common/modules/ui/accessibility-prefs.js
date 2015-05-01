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

    function set(mode) {
        var val = mode + '(100%)';
        $('body').css({
            '-webkit-filter': val,
            'filter': val
        });
    }

    function init() {
        _.forEach(['sepia', 'grayscale', 'invert', 'contrast', 'saturate', 'opacity'], function(filter){
            if(userPrefs.isOn(filter)) {
                set(filter);
            }
        });
    }

    return {
        init: init
    };
});
