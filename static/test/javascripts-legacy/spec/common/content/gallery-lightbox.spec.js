define([
    'bonzo',
    'qwery',
    'bean',
    'common/utils/$',
    'common/utils/mediator',
    'common/modules/gallery/lightbox',
    'fixtures/content/gallery-lightbox'
], function (
    bonzo,
    qwery,
    bean,
    $,
    mediator,
    galleryLightbox,
    lightboxFixtures
) {
    function testImageSrc(srcActual, srcTemplate) {
        if (expect(srcActual).not.toBe(null)) {
            var parts1 = srcTemplate.split('/'),
                parts2 = (srcActual).split('/');
            expect(parts1[parts1.length - 1]).toContain(parts2[parts2.length - 1]);
        }
    }

    describe('Gallery lightbox', function () {

        var lightbox,
            testJson = lightboxFixtures.barbie.gallery;

        beforeEach(function () {
            lightbox = new galleryLightbox.GalleryLightbox();
        });

        it('should create a DOM element in the body', function () {
            expect(document.querySelectorAll('.gallery-lightbox').length).toBe(1);
        });

        it('should start closed', function () {
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--closed')).toBe(true);
        });

        it('should display when opened', function () {
            lightbox.loadGalleryfromJson(testJson, 1);
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--open')).toBe(true);
        });

        it('should start on correct index', function () {
            lightbox.loadGalleryfromJson(testJson, 4);
            expect(lightbox.index).toBe(4);
        });

        it('should hide when closed', function () {
            lightbox.loadGalleryfromJson(testJson, 1);
            lightbox.trigger('close');
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--closed')).toBe(true);
        });

        it('should load surrounding images', function () {
            lightbox.loadGalleryfromJson(testJson, 1);
            lightbox.loadSurroundingImages(4, testJson.images.length);
            expect(lightbox.$images[2].src).toBeTruthy();
            expect(lightbox.$images[3].src).toBeTruthy();
            expect(lightbox.$images[4].src).toBeTruthy();
            expect(lightbox.$images[5].src).toBeFalsy();
            testImageSrc(lightbox.$images[2].src, testJson.images[2].src);
            testImageSrc(lightbox.$images[3].src, testJson.images[3].src);
            testImageSrc(lightbox.$images[4].src, testJson.images[4].src);
        });

        it('should load/preload images correctly', function () {
            lightbox.loadGalleryfromJson(testJson, 1);

            expect(lightbox.$images[testJson.images.length - 2].src).toBeFalsy();
            testImageSrc(lightbox.$images[testJson.images.length - 1].src, testJson.images[testJson.images.length - 1].src);
            testImageSrc(lightbox.$images[0].src, testJson.images[0].src);
            testImageSrc(lightbox.$images[1].src, testJson.images[1].src);
            expect(lightbox.$images[2].src).toBeFalsy();

            bean.fire(lightbox.nextBtn, 'click');
            testImageSrc(lightbox.$images[2].src, testJson.images[2].src);
            expect(lightbox.$images[3].src).toBeFalsy();
            bean.fire(lightbox.nextBtn, 'click');
            testImageSrc(lightbox.$images[3].src, testJson.images[3].src);
            expect(lightbox.$images[4].src).toBeFalsy();

            bean.fire(lightbox.prevBtn, 'click');
            bean.fire(lightbox.prevBtn, 'click');
            bean.fire(lightbox.prevBtn, 'click');
            testImageSrc(lightbox.$images[testJson.images.length - 2].src, testJson.images[testJson.images.length - 2].src);
            expect(lightbox.$images[testJson.images.length - 3].src).toBeFalsy();
        });

        it('should show the endslate after the last image', function () {
            lightbox.loadGalleryfromJson(testJson, testJson.images.length);
            lightbox.showEndslate = true;
            bean.fire(lightbox.nextBtn, 'click');
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--endslate')).toBe(true);
        });

        it('should loop to the endslate', function () {
            lightbox.loadGalleryfromJson(testJson, 1);
            lightbox.showEndslate = true;
            bean.fire(lightbox.prevBtn, 'click');
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--endslate')).toBe(true);
        });

        it('should loop from the endslate back to the beginning', function () {
            lightbox.loadGalleryfromJson(testJson, testJson.images.length);
            lightbox.showEndslate = true;
            bean.fire(lightbox.nextBtn, 'click');
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--endslate')).toBe(true);
            bean.fire(lightbox.nextBtn, 'click');
            expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--endslate')).toBe(false);
        });

        it('should toggle info when info button is clicked', function () {
            lightbox.loadGalleryfromJson(testJson, 1);
            var expectInfo = function (bool) {
                expect(lightbox.$lightboxEl.hasClass('gallery-lightbox--show-info')).toBe(bool);
            };
            expectInfo(false);
            bean.fire(lightbox.infoBtn, 'click');
            expectInfo(true);
            bean.fire(lightbox.infoBtn, 'click');
            expectInfo(false);
        });

        it('should generate the correct image HTML', function () {
            lightbox.loadGalleryfromJson(testJson, testJson.images.length);
            var img = testJson.images[2],
                imgEl = bonzo.create(lightbox.generateImgHTML(img, 2));

            expect($('.gallery-lightbox__index', imgEl).text()).toEqual('2');
            expect($('.gallery-lightbox__count', imgEl).text()).toEqual(testJson.images.length.toString());
            expect($('.gallery-lightbox__img-caption', imgEl).text()).toEqual(img.caption);
            expect($('.gallery-lightbox__img-credit', imgEl).text()).toEqual(img.credit);

        });

        it('should not show the credit where displayCredit is false', function () {
            lightbox.loadGalleryfromJson(testJson, testJson.images.length);
            var img = testJson.images[3],
                imgEl = bonzo.create(lightbox.generateImgHTML(img, 3));

            expect($('.gallery-lightbox__img-credit', imgEl).text()).toEqual('');

        });

    });
});
