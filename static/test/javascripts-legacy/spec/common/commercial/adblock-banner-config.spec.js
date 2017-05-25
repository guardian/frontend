define([
    'helpers/injector'
], function (Injector) {

    describe('Adblock configuration rules', function () {

        var injector = new Injector();

        var testConfig = [
            {
                defaults: {
                    name: 'City'
                },
                variants: [
                    {
                        varName: 'Variant 1'
                    },
                    {
                        varName: 'Variant 2'
                    }
                ],
                editions: {
                    UK: {
                        city: 'London'
                    },
                    US: {
                        city: 'New York'
                    }
                }
            }
        ],
        ukBanners,
        usBanners,
        intBanners,
        adblockBannerConfig;

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
                'common/modules/commercial/adblock-banner-config'
            ], function($1) {
                adblockBannerConfig = $1;
                adblockBannerConfig.banners = testConfig;
                ukBanners = adblockBannerConfig.getBanners('UK');
                usBanners = adblockBannerConfig.getBanners('US');
                intBanners = adblockBannerConfig.getBanners('INT');
                done();
            },
            done.fail);
        });

        it('should return no banners given no locale', function () {
            expect(adblockBannerConfig.getBanners('')).toEqual([]);
        });

        it('should return one set of banners for the UK', function () {
            expect(ukBanners.length).toBe(1);
        });

        it('should return one set of banners for the US', function () {
            expect(usBanners.length).toBe(1);
        });

        it('should return all the variants of each banner type', function () {
            expect(usBanners[0].length).toEqual(2);
            expect(ukBanners[0].length).toEqual(2);
        });

        it('should include all the common config in each banner', function () {
            ukBanners[0].forEach(function (variant) {
                expect(variant.name).toEqual('City');
            });
        });

        it('should include all the variant config in each banner', function () {
            ukBanners[0].forEach(function (variant, v) {
                expect(variant).toEqual(jasmine.objectContaining(testConfig[0].variants[v]));
            });
        });

        it('should merge edition based config into each banner variant', function () {
            ukBanners[0].forEach(function (variant) {
                expect(variant).toEqual(jasmine.objectContaining(
                    adblockBannerConfig.banners[0].editions[variant.edition])
                );
            });
        });

        it('should skip banners which do not have a locale configured', function () {
            expect(intBanners.length).toBe(0);
        });

        it('should add the template and edition to each variant of the banner config for simplicity', function () {
            expect(usBanners[0][0].template).toEqual(adblockBannerConfig.banners[0].template);
            expect(usBanners[0][0].edition).toEqual('US');
        });
    });
});
