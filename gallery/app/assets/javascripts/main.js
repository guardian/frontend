
require([
    "reqwest", 
    "bean", 
    guardian.js.modules.swipe, 
    guardian.js.modules.topNav, 
    guardian.js.modules['$g']],
        function(reqwest, bean, swipe, topnav, $g) {

            // begin gallery-specific code

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
                prevLink: document.getElementById('js-gallery-prev'),
                currentIndex: urlParams.index || 0
            };

            // run on domloaded
            $g.onReady(function(){    
                  
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

                            var nextIndex = parseInt(index);
                            var nextIndexCount = nextIndex + 1;
                            var nextElm = document.querySelectorAll('.gallery-swipe li')[nextIndex];

                            count.innerText = nextIndexCount;
                            updateURL('index=' + nextIndexCount, nextIndexCount);
                            handlePrevNextLinks(nextIndexCount, totalSlides);
                            
                            if(nextElm) {
                                var nextElmForward = nextElm.nextElementSibling;
                                var nextElmBackward = nextElm.previousElementSibling;
                                
                                // convert to <img> tag
                                makePlaceholderIntoImage(nextElm); 
                                makePlaceholderIntoImage(nextElmForward);
                                makePlaceholderIntoImage(nextElmBackward);

                                elm.style.display = 'block';
                            }

                        }
                    });

                    // check if we need to jump to a specific gallery slide
                    if(urlParams.index) {
                        gallerySwipe.slide(parseInt(urlParams.index)-1, 0);
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

                    // todo: fix overlap
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

                    if (urlParams.index) {
                        advanceGallery(null, urlParams.index);
                    }

                }

                // this means the user used the back/forward buttons
                // so we should change gallery state to match
                window.onpopstate = function(event) {  
                    var urlParams = getUrlVars();
                    if(urlParams.index) {
                        advanceGallery(null, urlParams.index);
                    }
                }; 

            }); // end of domready check

            function advanceGallery(direction, customItemIndexToShow) {
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

                if(!customItemIndexToShow) {

                    // choose the element to show
                    var elmToWorkWith = (direction == 'next') ? nextSlide : prevSlide;

                    // update counter
                    var newSlide = (direction == 'next') ? (parseInt(currentIndex) + 1) : (parseInt(currentIndex) - 1);
                
                } else {
                    var elmToWorkWith = document.getElementById('js-gallery-item-' + customItemIndexToShow);
                    var newSlide = customItemIndexToShow;
                }

                // show and hide next/prev links
                handlePrevNextLinks(newSlide, totalSlides);

                // todo: test whether this error fails silently with curl.js
                //slideCounter.innerText(newSlide); 
                slideCounter.innerText = newSlide; // update count of current position

                updateURL('index=' + newSlide, newSlide);
                makePlaceholderIntoImage(elmToWorkWith); // convert it if we need to

                elmToWorkWith.className = 'js-current-gallery-slide';
                elmToWorkWith.style.display = 'block';

            }

            function updateURL(querystring, index) {
                var supportsPushState = 'pushState' in history;

                var state = window.location.search.replace( /^\?/, '' );
                
                if (supportsPushState) {
                    if ( querystring !== state ) {
                        history.pushState({}, (window.title || '') + ' (' + index + ')', '?' + querystring);
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
            // todo: allow this to take an array of elements
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
            

        } // end of require callback
);

require([guardian.js.modules.commonPlugins], function(common){});