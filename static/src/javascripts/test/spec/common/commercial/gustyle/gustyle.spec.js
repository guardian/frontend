import Injector from 'helpers/injector';
import $ from 'common/utils/$';

var Sut, // System under test
    injector = new Injector(),
    gustyle;

fdescribe('GU Style', function () {
    beforeEach(function (done) {
        injector.test(['common/modules/commercial/gustyle/gustyle'], function () {
            Sut = arguments[0];
            done();
        });
    });

    afterEach(function () {
        gustyle = null;
    });

    it('should create new instance with slot and ad type in parameters', function () {
        var adSlot = '<div class="ad-slot"></div>',
            adType =  {
                type: 'gu-style',
                variant: 'content'
            };

        gustyle = new Sut(adSlot, adType);
        expect(gustyle.slot).toEqual(adSlot);
        expect(gustyle.adtype).toEqual(adType);
    });

    it('should set escape usual ad slot boundaries', function () {
        var adSlot = '<div class="ad-slot"></div>',
            adType =  {
                type: 'gu-style',
                variant: 'content'
            };

        gustyle = new Sut(adSlot, adType);
        expect($('ad-slot').hasClass('gu-style')).toBeTruthy();
    });

    it('should add label', function () {
        var adSlot = '<div class="ad-slot"></div>',
            adType =  {
                type: 'gu-style',
                variant: 'content'
            };

        gustyle = new Sut(adSlot, adType);
        expect($('.gu-comlabel').length).toEqual(1);
    });
});
