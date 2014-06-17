define([
    'common/utils/detect'
], function (
    detect
) {

    return function () {
        this.id = 'LargerMobileMpu';
        this.start = '2014-06-17';
        this.expiry = '2014-06-30';
        this.author = 'Darren Hurley';
        this.description = 'Increase the size of inline1 ad slot to 300x250 for mobile users';
        this.audience = 0.2;
        this.audienceOffset = 0;
        this.successMeasure = 'CTR on articles and CTR on advert';
        this.audienceCriteria = 'Mobile users';
        this.dataLinkNames = 'larger-mobile-mpu';
        this.idealOutcome = 'CTR on advert increases, while not detracting from user\'s overall engagement on the page';

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
                id: '300x250',
                test: function () { }
            }
        ];
    };

});
