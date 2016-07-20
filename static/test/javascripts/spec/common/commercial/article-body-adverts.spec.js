define([
    'fastdom',
    'qwery',
    'Promise',
    'common/utils/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    fastdom,
    qwery,
    Promise,
    $,
    fixtures,
    Injector
) {
    describe('Article Body Adverts', function () {
        var injector = new Injector(),
            ads = {
               'dfp-ad--im': true
            },
            articleBodyAdverts,
            spaceFiller,
            spaceFillerStub,
            commercialFeatures,
            config,
            detect;

        beforeEach(function (done) {
            injector.mock('common/modules/commercial/dfp/track-ad-render', function trackAdRender(id) {
                return Promise.resolve(ads[id]);
            });

            injector.mock('common/modules/commercial/dfp/add-slot', function () {
                /* noop */
            });
            injector.require([
                'common/modules/commercial/article-body-adverts',
                'common/modules/commercial/commercial-features',
                'common/modules/article/space-filler',
                'common/utils/config',
                'common/utils/detect'
            ], function () {
                articleBodyAdverts = arguments[0];

                commercialFeatures = arguments[1];
                commercialFeatures.articleBodyAdverts = true;

                spaceFiller = arguments[2];
                spaceFillerStub = sinon.stub(spaceFiller, 'fillSpace');
                spaceFillerStub.returns(Promise.resolve(true));

                config = arguments[3];
                config.page = {};
                config.switches = {};

                detect = arguments[4];

                done();
            });
        });

        afterEach(function () {
            spaceFillerStub.restore();
        });

        it('should exist', function () {
            expect(articleBodyAdverts).toBeDefined();
        });

        it('should exit if commercial feature disabled', function (done) {
            commercialFeatures.articleBodyAdverts = false;
            articleBodyAdverts.init().then(function(executionResult){
                expect(executionResult).toBe(false);
                expect(spaceFiller.fillSpace).not.toHaveBeenCalled();
                done();
            });
        });

        it('should call space-filler`s insertion method with the correct arguments', function (done) {
            articleBodyAdverts.init().then(function () {
                var args = spaceFillerStub.firstCall.args,
                    rulesArg = args[0],
                    writerArg = args[1];

                expect(rulesArg.minAbove).toBeDefined();
                expect(rulesArg.minBelow).toBeDefined();
                expect(rulesArg.selectors).toBeDefined();

                expect(writerArg).toEqual(jasmine.any(Function));

                done();
            });
        });

        describe('When merchandising components enabled', function () {
            beforeEach(function () {
                config.page.hasInlineMerchandise = true;
            });

            it('its first call to space-filler uses the inline-merch rules', function (done) {
                articleBodyAdverts.init().then(function () {
                    var firstCall = spaceFillerStub.firstCall,
                        rules = firstCall.args[0];

                    expect(rules.minAbove).toEqual(300);
                    expect(rules.selectors[' > h2'].minAbove).toEqual(100);

                    done();
                });
            });

            it('its first call to space-filler passes an inline-merch writer', function (done) {
                var fixture = document.createElement('div'),
                    paragraph = document.createElement('p');
                fixture.appendChild(paragraph);

                articleBodyAdverts.init().then(function () {
                    var firstCall = spaceFillerStub.firstCall,
                        writer = firstCall.args[1];
                    writer([paragraph]);

                    var expectedAd = fixture.querySelector('#dfp-ad--im');
                    expect(expectedAd).toBeTruthy();

                    done();
                });
            });

            it('inserts up to ten adverts when DFP returns empty merchandising components', function (done) {
                spaceFillerStub.onCall(0).returns(Promise.resolve(false));
                spaceFillerStub.onCall(1).returns(Promise.resolve(0));
                spaceFillerStub.onCall(2).returns(Promise.resolve(2));
                spaceFillerStub.onCall(3).returns(Promise.resolve(8));

                detect.getBreakpoint = function () {return 'tablet';};
                ads['dfp-ad--im'] = false;
                articleBodyAdverts.init()
                    .then(articleBodyAdverts['@@tests'].waitForMerch)
                    .then(function (countAdded) {
                        expect(countAdded).toEqual(10);
                    }).then(done);
            });
        });

        describe('Non-merchandising adverts', function () {
            beforeEach(function () {
                config.page.hasInlineMerchandise = false; // exclude IM components from count
            });

            describe('On mobiles and desktops', function () {
                it('inserts up to ten adverts', function (done) {
                    spaceFillerStub.onCall(0).returns(Promise.resolve(2));
                    spaceFillerStub.onCall(1).returns(Promise.resolve(8));
                    articleBodyAdverts.init()
                        .then(articleBodyAdverts['@@tests'].insertLongAds)
                        .then(function (countAdded) {
                            expect(countAdded).toEqual(10);
                        })
                        .then(done);
                });

                it('inserts the third+ adverts with greater vertical spacing', function (done) {
                    // We do not want the same ad-density on long-read
                    // articles that we have on shorter pieces
                    articleBodyAdverts.init().then(function () {
                        var longArticleInsertionCalls = spaceFillerStub.args.slice(2);
                        var longArticleInsertionRules = longArticleInsertionCalls.map(function (call) {
                            return call[0];
                        });
                        longArticleInsertionRules.forEach(function (ruleset) {
                            var adSlotSpacing = ruleset.selectors[' .ad-slot'];
                            expect(adSlotSpacing).toEqual({minAbove: 1300, minBelow: 1300});
                        });
                        done();
                    });
                });
            });

            describe('Spacefinder rules', function () {

                it('includes basic rules for all circumstances', function (done) {
                    getFirstRulesUsed().then(function (rules) {
                        // do not appear in the bottom 300px of the article
                        expect(rules.minBelow).toBe(300);

                        // do not appear above headings
                        expect(rules.selectors[' > h2'].minBelow).toEqual(250);

                        // do not appear next to other adverts
                        expect(rules.selectors[' .ad-slot']).toEqual({
                            minAbove : 500,
                            minBelow : 500
                        });

                        // do not appear next to non-paragraph elements
                        expect(rules.selectors[' > :not(p):not(h2):not(.ad-slot)']).toEqual({
                            minAbove : 35,
                            minBelow : 400
                        });

                        done();
                    });
                });

                it('includes rules for mobile phones', function (done) {
                    detect.getBreakpoint = function () {
                        return 'mobile';
                    };
                    detect.isBreakpoint = function () {
                        return true; // fudge check for max:tablet
                    };

                    getFirstRulesUsed().then(function (rules) {
                        // adverts can appear higher up the page
                        expect(rules.minAbove).toEqual(300);

                        // give headings more vertical clearance
                        expect(rules.selectors[' > h2'].minAbove).toEqual(100);

                        done();
                    });
                });

                it('includes rules for tablet devices', function (done) {
                    detect.getBreakpoint = function () {
                        return 'tablet';
                    };
                    detect.isBreakpoint = function () {
                        return true; // fudge check for max:tablet
                    };

                    getFirstRulesUsed().then(function (rules) {
                        // adverts can appear higher up the page
                        expect(rules.minAbove).toEqual(300);

                        // give headings no vertical clearance
                        expect(rules.selectors[' > h2'].minAbove).toEqual(0);

                        done();
                    });
                });

                it('includes rules for larger screens', function (done) {
                    detect.getBreakpoint = function () {
                        return 'desktop';
                    };
                    detect.isBreakpoint = function () {
                        return false; // fudge check for max:tablet
                    };

                    getFirstRulesUsed().then(function (rules) {
                        // adverts give the top of the page more clearance
                        expect(rules.minAbove).toEqual(700);

                        // give headings no vertical clearance
                        expect(rules.selectors[' > h2'].minAbove).toEqual(0);

                        done();
                    });
                });

                function getFirstRulesUsed() {
                    return articleBodyAdverts.init().then(function () {
                        var firstCall = spaceFillerStub.firstCall;
                        return firstCall.args[0];
                    });
                }

            });
        });
    });
});
