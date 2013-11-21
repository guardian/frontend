/* global document */
'use strict';

/**
 *
 * Gallery feature tests
 *
 **/

casper.test.setUp(function() {
    casper.start(host + "environment/gallery/2012/oct/18/veolia-environnement-wildlife-photographer-2012-in-pictures?view=mobile");
});

casper.test.begin("Display gallery contact sheet", function(test) {
    casper.then(function testGalleryThumbs() {
        casper.waitForSelector('.gallery-page .gallerythumbs', function() {
            test.assertVisible('.gallery-page .gallerythumbs', 'Thumbnails are visible');
            test.assertEvalEquals(function() {
                return document.querySelectorAll('.gallery-page .gallerythumbs__item').length;
            }, 3, '3 items should be available');
            test.done();
        }, function timeout() {
            casper.capture(screens + 'gallery-thumbs-fail.png');
            test.fail('Thumbnails not visible');
        });
    });
});

casper.test.begin("Display lhe lightbox when clicking an image", function(test) {
    casper.then(function testGalleryLightboxOpen() {
        casper.click('a.gallery-launch-cta');
        casper.waitForSelector('.gallery--lightbox', function() {
            test.assertVisible('.overlay', 'Lightbox did open');
            test.assertSelectorHasText('.js-image-index', '1', 'Image counter is at 1');
            test.done();
        }, function timeout() {
            casper.capture(screens + 'gallery-lightbox-fail.png');
            test.fail('Lightbox did not open');
        });
    });
});

casper.test.begin("Navigation", function(test) {
    casper.click('.js-gallery-next');
    test.assertVisible('.js-gallery-item-2');
    test.assertSelectorHasText('.js-image-index', '2', 'Image counter is at 2');
    casper.click('.js-gallery-next');
    test.assertVisible('.js-gallery-item-3');
    test.assertSelectorHasText('.js-image-index', '3', 'Image counter is at 3');
    casper.click('.js-gallery-prev');
    test.assertVisible('.js-gallery-item-2');
    test.assertSelectorHasText('.js-image-index', '2', 'Image counter is at 2');
    test.done();
});

casper.test.begin("Caption control", function(test) {
    test.assertVisible('.gallerycaption', 'Caption starts off visible');
    casper.click('.captioncontrol--hide');
    test.assertNotVisible('.gallerycaption', 'Caption has been hidden');
    test.done();    
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "gallery.xml");
});
