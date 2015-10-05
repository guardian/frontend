import fastdom from 'fastdom';
import qwery from 'qwery';
import $ from 'common/utils/$';
import fixtures from 'helpers/fixtures';
import Injector from 'helpers/injector';

var articleAsideAdverts,
    commercialFeatures,
    injector = new Injector();

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
        $fixturesContainer = fixtures.render(fixturesConfig);

        injector.test([
            'common/modules/commercial/article-aside-adverts',
            'common/modules/commercial/commercial-features'
        ], function () {
            articleAsideAdverts = arguments[0];
            commercialFeatures = arguments[1];

            // Reset dependencies
            commercialFeatures.articleMPUs = true;

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

    it('should not display ad slot if disabled in commercial-feature-switches', function () {
        commercialFeatures.articleMPUs = false;

        expect(articleAsideAdverts.init()).toBe(false);
        expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
    });
});
