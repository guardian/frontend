define('ophan/ng', [], function () { return { record: function () {} }; });

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
        sut,
        commercialFeatures,
        injector = new Injector();

    describe('Plista', function () {
        beforeEach(function (done) {
            injector.mock('common/modules/commercial/dfp/track-ad-render', function(id) {
                return Promise.resolve(ads[id]);
            });

            window.guardian.adBlockers.active = true;

            injector.require([
                'common/utils/config',
                'common/modules/identity/api',
                'commercial/modules/third-party-tags/plista',
                'common/modules/commercial/commercial-features'
            ], function () {
                config = arguments[0];
                identity = arguments[1];
                sut = arguments[2];
                commercialFeatures = arguments[3];

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

            it('should not load when is preview', function (done) {
                config.page.isPreview = true;
                spyOn(sut, 'load');
                sut.init().then(function(){
                    expect(sut.load).not.toHaveBeenCalled();
                    done();
                });
            });

            it('should not load when user is logged in', function (done) {
                identity.isUserLoggedIn = function () {
                    return true;
                };

                sut.init().then(function(){
                    expect(sut.load).not.toHaveBeenCalled();
                    done();
                });
            });

            it('should load when user is logged in but there are no comments on the page', function (done) {
                identity.isUserLoggedIn = function () {
                    return true;
                };

                config.page.commentable = false;
                spyOn(sut, 'load');
                sut.init().then(function(){
                    expect(sut.load).toHaveBeenCalled();
                    done();
                });
            });
        });
    });
});
