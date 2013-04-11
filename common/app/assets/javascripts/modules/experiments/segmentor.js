define(['modules/userPrefs'], function (userPrefs) {

    // gu.prefs.ab = {test: 'testId', variant: 'variantName'}
    var key = 'ab';

    var Segmentor = {

        inTest : function() {
            return JSON.parse(userPrefs.get(key));
        },

        clearTest : function() {
            userPrefs.remove(key);
        }
    };

    return Segmentor;

});

