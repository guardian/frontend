define(['common', 'bean', 'modules/gallery'], function(common, bean, Gallery) {

    describe("Gallery", function() {

        var g = new Gallery().init();
        var nextLink = document.getElementById('js-gallery-next');
        var prevLink = document.getElementById('js-gallery-prev');
        var selectedItemClass = 'js-current-gallery-slide';
        var initialSlide = document.querySelector('.' + selectedItemClass);

        function triggerKeypress(keycode) {
            var keyboardEvent = document.createEvent("KeyboardEvent");
            var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";

            keyboardEvent[initMethod](
               "keydown",   // event type : keydown, keyup, keypress
                true,       // bubbles
                true,       // cancelable
                window,     // viewArg: should be window
                false,      // ctrlKeyArg
                false,      // altKeyArg
                false,      // shiftKeyArg
                false,      // metaKeyArg
                keycode,    // keyCodeArg : unsigned long the virtual key code, else 0
                0           // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
            );

            document.dispatchEvent(keyboardEvent);
        }

        // prev/next links - check they work
        it("should advance the slideshow when the 'next' link is clicked", function() {
            nextLink.click();
            expect(initialSlide.className).not.toContain(selectedItemClass);
        });

        // fake swipe - check it works

        // fake keyboard input - check it works

        // check url param on change

        // check preload only happens +1 ahead/behind
        
        // check can't go past the start/end

        // check prev/next links are correct urls


    });

});