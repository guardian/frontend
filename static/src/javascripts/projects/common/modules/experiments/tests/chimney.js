define([
    'common/utils/$',
    'common/utils/detect'
], function (
    $,
    detect
) {
    return function () {
        this.id = 'Chimney';
        this.start = '2015-03-08';
        // far future expiration, only really using the test to bucket users, which we can use for targeting in dfp
        this.expiry = '2015-03-16';
        this.author = 'Sam Morris';
        this.description = 'Testing to see what affect a chimney on the home icon has.';
        this.audience = 0.1;
        this.audienceOffset = 0.43;
        this.successMeasure = 'A chimney increases the likelihood of someone clicking on the home icon.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'nav : primary : home';
        this.idealOutcome = 'With-Chimney variant has more clicks.';

        this.canRun = function () {
            if (detect.getBreakpoint() !== 'mobile') {
                return true;
            }
        };

        /**
         * nothing happens in here, we just use this to bucket users
         */
        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'with-chimney',
                test: function () {
                    $('.top-navigation__icon--home').addClass('top-navigation__icon--home--has-chimney');
                }
            }
        ];
    };

});
