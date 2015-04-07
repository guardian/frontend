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

        function updatePosition(stickyConfig, containerNo) {
            var bannerScrollPos,
                $stickyBanner,
                stickyBannerHeight;

            if (detect.getBreakpoint() === 'mobile') {
                $stickyBanner = stickyConfig.$stickyTopAdMobile;
            } else {
                $stickyBanner = stickyConfig.$stickyTopAd;
            }

            stickyBannerHeight = $stickyBanner.dim().height;

            //banner is sticky at the bottom from the beginning
            $stickyBanner.css({
                position:        'fixed',
                bottom:          0,
                top:             null,
                width:           '100%',
                'z-index':       '1001',
                'border-top':    '#ccc 1px solid'
            });

            //add a proper padding between nth and nth + 1 container
            $(stickyConfig.$container.get(containerNo)).css({
                'padding-top': stickyBannerHeight
            });

            bannerScrollPos = window.scrollY + stickyConfig.windowHeight - stickyBannerHeight;

            //leave the banner behind when we will scroll to the end of the nth container
            if (bannerScrollPos >= stickyConfig.containerOffset) {
                $stickyBanner.css({
                    position:     'absolute',
                    top:           stickyConfig.containerOffset,
                    bottom:        null,
                    width:        '100%',
                    'z-index':    '1001',
                    'border-top': '#ccc 1px solid',
                    'border-bottom': '#ccc 1px solid'
                });
            }
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
                        },
                        containerNo = 2; //leave banner between the nth and nth+1 container

                    //we need at least nth + 1 containers
                    if (stickyConfig.windowHeight <= 960 && stickyConfig.$container.length >= containerNo + 1 && !window.scrollY) {
                        $('.fc-container__inner', $(stickyConfig.$container.get(containerNo))).css('border-top', 'none');
                        stickyConfig.containerOffset = stickyConfig.$container.get(containerNo).offsetTop + stickyConfig.headerHeight;

                        updatePosition(stickyConfig, containerNo);

                        mediator.on('window:scroll', _.throttle(function () {
                            updatePosition(stickyConfig, containerNo);
                        }, 10));
                    }
                }
            }
        ];
    };

});
