(function(){

    require([guardian.js.modules.detect, guardian.js.modules.images, guardian.js.modules.reqwest, guardian.js.modules.bean, guardian.js.modules.swipe], function(detect, images, reqwest, bean, swipe) {

        var gu_debug = {
            screenHeight: screen.height,
            screenWidth: screen.width,
            windowWidth: window.innerWidth || document.body.offsetWidth || 0,
            windowHeight: window.innerHeight || document.body.offsetHeight || 0,
            layout: detect.getLayoutMode(),
            bandwidth: detect.getConnectionSpeed(),
            battery: detect.getBatteryLevel(),
            pixelratio: detect.getPixelRatio(),
            retina: (detect.getPixelRatio() === 2) ? 'true' : 'false'
        };

        for (var key in gu_debug) {
            document.getElementById(key).innerText = gu_debug[key];
        }

        // Find and upgrade images.
        images.upgrade();

        // todo - work out where to load discussion and trailexpander
        // and also if the URLs are wrong...


        function getUrlVars() {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            var hash_length = hashes.length;
            for(var i = 0; i < hash_length; i++)
            {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        }

        var urlParams = getUrlVars();
        

        // swipe magic
        // todo: show prev link once we get past first item
        
        var isTouch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

        if(isTouch) { // only enable this for touch devices, duh.
            
            // set up the swipe actions
            var gallerySwipe = new swipe(document.getElementById('gallery'), {
                callback: function(event, index, elm) {
                    var count = document.getElementById('js-gallery-index');
                    var nextIndex = parseInt(index) + 1;
                    count.innerText = nextIndex;
                    var nextElm = document.querySelectorAll('.gallery li')[nextIndex];

                    // do this on the NEXT element so we're always 1 ahead
                    if (nextElm) {
                        var src = nextElm.getAttribute("data-src");
                        if (src && src != "") {
                            nextElm.innerHTML = '<img src="' + src + '" />' + nextElm.innerHTML;
                            nextElm.setAttribute("data-src", "");
                        }
                    }
                    elm.style.display = 'block';
                }
            });

            // check if we need to jump to a specific gallery slide
            if(urlParams.index) {
                gallerySwipe.slide(parseInt(urlParams.index)-1, 1000);
            }

            // bind prev/next to just trigger swipes
            // might be nice if they updated the page URL too ...
            bean.add(document.getElementById('js-gallery-next'), 'click', function(e) {
                gallerySwipe.next();
                e.preventDefault();
            });

            bean.add(document.getElementById('js-gallery-prev'), 'click', function(e) {
                gallerySwipe.prev();
                e.preventDefault();
            });

            /*
                var supports_pushState = 'pushState' in history;
                $('a.internal').live('click', function() {
                    var state = this.search.replace( /^\?/, '' );
                    
                    if ( supports_pushState ) {
                        if ( state !== last_state ) {
                            history.pushState( {}, this.title || '', '?' + state );
                            handle( state, 'click' );
                        }
                    } else {
                        location.hash = '#' + state;
                    }
                    
                    return false;
                });
            */


            // add css to gallery <ul> to style slides
        } else {
            // bind ajax events for prev/next
            // hide first/second image
        }

    }); // end of require callback

})();

require([guardian.js.modules.commonPlugins], function(common){});