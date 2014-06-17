define([
    'common/utils/detect'
], function (
    detect
) {

    return function () {
        this.id = 'LargerMobileMpu';
        this.start = '2014-06-18';
        this.expiry = '2014-06-30';
        this.author = 'Darren Hurley';
        this.description = 'Increase the size of inline1 ad slot to 300x250 for mobile users';
        this.audience = 0.4;
        this.audienceOffset = 0;
        this.successMeasure = 'User engagement';
        this.audienceCriteria = 'Mobile users';
        this.dataLinkNames = 'larger-mobile-mpu';
        this.idealOutcome = 'User engagement is unaffected by larger ads';

        this.canRun = function () {
            return detect.getBreakpoint() === 'mobile';
        };

        /**
         * nothing happens in here, we just use this to bucket users. see article-body-adverts.js and slice-adverts.js
         * to see the actual work
         */
        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'fronts',
                test: function () { }
            },
            {
                id: 'articles',
                test: function () { }
            },
            {
                id: 'fronts-and-articles',
                test: function () { }
            }
        ];
    };

});
