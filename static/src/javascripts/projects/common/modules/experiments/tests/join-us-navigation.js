define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect'
], function (
    $,
    config,
    detect
) {
    return function () {
        this.id = 'JoinUsNavigation';
        this.start = '2015-01-15';
        this.expiry = '2015-01-21';
        this.author = 'Marc Hibbins';
        this.description = 'Provides a single text link rather than drop down menu';
        this.audience = 0.4;
        this.audienceOffset = 0;
        this.successMeasure = 'Click-through to Subscriptions.';
        this.audienceCriteria = 'All desktop users';
        this.dataLinkNames = 'join us';
        this.idealOutcome = 'Increased click through volume to Subscriptions.';

        this.canRun = function () {
            return config.page.edition.toLowerCase() === 'uk' && config.page.section !== 'identity' && (detect.getBreakpoint() === 'desktop' || detect.getBreakpoint() === 'leftCol' || detect.getBreakpoint() === 'wide');
        };

        function update(label, intcmp) {
            var a = '<a href="http://subscribe.theguardian.com?INTCMP=' + intcmp + '" class="brand-bar__item--action" data-link-name="topNav : ' + label + '">'
                        + '<span class="rounded-icon control__icon-wrapper"><i class="i i-marque-36"></i></span>'
                        + '<span class="control__info">' + label + '</span>'
                    + '</a>';
            $('.brand-bar__item--joinus').html(a);
        }

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'join',
                test: function () {
                    update('join us', 'NGW_TOPNAV_UK_GU_SUBSCRIBE_JOIN');
                }
            },
            {
                id: 'membership',
                test: function () {
                    update('membership', 'NGW_TOPNAV_UK_GU_SUBSCRIBE_MEMBERSHIP');
                }
            },
            {
                id: 'subscribe',
                test: function () {
                    update('subscribe', 'NGW_TOPNAV_UK_GU_SUBSCRIBE_SUBSCRIBE');
                }
            }
        ];
    };

});
