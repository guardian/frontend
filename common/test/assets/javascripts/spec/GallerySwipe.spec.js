define(['common', 'bean', 'modules/gallery', 'bonzo'], function(common, bean, Gallery, bonzo) {

    describe("Gallery", function() {

        window.ontouchstart = {}; // this tricks the gallery into thinking we support touch events

        var g = new Gallery().init();
        var nextLink = document.getElementById('js-gallery-next');
        var prevLink = document.getElementById('js-gallery-prev');
        var selectedItemClass = 'js-current-gallery-slide';
        var initialSlide = document.querySelector('.' + selectedItemClass);
        var firstSlide = document.getElementById('js-gallery-item-1');
        var nextSlide = document.getElementById('js-gallery-item-2');
        var counter = document.getElementById('js-gallery-index');

        // check the next slide is preloaded
        it("should preload the next image in the gallery for swipe users", function(){
            var nextSlideImage = nextSlide.querySelectorAll('img');
            expect(nextSlideImage.length).toBe(1);
        });

        // a fake swipe. we only do this once, then check everything updated.
        nextLink.click();
        bean.fire(firstSlide, 'transitionend'); // this actually triggers swipe callback

        // the following tests are the same as the ones in Gallery.spec.js
        // we're just testing that being in swipe mode doesn't break "standard" functionality

        // check url param on change
        it("should update the page URL with an index querystring when advanced", function() {
            // we've already clicked once above
            expect(window.location.search).toBe("?index=2");
        });

        // check the count works
        it("should correctly update the index count when advanced", function() {
            var currentPosition = bonzo(counter).text();
            expect(currentPosition).toBe('2');
        });
        
        // check prev links are correct urls
        it("should update the 'next' URL to the correct offset when advanced", function(){
            expect(nextLink.getAttribute('href')).toBe('?index=3');
        });

        // check next links are correct urls
        it("should update the 'previous' URL to the correct offset when advanced", function(){
            expect(prevLink.getAttribute('href')).toBe('?index=1');
        });

        // test that swiping the gallery correctly advances it
        it("should advance the slideshow when the image is swiped to the left", function() {
            nextLink.click(); // this triggers the swipe callback -- easiest way to test
            bean.fire(firstSlide, 'transitionend'); // this fakes/forces the callback to fire
            expect(firstSlide.className).not.toContain(selectedItemClass);
        });

        // test that swiping the gallery backwards correctly reverses it
        it("should reverse the slideshow when the image is swiped to the right", function() {
            var currentSlide = document.querySelector('.' + selectedItemClass);
            prevLink.click(); // this triggers the swipe callback -- easiest way to test
            bean.fire(currentSlide, 'transitionend'); // this fakes/forces the callback to fire
            expect(currentSlide.className).not.toContain(selectedItemClass);
        });
        
    });

});