define(['modules/userPrefs'], function (userPrefs) {
   
    var Segmentor = function (testId) {
       
        if (!testId) {
            throw new Error("Segmentor requires a test id")
        }

        var key = 'ab.' + testId; // So, 'gu.prefs.ab.[experiment]' = '[segment]'

        // is the user in this test
        this.inTest = function () {
            return userPrefs.get(key)
        }

        // the simplest possible segmentation - 50/50 split
        this.split = function () {
            var segment = (Math.random() > 0.5) ? 'a' : 'b';
            userPrefs.set(key, segment)
            return segment;
        }

    }

    return Segmentor;

});

