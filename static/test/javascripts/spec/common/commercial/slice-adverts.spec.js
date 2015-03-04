define([
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/modules/user-prefs',
    'helpers/fixtures',
    'helpers/injector',
    'text!fixtures/commercial/slice-adverts.html'
], function (
    bonzo,
    qwery,
    $,
    userPrefs,
    fixtures,
    Injector,
    sliceAdvertsHtml
) {

    return new Injector()
        .store(['common/utils/config'])
        .require(['common/modules/commercial/slice-adverts', 'mocks'], function (sliceAdverts, mocks) {

            describe('Slice Adverts', function () {

                var fixturesConfig = {
                        id: 'slice-adverts',
                        fixtures: [sliceAdvertsHtml]
                    },
                    $fixtureContainer;

                beforeEach(function () {
                    mocks.store['common/utils/config'].page = {
                        pageId: 'uk/commentisfree'
                    };
                    mocks.store['common/utils/config'].switches = {
                        standardAdverts: true
                    };

                    $fixtureContainer = fixtures.render(fixturesConfig);
                });

                afterEach(function () {
                    fixtures.clean(fixturesConfig.id);
                    userPrefs.remove('container-states');
                });

                it('should exist', function () {
                    expect(sliceAdverts).toBeDefined();
                });

                it('should only create a maximum of 4 advert slots', function () {
                    sliceAdverts.init();

                    expect(qwery('.ad-slot', $fixtureContainer).length).toEqual(4);
                });

                it('should remove the "fc-slice__item--no-mpu" class', function () {
                    sliceAdverts.init();

                    $('.ad-slot', $fixtureContainer).each(function (adSlot) {
                        expect(bonzo(adSlot).parent().hasClass('fc-slice__item--no-mpu')).toBe(false);
                    })
                });

                it('should have the correct ad names', function () {
                    sliceAdverts.init();
                    var $adSlots = $('.ad-slot', $fixtureContainer).map(function (slot) { return $(slot); });

                    expect($adSlots[0].data('name')).toEqual('inline1');
                    expect($adSlots[1].data('name')).toEqual('inline1');
                    expect($adSlots[2].data('name')).toEqual('inline2');
                    expect($adSlots[3].data('name')).toEqual('inline2');
                });

                it('should have the correct size mappings', function () {
                    sliceAdverts.init();
                    $('.ad-slot--inline1', $fixtureContainer).each(function (adSlot) {
                        var $adSlot = bonzo(adSlot);

                        expect($adSlot.data('mobile')).toEqual('1,1|300,50|300,250');
                        expect($adSlot.data('mobile-landscape')).toEqual('1,1|300,50|320,50|300,250');
                        expect($adSlot.data('tablet')).toEqual('1,1|300,250');
                    });
                    $('.ad-slot--inline2', $fixtureContainer).each(function (adSlot) {
                        var $adSlot = bonzo(adSlot);

                        expect($adSlot.data('mobile')).toEqual('1,1|300,50');
                        expect($adSlot.data('mobile-landscape')).toEqual('1,1|300,50|320,50');
                        expect($adSlot.data('tablet')).toEqual('1,1|300,250');
                    });
                });

                it('should have at least one non-advert containers between advert containers', function () {
                    sliceAdverts.init();

                    expect(qwery('.fc-container-first .ad-slot', $fixtureContainer).length).toBe(1);
                    expect(qwery('.fc-container-third .ad-slot', $fixtureContainer).length).toBe(1);
                });

                it('should not not display ad slot if standard-adverts switch is off', function () {
                    mocks.store['common/utils/config'].switches.standardAdverts = false;

                    expect(sliceAdverts.init()).toBe(false);
                    expect(qwery('.ad-slot', $fixtureContainer).length).toBe(0);
                });

                it('should not add ad to first container if network front', function () {
                    mocks.store['common/utils/config'].page.pageId = 'uk';
                    sliceAdverts.init();

                    expect(qwery('.fc-container-first .ad-slot', $fixtureContainer).length).toBe(0);
                    expect(qwery('.fc-container-third .ad-slot', $fixtureContainer).length).toBe(1);
                    expect(qwery('.fc-container-fifth .ad-slot', $fixtureContainer).length).toBe(1);
                });

                it('should not add ad to container if it is closed', function () {
                    var containerId = '9cd2-e508-2bc1-5afd',
                        prefs       = {};
                    prefs[containerId] = 'closed';
                    $('.fc-container-first', $fixtureContainer).attr('data-id', containerId);
                    userPrefs.set('container-states', prefs);
                    sliceAdverts.init();

                    expect(qwery('.fc-container-third .ad-slot', $fixtureContainer).length).toBe(1);
                    expect(qwery('.fc-container-fifth .ad-slot', $fixtureContainer).length).toBe(1);
                });

                it('should add one slot for tablet, one slot for mobile after container', function () {
                    sliceAdverts.init();

                    expect($('.fc-container-first .ad-slot', $fixtureContainer).hasClass('ad-slot--not-mobile'))
                        .toBe(true);
                    expect($('.fc-container-first + .ad-slot', $fixtureContainer).hasClass('ad-slot--mobile'))
                        .toBe(true);
                });

            });

        });

});
