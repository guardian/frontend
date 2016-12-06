define([
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/user-prefs',
    'helpers/fixtures',
    'helpers/injector',
    'text!fixtures/commercial/slice-adverts.html'
], function (
    bonzo,
    qwery,
    $,
    createAdSlot,
    userPrefs,
    fixtures,
    Injector,
    sliceAdvertsHtml
) {
    describe('Slice Adverts', function () {

        var fixturesConfig = {
                id: 'slice-adverts',
                fixtures: [sliceAdvertsHtml]
            },
            $fixtureContainer,
            injector = new Injector(),
            sliceAdverts, config, detect, commercialFeatures;

        var createSlotSpy = jasmine.createSpy('dfp/create-slot').and.callFake(createAdSlot);

        beforeEach(function (done) {
            createSlotSpy.calls.reset();
            injector.mock('common/modules/commercial/dfp/create-slot', createSlotSpy);

            injector.require([
                'commercial/modules/slice-adverts',
                'common/modules/commercial/commercial-features',
                'common/utils/config',
                'common/utils/detect'
            ], function () {
                sliceAdverts = arguments[0];
                commercialFeatures = arguments[1];
                config = arguments[2];
                detect = arguments[3];

                config.page = {
                    pageId: 'uk/commentisfree',
                    isFront: true
                };

                detect.isBreakpoint = function () {
                    return false;
                };

                commercialFeatures.sliceAdverts = true;

                $fixtureContainer = fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
            userPrefs.remove('container-states');
        });

        it('should exist', function () {
            expect(sliceAdverts).toBeDefined();
        });

        it('should only create a maximum of 5 advert slots', function (done) {
            sliceAdverts.init()
            .then(function () {
                expect(qwery('.ad-slot', $fixtureContainer).length).toEqual(5);
            })
            .then(done)
            .catch(done.fail);
        });

        it('should remove the "fc-slice__item--no-mpu" class', function (done) {
            detect.getBreakpoint = function () {
                return 'desktop';
            };

            sliceAdverts.init()
            .then(function () {
                $('.ad-slot', $fixtureContainer).each(function (adSlot) {
                    expect(bonzo(adSlot).parent().hasClass('fc-slice__item--no-mpu')).toBe(false);
                });
            })
            .then(done)
            .catch(done.fail);
        });

        it('should have the correct ad names', function (done){
            sliceAdverts.init()
            .then(function () {
                var $adSlots = $('.ad-slot', $fixtureContainer).map(function (slot) { return $(slot); });

                expect($adSlots[0].data('name')).toEqual('inline1');
                expect($adSlots[1].data('name')).toEqual('inline2');
                expect($adSlots[2].data('name')).toEqual('inline3');
            })
            .then(done)
            .catch(done.fail);
        });

        it('should have the correct ad names on mobile', function (done) {
            var oldis = detect.isBreakpoint;
            detect.isBreakpoint = function () {
                return true;
            };
            sliceAdverts.init()
            .then(function () {
                var $adSlots = $('.ad-slot', $fixtureContainer).map(function (slot) { return $(slot); });

                expect($adSlots[0].data('name')).toEqual('top-above-nav');
                expect($adSlots[1].data('name')).toEqual('inline1');
                expect($adSlots[2].data('name')).toEqual('inline2');

                detect.isBreakpoint = oldis;
            })
            .then(done)
            .catch(done.fail);
        });

        it('should have the correct size mappings', function (done) {
            sliceAdverts.init()
            .then(function () {
                $('.ad-slot--inline1', $fixtureContainer).each(function (adSlot) {
                    var $adSlot = bonzo(adSlot);

                    expect($adSlot.data('mobile')).toEqual('1,1|2,2|300,250|fluid');
                });
                $('.ad-slot--inline2', $fixtureContainer).each(function (adSlot) {
                    var $adSlot = bonzo(adSlot);

                    expect($adSlot.data('mobile')).toEqual('1,1|2,2|300,250|fluid');
                });
            })
            .then(done)
            .catch(done.fail);
        });

        it('should have the correct size mappings on mobile', function (done) {
            var oldis = detect.isBreakpoint;
            detect.isBreakpoint = function () {
                return true;
            };
            sliceAdverts.init()
            .then(function () {
                $('.ad-slot--top-above-nav', $fixtureContainer).each(function (adSlot) {
                    var $adSlot = bonzo(adSlot);

                    expect($adSlot.data('mobile')).toEqual('1,1|2,2|300,250|88,70|88,71|fluid');
                });
                $('.ad-slot--inline1', $fixtureContainer).each(function (adSlot) {
                    var $adSlot = bonzo(adSlot);

                    expect($adSlot.data('mobile')).toEqual('1,1|2,2|300,250|fluid');
                });
                detect.isBreakpoint = oldis;
            })
            .then(done)
            .catch(done.fail);
        });

        it('should have at least one non-advert containers between advert containers', function (done) {
            sliceAdverts.init()
            .then(function () {
                expect(qwery('.fc-container-first .ad-slot', $fixtureContainer).length).toBe(1);
                expect(qwery('.fc-container-third .ad-slot', $fixtureContainer).length).toBe(1);
            })
            .then(done)
            .catch(done.fail);
        });

        it('should not display ad slot if disabled in commercial-features', function (done) {
            commercialFeatures.sliceAdverts = false;

            sliceAdverts.init()
            .then(function (res) {
                expect(res).toBe(false);
                expect(qwery('.ad-slot', $fixtureContainer).length).toBe(0);
            })
            .then(done)
            .catch(done.fail);
        });

        it('should not add ad to first container if network front', function (done) {
            config.page.pageId = 'uk';
            var oldis = detect.isBreakpoint;
            detect.isBreakpoint = function () {
                return false;
            };
            sliceAdverts.init()
            .then(function () {
                expect(qwery('.fc-container-first .ad-slot', $fixtureContainer).length).toBe(0);
                expect(qwery('.fc-container-third .ad-slot', $fixtureContainer).length).toBe(1);
                expect(qwery('.fc-container-fifth .ad-slot', $fixtureContainer).length).toBe(1);
                detect.isBreakpoint = oldis;
            })
            .then(done)
            .catch(done.fail);
        });

        it('should not add ad to container if it is closed', function (done) {
            var containerId = '9cd2-e508-2bc1-5afd',
                prefs       = {};
            prefs[containerId] = 'closed';
            $('.fc-container-first', $fixtureContainer).attr('data-id', containerId);
            userPrefs.set('container-states', prefs);
            sliceAdverts.init()
            .then(function () {
                expect(qwery('.fc-container-third .ad-slot', $fixtureContainer).length).toBe(1);
                expect(qwery('.fc-container-fifth .ad-slot', $fixtureContainer).length).toBe(1);
            })
            .then(done)
            .catch(done.fail);
        });

        describe('Top slot replacement', function () {
            beforeEach(function () {
                // To be sure that any slots added are top slot replacements, we set the page to a network front,
                // where adverts will normally never appear on the first container.
                config.page.pageId = 'uk';
            });

            it('is added on mobile', function (done) {
                var oldis = detect.isBreakpoint;
                detect.isBreakpoint = function () {
                    return true;
                };
                sliceAdverts.init()
                .then(function () {
                    expect(qwery('.fc-container-first+section>.ad-slot', $fixtureContainer).length).toBe(1);
                    detect.isBreakpoint = oldis;
                })
                .then(done)
                .catch(done.fail);
            });

            it('is not added on desktop', function (done) {
                sliceAdverts.init()
                .then(function () {
                    expect(qwery('.fc-container-first .ad-slot', $fixtureContainer).length).toBe(0);
                })
                .then(done)
                .catch(done.fail);
            });


        });

        //TODO: get data if we need to reintroduce this again
        xit('should add one slot for tablet, one slot for mobile after container', function (done) {
            sliceAdverts.init()
            .then(function () {
                expect($('.fc-container-first .ad-slot', $fixtureContainer).hasClass('ad-slot--not-mobile'))
                    .toBe(true);
                expect($('.fc-container-first + .ad-slot', $fixtureContainer).hasClass('ad-slot--mobile'))
                    .toBe(true);
            })
            .then(done)
            .catch(done.fail);
        });
    });
});
