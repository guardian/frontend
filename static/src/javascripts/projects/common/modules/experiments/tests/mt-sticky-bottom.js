define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    $,
    _,
    config,
    detect,
    mediator
) {
    return function () {
        this.id = 'MtStickyBottom';
        this.start = '2015-03-26';
        this.expiry = '2015-05-26';
        this.author = 'Zofia Korcz';
        this.description = 'Top ad slot is sticky at the bottom of page';
        this.audience = 0.01;
        this.audienceOffset = 0.4;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.edition === 'US' && config.page.isFront;
        };

        function updatePosition(config) {
            var bannerScrollPos = 0,
                $stickyBanner;

            if (detect.getBreakpoint() === 'mobile') {
                $stickyBanner = config.$stickyTopAdMobile;
            } else {
                $stickyBanner = config.$stickyTopAd;
            }

            config.$stickyBanner.css({
                position:     'fixed',
                bottom:       0,
                top:          null,
                width:        '100%',
                'z-index':    '1001',
                'border-top': '#ccc 1px solid'
            });

            $(config.$container.get(1)).css({
                'padding-top': config.stickyTopAdHeight
            });

            bannerScrollPos = window.scrollY + config.windowHeight - config.stickyTopAdHeight;

            if (bannerScrollPos >= config.containerOffset) {
                config.$stickyBanner.css({
                    position:     'absolute',
                    top:           config.containerOffset,
                    bottom:        null,
                    width:        '100%',
                    'z-index':    '1001',
                    'border-top': '#ccc 1px solid'
                });
            }
            console.log(config.$container.get(1).offsetTop, config.$stickyBanner.get(0).offsetTop, bannerScrollPos);
        }

        this.variants = [
            {
                id: 'A',
                test: function () {
                    var stickyConfig = {
                            $stickyTopAd: $('.top-banner-ad-container--desktop'),
                            $stickyTopAdMobile: $('.top-banner-ad-container--mobile'),
                            $container: $('.facia-page .fc-container'),
                            headerHeight: $('#header').dim().height,
                            windowHeight: window.innerHeight || document.documentElement.clientHeight
                        };

                    stickyConfig.stickyTopAdHeight = stickyConfig.$stickyTopAd.dim().height;
                    stickyConfig.stickyTopAdMobileHeight = stickyConfig.$stickyTopAdMobile.dim().height;
                    $('fc-container__inner',stickyConfig.$container).css('border-top', 'none');
                    updatePosition(stickyConfig);

                    if (stickyConfig.windowHeight <= 960 && stickyConfig.$container.length >= 2 && !window.scrollY) {
                        stickyConfig.containerOffset = stickyConfig.$container.get(1).offsetTop + stickyConfig.headerHeight;

                        mediator.on('window:scroll', _.throttle(function () {
                            //height of topAd needs to be recalculated on desktop and tablet because we don't know when we will get respond from DFP
                            if (detect.getBreakpoint() !== 'mobile') {
                                stickyConfig.stickyTopAdHeight = stickyConfig.$stickyTopAd.dim().height;
                            }
                            updatePosition(stickyConfig);
                        }, 10));
                    }
                }
            }
        ];
    };

});
