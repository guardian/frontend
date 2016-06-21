define('ophan/ng', [], function () { return { record: function () {} }; });
define('js', [], function () { return function () {}; });
define('js!//widgets.outbrain.com/outbrain.js', [], function () { return function () {}; });

define([
    'Promise',
    'fastdom',
    'helpers/injector',
    'helpers/fixtures'
], function (
    Promise,
    fastdom,
    Injector,
    fixtures
) {

    var fixturesConfig = {
            id: 'plista',
            fixtures: [
                '<div class="js-plista"><div class="js-plista-container"></div></div>'
            ]
        },
        ads = {
            'dfp-ad--merchandising-high': false
        },
        config,
        identity,
        detect,
        dfp,
        sut,
        commercialFeatures,
        injector = new Injector();

    describe('Plista', function () {
        beforeEach(function (done) {
            injector.require([
                'common/modules/commercial/dfp/dfp-api',
                'common/utils/config',
                'common/modules/identity/api',
                'common/utils/detect',
                'common/modules/commercial/third-party-tags/plista',
                'common/modules/commercial/commercial-features'
            ], function () {
                dfp      = arguments[0];
                dfp.trackAdRender = function (id) {
                    return Promise.resolve(ads[id]);
                };
                config = arguments[1];
                identity = arguments[2];
                detect = arguments[3];
                sut = arguments[4];
                commercialFeatures = arguments[5];

                commercialFeatures.thirdPartyTags = true;
                commercialFeatures.outbrain = true;
                config.switches.plistaForOutbrainAu = true;
                config.page = {
                    section: 'uk-news',
                    isPreview: false,
                    isFront: false,
                    commentable: true,
                    edition: 'AU'
                };

                identity.isUserLoggedIn = function () {
                    return false;
                };

                detect.adblockInUseSync = function () {
                    return false;
                };

                fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        describe('Init', function () {

            it('should exist', function () {
                expect(sut).toBeDefined();
            });

            it('should load plista component immediately when adblock in use', function () {

                detect.adblockInUseSync = function () {
                    return true;
                };

                spyOn(sut, 'load');
                sut.init();
                expect(sut.load).toHaveBeenCalled();
            });

            it('should load plista component when render completes', function (done) {
                var fixturesMerch = {
                    id: 'merch',
                    fixtures: [
                        '<div id="dfp-ad--merchandising-high"></div>'
                    ]
                };
                fixtures.render(fixturesMerch);

                spyOn(sut, 'load');
                sut.init().then(function () {
                    expect(sut.load).toHaveBeenCalled();
                    done();
                });
                expect(sut.load).not.toHaveBeenCalled();

                fixtures.clean(fixturesMerch.id);
            });

            it('should not load when sensitive content', function () {
                commercialFeatures.outbrain = false;
                spyOn(sut, 'load');
                sut.init();
                expect(sut.load).not.toHaveBeenCalled();
            });

            it('should not load when is preview', function () {
                config.page.isPreview = true;
                spyOn(sut, 'load');
                sut.init();
                expect(sut.load).not.toHaveBeenCalled();
            });

            it('should not load when user is logged in', function () {
                identity.isUserLoggedIn = function () {
                    return true;
                };

                sut.init();
                expect(sut.load).not.toHaveBeenCalled();
            });

            it('should load when user is logged in but there are no comments on the page', function () {
                identity.isUserLoggedIn = function () {
                    return true;
                };

                config.page.commentable = false;
                spyOn(sut, 'load');
                sut.init();
                expect(sut.load).toHaveBeenCalled();
            });

            it('should load instantly when ad block is in use', function () {
                detect.adblockInUseSync = function () {
                    return true;
                };
                spyOn(sut, 'load');
                sut.init();
                expect(sut.load).toHaveBeenCalled();
            });
        });
    });
});
