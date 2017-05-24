define([
    'helpers/injector'
], function (Injector) {

    describe('Adblock banner', function () {

        var injector = new Injector();
        var adblockBannerConfig, AdblockBanner, ukBanners;

        beforeEach(function (done) {
            injector.mock('lib/config', {
                images: {
                    membership: {
                        'adblock-coins': '',
                        'adblock-coins-us': ''
                    }
                }
            });

            injector.require([
                'common/modules/adblock-banner',
                'common/modules/commercial/adblock-banner-config'
            ], function ($1, $2) {
                AdblockBanner = $1;
                adblockBannerConfig = $2;
                document.innerHtml = '<div class="top-banner-ad-container--desktop"></div>';
                ukBanners = adblockBannerConfig.getBanners('UK');
                done();
            },
            done.fail);
        });

        it('should be able to render every type of banner', function () {
            ukBanners.forEach(function (banners) {
                banners.forEach(function (variant) {
                    new AdblockBanner.AdblockBanner(variant.template, variant).renderTemplate();
                });
            });
        });
    });
});
