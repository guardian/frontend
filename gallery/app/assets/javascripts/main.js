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
        
        var galleryConfig = {
            nextLink: document.getElementById('js-gallery-next'),
            prevLink: document.getElementById('js-gallery-prev')
        };
          
        var isTouch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

        if(isTouch) { // only enable this for touch devices, duh.
            // add swipe styling
            document.getElementById('js-gallery').className += ' gallery-swipe';

            // when we load, grab the prev/next and show them too
            var currentSlide = document.getElementsByClassName('js-current-gallery-slide')[0];
            var nextSlide = currentSlide.nextElementSibling;
            var prevSlide = currentSlide.previousElementSibling;
            var totalSlides = currentSlide.getAttribute('data-total');

            makePlaceholderIntoImage(nextSlide);
            makePlaceholderIntoImage(prevSlide);

            // set up the swipe actions
            var gallerySwipe = new swipe(document.getElementById('js-gallery'), {
                callback: function(event, index, elm) {
                    var count = document.getElementById('js-gallery-index');
                    var nextIndex = parseInt(index) + 1;
                    count.innerText = nextIndex;
                    var nextElm = document.querySelectorAll('.gallery-swipe li')[nextIndex];
                    makePlaceholderIntoImage(nextElm); // convert to <img> tag
                    handlePrevNextLinks(nextIndex, totalSlides)
                    updateURL('index=' + nextIndex);
                    elm.style.display = 'block';
                }
            });

            // check if we need to jump to a specific gallery slide
            if(urlParams.index) {
                gallerySwipe.slide(parseInt(urlParams.index)-1, 1000);
            }

            // bind prev/next to just trigger swipes
            // might be nice if they updated the page URL too ...
            bean.add(galleryConfig.nextLink, 'click', function(e) {
                gallerySwipe.next();
                e.preventDefault();
            });

            bean.add(galleryConfig.prevLink, 'click', function(e) {
                gallerySwipe.prev();
                e.preventDefault();
            });

        } else {

            bean.add(galleryConfig.nextLink, 'click', function(e) {
                advanceGallery('next');
                e.preventDefault();
            });

            bean.add(galleryConfig.prevLink, 'click', function(e) {
                advanceGallery('prev');
                e.preventDefault();
            });

            bean.add(document, 'keydown', function(e){
                if (e.keyCode == 37) { 
                    advanceGallery('prev');
                } else if (e.keyCode == 39) {
                    advanceGallery('next');
                }
            });

        }

        function advanceGallery(direction) {
            var currentSlide    = document.getElementsByClassName('js-current-gallery-slide')[0];
            var nextSlide       = currentSlide.nextElementSibling;
            var prevSlide       = currentSlide.previousElementSibling;
            var currentIndex    = currentSlide.getAttribute('data-index');
            var totalSlides     = currentSlide.getAttribute('data-total');
            var isFirst         = (currentIndex == 1);
            var isLast          = (currentIndex == totalSlides);
            var slideCounter    = document.getElementById('js-gallery-index');

            // hide the current slide
            currentSlide.className = '';
            currentSlide.style.display = 'none';

            // choose the element to show
            var elmToWorkWith = (direction == 'next') ? nextSlide : prevSlide;

            // update counter
            var newSlide = (direction == 'next') ? (parseInt(currentIndex) + 1) : (parseInt(currentIndex) - 1);

            // show and hide next/prev links
            handlePrevNextLinks(newSlide, totalSlides);

            // todo: test whether this error fails silently with curl.js
            //slideCounter.innerText(newSlide); 
            slideCounter.innerText = newSlide; // update count of current position

            updateURL('index=' + newSlide);
            makePlaceholderIntoImage(elmToWorkWith); // convert it if we need to

            elmToWorkWith.className = 'js-current-gallery-slide';
            elmToWorkWith.style.display = 'block';

        }

        function updateURL(querystring) {
            var supportsPushState = 'pushState' in history;

            var state = window.location.search.replace( /^\?/, '' );
            
            if (supportsPushState) {
                if ( querystring !== state ) {
                    history.pushState({}, window.title || '', '?' + querystring);
                }
            } else {
                // do we want to do this? think carefully...
                //location.hash = '#' + querystring;
            }
        }

        function handlePrevNextLinks(index, total) {
            var nextLink = galleryConfig.nextLink;
            var prevLink = galleryConfig.prevLink;

            if (index == 1) { // we've gone back to the start, hide prev
                prevLink.style.display = 'none';
                nextLink.setAttribute('href', '?index=2');
            } else if (index == 2) { // we can now go back, show prev
                prevLink.style.display = 'inline';
                prevLink.setAttribute('href', '?index=1');
                nextLink.setAttribute('href', '?index=3');
            } else if (index == total-1) { // show next again...?
                nextLink.style.display = 'inline';
                prevLink.setAttribute('href', '?index=' + (index - 1));
                nextLink.setAttribute('href', '?index=' + total);
            } else if (index == total) { //we're at the end, hide next
                nextLink.style.display = 'none';
                prevLink.setAttribute('href', '?index=' + (total -1));
            } else { // it's in the middle 
                prevLink.setAttribute('href', '?index=' + (index - 1));
                nextLink.setAttribute('href', '?index=' + (index + 1));
            }
        }

        // used to to convert placeholder <li> into <img> tag
        function makePlaceholderIntoImage(elm) {

            if (!elm || elm == null) { 
                return; 
            }

            var hasImage = elm.getAttribute('data-image');

            if (hasImage && hasImage == 'false') {
                
                var src = elm.getAttribute("data-src");
                if (src && src != "") { // create <img> element
                    elm.innerHTML = '<img src="' + src + '" />' + elm.innerHTML;
                    elm.setAttribute("data-image", "true");
                }
            }

            return elm;
        }

    }); // end of require callback

})();