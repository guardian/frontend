import bonzo from 'bonzo';
import Injector from 'helpers/injector';
import adbadgeHtml from 'text!fixtures/commercial/ad-slots/adbadge.html';
import fobadgeHtml from 'text!fixtures/commercial/ad-slots/fobadge.html';
import imHtml from 'text!fixtures/commercial/ad-slots/im.html';
import inline1Html from 'text!fixtures/commercial/ad-slots/inline1.html';
import inline2Html from 'text!fixtures/commercial/ad-slots/inline2.html';
import inline3Html from 'text!fixtures/commercial/ad-slots/inline3.html';
import merchandisingHighHtml from 'text!fixtures/commercial/ad-slots/merchandising-high.html';
import rightHtml from 'text!fixtures/commercial/ad-slots/right.html';
import rightSmallHtml from 'text!fixtures/commercial/ad-slots/right-small.html';
import spbadgeHtml from 'text!fixtures/commercial/ad-slots/spbadge.html';



describe('Create Ad Slot', function () {

    var injector = new Injector(),
        createAdSlot, config;

    beforeEach(function (done) {
        injector.test(['common/modules/commercial/create-ad-slot', 'common/utils/config'], function (){
            createAdSlot = arguments[0];
            config = arguments[1];

            config.page = {
                edition: 'UK'
            };
            done();
        });
    });

    it('should exist', function () {
        expect(createAdSlot).toBeDefined();
    });

    [
        {
            name: 'right',
            type: 'mpu-banner-ad',
            html: rightHtml
        },
        {
            name: 'right-small',
            type: 'mpu-banner-ad',
            html: rightSmallHtml
        },
        {
            name: 'im',
            type: 'im',
            html: imHtml
        },
        {
            name: 'inline1',
            type: 'inline',
            html: inline1Html
        },
        {
            name: 'inline2',
            type: 'inline',
            html: inline2Html
        },
        {
            name: 'inline3',
            type: 'inline',
            html: inline3Html
        },
        {
            name: 'merchandising-high',
            type: 'commercial-component',
            html: merchandisingHighHtml
        },
        {
            name: 'adbadge',
            type: 'paid-for-badge',
            html: adbadgeHtml
        },
        {
            name: 'spbadge',
            type: 'paid-for-badge',
            html: spbadgeHtml
        },
        {
            name: 'fobadge',
            type: 'paid-for-badge',
            html: fobadgeHtml
        }
    ].forEach(function (expectation) {
        it('should create "' + expectation.name + '" ad slot', function () {
            var adSlot = createAdSlot(expectation.name, expectation.type);

            expect(adSlot.outerHTML).toBe(expectation.html.replace(/\n/g, '').replace(/\s+/g, ' '));
        });
    });

    it('should create "inline1" ad slot for inline-extra slots', function () {
            var adSlot = createAdSlot('inline-extra', 'inline');

            expect(bonzo(adSlot).hasClass('ad-slot--inline-extra')).toBeTruthy();
        });

    it('should accept multiple types', function () {
        var types  = ['paid-for-badge', 'paid-for-badge--container'],
            adSlot = createAdSlot('adbadge', ['paid-for-badge', 'paid-for-badge--container']);

        types.forEach(function (type) {
            expect(bonzo(adSlot).hasClass('ad-slot--' + type)).toBeTruthy();
        });
    });

});
