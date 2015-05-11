define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/navigation/sticky-nav',
    'common/modules/onward/geo-most-popular'
], function (
    fastdom,
    $,
    _,
    config,
    detect,
    mediator,
    stickyNav,
    geoMostPopular
) {
    return function () {
        this.id = 'MtMain';
        this.start = '2015-03-12';
        this.expiry = '2015-05-25';
        this.author = 'Zofia Korcz';
        this.description = 'Sticky navigation behind the ad with burger version - with sticky MPU and lazy loading';
        this.audience = 0.02;
        this.audienceOffset = 0.6;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US and UK edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.showForSensitive = false;

        this.canRun = function () {
            var isIE = detect.getUserAgent.browser === 'MSIE' || detect.getUserAgent === 'IE 11',
                isUK = config.page.edition === 'UK',
                isUS = config.page.edition === 'US';

            return !isIE && (isUK || isUS);
        };

        this.fireMainTest = function () {
            var $secondaryColumn = $('.js-secondary-column');

            geoMostPopular.whenRendered.then(function () {
                fastdom.write(function () {
                    var $rightMostPopular = $('.js-right-most-popular');
                    $('.js-mpu-ad-slot', $secondaryColumn).insertAfter($rightMostPopular);
                    $rightMostPopular.css('margin-top', '0');
                    $('.component--rhc .open-cta', $secondaryColumn).css('margin-top', '0');
                });
            });

            stickyNav.stickySlow.init();
        };

        /**
         * nothing happens in here, we just use this to bucket users
         */
        this.variants = [
            {
                id: 'A',
                test: function () { }
            },
            {
                id: 'B',
                test: function () { }
            }
        ];
    };

});
