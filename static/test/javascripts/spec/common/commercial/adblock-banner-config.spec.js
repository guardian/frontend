define([
    'common/modules/commercial/adblock-banner-config'
], function (adblockBannerConfig) {

    describe('Adblock configuration rules', function () {

        var ukBanners;

        beforeEach(function () {
            ukBanners = adblockBannerConfig.getBanners('UK');
        });

        it('should return no banners given no locale', function () {
            expect(adblockBannerConfig.getBanners('')).toEqual([]);
        });

        it('should return two sets of banners for the UK, contributor and coin', function () {
            var banners = adblockBannerConfig.getBanners('UK');
            expect(banners.length).toBe(2);
        });

        it('should return two sets of banners for the INT, contributor and coin', function () {
            var banners = adblockBannerConfig.getBanners('INT');
            expect(banners.length).toBe(2);
        });

        it('should return all the variants of each banner type', function () {
            ukBanners.forEach(function (banners, i) {
                expect(banners.length).toEqual(adblockBannerConfig.banners[i].variants.length);
            });
        });

        it('should include all the common config in each banner', function () {
            ukBanners.forEach(function (banners, b) {
                banners.forEach(function (variant) {
                    expect(variant).toEqual(jasmine.objectContaining(adblockBannerConfig.banners[b].defaults));
                });
            });
        });

        it('should include all the variant config in each banner', function () {
            ukBanners.forEach(function (banners, b) {
                banners.forEach(function (variant, v) {
                    expect(variant).toEqual(jasmine.objectContaining(adblockBannerConfig.banners[b].variants[v]));
                });
            });
        });

        it('should merge edition based config into each banner variant', function () {
            ukBanners.forEach(function (banners, b) {
                banners.forEach(function (variant) {
                    expect(variant).toEqual(jasmine.objectContaining(adblockBannerConfig.banners[b].editions.UK));
                });
            });
        });

        it('should skip banners which do not have a locale configured', function () {
            delete adblockBannerConfig.banners[1].editions.UK;
            var usBanners = adblockBannerConfig.getBanners('UK');
            expect(usBanners.length).toBe(1);
        });

        it('should add the template and edition to each variant of the banner config for simplicity', function () {
            expect(ukBanners[0][0].template).toEqual(adblockBannerConfig.banners[0].template);
            expect(ukBanners[0][0].edition).toEqual('UK');
        });
    });
});
