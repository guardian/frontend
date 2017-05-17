define('ophan/ng', [], function () { return { record: function () {} }; });

define([
    'fastdom',
    'helpers/injector',
    'helpers/fixtures'
], function (
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
        sut,
        commercialFeatures,
        injector = new Injector();

    describe('Plista', function () {
        beforeEach(function (done) {
            injector.mock('commercial/modules/dfp/track-ad-render', function(id) {
                return Promise.resolve(ads[id]);
            });

            window.guardian.adBlockers.active = true;

            injector.require([
                'lib/config',
                'commercial/modules/third-party-tags/plista',
                'commercial/modules/commercial-features'
            ], function () {
                config = arguments[0];
                sut = arguments[1].default;
                commercialFeatures = arguments[2];

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

            it('should load plista component immediately when adblock in use', function (done) {
                window.guardian.adBlockers.active = true;
                spyOn(sut, 'load');
                sut.init().then(function() {
                    expect(sut.load).toHaveBeenCalled();
                    done();
                });
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

            it('should not load when sensitive content', function (done) {
                commercialFeatures.outbrain = false;
                spyOn(sut, 'load');
                sut.init().then(function () {
                    expect(sut.load).not.toHaveBeenCalled();
                    done();
                });
            });
        });
    });
});
