define(['common', 'bean', 'modules/gallery', 'bonzo'], function(common, bean, Gallery, bonzo) {

    describe("Gallery", function() {

        var g = new Gallery().init();
        var nextLink = document.getElementById('js-gallery-next');
        var prevLink = document.getElementById('js-gallery-prev');
        var selectedItemClass = 'js-current-gallery-slide';
        var initialSlide = document.querySelector('.' + selectedItemClass);
        var counter = document.getElementById('js-gallery-index');

        // taken from http://stackoverflow.com/a/10520017/176615
        function triggerKeypress(k) {
            var oEvent = document.createEvent('KeyboardEvent');

            // Chromium Hack
            Object.defineProperty(oEvent, 'keyCode', {
                get : function() {
                    return this.keyCodeVal;
                }
            });
            Object.defineProperty(oEvent, 'which', {
                get : function() {
                    return this.keyCodeVal;
                }
            });

            if (oEvent.initKeyboardEvent) {
                oEvent.initKeyboardEvent("keydown", true, true, document.defaultView, false, false, false, false, k, k);
            } else {
                oEvent.initKeyEvent("keydown", true, true, document.defaultView, false, false, false, false, k, 0);
            }

            oEvent.keyCodeVal = k;

            if (oEvent.keyCode !== k) {
                alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
            }

            document.dispatchEvent(oEvent);
        }

        // prev/next links - check they work
        it("should advance the slideshow when the 'next' link is clicked", function() {
            nextLink.click();
            expect(initialSlide.className).not.toContain(selectedItemClass);
        });

        // check url param on change
        it("should update the page URL with an index querystring when advanced", function() {
            // we've already clicked once above
            nextLink.click();
            expect(window.location.search).toBe("?index=3");
        });

        // check the count works
        it("should correctly update the index count when advanced", function() {
            nextLink.click();
            var currentPosition = bonzo(counter).text();
            expect(currentPosition).toBe('4');
        });
        
        // check prev links are correct urls
        it("should update the 'next' URL to the correct offset when advanced", function(){
            nextLink.click();
            expect(nextLink.getAttribute('href')).toBe('?index=6');
        });

        // check next links are correct urls
        it("should update the 'previous' URL to the correct offset when advanced", function(){
            nextLink.click();
            expect(prevLink.getAttribute('href')).toBe('?index=5');
        });

        // check keyboard stuff works

        // (at this point, we're showing item #6)
        it("should advance the gallery when the right arrow key is pressed", function() {
            triggerKeypress(39);
            waits(250);
            var currentItem = document.querySelector('.' + selectedItemClass);
            expect(currentItem.getAttribute('data-index')).toBe('7');
        });

         // (at this point, we're showing item #7)
        it("should recede (?) the gallery when the left arrow key is pressed", function() {
            triggerKeypress(37);
            waits(250);
            var currentItem = document.querySelector('.' + selectedItemClass);
            expect(currentItem.getAttribute('data-index')).toBe('6');
        });

    });

});