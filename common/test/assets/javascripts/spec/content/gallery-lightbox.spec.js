define([
    'common/utils/$',
    'common/utils/mediator',
    'common/modules/gallery/lightbox',
    'bean',
    'fixtures/content/gallery-lightbox',
    'bonzo'
], function(
    $,
    mediator,
    galleryLightbox,
    bean,
    lightboxFixtures,
    bonzo
) {

    function testImageSrc(srcActual, srcTemplate) {
        var parts1 = srcTemplate.split('/'),
            parts2 = srcActual.split('/');
        expect(parts1[parts1.length - 1]).toContain(parts2[parts2.length - 1]);
    }

    describe("Gallery lightbox", function() {

        var lightbox,
            testJson = lightboxFixtures.barbie.gallery;

        beforeEach(function() {
            lightbox = new galleryLightbox.GalleryLightbox();
        });

        it("should create a DOM element in the body", function() {
            expect(document.querySelectorAll('.gallery-lightbox').length).toBe(1);
        });

        it("should start closed", function() {
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--closed')).toBe(true);
        });

        it("should display when opened", function() {
            lightbox.loadGalleryfromJson(testJson, 1);
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--open')).toBe(true);
        });

        it("should start on correct index", function() {
            lightbox.loadGalleryfromJson(testJson, 4); // 1-based index
            testImageSrc(bonzo(lightbox.imgEl).attr('src'), testJson.images[3].src);
        });

        it("should hide when closed", function() {
            lightbox.loadGalleryfromJson(testJson, 1);
            lightbox.trigger('close');
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--closed')).toBe(true);
        });

        it("should hide when close button is closed", function() {
            lightbox.loadGalleryfromJson(testJson, 1);
            bean.fire(lightbox.closeBtn, 'click');
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--closed')).toBe(true);
        });

        it("should load next image when next button is clicked", function() {
            lightbox.loadGalleryfromJson(testJson, 1);
            testImageSrc(lightbox.$contentEl.attr('data-src'), testJson.images[0].src);
            bean.fire(lightbox.nextBtn, 'click');
            testImageSrc(lightbox.$contentEl.attr('data-src'), testJson.images[1].src);
            bean.fire(lightbox.nextBtn, 'click');
            testImageSrc(lightbox.$contentEl.attr('data-src'), testJson.images[2].src);
        });

        it("should load previous image when prev button is clicked", function() {
            lightbox.loadGalleryfromJson(testJson, 4);
            testImageSrc(lightbox.$contentEl.attr('data-src'), testJson.images[3].src);
            bean.fire(lightbox.prevBtn, 'click');
            testImageSrc(lightbox.$contentEl.attr('data-src'), testJson.images[2].src);
            bean.fire(lightbox.prevBtn, 'click');
            testImageSrc(lightbox.$contentEl.attr('data-src'), testJson.images[1].src);
        });

        it("should show the endslate after the last image", function() {
            lightbox.loadGalleryfromJson(testJson, testJson.images.length);
            lightbox.showEndslate = true;
            bean.fire(lightbox.nextBtn, 'click');
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--endslate')).toBe(true);
        });

        it("should loop to the endslate", function() {
            lightbox.loadGalleryfromJson(testJson, 1);
            lightbox.showEndslate = true;
            bean.fire(lightbox.prevBtn, 'click');
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--endslate')).toBe(true);
        });

        it("should loop from the endslate back to the beginning", function() {
            lightbox.loadGalleryfromJson(testJson, testJson.images.length);
            lightbox.showEndslate = true;
            bean.fire(lightbox.nextBtn, 'click');
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--endslate')).toBe(true);
            bean.fire(lightbox.nextBtn, 'click');
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--endslate')).toBe(false);
        });

        it("should show adverts after every nth image", function() {
            lightbox.loadGalleryfromJson(testJson, 1);
            lightbox.showAdverts = true;
            lightbox.adStep = 4;
            var expectAdvert = function(bool) {
                expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--advert')).toBe(bool);
            };

            expectAdvert(false); // 1
            bean.fire(lightbox.nextBtn, 'click');
            expectAdvert(false); // 2
            bean.fire(lightbox.nextBtn, 'click');
            expectAdvert(false); // 3
            bean.fire(lightbox.nextBtn, 'click');
            expectAdvert(false); // 4
            bean.fire(lightbox.nextBtn, 'click');
            expectAdvert(true); // advert
            expect(lightbox.adIndex).toBe(1);
            bean.fire(lightbox.nextBtn, 'click');
            expectAdvert(false); // 5
            testImageSrc(lightbox.$contentEl.attr('data-src'), testJson.images[4].src);
        });

        it("should toggle info when info button is clicked", function() {
            lightbox.loadGalleryfromJson(testJson, 1);
            var expectInfo = function(bool) {
                expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--show-info')).toBe(bool);
            };
            expectInfo(false);
            bean.fire(lightbox.infoBtn, 'click');
            expectInfo(true);
            bean.fire(lightbox.infoBtn, 'click');
            expectInfo(false);
        });

    });
});
