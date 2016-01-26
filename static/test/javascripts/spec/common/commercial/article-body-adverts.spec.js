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
            articleBodyAdverts,
            spaceFiller,
            spaceFillerStub,
            commercialFeatures,
            mediator,
            config,
            detect,
            dfp;

        beforeEach(function (done) {

            injector.require([
                'common/modules/commercial/article-body-adverts',
                'common/modules/commercial/commercial-features',
                'common/modules/commercial/dfp-api',
                'common/modules/article/space-filler',
                'common/utils/mediator',
                'common/utils/config',
                'common/utils/detect'
            ], function () {
                articleBodyAdverts = arguments[0];

                commercialFeatures = arguments[1];
                commercialFeatures.articleBodyAdverts = true;

                dfp = arguments[2];
                spyOn(dfp, 'addSlot').and.callFake(function () {
                    // nothing to see here, move along bro.
                });

                spaceFiller = arguments[3];
                spaceFillerStub = sinon.stub(spaceFiller, 'fillSpace');
                spaceFillerStub.returns(Promise.resolve(true));

                mediator = arguments[4];

                config = arguments[5];
                config.page = {};
                config.switches = {};

                detect = arguments[6];

                done();
            });
        });

        afterEach(function () {
            spaceFillerStub.restore();
        });

        it('should exist', function () {
            expect(articleBodyAdverts).toBeDefined();
        });

        it('should exit if commercial feature disabled', function () {
            commercialFeatures.articleBodyAdverts = false;
            var executionResult = articleBodyAdverts.init();
            expect(executionResult).toBe(false);
            expect(spaceFiller.fillSpace).not.toHaveBeenCalled();
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
                    expect(rules.selectors[' > h2'].minAbove).toEqual(20);

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
                spaceFillerStub.onCall(1).returns(Promise.resolve(false));
                spaceFillerStub.returns(Promise.resolve(true));

                var oldOn = mediator.on;
                var fn;
                mediator.on = function (eventName, fn2) {
                    fn = fn2;
                };
                var oldEmit = mediator.emit;
                mediator.emit = function (eventName, arg) {
                    return fn(arg);
                };

                config.switches.viewability = true;
                detect.getBreakpoint = function () {return 'tablet';};

                articleBodyAdverts.init().then(function () {
                    var fakeEvent = {
                        slot: {
                            getSlotElementId: function () {
                                return 'dfp-ad--im';
                            }
                        },
                        isEmpty: true
                    };

                    mediator.emit('modules:commercial:dfp:rendered', fakeEvent).then(function () {
                        mediator.on = oldOn;
                        mediator.emit = oldEmit;
                        expect(spaceFillerStub.callCount).toBe(12);
                        done();
                    });
                });
            });
        });

        describe('Non-merchandising adverts', function () {
            beforeEach(function () {
                config.page.hasInlineMerchandise = false; // exclude IM components from count
            });

            describe('When viewability enabled', function () {
                beforeEach(function () {
                    config.switches.viewability = true;
                });

                it('inserts up to two on mobile', function (done) {
                    detect.getBreakpoint = function () {return 'mobile';};
                    detect.isBreakpoint = function () {
                        return true; // fudge breakpoint check
                    };

                    articleBodyAdverts.init().then(function () {
                        expect(spaceFillerStub.callCount).toBe(2);
                        done();
                    });
                });

                describe('On mobiles and desktops', function () {
                    beforeEach(function () {
                        detect.getBreakpoint = function () {
                            return 'tablet';
                        };
                    });

                    it('inserts up to ten adverts', function (done) {
                        articleBodyAdverts.init().then(function () {
                            expect(spaceFillerStub.callCount).toBe(10);
                            done();
                        });
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
            });

            describe('When viewability disabled', function () {
                beforeEach(function () {
                    config.switches.viewability = false;
                });

                it('tries to add two on mobiles and tablets', function (done) {
                    detect.isBreakpoint = function () {
                        return true; // fudge check for max:tablet
                    };

                    articleBodyAdverts.init().then(function () {
                        expect(spaceFillerStub.callCount).toBe(2);
                        done();
                    });
                });

                it('tries to add just one on desktop', function (done) {
                    detect.isBreakpoint = function () {
                        return false; //fudge check for max:tablet
                    };

                    articleBodyAdverts.init().then(function () {
                        expect(spaceFillerStub.callCount).toBe(1);
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
                        expect(rules.selectors[' > *:not(p):not(h2)']).toEqual({
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
                        expect(rules.selectors[' > h2'].minAbove).toEqual(20);

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
