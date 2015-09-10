import fixtures from 'helpers/fixtures';
import Injector from 'helpers/injector';

var sut, // System under test
    injector = new Injector();

fdescribe('GU Style', function () {
    beforeEach(function (done) {
        injector.test([
            'common/modules/commercial/gustyle/gustyle'], function () {
            sut = arguments[0];
            done();
        });
    });

    it('call get create method with adslot and adtype parameters', function () {
        spyOn(sut, 'create');

        var adSlot = '<div class="ad-slot"></div>',
            adType =  {
                type: 'gu-style',
                variant: 'content'
            };

        sut.create(adSlot, adType);
        expect(sut.create).toHaveBeenCalledWith(adSlot, adType);
    });
});