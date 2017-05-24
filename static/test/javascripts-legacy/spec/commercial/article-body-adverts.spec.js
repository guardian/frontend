define([
    'fastdom',
    'qwery',
    'lib/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    fastdom,
    qwery,
    $,
    fixtures,
    Injector
) {
    function noop() {

    }

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
            injector.mock('commercial/modules/dfp/track-ad-render', function trackAdRender(id) {
                return Promise.resolve(ads[id]);
            });

            injector.mock('commercial/modules/dfp/add-slot', {
                addSlot: function () {
                    /* noop */
                }
            });
            injector.require([
                'commercial/modules/article-body-adverts',
                'commercial/modules/commercial-features',
                'common/modules/article/space-filler',
                'lib/config',
                'lib/detect'
            ], function ($1, $2, $3, $4, $5) {
                articleBodyAdverts = $1;

                commercialFeatures = $2.commercialFeatures;
                commercialFeatures.articleBodyAdverts = true;

                spaceFiller = $3;
                spaceFillerStub = sinon.stub(spaceFiller, 'fillSpace');
                spaceFillerStub.returns(Promise.resolve(true));

                config = $4;
                config.page = {};
                config.switches = {};

                detect = $5;

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
            articleBodyAdverts.articleBodyAdvertsInit(noop, noop).then(function(executionResult){
                expect(executionResult).toBe(false);
                expect(spaceFiller.fillSpace).not.toHaveBeenCalled();
                done();
            });
        });

        it('should call space-filler`s insertion method with the correct arguments', function (done) {
            articleBodyAdverts.articleBodyAdvertsInit(noop, noop).then(function () {
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
                articleBodyAdverts.articleBodyAdvertsInit(noop, noop).then(function () {
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

                articleBodyAdverts.articleBodyAdvertsInit(noop, noop).then(function () {
                    var firstCall = spaceFillerStub.firstCall,
                        writer = firstCall.args[1];
                    writer([paragraph]);

                    // Wait until fastdom has written before checking
                    fastdom.read(function(){
                        var expectedAd = fixture.querySelector('#dfp-ad--im');
                        expect(expectedAd).toBeTruthy();
                        done();
                    });

                });
            });

            it('inserts up to ten adverts when DFP returns empty merchandising components', function (done) {
                // The 0 is for addInlineMerchAd, failing to add a merchandising component.
                spaceFillerStub.onCall(0).returns(Promise.resolve(0));
                // The 2 is for addInlineAds, adding adverts using standard getRules().
                spaceFillerStub.onCall(1).returns(Promise.resolve(2));
                // The 8 is for addInlineAds again, adding adverts using getLongArticleRules().
                spaceFillerStub.onCall(2).returns(Promise.resolve(8));

                detect.getBreakpoint = function () {return 'tablet';};
                ads['dfp-ad--im'] = false;
                articleBodyAdverts._.addInlineMerchAd()
                .then(articleBodyAdverts._.waitForMerch)
                .then(articleBodyAdverts._.addInlineAds)
                .then(function (countAdded) {
                    expect(countAdded).toEqual(10);
                })
                .then(done)
                .catch(done.fail);
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
                    articleBodyAdverts._.addInlineAds()
                    .then(function (countAdded) {
                        expect(countAdded).toEqual(10);
                    })
                    .then(done)
                    .catch(done.fail);
                });

                it('inserts the third+ adverts with greater vertical spacing', function (done) {
                    // We do not want the same ad-density on long-read
                    // articles that we have on shorter pieces
                    articleBodyAdverts.articleBodyAdvertsInit(noop, noop).then(function () {
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
                    return articleBodyAdverts.articleBodyAdvertsInit(noop, noop).then(function () {
                        var firstCall = spaceFillerStub.firstCall;
                        return firstCall.args[0];
                    });
                }

            });
        });
    });
});
