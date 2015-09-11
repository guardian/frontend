import fastdom from 'fastdom';
import qwery from 'qwery';
import $ from 'common/utils/$';
import fixtures from 'helpers/fixtures';
import Injector from 'helpers/injector';

var config = {
    switches: {
        standardAdverts: true
    },
    page: {
        contentType: 'Article'
    },
    tests: {
        mobileTopBannerRemove: false
    }
};

var articleAsideAdverts,
    userAdPreference,
    injector = new Injector();

injector.mock({
    'common/utils/config': config
});

describe('Article Aside Adverts', function () {

    var fixturesConfig = {
            id: 'article-aside-adverts',
            fixtures: [
                '<div class="content__secondary-column js-secondary-column">' +
                '<div class="js-ad-slot-container"></div>' +
                '</div>'
            ]
        },
        $fixturesContainer;

    beforeEach(function (done) {
        config.switches = {
            standardAdverts: true
        };
        config.page = {
            contentType: 'Article'
        };

        $fixturesContainer = fixtures.render(fixturesConfig);

        injector.test([
            'common/modules/commercial/article-aside-adverts',
            'common/modules/commercial/user-ad-preference'
        ], function () {
            articleAsideAdverts = arguments[0];
            userAdPreference = arguments[1];

            // Reset dependencies
            userAdPreference.hideAds = false;

            done();
        });
    });

    afterEach(function () {
        fixtures.clean(fixturesConfig.id);
    });

    it('should exist', function () {
        expect(articleAsideAdverts).toBeDefined();
    });

    it('should return the ad slot container on init', function (done) {
        var adSlotPromise = articleAsideAdverts.init();

        adSlotPromise.then(function (adSlot) {
            expect(adSlot[0]).toBe(qwery('.js-ad-slot-container', $fixturesContainer)[0]);
            done();
        });
    });

    it('should append ad slot', function (done) {
        articleAsideAdverts.init();

        fastdom.defer(function () {
            expect(qwery('.js-ad-slot-container > .ad-slot', $fixturesContainer).length).toBe(1);
            done();
        });
    });

    it('should have the correct ad name', function (done) {
        articleAsideAdverts.init();

        fastdom.defer(function () {
            expect($('.ad-slot', $fixturesContainer).data('name')).toBe('right');
            done();
        });
    });

    it('should have the correct size mappings', function (done) {
        articleAsideAdverts.init();

        fastdom.defer(function () {
            expect($('.ad-slot', $fixturesContainer).data('mobile')).toBe('1,1|300,250|300,251|300,600');
            done();
        });
    });

    it('should not display ad slot if standard-adverts switch is off', function () {
        config.switches.standardAdverts = false;

        expect(articleAsideAdverts.init()).toBe(false);
        expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
    });

    it('should not display ad slot if not on an article', function () {
        config.page.contentType = 'Gallery';

        expect(articleAsideAdverts.init()).toBe(false);
        expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
    });

    it('should not display ad slot if user opts out of adverts', function () {
        userAdPreference.hideAds = true;

        expect(articleAsideAdverts.init()).toBe(false);
        expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
    });
});
