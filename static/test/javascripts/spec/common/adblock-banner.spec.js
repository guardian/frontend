define([
    'common/modules/commercial/adblock-banner-config',
    'common/modules/adblock-banner'
], function (adblockBannerConfig, AdblockBanner) {

    describe('Adblock banner', function () {

        var ukBanners;
        beforeEach(function () {
            document.innerHtml = '<div class="top-banner-ad-container--desktop"></div>';
            ukBanners = adblockBannerConfig.getBanners('US');
        });

        it('should be able to render every type of banner', function () {
            ukBanners.forEach(function (banners) {
                banners.forEach(function (variant) {
                    var ab = new AdblockBanner(variant.template, variant);
                    expect(ab.template).toBeDefined();
                    expect(ab.renderTemplate()).toBeDefined();
                });
            });
        });
    });
});
